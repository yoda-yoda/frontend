import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

export const createCanvas = async (canvasData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/canvas`, canvasData);
    return response.data;
  } catch (error) {
    console.error('Error creating canvas:', error);
    throw error;
  }
};

export const getCanvasByTeamID = async (teamId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/canvas/${teamId}`);
    console.log('Canvas by team ID:', response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching canvas by team ID:', error);
    throw error;
  }
};