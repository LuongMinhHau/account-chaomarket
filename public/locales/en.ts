import { TranslationsStructure } from '@/types/translations';

export const en: TranslationsStructure = {
    common: {
        save: 'Save',
        cancel: 'Cancel',
        close: 'Close',
        edit: 'Edit',
        saveChanges: 'Save Changes',
        loading: 'Loading...',
        continue: 'Continue',
        email: 'Email',
        password: 'Password',
        orContinueWith: 'Or continue with',
        firstName: 'First Name',
        lastName: 'Last Name',
        fullName: 'Full Name',
        emailAddress: 'Email Address',
        emailLanguage: 'Display Language for Emails',
        confirmPassword: 'Confirm password',
        dateOfBirth: 'Birthday (optional)',
        dateOfBirthRequired: 'Birthday',
        gender: {
            male: 'Male',
            female: 'Female',
            other: 'Other',
            selfDescribe: 'Prefer to self-describe',
            label: 'Gender',
        },
        back: 'Back',
        newPassword: 'New Password',
        confirmNewPassword: 'Confirm New Password',
        currentPassword: 'Current Password',
        sending: 'Sending...',
        phoneNumber: 'Phone Number (optional)',
        phoneNumberRequired: 'Phone Number',
        backToSignUp: '← Back to Sign Up',
        lastUpdated: 'Last updated: {date}',
        backToHome: '← Back to Home',
        scrollToTop: 'Back To Top',
        autoCloseMessage:
            'This will automatically close in <span>{countdown} second{plural}<span/>.',
        search: 'Search',
        cart: 'Cart',
        contacts: 'Contact',
        dark: 'Dark',
        light: 'Light',
        socialNetwork: 'Your Social Network Link (optional)',
        logOut: 'Log Out',
        joined: 'Joined',
        changePassword: 'Change Password',
        selectStartDate: 'Select start date',
        selectEndDate: 'Select end date',
        allNotification: 'All Notifications',
        unread: 'Unread',
        emails: 'Emails',
        pushNotification: 'Push notifications',
        date: 'Date',
        weekday: 'Weekday',
        category: 'Category',
        headline: 'Headline',
        like: 'Like',
        views: 'Views',
        page: 'Page',
        rowPerPage: 'Rows per page',
        results: 'results',
        new: 'New',
        pin: 'Pin',
        noFeedFound: 'No feeds have been posted.',
        readOnFacebook: 'Read on Facebook',
        watchOnTikTok: 'Watch on TikTok',
        watchOnYouTube: 'Watch on YouTube',
        perPage: '/ page',
        showAll: 'Full',
        filter: 'Filter by',
        filterBySearch: {
            filterBy: 'Filter By',
            search: 'Search',
        },
        time: 'Time',
        timePresets: {
            today: 'Today',
            thisWeek: 'This Week',
            thisMonth: 'This Month',
            custom: 'Custom',
        },
        customDateRange: {
            rangeTitle: 'Custom Date Range',
            startDatePlaceholder: 'Select start date',
            endDatePlaceholder: 'Select end date',
            calendarAriaLabel: 'Date selection calendar',
        },
        sources: 'Sources',
        actions: {
            clear: 'Clear',
            clearAll: 'Clear All',
            apply: 'Apply',
        },
        sortBy: {
            label: 'Sort by',
            featured: 'Featured',
            featuredTooltip:
                'Priority: Most Views > Highest ROI > Highest Net Profit > Lowest Max Drawdown',
            featuredTooltipSolutions:
                'Priority: Newest > Most Views > Highest Price',
            featuredTooltipInsights:
                'Priority: Newest > Top Rated > Most Views',
            highToLow: 'High to low',
            lowToHigh: 'Low to high',
        },
        dateSort: {
            label: 'Date',
            newestFirst: 'Newest first',
            oldestFirst: 'Oldest first',
        },
        price: 'Price',
        viewSort: {
            mostViewedFirst: 'Most viewed first',
            leastViewedFirst: 'Least viewed first',
        },
        default: 'Default',
        market: 'Market',
        type: 'Type',
        description: 'Description',
        addToCart: 'Add to Cart',
        buyNow: 'Buy Now',
        marketType: {
            all: 'All',
            stocks: 'Stocks',
            currencies: 'Currencies',
            cryptocurrencies: 'Cryptocurrencies',
            commodities: 'Commodities',
        },
        all: 'All',
        recommended: 'Recommended',
        mostViewed: 'Most Viewed',
        topRated: 'Top Rated',
        source: 'Source',
        share: 'Share',
        posts: 'Posts',
        post: 'Post',
        total: 'Total',
        minRead: 'min read',
        tableOfContent: 'Table of Contents',
        profit: 'Profit',
        algoTrading: 'Automation Trading',
        algoTradingFilter: 'Automation / Human Trading',
        tradingStyle: 'Trading Style',
        profitRoi: 'Return on Investment (ROI)',
        netProfitLabel: 'Net Profit',
        maxDrawdownLabel: 'Max Drawdown',
        np0to1k: '$0 - $1,000',
        np1kTo5k: '$1,000 - $5,000',
        np5kTo10k: '$5,000 - $10,000',
        npOver10k: '≥ $10,000',
        dd0to10: '0% - 10%',
        dd10to50: '10% - 50%',
        ddOver50: '≥ 50%',
        roiNegative: 'Negative (< 0%)',
        roi0to10: '0% - 10%',
        roi10to50: '10% - 50%',
        roiOver50: '≥ 50%',
        manualTrading: 'Human Trading',
        lowToHight: 'Low to high',
        hightToLow: 'High to low',
        lessThanManual: 'Less than human trading',
        moreThanManual: 'More than human trading',
        mostlyManual: 'Human (< 50%)',
        mostlyAlgorithmic: 'Automation (≥ 50%)',
        automation100: 'Automation (100%)',
        human100: 'Human (100%)',
        automationCustom: 'Custom',
        startDate: 'Start Date',
        deposit: 'Deposit',
        month: 'Month',
        withdraw: 'Withdraw',
        gain: 'Gain',
        equityGrowth: 'Equity Growth',
        growth: 'Growth',
        gainTooltip: `TWR performance dollar invested system inception measurement required Global Investment Performance Standards CFA Institute cash inflows outflows amounts periods impact return efficiency yield profit growth rate analysis evaluation metric standard benchmark finance investment portfolio rate return calculation assessment monitoring progress achievement success result outcome effectiveness productivity gain loss comparison study review appraisal valuation`,
        absoluteGain: 'Absolute Gain',
        daily: 'Daily',
        drawdown: 'Drawdown',
        balance: 'Balance',
        equity: 'Equity',
        highest: 'Highest',
        financingCost: 'Financing Cost',
        financingCostTooltip:
            'This is the cost associated with holding a position (usually overnight). Depending on the asset, it may be the swap fee (currencies or commodities), funding rate (cryptocurrencies), or financing charge (stocks).',
        monthly: 'Monthly',
        letUsHelpYou: 'Let us help you',
        consulting: 'Consulting',
        consultingSubtitle: 'Let us help you find the best solutions',
        support: 'Support',
        hereToHelp: "We're here to help",
        contact: 'Contact',
        generalInquiries: 'General inquiries',
        phone: 'Phone',
        workingHours: 'Business Hours',
        phoneHours: 'Monday – Friday,<br/>from 09:00 to 17:00',
        chatOnWhatsApp: 'Chat on WhatsApp',
        information: 'Informations',
        basicInformationTitle: 'Basic Information',
        updatePersonalInfoDesc:
            'Update your personal details and profile information.',
        contactInformationTitle: 'Contact Information',
        updateContactDetailsDesc:
            'Update your contact details and communication preferences.',
        tags: 'Tags',
        updateProfile: 'Update Profile',
        verify: 'Verify',
        changePasswordSubtitle:
            'Please enter your current password and new password.',
        changeEmail: 'Change Email',
        changeEmailSubtitle:
            'Please enter your new email address and confirm it.',
        newEmail: 'New Email',
        confirmNewEmail: 'Confirm New Email',
        avatarUploadLimit: 'PNG, JPG up to',
        avatarUploadError: 'Upload failed',
        avatarUploadErrorTitle: 'File upload error(s)',
        fileExceedsMaxSize: 'File exceeds the maximum size of',
        fileTypeNotAccepted: 'File type is not accepted.',
        confirm: 'Confirm',
        saving: 'Uploading...',
        welcomeToChaoMarket: 'Welcome to Chào Market',
        yourAccountHasBeenCreated: 'Your account has been created.',
        fullSolution: 'Custom Solutions',
        customSolutions: 'Custom Solutions',
        tradingToolsAndData: 'Trading Tools & Data',
        appsAndUtilities: 'AI & Software',
        courses: 'Courses',
        accountType: 'Account Type',
        lastUpdatedLabel: 'Last Updated',
        netDepositLabel: 'Net Deposit',
        automation: 'Automation',
        human: 'Human',
        noAccountsFound: 'No accounts found in this deposit range.',
        accountInformation: 'Account Information',
        tradingActivity: 'Trading Activity',
        totalTrades: 'Total Trades',
        automationTrades: 'Automation Trades',
        humanTrades: 'Human Trades',
        duration: 'Duration',
        gainStatistics: 'Gain Statistics',
        absGain: 'Abs Gain',
        maximumDrawdown: 'Maximum Drawdown',
        balanceAndEquity: 'Balance & Equity',
        currentBalance: 'Current Balance',
        currentEquity: 'Current Equity',
        lowest: 'Lowest',
        financialSummary: 'Financial Summary',
        deposits: 'Deposits',
        withdrawals: 'Withdrawals',
        fees: 'Fees',
        yearly: 'Yearly',
        accountPerformance: 'Account Performance',
        ascending: 'Ascending',
        descending: 'Descending',
        clearSorting: 'Clear sorting',
        hideColumn: 'Hide column',
        showColumn: 'Show',
        showAllColumns: 'Show all columns',
        columnsHidden: 'columns hidden',
        columnHidden: 'column hidden',
        noResults: 'No results.',
        loadMore: 'Load more',
    },
    auth: {
        login: 'Log In',
        signup: 'Sign Up',
        forgotPassword: 'Forgot Password?',
        otpSentToEmail: "We've sent a verification code to",
        otpVerificationFailed: 'OTP verification failed',
        failedToVerifyOtp: 'Failed to verify OTP',
        welcomeBack: 'Welcome back!',
        invalidCredentials: 'Invalid credentials',
        loginError: 'An error occurred during login',
        signInError: 'An error occurred during sign in',
        noAccountPrompt: "Don't have an account?",
        oauth: {
            unknownError: 'An unknown error occurred.',
            accountNotLinked:
                'This email is already associated with a different sign-in method.',
            accessDenied: 'Access denied.',
        },
        createAccountTitle: 'Create your account',
        signupSuccessMessage:
            'Account created successfully! Please verify your email.',
        registrationFailed: 'Registration failed',
        registrationError: 'An error occurred during registration',
        failedToSendOtp: 'Failed to send verification code',
        alreadyHaveAccount: 'Already have an account?',
        verifyEmailTitle: 'Verify your email',
        weHaveSendOtpToYourEmail: `We&apos;ve sent a verification code to`,
        otpResentSuccess: 'Verification code resent successfully!',
        failedToResendOtp: 'Failed to resend verification code',
        didNotReceiveCode: "I didn't receive a code",
        resendOtp: 'Resend OTP',
        resendOtpCountdown: 'Resend in {countdown}s',
        resendLocked: 'Too many attempts. Please try again in {time}.',
        resendRemaining: '({remaining} of {max} resends remaining)',
        resendBlockExpired: 'Your session has expired. Please start over.',
        termsAgreement: {
            start: 'By creating an account, I confirm I am',
            startAgePrivacy: 'at least 18 years old',
            startEndContent: 'and',
            startNewLine: "I agree to the website's",
            privacyNotice: 'Privacy Policy',
            and: 'and',
            termsOfUse: 'Terms of Use',
        },
        termsNotAccepted:
            'You must agree to the Terms of Use and Privacy Policy to create an account.',
        resetPassword: {
            goToLogin: 'Go to Login',
            sendResetCode: 'Send Reset Code',
            updatePassword: 'Update Password',
            rememberPassword: 'Remember your password?',
            title: 'Reset your password',
            setNewPasswordTitle: 'Set new password',
            completeTitle: 'Success!',
            emailSubtitle:
                'You will receive an email to reset your password in a few minutes.',
            otpSubtitle: 'Enter the 6-digit code sent to your email.',
            newPasswordSubtitle: 'Create a new password for your account.',
            completeSubtitle: 'Your password has been changed successfully.',
            otpSentSuccess: 'OTP sent to your email',
            requestFailed: 'Failed to send reset password request',
            updateSuccess: 'Password updated successfully',
            updateFailed: 'Failed to change password',
            passwordsDoNotMatch: 'Passwords do not match',
            otpResentToEmail: 'OTP resent to your email',
            resendFailed: 'Failed to resend OTP',
        },
        validation: {
            firstNameRequired: 'First name is required',
            firstNameInvalid: 'No numbers or special characters',
            lastNameRequired: 'Last name is required',
            lastNameInvalid: 'No numbers or special characters',
            emailInvalid: 'Invalid email address',
            emailRequired: 'Email is required',
            passwordTooShort: 'Password must be at least 8 characters',
            passwordTooLong: 'Password must not exceed 128 characters',
            passwordNeedsUppercase:
                'Password must contain at least one uppercase letter',
            passwordNeedsLowercase:
                'Password must contain at least one lowercase letter',
            passwordNeedsNumber: 'Password must contain at least one number',
            passwordNeedsSpecial:
                'Password must contain at least one special character',
            confirmPasswordRequired: 'Please confirm your password',
            passwordsDoNotMatch: "Passwords don't match",
            passwordRequired: 'Password is required',
            genderOtherRequired: 'Please specify your gender',
            otherGenderTooLong:
                'Gender description must not exceed 50 characters',
            dobInPast: 'Date of birth must be in the past',
            dobRequired: 'Please enter your birthday',
            genderRequired: 'Please select your gender',
            ageRequirement:
                'You must be at least 18 years old to create an account',
            phoneNumberRequired: 'Phone number is required',
            phoneInvalid:
                'Phone number can only contain digits, +, -, spaces, and parentheses',
            phoneMinLength: 'Phone number must be at least 9 characters',
            phoneMaxLength: 'Phone number must not exceed 15 characters',
        },
    },
    validation: {
        invalidEmail: 'Invalid email address',
        passwordRequired: 'Password is required',
        firstNameTooLong: 'First name must not exceed 50 characters',
        lastNameTooLong: 'Last name must not exceed 50 characters',
        nameInvalidChars:
            'Name can only contain letters, spaces, hyphens and apostrophes',
        emailTooLong: 'Email must not exceed 100 characters',
        invalidPhoneNumber: 'Please enter a valid phone number (7-20 digits)',
        invalidSocialLink:
            'Please enter a valid URL or keep under 200 characters',
        messageTooLong: 'Message must not exceed 1000 characters',
    },
    consultationRequest: {
        validation: {
            productNotSelected:
                'Products not selected. Please select a product!',
            contactMethodRequired: 'At least one contact method is required',
            socialNetworkRequiredWhenSelected:
                'Social network is required when selected as contact method',
        },
        ourSolution: 'Our Solutions',
        describeOurSolution:
            'Please select the solutions you would like to be consulted on',
        yourInformation: {
            title: 'Your Information',
            prompt: 'Please tell us about yourself',
        },
        contactMethod: {
            prompt: 'How would you like us to contact you? (optional)',
            email: 'Email',
            phone: 'Phone',
            socialNetwork: 'Social network',
        },
        preferredContactDate: {
            label: 'Preferred Contact Consultation Time (optional)',
        },
        yourMessage: {
            label: 'Your Message (optional)',
        },
        requestButton: 'Request a Consultation',
    },
    ourSolutions: {
        financialFoundation: {
            title: 'Financial Foundation Mentoring',
            description:
                'Are you feeling overwhelmed by financial decisions and unsure where to begin? The Financial Foundation Mentoring program at Chào Market is designed to be your starting point. This is a program where we work together to build your core financial knowledge, starting with defining your personal goals and understanding your risk tolerance. You will learn proven methodologies for asset allocation and investment analysis, not as rigid rules, but as flexible frameworks you can adapt to confidently navigate the markets and make independent financial decisions.',
            deliveryOptions: {
                title: 'Delivery options (to suit your needs):',
                workshop: 'Interactive small group workshop',
                workshopDesc:
                    'Learn in a collaborative environment, sharing experiences with other investors.',
                mentoring: 'Intensive 1-on-1 mentoring',
                mentoringDesc:
                    'A fully personalized roadmap, focusing deeply and confidentially on your unique financial situation.',
            },
            outcomes: {
                title: 'Key outcomes you will achieve:',
                roadmap: 'A clear financial roadmap',
                roadmapDesc:
                    'You will craft a personalized financial plan that outlines clear, actionable steps towards your long-term goals.',
                riskAssessment: 'Risk assessment skills',
                riskAssessmentDesc:
                    'Develop the ability to accurately assess your own risk tolerance and make investment choices that align with it.',
                assetKnowledge: 'Knowledge of asset classes',
                assetKnowledgeDesc:
                    'Gain a solid understanding of major asset classes (stocks, bonds, etc.) and their roles in a diversified portfolio.',
                independentDecision: 'Independent decision-making',
                independentDecisionDesc:
                    'Build the confidence and skills to make informed financial decisions on your own.',
                budgetingMastery: 'Budgeting and allocation mastery',
                budgetingMasteryDesc:
                    'Learn practical techniques for budgeting, saving, and allocating your capital effectively.',
            },
            note: '<strong>Disclaimer:</strong> This program is educational only and does not constitute investment advice. All financial decisions are your own responsibility.',
        },
        portfolioStrategy: {
            title: 'Portfolio Strategy & Tools',
            description:
                "Building a resilient investment portfolio is both an art and a science. At Chào Market, our philosophy is that a successful portfolio requires both a solid strategy and the right tools. This service is designed for investors who manage their own assets but want to refine their strategic approach. We will guide you through the core principles of modern portfolio construction, diversification, and rebalancing. You will learn how to use our algorithm-based tools to self-monitor market trends and analyze your portfolio's performance, enabling you to make proactive, data-driven decisions.",
            deliveryOptions: {
                title: 'Delivery options (to suit your needs):',
                workshop: 'Interactive small group workshop',
                workshopDesc:
                    'Master the principles in a group setting, learning from shared discussions.',
                mentoring: 'Intensive 1-on-1 mentoring',
                mentoringDesc:
                    'A deep-dive session focused entirely on your specific portfolio and strategic goals.',
            },
            outcomes: {
                title: 'Key outcomes you will achieve:',
                framework: 'A practical construction framework',
                frameworkDesc:
                    'Gain a step-by-step framework for building and diversifying a robust investment portfolio from scratch.',
                rebalancing: 'Strategic rebalancing skills',
                rebalancingDesc:
                    'Master the skill of strategically adjusting and rebalancing your portfolio to adapt to changing market conditions.',
                toolsProficiency: 'Proficiency in analytical tools',
                toolsProficiencyDesc:
                    'Become proficient in using algorithmic tools to gain objective, data-driven insights into your investments.',
                riskManagement: 'Advanced risk management',
                riskManagementDesc:
                    'Develop a deep understanding of sophisticated risk management techniques to protect your capital.',
                objectiveDecision: 'Objective decision-making',
                objectiveDecisionDesc:
                    'Learn to separate emotions from investing and make objective decisions based on your strategy and data.',
            },
            note: '<strong>Disclaimer:</strong> We provide analytical frameworks and tools, not investment recommendations. All final decisions are your own responsibility.',
        },
        algoTrading: {
            title: 'Algorithmic Trading Solutions',
            description:
                'You have a unique trading strategy, but implementing it manually is inefficient. As your technical partner, Chào Market transforms your vision into a powerful, automated trading system. You are the strategist; we are the technical implementers. The process includes in-depth consultations to understand your rules, programming the logic, providing a comprehensive backtest report, and supporting you in deploying the system.',
            deliveryMethod: {
                title: 'Delivery method:',
                desc: 'To ensure confidentiality and a completely custom outcome for your proprietary strategy, this service is conducted exclusively on a one-on-one project basis.',
            },
            outcomes: {
                title: 'Key outcomes you will receive:',
                codedSystem: 'A fully coded trading system',
                codedSystemDesc:
                    'A complete and operational automated system that executes your unique strategy 24/7.',
                backtestReport: 'A comprehensive backtest report',
                backtestReportDesc:
                    "A detailed report analyzing your strategy's historical performance, providing insights into its potential strengths and weaknesses.",
                deployedTool: 'A deployed & integrated tool',
                deployedToolDesc:
                    'A system fully integrated and deployed on your chosen trading platform, ready for you to use.',
                systematicExecution: 'Systematic execution',
                systematicExecutionDesc:
                    'The ability to execute your strategy with precision and discipline, completely free from emotional interference.',
                fullOwnership: 'Full ownership and documentation',
                fullOwnershipDesc:
                    'You receive the full source code and technical documentation for your system.',
            },
            note: '<strong>Disclaimer:</strong> This is a purely technical service. Source code is provided without trading strategies or investment recommendations.',
        },
        tradingPerformance: {
            title: 'Trading Performance Mentoring',
            description:
                'Are your trading results inconsistent? The Chào Market Performance Deep-Dive is our mentoring service designed to find the answers in your own trading data. We perform a deep analysis of your trading history, transforming raw data into actionable insights. We use statistical analysis to generate visual reports that highlight your performance metrics and behavioral patterns. The goal is to foster powerful self-awareness, enabling you to refine your risk management skills and improve your trading discipline objectively.',
            deliveryOptions: {
                title: 'Delivery options (to suit your needs):',
                workshop: 'Group workshop',
                workshopDesc:
                    'Learn performance analysis methods through anonymized case studies and group discussions.',
                mentoring: '1-on-1 mentoring',
                mentoringDesc:
                    'A deep and confidential analysis of your personal trading history, providing private, specific feedback.',
            },
            outcomes: {
                title: 'Key outcomes you will achieve:',
                performanceView: 'A clear view of your performance',
                performanceViewDesc:
                    'A deep understanding of your key performance metrics (win rate, risk/reward, max drawdown, etc.).',
                behavioralPatterns: 'Identification of behavioral patterns',
                behavioralPatternsDesc:
                    'The ability to identify and analyze your recurring psychological biases and behavioral patterns (e.g., cutting winners short).',
                improvementPlan: 'An actionable improvement plan',
                improvementPlanDesc:
                    'A concrete plan with specific, actionable steps to enhance your discipline and refine your risk management rules.',
                selfReviewSkills: 'Objective self-review skills',
                selfReviewSkillsDesc:
                    'The skill of objectively reviewing your own trading journal and data to continuously improve in the future.',
                tradingDiscipline: 'Enhanced trading discipline',
                tradingDisciplineDesc:
                    'Increased control and objectivity in your trading process, leading to more consistent execution.',
            },
            note: '<strong>Disclaimer:</strong> This program supports performance self-assessment and does not provide trading advice or recommendations. All decisions are your own responsibility.',
        },
        financialCourse: {
            title: 'Financial Investment Courses',
            description:
                'In a world of information overload, finding a trusted source of knowledge is key. The Financial Investment Course at Chào Market is designed to systematically build your expertise, from the ground up. We start with the core foundations of financial markets and asset types, then move into practical analysis methods and proven investment strategies. A key focus of the course is the hands-on application of modern algorithmic tools, empowering you to make smarter, data-driven decisions.',
            deliveryOptions: {
                title: 'Delivery options (to suit your needs):',
                groupClass: 'Small group class',
                groupClassDesc:
                    'Join a community of learners to benefit from group discussions and interactive Q&A sessions.',
                privateMentoring: 'Private 1-on-1 mentoring',
                privateMentoringDesc:
                    'A customized learning experience where the curriculum is tailored to your knowledge level.',
            },
            outcomes: {
                title: 'Key outcomes you will achieve:',
                foundationalKnowledge: 'Solid foundational knowledge',
                foundationalKnowledgeDesc:
                    'A comprehensive understanding of how financial markets operate, including stocks, forex, and other major asset classes.',
                analysisSkills: 'Practical analysis skills',
                analysisSkillsDesc:
                    'The ability to apply both fundamental and technical analysis methods to evaluate investment opportunities.',
                toolProficiency: 'Algorithmic tool proficiency',
                toolProficiencyDesc:
                    'Practical skills in using modern algorithmic tools to find, analyze, and support your trading ideas.',
                strategicFramework: 'A strategic framework',
                strategicFrameworkDesc:
                    'A framework for developing, backtesting, and refining your own investment strategies.',
                confidenceToInvest: 'Confidence to invest',
                confidenceToInvestDesc:
                    'The confidence to navigate the investment world with a structured, knowledgeable, and disciplined approach.',
            },
            note: '<strong>Disclaimer:</strong> All content is for educational purposes only and does not constitute investment advice. Actual results may differ from examples provided.',
        },
        personalizedSolution: {
            title: 'Personalized Solution',
            description:
                "Every investor's journey is unique. If our existing solutions don't fully match your situation, we will work with you to design a fully customized program — built around your specific goals, experience level, and market interests. Whether you need a hybrid of multiple approaches, a deep-dive into a niche strategy, or ongoing advisory support, we craft a solution that fits you perfectly.",
            process: {
                title: 'How it works:',
                discovery: 'Discovery call',
                discoveryDesc:
                    'We start with a free consultation to understand your background, goals, and challenges.',
                proposal: 'Custom proposal',
                proposalDesc:
                    'Our team designs a tailored plan with clear milestones, deliverables, and timeline.',
                execution: 'Collaborative execution',
                executionDesc:
                    'We work alongside you — with regular check-ins, adjustments, and hands-on guidance.',
            },
            benefits: {
                title: 'Why choose a personalized solution:',
                tailored: 'Fully customized',
                tailoredDesc:
                    'Every aspect is designed around your unique financial situation and objectives.',
                flexible: 'Flexible engagement',
                flexibleDesc:
                    'Choose the format, pace, and depth that works best for you — from short sprints to long-term mentoring.',
                expert: 'Dedicated support',
                expertDesc:
                    'Work one-on-one with our team, who will guide you with practical insights drawn from real market experience.',
                evolving: 'Evolving with you',
                evolvingDesc:
                    'Your plan adapts as your knowledge grows and your goals shift over time.',
            },
            outcomes: {
                tailored: 'Fully customized',
                flexible: 'Flexible engagement',
                expert: 'Dedicated support',
                evolving: 'Evolving with you',
            },
            note: 'This service is ideal for clients who want a hands-on, deeply personalized experience beyond our standard programs.',
        },
        common: {
            getStarted: 'Book Consultation',
            title: 'Products',
        },
    },
    sidebar: {
        home: 'Home',
        personalInfo: 'Personal Info',
        security: 'Security',
        changePassword: 'Change Password',
        twoFactor: '2-Step Verification',
        notifications: 'Notifications',
        orders: 'Transactions & Subscriptions',
        orderHistory: 'Transaction History',
        subscriptions: 'Subscriptions',
        legal: 'Legal & Compliance',
        ecosystem: 'Chào Ecosystem',
        chaoMarketTrading: 'Chào Market Trading',
        thuexeChaoMarket: 'Thuê Xe Chào Market',
        chaoNews: 'Chào News',
        brandGoal: 'Manage Your Account',
    },
    notifications: {
        markAllRead: 'Mark all as read',
        markSelectedRead: 'Mark as read',
        selectAll: 'Select All',
        selected: 'Selected',
        unread: 'Unread',
        read: 'Read',
        type: {
            security: 'Security',
            system: 'System',
            account: 'Account',
            order: 'Transaction',
        },
        filter: {
            all: 'All',
            starred: 'Important',
        },
        col: {
            title: 'Title',
            content: 'Content',
            type: 'Type',
            time: 'Time',
        },
        time: {
            justNow: 'Just now',
            minutesAgo: '{n} min ago',
            hoursAgo: '{n}h ago',
            daysAgo: '{n}d ago',
        },
        empty: {
            title: 'No notifications',
            description: 'System notifications will appear here',
        },
    },
    bookConsultation: {
        bookConsultation: 'Book a Consultation',
    },
    contactButton: {
        quickContactTooltip: 'Chat with Chào Market',
        methods: {
            messenger: 'Chat on Messenger',
            zalo: 'Chat on Zalo',
            telegram: 'Chat on Telegram',
            callUs: 'Call Chào Market',
        },
    },
    footer: {
        aboutUs: {
            title: 'About Us',
            sections: [
                {
                    title: 'Our Mission: Empowering Vietnamese Investors',
                    content: [
                        "Welcome to Chào Market. We believe that successful financial navigation in today's complex markets is not about secrets or luck, but about having the right knowledge, the right strategy, and the right tools. Our mission is to empower Vietnamese investors by demystifying the world of finance and providing data-driven, educational solutions.",
                    ],
                },
                {
                    title: 'Our Approach: A Blend of Expertise and Technology',
                    content: [
                        'Founded on the principle of education first, Chào Market combines deep financial expertise with modern technology. We don\'t offer "get-rich-quick" schemes; instead, we provide a structured path to building financial literacy and strategic thinking. Our programs, from foundational mentoring to advanced system development, are designed to equip you with the skills to make your own informed, confident decisions.',
                        'We are your partners in managing risk and turning market data into successful financial outcomes.',
                    ],
                },
            ],
        },
        termOfUse: {
            title: 'Terms of Use',
            sections: [
                {
                    title: '1. Acceptance of Terms',
                    content:
                        'By accessing, using, and/or registering for an account on the Chào Market website (the "website"), you acknowledge that you have read, understood, and agree to be bound by all the terms and conditions set forth in these "Terms of Use". <strong>If you do not agree, please do not use our website.</strong>',
                },
                {
                    title: '2. Description of Services',
                    content:
                        'Chào Market provides services, tools, and information for financial education purposes, including but not limited to: <strong>Financial Foundation Mentoring, Portfolio Strategy & Tools, Algorithmic Trading Solutions, Trading Performance Mentoring, and Financial Investment Courses.</strong>',
                },
                {
                    title: '3. User Account and Responsibilities',
                    content:
                        'To access certain features, including the "Account Performance" area, you will be' +
                        ' required to create an account. By creating an account, you agree to:\n• Provide accurate' +
                        ' and current information.\n• Maintain the confidentiality of your password and be' +
                        ' responsible for all activities that occur under your account.\n• Acknowledge that the act' +
                        ' of checking the box stating "By creating an account, I confirm that I am <a href="/terms-of-use">at' +
                        ' least' +
                        ' 18 years old</a> and I agree to the website\'s <a href="/terms-of-use">Terms of' +
                        ' Use</a> and <a href="/privacy-policy">Privacy Policy</a> during the registration process' +
                        ' constitutes' +
                        ' a' +
                        ' legally binding electronic signature and confirms your full consent to this document.',
                },
                {
                    title: '4. Terms of Access and Use for the "Account Performance" Area',
                    content:
                        'The "Account Performance" area is restricted content, available only to registered members who have agreed to these terms. You unconditionally acknowledge and agree to the following provisions:\n\n<strong>4.1. Sole Purpose of Research and Academic Study:</strong> You acknowledge that the sole purpose for which you are permitted to access and use the data is for <strong>research, analysis, and academic study.</strong> The data is provided as case studies and illustrative examples for the educational purpose of understanding how a trading system operates.\n\n<strong>4.2. User Obligations and Prohibited Uses:</strong> Upon being granted access, you agree to:\n<strong>• Confidentiality:</strong> Not to share your login credentials or disclose, disseminate the data to any third party.\n<strong>• Purpose of Use:</strong> To use the data only for personal, non-commercial purposes as stated.\n<strong>• Prohibitions:</strong> Not to copy, modify, resell, redistribute, or use the data to create competing products, services, or for any other commercial purpose without our express written permission.\n\n<strong>4.3. Termination of Access:</strong> We reserve the full right to suspend or permanently terminate your access to the Restricted Area without prior notice if we have reason to believe that you have violated any term of this document.',
                },
                {
                    title: '5. No Investment Advice Disclaimer (critical)',
                    content:
                        'All content, tools, and services provided on this website, including all data within the restricted area, are for informational and educational purposes only. <strong>Absolutely Nothing</strong> on this website constitutes, or should be construed as, investment advice, a recommendation, a trade signal, or a solicitation to buy, sell, or hold any financial instrument. Chào Market is not a licensed investment advisor or broker-dealer under the laws of Vietnam. All investment decisions are made solely by you, and you are solely responsible for evaluating the related risks.',
                },
                {
                    title: '6. Acknowledgment of Legal Context and Specific Market Risks',
                    content:
                        'By accepting these terms, you confirm you have been informed and understand the specific legal status and risks of each market in Vietnam:\n<strong>• Regarding Currencies & Cryptocurrencies:</strong> You are aware that these markets are <strong>not licensed for individual retail investors under Vietnamese law,</strong> operate in an unclear legal environment, and carry very significant legal and financial risks. We do not encourage or broker any activities in these markets.\n<strong>• Regarding Stocks & Commodities:</strong> You understand that while these markets are licensed, they always involve the risk of volatility and potential loss.\n<strong>• General Principle:</strong> You accept that past performance, whether from backtests or live trading, <strong>does not guarantee and is not an indicator</strong> of future results.',
                },
                {
                    title: '7. Intellectual Property',
                    content:
                        'All content on this website, including text, graphics, logos, software, and <strong>data within the restricted area</strong>, is the property of Chào Market and is protected by Vietnamese and international copyright laws.',
                },
                {
                    title: '8. Limitation of Liability',
                    content:
                        'In no event shall Chào Market, its owners, or affiliates be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the information and services on this website.',
                },
                {
                    title: '9. Governing Law and Severability',
                    content:
                        '<strong>Governing Law:</strong> These terms shall be governed by and construed in accordance with the laws of Vietnam.\n<strong>Severability:</strong> If any provision of this document is found to be invalid by a court of competent jurisdiction, the remaining provisions shall remain in full force and effect.',
                },
                {
                    title: '10. Contact',
                    content:
                        'Any questions regarding these "Terms of Use" should be directed to: <a href="mailto:support@chaomarket.com">support@chaomarket.com</a>',
                },
            ],
        },
        privacyPolicy: {
            title: 'Privacy Policy',
            sections: [
                {
                    title: '1. Information We Collect',
                    content:
                        'Chào Market ("we," "us," or "our") is committed to protecting the privacy of our users' +
                        ' ("you"). This “Privacy Policy” explains how we collect, use, disclose, and safeguard your' +
                        ' information when you visit our website Chào Market (chaomarket.com) and use our' +
                        ' services.\nWe may collect information about you in a variety of' +
                        ' ways:\n\n<strong>Personal data you provide to us:</strong>\n• When you register for an account, we collect personally identifiable information such as your <strong>name, email address, and optional phone number.</strong>\n• When you contact us via forms or email, we collect the information you provide during that communication.\n\n<strong>Data collected automatically:</strong>\n• When you access the website, we may automatically collect information such as your <strong>IP address, browser type, operating system, access times, and the pages you have viewed.</strong> This data is used for analytics and security purposes.',
                },
                {
                    title: '2. How We Use Your Information',
                    content:
                        'Having accurate information about you permits us to provide you with an effective, secure, and customised experience. Specifically, we use your information to:\n• Create and manage your account.\n• Grant you access to restricted content (such as the "Account Performance" area) after you have agreed to the terms.\n• Send you important administrative emails regarding your account and our services.\n• Respond to your inquiries and questions.\n• Analyse website usage to improve our services and user experience.\n• Prevent fraudulent activities and enhance the security of our website.',
                },
                {
                    title: '3. Disclosure of Your Information',
                    content:
                        'We do not sell, rent, or trade your personal information to any third parties for marketing purposes. Your information may be shared only in the following situations:\n<strong>• With service providers:</strong> We may share your information with third-party vendors who perform services for us (such as web hosting, data analysis, and email delivery). These parties are only permitted to use your information to carry out the tasks we have assigned to them and are obligated to keep it confidential.\n<strong>• By law or to protect rights:</strong> We may disclose your information if required by law, court order, or a government request to protect the rights, property, and safety of ourselves and others.',
                },
                {
                    title: '4. Security of Your Information',
                    content:
                        'We use reasonable administrative, technical, and physical security measures to help protect your personal information. Data is encrypted in transit (using SSL). However, please be aware that no security measures are perfect or impenetrable, and we cannot guarantee 100% security.',
                },
                {
                    title: '5. Cookie Policy',
                    content:
                        "We use cookies to maintain your session, remember your preferences, and analyse traffic. You can control the use of cookies through your browser's settings.",
                },
                {
                    title: '6. Changes to This Policy',
                    content:
                        'We may update this “Privacy Policy” at any time. Any changes will be effective immediately upon posting the updated version on the website. We will notify you of any significant changes via email or a prominent notice on the website.',
                },
                {
                    title: '7. Contact Us',
                    content:
                        'If you have any questions or concerns about this “Privacy Policy”, please contact us at: <a href="mailto:support@chaomarket.com">support@chaomarket.com</a>.',
                },
            ],
        },
        cookiePolicy: {
            title: 'Cookie Policy',
            sections: [
                {
                    title: '1. What Are Cookies?',
                    content:
                        'Cookies are small text files placed on your device by websites that you visit. They are widely used to make websites work more efficiently and to provide information to the site owners.',
                },
                {
                    title: '2. How We Use Cookies',
                    content:
                        '<strong>Essential Cookies:</strong> Necessary for the website to function' +
                        ' properly.<br/><strong>Analytics' +
                        ' Cookies:</strong>' +
                        ' We' +
                        ' use these (e.g., Google Analytics) to understand how visitors interact with our website,' +
                        ' which helps us improve our content and services.<br/><strong>Marketing Cookies (if' +
                        ' applicable):</strong>' +
                        ' These are used to track visitors across websites to display relevant ads.',
                },
                {
                    title: '3. Your Choices',
                    content:
                        "You can control and manage cookies in various ways. Please refer to your browser's help section for information on how to block or delete cookies.",
                },
            ],
        },
        supportPolicy: {
            title: 'Support Policy',
            sections: [
                {
                    title: '1. Scope',
                    content:
                        'This Return & Refund Policy applies to all products and services purchased through <strong>chaomarket.com</strong>, including trading tools, AI & software, online courses, and consultation services.',
                },
                {
                    title: '2. Digital Products — Return Eligibility',
                    content:
                        'All products sold on Chào Market are <strong>digital goods</strong> (software licenses, downloadable tools, online courses). Due to the nature of digital products:' +
                        '<br/>• Once a license key has been issued or a download link has been accessed, <strong>the product cannot be returned</strong>.' +
                        '<br/>• All sales are considered <strong>final</strong> upon successful delivery of the digital product to your account.' +
                        '<br/>• Please review all product details, descriptions, and system requirements carefully before making a purchase.',
                },
                {
                    title: '3. Refund Conditions',
                    content:
                        'Refunds may be considered in the following cases:' +
                        '<br/>• <strong>Duplicate payment:</strong> If you are charged more than once for the same product, you are eligible for a full refund of the duplicate charge.' +
                        '<br/>• <strong>Product not delivered:</strong> If the digital product (license key, download link, or course access) was not delivered to your account after payment, you are eligible for a full refund.' +
                        '<br/>• <strong>Critical technical issue:</strong> If a purchased product has a critical defect that prevents it from functioning as described and our support team is unable to resolve the issue.' +
                        '<br/><br/><strong>How to request a refund:</strong> Contact us at <a href="mailto:info@chaomarket.com">info@chaomarket.com</a> within <strong>7 days</strong> of purchase with your transaction code and a description of the issue.',
                },
                {
                    title: '4. Refund Timeline & Method',
                    content:
                        '<strong>Processing time:</strong> Approved refund requests will be processed within 5–7 business days.' +
                        '<br/><strong>Refund method:</strong> Refunds will be returned via the original payment method (bank transfer).' +
                        '<br/><strong>Consultation services:</strong> Consultation fees are non-refundable once a session has been scheduled or completed.',
                },
                {
                    title: '5. Contact Us',
                    content:
                        'For any questions regarding returns, refunds, or order issues, please contact us:' +
                        '<br/>• <strong>Email:</strong> <a href="mailto:info@chaomarket.com">info@chaomarket.com</a>' +
                        '<br/>• <strong>Response time:</strong> 1–2 business days (Monday–Friday, 09:00–17:00 UTC+7)',
                },
            ],
        },
        returnPolicy: {
            title: 'Return Policy',
        },
        chaoHelp: {
            title: 'Chào Help',
        },
        legalAndSupport: 'We protect you',
        legal: 'Legal',
        followUs: 'Follow us',
        joinGroup: 'Join Group',
        copyright:
            '© 2026 Chào Market. All rights reserved.' +
            '<br/>All content is protected by intellectual property laws. Unauthorized reproduction is prohibited.',
    },
    marketData: {
        marketData: {
            title: 'Market Data',
            items: {
                indices: {
                    title: 'Indices',
                    items: {
                        global: { title: 'Global' },
                        us: { title: 'The United States' },
                        vietnam: { title: 'Vietnam' },
                    },
                },
                markets: {
                    title: 'Markets',
                    items: {
                        usStocks: {
                            title: 'US Stocks',
                            items: {
                                overview: { title: 'Overview' },
                                heatmap: { title: 'Heatmap' },
                                chart: { title: 'Chart' },
                                news: { title: 'News' },
                                calendar: { title: 'Calendar' },
                            },
                        },
                        vietnamStocks: { title: 'Vietnam Stocks' },
                        currencies: { title: 'Currencies' },
                        cryptocurrencies: { title: 'Cryptocurrencies' },
                        commodities: { title: 'Commodities' },
                    },
                },
                financialNews: {
                    title: 'Financial News',
                },
                economicMap: {
                    title: 'Economic Map',
                },
                economicCalendar: {
                    title: 'Economic Calendar',
                },
                chaoInsights: {
                    title: 'Chào Insights',
                },
            },
        },
        stockSymbolLabel: 'Stock Symbol',
    },
    investors: {
        title: 'Chào & Investors',
        items: {
            chaoAnnoucement: {
                title: 'Chào Announcements',
            },
            chaoSocial: {
                title: 'Founder Channel',
                items: {
                    facebook: { title: 'Facebook' },
                    tiktok: { title: 'Tiktok' },
                    threads: { title: 'Threads' },
                    youtube: { title: 'Youtube' },
                },
            },
            toolForInvestor: {
                title: 'Investment Calculators',
                items: {
                    currencyConverterCalc: {
                        title: 'Currency Converter',
                        description:
                            'A tool to convert values between currency pairs.',
                    },
                    pipCalculator: {
                        title: 'Pip',
                        description:
                            'A tool to calculate pip values for currency pairs.',
                    },
                    profitCalculator: {
                        title: 'Profit',
                        description:
                            'A tool to determine profit and loss in trades.',
                    },
                    pivotalCalculator: {
                        title: 'Pivot Point',
                        description:
                            'A tool to find support and resistance pivot points in technical analysis.',
                    },
                    fiboCalculator: {
                        title: 'Fibonacci',
                        description:
                            'A tool to calculate Fibonacci retracement and extension levels.',
                    },
                    marginCalculator: {
                        title: 'Margin',
                        description:
                            'A tool to determine the required margin for trading positions.',
                    },
                    investmentCalculator: {
                        title: 'Interest',
                        description:
                            'Calculate investment returns and future value of investments.',
                    },
                },
            },
        },
    },
    community: {
        title: 'Community',
        items: {
            chaoConnect: {
                title: 'Chào Connect',
            },
            freeCourses: {
                title: 'Free Courses',
            },
            workShops: {
                title: 'Workshops',
            },
        },
    },
    account: {
        profile: 'Profile',
        notification: 'Notifications',
        orderHistory: 'Transaction History',
        subscriptions: 'Subscriptions',
        security: 'Security',
        legalCompliance: 'Terms',
        services: 'Products & Services',
        privacy: 'Privacy',
        title: 'Account',
        profilePage: {
            pageTitle: 'Personal Profile',
            pageDescription: 'Manage your personal information',
            fullName: 'Full name',
            email: 'Email',
            phone: 'Phone number',
            dateOfBirth: 'Date of birth',
            gender: 'Gender',
            genderMale: 'Male',
            genderFemale: 'Female',
            genderOther: 'Other',
            genderCustom: 'Describe yourself',
            noName: 'No name set',
            joinedAt: 'Joined at',
            editButton: 'Edit',
            saveButton: 'Save Changes',
            cancelButton: 'Cancel',
            confirmButton: 'Confirm',
            // OTP
            otpTitle: 'Verify changes',
            otpAvatarTitle: 'Verify avatar change',
            otpDescription: '6-digit verification code has been sent to',
            otpPlaceholder: 'Please enter all 6 digits',
            otpInvalid: 'Invalid or expired OTP code',
            otpSendFailed: 'Cannot send verification code. Please try again.',
            // Avatar
            avatarMaxSize: 'Image max 5MB. Please choose a smaller image.',
            avatarInvalidFormat: 'Unsupported format. Please choose an image file (JPG, PNG, WebP).',
            avatarUpdated: 'Avatar has been updated!',
            avatarUploadFailed: 'Cannot update avatar. Please try again.',
            // Profile update
            profileUpdated: 'Personal information has been updated successfully!',
            profileUpdateFailed: 'Cannot update email',
            // Validation
            nameRequired: 'Please enter your full name',
            nameMax: 'Full name maximum 100 characters',
            nameLettersOnly: 'Full name can only contain letters',
            emailInvalid: 'Invalid email',
            phoneInvalid: 'Invalid phone number',
            phoneMin: 'Phone number minimum 9 digits',
            phoneMax: 'Phone number maximum 15 digits',
            genderRequired: 'Please enter your gender',
            genderCustomMax: 'Maximum 50 characters',
            dobInvalid: 'Invalid date of birth',
            dobMinAge: 'You must be at least 18 years old',
            // Generic
            genericError: 'An error occurred. Please try again.',
        },
        dashboard: {
            greeting: 'Hello,',
            overview: 'Overview',
            manageDescription: 'Manage your account and personal settings',
            securityOverview: 'Security Overview',
            viewDetails: 'View details →',
            quickAccess: 'Quick Access',
            password: 'Password',
            emailVerification: 'Email Verification',
            twoFactor: '2-Step Verification',
            activeDevices: 'Active Devices',
            statusSet: 'Set up',
            statusNotSet: 'Not set up',
            statusVerified: 'Verified',
            statusNotVerified: 'Not verified',
            statusOff: 'Off',
            deviceCount: '{count} devices',
            noData: 'No data',
            profileDesc: 'Update name, phone, date of birth',
            notificationDesc: 'View system notifications',
            securityDesc: 'Change password, recent activity',
            servicesDesc: 'View all available services',
            subscriptionsDesc: 'Manage product subscriptions',
            ordersDesc: 'View purchase history',
        },
        notificationSection: {
            title: 'Notification Preferences',
            recentNotification: 'Recent Notifications',
        },
        legalComplianceSection: {
            disclaimerTitle: 'Disclaimer',
            disclaimerDesc:
                'You have read and agreed to the website disclaimer.',
            performanceNoticeTitle: 'Account Performance Notice',
            performanceNoticeDesc:
                'You have read and acknowledged the account performance notice.',
            acceptedOn: 'Accepted on',
            notAccepted: 'Not yet accepted',
            viewDetails: 'View Details',
            readAndAccept: 'Read & Accept',
            viewPerformance: 'View Performance',
        },
        legalPage: {
            pageTitle: 'Legal',
            pageDescription: 'Terms and service policies',
            termsTitle: 'Terms of Use',
            termsDesc: 'Rules and conditions when using our services',
            privacyTitle: 'Privacy Policy',
            privacyDesc: 'How we collect, use and protect your personal data',
            refundTitle: 'Return & Refund Policy',
            refundDesc: 'Regulations on product returns and service refunds',
            cookieTitle: 'Cookie Policy',
            cookieDesc: 'Information about how we use cookies on our website',
            disclaimer: 'By using our services, you agree to the terms and policies above. If you have any questions, please contact',
        },
        servicesPage: {
            title: 'Products & Services',
            description: 'All services in the ecosystem',
            yourServices: 'Your Products & Services',
            allServicesLinked: 'All services in the ecosystem are linked with your account.',
            activeCount: '{count} active',
            totalCount: '{count} services',
            platforms: 'Platforms',
            platformsDesc: 'Core platforms in the Chào ecosystem',
            products: 'Products & Tools',
            productsDesc: 'Software and trading support tools',
            statusActive: 'Active',
            statusComingSoon: 'Coming Soon',
            visitService: 'Visit',
            services: {
                chaomarket: {
                    name: 'Chào Market',
                    description: 'Smart financial & investment platform. Trading tools, market analysis, and financial data.',
                },
                thuexe: {
                    name: 'Thuê Xe Chào Market',
                    description: 'Self-drive car rental and airport transfer service. Fast booking, great prices, door-to-door delivery.',
                },
                chaoNews: {
                    name: 'Chào News',
                    description: 'Financial, crypto, and market news. 24/7 updates from trusted sources.',
                },
                chaoBusiness: {
                    name: 'Chào Business',
                    description: 'Enterprise solutions: Financial data APIs, whitelabel platform, and strategic consulting.',
                },
                chaoDisplay: {
                    name: 'Chào Display',
                    description: 'Realtime gold, forex, crypto price display software for gold shops and exchanges.',
                },
                chaoMouse: {
                    name: 'Chào Mouse',
                    description: 'Trading automation tool: auto-click, macro trading, and quick operation support.',
                },
            },
        },
    },
    tool: {
        valueIsNowEmpty: 'Value is now empty',
    },
    disclaimer: {
        title: 'Disclaimer',
        sections: [
            {
                title: 'Informational Purposes',
                content:
                    'All information, tools, and data provided by Chào Market are for <strong>general informational and educational purposes only</strong> and are not intended as advisory services.',
            },
            {
                title: 'No Investment Advice',
                content:
                    'The content on this website <strong>absolutely does not</strong> constitute and shall not be considered as investment advice, a recommendation, a trade signal, or a solicitation to buy, sell, or hold any financial instrument. We do not guarantee the accuracy or completeness of this information.',
            },
            {
                title: 'Risk And Responsibility',
                content:
                    'All investment decisions carry significant financial risks. <strong>Past performance is not indicative of future results.</strong> You are solely responsible for your own decisions and are encouraged to seek independent professional financial advice before making any investment.',
            },
        ],
        conclusion:
            'By continuing to access this website, you agree that the information provided is for' +
            ' educational and informational purposes only. This does not constitute investment advice, and we are' +
            ' not responsible for your decisions. Please read our <a href="/terms-of-use">Terms of Use</a> and' +
            ' <a href="/privacy-policy">Privacy Policy</a>' +
            ' carefully.',
        agreeButton: 'I understand and agree',
        alreadyAgreeButton: 'You have already accepted this disclaimer.',
        leaveButton: 'Leave site',
        triggerDialogContent: 'Disclaimer',
    },
    performanceNotice: {
        guest: {
            title: 'Members Only Area',
            desc1:
                'This area contains in-depth analysis and research data, exclusively for registered members who' +
                ' are <a href="/terms-of-use">at least 18 years of age</a> and have agreed to our <a' +
                ' href="/terms-of-use">Terms of Use</a> and' +
                ' <a href="/privacy-policy">Privacy Policy</a> .',
            desc2: '',
            linkSignUp: 'Sign Up',
            desc3: ' or ',
            linkLogIn: 'Log In',
            desc4: ' to continue.',
            okButton: 'I understand and agree',
        },
        member: {
            title: 'Important Data Notice',
            reminderText: 'Important Data Notice',
            desc1: 'The data you are viewing is for',
            desc2: 'research and academic purposes only and does not constitute investment advice',
            desc3:
                '. Past performance is no guarantee of future results.' +
                '<br/>By continuing, you confirm that you are a registered member, are <a href="/terms-of-use">18 years' +
                ' or' +
                ' older</a>,' +
                ' and agree' +
                ' to' +
                ' our <a href="/terms-of-use">Terms of Use</a> and <a href="/privacy-policy">Privacy Policy</a>.',
            linkTerms: 'Terms of Use',
            agreeButton: 'I understand and agree',
            declineButton: 'Decline',
            alreadyAgreeButton:
                'You accepted this notice when you registered your account',
        },
        mainSection: {
            independentVerification: 'Independent Verification',
            verificationTooltip:
                'This link may be blocked by some ISPs in Vietnam. Use a VPN to access it.',
            roiLabel: 'Return on Investment (ROI)',
            roiTooltip:
                'ROI (Return on Investment) measures the percentage of profit or loss relative to the total Net Deposit.',
            roiFormula: 'Formula: ROI = (Net Profit / Net Deposit) × 100%.',
            accountTypeTooltip:
                'The type of trading account used (e.g., ECN, Standard). This affects spreads, commissions, and execution speed.',
            netDepositFilterTooltip:
                'Filter accounts by Net Deposit (the total capital deposited minus withdrawals). Choose a range to narrow down accounts by size.',
            drawdownTooltip:
                'The largest peak-to-trough decline in account equity, indicating the maximum risk exposure.',
            accountTypeEcn:
                'Raw spreads with commission, direct market access.',
            accountTypeClassic: 'Fixed/floating spreads, no commission.',
            accountTypeStp: 'Orders routed directly to liquidity providers.',
            accountTypeCent:
                'Balance ×100 ($10 = 1,000 cents), for low-risk testing.',
            accountTypeCash: 'Trade with deposited funds only, no leverage.',
            accountTypeMargin:
                'Borrow funds from broker to trade with leverage.',
            accountTypeIsa: 'Tax-advantaged investment account (UK).',
            accountTypeSpot: 'Buy and own the actual digital asset directly.',
            accountTypeFutures: 'Trade contracts based on future asset prices.',
            accountTypeCryptoMargin: 'Borrow funds to trade with leverage.',
            accountTypeDefault:
                'The classification of the trading account provided by the broker.',
            accountTypeNameEcn: 'Electronic Communication Network (ECN)',
            accountTypeNameStandard: 'Standard',
            accountTypeNameClassic: 'Classic',
            accountTypeNameStp: 'Straight Through Processing (STP)',
            accountTypeNameCent: 'Cent',
            accountTypeNameCash: 'Cash',
            accountTypeNameMargin: 'Margin',
            accountTypeNameIsa: 'ISA',
            accountTypeNameSpot: 'Spot',
            accountTypeNameFutures: 'Futures',
        },
    },
    helpAndFeedback: {
        title: "We're here to help!",
        desc:
            'For website-related issues, bug reports, or detailed feedback, please send an email to <a' +
            " href='mailto:support@chaomarket.com'>support@chaomarket.com.</a>\n" +
            '<br/>For quick assistance, please click the <strong>"Chat with Chào Market"</strong> button in the' +
            ' bottom right corner of your' +
            ' screen.',
        endContent:
            '<strong>Thank you for your feedback and for choosing Chào Market !</strong>',
    },
    brandSlogan: {
        general: 'We prioritise helping you manage market risks.',
        clientPromise: `“We don’t focus on maximising your profit. <br />We prioritise helping you manage market risks.”`,
        auth: `We prioritise helping you<br />manage market risks.`,
    },
    lossRecovery: {
        title: 'Break-Even Point',
        description:
            'A tool to estimate the time and effort required to recover from a loss.',
    },
    orders: {
        title: 'Transaction History',
        description: 'Track all your transactions and purchases',
        searchPlaceholder: 'Search by transaction code, payment method...',
        results: 'transactions',
        noResults: 'No matching transactions found.',
        fetchError: 'Failed to load transaction history',
        status: {
            completed: 'Completed',
            pending: 'Pending',
            failed: 'Failed',
            cancelled: 'Cancelled',
        },
        filter: {
            all: 'All',
            starred: 'Starred',
        },
        col: {
            orderCode: 'Transaction Code',
            payment: 'Payment Method',
            amount: 'Amount',
            currency: 'Currency',
            status: 'Status',
            time: 'Date & Time',
        },
        dateRange: {
            title: 'Filter by date',
            from: 'From',
            to: 'To',
            clear: 'Clear filter',
            today: 'Today',
            last7: '7 days',
            last30: '30 days',
        },
        empty: {
            title: 'No transactions yet',
            description: 'Your transactions will appear here.',
        },
    },
    security: {
        title: 'Security',
        description: 'Manage password and account security settings',
        tabs: {
            devices: 'Activity',
            password: 'Password',
        },
        changePassword: {
            title: 'Change Password',
            description: 'Update password to strengthen account security',
            currentPassword: 'Current password',
            newPassword: 'New password',
            confirmPassword: 'Confirm new password',
            cancel: 'Cancel',
            submit: 'Change Password',
            success: 'Password has been changed successfully!',
            error: 'Failed to change password',
            connectionError: 'Connection error',
        },
        validation: {
            currentRequired: 'Please enter your current password',
            newMinLength: 'At least 8 characters',
            newUppercase: 'At least 1 uppercase letter (A-Z)',
            newLowercase: 'At least 1 lowercase letter (a-z)',
            newNumber: 'At least 1 number (0-9)',
            newSpecial: 'At least 1 special character (!@#$...)',
            confirmRequired: 'Please confirm your password',
            confirmMismatch: 'Passwords do not match',
        },
        otp: {
            title: 'Verify password change',
            description: 'A 6-digit verification code has been sent to',
            cancel: 'Cancel',
            confirm: 'Confirm',
            sendError: 'Could not send verification code',
            lengthError: 'Please enter all 6 digits',
            invalidCode: 'Invalid or expired OTP code',
        },
        accountSecurity: {
            title: 'Account Security',
            devices: 'Logged-in Devices',
            devicesDescription: 'View and manage your login sessions',
            twoFactor: 'Two-Factor Authentication (2FA)',
            twoFactorDescription: 'Protect your account with an authenticator app',
        },
        auditLog: {
            title: 'Recent Activity',
            empty: 'No activity recorded yet',
            actions: {
                login: 'Login',
                register: 'Registration',
                password_change: 'Password change',
                password_reset: 'Password reset',
                password_reset_request: 'Password reset request',
                profile_update: 'Profile update',
                otp_send: 'OTP sent',
                otp_verify: 'OTP verified',
                device_revoked: 'Device session revoked',
                change_email_otp_sent: 'Email change OTP sent',
                email_changed: 'Email changed',
                login_verification_enabled: 'Login verification enabled',
                login_verification_disabled: 'Login verification disabled',
            },
            showMore: 'Show {count} more',
            showLess: 'Show less',
        },
    },
    devices: {
        title: 'Logged-in Devices',
        description: 'Manage login sessions and connected devices',
        back: 'Go back',
        current: 'Current',
        unknown: 'Unknown',
        empty: {
            title: 'No device data yet',
            description: 'Data will be displayed once the system collects device information.',
        },
        time: {
            justNow: 'Just now',
        },
        detail: {
            ip: 'IP Address',
            location: 'Location',
            firstLogin: 'First login',
            lastActive: 'Last active',
        },
        revoke: 'Log out',
        revokeDialog: {
            title: 'Log out device',
            description: 'The login session will be revoked on',
            cancel: 'Cancel',
            confirm: 'Log out',
        },
    },
    twoFactor: {
        title: 'Two-Factor Authentication (2FA)',
        back: 'Go back',
        status: {
            disabled: 'Authenticator App',
            disabledDescription: 'Not Enabled — use Google Authenticator or Authy to generate verification codes.',
            enabled: 'Authenticator App',
            enabledDescription: 'Enabled — protected with codes from your authenticator app.',
        },
        setup: {
            enable: 'Not Enabled',
            scanQr: 'Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)',
            manualEntry: 'Or enter the code manually:',
            continue: 'Continue →',
            enterCode: 'Enter the 6-digit code from your authenticator app to confirm.',
            back: '← Go back',
            confirm: 'Confirm',
            qrError: 'Could not generate QR code',
            codeLength: 'Code must be 6 digits',
            invalidCode: 'Invalid code',
            verifyError: 'Verification error',
        },
        backup: {
            success: '2FA has been enabled successfully!',
            saveNote: 'Save the backup codes below. Each code can only be used once.',
            copy: 'Copy',
            download: 'Download',
            done: 'Done',
        },
        disable: {
            button: 'Enabled',
            title: 'Disable Two-Factor Authentication',
            description: 'Disabling 2FA will reduce account security.',
            cancel: 'Cancel',
            confirm: 'Confirm disable',
        },
    },
    loginVerification: {
        title: 'Email Login Verification',
        disabledDescription: 'Not Enabled — send OTP to your email on every login.',
        enabledDescription: 'Enabled — OTP via email required on every login.',
        enabled: 'Not Enabled',
        disabled: 'Enabled',
        otp: {
            enableTitle: 'Enable Login Verification',
            enableDescription: 'Confirm to enable email verification on every login. OTP sent to',
            disableTitle: 'Disable Login Verification',
            disableDescription: 'Confirm to disable email verification on login. OTP sent to',
            cancel: 'Cancel',
            confirm: 'Confirm',
        },
    },
    privacyPage: {
        title: 'Privacy',
        description: 'Manage your personal data and sign-in methods',
        signInMethods: {
            title: 'Sign-in Methods',
            description: 'Sign-in methods linked to your account.',
            emailPassword: 'Email & Password',
            loginWith: 'Sign in with',
            linked: 'Linked',
            setup: 'Set up',
            notSetup: 'Not set up',
            noMethods: 'No sign-in methods found',
        },
        yourData: {
            title: 'Your Data',
            description: 'Summary of personal data stored in Chào Account.',
            fullName: 'Full name',
            email: 'Email',
            phone: 'Phone number',
            memberSince: 'Member since',
            emailVerified: 'Email verification',
            verified: 'Verified',
            notVerified: 'Not verified',
        },
        exportData: {
            button: 'Download Personal Data',
            downloading: 'Downloading...',
        },
        deleteAccount: {
            title: 'Danger Zone',
            description: 'Deleting your account will permanently remove all your data from Chào Account. This action cannot be undone.',
            button: 'Request Account Deletion',
            dialogTitle: 'Confirm Account Deletion',
            dialogDescription: 'Are you sure you want to delete your account? All data will be permanently deleted after 30 days. During this time, you can contact',
            dialogCancel: 'Cancel',
            dialogConfirm: 'Confirm Deletion',
            dialogContact: 'to cancel the request.',
        },
        policyLink: {
            title: 'Privacy Policy',
            description: 'View the full privacy policy of Chào Enterprise.',
            button: 'View Policy →',
        },
    },
};
