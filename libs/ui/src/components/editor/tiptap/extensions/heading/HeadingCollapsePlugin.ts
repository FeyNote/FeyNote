import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import type { Node as PmNode } from 'prosemirror-model';
import {
  getCollapsedHeadingIds,
  setCollapsedHeadingIds,
} from '../../../../../utils/headingCollapseStorage';

const HEADING_COLLAPSE_TOGGLE_META = 'headingCollapseToggle';

interface HeadingCollapseState {
  collapsedIds: ReadonlySet<string>;
  decorations: DecorationSet;
}

export const headingCollapsePluginKey = new PluginKey<HeadingCollapseState>(
  'headingCollapse',
);

interface HeadingInfo {
  pos: number;
  size: number;
  level: number;
  id: string;
}

function getDecorations(
  doc: PmNode,
  collapsedIds: ReadonlySet<string>,
): DecorationSet {
  if (collapsedIds.size === 0) return DecorationSet.empty;

  const headings: HeadingInfo[] = [];
  const allNodes: Array<{ pos: number; size: number }> = [];

  doc.forEach((node, offset) => {
    allNodes.push({ pos: offset, size: node.nodeSize });
    if (node.type.name === 'heading' && node.attrs.id) {
      headings.push({
        pos: offset,
        level: node.attrs.level,
        size: node.nodeSize,
        id: node.attrs.id,
      });
    }
  });

  const decorations: Decoration[] = [];
  const hiddenRanges: Array<{ from: number; to: number }> = [];

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    if (!collapsedIds.has(heading.id)) continue;

    decorations.push(
      Decoration.node(heading.pos, heading.pos + heading.size, {
        class: 'heading-collapsed',
      }),
    );

    const rangeStart = heading.pos + heading.size;
    let rangeEnd = doc.content.size;
    for (let j = i + 1; j < headings.length; j++) {
      if (headings[j].level <= heading.level) {
        rangeEnd = headings[j].pos;
        break;
      }
    }

    if (rangeStart < rangeEnd) {
      hiddenRanges.push({ from: rangeStart, to: rangeEnd });
    }
  }

  for (const node of allNodes) {
    const nodeEnd = node.pos + node.size;
    for (const range of hiddenRanges) {
      if (node.pos >= range.from && nodeEnd <= range.to) {
        decorations.push(
          Decoration.node(node.pos, nodeEnd, {
            class: 'editor-collapsed-content',
          }),
        );
        break;
      }
    }
  }

  return DecorationSet.create(doc, decorations);
}

export function createHeadingCollapsePlugin(
  artifactId: string | undefined,
): Plugin<HeadingCollapseState> {
  return new Plugin<HeadingCollapseState>({
    key: headingCollapsePluginKey,

    state: {
      init: (_, { doc }) => {
        const collapsedIds = artifactId
          ? getCollapsedHeadingIds(artifactId)
          : new Set<string>();
        return {
          collapsedIds,
          decorations: getDecorations(doc, collapsedIds),
        };
      },
      apply: (tr, prev) => {
        const toggleId = tr.getMeta(HEADING_COLLAPSE_TOGGLE_META) as
          | string
          | undefined;

        if (toggleId) {
          const collapsedIds = new Set(prev.collapsedIds);
          if (collapsedIds.has(toggleId)) {
            collapsedIds.delete(toggleId);
          } else {
            collapsedIds.add(toggleId);
          }
          if (artifactId) {
            setCollapsedHeadingIds(artifactId, collapsedIds);
          }
          return {
            collapsedIds,
            decorations: getDecorations(tr.doc, collapsedIds),
          };
        }

        if (tr.docChanged) {
          return {
            collapsedIds: prev.collapsedIds,
            decorations: getDecorations(tr.doc, prev.collapsedIds),
          };
        }

        return prev;
      },
    },

    props: {
      decorations(state) {
        return (
          headingCollapsePluginKey.getState(state)?.decorations ??
          DecorationSet.empty
        );
      },
    },
  });
}

export function toggleHeadingCollapse(view: EditorView, headingId: string) {
  view.dispatch(view.state.tr.setMeta(HEADING_COLLAPSE_TOGGLE_META, headingId));
}
