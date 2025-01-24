import { Node } from '@tiptap/core';
import { mergeAttributes } from '@tiptap/react';

const HoverableTable = Node.create({
  name: 'hoverableTable',
  group: 'block',
  content: 'tableRow+',
  tableRole: 'table',
  isolating: true,

  parseHTML() {
    return [{ tag: 'table' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['table', mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('div');
      const table = document.createElement('table');
      const hoverMenu = document.createElement('div');

      // Set up table structure
      dom.appendChild(table);
      dom.appendChild(hoverMenu);

      hoverMenu.style.position = 'absolute';
      hoverMenu.style.display = 'none';
      hoverMenu.style.background = 'rgba(0, 0, 0, 0.5)';
      hoverMenu.style.color = 'white';
      hoverMenu.style.padding = '5px';

      hoverMenu.innerHTML = `
        <button>Add Column</button>
        <button>Delete Column</button>
      `;

      hoverMenu.querySelector('button:nth-child(1)').onclick = () => {
        editor.chain().focus().addColumnAfter().run();
      };

      hoverMenu.querySelector('button:nth-child(2)').onclick = () => {
        editor.chain().focus().deleteColumn().run();
      };

      // Handle mouse events
      dom.addEventListener('mouseenter', () => {
        hoverMenu.style.display = 'block';
      });

      dom.addEventListener('mouseleave', () => {
        hoverMenu.style.display = 'none';
      });

      return {
        dom,
        contentDOM: table,
      };
    };
  },
});

export default HoverableTable;
