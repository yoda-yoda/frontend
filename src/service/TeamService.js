import apiClient from "../utils/apiSpring";

const createTeam = async (teamData) => {
  const response = await apiClient.post('/api/members/teams', teamData);
  return response.data;
};

const getTeamsByMemberId = async (memberId) => {
  const response = await apiClient.get(`/api/members/teams/${memberId}`);
  return response.data.data;
}

export default {
  createTeam,
  getTeamsByMemberId,
};