// Stub: notification APIs (not used in Account portal)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const notificationApis = new Proxy({} as Record<string, any>, {
    get: () => async () => ({}),
});
export type NotificationFilterParams = Record<string, unknown>;
