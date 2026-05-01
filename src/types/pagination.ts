export interface Pagination {
    pageIndex: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
}
export interface PaginatedResponse<T> extends Pagination {
    data: T[];
}

export interface PaginationRequest {
    pageIndex?: number;
    pageSize?: number;
}
