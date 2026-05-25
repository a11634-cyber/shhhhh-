import { create } from 'zustand';
import { AppSettings } from '../../shared/types';

type AppStore = {
  theme: 'dark' | 'light' | 'high-contrast';
  fontSize: number;
  tabSize: number;
  settings: Partial<AppSettings>;
  setTheme: (theme: AppStore['theme']) => void;
  setFontSize: (fontSize: number) => void;
  setTabSize: (tabSize: number) => void;
  setSettings: (settings: Partial<AppSettings>) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  theme: 'dark',
  fontSize: 14,
  tabSize: 2,
  settings: {},
  setTheme: (theme) => set({ theme }),
  setFontSize: (fontSize) => set({ fontSize }),
  setTabSize: (tabSize) => set({ tabSize }),
  setSettings: (settings) => set({ settings })
}));
