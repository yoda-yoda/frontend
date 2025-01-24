import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TeamNote from './pages/TeamNote/TeamNote';
import TeamCanvas from './pages/TeamCanvas/TeamCanvas';
import Main from './pages/Main';
import { WebSocketProvider } from './context/WebSocketContext';

function App() {
  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path="/note/:team_id" element={<TeamNote />} />
          <Route path="/canvas/:teamId" element={<TeamCanvas />} />
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  );
}

export default App;
