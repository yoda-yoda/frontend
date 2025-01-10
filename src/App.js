import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TeamNote from './pages/TeamNote/TeamNote';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기본 경로로 TeamNote 컴포넌트를 렌더링 */}
        <Route path="/" element={<TeamNote />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
