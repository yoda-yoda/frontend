import { atom } from "recoil";

// 오디오 연결 상태
export const connectionState = atom({
  key: "connectionState",
  default: "disconnected", // or "connected", "connecting"
});

// 음소거 상태
export const isMutedState = atom({
  key: "isMutedState",
  default: false,
});

// 참여자 목록
export const participantsState = atom({
  key: "participantsState",
  default: [], // { id: string, name: string, stream: MediaStream }
});
