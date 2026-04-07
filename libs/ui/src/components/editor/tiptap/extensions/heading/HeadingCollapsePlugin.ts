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

function processContainer(
  container: PmNode,
  baseOffset: number,
  isDoc: boolean,
  collapsedIds: ReadonlySet<string>,
  decorations: Decoration[],
) {
  const headings: HeadingInfo[] = [];
  const children: Array<{ pos: number; size: number; node: PmNode }> = [];

  container.forEach((child, offset) => {
    const absPos = isDoc ? offset : baseOffset + 1 + offset;
    children.push({ pos: absPos, size: child.nodeSize, node: child });
    if (child.type.name === 'heading' && child.attrs.id) {
      headings.push({
        pos: absPos,
        level: child.attrs.level,
        size: child.nodeSize,
        id: child.attrs.id,
      });
    }
  });

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
    const containerEnd = isDoc
      ? container.content.size
      : baseOffset + 1 + container.content.size;
    let rangeEnd = containerEnd;
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

  for (const child of children) {
    const childEnd = child.pos + child.size;
    let hidden = false;

    for (const range of hiddenRanges) {
      if (child.pos >= range.from && childEnd <= range.to) {
        decorations.push(
          Decoration.node(child.pos, childEnd, {
            class: 'editor-collapsed-content',
          }),
        );
        hidden = true;
        break;
      }
    }

    if (!hidden && child.node.type.name === 'blockGroup') {
      processContainer(child.node, child.pos, false, collapsedIds, decorations);
    }
  }
}

function getDecorations(
  doc: PmNode,
  collapsedIds: ReadonlySet<string>,
): DecorationSet {
  if (collapsedIds.size === 0) return DecorationSet.empty;

  const decorations: Decoration[] = [];
  processContainer(doc, 0, true, collapsedIds, decorations);
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
