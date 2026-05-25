import { File, isAndroid, knownFolders } from '@nativescript/core';

export class StorageService {
    private static readonly _instance: StorageService = new StorageService();

    private constructor() { }

    public static getInstance(): StorageService {
        return StorageService._instance;
    }

    /**
     * Grava bytes no diretório de documentos do app.
     * @param bytes Conteúdo binário do ficheiro (ex.: buffer PDF).
     * @param fileName Nome do ficheiro (ex.: `sample-order.pdf`).
     * @returns Caminho absoluto do ficheiro gravado.
     */
    public save(bytes: Uint8Array, fileName: string): string {
        console.log('[StorageService] save start:', fileName, 'byteLength:', bytes?.byteLength);
        const file: File = knownFolders.documents().getFile(fileName);
        console.log('[StorageService] target path:', file.path);

        if (isAndroid) {
            const nativeBytes = Array.create('byte', bytes.byteLength) as number[];
            for (let i = 0; i < bytes.byteLength; i++) {
                nativeBytes[i] = bytes[i];
            }
            file.writeSync(nativeBytes);
        } else {
            file.writeSync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
        }

        console.log('[StorageService] writeSync done');
        return file.path;
    }
}

export const storageService: StorageService = StorageService.getInstance();
