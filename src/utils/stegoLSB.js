/**
 * Utility untuk Steganografi LSB (Least Significant Bit) pada Gambar
 */

// Konversi string ke array biner
const textToBinary = (text) => {
  let binary = '';
  for (let i = 0; i < text.length; i++) {
    let bin = text.charCodeAt(i).toString(2);
    binary += bin.padStart(8, '0');
  }
  // Tambahkan delimiter (penanda akhir pesan) berupa null character 8 bit
  binary += '00000000'; 
  return binary;
};

// Konversi array biner ke string
const binaryToText = (binary) => {
  let text = '';
  for (let i = 0; i < binary.length; i += 8) {
    let byte = binary.slice(i, i + 8);
    if (byte === '00000000') break; // Hentikan pembacaan di delimiter
    text += String.fromCharCode(parseInt(byte, 2));
  }
  return text;
};

// Encode pesan rahasia ke dalam gambar
export const encodeStego = (imgSource, secretMessage) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imgSource;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const binaryMessage = textToBinary(secretMessage);
      
      // Kapasitas mengecek apakah gambar muat untuk menampung pesan
      // Setiap pixel memiliki 4 channel (R, G, B, A). Kita pakai R, G, B (3 bit per pixel).
      if (binaryMessage.length > (data.length / 4) * 3) {
        return reject(new Error('Pesan terlalu panjang untuk ukuran gambar ini!'));
      }

      let bitIndex = 0;
      for (let i = 0; i < data.length; i += 4) {
        // Encode di Red channel
        if (bitIndex < binaryMessage.length) {
          data[i] = (data[i] & ~1) | parseInt(binaryMessage[bitIndex]);
          bitIndex++;
        }
        // Encode di Green channel
        if (bitIndex < binaryMessage.length) {
          data[i + 1] = (data[i + 1] & ~1) | parseInt(binaryMessage[bitIndex]);
          bitIndex++;
        }
        // Encode di Blue channel
        if (bitIndex < binaryMessage.length) {
          data[i + 2] = (data[i + 2] & ~1) | parseInt(binaryMessage[bitIndex]);
          bitIndex++;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      // Harus di-export sebagai PNG (lossless) karena JPEG (lossy) akan merusak pixel LSB!
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => reject(err);
  });
};

// Decode pesan rahasia dari gambar
export const decodeStego = (imgSource) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imgSource;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      let binaryMessage = '';
      let currentByte = '';

      for (let i = 0; i < data.length; i += 4) {
        // Ambil bit LSB dari R, G, B
        binaryMessage += (data[i] & 1).toString();
        binaryMessage += (data[i + 1] & 1).toString();
        binaryMessage += (data[i + 2] & 1).toString();
      }

      const text = binaryToText(binaryMessage);
      resolve(text);
    };
    img.onerror = (err) => reject(err);
  });
};
