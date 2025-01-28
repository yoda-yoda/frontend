import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import AudioChat from '../audio/AudioChat';

const Sidebar = ({ isOpen, onClose }) => {
  const [activeTeams, setActiveTeams] = useState([]);
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
    setActiveTeams((prevActiveTeams) => {
      if (prevActiveTeams.includes(teamId)) {
        // 이미 활성화된 팀이면 비활성화
        return prevActiveTeams.filter((id) => id !== teamId);
      } else {
        // 활성화되지 않은 팀이면 활성화
        return [...prevActiveTeams, teamId];
      }
    });
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
              <div className={`team-dropdown ${activeTeams.includes(team.id) ? 'open' : ''}`}>
                <p onClick={() => handleNoteClick(team.id)}>TeamNote</p>
                <p onClick={() => handleCanvasClick(team.id)}>TeamCanvas</p>
                <p onClick={handleVoiceClick}>TeamVoice</p>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          {showAudioChat && <AudioChat onClose={handleCloseAudioChat} teamId={selectedTeamId} />}
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