export interface SecurityTranslations {
    title: string;
    description: string;
    tabs: {
        devices: string;
        password: string;
    };
    changePassword: {
        title: string;
        description: string;
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
        cancel: string;
        submit: string;
        success: string;
        error: string;
        connectionError: string;
    };
    validation: {
        currentRequired: string;
        newMinLength: string;
        newUppercase: string;
        newLowercase: string;
        newNumber: string;
        newSpecial: string;
        confirmRequired: string;
        confirmMismatch: string;
    };
    otp: {
        title: string;
        description: string;
        cancel: string;
        confirm: string;
        sendError: string;
        lengthError: string;
        invalidCode: string;
    };
    accountSecurity: {
        title: string;
        devices: string;
        devicesDescription: string;
        twoFactor: string;
        twoFactorDescription: string;
    };
    auditLog: {
        title: string;
        empty: string;
        actions: Record<string, string>;
        showMore: string;
        showLess: string;
    };
}

export interface DevicesTranslations {
    title: string;
    description: string;
    back: string;
    current: string;
    unknown: string;
    empty: {
        title: string;
        description: string;
    };
    time: {
        justNow: string;
    };
    detail: {
        ip: string;
        location: string;
        firstLogin: string;
        lastActive: string;
    };
    revoke: string;
    revokeDialog: {
        title: string;
        description: string;
        cancel: string;
        confirm: string;
    };
}

export interface TwoFactorTranslations {
    title: string;
    back: string;
    status: {
        disabled: string;
        disabledDescription: string;
        enabled: string;
        enabledDescription: string;
    };
    setup: {
        enable: string;
        scanQr: string;
        manualEntry: string;
        continue: string;
        enterCode: string;
        back: string;
        confirm: string;
        qrError: string;
        codeLength: string;
        invalidCode: string;
        verifyError: string;
    };
    backup: {
        success: string;
        saveNote: string;
        copy: string;
        download: string;
        done: string;
    };
    disable: {
        button: string;
        title: string;
        description: string;
        cancel: string;
        confirm: string;
    };
}

export interface LoginVerificationTranslations {
    title: string;
    disabledDescription: string;
    enabledDescription: string;
    enabled: string;
    disabled: string;
    otp: {
        enableTitle: string;
        enableDescription: string;
        disableTitle: string;
        disableDescription: string;
        cancel: string;
        confirm: string;
    };
}

export interface PrivacyPageTranslations {
    title: string;
    description: string;
    signInMethods: {
        title: string;
        description: string;
        emailPassword: string;
        loginWith: string;
        linked: string;
        setup: string;
        notSetup: string;
        noMethods: string;
    };
    yourData: {
        title: string;
        description: string;
        fullName: string;
        email: string;
        phone: string;
        memberSince: string;
        emailVerified: string;
        verified: string;
        notVerified: string;
    };
    exportData: {
        button: string;
        downloading: string;
    };
    deleteAccount: {
        title: string;
        description: string;
        button: string;
        dialogTitle: string;
        dialogDescription: string;
        dialogCancel: string;
        dialogConfirm: string;
        dialogContact: string;
    };
    policyLink: {
        title: string;
        description: string;
        button: string;
    };
}
