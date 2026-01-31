import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ColorScheme = {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgHover: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  borderColor: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  danger: string;
  dangerHover: string;
  success: string;
  warning: string;
  treeFolder: string;
  treePage: string;
  treeToggle: string;
  treeLink: string;
  sourceLink: string;
  proxyLink: string;
};

export const DEFAULT_DARK_COLORS: ColorScheme = {
  bgPrimary: '#1a1a1a',
  bgSecondary: '#242424',
  bgTertiary: '#2d2d2d',
  bgHover: '#333333',
  textPrimary: '#e0e0e0',
  textSecondary: '#a0a0a0',
  textTertiary: '#808080',
  borderColor: '#404040',
  accent: '#6366f1',
  accentHover: '#4f46e5',
  accentLight: '#818cf8',
  danger: '#ef4444',
  dangerHover: '#dc2626',
  success: '#10b981',
  warning: '#f59e0b',
  treeFolder: '#f5f5f5',
  treePage: '#fbbf24',
  treeToggle: '#fbbf24',
  treeLink: '#818cf8',
  sourceLink: '#818cf8',
  proxyLink: '#a0a0a0'
};

export const DEFAULT_LIGHT_COLORS: ColorScheme = {
  bgPrimary: '#ffffff',
  bgSecondary: '#f8f8f8',
  bgTertiary: '#f0f0f0',
  bgHover: '#e8e8e8',
  textPrimary: '#1a1a1a',
  textSecondary: '#666666',
  textTertiary: '#999999',
  borderColor: '#e0e0e0',
  accent: '#6366f1',
  accentHover: '#4f46e5',
  accentLight: '#818cf8',
  danger: '#ef4444',
  dangerHover: '#dc2626',
  success: '#10b981',
  warning: '#f59e0b',
  treeFolder: '#333333',
  treePage: '#0066cc',
  treeToggle: '#0066cc',
  treeLink: '#0066cc',
  sourceLink: '#0066cc',
  proxyLink: '#666666'
};

function createThemeStore() {
  const { subscribe, set, update } = writable({
    isDarkMode: true,
    darkColors: { ...DEFAULT_DARK_COLORS },
    lightColors: { ...DEFAULT_LIGHT_COLORS }
  });

  function loadFromStorage() {
    if (!browser) return;
    
    const savedDark = localStorage.getItem('wiki-dark-colors');
    const savedLight = localStorage.getItem('wiki-light-colors');
    
    update(state => ({
      ...state,
      darkColors: savedDark ? { ...DEFAULT_DARK_COLORS, ...JSON.parse(savedDark) } : { ...DEFAULT_DARK_COLORS },
      lightColors: savedLight ? { ...DEFAULT_LIGHT_COLORS, ...JSON.parse(savedLight) } : { ...DEFAULT_LIGHT_COLORS }
    }));
  }

  function saveToStorage() {
    if (!browser) return;
    subscribe(state => {
      localStorage.setItem('wiki-dark-colors', JSON.stringify(state.darkColors));
      localStorage.setItem('wiki-light-colors', JSON.stringify(state.lightColors));
    });
  }

  function toggleDarkMode() {
    update(state => ({
      ...state,
      isDarkMode: !state.isDarkMode
    }));
  }

  function resetToDefaults() {
    update(state => ({
      ...state,
      darkColors: { ...DEFAULT_DARK_COLORS },
      lightColors: { ...DEFAULT_LIGHT_COLORS }
    }));
    saveToStorage();
  }

  function updateColors(isDark: boolean, colors: Partial<ColorScheme>) {
    update(state => {
      if (isDark) {
        return {
          ...state,
          darkColors: { ...state.darkColors, ...colors }
        };
      } else {
        return {
          ...state,
          lightColors: { ...state.lightColors, ...colors }
        };
      }
    });
  }

  function applyColors(colors: ColorScheme) {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });
  }

  return {
    subscribe,
    set,
    update,
    loadFromStorage,
    saveToStorage,
    toggleDarkMode,
    resetToDefaults,
    updateColors,
    applyColors
  };
}

export const theme = createThemeStore();
