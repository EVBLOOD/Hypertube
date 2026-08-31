import { createHash } from "crypto";
import * as fs from "fs";
import { promisify } from "util";

const BLOCK_SIZE = 16384;

const pread = promisify(fs.read);
const pwrite = promisify(fs.write);
const popen = promisify(fs.open);
const pclose = promisify(fs.close);

export class PieceManager {
    private readonly pieceStatus: ("pending" | "downloading" | "verified")[];
    private readonly blockStatus = new Map<number, Buffer>();
    private readonly pieceDataBuffers = new Map<number, Buffer>();
    private currentPlaybackPiece = 0;
    private highestVerifiedPiece = -1;
    private readonly availability: number[];
    private readonly pieceReadyResolvers = new Map<number, Array<() => void>>();
    private readonly lastAccessTime = new Map<number, number>();
    private downloadedPiecesCount = 0;
    readonly totalPieces: number;
    readonly pieceLength: number;
    readonly lastPieceLength: number;
    readonly totalSize: number;
    private fd!: number;
    public filePath: string;

    constructor(
        private readonly metadata: any,
        private readonly storagePath: string,
    ) {
        this.totalPieces = metadata.pieces.length;
        this.pieceLength = metadata.pieceLength;
        this.totalSize = metadata.length;
        this.lastPieceLength =
            this.totalSize - (this.totalPieces - 1) * this.pieceLength;
        this.pieceStatus = new Array(this.totalPieces).fill("pending");
        this.availability = new Array(this.totalPieces).fill(0);
        this.filePath = storagePath;
    }

    public static async create(
        metadata: any,
        storagePath: string,
    ): Promise<PieceManager> {
        const instance = new PieceManager(metadata, storagePath);
        await instance.initialize();
        return instance;
    }

    private async initialize(): Promise<void> {
        const fileExists = fs.existsSync(this.storagePath);

        if (!fileExists) {
            this.fd = await popen(this.storagePath, "w+");
            await pwrite(this.fd, Buffer.alloc(1), 0, 1, this.totalSize - 1);
        } else {
            this.fd = await popen(this.storagePath, "r+");
            await this.scanExistingFile();
        }
    }

    private async scanExistingFile(): Promise<void> {
        let verified = 0;
        for (let i = 0; i < this.totalPieces; i++) {
            const pieceSize = this.getPieceSize(i);
            const fileOffset = i * this.pieceLength;
            const buf = Buffer.alloc(pieceSize);

            try {
                await pread(this.fd, buf, 0, pieceSize, fileOffset);

                const hash = createHash("sha1").update(buf).digest("hex");
                const expected: string = this.metadata.pieces[i];

                if (hash === expected) {
                    this.pieceStatus[i] = "verified";
                    this.downloadedPiecesCount++;
                    verified++;

                    this.notifyPieceReady(i);
                }
            } catch {
                continue;
            }
        }
    }

    updateAvailability(index: number, delta: number = 1): void {
        if (index >= 0 && index < this.totalPieces) {
            this.availability[index] += delta;
        }
    }

    updateAvailabilityFromBitfield(bitfield: Buffer): void {
        for (let i = 0; i < this.totalPieces; i++) {
            if (this.hasPiece(bitfield, i)) {
                this.availability[i]++;
            }
        }
    }

    getNextRequiredPieceIndex(
        peerBitfield: Buffer,
        priorityIndices: number[] = [],
    ): number | null {
        for (const index of priorityIndices) {
            if (
                this.pieceStatus[index] === "pending" &&
                this.hasPiece(peerBitfield, index)
            ) {
                return index;
            }
        }

        let rarestIndex: number | null = null;
        let minAvailability = Infinity;

        for (let i = 0; i < this.totalPieces; i++) {
            if (
                this.pieceStatus[i] === "pending" &&
                this.hasPiece(peerBitfield, i)
            ) {
                if (this.availability[i] < minAvailability) {
                    minAvailability = this.availability[i];
                    rarestIndex = i;
                }
            }
        }

        return rarestIndex;
    }

    updatePlaybackPosition(pieceIndex: number): void {
        this.currentPlaybackPiece = Math.max(
            this.currentPlaybackPiece,
            pieceIndex,
        );
    }

    getNextSequentialPieceIndex(
        peerBitfield: Buffer,
        bufferSizePieces: number = 15,
        excludedPieces: Set<number> = new Set<number>(),
    ): number | null {
        for (let i = this.currentPlaybackPiece; i < this.totalPieces; i++) {
            if (
                !excludedPieces.has(i) &&
                this.pieceStatus[i] === "pending" &&
                this.hasPiece(peerBitfield, i)
            ) {
                return i;
            }
        }
        for (let i = this.currentPlaybackPiece; i < this.totalPieces; i++) {
            if (
                !excludedPieces.has(i) &&
                this.pieceStatus[i] === "downloading" &&
                this.hasPiece(peerBitfield, i)
            ) {
                return i;
            }
        }
        for (let i = 0; i < this.currentPlaybackPiece; i++) {
            if (
                !excludedPieces.has(i) &&
                this.pieceStatus[i] === "pending" &&
                this.hasPiece(peerBitfield, i)
            ) {
                return i;
            }
        }

        return null;
    }

    private hasPiece(bitfield: Buffer, index: number): boolean {
        const byteIndex = Math.floor(index / 8);
        const bitIndex = 7 - (index % 8);
        return ((bitfield[byteIndex] ?? 0) & (1 << bitIndex)) !== 0;
    }

    getBitfield(): Buffer {
        const buffer = Buffer.alloc(Math.ceil(this.totalPieces / 8));
        for (let i = 0; i < this.totalPieces; i++) {
            if (this.pieceStatus[i] === "verified") {
                const byteIndex = Math.floor(i / 8);
                const bitIndex = 7 - (i % 8);
                buffer[byteIndex] |= 1 << bitIndex;
            }
        }
        return buffer;
    }

    get totalDownloaded(): number {
        return this.downloadedPiecesCount * this.pieceLength;
    }

    getBlocksForPiece(
        pieceIndex: number,
    ): { offset: number; length: number }[] {
        const pieceSize = this.getPieceSize(pieceIndex);
        const blocks: { offset: number; length: number }[] = [];
        for (let offset = 0; offset < pieceSize; offset += BLOCK_SIZE) {
            blocks.push({
                offset,
                length: Math.min(BLOCK_SIZE, pieceSize - offset),
            });
        }
        return blocks;
    }

    getPendingBlocksForPiece(
        pieceIndex: number,
    ): { offset: number; length: number }[] {
        const pieceSize = this.getPieceSize(pieceIndex);
        const totalBlocks = Math.ceil(pieceSize / BLOCK_SIZE);
        const blocks: { offset: number; length: number }[] = [];

        for (let blockIndex = 0; blockIndex < totalBlocks; blockIndex++) {
            if (!this.isBlockDownloaded(pieceIndex, blockIndex)) {
                const offset = blockIndex * BLOCK_SIZE;
                blocks.push({
                    offset,
                    length: Math.min(BLOCK_SIZE, pieceSize - offset),
                });
            }
        }

        return blocks;
    }

    markPieceDownloading(pieceIndex: number): void {
        if (this.pieceStatus[pieceIndex] !== "pending") return;
        this.pieceStatus[pieceIndex] = "downloading";
        this.lastAccessTime.set(pieceIndex, Date.now());

        const pieceSize = this.getPieceSize(pieceIndex);

        const blockCount = Math.ceil(pieceSize / BLOCK_SIZE);

        this.blockStatus.set(
            pieceIndex,
            Buffer.alloc(Math.ceil(blockCount / 8)),
        );
        this.pieceDataBuffers.set(pieceIndex, Buffer.alloc(pieceSize));
    }

    releasePiece(pieceIndex: number): void {
        if (this.pieceStatus[pieceIndex] === "verified") return;

        this.pieceStatus[pieceIndex] = "pending";
        this.blockStatus.delete(pieceIndex);
        this.pieceDataBuffers.delete(pieceIndex);
    }

    releaseStalledPieces(stallAfterMs: number = 15000): number[] {
        const now = Date.now();
        const released: number[] = [];

        for (let i = 0; i < this.totalPieces; i++) {
            if (this.pieceStatus[i] !== "downloading") continue;

            const lastProgress = this.lastAccessTime.get(i) ?? 0;
            if (now - lastProgress < stallAfterMs) continue;

            this.releasePiece(i);
            released.push(i);
        }

        return released;
    }

    async saveBlock(
        pieceIndex: number,
        offset: number,
        data: Uint8Array | Buffer,
    ): Promise<boolean> {
        // const blockMap = this.blockStatus.get(pieceIndex);
        const bitset = this.blockStatus.get(pieceIndex);
        const pieceBuffer = this.pieceDataBuffers.get(pieceIndex);
        if (!bitset || !pieceBuffer) return false;
        this.lastAccessTime.set(pieceIndex, Date.now());

        const blockBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
        blockBuffer.copy(pieceBuffer, offset);

        const blockIndex = Math.floor(offset / BLOCK_SIZE);

        bitset[Math.floor(blockIndex / 8)] |= 1 << (7 - (blockIndex % 8));

        const totalBlocks = Math.ceil(
            this.getPieceSize(pieceIndex) / BLOCK_SIZE,
        );
        let isPieceComplete = true;
        for (let i = 0; i < totalBlocks; i++) {
            if (!this.isBlockDownloaded(pieceIndex, i)) {
                isPieceComplete = false;
                break;
            }
        }
        if (isPieceComplete) {
            const fileOffset = pieceIndex * this.pieceLength;
            try {
                await pwrite(
                    this.fd,
                    pieceBuffer,
                    0,
                    pieceBuffer.length,
                    fileOffset,
                );

                const verified = await this.verifyPieceInMemory(
                    pieceIndex,
                    pieceBuffer,
                );

                this.pieceDataBuffers.delete(pieceIndex);

                if (verified) {
                    this.notifyPieceReady(pieceIndex);
                }
                return verified;
            } catch (e) {
                console.error(`Disk error piece ${pieceIndex}:`, e);
                return false;
            }
        }

        return false;
    }

    private async verifyPieceInMemory(
        pieceIndex: number,
        data: Buffer,
    ): Promise<boolean> {
        const hash = createHash("sha1").update(data).digest("hex");
        const expected = this.metadata.pieces[pieceIndex];

        if (hash === expected) {
            this.pieceStatus[pieceIndex] = "verified";
            this.blockStatus.delete(pieceIndex);
            this.downloadedPiecesCount++;
            return true;
        }

        this.pieceStatus[pieceIndex] = "pending";
        this.blockStatus.delete(pieceIndex);
        return false;
    }

    private isBlockDownloaded(pieceIndex: number, blockIndex: number): boolean {
        const bitset = this.blockStatus.get(pieceIndex);
        if (!bitset) return false;
        return (
            (bitset[Math.floor(blockIndex / 8)] &
                (1 << (7 - (blockIndex % 8)))) !==
            0
        );
    }

    public waitForPiece(index: number): Promise<void> {
        if (this.pieceStatus[index] === "verified") return Promise.resolve();
        return new Promise<void>((resolve) => {
            if (!this.pieceReadyResolvers.has(index)) {
                this.pieceReadyResolvers.set(index, []);
            }
            this.pieceReadyResolvers.get(index)!.push(resolve);
        });
    }

    private notifyPieceReady(index: number): void {
        const list = this.pieceReadyResolvers.get(index);
        if (list) {
            for (const resolve of list) resolve();
            this.pieceReadyResolvers.delete(index);
        }

        if (index > this.highestVerifiedPiece) {
            this.highestVerifiedPiece = index;
        }

        this.lastAccessTime.set(index, Date.now());
    }
    public async read(fileOffset: number, length: number): Promise<Buffer> {
        const buf = Buffer.alloc(length);
        await pread(this.fd, buf, 0, length, fileOffset);
        return buf;
    }

    // private async verifyPiece(pieceIndex: number): Promise<boolean> {
    //     const pieceSize = this.getPieceSize(pieceIndex);
    //     const fileOffset = pieceIndex * this.pieceLength;

    //     const buf = Buffer.alloc(pieceSize);
    //     await pread(this.fd, buf, 0, pieceSize, fileOffset);

    //     const hash: string = createHash('sha1').update(buf).digest('hex');
    //     const expected: string = this.metadata.pieces[pieceIndex];

    //     if (hash === expected) {
    //         this.pieceStatus[pieceIndex] = 'verified';
    //         this.blockStatus.delete(pieceIndex);
    //         this.downloadedPiecesCount++;
    //         return true;
    //     }

    //     this.pieceStatus[pieceIndex] = 'pending';
    //     this.blockStatus.delete(pieceIndex);
    //     return false;
    // }

    isPieceFailing(index: number): boolean {
        return (
            this.pieceStatus[index] === "pending" &&
            !this.blockStatus.has(index)
        );
    }

    isComplete(): boolean {
        return this.downloadedPiecesCount === this.totalPieces;
    }

    arePiecesReady(firstPiece: number, lastPiece: number): boolean {
        for (let i = firstPiece; i <= lastPiece; i++) {
            if (this.pieceStatus[i] !== "verified") return false;
        }
        return true;
    }

    findNextGap(fromPiece: number = 0): number {
        for (let i = fromPiece; i < this.totalPieces; i++) {
            if (this.pieceStatus[i] !== "verified") {
                return i;
            }
        }
        return -1;
    }

    getBufferingPercentage(bufferSizePieces: number = 15): number {
        const bufferTarget = Math.min(
            this.currentPlaybackPiece + bufferSizePieces,
            this.totalPieces - 1,
        );
        let ready = 0;

        for (let i = this.currentPlaybackPiece; i <= bufferTarget; i++) {
            if (this.pieceStatus[i] === "verified") {
                ready++;
            }
        }

        const totalInBuffer = bufferTarget - this.currentPlaybackPiece + 1;
        return totalInBuffer > 0 ? (ready / totalInBuffer) * 100 : 0;
    }

    getCurrentPlaybackPiece(): number {
        return this.currentPlaybackPiece;
    }

    getHighestVerifiedPiece(): number {
        return this.highestVerifiedPiece;
    }

    isPieceVerified(index: number): boolean {
        return this.pieceStatus[index] === "verified";
    }

    isPieceDownloading(index: number): boolean {
        return this.pieceStatus[index] === "downloading";
    }

    getPieceStatus(index: number): "pending" | "downloading" | "verified" {
        return this.pieceStatus[index];
    }

    private getPieceSize(index: number): number {
        return index === this.totalPieces - 1
            ? this.lastPieceLength
            : this.pieceLength;
    }

    async destroy(): Promise<void> {
        try {
            await pclose(this.fd);
        } catch {}
    }
}
