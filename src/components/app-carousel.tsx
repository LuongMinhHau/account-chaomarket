// components/reusable-carousel.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { StaticImageData } from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Define the item type
export interface CarouselItemProps {
    id: string;
    imageUrl: string | StaticImageData;
    link?: string;
    alt?: string;
    title?: string;
    description?: string;
}

interface ReusableCarouselProps {
    items: CarouselItemProps[];
    autoPlay?: boolean;
    autoPlayDelay?: number;
    showIndicators?: boolean;
    showNavigation?: boolean;
    className?: string;
    imageClassName?: string;
    indicatorClassName?: string;
    indicatorActiveClassName?: string;
    indicatorInactiveClassName?: string;
    navigationButtonClassName?: string;
    keyValue?: string;
}

export default function AppCarousel({
    items,
    autoPlay = true,
    autoPlayDelay = 3000,
    showIndicators = true,
    showNavigation = false,
    className = '',
    imageClassName = '',
    indicatorClassName = '',
    indicatorActiveClassName = 'bg-[var(--brand-color)]',
    indicatorInactiveClassName = 'bg-white',
    navigationButtonClassName = 'bg-black/30 hover:bg-black/50 text-white',
    keyValue,
}: ReusableCarouselProps) {
    const plugin = useRef(
        Autoplay({ delay: autoPlayDelay, playOnInit: autoPlay })
    );
    const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const scrollToIndex = (index: number) => {
        if (carouselApi) {
            carouselApi.scrollTo(index);
        }
    };

    const scrollPrev = () => {
        if (carouselApi) {
            carouselApi.scrollPrev();
        }
    };

    const scrollNext = () => {
        if (carouselApi) {
            carouselApi.scrollNext();
        }
    };

    useEffect(() => {
        if (!carouselApi) return;

        const updateCarouselState = () => {
            setCurrentIndex(carouselApi.selectedScrollSnap());
            setCanScrollPrev(carouselApi.canScrollPrev());
            setCanScrollNext(carouselApi.canScrollNext());
        };

        updateCarouselState();
        carouselApi.on('select', updateCarouselState);
        carouselApi.on('slidesInView', updateCarouselState);

        return () => {
            carouselApi.off('select', updateCarouselState);
            carouselApi.off('slidesInView', updateCarouselState);
        };
    }, [carouselApi]);

    return (
        <Carousel
            plugins={autoPlay ? [plugin.current] : []}
            setApi={setCarouselApi}
            className={`w-full overflow-hidden relative ${className}`}
            onMouseEnter={autoPlay && mounted ? plugin.current.stop : undefined}
            key={keyValue}
            onMouseLeave={autoPlay && mounted ? () => plugin.current.play() : undefined}
        >
            {showNavigation && (
                <>
                    <button
                        onClick={scrollPrev}
                        disabled={!canScrollPrev}
                        className={`absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full p-2 transition-all duration-300 ${navigationButtonClassName} ${!canScrollPrev
                            ? 'opacity-50 cursor-not-allowed'
                            : 'opacity-100'
                            }`}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={scrollNext}
                        disabled={!canScrollNext}
                        className={`absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full p-2 transition-all duration-300 ${navigationButtonClassName} ${!canScrollNext
                            ? 'opacity-50 cursor-not-allowed'
                            : 'opacity-100'
                            }`}
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </>
            )}

            <CarouselContent>
                {items.map((item, index) => (
                    <CarouselItem key={item.id} className="pl-0">
                        <Card className="h-full w-full py-0 border-0">
                            <CardContent className="relative flex h-full w-full items-center justify-center p-0">
                                {item.link ? (
                                    <Link
                                        href={item.link}
                                        className="w-full h-full block"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.imageUrl as string}
                                            alt={
                                                item.alt ||
                                                `Carousel item ${index + 1}`
                                            }
                                            className={`object-cover h-full w-full ${imageClassName}`}
                                        />
                                    </Link>
                                ) : (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={item.imageUrl as string}
                                        alt={
                                            item.alt ||
                                            `Carousel item ${index + 1}`
                                        }
                                        className={`object-cover h-full w-full ${imageClassName}`}
                                    />
                                )}
                                {(item.title || item.description) && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                                        {item.title && (
                                            <h3 className="text-xl font-bold mb-2">
                                                {item.title}
                                            </h3>
                                        )}
                                        {item.description && (
                                            <p className="text-sm">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>

            {showIndicators && items.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="flex items-center justify-center gap-2">
                        {items.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollToIndex(index)}
                                className={`w-3 h-3 cursor-pointer rounded-full transition-all duration-300 ${currentIndex === index
                                    ? `${indicatorActiveClassName}`
                                    : `${indicatorInactiveClassName}`
                                    } ${indicatorClassName}`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </Carousel>
    );
}
