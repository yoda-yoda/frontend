import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import { useSetRecoilState } from 'recoil';
import { colorState } from '../../recoil/canvasToolAtoms';
import './ColorPickerModal.css';

const ColorPickerModal = ({ show, onClose, position }) => {
  const setColor = useSetRecoilState(colorState);
  const [selectedColor, setSelectedColor] = useState('#000000');

  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
  };

  const handleColorDoubleClick = () => {
    console.log('Color selected:', selectedColor);
    setColor(selectedColor);
    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <div className="color-picker-modal" style={{ top: position.top, left: position.left }}>
      <div className="color-picker-overlay" onClick={onClose} />
      <div className="color-picker-content">
        <div onDoubleClick={handleColorDoubleClick}>
          <SketchPicker
            color={selectedColor}
            onChange={handleColorChange}
          />
        </div>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
};

export default ColorPickerModal;