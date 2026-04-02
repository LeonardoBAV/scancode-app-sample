/**
 * Converte data no formato API/SQLite `YYYY-MM-DD` para exibição `DD/MM/YYYY`.
 */
export function formatIsoDateToBR(isoDate: string): string {
    const m: RegExpExecArray | null = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
    if (!m) {
        return isoDate;
    }
    return `${m[3]}/${m[2]}/${m[1]}`;
}

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

/**
 * Aplica máscara de CNPJ: 00.000.000/0000-00
 * Aceita string com ou sem formatação prévia. Retorna '—' se inválido/vazio.
 */
export function formatCNPJ(value: string | null | undefined): string {
    if (!value) return '—';
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 14) return value;
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Detecta CPF (11 dígitos) ou CNPJ (14 dígitos) e aplica a máscara correspondente.
 * Retorna '—' se nulo/vazio, ou o valor original se não tiver 11 nem 14 dígitos.
 */
export function formatCPFCNPJ(value: string | null | undefined): string {
    if (!value) return '—';
    const digits = value.replace(/\D/g, '');
    if (digits.length === 11) return formatCPF(value);
    if (digits.length === 14) return formatCNPJ(value);
    return value;
}
