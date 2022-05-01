const iceServers: RTCIceServer[] = [
  {
    urls: 'stun:stun.l.google.com:19302',
  },
  {
    urls: 'stun:mrcprod.tk',
    username: "guest",
    credential: "guest"
  },
  {
    urls: 'turn:mrcprod.tk',
    username: "guest",
    credential: "guest"
  }
];

export function getIceServers() {
  return iceServers;
}
