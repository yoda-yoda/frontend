// src/components/auth/NicknameChangeModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Header, Form, Icon } from 'semantic-ui-react';
import { updateNickname } from '../../recoil/authApi';

function NicknameChangeModal({ open, onClose, currentNickname, onNicknameUpdate }) {
  const [nickname, setNickname] = useState('');

  // 모달 열릴 때 현재 닉네임 세팅
  useEffect(() => {
    if (open) {
      setNickname(currentNickname || '');
    }
  }, [open, currentNickname]);

  const handleChangeNickname = async () => {
    try {
      const res = await updateNickname(nickname);
      console.log('닉네임 변경 완료:', res);

      // 상위에서 nickname 반영
      onNicknameUpdate(nickname);
      onClose();
    } catch (error) {
      console.error('닉네임 변경 실패:', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="mini">
      <Header icon="edit outline" content="닉네임 변경" />
      <Modal.Content>
        <Form>
          <Form.Input
            label="새 닉네임"
            placeholder="새 닉네임을 입력하세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color="green" onClick={handleChangeNickname}>
          <Icon name="checkmark" /> 변경
        </Button>
        <Button color="grey" onClick={onClose}>
          <Icon name="remove" /> 취소
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

export default NicknameChangeModal;
