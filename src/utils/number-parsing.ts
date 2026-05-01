type LocaleCode = string;

// Always use international format (en-US) for number display
// following financial industry standards (Bloomberg, TradingView, Reuters)
// Decimal: period (.) | Thousands: comma (,) | Example: 1,000.50
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- intentionally unused: always returns en-US per financial standard
function getLocaleCode(_locale: LocaleCode): string {
    return 'en-US';
}

export function formatToTwoDecimals(
    value: string | number,
    locale: LocaleCode = 'en'
): string {
    const num = parseFloat(value.toString());
    if (isNaN(num)) return '0.00';

    return num.toLocaleString(getLocaleCode(locale), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function priceFormat(
    value: string | number,
    locale: LocaleCode = 'en'
): string {
    const num = parseFloat(value.toString());
    if (isNaN(num)) return '0.00';

    return num.toLocaleString(getLocaleCode(locale), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function percentageFormat(
    value: string | number,
    shouldPercentageVisible: boolean = true,
    locale: LocaleCode = 'en'
): string {
    const num = parseFloat(value.toString());
    if (isNaN(num)) return '0.00';

    const formatted = num.toLocaleString(getLocaleCode(locale), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${formatted}${shouldPercentageVisible ? '%' : ''}`;
}

export function formatNumberOfViews(
    num: number,
    locale: LocaleCode = 'en'
): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return num.toLocaleString(getLocaleCode(locale));
    }
    return num.toString();
}

export function formatNumberLocale(
    num: number,
    locale: LocaleCode = 'en',
    options?: Intl.NumberFormatOptions
): string {
    return num.toLocaleString(getLocaleCode(locale), options);
}
