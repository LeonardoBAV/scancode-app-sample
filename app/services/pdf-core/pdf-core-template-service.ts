import type { TDocumentDefinitions } from 'pdfmake/interfaces';

const TABLE_HEADER_FILL = '#1e293b';
const TABLE_HEADER_TEXT = '#f8fafc';
const TABLE_ROW_ALT_FILL = '#f1f5f9';
const TABLE_BORDER = '#cbd5e1';

export class PdfCoreTemplateService {
    private static readonly _instance: PdfCoreTemplateService = new PdfCoreTemplateService();

    private constructor() { }

    public static getInstance(): PdfCoreTemplateService {
        return PdfCoreTemplateService._instance;
    }

    public buildHelloWorld(): TDocumentDefinitions {
        return {
            content: [{ text: 'Hello world' }],
        };
    }

    public buildSampleOrder(): TDocumentDefinitions {
        const orderNumber = '2026-0042';
        const orderDate = '24/05/2026';
        const clientName = 'Restaurante Sabor & Arte';
        const clientDocument = '12.345.678/0001-90';
        const buyerName = 'Maria Silva';
        const paymentMethod = 'PIX — à vista';
        const observation = 'Entregar no depósito. Horário preferencial: 08h–12h.';

        const lineItems = [
            { product: 'Cerveja Artesanal IPA 500ml', qty: 24, unit: 'cx', unitPrice: 'R$ 89,90', total: 'R$ 2.157,60' },
            { product: 'Refrigerante Cola 2L', qty: 12, unit: 'un', unitPrice: 'R$ 6,50', total: 'R$ 78,00' },
            { product: 'Água Mineral 500ml (pack 12)', qty: 8, unit: 'pack', unitPrice: 'R$ 14,90', total: 'R$ 119,20' },
            { product: 'Suco Natural Laranja 1L', qty: 6, unit: 'un', unitPrice: 'R$ 12,00', total: 'R$ 72,00' },
            { product: 'Energético Zero 250ml', qty: 36, unit: 'un', unitPrice: 'R$ 8,90', total: 'R$ 320,40' },
        ];

        const itemRows = lineItems.map((item, index) => [
            { text: item.product, style: index % 2 === 1 ? 'tableCellAlt' : 'tableCell' },
            { text: String(item.qty), style: 'tableCellCenter', fillColor: index % 2 === 1 ? TABLE_ROW_ALT_FILL : undefined },
            { text: item.unit, style: 'tableCellCenter', fillColor: index % 2 === 1 ? TABLE_ROW_ALT_FILL : undefined },
            { text: item.unitPrice, style: 'tableCellRight', fillColor: index % 2 === 1 ? TABLE_ROW_ALT_FILL : undefined },
            { text: item.total, style: 'tableCellRightBold', fillColor: index % 2 === 1 ? TABLE_ROW_ALT_FILL : undefined },
        ]);

        return {
            pageSize: 'A4',
            pageMargins: [40, 48, 40, 48],
            defaultStyle: { font: 'Roboto', fontSize: 10, color: '#334155' },
            content: [
                {
                    columns: [
                        {
                            width: '*',
                            stack: [
                                { text: 'myCoolApp', style: 'brand' },
                                { text: 'Distribuição de Bebidas', style: 'brandSubtitle' },
                            ],
                        },
                        {
                            width: 'auto',
                            stack: [
                                { text: 'PEDIDO', style: 'docType', alignment: 'right' },
                                { text: `#${orderNumber}`, style: 'orderNumber', alignment: 'right' },
                                { text: orderDate, style: 'orderDate', alignment: 'right' },
                            ],
                        },
                    ],
                    margin: [0, 0, 0, 24],
                },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: TABLE_BORDER }] },
                { text: '', margin: [0, 0, 0, 16] },
                {
                    columns: [
                        {
                            width: '*',
                            stack: [
                                { text: 'CLIENTE', style: 'sectionLabel' },
                                { text: clientName, style: 'sectionValue' },
                                { text: `CNPJ: ${clientDocument}`, style: 'sectionDetail' },
                                { text: `Comprador: ${buyerName}`, style: 'sectionDetail', margin: [0, 4, 0, 0] },
                            ],
                        },
                        {
                            width: '*',
                            stack: [
                                { text: 'PAGAMENTO', style: 'sectionLabel' },
                                { text: paymentMethod, style: 'sectionValue' },
                                { text: 'Status: Confirmado', style: 'sectionDetail' },
                            ],
                        },
                    ],
                    margin: [0, 0, 0, 20],
                },
                { text: 'ITENS DO PEDIDO', style: 'sectionLabel', margin: [0, 0, 0, 8] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 36, 36, 72, 72],
                        body: [
                            [
                                { text: 'Produto', style: 'tableHeader' },
                                { text: 'Qtd', style: 'tableHeaderCenter' },
                                { text: 'Un', style: 'tableHeaderCenter' },
                                { text: 'Preço', style: 'tableHeaderRight' },
                                { text: 'Total', style: 'tableHeaderRight' },
                            ],
                            ...itemRows,
                        ],
                    },
                    layout: {
                        hLineWidth: () => 0.5,
                        vLineWidth: () => 0.5,
                        hLineColor: () => TABLE_BORDER,
                        vLineColor: () => TABLE_BORDER,
                        paddingLeft: () => 8,
                        paddingRight: () => 8,
                        paddingTop: () => 6,
                        paddingBottom: () => 6,
                    },
                },
                {
                    columns: [
                        { width: '*', text: '' },
                        {
                            width: 200,
                            table: {
                                widths: ['*', 'auto'],
                                body: [
                                    [{ text: 'Subtotal', style: 'totalLabel' }, { text: 'R$ 2.747,20', style: 'totalValue' }],
                                    [{ text: 'Desconto (5%)', style: 'totalLabel' }, { text: '- R$ 137,36', style: 'totalValueMuted' }],
                                    [{ text: 'Total', style: 'totalLabelBold' }, { text: 'R$ 2.609,84', style: 'totalValueBold' }],
                                ],
                            },
                            layout: 'noBorders',
                            margin: [0, 16, 0, 0],
                        },
                    ],
                },
                {
                    stack: [
                        { text: 'OBSERVAÇÕES', style: 'sectionLabel', margin: [0, 20, 0, 4] },
                        { text: observation, style: 'observation' },
                    ],
                },
                {
                    text: 'Documento gerado como exemplo — dados fictícios para demonstração do pdfmake.',
                    style: 'footer',
                    margin: [0, 32, 0, 0],
                },
            ],
            styles: {
                brand: { fontSize: 20, bold: true, color: '#0f172a' },
                brandSubtitle: { fontSize: 9, color: '#64748b', margin: [0, 2, 0, 0] },
                docType: { fontSize: 9, color: '#64748b' },
                orderNumber: { fontSize: 16, bold: true, color: '#0f172a', margin: [0, 2, 0, 0] },
                orderDate: { fontSize: 10, color: '#64748b', margin: [0, 2, 0, 0] },
                sectionLabel: { fontSize: 8, bold: true, color: '#64748b', margin: [0, 0, 0, 4] },
                sectionValue: { fontSize: 11, bold: true, color: '#0f172a' },
                sectionDetail: { fontSize: 9, color: '#64748b' },
                tableHeader: { bold: true, fontSize: 9, color: TABLE_HEADER_TEXT, fillColor: TABLE_HEADER_FILL },
                tableHeaderCenter: { bold: true, fontSize: 9, color: TABLE_HEADER_TEXT, fillColor: TABLE_HEADER_FILL, alignment: 'center' },
                tableHeaderRight: { bold: true, fontSize: 9, color: TABLE_HEADER_TEXT, fillColor: TABLE_HEADER_FILL, alignment: 'right' },
                tableCell: { fontSize: 9 },
                tableCellAlt: { fontSize: 9, fillColor: TABLE_ROW_ALT_FILL },
                tableCellCenter: { fontSize: 9, alignment: 'center' },
                tableCellRight: { fontSize: 9, alignment: 'right' },
                tableCellRightBold: { fontSize: 9, alignment: 'right', bold: true },
                totalLabel: { fontSize: 9, color: '#64748b' },
                totalLabelBold: { fontSize: 10, bold: true, color: '#0f172a', margin: [0, 4, 0, 0] },
                totalValue: { fontSize: 9, alignment: 'right' },
                totalValueMuted: { fontSize: 9, alignment: 'right', color: '#16a34a' },
                totalValueBold: { fontSize: 11, bold: true, alignment: 'right', color: '#0f172a', margin: [0, 4, 0, 0] },
                observation: { fontSize: 9, color: '#475569', italics: true },
                footer: { fontSize: 8, color: '#94a3b8', alignment: 'center', italics: true },
            },
        };
    }
}

export const pdfCoreTemplateService: PdfCoreTemplateService = PdfCoreTemplateService.getInstance();
