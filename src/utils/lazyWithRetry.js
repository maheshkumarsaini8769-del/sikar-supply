import { lazy } from 'react';

/**
 * Wraps dynamic component imports to automatically reload the page
 * when a stale deployment chunk fails to load.
 */
export function lazyWithRetry(componentImport) {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.warn('Stale chunk detected. Refreshing for latest deployment assets...', error);
      const lastReload = parseInt(window.sessionStorage.getItem('chunk_reload_time') || '0', 10);
      if (Date.now() - lastReload > 10000) {
        window.sessionStorage.setItem('chunk_reload_time', Date.now().toString());
        window.location.reload();
        return { default: () => null };
      }
      throw error;
    }
  });
}

export default lazyWithRetry;
