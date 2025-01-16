import React from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import './Sidebar.css';
import AudioChat from '../audio/AudioChat';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button onClick={onClose} className="p-4">
        <AiOutlineClose size={24} />
      </button>
      {/* 사이드바 내용 */}
      <div className="p-4">
        <p>Sidebar content goes here</p>
      </div>
      <div className="sidebar-footer">
        <AudioChat />
      </div>
    </div>
  );
};

export default Sidebar;