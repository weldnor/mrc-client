const iceServers: RTCIceServer[] = [
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
