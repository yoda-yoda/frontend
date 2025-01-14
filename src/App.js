import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TeamNote from './pages/TeamNote/TeamNote';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/note/:team_id" element={<TeamNote />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
