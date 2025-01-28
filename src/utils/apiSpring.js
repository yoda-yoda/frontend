import axios from 'axios';
import Cookies from 'js-cookie';

// 쿠키에서 accessToken / refreshToken 꺼내기
function getTokens() {
  const accessToken = Cookies.get('accessToken');
  const refreshToken = Cookies.get('refreshToken');
  return { accessToken, refreshToken };
}

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: 'http://localhost:8082/spring', // 기본 URL 설정
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken, refreshToken } = getTokens();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (refreshToken) {
      config.headers['Refresh-Token'] = refreshToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;