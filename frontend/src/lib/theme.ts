export type Theme =
  | 'daylight'
  | 'dusk'
  | 'void'
  | 'paper'
  | 'contrast-light'
  | 'contrast-dark';

export interface ThemeMeta {
  id: Theme;
  label: string;
  category: 'Light' | 'Dark' | 'High Contrast';
  description: string;
  previewBg: string;
  previewAccent: string;
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'daylight',
    label: 'Daylight',
    category: 'Light',
    description: 'Default light theme with neutral surfaces and indigo accent',
    previewBg: '#FAFAFB',
    previewAccent: '#4F46E5',
  },
  {
    id: 'dusk',
    label: 'Dusk',
    category: 'Dark',
    description: 'Default dark theme with deep violet surfaces',
    previewBg: '#0E0E13',
    previewAccent: '#8B8CF8',
  },
  {
    id: 'void',
    label: 'Void',
    category: 'Dark',
    description: 'True black surfaces with minimal borders and bright accent',
    previewBg: '#000000',
    previewAccent: '#9A8CFF',
  },
  {
    id: 'paper',
    label: 'Paper',
    category: 'Light',
    description: 'Warm off-white surfaces, editorial ink text, and teal accent',
    previewBg: '#F7F3EC',
    previewAccent: '#0F766E',
  },
  {
    id: 'contrast-light',
    label: 'Contrast Light',
    category: 'High Contrast',
    description: 'AAA high contrast light theme with strong borders',
    previewBg: '#FFFFFF',
    previewAccent: '#0033CC',
  },
  {
    id: 'contrast-dark',
    label: 'Contrast Dark',
    category: 'High Contrast',
    description: 'AAA high contrast dark theme with yellow accent',
    previewBg: '#000000',
    previewAccent: '#FFD60A',
  },
];

const THEME_STORAGE_KEY = 'prism.theme';

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'daylight';
  
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (saved && THEMES.some(t => t.id === saved)) {
    return saved;
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dusk';
  }

  return 'daylight';
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors in restricted contexts
  }
}
