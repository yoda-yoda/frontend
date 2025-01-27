import React from 'react';
import MainHeader from '../components/common/MainHeader';

const Main = ({
  // App.js 에서 내려받은 prop들
  openLoginModal,
  openLogoutModal,
  openAccountDeleteModal,
  openNicknameModal,
}) => {
  const handleBack = () => {
    // 뒤로가기 버튼 클릭 시 동작
    console.log('Back button clicked');
  };

  const handleMenu = () => {
    // 메뉴 버튼 클릭 시 동작
    console.log('Menu button clicked');
  };

  return (
    <div>
      <MainHeader
      onBack={handleBack}
      onMenu={handleMenu}
      logoSrc="/path/to/your/logo.png"
      openLoginModal={openLoginModal}
      openLogoutModal={openLogoutModal}
      openAccountDeleteModal={openAccountDeleteModal}
      openNicknameModal={openNicknameModal}
      />
      {/* 페이지 내용 */}
    </div>
  );
};

export default Main;