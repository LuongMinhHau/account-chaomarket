export interface OrdersTranslations {
    title: string;
    description: string;
    searchPlaceholder: string;
    results: string;
    noResults: string;
    fetchError: string;
    status: {
        completed: string;
        pending: string;
        failed: string;
        cancelled: string;
    };
    filter: {
        all: string;
        starred: string;
    };
    col: {
        orderCode: string;
        payment: string;
        amount: string;
        currency: string;
        status: string;
        time: string;
    };
    dateRange: {
        title: string;
        from: string;
        to: string;
        clear: string;
        today: string;
        last7: string;
        last30: string;
    };
    empty: {
        title: string;
        description: string;
    };
}
