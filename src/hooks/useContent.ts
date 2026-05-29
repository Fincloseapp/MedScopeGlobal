import { useEffect, useState } from 'react';
import { getContent, scheduleContentRefresh } from '../content/aiContentEngine';
import type { ContentQuery, MedicalContentItem } from '../types/content';

interface ContentState {
  items: MedicalContentItem[];
  loading: boolean;
  error?: string;
}

export function useContent(query: ContentQuery): ContentState {
  const [state, setState] = useState<ContentState>({ items: [], loading: true });

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: undefined }));

    getContent(query)
      .then((items) => {
        if (active) setState({ items, loading: false });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            items: [],
            loading: false,
            error: error instanceof Error ? error.message : 'Unable to load content',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [JSON.stringify(query)]);

  return state;
}

export function useScheduledContentRefresh(): void {
  useEffect(() => scheduleContentRefresh(), []);
}
