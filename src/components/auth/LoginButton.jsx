import React from 'react';
import { Button, Icon } from 'semantic-ui-react';

function LoginButton({ onClick }) {
  return (
    <Button primary onClick={onClick}>
      <Icon name="sign in" />
      로그인
    </Button>
  );
}

export default LoginButton;