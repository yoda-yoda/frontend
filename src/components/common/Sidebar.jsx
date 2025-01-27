import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import AudioChat from '../audio/AudioChat';

const Sidebar = ({ isOpen, onClose }) => {
  const [activeTeam, setActiveTeam] = useState(null);
  const [showAudioChat, setShowAudioChat] = useState(false);
  const navigate = useNavigate();
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const teams = [
    { id: 1, name: 'Team A' },
    { id: 2, name: 'Team B' },
    { id: 3, name: 'Team C' },
  ];

  const handleVoiceClick = (teamId) => {
    console.log("Clicked voice on teamId=", teamId);
    setSelectedTeamId(teamId);
    setShowAudioChat(true);
  };

  const handleTeamClick = (teamId) => {
    setActiveTeam(activeTeam === teamId ? null : teamId);
  };

  const handleNoteClick = (teamId) => {
    navigate(`/note/${teamId}`);
  };

  const handleCanvasClick = (teamId) => {
    navigate(`/canvas/${teamId}`);
  };

  const handleCloseAudioChat = () => {
    setShowAudioChat(false);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button onClick={onClose} className="p-4">
        <AiOutlineClose size={24} />
      </button>
      {/* 사이드바 내용 */}
      <div className="p-4">
        {teams.map((team) => (
          <div key={team.id}>
            <p onClick={() => handleTeamClick(team.id)} className="team-name">
              {team.name}
            </p>
            <div className={`team-dropdown ${activeTeam === team.id ? 'open' : ''}`}>
              <p onClick={() => handleNoteClick(team.id)}>TeamNote</p>
              <p onClick={() => handleCanvasClick(team.id)}>TeamCanvas</p>
              <p onClick={() => handleVoiceClick(team.id)} >TeamVoice</p>
            </div>
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        {showAudioChat && <AudioChat onClose={handleCloseAudioChat} teamId={selectedTeamId} />}
      </div>
    </div>
  );
};

export default Sidebar;