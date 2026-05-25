import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { Order, OrderStatus } from '../../types/schema/order';
import type { OrderItem } from '../../types/schema/order-item';
import type { Client } from '../../types/schema/client';
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

    public buildOrder(order: Order, paymentMethodName: string, distributorName: string): TDocumentDefinitions {
        const orderNumber: string = order.id != null ? String(order.id) : '—';
        const createdAt: string = Format.formatIsoDateToBR(order.created_at.slice(0, 10));
        const updatedAt: string = Format.formatIsoDateToBR(order.updated_at.slice(0, 10));
        const statusLabel: string = ORDER_STATUS_LABELS[order.status] ?? order.status;
        const client: Client | null | undefined = order.client;
        const corporateName: string = client?.corporate_name?.trim() || '—';
        const cnpj: string = Format.formatCNPJ(client?.cpf_cnpj);
        const buyerName: string = order.buyer_name?.trim() || client?.buyer_name?.trim() || '—';
        const buyerEmail: string = client?.email?.trim() || '—';
        const carrier: string = client?.carrier?.trim() || '—';
        const observation: string = order.notes?.trim() || '—';

        const items: OrderItem[] = order.order_items ?? [];
        const subtotal: number = items.reduce((sum: number, item: OrderItem) => sum + item.price * item.qty, 0);

        const itemRows = items.map((item: OrderItem, index: number) => {
            const lineTotal: number = item.price * item.qty;
            const productName: string = item.product?.name?.trim() || `Produto #${item.product_id}`;
            const rowFill: string | undefined = index % 2 === 1 ? TABLE_ROW_ALT_FILL : undefined;
            return [
                { text: productName, style: index % 2 === 1 ? 'tableCellAlt' : 'tableCell' },
                { text: String(item.qty), style: 'tableCell', fillColor: rowFill },
                { text: 'un', style: 'tableCell', fillColor: rowFill },
                { text: Format.formatCurrencyBR(item.price), style: 'tableCell', fillColor: rowFill },
                { text: Format.formatCurrencyBR(lineTotal), style: 'tableCellBold', fillColor: rowFill },
            ];
        });

        const orderInfoRows: { label: string; value: string }[] = [
            { label: 'Data de Criação', value: createdAt },
            { label: 'Data de Alteração', value: updatedAt },
            { label: 'Status', value: statusLabel },
            { label: 'Nome do Cliente (Razão Social)', value: corporateName },
            { label: 'CNPJ', value: cnpj },
            { label: 'Nome Comprador', value: buyerName },
            { label: 'Email Comprador', value: buyerEmail },
            { label: 'Tipo de Pagamento', value: paymentMethodName },
            { label: 'Transportadora', value: carrier },
        ];

        return {
            pageSize: 'A4',
            pageMargins: [40, 48, 40, 48],
            defaultStyle: { font: 'Roboto', fontSize: 10, color: '#334155' },
            content: [
                { text: distributorName, style: 'distributorTitle' },
                { text: `Pedido #${orderNumber}`, style: 'orderTitle', margin: [0, 0, 0, 20] },
                { text: 'INFORMAÇÕES DO PEDIDO', style: 'sectionLabel', margin: [0, 0, 0, 8] },
                {
                    stack: orderInfoRows.map((row: { label: string; value: string }) => ({
                        text: [
                            { text: `${row.label}: `, style: 'infoLabel' },
                            { text: row.value, style: 'infoValue' },
                        ],
                        margin: [0, 0, 0, 6],
                    })),
                    margin: [0, 0, 0, 24],
                },
                { text: 'ITENS DO PEDIDO', style: 'sectionLabel', margin: [0, 0, 0, 8] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 40, 40, 72, 72],
                        body: [
                            [
                                { text: 'Produto', style: 'tableHeader' },
                                { text: 'Qtd', style: 'tableHeader' },
                                { text: 'Un', style: 'tableHeader' },
                                { text: 'Preço', style: 'tableHeader' },
                                { text: 'Total', style: 'tableHeader' },
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
                    margin: [0, 0, 0, 16],
                },
                {
                    stack: [
                        {
                            text: [
                                { text: 'Subtotal: ', style: 'totalLabel' },
                                { text: Format.formatCurrencyBR(subtotal), style: 'totalValue' },
                            ],
                            margin: [0, 0, 0, 4],
                        },
                        {
                            text: [
                                { text: 'Total: ', style: 'totalLabelBold' },
                                { text: Format.formatCurrencyBR(subtotal), style: 'totalValueBold' },
                            ],
                        },
                    ],
                    margin: [0, 0, 0, 20],
                },
                {
                    stack: [
                        { text: 'OBSERVAÇÕES', style: 'sectionLabel', margin: [0, 0, 0, 4] },
                        { text: observation, style: 'observation' },
                    ],
                },
            ],
            styles: {
                distributorTitle: { fontSize: 20, bold: true, color: '#0f172a' },
                orderTitle: { fontSize: 14, bold: true, color: '#334155' },
                sectionLabel: { fontSize: 8, bold: true, color: '#64748b' },
                infoLabel: { fontSize: 9, bold: true, color: '#475569' },
                infoValue: { fontSize: 9, color: '#0f172a' },
                tableHeader: { bold: true, fontSize: 9, color: TABLE_HEADER_TEXT, fillColor: TABLE_HEADER_FILL },
                tableCell: { fontSize: 9 },
                tableCellAlt: { fontSize: 9, fillColor: TABLE_ROW_ALT_FILL },
                tableCellBold: { fontSize: 9, bold: true },
                totalLabel: { fontSize: 9, color: '#64748b' },
                totalLabelBold: { fontSize: 10, bold: true, color: '#0f172a' },
                totalValue: { fontSize: 9, color: '#0f172a' },
                totalValueBold: { fontSize: 11, bold: true, color: '#0f172a' },
                observation: { fontSize: 9, color: '#475569', italics: true },
            },
        };
    }
}

export const pdfCoreTemplateService: PdfCoreTemplateService = PdfCoreTemplateService.getInstance();
