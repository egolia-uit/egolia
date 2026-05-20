'use client';

/* eslint-disable better-tailwindcss/no-unknown-classes */

import 'plyr/dist/plyr.css';

import type Plyr from 'plyr';
import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  options?: Plyr.Options;
}

export function VideoPlayer({ src, poster, options }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    let player: Plyr;

    const init = async () => {
      const PlyrClass = (await import('plyr')).default;
      player = new PlyrClass(videoRef.current!, {
        ...options,
      });
      playerRef.current = player;
    };

    init();

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [options]);

  return (
    <div className="overflow-hidden rounded-lg border bg-black shadow-lg">
      <video
        ref={videoRef}
        className="plyr-react plyr"
        playsInline
        controls
        data-poster={poster}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
