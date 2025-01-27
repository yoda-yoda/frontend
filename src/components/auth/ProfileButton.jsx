import React, { useState } from 'react';
import { Dropdown, Icon } from 'semantic-ui-react';
import { useRecoilValue } from 'recoil';
import { authState } from '../../recoil/authAtoms';

function ProfileButton({
  onOpenNicknameModal,
  onOpenAccountDeleteModal,
  onOpenLogoutConfirm,
}) {
  const { nickname } = useRecoilValue(authState);
  const [open, setOpen] = useState(false);

  const trigger = (
    <span style={{ cursor: 'pointer' }}>
      <Icon name="user circle" size="large" />
    </span>
  );

  const options = [
    {
      key: 'welcome',
      text: `${nickname || '손님'} 님 안녕하세요!`,
      disabled: true,
    },
    {
      key: 'nicknameChange',
      text: '닉네임 변경',
      icon: 'edit',
      onClick: () => {
        setOpen(false);
        onOpenNicknameModal();
      },
    },
    {
      key: 'logout',
      text: '로그아웃',
      icon: 'sign out',
      onClick: () => {
        setOpen(false);
        onOpenLogoutConfirm();
      },
    },
    {
      key: 'accountDelete',
      text: '회원탈퇴',
      icon: 'user times',
      onClick: () => {
        setOpen(false);
        onOpenAccountDeleteModal();
      },
    },
  ];

  return (
    <Dropdown
      trigger={trigger}
      options={options}
      icon={null}
      pointing="top right"
      open={open}
      onClick={() => setOpen(!open)}
      onClose={() => setOpen(false)}
      style={{ marginLeft: '1rem' }}
    />
  );
}

export default ProfileButton;