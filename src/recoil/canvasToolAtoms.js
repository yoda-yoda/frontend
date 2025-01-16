import { atom } from 'recoil';

export const toolState = atom({
  key: 'toolState',
  default: 'pencil',
});

export const colorState = atom({
  key: 'colorState',
  default: '#000000',
});