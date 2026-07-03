/**
 * Utility untuk Steganografi Audio menggunakan LSB pada format 16-bit PCM WAV
 */

import { decodeAudioData } from './audioCodec';

const textToBinary = (text) => {
  let binary = '';
  for (let i = 0; i < text.length; i++) {
    let bin = text.charCodeAt(i).toString(2);
    binary += bin.padStart(8, '0');
  }
  binary += '00000000'; // Delimiter akhir pesan
  return binary;
};

const binaryToText = (binary) => {
  let text = '';
  for (let i = 0; i < binary.length; i += 8) {
    let byte = binary.slice(i, i + 8);
    if (byte === '00000000') break;
    text += String.fromCharCode(parseInt(byte, 2));
  }
  return text;
};

// Menyisipkan teks rahasia ke dalam file Audio
export const encodeAudioStego = async (file, secretMessage) => {
  const { audioBuffer } = await decodeAudioData(file);
  const binaryMessage = textToBinary(secretMessage);
  
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels = [];
  let offset = 0;
  let pos = 0;

  // Tulis Header WAV
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(audioBuffer.sampleRate);
  setUint32(audioBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit
  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < numOfChan; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  let bitIndex = 0;

  // Proses kompilasi PCM dan penyisipan LSB
  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sampleFloat = Math.max(-1, Math.min(1, channels[i][offset]));
      // Konversi float ke 16-bit integer
      let sampleInt = sampleFloat < 0 ? sampleFloat * 0x8000 : sampleFloat * 0x7FFF;
      sampleInt = Math.floor(sampleInt);

      // Sisipkan 1 bit LSB ke data sampel audio jika masih ada sisa bit pesan
      if (bitIndex < binaryMessage.length) {
        const bit = parseInt(binaryMessage[bitIndex]);
        // Menghapus bit terakhir (LSB) dan menggantinya dengan bit pesan
        if (sampleInt % 2 !== 0) sampleInt -= Math.sign(sampleInt) * 1; 
        if (bit === 1) sampleInt += Math.sign(sampleInt) === -1 ? -1 : 1;
        bitIndex++;
      }

      view.setInt16(pos, sampleInt, true);
      pos += 2;
    }
    offset++;
  }

  function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }
  function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }

  const wavBlob = new Blob([bufferArray], { type: 'audio/wav' });
  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(wavBlob);
  });
  
  return dataUrl;
};

// Mengekstrak teks rahasia dari file Audio (WAV)
export const decodeAudioStego = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const view = new DataView(arrayBuffer);
  
  // Mencari letak chunk "data" secara dinamis (biasanya setelah header)
  let pos = 12; // Skip RIFF, size, WAVE
  while (pos < view.byteLength) {
    const chunkId = view.getUint32(pos, false);
    pos += 4;
    const chunkSize = view.getUint32(pos, true);
    pos += 4;
    
    // 0x64617461 adalah "data" (little endian untuk ASCII data)
    if (chunkId === 0x64617461 || chunkId === 0x61746164) {
      break; 
    }
    pos += chunkSize;
  }
  
  // Pos sekarang ada di awal data PCM
  let binaryMessage = '';
  
  // Baca LSB dari setiap sampel 16-bit
  while (pos < view.byteLength) {
    const sampleInt = view.getInt16(pos, true);
    pos += 2;
    
    const lsb = Math.abs(sampleInt % 2).toString();
    binaryMessage += lsb;
    
    // Cek apakah 8 bit terakhir adalah delimiter '00000000'
    if (binaryMessage.length % 8 === 0) {
      const lastByte = binaryMessage.slice(-8);
      if (lastByte === '00000000') {
        break;
      }
    }
    // Batasi pembacaan agar tidak lag jika file bukan stego
    if (binaryMessage.length > 50000) break;
  }
  
  return binaryToText(binaryMessage);
};
