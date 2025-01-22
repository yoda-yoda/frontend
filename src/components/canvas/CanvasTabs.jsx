import React, { useState } from 'react';
import './CanvasTabs.css';
import { updateCanvasTitle, deleteCanvasByID } from '../../service/CanvasService';

const CanvasTabs = ({ tabs, activeTab, onTabClick, onUpdateTitle, onDeleteTab, onAddTab }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const checkHasId = (id) => {
    if (!id || id === '') {
        alert('Please save the canvas before adding a new tab.');
        return false;
    }
    return true;
  }

  const handleDoubleClick = (index, title) => {
    setEditingIndex(index);
    setNewTitle(title);
  };

  const handleInputChange = (e) => {
    setNewTitle(e.target.value);
  };

  const handleSaveClick = async (id) => {
    if (!checkHasId(id)) return;
    try {
      await updateCanvasTitle(id, newTitle);
      onUpdateTitle(id, newTitle);
      setEditingIndex(null);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const handleCancelClick = () => {
    setEditingIndex(null);
  };

  const handleDeleteClick = async (id) => {
    if (!checkHasId(id)) return;
    try {
      await deleteCanvasByID(id);
      onDeleteTab(id);
    } catch (error) {
      console.error('Error deleting canvas:', error);
    }
  };

  return (
    <div className="canvas-tabs">
      {tabs.map((tab, index) => (
        <div
          key={index}
          className={`canvas-tab ${activeTab === index ? 'active' : ''}`}
          onClick={() => onTabClick(index)}
          onDoubleClick={() => handleDoubleClick(index, tab.title)}
        >
          {editingIndex === index ? (
            <div className="tab-editing">
              <input
                type="text"
                value={newTitle}
                onChange={handleInputChange}
                autoFocus
              />
              <button onClick={() => handleSaveClick(tab.id)}>Save</button>
              <button onClick={handleCancelClick}>Cancel</button>
              <button onClick={() => handleDeleteClick(tab.id)}>Delete</button>
            </div>
          ) : (
            tab.title || 'Untitled'
          )}
        </div>
      ))}
      <div className="canvas-tab add-tab" onClick={onAddTab}>
        +
      </div>
    </div>
  );
};

export default CanvasTabs;