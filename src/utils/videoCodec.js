/**
 * Utility untuk Pemrosesan Video menggunakan FFmpeg.wasm
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpegInstance = null;

// Menginisialisasi FFmpeg
export const initFFmpeg = async (onProgress) => {
  if (ffmpegInstance) return ffmpegInstance;

  const ffmpeg = new FFmpeg();
  
  if (onProgress) {
    ffmpeg.on('progress', ({ progress, time }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  // Load core dari CDN agar lebih ringan di repo
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  ffmpegInstance = ffmpeg;
  return ffmpeg;
};

// Helper untuk fetch core url karena terkadang terkendala CORS
const toBlobURL = async (url, mimeType) => {
  const resp = await fetch(url);
  const blob = await resp.blob();
  return URL.createObjectURL(new Blob([blob], { type: mimeType }));
};

// --- Fungsi Kompresi Video ---
export const compressVideo = async (file, resolution = '640x480', onProgress) => {
  const ffmpeg = await initFFmpeg(onProgress);
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // Jalankan perintah kompresi (Ubah resolusi dan preset fast)
  await ffmpeg.exec(['-i', inputName, '-s', resolution, '-c:v', 'libx264', '-preset', 'fast', '-crf', '28', outputName]);

  const data = await ffmpeg.readFile(outputName);
  
  const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
  return URL.createObjectURL(videoBlob);
};

// --- Fungsi Steganografi Video ---
// Karena steganografi video (LSB per frame) di browser sangat berat, 
// pendekatan paling praktis untuk web-app adalah menyisipkan pesan di Metadata (Metadata Steganography)
export const encodeVideoStego = async (file, secretMessage, onProgress) => {
  const ffmpeg = await initFFmpeg(onProgress);
  const inputName = 'input.mp4';
  const outputName = 'output_stego.mp4';

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // Menyisipkan pesan ke dalam metadata "comment" atau "title"
  // -metadata comment="pesan rahasia"
  await ffmpeg.exec(['-i', inputName, '-c', 'copy', '-metadata', `comment=${secretMessage}`, outputName]);

  const data = await ffmpeg.readFile(outputName);
  
  const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
  return URL.createObjectURL(videoBlob);
};

export const decodeVideoStego = async (file, onProgress) => {
  const ffmpeg = await initFFmpeg(onProgress);
  const inputName = 'input_stego.mp4';
  const outputName = 'metadata.txt';

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // Ekstrak informasi format FFmpeg ke file teks (mengandung metadata)
  await ffmpeg.exec(['-i', inputName, '-f', 'ffmetadata', outputName]);

  const data = await ffmpeg.readFile(outputName);
  const textDecoder = new TextDecoder('utf-8');
  const metadataText = textDecoder.decode(data);

  // Cari baris "comment="
  const match = metadataText.match(/comment=(.*)/);
  if (match && match[1]) {
    return match[1];
  }
  
  throw new Error("Pesan rahasia tidak ditemukan di metadata video.");
};
