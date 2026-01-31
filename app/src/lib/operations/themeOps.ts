import { theme, type ColorScheme } from '$lib/stores/themes';
import { get } from 'svelte/store';

/**
 * Apply colors to the document and update theme store
 */
export function applyThemeColors(colors: ColorScheme) {
  theme.applyColors(colors);
}

/**
 * Reset theme to defaults
 */
export function resetThemeToDefaults() {
  theme.resetToDefaults();
}

/**
 * Update theme colors for a specific mode (dark/light)
 */
export function updateThemeColors(isDark: boolean, colors: Partial<ColorScheme>) {
  theme.updateColors(isDark, colors);
}

/**
 * Save theme to localStorage
 */
export function saveThemeToStorage() {
  const themeState = get(theme);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('wiki-dark-colors', JSON.stringify(themeState.darkColors));
    localStorage.setItem('wiki-light-colors', JSON.stringify(themeState.lightColors));
  }
}

/**
 * Toggle between dark and light mode
 */
export function toggleDarkMode() {
  theme.toggleDarkMode();
}
