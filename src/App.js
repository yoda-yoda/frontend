import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

import TeamNote from './pages/TeamNote/TeamNote';
import TeamCanvas from './pages/TeamCanvas/TeamCanvas';
import Main from './pages/Main';

import LoginModal from './components/auth/LoginModal';
import LogoutConfirmModal from './components/auth/LogoutConfirmModal';
import AccountDeleteModal from './components/auth/AccountDeleteModal';
import NicknameChangeModal from './components/auth/NicknameChangeModal';

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [nickname, setNickname] = useState('');

  // 모달 open/close 관리
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAccountDeleteModal, setShowAccountDeleteModal] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);

  useEffect(() => {
    console.log('App.js useEeffect')
    const accessToken = Cookies.get('accessToken');
    if (accessToken) {
      console.log('accessToken 있음')
      setIsLogin(true);

      // 서버에서 닉네임 가져오기
      axios.get('http://localhost:8080/api/member/profiles', {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      })
        .then((res) => {
          setNickname(res.data.nickname);
        })
        .catch((err) => {
          console.error('닉네임 조회 실패:', err);
          setIsLogin(false);
          setNickname('');
        });
    } else {
      setIsLogin(false);
      setNickname('');
    }
  }, []);

  // 로그아웃 완료
  const handleLogoutSuccess = () => {
    setIsLogin(false);
    setNickname('');
  };

  // 회원탈퇴 완료
  const handleDeleteSuccess = () => {
    setIsLogin(false);
    setNickname('');
  };

  // 닉네임 변경
  const handleNicknameUpdate = (newNickname) => {
    setNickname(newNickname);
  };

  const sharedProps = {
    isLogin,
    nickname,
    openLoginModal: () => setShowLoginModal(true),
    openLogoutModal: () => setShowLogoutModal(true),
    openAccountDeleteModal: () => setShowAccountDeleteModal(true),
    openNicknameModal: () => setShowNicknameModal(true),
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main {...sharedProps} />} />
        <Route path="/note/:team_id" element={<TeamNote {...sharedProps} />} />
        <Route path="/canvas/:teamId" element={<TeamCanvas {...sharedProps} />} />
      </Routes>

      {/* 모달들 */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      <LogoutConfirmModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onLogoutSuccess={handleLogoutSuccess}
      />
      <AccountDeleteModal
        open={showAccountDeleteModal}
        onClose={() => setShowAccountDeleteModal(false)}
        onDeleteSuccess={handleDeleteSuccess}
      />
      <NicknameChangeModal
        open={showNicknameModal}
        onClose={() => setShowNicknameModal(false)}
        currentNickname={nickname}
        onNicknameUpdate={handleNicknameUpdate}
      />
    </BrowserRouter>
  );
}

export default App;