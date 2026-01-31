/**
 * Get word at cursor position in textarea
 */
export function getWordAtCursor(textarea: HTMLTextAreaElement): { word: string; start: number; end: number } | null {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;

  if (start !== end) {
    // Selection exists
    return {
      word: text.substring(start, end).trim(),
      start,
      end
    };
  }

  // Find word boundaries around cursor
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
 * Check if text is already linked
 */
export function isAlreadyLinked(content: string, text: string): boolean {
  return content.toLowerCase().includes(`[${text.toLowerCase()}]`);
}

/**
 * Insert wiki link at cursor position
 */
export function insertWikiLink(textarea: HTMLTextAreaElement, text: string): string {
  const { selectionStart, selectionEnd, value } = textarea;
  return value.substring(0, selectionStart) + `[${text}]` + value.substring(selectionEnd);
}
