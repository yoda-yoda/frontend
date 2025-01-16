import React, { useState } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import Sidebar from './Sidebar';
import './MainHeader.css';

const MainHeader = ({ onBack, logoSrc }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`main-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="header flex items-center justify-between px-4 py-2 bg-white border-b border-gray-300">
        {/* 뒤로가기 버튼과 이미지 그룹 */}
        <div className="flex items-center gap-2">
          <button
            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            onClick={handleMenuClick}
          >
            <AiOutlineMenu size={18} />
          </button>
          <img
            src={"/accord-removebg.png"}
            alt="Logo"
            className="h-10 object-contain"
          />
        </div>

        {/* 우측 프로필 및 버튼 그룹 */}
        <div className="flex items-center gap-2">
          {/* 추가 버튼이나 프로필 아이콘 등을 여기에 추가할 수 있습니다 */}
        </div>
      </div>

      {/* 사이드바 */}
      <Sidebar isOpen={isSidebarOpen} onClose={handleMenuClick} />
    </div>
  );
};

export default MainHeader;