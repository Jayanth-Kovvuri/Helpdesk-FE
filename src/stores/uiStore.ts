import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type Locale = 'en' | 'es' | 'ar';
export type Direction = 'ltr' | 'rtl';

const RTL_LOCALES: ReadonlySet<Locale> = new Set(['ar']);

function directionForLocale(locale: Locale): Direction {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}

type UiState = {
  locale: Locale;
  direction: Direction;
  sidebarOpen: boolean;
  setLocale: (locale: Locale) => void;
  setSidebarOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>()(
  immer((set) => ({
    locale: 'en',
    direction: 'ltr',
    sidebarOpen: true,
    setLocale: (locale) => {
      set((state) => {
        state.locale = locale;
        state.direction = directionForLocale(locale);
      });
    },
    setSidebarOpen: (open) => {
      set((state) => {
        state.sidebarOpen = open;
      });
    },
  })),
);
