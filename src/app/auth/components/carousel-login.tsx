'use client';
import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
const loginThemes = [
    '/img/login-theme.png',
    '/img/login-theme-2.png',
    '/img/login-theme-3.png',
];
import React, { useEffect, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { useI18n } from '@/context/i18n/context';
import { sanitizeHtml } from '@/lib/sanitize';

export default function CarouselLogin() {
    const plugin = React.useRef(Autoplay({ delay: 2000, playOnInit: true }));
    const pluginInstance = plugin.current;
    const plugins = React.useMemo(() => [pluginInstance], [pluginInstance]);
    const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { t } = useI18n();

    const scrollToIndex = (index: number) => {
        if (carouselApi) {
            carouselApi.scrollTo(index);
        }
    };

    const handleMouseEnter = React.useCallback(() => {
        pluginInstance.stop();
    }, [pluginInstance]);

    const handleMouseLeave = React.useCallback(() => {
        pluginInstance.play();
    }, [pluginInstance]);

    useEffect(() => {
        if (!carouselApi) return;

        const updateCarouselState = () => {
            setCurrentIndex(carouselApi.selectedScrollSnap());
        };

        updateCarouselState();

        carouselApi.on('select', updateCarouselState);

        return () => {
            carouselApi.off('select', updateCarouselState); // Clean up on unmount
        };
    }, [carouselApi]);

    return (
        <Carousel
            plugins={plugins}
            setApi={setCarouselApi}
            className="w-full overflow-hidden h-full relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <CarouselContent>
                {loginThemes.map((theme, index) => (
                    <CarouselItem key={index} className="pl-0 ">
                        <Card className="h-full w-auto py-0">
                            <CardContent className="relative flex h-full w-full items-center justify-center p-0">
                                <Image
                                    width={1920}
                                    height={1080}
                                    src={theme}
                                    alt={`Brand visual ${index + 1}`}
                                    className="object-cover h-full w-full"
                                    unoptimized
                                />
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <div className="w-full absolute z-2 bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="w-full flex items-center justify-center gap-4 relative">
                    {loginThemes.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollToIndex(index)}
                            className={`w-1/7 h-1.5 cursor-pointer rounded-full  ${
                                currentIndex === index
                                    ? 'bg-[var(--brand-color)]'
                                    : 'bg-white'
                            }`}
                        />
                    ))}
                    <h2
                        className="absolute text-3xl top-0 font-bold italic transform -translate-y-[calc(100%+50%)] text-center"
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(t('brandSlogan.auth')),
                        }}
                    />
                </div>
            </div>
            <div className="text-carousel-overlay z-1 rounded-3xl overflow-hidden  pointer-events-none absolute top-0 left-0 w-full h-full flex items-center justify-center" />
        </Carousel>
    );
}
