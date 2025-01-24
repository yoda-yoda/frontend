import React from 'react';
import { Modal, Button, Header, Icon } from 'semantic-ui-react';
import { logoutUser } from '../../recoil/authApi';

function LogoutConfirmModal({ open, onClose, onLogoutSuccess }) {
  const handleLogout = async () => {
    try {
      const res = await logoutUser(); // /api/auth/logout 호출
      console.log('로그아웃 완료:', res);
      onLogoutSuccess(); // 상위 컴포넌트에서 로그인 false 처리 등
      onClose();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="mini">
      <Header icon="sign out" content="로그아웃" />
      <Modal.Content>
        <p>정말 로그아웃하시겠습니까?</p>
      </Modal.Content>
      <Modal.Actions>
        <Button negative onClick={handleLogout}>
          <Icon name="checkmark" /> 로그아웃
        </Button>
        <Button color="grey" onClick={onClose}>
          <Icon name="remove" /> 취소
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

export default LogoutConfirmModal;
