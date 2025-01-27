import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import AudioChat from '../audio/AudioChat';

const Sidebar = ({ isOpen, onClose }) => {
  const [activeTeam, setActiveTeam] = useState(null);
  const [showAudioChat, setShowAudioChat] = useState(false);
  const navigate = useNavigate();

  const teams = [
    { id: 1, name: 'Team A' },
    { id: 2, name: 'Team B' },
    { id: 3, name: 'Team C' },
  ];

  const handleTeamClick = (teamId) => {
    setActiveTeam(activeTeam === teamId ? null : teamId);
  };

  const handleNoteClick = (teamId) => {
    navigate(`/note/${teamId}`);
  };

  const handleCanvasClick = (teamId) => {
    navigate(`/canvas/${teamId}`);
  };

  const handleVoiceClick = () => {
    setShowAudioChat(true);
  };

  const handleCloseAudioChat = () => {
    setShowAudioChat(false);
  };
  
  const handleToggleSidebar = () => {
    onClose(); // 상위 컴포넌트의 토글 함수 호출
  };

  return (
    <>
      {/* 사이드바 */}
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        {/* 사이드바 내용 */}
        <div className="sidebar-content p-4">
          {teams.map((team) => (
            <div key={team.id}>
              <p onClick={() => handleTeamClick(team.id)} className="team-name">
                {team.name}
              </p>
              <div className={`team-dropdown ${activeTeam === team.id ? 'open' : ''}`}>
                <p onClick={() => handleNoteClick(team.id)}>TeamNote</p>
                <p onClick={() => handleCanvasClick(team.id)}>TeamCanvas</p>
                <p onClick={handleVoiceClick}>TeamVoice</p>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          {showAudioChat && <AudioChat onClose={handleCloseAudioChat} />}
        </div>
      </div>

      {/* 토글 버튼 */}
      <button
        onClick={handleToggleSidebar}
        className={`toggle-button ${isOpen ? 'open' : 'closed'}`}
        aria-label={isOpen ? '사이드바 닫기' : '사이드바 열기'}
      >
        {isOpen ? <AiOutlineLeft /> : <AiOutlineRight />}
      </button>
    </>
  );
};

export default Sidebar;