import axios from 'axios';
import Cookies from 'js-cookie';

// 쿠키에서 accessToken / refreshToken 꺼내기
function getTokens() {
  const accessToken = Cookies.get('accessToken');
  const refreshToken = Cookies.get('refreshToken');
  return { accessToken, refreshToken };
}

// 로그아웃 (POST /auth/logout)
export async function logoutUser() {
  const { accessToken, refreshToken } = getTokens();

  const response = await axios.post('api/auth/logout', null, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Refresh-Token': refreshToken,
    },
  });

  // 로그아웃 후 쿠키 정리 (프론트단)
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');

  return response.data;
}

// 회원탈퇴 (DELETE /auth)
export async function deleteUser() {
  const { accessToken } = getTokens();

  const response = await axios.delete('api/auth', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // 탈퇴 후 쿠키 정리
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');

  return response.data;
}

// 닉네임 변경 (PATCH /member/nicknames)
export async function updateNickname(newNickname) {
  const { accessToken } = getTokens();

  const response = await axios.patch(
    '/api/member/nicknames',
    { nickname: newNickname },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  // 응답
  return response.data;
}
