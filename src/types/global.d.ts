import React from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'gecko-coin-market-ticker-list-widget': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & {
                    locale?: string;
                    'dark-mode'?: string;
                    'coin-id'?: string;
                    'initial-currency'?: string;
                },
                HTMLElement
            >;
        }
    }
}

export {};
