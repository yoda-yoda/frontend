import { useRecoilState } from "recoil";
import { connectionState, isMutedState, participantsState } from "../recoil/audioAtoms";

function useAudioChat() {
  const [connection, setConnection] = useRecoilState(connectionState);
  const [isMuted, setIsMuted] = useRecoilState(isMutedState);
  const [participants, setParticipants] = useRecoilState(participantsState);

  // Web Audio API Context 생성 (전역적으로 관리할 수 있음)
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const gainNodes = new Map(); // 참여자 ID를 키로 하는 GainNode 관리

  // 음소거 토글
  const toggleMute = (stream) => {
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!isMuted);
    }
  };

  // 참여자 업데이트
  const addParticipant = (participant) => {
    setParticipants((prev) => [...prev, participant]);

    // 참여자 볼륨 제어용 GainNode 생성
    const source = audioContext.createMediaStreamSource(participant.stream);
    const gainNode = audioContext.createGain();
    source.connect(gainNode).connect(audioContext.destination);

    // 기본 볼륨 설정 (1.0 = 원래 볼륨)
    gainNode.gain.value = 1.0;

    // GainNode를 참여자 ID로 관리
    gainNodes.set(participant.id, gainNode);
  };

    // 참여자 제거
  const removeParticipant = (participantId) => {
    setParticipants((prev) => prev.filter(p => p.id !== participantId));

    // GainNode 제거
    gainNodes.delete(participantId);

    // 웹소켓을 통해 서버에 참여자 제거 알림

  };

  // 볼륨 조절
  const setParticipantVolume = (participantId, volume) => {
    const gainNode = gainNodes.get(participantId);
    if (gainNode) {
      gainNode.gain.value = volume; // 0.0 (음소거) ~ 1.0 (최대 볼륨)
    }
  };

  // 연결 상태 변경
  const updateConnectionState = (state) => {
    setConnection(state);
  };

  return {
    connection,
    isMuted,
    participants,
    toggleMute,
    addParticipant,
    removeParticipant,
    updateConnectionState,
    setParticipantVolume,
  };
}

export default useAudioChat;
