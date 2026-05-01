import Image from 'next/image';
import { NewsEventBannerImg } from '@image/index';

export default function NewsEventsBanner() {
    return (
        <Image
            src={NewsEventBannerImg}
            alt={'news-event-banner-image'}
            width={1920}
            height={1080}
            className="w-full h-auto"
        />
    );
}
