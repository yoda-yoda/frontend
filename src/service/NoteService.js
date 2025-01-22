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

const getNotesByTeamID = async (teamId) => {
  try {
    const response = await axios.get(`http://localhost:4000/notes/${teamId}`, {
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
    const response = await axios.get(`http://localhost:4000/note/${id}`, {
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
    const response = await axios.put(`http://localhost:4000/note/${id}/title`, { new_title: newTitle }, {
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
    const response = await axios.delete(`http://localhost:4000/note/${id}`, {
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