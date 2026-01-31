export type PageHistory = {
  pageHistory: string[];
  historyIndex: number;
};

export function createPageHistory(initialPage: string = 'Home'): PageHistory {
  return {
    pageHistory: [initialPage],
    historyIndex: 0
  };
}

export function canGoBack(history: PageHistory): boolean {
  return history.historyIndex > 0;
}

export function canGoForward(history: PageHistory): boolean {
  return history.historyIndex < history.pageHistory.length - 1;
}

export function goBack(history: PageHistory): string | null {
  if (canGoBack(history)) {
    history.historyIndex--;
    return history.pageHistory[history.historyIndex];
  }
  return null;
}

export function goForward(history: PageHistory): string | null {
  if (canGoForward(history)) {
    history.historyIndex++;
    return history.pageHistory[history.historyIndex];
  }
  return null;
}

export function addToHistory(history: PageHistory, pageTitle: string) {
  // Remove any forward history when adding a new page
  if (history.historyIndex < history.pageHistory.length - 1) {
    history.pageHistory = history.pageHistory.slice(0, history.historyIndex + 1);
  }
  
  // Only add if it's different from the current page
  if (history.pageHistory[history.historyIndex] !== pageTitle) {
    history.pageHistory.push(pageTitle);
    history.historyIndex = history.pageHistory.length - 1;
  }
}

export function getCurrentPage(history: PageHistory): string {
  return history.pageHistory[history.historyIndex];
}
