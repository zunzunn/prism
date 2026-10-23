import { describe, it, expect } from 'vitest';

interface ThemeColorTokens {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  textMuted: string;
  accent: string;
  accentFg: string;
  isAAA?: boolean;
}

const THEME_TOKENS: Record<string, ThemeColorTokens> = {
  daylight: {
    bg: '#FAFAFB',
    surface: '#FFFFFF',
    surface2: '#F4F4F6',
    text: '#16161D',
    textMuted: '#5B5B6B',
    accent: '#4F46E5',
    accentFg: '#FFFFFF',
  },
  dusk: {
    bg: '#0E0E13',
    surface: '#15151C',
    surface2: '#1C1C25',
    text: '#ECECF3',
    textMuted: '#9A9AAE',
    accent: '#8B8CF8',
    accentFg: '#0E0E13',
  },
  void: {
    bg: '#000000',
    surface: '#0A0A0D',
    surface2: '#111116',
    text: '#F2F2F7',
    textMuted: '#9C9CB0',
    accent: '#9A8CFF',
    accentFg: '#000000',
  },
  paper: {
    bg: '#F7F3EC',
    surface: '#FFFDF8',
    surface2: '#EFE9DE',
    text: '#1C1A17',
    textMuted: '#5E574B',
    accent: '#0F766E',
    accentFg: '#FFFFFF',
  },
  'contrast-light': {
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    surface2: '#F0F0F0',
    text: '#000000',
    textMuted: '#3D3D3D',
    accent: '#0033CC',
    accentFg: '#FFFFFF',
    isAAA: true,
  },
  'contrast-dark': {
    bg: '#000000',
    surface: '#0D0D0D',
    surface2: '#1A1A1A',
    text: '#FFFFFF',
    textMuted: '#D0D0D0',
    accent: '#FFD60A',
    accentFg: '#000000',
    isAAA: true,
  },
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

function getRelativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Design Tokens Contrast Verification (WCAG 2.2 AA / AAA)', () => {
  Object.entries(THEME_TOKENS).forEach(([themeName, tokens]) => {
    describe(`Theme: ${themeName}`, () => {
      const minTextRatio = tokens.isAAA ? 7.0 : 4.5;

      it(`ensures --text on --surface meets ratio >= ${minTextRatio}:1`, () => {
        const ratio = getContrastRatio(tokens.text, tokens.surface);
        expect(ratio).toBeGreaterThanOrEqual(minTextRatio);
      });

      it(`ensures --text on --bg meets ratio >= ${minTextRatio}:1`, () => {
        const ratio = getContrastRatio(tokens.text, tokens.bg);
        expect(ratio).toBeGreaterThanOrEqual(minTextRatio);
      });

      it(`ensures --text on --surface-2 meets ratio >= ${minTextRatio}:1`, () => {
        const ratio = getContrastRatio(tokens.text, tokens.surface2);
        expect(ratio).toBeGreaterThanOrEqual(minTextRatio);
      });

      it(`ensures --text-muted on --surface meets ratio >= ${minTextRatio}:1`, () => {
        const ratio = getContrastRatio(tokens.textMuted, tokens.surface);
        expect(ratio).toBeGreaterThanOrEqual(minTextRatio);
      });

      it('ensures --accent-fg on --accent meets ratio >= 4.5:1', () => {
        const ratio = getContrastRatio(tokens.accentFg, tokens.accent);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    });
  });
});
