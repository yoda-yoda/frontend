import apiClient from "../utils/apiSpring";

const searchTeamMembers = async (query, teamId) => {
  const response = await apiClient.get(`/api/members/team-members/search`, {
    params: { query, teamId },
  });
  return response.data.data;
};

const getTeamMembers = async (teamId) => {
  const response = await apiClient.get(`/api/members/team-members`, {
    params: { teamId },
  });
  return response.data.data;
};

const sendInviteMessage = async (teamId, memberId) => {
  const response = await apiClient.get(`/api/members/teams/members/${teamId}/${memberId}`);
  return response.data;
};

const acceptInvite = async (teamId) => {
  const response = await apiClient.post(`/api/members/teams/members/${teamId}`);
  return response.data;
};

export default {
  searchTeamMembers,
  getTeamMembers,
  sendInviteMessage,
  acceptInvite,
};