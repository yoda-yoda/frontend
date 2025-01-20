import { atom, selector } from "recoil";

export const noteState = atom({
  key: "noteState",
  default: null,
});

// Y.js 문서 상태
export const yDocState = atom({
  key: "yDocState",
  default: null, // Y.Doc 인스턴스
});

// WebRTC 연결 상태
export const webRTCState = atom({
  key: "webRTCState",
  default: {
    peerConnection: null,
    dataChannel: null,
  },
});

// WebRTC 데이터 상태
export const webRTCDataState = atom({
  key: "webRTCDataState",
  default: [],
});

// Y.js 문서와 동기화된 데이터
export const ySyncDataState = selector({
  key: "ySyncDataState",
  get: ({ get }) => {
    const yDoc = get(yDocState);
    if (!yDoc) return [];
    const yXmlFragment = yDoc.getXmlFragment("prosemirror");
    return yXmlFragment.toString();
  },
});
