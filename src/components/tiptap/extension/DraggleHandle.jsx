import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { FaGripVertical } from 'react-icons/fa';

const DraggableHandle = () => {
  const editor = useEditor();

  return (
    <div className="draggable-handle">
      <FaGripVertical />
    </div>
  );
};

export default DraggableHandle;