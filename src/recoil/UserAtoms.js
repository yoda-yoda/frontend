// src/atoms/userAtom.js
import { atom } from 'recoil';

export const userState = atom({
  key: 'userState',
  default: {
    isLogin: false,
    memberId: null,
    email: '',
    nickname: '',
    profileImage: '',
  },
});
