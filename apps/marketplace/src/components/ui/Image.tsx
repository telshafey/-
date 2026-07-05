"use client";

import React, { useState, useEffect } from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { cn } from '@alrehla/utils/utils';
import { ImageIcon } from 'lucide-react';

interface ImageProps extends Omit<NextImageProps, 'src'> {
    src?: string | null;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none';
    fallbackText?: string;
    showSkeleton?: boolean;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, className, objectFit = 'cover', fallbackText, showSkeleton = true, onLoad, onError, ...props }, ref) => {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    const [displaySrc, setDisplaySrc] = useState<string>('');

    const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=';

    useEffect(() => {
        setStatus('loading');
        
        if (!src) {
            setStatus('error');
            setDisplaySrc(DEFAULT_PLACEHOLDER);
            return;
        }

        setDisplaySrc(src);
    }, [src]);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setStatus('loaded');
        if (onLoad) onLoad(e as any);
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        if (displaySrc !== DEFAULT_PLACEHOLDER) {
            setStatus('error');
            setDisplaySrc(DEFAULT_PLACEHOLDER);
        }
        if (onError) onError(e as any);
    };

    return (
      <div className={cn("relative overflow-hidden bg-gray-50 flex items-center justify-center isolate", className)}>
        {showSkeleton && (
          <div 
            className={cn(
                "absolute inset-0 bg-gray-200 animate-pulse z-10 transition-opacity duration-500",
                status === 'loaded' ? 'opacity-0' : 'opacity-100'
            )} 
          />
        )}
        
        {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30 z-0 p-2">
                <ImageIcon size={24} />
                {fallbackText && <span className="text-[9px] font-bold uppercase tracking-widest mt-1 text-center">{fallbackText}</span>}
            </div>
        )}

        <NextImage
          ref={ref as any}
          src={displaySrc || DEFAULT_PLACEHOLDER}
          alt={alt || 'image'}
          fill
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-500 ease-in-out relative z-10",
            objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : 'object-fill',
            status === 'loaded' ? "opacity-100" : "opacity-0"
          )}
          {...(props as any)}
        />
      </div>
    );
  }
);
Image.displayName = 'Image';

export default Image;
