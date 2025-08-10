export function createBlob(pcmData: Float32Array): Blob {
  const buffer = new ArrayBuffer(pcmData.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < pcmData.length; i++) {
    const multiplier = pcmData[i] < 0 ? 0x8000 : 0x7fff;
    const value = Math.floor(pcmData[i] * multiplier);
    view.setInt16(i * 2, value, true);
  }
  return new Blob([buffer], { type: 'audio/raw' });
}

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  bytes: Uint8Array,
  audioContext: AudioContext,
  sampleRate: number,
  channels: number
): Promise<AudioBuffer> {
  const buffer = audioContext.createBuffer(channels, bytes.length / 2, sampleRate);
  const channelData = buffer.getChannelData(0);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < bytes.length / 2; i++) {
    channelData[i] = view.getInt16(i * 2, true) / 0x8000;
  }
  return buffer;
}