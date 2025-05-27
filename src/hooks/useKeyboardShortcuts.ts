import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcut {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[] = []) => {
  const router = useRouter();

  // Default global shortcuts
  const defaultShortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      metaKey: true,
      action: () => router.push('/search'),
      description: 'Open search'
    },
    {
      key: 'k',
      ctrlKey: true,
      action: () => router.push('/search'),
      description: 'Open search'
    },
    {
      key: 'b',
      metaKey: true,
      action: () => router.push('/boards'),
      description: 'Go to boards'
    },
    {
      key: 'b',
      ctrlKey: true,
      action: () => router.push('/boards'),
      description: 'Go to boards'
    }
  ];

  const allShortcuts = [...defaultShortcuts, ...shortcuts];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      for (const shortcut of allShortcuts) {
        const metaMatch = shortcut.metaKey ? event.metaKey : !event.metaKey;
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey;

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          metaMatch &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [allShortcuts]);

  return { shortcuts: allShortcuts };
};

// Hook for displaying keyboard shortcuts help
export const useKeyboardShortcutsHelp = () => {
  const { shortcuts } = useKeyboardShortcuts();

  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    
    if (shortcut.metaKey) parts.push('⌘');
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.shiftKey) parts.push('⇧');
    if (shortcut.altKey) parts.push('⌥');
    
    parts.push(shortcut.key.toUpperCase());
    
    return parts.join(' + ');
  };

  return {
    shortcuts: shortcuts.map(shortcut => ({
      ...shortcut,
      formatted: formatShortcut(shortcut)
    }))
  };
}; 