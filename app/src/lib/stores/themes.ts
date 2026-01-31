import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ColorScheme = {
  mainBackground: string;
  surfaceBackground: string;
  deepBackground: string;
  hoverBackground: string;
  mainText: string;
  secondaryText: string;
  mutedText: string;
  borderLine: string;
  primaryAction: string;
  primaryActionHover: string;
  primaryActionLight: string;
  errorRed: string;
  errorRedHover: string;
  successGreen: string;
  warningOrange: string;
  folderIcon: string;
  pageIcon: string;
  expandToggle: string;
  linkInTree: string;
  linkExplicit: string;
  linkBackref: string;
  sidebarLabel: string;
  pageTitle: string;
};

export const DEFAULT_DARK_COLORS: ColorScheme = {
  mainBackground: '#1a1a1a',
  surfaceBackground: '#242424',
  deepBackground: '#2d2d2d',
  hoverBackground: '#333333',
  mainText: '#e0e0e0',
  secondaryText: '#a0a0a0',
  mutedText: '#808080',
  borderLine: '#404040',
  primaryAction: '#6366f1',
  primaryActionHover: '#4f46e5',
  primaryActionLight: '#818cf8',
  errorRed: '#ef4444',
  errorRedHover: '#dc2626',
  successGreen: '#10b981',
  warningOrange: '#f59e0b',
  folderIcon: '#f5f5f5',
  pageIcon: '#fbbf24',
  expandToggle: '#fbbf24',
  linkInTree: '#818cf8',
  linkExplicit: '#818cf8',
  linkBackref: '#a0a0a0',
  sidebarLabel: '#f5f5f5',
  pageTitle: '#b0b0b0'
};

export const DEFAULT_LIGHT_COLORS: ColorScheme = {
  mainBackground: '#ffffff',
  surfaceBackground: '#f8f8f8',
  deepBackground: '#f0f0f0',
  hoverBackground: '#e8e8e8',
  mainText: '#1a1a1a',
  secondaryText: '#666666',
  mutedText: '#999999',
  borderLine: '#e0e0e0',
  primaryAction: '#6366f1',
  primaryActionHover: '#4f46e5',
  primaryActionLight: '#818cf8',
  errorRed: '#ef4444',
  errorRedHover: '#dc2626',
  successGreen: '#10b981',
  warningOrange: '#f59e0b',
  folderIcon: '#333333',
  pageIcon: '#0066cc',
  expandToggle: '#0066cc',
  linkInTree: '#0066cc',
  linkExplicit: '#0066cc',
  linkBackref: '#666666',
  pageTitle: '#666666',
  sidebarLabel: '#333333'
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
