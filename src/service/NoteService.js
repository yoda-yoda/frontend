import axios from 'axios';

// const API_BASE_URL = 'http://localhost:4000';
const API_BASE_URL = 'http://172.30.1.64:8082/go';

const saveNote = async (note) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/note`, note, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('There was a problem with the axios operation:', error);
    throw error;
  }
};

const getNotesByTeamID = async (teamId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notes/${teamId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('There was a problem with the axios operation:', error);
    throw error;
  }
};

const getNoteByID = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/note/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('There was a problem with the axios operation:', error);
    throw error;
  }
};

const updateNoteTitle = async (id, newTitle) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/note/${id}/title`, { new_title: newTitle }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('There was a problem with the axios operation:', error);
    throw error;
  }
};

const deleteNoteByID = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/note/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('There was a problem with the axios operation:', error);
    throw error;
  }
};

export { saveNote, getNotesByTeamID, getNoteByID, updateNoteTitle, deleteNoteByID };