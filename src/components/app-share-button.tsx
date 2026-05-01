'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PiShareFat } from 'react-icons/pi';
import { T } from './app-translate';

interface AppShareButtonProps {
    slug?: string;
}

export default function AppShareButton({ slug }: AppShareButtonProps) {
    const handleShare = async () => {
        try {
            const currentUrl =
                window.location.origin +
                window.location.pathname +
                window.location.search;
            const shareUrl =
                slug === undefined ? currentUrl : `${window.location.origin}${window.location.pathname}/${slug}`;

            await navigator.clipboard.writeText(shareUrl);

            toast.info('Link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <Button
            variant="ghost"
            className="bg-neutral-200/70! dark:bg-white/[0.06]! hover:bg-neutral-300/70! dark:hover:bg-white/[0.09]! shadow-sm border-[var(--brand-grey)] border text-brand-text transition-all! duration-300 ease-in-out rounded-3xl text-xs font-normal gap-1 px-2.5 py-0.5 h-auto"
            onClick={handleShare}
        >
            <PiShareFat className={'size-3'} />
            <T keyName={'common.share'} />
        </Button>
    );
}
