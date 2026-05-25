import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { Order, OrderStatus } from '../../types/schema/order';
import type { OrderItem } from '../../types/schema/order-item';
import { Format } from '../../utils/format';


const TABLE_HEADER_FILL = '#1e293b';
const TABLE_HEADER_TEXT = '#f8fafc';
const TABLE_ROW_ALT_FILL = '#f1f5f9';
const TABLE_BORDER = '#cbd5e1';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    pending: 'Aberto',
    completed: 'Finalizado',
    cancelled: 'Cancelado',
};

export class PdfCoreTemplateService {
    private static readonly _instance: PdfCoreTemplateService = new PdfCoreTemplateService();

    private constructor() { }

    public static getInstance(): PdfCoreTemplateService {
        return PdfCoreTemplateService._instance;
    }

    public buildOrder(order: Order, paymentMethodName: string): TDocumentDefinitions {
        const orderNumber: string = order.id != null ? String(order.id) : '—';
        const orderDate: string = Format.formatIsoDateToBR(order.created_at.slice(0, 10));
        const clientName: string = PdfCoreTemplateService.resolveClientName(order);
        const clientDocument: string = Format.formatCPFCNPJ(order.client?.cpf_cnpj);
        const buyerName: string = order.buyer_name?.trim() || '—';
        const observation: string = order.notes?.trim() || '—';
        const statusLabel: string = ORDER_STATUS_LABELS[order.status] ?? order.status;

        const items: OrderItem[] = order.order_items ?? [];
        const subtotal: number = items.reduce((sum: number, item: OrderItem) => sum + item.price * item.qty, 0);

        const itemRows = items.map((item: OrderItem, index: number) => {
            const lineTotal: number = item.price * item.qty;
            const productName: string = item.product?.name?.trim() || `Produto #${item.product_id}`;
            return [
                { text: productName, style: index % 2 === 1 ? 'tableCellAlt' : 'tableCell' },
                { text: String(item.qty), style: 'tableCellCenter', fillColor: index % 2 === 1 ? TABLE_ROW_ALT_FILL : undefined },
                { text: 'un', style: 'tableCellCenter', fillColor: index % 2 === 1 ? TABLE_ROW_ALT_FILL : undefined },
                { text: Format.formatCurrencyBR(item.price), style: 'tableCellRight', fillColor: index % 2 === 1 ? TABLE_ROW_ALT_FILL : undefined },
                { text: Format.formatCurrencyBR(lineTotal), style: 'tableCellRightBold', fillColor: index % 2 === 1 ? TABLE_ROW_ALT_FILL : undefined },
            ];
        });

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
                                { text: `CPF/CNPJ: ${clientDocument}`, style: 'sectionDetail' },
                                { text: `Comprador: ${buyerName}`, style: 'sectionDetail', margin: [0, 4, 0, 0] },
                            ],
                        },
                        {
                            width: '*',
                            stack: [
                                { text: 'PAGAMENTO', style: 'sectionLabel' },
                                { text: paymentMethodName, style: 'sectionValue' },
                                { text: `Status: ${statusLabel}`, style: 'sectionDetail' },
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
                                    [{ text: 'Subtotal', style: 'totalLabel' }, { text: Format.formatCurrencyBR(subtotal), style: 'totalValue' }],
                                    [{ text: 'Total', style: 'totalLabelBold' }, { text: Format.formatCurrencyBR(subtotal), style: 'totalValueBold' }],
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
                totalValueBold: { fontSize: 11, bold: true, alignment: 'right', color: '#0f172a', margin: [0, 4, 0, 0] },
                observation: { fontSize: 9, color: '#475569', italics: true },
            },
        };
    }

    private static resolveClientName(order: Order): string {
        const client = order.client;
        if (client == null) {
            return '—';
        }
        return client.fantasy_name?.trim() || client.corporate_name?.trim() || '—';
    }
}

export const pdfCoreTemplateService: PdfCoreTemplateService = PdfCoreTemplateService.getInstance();
