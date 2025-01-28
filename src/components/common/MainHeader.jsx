import React from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import Sidebar from './Sidebar';
import './MainHeader.css';

// 버튼
import LoginButton from '../auth/LoginButton';
import ProfileButton from '../auth/ProfileButton';

import { useRecoilValue } from 'recoil';
import { authState } from '../../recoil/authAtoms';

const MainHeader = ({
  onBack,
  logoSrc,
  // App에서 내려온 props
  openLoginModal,
  openLogoutModal,
  openAccountDeleteModal,
  openNicknameModal,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { isLogin, nickname } = useRecoilValue(authState);

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`main-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="header flex items-center justify-between px-4 py-2 bg-white border-b border-gray-300">
        {/* 왼쪽 */}
        <div className="flex items-center gap-2">
          <img
            src={"/accord-removebg.png"}
            alt="Logo"
            className="h-10 object-contain"
          />
        </div>

        {/* 오른쪽 */}
        <div className="flex items-center gap-2">
          {isLogin ? (
            <ProfileButton
              nickname={nickname}
              onOpenNicknameModal={openNicknameModal}
              onOpenAccountDeleteModal={openAccountDeleteModal}
              onOpenLogoutConfirm={openLogoutModal}
            />
          ) : (
            <LoginButton onClick={openLoginModal} />
          )}
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={handleMenuClick} />
    </div>
  );
};

export default MainHeader;