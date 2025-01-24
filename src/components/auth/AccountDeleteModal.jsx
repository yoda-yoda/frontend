import React from 'react';
import { Modal, Button, Header, Icon } from 'semantic-ui-react';
import { deleteUser } from '../../recoil/authApi';

function AccountDeleteModal({ open, onClose, onDeleteSuccess }) {
  const handleDelete = async () => {
    try {
      const res = await deleteUser(); // DELETE /auth
      console.log('탈퇴 완료:', res);
      onDeleteSuccess(); // 상위에서 로그인 상태나 쿠키 제거
      onClose();         // 모달 닫기
    } catch (error) {
      console.error('회원탈퇴 실패:', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="mini">
      <Header icon="user times" content="회원탈퇴" />
      <Modal.Content>
        <p style={{ color: 'red' }}>탈퇴 시 되돌릴 수 없습니다!</p>
      </Modal.Content>
      <Modal.Actions>
        <Button negative onClick={handleDelete}>
          <Icon name="warning sign" /> 회원탈퇴
        </Button>
        <Button color="grey" onClick={onClose}>
          <Icon name="remove" /> 취소
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

export default AccountDeleteModal;
