export interface DisclaimerTranslation {
    title: string;
    sections: {
        title: string;
        content: string;
    }[];
    conclusion: string;
    agreeButton: string;
    alreadyAgreeButton: string;
    leaveButton: string;
    triggerDialogContent: string;
}
