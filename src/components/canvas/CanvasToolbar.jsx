import React, { useState, useRef } from 'react';
import { useSetRecoilState } from 'recoil';
import { FaMousePointer, FaPencilAlt, FaPen, FaSquare, FaCircle, FaTextHeight, FaEraser, FaPaintBrush, FaImage } from 'react-icons/fa';
import { toolState } from '../../recoil/canvasToolAtoms';
import ColorPickerModal from './ColorPickerModal';
import './CanvasToolbar.css';

const CanvasToolbar = ({ onImageUpload }) => {
  const setTool = useSetRecoilState(toolState);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const toolbarRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleToolClick = (tool) => {
    setTool(tool);
    console.log(`Selected tool: ${tool}`);
  };

  const handleColorPickerClick = () => {
    setShowColorPicker(true);
  };

  const handleCloseColorPicker = () => {
    setShowColorPicker(false);
  };

  const getColorPickerPosition = () => {
    if (toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect();
      return { top: rect.top, left: rect.right + 10 };
    }
    return { top: 0, left: 0 };
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageUpload(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageButtonClick = () => {
    handleToolClick('image');
    fileInputRef.current.click();
  };

  return (
    <div className="CanvasToolbar" ref={toolbarRef}>
      <button
        className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
        onClick={() => handleToolClick('mouse')}
      >
        <FaMousePointer size={18} />
      </button>
      <button
        className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
        onClick={() => handleToolClick('pencil')}
      >
        <FaPencilAlt size={18} />
      </button>
      <button
        className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
        onClick={() => handleToolClick('pen')}
      >
        <FaPen size={18} />
      </button>
      <button
        className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
        onClick={() => handleToolClick('square')}
      >
        <FaSquare size={18} />
      </button>
      <button
        className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
        onClick={() => handleToolClick('circle')}
      >
        <FaCircle size={18} />
      </button>
      <button
        className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
        onClick={handleColorPickerClick}
      >
        <FaPaintBrush size={18} />
      </button>
      <ColorPickerModal show={showColorPicker} onClose={handleCloseColorPicker} position={getColorPickerPosition()} />
      <button
        className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
        onClick={() => handleToolClick('text')}
      >
        <FaTextHeight size={18} />
      </button>
      <button
        className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
        onClick={() => handleToolClick('eraser')}
      >
        <FaEraser size={18} />
      </button>
      <button
        className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
        onClick={handleImageButtonClick}
      >
        <FaImage size={18} />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default CanvasToolbar;