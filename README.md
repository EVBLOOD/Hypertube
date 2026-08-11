# Hypertube


to push project:
DATE_TIME="2026-02-17 00:01:01" MSG="updated makefile" make push

## WatchTogether (Bonus Feature)

This project includes a lightweight WatchTogether feature that supports ephemeral P2P watch sessions with in-watch chat using WebRTC DataChannels.

Environment variables (frontend)
- `NEXT_PUBLIC_STUN_URLS` — comma-separated STUN server URLs (default: `stun:stun.l.google.com:19302`).
- `NEXT_PUBLIC_TURN_URLS` — comma-separated TURN server URLs (optional, required for NAT traversal in some networks).
- `NEXT_PUBLIC_TURN_USER` — TURN username (if using TURN).
- `NEXT_PUBLIC_TURN_PASS` — TURN password (if using TURN).

Backend notes
- Signaling gateway is available at Socket.IO namespace `/watch` and provides `create-room`, `join-room`, `signal`, `leave-room`, `relay-control`, `relay-chat` events. Messages relayed via the gateway are ephemeral and not persisted.
- Rate limiting and message-size checks are applied server-side to prevent abuse. Relay payloads larger than ~2KB are rejected.

Invite link format
- `https://<frontend-host>/movie/<movieId>?watch=<roomId>` — create room with `WatchButton` and share the invite link.

Security and deployment
- Use TLS/WSS in production — browsers require secure origins for WebRTC.
- If connecting across restrictive NATs, configure a TURN server and set `NEXT_PUBLIC_TURN_URLS`, `NEXT_PUBLIC_TURN_USER`, `NEXT_PUBLIC_TURN_PASS`.
- The backend keeps rooms in-memory (TTL 30 minutes) and does not persist chat messages.
