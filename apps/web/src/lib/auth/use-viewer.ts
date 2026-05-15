'use client';

import { useEffect, useState } from 'react';

import { type Viewer, getViewer } from './roles';

type ViewerState = {
  viewer: Viewer | null;
  loading: boolean;
};

export function useViewer() {
  const [state, setState] = useState<ViewerState>({
    viewer: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    getViewer()
      .then((viewer) => {
        if (mounted) {
          setState({ viewer, loading: false });
        }
      })
      .catch(() => {
        if (mounted) {
          setState({ viewer: null, loading: false });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
