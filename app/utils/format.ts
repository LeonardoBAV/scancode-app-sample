/**
 * @param value Valor em reais (número).
 * @param freeText Se informado e value === 0, retorna este texto em vez de "R$ 0,00" (ex.: "Grátis").
 */
export function formatCurrencyBR(value: number, freeText?: string): string {
    if (value === 0 && freeText !== undefined) {
        return freeText;
    }
    const fixed = value.toFixed(2);
    const [intPart, decPart] = fixed.split('.');
    const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return 'R$ ' + withThousands + ',' + decPart;
}

/**
 * Aplica máscara de CPF: 000.000.000-00
 * Aceita string com ou sem formatação prévia. Retorna '—' se inválido/vazio.
 */
export function formatCPF(value: string | null | undefined): string {
    if (!value) return '—';
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 11) return value;
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
