import {
  Paragraph as BaseParagraphExtension,
  ParagraphOptions as BaseParagraphOptions,
} from '@tiptap/extension-paragraph';
import type { getEdgeStore } from '../../../../../utils/localDb/edges/edgeStore';

export interface ParagraphOptions extends BaseParagraphOptions {
  artifactId: string | undefined;
  edgeStore: ReturnType<typeof getEdgeStore> | undefined;
  onIncomingReferenceCounterMouseOver:
    | ((event: MouseEvent, blockId: string) => void)
    | undefined;
  onIncomingReferenceCounterMouseOut: ((event: MouseEvent) => void) | undefined;
}

export const ParagraphExtension =
  BaseParagraphExtension.extend<ParagraphOptions>({
    addOptions() {
      return {
        HTMLAttributes: {},
        artifactId: undefined,
        edgeStore: undefined,
        onIncomingReferenceCounterMouseOver: undefined,
        onIncomingReferenceCounterMouseOut: undefined,
      };
    },

    addNodeView() {
      return ({ node, HTMLAttributes }) => {
        const container = document.createElement('div');
        container.setAttribute('data-id', node.attrs.id);
        container.classList.add('editor-paragraph-container');

        const incomingEdgeCounter = document.createElement('span');
        incomingEdgeCounter.contentEditable = 'false';

        const edgeUpdateListener = () => {
          // If any of the options are missing, we disable the counter
          if (
            !this.options.artifactId ||
            !this.options.edgeStore ||
            !this.options.onIncomingReferenceCounterMouseOver ||
            !this.options.onIncomingReferenceCounterMouseOut
          ) {
            return;
          }

          const incomingEdges =
            this.options.edgeStore?.getIncomingEdgesForBlock({
              artifactId: this.options.artifactId,
              blockId: node.attrs.id,
            });

          incomingEdgeCounter.innerText = `${incomingEdges?.length || 0}`;

          if (incomingEdges?.length) {
            incomingEdgeCounter.style.display = 'block';
          } else {
            incomingEdgeCounter.style.display = 'none';
          }
        };

        if (this.options.artifactId) edgeUpdateListener();
        const cleanupUpdateListener = this.options.artifactId
          ? this.options.edgeStore?.listenForArtifactId(
              this.options.artifactId,
              edgeUpdateListener,
            )
          : undefined;

        incomingEdgeCounter.classList.add('editor-incoming-edge-counter');

        const clickListener = (event: MouseEvent) => {
          event.stopPropagation();
          event.preventDefault();

          this.options.onIncomingReferenceCounterMouseOver?.(
            event,
            node.attrs.id,
          );
        };
        incomingEdgeCounter.addEventListener('click', clickListener);

        const mouseOverListener = (event: MouseEvent) => {
          this.options.onIncomingReferenceCounterMouseOver?.(
            event,
            node.attrs.id,
          );
        };
        incomingEdgeCounter.addEventListener('mouseover', mouseOverListener);

        const mouseOutListener = (event: MouseEvent) => {
          this.options.onIncomingReferenceCounterMouseOut?.(event);
        };
        incomingEdgeCounter.addEventListener('mouseout', mouseOutListener);

        const contentDom = document.createElement('p');
        container.appendChild(contentDom);
        container.append(incomingEdgeCounter);

        Object.entries(HTMLAttributes).forEach(([key, value]) => {
          if (key === 'class') {
            container.classList.add(value);
          } else {
            container.setAttribute(key, value);
          }
        });

        return {
          dom: container,
          contentDOM: contentDom,
          destroy: () => {
            cleanupUpdateListener?.();
            container.removeEventListener('click', clickListener);
            container.removeEventListener('mouseover', mouseOverListener);
            container.removeEventListener('mouseout', mouseOutListener);
          },
        };
      };
    },
  });
