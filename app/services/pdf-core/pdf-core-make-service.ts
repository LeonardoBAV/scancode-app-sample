import pdfMake from 'pdfmake/build/pdfmake';
import pdfFontsModule from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

const pdfVfs: Record<string, string> = pdfFontsModule as unknown as Record<string, string>;
(pdfMake as { vfs: Record<string, string> }).vfs = pdfVfs;

export class PdfCoreMakeService {
    private static readonly _instance: PdfCoreMakeService = new PdfCoreMakeService();

    private constructor() { }

    public static getInstance(): PdfCoreMakeService {
        return PdfCoreMakeService._instance;
    }

    public generateBuffer(docDefinition: TDocumentDefinitions): Promise<Uint8Array> {
        const g = global as typeof global & { Buffer?: unknown; process?: unknown };
        console.log('[PdfCoreMakeService] generateBuffer start');
        console.log('[PdfCoreMakeService] global.Buffer:', typeof g.Buffer);
        console.log('[PdfCoreMakeService] global.process:', typeof g.process);

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                console.log('[PdfCoreMakeService] still waiting after 5s (getBuffer callback not fired)');
            }, 5000);

            let pdf;
            try {
                pdf = pdfMake.createPdf(docDefinition);
                console.log('[PdfCoreMakeService] createPdf ok');
            } catch (err: unknown) {
                clearTimeout(timeoutId);
                console.log('[PdfCoreMakeService] createPdf threw:', err);
                reject(err);
                return;
            }

            try {
                const stream = pdf.getStream();
                stream.on('data', (chunk: { length?: number }) => {
                    console.log('[PdfCoreMakeService] stream data bytes:', chunk?.length);
                });
                stream.on('end', () => console.log('[PdfCoreMakeService] stream end'));
                stream.on('error', (err: unknown) => {
                    console.log('[PdfCoreMakeService] stream error:', err);
                    clearTimeout(timeoutId);
                    reject(err);
                });
            } catch (err: unknown) {
                clearTimeout(timeoutId);
                console.log('[PdfCoreMakeService] getStream threw:', err);
                reject(err);
                return;
            }

            console.log('[PdfCoreMakeService] calling getBuffer...');
            try {
                pdf.getBuffer((buffer: Uint8Array) => {
                    clearTimeout(timeoutId);
                    console.log('[PdfCoreMakeService] getBuffer callback fired, byteLength:', buffer?.byteLength);
                    resolve(buffer);
                });
                console.log('[PdfCoreMakeService] getBuffer call returned (waiting callback)');
            } catch (err: unknown) {
                clearTimeout(timeoutId);
                console.log('[PdfCoreMakeService] getBuffer threw:', err);
                reject(err);
            }
        });
    }
}

export const pdfCoreMakeService: PdfCoreMakeService = PdfCoreMakeService.getInstance();
