import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainHeader from '../../components/common/MainHeader';
import TeamMemberService from '../../service/TeamMemberService';

const AcceptInvitePage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        const response = await TeamMemberService.acceptInvite(teamId);
        console.log('Invite accepted:', response);
        alert('Invite accepted successfully');
        navigate('/'); 
      } catch (error) {
        console.error('Error accepting invite:', error);
        alert('Failed to accept invite');
      }
    };

    acceptInvite();
  }, [teamId, navigate]);

  return (
    <div className="accept-invite-page">
      <MainHeader />
      <div className="invite-box">
        <h2>Accepting Invite...</h2>
      </div>
    </div>
  );
};

export default AcceptInvitePage;