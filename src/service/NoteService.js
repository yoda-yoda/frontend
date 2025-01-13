import axios from 'axios';

const saveNote = async (note) => {
  try {
    const response = await axios.post('http://localhost:4000/note', note, {
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

const getNote = async (team_id) => {
  try {
    const response = await axios.get(`http://localhost:4000/note/${team_id}`, {
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

export { saveNote, getNote };