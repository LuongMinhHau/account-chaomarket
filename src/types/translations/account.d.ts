export interface AccountTranslations {
    profile: string;
    notification: string;
    orderHistory: string;
    subscriptions: string;
    security: string;
    legalCompliance: string;
    services: string;
    privacy: string;
    title: string;
    dashboard: {
        greeting: string;
        overview: string;
        manageDescription: string;
        securityOverview: string;
        viewDetails: string;
        quickAccess: string;
        password: string;
        emailVerification: string;
        twoFactor: string;
        activeDevices: string;
        statusSet: string;
        statusNotSet: string;
        statusVerified: string;
        statusNotVerified: string;
        statusOff: string;
        deviceCount: string;
        noData: string;
        profileDesc: string;
        notificationDesc: string;
        securityDesc: string;
        servicesDesc: string;
        subscriptionsDesc: string;
        ordersDesc: string;
    };
    notificationSection: {
        title: string;
        recentNotification: string;
    };
    legalComplianceSection: {
        disclaimerTitle: string;
        disclaimerDesc: string;
        performanceNoticeTitle: string;
        performanceNoticeDesc: string;
        acceptedOn: string;
        notAccepted: string;
        viewDetails: string;
        readAndAccept: string;
        viewPerformance: string;
    };
    servicesPage: {
        title: string;
        description: string;
        yourServices: string;
        allServicesLinked: string;
        activeCount: string;
        totalCount: string;
        platforms: string;
        platformsDesc: string;
        products: string;
        productsDesc: string;
        statusActive: string;
        statusComingSoon: string;
        visitService: string;
        services: {
            [key: string]: {
                name: string;
                description: string;
            };
        };
    };
}
