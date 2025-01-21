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

const getNoteByTeamIDAndTitle = async (teamId, title) => {
  try {
    const encodedTitle = encodeURIComponent(title);

    const response = await axios.get(`http://localhost:4000/notes/${teamId}/${encodedTitle}`, {
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

const updateNoteTitle = async (teamId, oldTitle, newTitle) => {
  try {
    const response = await axios.put(`http://localhost:4000/notes/${teamId}/${oldTitle}/${newTitle}`, null, {
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

export { saveNote, getNotesByTeamID, getNoteByTeamIDAndTitle, updateNoteTitle };