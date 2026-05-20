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
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    let cancelled = false;

    const init = async () => {
      const Plyr = (await import('plyr')).default;
      if (cancelled) {
        return;
      }
      playerRef.current = new Plyr(video, {
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

    void init();

    return () => {
      cancelled = true;
      const player = playerRef.current;
      playerRef.current = null;
      if (player && typeof player.destroy === 'function') {
        try {
          player.destroy();
        } catch {
          // Ignore teardown races in dev strict mode / route transitions.
        }
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const nextType = mediaTypeFromUrl(src);
    const player = playerRef.current;

    if (player) {
      try {
        player.source = {
          type: 'video',
          sources: [{ src, type: nextType }],
        };
      } catch {
        video.src = src;
        video.load();
      }
    } else {
      video.src = src;
      video.load();
    }

    if (poster) {
      video.poster = poster;
      video.setAttribute('data-poster', poster);
    } else {
      video.removeAttribute('poster');
      video.removeAttribute('data-poster');
    }
  }, [poster, src]);

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
        ref={videoRef}
        aria-label={title}
        controls
        playsInline
        crossOrigin="anonymous"
        preload="metadata"
        src={src}
        data-poster={poster}
      />
    </div>
  );
}
