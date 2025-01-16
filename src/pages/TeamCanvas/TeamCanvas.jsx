import React, { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import CanvasToolbar from '../../components/canvas/CanvasToolbar';
import './TeamCanvas.css';
import NoteHeader from '../../components/common/NoteHeader';
import CanvasArea from '../../components/canvas/CanvasArea';
import Sidebar from '../../components/common/Sidebar';

const TeamCanvas = () => {
  const { teamId } = useParams();
  const [tool, setTool] = useState('pencil');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const canvasAreaRef = useRef(null);
  const participants = ['Alice', 'Bob', 'Charlie']; 

  const handleSelectTool = (selectedTool) => {
    setTool(selectedTool);
  };

  const handleSave = () => {
    if (canvasAreaRef.current) {
      canvasAreaRef.current.saveCanvas();
    }
  };

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`TeamCanvas ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <NoteHeader onBack={() => {}} onShare={() => {}} onChat={() => {}} onMenu={handleMenuClick} onSave={handleSave} />
      <CanvasToolbar className="CanvasToolbar" onSelectTool={handleSelectTool} />
      <CanvasArea ref={canvasAreaRef} tool={tool} teamId={teamId} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleMenuClick} />
    </div>
  );
};

export default TeamCanvas;