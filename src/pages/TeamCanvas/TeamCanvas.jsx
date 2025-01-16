import React, { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import CanvasToolbar from '../../components/canvas/CanvasToolbar';
import './TeamCanvas.css';
import NoteHeader from '../../components/common/NoteHeader';
import CanvasArea from '../../components/canvas/CanvasArea';

const TeamCanvas = () => {
  const { teamId } = useParams();
  const [tool, setTool] = useState('pencil');
  const canvasAreaRef = useRef(null);

  const handleSelectTool = (selectedTool) => {
    setTool(selectedTool);
  };

  const handleSave = () => {
    if (canvasAreaRef.current) {
      canvasAreaRef.current.saveCanvas();
    }
  };

  return (
    <div className="TeamCanvas">
      <NoteHeader participants={[]} onBack={() => {}} onShare={() => {}} onChat={() => {}} onMenu={() => {}} onSave={handleSave} />
      <CanvasToolbar className="CanvasToolbar" onSelectTool={handleSelectTool} />
      <CanvasArea ref={canvasAreaRef} tool={tool} teamId={teamId}  />
    </div>
  );
};

export default TeamCanvas;