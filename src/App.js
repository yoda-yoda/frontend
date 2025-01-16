import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TeamNote from './pages/TeamNote/TeamNote';
import TeamCanvas from './pages/TeamCanvas/TeamCanvas';
import Main from './pages/Main';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path="/note/:team_id" element={<TeamNote />} />
        <Route path="/canvas/:teamId" element={<TeamCanvas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
