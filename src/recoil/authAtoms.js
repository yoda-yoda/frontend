import { atom } from "recoil";

// 로그인여부 + 닉네임
export const authState = atom({
  key: 'authState',
  default: {
    isLogin: false,
    nickname: '',
  },
});