type UuidV7State = {
    msecs: number;
    seq: number;
};

export class Uuid {
    private static readonly BYTE_TO_HEX: string[] = Array.from({ length: 256 }, (_, i) =>
        (i + 0x100).toString(16).slice(1),
    );

    private static readonly v7State: UuidV7State = {
        msecs: -Infinity,
        seq: 0,
    };

    public static generateMovementUuid(): string {
        const now = Date.now();
        const rnds = Uuid.randomBytes();
        Uuid.updateV7State(now, rnds);
        return Uuid.stringify(Uuid.buildV7Bytes(rnds, Uuid.v7State.msecs, Uuid.v7State.seq));
    }

    private static randomBytes(): Uint8Array {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        return bytes;
    }

    private static stringify(bytes: Uint8Array): string {
        return (
            Uuid.BYTE_TO_HEX[bytes[0]] +
            Uuid.BYTE_TO_HEX[bytes[1]] +
            Uuid.BYTE_TO_HEX[bytes[2]] +
            Uuid.BYTE_TO_HEX[bytes[3]] +
            '-' +
            Uuid.BYTE_TO_HEX[bytes[4]] +
            Uuid.BYTE_TO_HEX[bytes[5]] +
            '-' +
            Uuid.BYTE_TO_HEX[bytes[6]] +
            Uuid.BYTE_TO_HEX[bytes[7]] +
            '-' +
            Uuid.BYTE_TO_HEX[bytes[8]] +
            Uuid.BYTE_TO_HEX[bytes[9]] +
            '-' +
            Uuid.BYTE_TO_HEX[bytes[10]] +
            Uuid.BYTE_TO_HEX[bytes[11]] +
            Uuid.BYTE_TO_HEX[bytes[12]] +
            Uuid.BYTE_TO_HEX[bytes[13]] +
            Uuid.BYTE_TO_HEX[bytes[14]] +
            Uuid.BYTE_TO_HEX[bytes[15]]
        ).toLowerCase();
    }

    private static updateV7State(now: number, rnds: Uint8Array): void {
        if (now > Uuid.v7State.msecs) {
            Uuid.v7State.seq = (rnds[6] << 23) | (rnds[7] << 16) | (rnds[8] << 8) | rnds[9];
            Uuid.v7State.msecs = now;
            return;
        }

        Uuid.v7State.seq = (Uuid.v7State.seq + 1) | 0;
        if (Uuid.v7State.seq === 0) {
            Uuid.v7State.msecs++;
        }
    }

    private static buildV7Bytes(rnds: Uint8Array, msecs: number, seq: number): Uint8Array {
        const bytes = new Uint8Array(16);

        bytes[0] = (msecs / 0x10000000000) & 0xff;
        bytes[1] = (msecs / 0x100000000) & 0xff;
        bytes[2] = (msecs / 0x1000000) & 0xff;
        bytes[3] = (msecs / 0x10000) & 0xff;
        bytes[4] = (msecs / 0x100) & 0xff;
        bytes[5] = msecs & 0xff;
        bytes[6] = 0x70 | ((seq >>> 28) & 0x0f);
        bytes[7] = (seq >>> 20) & 0xff;
        bytes[8] = 0x80 | ((seq >>> 14) & 0x3f);
        bytes[9] = (seq >>> 6) & 0xff;
        bytes[10] = ((seq << 2) & 0xff) | (rnds[10] & 0x03);
        bytes[11] = rnds[11];
        bytes[12] = rnds[12];
        bytes[13] = rnds[13];
        bytes[14] = rnds[14];
        bytes[15] = rnds[15];

        return bytes;
    }
}
