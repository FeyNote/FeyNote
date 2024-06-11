import { textblockTypeInputRule } from '@tiptap/core';
import Heading from '@tiptap/extension-heading';

export const HeadingPlugin = Heading.extend({
  addCommands() {
    const { options, name, editor } = this;
    return {
      setHeading:
        (attributes) =>
        ({ commands }) => {
          if (!options.levels.includes(attributes.level)) {
            return false;
          }
          if (editor.state.selection.$head.node().attrs.indent) {
            return commands.setNode(name, {
              ...attributes,
              indent: editor.state.selection.$head.node().attrs.indent,
            });
          }
          return commands.setNode(name, attributes);
        },
      toggleHeading:
        (attributes) =>
        ({ commands }) => {
          if (!options.levels.includes(attributes.level)) {
            return false;
          }

          if (editor.state.selection.$head.node().attrs.indent) {
            return commands.toggleNode(name, 'paragraph', {
              ...attributes,
              indent: editor.state.selection.$head.node().attrs.indent,
            });
          }
          return commands.toggleNode(name, 'paragraph', attributes);
        },
    };
  },
  addInputRules() {
    const { options, type, editor } = this;
    return options.levels.map((level: any) => {
      return textblockTypeInputRule({
        find: new RegExp(`^(#{1,${level}})\\s$`),
        type,
        getAttributes: () => ({
          level,
          indent: editor.state.selection.$head.node().attrs.indent,
        }),
      });
    });
  },
});
