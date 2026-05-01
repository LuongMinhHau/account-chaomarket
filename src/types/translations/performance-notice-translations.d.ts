export interface GuestNoticeTranslations {
    title: string;
    desc1: string;
    desc2: string;
    linkSignUp: string;
    desc3: string;
    linkLogIn: string;
    desc4: string;
    okButton: string;
}

export interface MemberNoticeTranslations {
    title: string;
    reminderText: string;
    desc1: string;
    desc2: string;
    desc3: string;
    linkTerms: string;
    agreeButton: string;
    declineButton: string;
    alreadyAgreeButton: string;
}

export interface PerformanceNoticeTranslations {
    guest: GuestNoticeTranslations;
    member: MemberNoticeTranslations;
    mainSection: {
        independentVerification: string;
        verificationTooltip: string;
        roiLabel: string;
        roiTooltip: string;
        roiFormula: string;
        accountTypeTooltip: string;
        netDepositFilterTooltip: string;
        drawdownTooltip: string;
        accountTypeEcn: string;
        accountTypeClassic: string;
        accountTypeStp: string;
        accountTypeCent: string;
        accountTypeCash: string;
        accountTypeMargin: string;
        accountTypeIsa: string;
        accountTypeSpot: string;
        accountTypeFutures: string;
        accountTypeCryptoMargin: string;
        accountTypeDefault: string;
        accountTypeNameEcn: string;
        accountTypeNameStandard: string;
        accountTypeNameClassic: string;
        accountTypeNameStp: string;
        accountTypeNameCent: string;
        accountTypeNameCash: string;
        accountTypeNameMargin: string;
        accountTypeNameIsa: string;
        accountTypeNameSpot: string;
        accountTypeNameFutures: string;
    };
}