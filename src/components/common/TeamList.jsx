import React from 'react';
import './TeamList.css';

const TeamList = ({ teams, activeTeams, onTeamClick, onNoteClick, onCanvasClick, onVoiceClick }) => {
  return (
    <div className="team-list">
      {teams.map((team) => (
        <div key={team.id}>
          <p onClick={() => onTeamClick(team.id)} className="team-name">
            {team.teamName}
          </p>
          <div className={`team-dropdown ${activeTeams.includes(team.id) ? 'open' : ''}`}>
            <p onClick={() => onNoteClick(team.id)}>TeamNote</p>
            <p onClick={() => onCanvasClick(team.id)}>TeamCanvas</p>
            <p onClick={() => onVoiceClick(team.id)}>TeamVoice</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamList;