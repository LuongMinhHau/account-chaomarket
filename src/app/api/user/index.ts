// Stub
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const userApis = new Proxy({} as Record<string, any>, { get: () => async () => ({}) });
