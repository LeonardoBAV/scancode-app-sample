export class Format {

    public static formatIsoDateToBR(isoDate: string): string {
        const m: RegExpExecArray | null = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
        if (!m) {
            return isoDate;
        }
        return `${m[3]}/${m[2]}/${m[1]}`;
    }

    public static formatCurrencyBR(value: number): string {
        const fixed = value.toFixed(2);
        const [intPart, decPart] = fixed.split('.');
        const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return 'R$ ' + withThousands + ',' + decPart;
    }

    public static formatCPF(value: string | null | undefined): string {
        if (!value) return '—';
        const digits = value.replace(/\D/g, '');
        if (digits.length !== 11) return value;
        return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    public static formatCNPJ(value: string | null | undefined): string {
        if (!value) return '—';
        const digits = value.replace(/\D/g, '');
        if (digits.length !== 14) return value;
        return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    public static formatCPFCNPJ(value: string | null | undefined): string {
        if (!value) return '—';
        const digits = value.replace(/\D/g, '');
        if (digits.length === 11) return Format.formatCPF(value);
        if (digits.length === 14) return Format.formatCNPJ(value);
        return value;
    }

    public static digitsOnly(value: string | null | undefined): string {
        if (!value) {
            return '';
        }
        return value.replace(/\D/g, '');
    }
}
