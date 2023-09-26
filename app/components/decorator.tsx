import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const hashtagPluginKey = new PluginKey('highlight');

const hashtagPlugin = new Plugin({
  key: hashtagPluginKey,
  state: {
    init() {
      return DecorationSet.empty;
    },
    apply(tr, set) {
      // Adjust decoration positions to changes made by the transaction
      set = set.map(tr.mapping, tr.doc);
      // Find and decorate hashtags
      const decorations = [];
      const regex = /#\w+/g;
      tr.doc.descendants((node, pos) => {
        if (node.isText) {
          let match;
          while ((match = regex.exec(node.text))) {
            const start = match.index + pos;
            const end = start + match[0].length;
            decorations.push(Decoration.inline(start, end, { class: 'hashtag' }));
          }
        }
      });
      return DecorationSet.create(tr.doc, decorations);
    },
  },
  props: {
    decorations(state) {
      return hashtagPluginKey.getState(state);
    },
  },
});


export const HighlighterExtension = Extension.create({
  name: 'highlighter',

  addProseMirrorPlugins() {
    return [
      hashtagPlugin
    ]
  },
})