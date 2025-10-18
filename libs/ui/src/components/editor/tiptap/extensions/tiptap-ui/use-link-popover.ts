'use client';

import * as React from 'react';
import type { Editor } from '@tiptap/react';

// --- Hooks ---
import { useTiptapEditor } from './use-tiptap-editor';

// --- Lib ---
import { isMarkInSchema, sanitizeUrl } from './tiptap-utils';

/**
 * Configuration for the link popover functionality
 */
export interface UseLinkPopoverConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Whether to hide the link popover when not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called when the link is set.
   */
  onSetLink?: () => void;
}

/**
 * Configuration for the link handler functionality
 */
export interface LinkHandlerProps {
  /**
   * The Tiptap editor instance.
   */
  editor: Editor | null;
  /**
   * Callback function called when the link is set.
   */
  onSetLink?: () => void;
}

/**
 * Checks if a link can be set in the current editor state
 */
export function canSetLink(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.can().setMark('link');
}

/**
 * Checks if a link is currently active in the editor
 */
export function isLinkActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive('link');
}

/**
 * Determines if the link button should be shown
 */
export function shouldShowLinkButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;

  const linkInSchema = isMarkInSchema('link', editor);

  if (!linkInSchema || !editor) {
    return false;
  }

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canSetLink(editor);
  }

  return true;
}

/**
 * Custom hook for handling link operations in a Tiptap editor
 */
export function useLinkHandler(props: LinkHandlerProps) {
  const { editor, onSetLink } = props;
  const [url, setUrl] = React.useState<string | null>(null);
  const [displayText, setDisplayText] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!editor) return;

    if (isLinkActive(editor)) {
      // Get URL immediately on mount
      const { href } = editor.getAttributes('link');
      const { from } = editor.view.state.selection;
      const nodeBefore = editor.state.doc.nodeAt(Math.max(from - 1, 1));

      if (url === null) setUrl(href || '');
      if (displayText === null) setDisplayText(nodeBefore?.textContent || '');
    }
  }, [editor, url, displayText]);

  React.useEffect(() => {
    if (!editor) return;

    const updateLinkState = () => {
      if (!isLinkActive(editor)) return;

      const { href } = editor.getAttributes('link');
      setUrl(href || '');

      const { from } = editor.view.state.selection;
      // We actually want the position directly behind our cursor. nodeAt looks at the node directly after our cursor
      // If we're sitting at the boundary of a link, isActive will show it's status for the node behind the cursor while nodeAt will choose the one after
      const nodeBefore = editor.state.doc.nodeAt(Math.max(from - 1, 1));
      setDisplayText(nodeBefore?.textContent || '');
    };

    editor.on('selectionUpdate', updateLinkState);
    return () => {
      editor.off('selectionUpdate', updateLinkState);
    };
  }, [editor]);

  const applyToDoc = React.useCallback(() => {
    if (!url || !editor) return;

    const { selection } = editor.state;
    const isEmpty = selection.empty;

    let chain = editor.chain().focus();

    chain = chain.extendMarkRange('link').setLink({ href: url });

    if (isEmpty) {
      chain = chain.insertContent({ type: 'text', text: displayText || url });
    } else {
      chain = chain.setContent({ type: 'text', text: displayText || url });
    }

    chain.run();

    setUrl(null);
    setDisplayText(null);

    onSetLink?.();
  }, [editor, onSetLink, url, displayText]);

  const removeLink = React.useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .unsetLink()
      .setMeta('preventAutolink', true)
      .run();
    setUrl('');
  }, [editor]);

  const openLink = React.useCallback(
    (target = '_blank', features = 'noopener,noreferrer') => {
      if (!url) return;

      const safeUrl = sanitizeUrl(url, window.location.href);
      if (safeUrl !== '#') {
        window.open(safeUrl, target, features);
      }
    },
    [url],
  );

  return {
    url: url || '',
    setUrl,
    displayText: displayText || '',
    setDisplayText,
    applyToDoc,
    removeLink,
    openLink,
  };
}

/**
 * Custom hook for link popover state management
 */
export function useLinkState(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}) {
  const { editor, hideWhenUnavailable = false } = props;

  const canSet = canSetLink(editor);
  const isActive = isLinkActive(editor);

  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowLinkButton({
          editor,
          hideWhenUnavailable,
        }),
      );
    };

    handleSelectionUpdate();

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  return {
    isVisible,
    canSet,
    isActive,
  };
}

export function useLinkPopover(config?: UseLinkPopoverConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onSetLink,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);

  const { isVisible, canSet, isActive } = useLinkState({
    editor,
    hideWhenUnavailable,
  });

  const linkHandler = useLinkHandler({
    editor,
    onSetLink,
  });

  return {
    isVisible,
    canSet,
    isActive,
    ...linkHandler,
  };
}
