import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Response } from "express";
import { Movie } from "src/movies/entities/movie.entity";
import { Repository } from "typeorm";
import * as net from "net";
import * as crypto from "crypto";
import { createReadStream, mkdirSync, existsSync, statSync } from "fs";
import { MoviesService } from "src/movies/movies.service";
import * as path from "path";
import { PieceManager } from "./helpers/piece-manager";
import { exec } from "child_process";

interface Peer {
    host: string;
    port: number;
}

interface VideoFile {
    name: string;
    offset: number;
    length: number;
    contentType: string;
    extension: string;
}
interface HashToImdbMap {
    infoHash: string;
    infoHashBuffer: Buffer;
    announce: string[];
    quality: string;
    parsedLength: number | undefined;
}

const PIPELINE_DEPTH = 200;
const SOCKET_TIMEOUT = 20000;
const METADATA_TIMEOUT = 240000;
const LISTEN_PORT = 6881;
const MAX_ACTIVE_PIECES = 500;

const MIME_TYPES: Record<string, string> = {
    ".mp4": "video/mp4",
    ".mkv": "video/x-matroska",
    ".avi": "video/x-msvideo",
    ".mov": "video/quicktime",
    ".wmv": "video/x-ms-wmv",
    ".webm": "video/webm",
    ".flv": "video/x-flv",
    ".m4v": "video/x-m4v",
};

const BROWSER_SUPPORTED_FORMATS = [".mp4", ".webm"];

@Injectable()
export class StreamsService implements OnModuleInit, OnModuleDestroy {
    private readonly downloadDir = path.join(process.cwd(), "downloads");

    private readonly peerId: Buffer = (() => {
        const prefix = Buffer.from("-HT0001-");
        const random = crypto.randomBytes(12);
        return Buffer.concat([prefix, random]);
    })();

    private readonly downloads = new Map<string, PieceManager>();
    private readonly connectedPeers = new Map<string, Set<string>>();
    private readonly activeWires = new Map<string, Set<any>>();
    private readonly pendingWires = new Map<string, Set<any>>();
    private readonly trackers = new Map<string, any>();
    private readonly infoHashToImdbId = new Map<string, HashToImdbMap[]>();

    private streamingWindows = new Map<
        string,
        { startPiece: number; bufferSize: number }
    >();
    private readonly sessionWindows = new Map<
        string,
        { infoHash: string; startPiece: number; bufferSize: number }
    >();

    private blacklistedPeers = new Set<string>();
    private blockOrigins = new Map<string, string[]>();

    private chokeInterval: any;
    private optimisticUnchokeInterval: any;

    private incomingServer!: net.Server;

    private readonly inFlight = new WeakMap<object, number>();
    private readonly peerBitfields = new WeakMap<object, Buffer>();

    private readonly blockQueues = new WeakMap<
        object,
        Array<{ index: number; offset: number; length: number }>
    >();
    private readonly activePieces = new WeakMap<object, Set<number>>();
    private readonly metadataWaiters = new Map<
        string,
        Array<(pm: PieceManager) => void>
    >();
    private readonly activeTorrents = new Set<string>();
    private readonly videoQuality = new Map<string, string>();
    private readonly videoFiles = new Map<string, VideoFile>();

    private dht: any;
    private dhtReady = false;
    private Protocol: any;
    private UtMetadata: any;
    private UtPex: any;
    private parseTorrent: any;
    private TrackerClient: any;

    constructor(
        @InjectRepository(Movie) private readonly movieRepo: Repository<Movie>,
        private readonly movieService: MoviesService,
    ) {
        mkdirSync(this.downloadDir, { recursive: true });
    }

    async onModuleInit() {
        const [
            { default: DHT },
            { default: Protocol },
            { default: UtMetadata },
            { default: UtPex },
            { default: parseTorrent },
            { default: TrackerClient },
        ] = await Promise.all([
            import("bittorrent-dht"),
            import("bittorrent-protocol"),
            import("ut_metadata"),
            import("ut_pex"),
            import("parse-torrent"),
            import("bittorrent-tracker"),
        ]);

        this.Protocol = Protocol;
        this.UtMetadata = UtMetadata;
        this.UtPex = UtPex;
        this.parseTorrent = parseTorrent;
        this.TrackerClient = TrackerClient;

        this.dht = new DHT({
            bootstrap: [
                "router.bittorrent.com:6881",
                "router.utorrent.com:6881",
                "dht.transmissionbt.com:6881",
                "dht.aelitis.com:6881",
            ],
            concurrency: 32,
        });

        this.dht.on("error", (err: Error) =>
            console.warn(`Error in DHT: ${err.message}`),
        );
        this.dht.once("ready", () => {
            this.dhtReady = true;
            console.log("DHT is Ready for peer discovery");
        });

        this.dht.listen(20000, "0.0.0.0", () =>
            console.log("DHT is listening on port 20000"),
        );

        this.incomingServer = net.createServer((socket) => {
            const wire = new this.Protocol();

            wire.use(this.UtMetadata());
            wire.use(this.UtPex());

            socket.pipe(wire).pipe(socket);

            wire.on("handshake", (infoHashBuffer: Buffer) => {
                const infoHash = infoHashBuffer.toString("hex");

                if (!this.activeTorrents.has(infoHash)) {
                    socket.destroy();
                    return;
                }

                const key = `${socket.remoteAddress}:${socket.remotePort}`;
                this.setupWireListeners(
                    wire,
                    socket,
                    infoHash,
                    infoHashBuffer,
                    key,
                );
                wire.handshake(infoHashBuffer, this.peerId, {
                    extended: true,
                    dht: true,
                });
            });
        });

        this.incomingServer.listen(LISTEN_PORT, "0.0.0.0", () => {
            console.log(
                `TCP Server is listening on port ${LISTEN_PORT} for incoming peers`,
            );
        });
    }

    onModuleDestroy() {
        this.dht?.destroy();
        if (this.incomingServer) this.incomingServer.close();

        for (const [, pm] of this.downloads) {
            pm.destroy().catch((err) =>
                console.error(
                    "Could not destroy PieceManager due to error:",
                    err,
                ),
            );
        }

        if (this.chokeInterval) clearInterval(this.chokeInterval);
        if (this.optimisticUnchokeInterval)
            clearInterval(this.optimisticUnchokeInterval);

        this.trackers.forEach((t: any) => t.destroy?.());
    }

    private resolveVideoFile(metadata: any): VideoFile | undefined {
        const files: any[] = metadata.files ?? [];

        if (files.length === 0) {
            const ext = path.extname(metadata.name).toLowerCase();
            const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
            return {
                name: metadata.name,
                offset: 0,
                length: metadata.length,
                contentType,
                extension: ext,
            };
        }

        const videoFiles = files.filter((f) => {
            const ext = path.extname(f.path).toLowerCase();
            return ext in MIME_TYPES;
        });

        if (!videoFiles.length) {
            const largest = files.reduce((a, b) =>
                a.length > b.length ? a : b,
            );
            const ext = path.extname(largest.path).toLowerCase();
            return {
                name: largest.name ?? path.basename(largest.path),
                offset: largest.offset,
                length: largest.length,
                contentType: "application/octet-stream",
                extension: ext,
            };
        }

        const main = videoFiles.reduce((a, b) => (a.length > b.length ? a : b));
        const ext = path.extname(main.path).toLowerCase();
        return {
            name: main.name ?? path.basename(main.path),
            offset: main.offset,
            length: main.length,
            contentType: MIME_TYPES[ext],
            extension: ext,
        };
    }

    // private getStoragePath(infoHash: string): string {
    //     return path.join(this.downloadDir, infoHash);
    // }

    private getStoragePath(imdbId: string): string {
        return path.join(this.downloadDir, imdbId);
    }

    private getSavedFilePath(
        imdbId: string,
        preferredQuality?: string,
    ): string | null {
        try {
            const files = require("fs").readdirSync(this.downloadDir);
            if (preferredQuality) {
                const exactPattern = new RegExp(
                    `^${imdbId}-${preferredQuality}\\.`,
                );
                const exact = files.find((f) => exactPattern.test(f));
                if (exact) return path.join(this.downloadDir, exact);
            }

            const pattern = new RegExp(`^${imdbId}(-|\\.)`);
            const found = files.find((f) => pattern.test(f));
            return found ? path.join(this.downloadDir, found) : null;
        } catch (err) {
            return null;
        }
    }

    private async saveDownloadedFile(
        imdbId: string,
        sourcePath: string,
        extension: string,
        quality: string,
    ): Promise<void> {
        try {
            const filename = `${imdbId}-${quality}${extension}`;
            const destPath = path.join(this.downloadDir, filename);

            if (BROWSER_SUPPORTED_FORMATS.includes(extension)) {
                require("fs").renameSync(sourcePath, destPath);

                await this.movieRepo
                    .update(
                        { imdbId },
                        {
                            filePath: destPath,
                            isFullyDownloaded: true,
                            lastWatchedAt: new Date(),
                        },
                    )
                    .catch((err) =>
                        console.error("Failed to update movie DB:", err),
                    );
            } else if (extension === ".mkv" || extension === ".mov") {
                const convertedPath = path.join(
                    this.downloadDir,
                    `${imdbId}-${quality}.mp4`,
                );
                this.convertMKVtoMP4(
                    sourcePath,
                    convertedPath,
                    imdbId,
                    quality,
                ).catch((err) =>
                    console.error(
                        `[Conversion Error] ${imdbId}-${quality}:`,
                        err,
                    ),
                );
            }
        } catch (err) {
            console.error(`[Storage Error] Failed to save ${imdbId}:`, err);
        }
    }

    private async convertMKVtoMP4(
        inputPath: string,
        outputPath: string,
        imdbId: string,
        quality: string,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const ffmpegCmd = `ffmpeg -i "${inputPath}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k "${outputPath}"`;

            exec(ffmpegCmd, { timeout: 3600000 }, (err, _) => {
                if (err) {
                    console.error(
                        `[Conversion Failed] ${imdbId}-${quality}: ${err.message}`,
                    );
                    reject(err);
                    return;
                }

                try {
                    require("fs").unlinkSync(inputPath);

                    this.movieRepo
                        .update(
                            { imdbId },
                            { filePath: outputPath, isFullyDownloaded: true },
                        )
                        .catch((err) =>
                            console.error("Failed to update movie DB:", err),
                        );

                    resolve();
                } catch (unlinkErr) {
                    console.error(
                        `[Cleanup Failed] Could not remove ${inputPath}:`,
                        unlinkErr,
                    );
                    reject(unlinkErr);
                }
            });
        });
    }

    async getMoviesWithSeedersQuality(
        imdbId: string,
        quality: string,
        res?: Response,
    ) {
        const torrents =
            await this.movieService.getTorrentMagnetsFromYTS(imdbId);
        if (!torrents?.length) {
            res?.status(404).json({
                message: "No torrent found for this title.",
            });
            return undefined;
        }

        const QUALITY_RANK: Record<string, number> = {
            "2160p": 3,
            "1080p": 2,
            "720p": 1,
        };
        const seeded = torrents
            .filter((t) => t.seeds > 0)
            .sort(
                (a, b) =>
                    (b.quality === quality ? 1 : 0) -
                        (a.quality === quality ? 1 : 0) ||
                    (QUALITY_RANK[b.quality] ?? 0) -
                        (QUALITY_RANK[a.quality] ?? 0) ||
                    b.seeds - a.seeds,
            );

        return seeded[0];
    }

    async stream(
        imdbId: string,
        quality = "1080p",
        range?: string,
        res?: Response,
    ) {
        const savedPath = this.getSavedFilePath(imdbId, quality);
        if (savedPath && existsSync(savedPath)) {
            if (res) return this.streamLocalFile(savedPath, range, res);
            return;
        }

        const existingHashs = this.infoHashToImdbId.get(imdbId);
        const hashWithQuality = existingHashs?.find(
            (h) => h.quality === quality,
        );

        let infoHash: string;
        let infoHashBuffer: Buffer;
        let announce: string[];
        let parsedLength: number | undefined;

        if (!hashWithQuality) {
            const chosen = await this.getMoviesWithSeedersQuality(
                imdbId,
                quality,
                res,
            );
            if (!chosen) return;

            const parsed = await this.parseTorrent(chosen.magnet);

            infoHash = parsed.infoHash;
            infoHashBuffer = parsed.infoHashBuffer;
            announce = parsed.announce;
            parsedLength = parsed.length;

            this.infoHashToImdbId.set(imdbId, [
                ...(existingHashs ?? []),
                { infoHash, infoHashBuffer, announce, quality, parsedLength },
            ]);
        } else {
            infoHash = hashWithQuality.infoHash;
            infoHashBuffer = hashWithQuality.infoHashBuffer;
            announce = hashWithQuality.announce;
            parsedLength = hashWithQuality.parsedLength;
        }

        if (!this.connectedPeers.has(infoHash))
            this.connectedPeers.set(infoHash, new Set());
        if (!this.pendingWires.has(infoHash))
            this.pendingWires.set(infoHash, new Set());
        if (!this.activeWires.has(infoHash))
            this.activeWires.set(infoHash, new Set());

        if (!this.activeTorrents.has(infoHash)) {
            this.activeTorrents.add(infoHash);
            this.videoQuality.set(infoHash, quality);

            try {
                this.startTracker(
                    infoHash,
                    infoHashBuffer,
                    announce,
                    parsedLength ?? 0,
                );
                this.startDHT(infoHash, infoHashBuffer);
            } catch (err) {
                console.log("err", err);
            }
        }

        const manager = await this.waitForManager(infoHash);
        if (!res) return;

        const videoFile = this.videoFiles.get(infoHash);
        if (!videoFile) {
            res.status(500).json({
                message: "Could not resolve video file from torrent metadata.",
            });
            return;
        }

        void this.streamPiecesToResponse(
            infoHash,
            manager,
            videoFile,
            range,
            res,
            imdbId,
            quality,
        ).catch((err) => console.error("Error streaming pieces:", err));
    }

    private async streamLocalFile(
        filePath: string,
        range: string | undefined,
        res: Response,
    ): Promise<void> {
        try {
            const { size } = statSync(filePath);
            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || "video/mp4";

            if (!range) {
                res.writeHead(200, {
                    "Content-Length": size,
                    "Content-Type": contentType,
                    "Accept-Ranges": "bytes",
                });
                createReadStream(filePath).pipe(res);
                return;
            }

            const match = range.match(/bytes=(\d+)-(\d*)/);
            if (!match) {
                res.status(400).send("Invalid range header");
                return;
            }

            const start = parseInt(match[1], 10);
            const end = match[2] ? parseInt(match[2], 10) : size - 1;

            if (start >= size) {
                res.status(416).set("Content-Range", `bytes */${size}`).end();
                return;
            }

            const chunkSize = end - start + 1;
            res.writeHead(206, {
                "Content-Range": `bytes ${start}-${end}/${size}`,
                "Content-Length": chunkSize,
                "Content-Type": contentType,
                "Accept-Ranges": "bytes",
            });

            createReadStream(filePath, { start, end }).pipe(res);
        } catch (err) {
            console.error("[Stream Local Error]:", err);
            res.status(500).json({ message: "Failed to stream file" });
        }
    }

    private recomputeStreamingWindow(infoHash: string): void {
        let minStartPiece = Infinity;
        let maxBufferSize = 0;
        for (const [, session] of this.sessionWindows) {
            if (session.infoHash !== infoHash) continue;
            minStartPiece = Math.min(minStartPiece, session.startPiece);
            maxBufferSize = Math.max(maxBufferSize, session.bufferSize);
        }
        if (minStartPiece === Infinity) {
            this.streamingWindows.delete(infoHash);
        } else {
            this.streamingWindows.set(infoHash, {
                startPiece: minStartPiece,
                bufferSize: maxBufferSize,
            });
        }
    }

    private async streamPiecesToResponse(
        infoHash: string,
        manager: PieceManager,
        videoFile: VideoFile,
        range: string | undefined,
        res: Response,
        imdbId: string,
        quality: string,
    ): Promise<void> {
        const sessionId = crypto.randomUUID();

        const fileSize = videoFile.length;
        let start = 0;
        let end = fileSize - 1;

        if (range) {
            const match = range.match(/bytes=(\d+)-(\d*)/);
            if (match) {
                start = parseInt(match[1], 10);
                end = match[2] ? parseInt(match[2], 10) : fileSize - 1;
            }
        }
        end = Math.min(end, fileSize - 1);

        const absoluteStart = videoFile.offset + start;
        const absoluteEnd = videoFile.offset + end;

        const firstPiece = Math.floor(absoluteStart / manager.pieceLength);

        const bufferSize = Math.min(
            20,
            Math.ceil((fileSize / manager.pieceLength) * 0.1),
        );
        // this.streamingWindows.set(infoHash, {
        //     startPiece: firstPiece,
        //     bufferSize
        // });

        this.sessionWindows.set(sessionId, {
            infoHash,
            startPiece: firstPiece,
            bufferSize,
        });
        this.recomputeStreamingWindow(infoHash);

        manager.updatePlaybackPosition(firstPiece);

        const chunkSize = end - start + 1;
        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": videoFile.contentType,
        });

        let nextByteToSend = absoluteStart;
        let bufferedPieceCount = 0;
        // let lastBufferLogAt = 0;

        res.once("close", () => {
            this.sessionWindows.delete(sessionId);
            this.recomputeStreamingWindow(infoHash);
        });

        while (nextByteToSend <= absoluteEnd && !res.destroyed) {
            const pieceIndex = Math.floor(nextByteToSend / manager.pieceLength);
            const session = this.sessionWindows.get(sessionId);
            if (session) {
                session.startPiece = pieceIndex;
                this.recomputeStreamingWindow(infoHash);
            }
            manager.updatePlaybackPosition(pieceIndex);

            if (!manager.isPieceVerified(pieceIndex)) {
                console.log(
                    `[BUFFER] Waiting for piece ${pieceIndex} (buffered: ${bufferedPieceCount}/${bufferSize})`,
                );
                const MAX_WAIT_TIME = 30000;

                await Promise.race([
                    manager.waitForPiece(pieceIndex),
                    new Promise<void>((_, reject) =>
                        setTimeout(
                            () =>
                                reject(
                                    new Error(
                                        `Timeout waiting for piece ${pieceIndex}`,
                                    ),
                                ),
                            MAX_WAIT_TIME,
                        ),
                    ),
                    new Promise<void>((resolve) => res.once("close", resolve)),
                ]).catch((err: Error) => {
                    console.error(`[BUFFER ERROR] ${err.message}`);
                    if (!res.destroyed) res.destroy();
                });

                if (res.destroyed) break;
            }

            bufferedPieceCount++;

            const pieceSize =
                pieceIndex === manager.totalPieces - 1
                    ? manager.lastPieceLength
                    : manager.pieceLength;

            const pieceStartByte = pieceIndex * manager.pieceLength;
            const pieceEndByte = pieceStartByte + pieceSize - 1;
            const chunkStart = Math.max(nextByteToSend, pieceStartByte);
            const chunkEnd = Math.min(absoluteEnd, pieceEndByte);
            const length = chunkEnd - chunkStart + 1;

            try {
                const data = await manager.read(chunkStart, length);
                const canWrite = res.write(data);
                if (!canWrite) {
                    await new Promise((resolve) => res.once("drain", resolve));
                }
            } catch (err) {
                console.error(
                    `[STREAM ERROR] Failed to read piece ${pieceIndex}:`,
                    err,
                );
                if (!res.headersSent) {
                    res.status(500).json({ message: "Stream read error" });
                }
                break;
            }

            nextByteToSend = chunkEnd + 1;
        }

        res.end();
        this.sessionWindows.delete(sessionId);
        this.recomputeStreamingWindow(infoHash);
        if (!res.destroyed) {
            res.end();
        }

        console.log(
            `[STREAM COMPLETE] ${imdbId} - ${bufferedPieceCount} pieces streamed`,
        );

        if (manager.isComplete()) {
            const storagePath = this.getStoragePath(imdbId);
            const selectedQuality = this.videoQuality.get(infoHash) ?? quality;
            console.log(
                `[Download Complete] ${imdbId}-${selectedQuality} - saving to disk...`,
            );

            this.saveDownloadedFile(
                imdbId,
                storagePath,
                videoFile.extension,
                selectedQuality,
            ).catch((err) =>
                console.error("Error saving downloaded file:", err),
            );
        }
    }

    private startTracker(
        infoHash: string,
        infoHashBuffer: Buffer,
        announce: string[],
        left: number,
    ) {
        const tracker = new this.TrackerClient({
            infoHash: infoHashBuffer,
            peerId: this.peerId,
            announce,
            port: LISTEN_PORT,
            left,
        });

        tracker.on("error", (err: Error) =>
            console.warn(`Error from Tracker: ${err.message}`),
        );
        tracker.on("warning", (err: Error) =>
            console.debug(`Warning from Tracker: ${err.message}`),
        );
        tracker.on("update", (d: any) =>
            console.log(
                `Update from Tracker: ${d.complete} seeds / ${d.incomplete} leechers`,
            ),
        );

        tracker.on("peer", (addr: string) => {
            const sep = addr.lastIndexOf(":");
            const host = addr.slice(0, sep);
            const port = parseInt(addr.slice(sep + 1), 10);
            if (!host || isNaN(port)) return;

            console.log(
                `Found by Tracker peer ${host}:${port} for infoHash ${infoHash}`,
            );

            this.connectToPeer({ host, port }, infoHash, infoHashBuffer);
        });

        tracker.start();
        if (this.trackers.has(infoHash)) {
            console.log(
                `[WARN] Replacing existing tracker for infoHash ${infoHash}`,
            );
            const oldTracker = this.trackers.get(infoHash);
            oldTracker?.destroy?.();
        }
        this.trackers.set(infoHash, tracker);
    }

    private updateTrackerStats(infoHash: string, manager: PieceManager) {
        const tracker = this.trackers.get(infoHash);
        if (tracker) {
            tracker.update({
                left: manager.totalSize - manager.totalDownloaded,
                downloaded: manager.totalDownloaded,
            });
        }
    }

    private startDHT(infoHash: string, infoHashBuffer: Buffer) {
        this.dht.on("peer", (peer: any, ihBuf: Buffer) => {
            if (!Buffer.isBuffer(ihBuf) || ihBuf.toString("hex") !== infoHash)
                return;
            if (!peer?.host || isNaN(peer.port)) return;
            console.log(
                `[DHT] Found peer ${peer.host}:${peer.port} for infoHash ${infoHash}`,
            );

            this.connectToPeer(
                { host: peer.host, port: peer.port },
                infoHash,
                infoHashBuffer,
            );
        });

        let timeout: any = null;
        const doLookup = () => {
            if (timeout) clearTimeout(timeout);
            if (!this.dhtReady) {
                timeout = setTimeout(doLookup, 3000);
                return;
            }
            this.dht.lookup(infoHashBuffer, (err: Error | null) => {
                timeout = setTimeout(doLookup, 30000);
            });
        };
        doLookup();
    }

    private connectToPeer(
        peer: Peer,
        infoHash: string,
        infoHashBuffer: Buffer,
    ) {
        const key = `${peer.host}:${peer.port}`;
        const peers = this.connectedPeers.get(infoHash)!;

        if (
            peers.has(key) ||
            peers.size >= MAX_ACTIVE_PIECES ||
            this.blacklistedPeers.has(key)
        )
            return;

        peers.add(key);

        const socket = new net.Socket();
        socket.setTimeout(SOCKET_TIMEOUT);

        socket.on("timeout", () => {
            socket.destroy();
        });
        socket.on("error", () => {
            socket.destroy();
        });

        socket.on("close", () => {
            peers.delete(key);
        });

        socket.connect(peer.port, peer.host, () => {
            socket.setTimeout(0);

            const wire = new this.Protocol();

            wire.use(this.UtMetadata());
            wire.use(this.UtPex());

            socket.pipe(wire).pipe(socket);

            wire.handshake(infoHashBuffer, this.peerId, {
                extended: true,
                dht: true,
            });

            this.setupWireListeners(
                wire,
                socket,
                infoHash,
                infoHashBuffer,
                key,
            );
        });
    }

    private setupWireListeners(
        wire: any,
        socket: net.Socket,
        infoHash: string,
        infoHashBuffer: Buffer,
        key: string,
    ) {
        const peers = this.connectedPeers.get(infoHash)!;

        this.activeWires.get(infoHash)?.add(wire);

        this.inFlight.set(wire, 0);
        this.blockQueues.set(wire, []);
        this.activePieces.set(wire, new Set<number>());

        const cleanupWire = () => {
            const manager = this.downloads.get(infoHash);
            const activePieces = this.activePieces.get(wire);

            if (manager && activePieces) {
                for (const pieceIndex of activePieces) {
                    if (!manager.isPieceVerified(pieceIndex)) {
                        manager.releasePiece(pieceIndex);
                    }
                }
                activePieces.clear();
            }

            const queue = this.blockQueues.get(wire);
            if (queue) queue.length = 0;

            this.activeWires.get(infoHash)?.delete(wire);
            peers.delete(key);
        };

        wire.on("error", (e: Error) => {
            cleanupWire();
        });
        wire.on("finish", () => {
            cleanupWire();
        });

        if (!wire.ut_metadata) {
            this.activeWires.get(infoHash)?.delete(wire);
            socket.destroy();
            return;
        }

        wire.ut_metadata.on("metadata", async (metadataBuffer: Buffer) => {
            const manager = this.downloads.get(infoHash);
            if (manager) {
                const pending = this.pendingWires.get(infoHash)!;
                const bf = manager.getBitfield();
                for (const w of pending) {
                    if (bf.some((byte) => byte !== 0)) {
                        w.bitfield(bf);
                    }
                    w.interested();
                    if (!w.peerChoking) this.fillPipeLine(w, infoHash);
                }
                pending.clear();
                return;
            }

            let fullMetadata: any;
            try {
                fullMetadata = await this.parseTorrent(metadataBuffer);
            } catch (err: any) {
                return;
            }

            if (!fullMetadata?.pieces?.length || !fullMetadata.pieceLength)
                return;

            const videoFile = this.resolveVideoFile(fullMetadata);
            if (!videoFile) return;
            this.videoFiles.set(infoHash, videoFile);

            const imdbId = Array.from(this.infoHashToImdbId.entries()).find(
                ([, hashList]) => hashList.some((h) => h.infoHash === infoHash),
            )?.[0];
            const storagePath = this.getStoragePath(imdbId || infoHash);

            const managerReady = await PieceManager.create(
                fullMetadata,
                storagePath,
            );
            this.downloads.set(infoHash, managerReady);

            this.updateTrackerStats(infoHash, managerReady);

            const waiters = this.metadataWaiters.get(infoHash) ?? [];
            waiters.forEach((r) => r(managerReady));
            this.metadataWaiters.delete(infoHash);

            const wires = this.activeWires.get(infoHash);
            if (wires) {
                for (const w of wires) {
                    const bf = this.peerBitfields.get(w);
                    if (bf) managerReady.updateAvailabilityFromBitfield(bf);
                }
            }

            const pending = this.pendingWires.get(infoHash)!;
            const ourBf = managerReady.getBitfield();
            for (const w of pending) {
                if (ourBf.some((byte) => byte !== 0)) w.bitfield(ourBf);
                w.interested();
                w.unchoke();
                if (!w.peerChoking) this.fillPipeLine(w, infoHash);
            }
            pending.clear();
        });

        if (wire.ut_pex) {
            wire.ut_pex.on("peer", (addr: string) => {
                console.log(
                    `PEX discovered peer ${addr} for infoHash ${infoHash}`,
                );
                const sep = addr.lastIndexOf(":");
                const h = addr.slice(0, sep);
                const p = parseInt(addr.slice(sep + 1), 10);
                if (!h || isNaN(p)) return;
                this.connectToPeer(
                    { host: h, port: p },
                    infoHash,
                    infoHashBuffer,
                );
            });
        }

        wire.on("handshake", (remoteInfoHash: Buffer) => {
            const remoteHex = Buffer.isBuffer(remoteInfoHash)
                ? remoteInfoHash.toString("hex")
                : String(remoteInfoHash);
            if (remoteHex !== infoHash) {
                socket.destroy();
                return;
            }

            const manager = this.downloads.get(infoHash);
            if (!manager) {
                wire.ut_metadata?.fetch();
                this.pendingWires.get(infoHash)?.add(wire);
            } else {
                const bf = manager.getBitfield();
                if (bf.some((byte) => byte !== 0)) wire.bitfield(bf);
                wire.interested();
                wire.unchoke();
            }
        });

        wire.on("bitfield", (bitfieldBuf: any) => {
            const actualBuffer =
                bitfieldBuf.buffer && !Buffer.isBuffer(bitfieldBuf)
                    ? Buffer.from(bitfieldBuf.buffer)
                    : Buffer.from(bitfieldBuf);

            this.peerBitfields.set(wire, actualBuffer);
            const manager = this.downloads.get(infoHash);
            if (manager) manager.updateAvailabilityFromBitfield(actualBuffer);
            wire.interested();
            wire.unchoke();
            if (manager && !wire.peerChoking) {
                this.fillPipeLine(wire, infoHash);
            }
        });

        wire.on("have", (index: number) => {
            let bf = this.peerBitfields.get(wire);
            const pm = this.downloads.get(infoHash);

            if (!bf) {
                const len = pm
                    ? Math.ceil(pm.totalPieces / 8)
                    : Math.ceil((index + 8) / 8);
                bf = Buffer.alloc(len);
                this.peerBitfields.set(wire, bf);
            }

            const byteIndex = Math.floor(index / 8);
            const bitIndex = 7 - (index % 8);
            if (byteIndex < bf.length) bf[byteIndex] |= 1 << bitIndex;

            if (pm) pm.updateAvailability(index, 1);

            wire.interested();
            this.fillPipeLine(wire, infoHash);
        });

        wire.on("unchoke", () => {
            const manager = this.downloads.get(infoHash);
            if (!manager) return;
            this.fillPipeLine(wire, infoHash);
        });

        wire.on(
            "piece",
            async (index: number, offset: number, block: Buffer) => {
                this.inFlight.set(
                    wire,
                    Math.max(0, (this.inFlight.get(wire) ?? 1) - 1),
                );

                const manager = this.downloads.get(infoHash);
                if (!manager) return;

                const originKey = `${infoHash}-${index}`;
                if (!this.blockOrigins.has(originKey))
                    this.blockOrigins.set(originKey, []);
                this.blockOrigins.get(originKey)!.push(key);

                const complete = await manager.saveBlock(index, offset, block);

                if (complete) {
                    this.blockOrigins.delete(originKey);

                    const activeSet = this.activePieces.get(wire);
                    if (activeSet) activeSet.delete(index);

                    const queue = this.blockQueues.get(wire);
                    if (queue) {
                        this.blockQueues.set(
                            wire,
                            queue.filter((b) => b.index !== index),
                        );
                    }

                    const wires = this.activeWires.get(infoHash);
                    if (wires) {
                        for (const w of wires) {
                            if (w === wire) continue;
                            const queue = this.blockQueues.get(w);
                            if (queue) {
                                const remaining = queue.filter(
                                    (b) => b.index !== index,
                                );
                                this.blockQueues.set(w, remaining);

                                try {
                                    w.cancel(
                                        index,
                                        0,
                                        manager["getPieceSize"](index),
                                    );
                                } catch {}
                            }
                        }
                    }

                    wires?.forEach((w) => {
                        try {
                            w.have(index);
                        } catch {}
                    });

                    this.updateTrackerStats(infoHash, manager);
                } else if (manager.isPieceFailing(index)) {
                    const pieceStatus = manager.getPieceStatus(index);
                    if (pieceStatus === "pending") {
                        const culprits = this.blockOrigins.get(originKey) || [];
                        culprits.forEach((c) => this.blacklistedPeers.add(c));
                        this.blockOrigins.delete(originKey);
                        console.warn(
                            `[Security] Banned ${culprits.length} peers for sending bad data on piece ${index}.`,
                        );
                        const activeSet = this.activePieces.get(wire);
                        if (activeSet) activeSet.delete(index);
                        if (culprits.includes(key)) socket.destroy();
                    }
                }

                socket.setTimeout(SOCKET_TIMEOUT);
                this.fillPipeLine(wire, infoHash);
            },
        );
    }

    private fillPipeLine(wire: any, infoHash: string) {
        const manager = this.downloads.get(infoHash);
        if (!manager) return;
        if (wire.peerChoking) return;

        const released = manager.releaseStalledPieces();
        if (released.length > 0) {
            const wires = this.activeWires.get(infoHash);
            if (wires) {
                for (const otherWire of wires) {
                    if (otherWire === wire) continue;
                    const otherQueue = this.blockQueues.get(otherWire);
                    if (!otherQueue) continue;
                    this.blockQueues.set(
                        otherWire,
                        otherQueue.filter(
                            (item) => !released.includes(item.index),
                        ),
                    );
                }
            }
        }

        const peerBitfield = this.peerBitfields.get(wire);
        if (!peerBitfield) return;

        const window = this.streamingWindows.get(infoHash);

        const bufferSizePieces = window?.bufferSize ?? 15;

        let queue = this.blockQueues.get(wire);
        if (!queue) {
            queue = [];
            this.blockQueues.set(wire, queue);
        }

        let activeSet = this.activePieces.get(wire);
        if (!activeSet) {
            activeSet = new Set<number>();
            this.activePieces.set(wire, activeSet);
        }

        while (activeSet.size < MAX_ACTIVE_PIECES) {
            const pieceIndex = manager.getNextSequentialPieceIndex(
                peerBitfield,
                bufferSizePieces,
                activeSet,
            );
            if (pieceIndex === null) break;

            const pieceStatus = manager.getPieceStatus(pieceIndex);
            if (pieceStatus === "verified") {
                continue;
            }

            activeSet.add(pieceIndex);

            if (pieceStatus === "pending") {
                manager.markPieceDownloading(pieceIndex);
            }

            const blocks =
                pieceStatus === "downloading"
                    ? manager.getPendingBlocksForPiece(pieceIndex)
                    : manager.getBlocksForPiece(pieceIndex);
            for (const block of blocks) {
                queue.push({
                    index: pieceIndex,
                    offset: block.offset,
                    length: block.length,
                });
            }
        }
        let fails = false;
        while (
            (this.inFlight.get(wire) ?? 0) < PIPELINE_DEPTH &&
            queue.length > 0
        ) {
            const block = queue.shift()!;
            wire.request(
                block.index,
                block.offset,
                block.length,
                (err: Error | null) => {
                    if (err)
                        console.debug(
                            `[Pipeline] request failed piece=${block.index}`,
                        );
                    fails = fails || !!err;

                    if (err) {
                        const manager = this.downloads.get(infoHash);
                        const activeSet = this.activePieces.get(wire);
                        const queue = this.blockQueues.get(wire);

                        manager?.releasePiece(block.index);
                        activeSet?.delete(block.index);

                        if (queue) {
                            this.blockQueues.set(
                                wire,
                                queue.filter(
                                    (item) => item.index !== block.index,
                                ),
                            );
                        }
                    }
                },
            );
            if (fails) {
                this.activeWires.get(infoHash)?.delete(wire);
                break;
            }
            this.inFlight.set(wire, (this.inFlight.get(wire) ?? 0) + 1);
        }
    }

    private waitForManager(infoHash: string): Promise<PieceManager> {
        const existing = this.downloads.get(infoHash);
        if (existing) return Promise.resolve(existing);

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                const list = this.metadataWaiters.get(infoHash) ?? [];
                const idx = list.indexOf(resolver);
                if (idx !== -1) list.splice(idx, 1);
                reject(
                    new Error(
                        `Metadata timeout for ${infoHash}. ` +
                            `Connected: ${this.connectedPeers.get(infoHash)?.size ?? 0} peers, ` +
                            `Active wires: ${this.activeWires.get(infoHash)?.size ?? 0}`,
                    ),
                );
            }, METADATA_TIMEOUT);

            const resolver = (pm: PieceManager) => {
                clearTimeout(timer);
                resolve(pm);
            };
            if (!this.metadataWaiters.has(infoHash))
                this.metadataWaiters.set(infoHash, []);
            this.metadataWaiters.get(infoHash)!.push(resolver);
        });
    }
}
