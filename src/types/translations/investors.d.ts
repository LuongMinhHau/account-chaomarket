interface TitleNode {
    title: string;
}

interface ItemNode extends TitleNode {
    description: string;
}

interface ChaoSocialNode {
    title: string;
    items: {
        facebook: TitleNode,
        tiktok: TitleNode,
        threads: TitleNode,
        youtube: TitleNode,
    };
}

interface ToolForInvestorNode {
    title: string;
    items: {
        currencyConverterCalc: ItemNode,
        pipCalculator: ItemNode,
        profitCalculator: ItemNode,
        pivotalCalculator: ItemNode,
        fiboCalculator: ItemNode,
        marginCalculator: ItemNode,
        investmentCalculator: ItemNode,
    };
}

export interface Investors {
    title: string;
    items: {
        chaoAnnoucement: TitleNode;
        chaoSocial: ChaoSocialNode;
        toolForInvestor: ToolForInvestorNode;
    };
}