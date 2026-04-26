export interface BaseResponse<T = undefined> {
    message: string;
    data?: T;
}
