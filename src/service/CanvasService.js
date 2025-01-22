import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

export const createCanvas = async (canvasData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/canvas`, canvasData);
    return response;
  } catch (error) {
    console.error('Error creating canvas:', error);
    throw error;
  }
};

export const getCanvasByID = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/canvas/${id}`);
  return response.data;
};

export const getCanvasByTeamID = async (teamId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/canvases/${teamId}`);
    console.log('Canvas by team ID:', response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching canvas by team ID:', error);
    throw error;
  }
};

export const updateCanvasTitle = async (id, newTitle) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/canvas/${id}/title`, { new_title: newTitle });
    return response.data;
  } catch (error) {
    console.error('Error updating canvas title:', error);
    throw error;
  }
};

export const deleteCanvasByID = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/canvas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting canvas:', error);
    throw error;
  }
};