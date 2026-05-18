'use client';

import { useEffect, useRef } from 'react';

import { cn } from '#/components/lib/shadcn/utils';

type CourseVideoPlayerProps = {
  src: string;
  title?: string;
  poster?: string;
  className?: string;
};

function mediaTypeFromUrl(src: string) {
  const pathname = (() => {
    try {
      return new URL(src).pathname;
    } catch {
      return src;
    }
  })().toLowerCase();

  if (pathname.endsWith('.webm')) {
    return 'video/webm';
  }
  if (pathname.endsWith('.ogg') || pathname.endsWith('.ogv')) {
    return 'video/ogg';
  }
  return 'video/mp4';
}

export function CourseVideoPlayer({
  className,
  poster,
  src,
  title,
}: CourseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    let player: any;

    const init = async () => {
      const Plyr = (await import('plyr')).default;
      player = new Plyr(videoRef.current!, {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'duration',
          'mute',
          'volume',
          'settings',
          'pip',
          'fullscreen',
        ],
        ratio: '16:9',
        settings: ['speed'],
        tooltips: {
          controls: true,
          seek: true,
        },
      });
    };

    init();

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [src]);

  return (
    <div
      className={cn(
        `
          overflow-hidden rounded-xl bg-slate-950 shadow-nm-flat
          [--plyr-color-main:var(--color-primary)]
        `,
        className
      )}
    >
      <video
        key={src}
        ref={videoRef}
        aria-label={title}
        controls
        playsInline
        crossOrigin="anonymous"
        preload="metadata"
        data-poster={poster}
      >
        <source src={src} type={mediaTypeFromUrl(src)} />
      </video>
    </div>
  );
}
