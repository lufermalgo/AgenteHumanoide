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

async function generateTTS(voiceName: string, text: string): Promise<string> {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Falta REACT_APP_GEMINI_API_KEY en .env');

  const model = 'gemini-2.5-flash-preview-tts';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [{ text }]
      }
    ],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName } }
      }
    }
  } as any;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const parts: any[] = json?.candidates?.[0]?.content?.parts || [];
  const base64 = parts.find((p: any) => p?.inlineData?.data)?.inlineData?.data;
  if (!base64) throw new Error('No se recibió audio en la respuesta');

  const pcmBytes = Buffer.from(base64, 'base64');
  const outPath = path.resolve(`out/tts-${voiceName}.wav`);
  writeWavFromPCM16(pcmBytes, outPath, 24000, 1);
  return outPath;
}

async function main() {
  const text = 'Hola qué tal Fernando qué bueno saludarte, me gustaría mucho conocer un poco de ti. Cuéntame de tu rol en la compañía, tu cargo y lo que haces en el día a día.';
  const voices = ['Orus', 'Puck', 'Kore'];

  for (const v of voices) {
    console.log(`Generando voz ${v}...`);
    try {
      const file = await generateTTS(v, text);
      console.log(`Guardado: ${file}`);
      const { spawnSync } = await import('node:child_process');
      const play = spawnSync('afplay', [file], { stdio: 'inherit' });
      if (play.status !== 0) console.warn(`No se pudo reproducir ${file} con afplay.`);
    } catch (e: any) {
      console.error(`Error con voz ${v}:`, e?.message || e);
    }
  }

  console.log('Listo. Archivos en ./out');
}

main().catch((e) => {
  console.error('Error general:', e);
  process.exit(1);
});