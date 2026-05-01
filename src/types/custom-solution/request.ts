import { BaseFilterParams } from '@/hooks/use-filter';

export interface GetConsultationFilterRequestParams extends BaseFilterParams {
    searchValue?: string;
    market?: string;
    type?: string;
    dateSort?: string;
    priceSort?: string;
    viewSort?: string;
    pageSize?: string;
}
