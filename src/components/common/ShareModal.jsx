import React, { useState, useEffect } from 'react';
import TeamMemberService from '../../service/TeamMemberService';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, teamId }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length >= 3) {
      const delayDebounceFn = setTimeout(() => {
        handleSearch();
      }, 300); // 300ms 디바운스

      return () => clearTimeout(delayDebounceFn);
    }
  }, [query]);

  const fetchTeamMembers = async () => {
    try {
      const response = await TeamMemberService.getTeamMembers(teamId);
      setTeamMembers(response);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await TeamMemberService.searchTeamMembers(query, teamId);
      setResults(response);
    } catch (error) {
      console.error('Error searching team members:', error);
    }
  };

  const handleInvite = async (memberId) => {
    try {
      const response = await TeamMemberService.sendInviteMessage(teamId, memberId);
      console.log('Invite sent:', response);
      alert('Invite sent successfully');
    } catch (error) {
      console.error('Error sending invite:', error);
      alert('Failed to send invite');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Share with Team Member</h2>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter email"
        />
        <button onClick={onClose}>Cancel</button>
        <div className="search-results">
          {results.map((member) => (
            <div key={member.memberId} className="search-result-item">
              <img src={member.profileImage} alt={member.nickname} className="profile-pic" />
              <div>
                <p>{member.email}</p>
                <button onClick={() => handleInvite(member.memberId)}>Invite</button>
              </div>
            </div>
          ))}
        </div>
        <h3>Current Team Members</h3>
        <div className="team-members">
          {teamMembers.map((member) => (
            <div key={member.memberId} className="team-member-item">
              <img src={member.profileImage} alt={member.nickname} className="profile-pic" />
              <div>
                <p>{member.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;