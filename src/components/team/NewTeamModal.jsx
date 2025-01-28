import React, { useState } from 'react';
import './NewTeamModal.css';
import TeamService from '../../service/TeamService';

const NewTeamModal = ({ isOpen, onClose }) => {
  const [teamName, setTeamName] = useState('');

  const handleCreateTeam = async () => {
    try {
      const response = await TeamService.createTeam({ teamName: teamName });
      console.log('Team created:', response);
      onClose();
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Team</h2>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter team name"
        />
        <button onClick={handleCreateTeam}>Create</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default NewTeamModal;