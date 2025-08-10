import 'dotenv/config';
import fs from 'fs';
import path from 'path';

function writeWavFromPCM16(pcmBytes: Buffer, outPath: string, sampleRate = 24000, channels = 1) {
  const bitsPerSample = 16;
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const dataSize = pcmBytes.length;
  const chunkSize = 36 + dataSize;

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  const wavBuffer = Buffer.concat([header, pcmBytes]);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, wavBuffer);
}

async function main() {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Falta REACT_APP_GEMINI_API_KEY en .env');
    process.exit(1);
  }

  const model = 'gemini-2.5-flash-preview-tts';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = 'Habla en tono cercano y natural colombiano. Di: Hola, soy tu guía del assessment de Summan. ¿Listo para empezar?';

  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } }
      }
    }
  } as any;

  console.log('Solicitando audio TTS a Gemini...');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errTxt = await response.text();
    throw new Error(`HTTP ${response.status}: ${errTxt}`);
  }

  const json = await response.json();
  const parts: any[] = json?.candidates?.[0]?.content?.parts || [];

  let base64Audio: string | null = null;
  for (const p of parts) {
    if (p?.inlineData?.data) {
      base64Audio = p.inlineData.data;
      break;
    }
  }

  if (!base64Audio) {
    console.log('No llegó audio; respuesta:', JSON.stringify(json, null, 2));
    process.exit(0);
  }

  const pcmBytes = Buffer.from(base64Audio, 'base64');
  const outPath = path.resolve('out/gemini-audio.wav');
  writeWavFromPCM16(pcmBytes, outPath, 24000, 1);
  console.log(`Audio guardado en: ${outPath}`);

  const { spawnSync } = await import('node:child_process');
  const play = spawnSync('afplay', [outPath], { stdio: 'inherit' });
  if (play.status !== 0) {
    console.warn('No se pudo reproducir con afplay. Ábrelo manualmente.');
  }
}

main().catch((e) => {
  console.error('Error en la prueba de audio:', e);
  process.exit(1);
});