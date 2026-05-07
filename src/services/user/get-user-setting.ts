// Stub: user settings service (not used in Account)
// The full implementation lives in chaomarket-web and depends on
// admin DB tables that don't exist in the Account database.

interface UserSettings {
    isDisclaimerAccepted?: boolean;
    [key: string]: unknown;
}

export const getUserSetting = async (): Promise<UserSettings | null> => null;
export const getUserSettingsOrCreate = async (_id?: string): Promise<UserSettings | null> => null;
export const editUserSettings = async (_data: Record<string, unknown>): Promise<UserSettings | null> => null;
