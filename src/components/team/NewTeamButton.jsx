import React from 'react';
import './NewTeamButton.css';

const NewTeamButton = ({ onClick }) => {
  return (
    <button className="new-team-button" onClick={onClick}>
      New Team
    </button>
  );
};

export default NewTeamButton;