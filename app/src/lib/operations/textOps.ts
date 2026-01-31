/**
 * Text editor operations
 * Handles text manipulation, link insertion, and word detection
 */

export interface WordSelection {
  readonly word: string;
  readonly start: number;
  readonly end: number;
}

/**
 * Get word at cursor position in textarea
 * Handles both selected text and cursor-based word detection
 * 
 * @param textarea - The textarea element
 * @returns Word selection info or null if no word found
 */
export function getWordAtCursor(textarea: HTMLTextAreaElement): WordSelection | null {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;

  if (start !== end) {
    // Text is selected, use the selection
    return {
      word: text.substring(start, end).trim(),
      start,
      end
    };
  }

  // Find word boundaries around cursor position
  let wordStart = start;
  while (wordStart > 0 && /\w/.test(text[wordStart - 1])) {
    wordStart--;
  }

  let wordEnd = start;
  while (wordEnd < text.length && /\w/.test(text[wordEnd])) {
    wordEnd++;
  }

  if (wordStart === wordEnd) {
    return null; // No word found
  }

  return {
    word: text.substring(wordStart, wordEnd),
    start: wordStart,
    end: wordEnd
  };
}

/**
 * Check if text is already linked (wrapped in brackets)
 * 
 * @param content - The content to search in
 * @param text - The text to check for
 * @returns True if text is already linked
 */
export function isAlreadyLinked(content: string, text: string): boolean {
  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\[${escapedText}\\]`, 'i');
  return pattern.test(content);
}

/**
 * Insert wiki link at cursor position
 * 
 * @param textarea - The textarea element
 * @param text - The text to wrap in wiki link syntax
 * @returns Updated text content
 */
export function insertWikiLink(textarea: HTMLTextAreaElement, text: string): string {
  const { selectionStart, selectionEnd, value } = textarea;
  return value.substring(0, selectionStart) + `[${text}]` + value.substring(selectionEnd);
}

/**
 * Get selected text from textarea
 * 
 * @param textarea - The textarea element
 * @returns Selected text or null if nothing selected
 */
export function getSelectedText(textarea: HTMLTextAreaElement): string | null {
  const { selectionStart, selectionEnd, value } = textarea;
  if (selectionStart === selectionEnd) {
    return null;
  }
  return value.substring(selectionStart, selectionEnd);
}

/**
 * Replace selected text in textarea
 * 
 * @param textarea - The textarea element
 * @param replacement - The replacement text
 * @returns Updated text content
 */
export function replaceSelectedText(textarea: HTMLTextAreaElement, replacement: string): string {
  const { selectionStart, selectionEnd, value } = textarea;
  return value.substring(0, selectionStart) + replacement + value.substring(selectionEnd);
}

/**
 * Insert text at cursor position
 * 
 * @param textarea - The textarea element
 * @param text - The text to insert
 * @returns Updated text content
 */
export function insertTextAtCursor(textarea: HTMLTextAreaElement, text: string): string {
  const { selectionStart, value } = textarea;
  return value.substring(0, selectionStart) + text + value.substring(selectionStart);
}
