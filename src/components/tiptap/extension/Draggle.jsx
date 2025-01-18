import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export function Draggable() {
  return new Plugin({
    props: {
      decorations(state) {
        const decorations = [];
        state.doc.descendants((node, pos) => {
          if (node.type.spec.draggable) {
            decorations.push(Decoration.node(pos, pos + node.nodeSize, { draggable: 'true' }));
          }
        });
        return DecorationSet.create(state.doc, decorations);
      },
      handleDOMEvents: {
        drop(view, event) {
          event.preventDefault();
          const { schema } = view.state;
          const { tr } = view.state;
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (!pos) return false;

          const node = schema.nodes.draggable.create();
          tr.setNodeMarkup(pos.inside, null, node.attrs);
          view.dispatch(tr);
          return true;
        },
      },
    },
  });
}
