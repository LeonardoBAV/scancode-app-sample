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
