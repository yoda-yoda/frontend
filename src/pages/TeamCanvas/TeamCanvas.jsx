import React, { useState } from 'react';
import CanvasToolbar from '../../components/canvas/CanvasToolbar';
import './TeamCanvas.css';
import NoteHeader from '../../components/common/NoteHeader';
import CanvasArea from '../../components/canvas/CanvasArea';

const TeamCanvas = () => {
  const [tool, setTool] = useState('pencil');

  const handleSelectTool = (selectedTool) => {
    setTool(selectedTool);
  };

  return (
    <div className="TeamCanvas">
      <NoteHeader participants={[]} onBack={() => {}} onShare={() => {}} onChat={() => {}} onMenu={() => {}} onSave={() => {}} />
      <CanvasToolbar className="CanvasToolbar" onSelectTool={handleSelectTool} />
      <CanvasArea tool={tool} />
    </div>
  );
};

export default TeamCanvas;