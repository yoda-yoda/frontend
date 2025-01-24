import React from 'react';
import { Modal, Button, Icon, Header } from 'semantic-ui-react';

// 필요하다면 SVG 아이콘 경로를 실제로 교체
import GoogleIcon from '../../assets/google.svg';
import KakaoIcon from '../../assets/kakao.svg';
import NaverIcon from '../../assets/naver.svg';

function LoginModal({ open, onClose }) {
  // 소셜 로그인
  const handleOAuthLogin = (provider) => {
    // 서버 OAuth2 라우트 주소로 이동
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  };

  return (
    <Modal open={open} onClose={onClose} size="mini">
      <Header icon="sign in" content="로그인 / 회원가입" />
      <Modal.Content>
        <p style={{ textAlign: 'center', marginBottom: '1em' }}>
          최초 로그인 시 회원가입이 자동으로 진행됩니다!
        </p>
        {/* 아이콘 */}
        <div style={styles.oauthIcons}>
          {/* 구글 */}
          <div
            style={styles.iconWrapper}
            onClick={() => handleOAuthLogin('google')}
            role="button"
            tabIndex={0}
          >
            <img src={GoogleIcon} alt="Google Login" style={styles.icon} />
          </div>

          {/* 네이버 */}
          <div
            style={{ ...styles.iconWrapper, ...styles.naverIconWrapper }}
            onClick={() => handleOAuthLogin('naver')}
            role="button"
            tabIndex={0}
          >
            <img src={NaverIcon} alt="Naver Login" style={styles.icon} />
          </div>

          {/* 카카오 */}
          <div
            style={styles.iconWrapper}
            onClick={() => handleOAuthLogin('kakao')}
            role="button"
            tabIndex={0}
          >
            <img src={KakaoIcon} alt="Kakao Login" style={styles.icon} />
          </div>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button color="grey" onClick={onClose}>
          <Icon name="remove" /> 닫기
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

const styles = {
  oauthIcons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    cursor: 'pointer',
    margin: '0.5rem 0',
  },
  iconWrapper: {
    display: 'inline-block',
  },
  icon: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
  },
  naverIconWrapper: {
    overflow: 'hidden',
  },
};

export default LoginModal;
