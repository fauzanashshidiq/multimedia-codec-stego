/**
 * Utility untuk Kompresi dan Dekompresi Gambar menggunakan HTML5 Canvas
 */

// Kompresi gambar: mengecilkan resolusi dan menurunkan kualitas JPEG/WebP
export const compressImage = (file, quality = 0.7, maxWidth = 1920) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung rasio aspek jika lebar melebihi batas maksimal
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor sebagai webp atau jpeg dengan kualitas yang diturunkan
        const compressedDataUrl = canvas.toDataURL('image/webp', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Fungsi pembantu untuk mengunduh DataURL sebagai File
export const downloadDataUrl = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
