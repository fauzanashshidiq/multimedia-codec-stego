import React, { useState, useRef } from 'react';
import { compressImage, downloadDataUrl } from '../utils/imageCodec';
import { encodeStego, decodeStego } from '../utils/stegoLSB';

const ImageStudio = () => {
  const [activeTab, setActiveTab] = useState('compress'); // 'compress' | 'stego-encode' | 'stego-decode'
  
  // States for Compress
  const [compressFile, setCompressFile] = useState(null);
  const [compressQuality, setCompressQuality] = useState(0.7);
  const [compressedResult, setCompressedResult] = useState(null);
  
  // States for Stego Encode
  const [encodeFile, setEncodeFile] = useState(null);
  const [encodeImagePreview, setEncodeImagePreview] = useState(null);
  const [secretMessage, setSecretMessage] = useState('');
  const [encodedResult, setEncodedResult] = useState(null);
  
  // States for Stego Decode
  const [decodeFile, setDecodeFile] = useState(null);
  const [decodeImagePreview, setDecodeImagePreview] = useState(null);
  const [decodedMessage, setDecodedMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Handlers for Compress ---
  const handleCompressFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCompressFile(e.target.files[0]);
      setCompressedResult(null);
    }
  };

  const handleCompressAction = async () => {
    if (!compressFile) return;
    setLoading(true);
    try {
      const result = await compressImage(compressFile, compressQuality);
      setCompressedResult(result);
    } catch (err) {
      setError('Gagal mengompresi gambar.');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for Stego Encode ---
  const handleEncodeFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEncodeFile(file);
      setEncodedResult(null);
      
      const reader = new FileReader();
      reader.onload = (ev) => setEncodeImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEncodeAction = async () => {
    if (!encodeImagePreview || !secretMessage) return;
    setLoading(true);
    setError('');
    try {
      const result = await encodeStego(encodeImagePreview, secretMessage);
      setEncodedResult(result);
    } catch (err) {
      setError(err.message || 'Gagal menyisipkan pesan.');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for Stego Decode ---
  const handleDecodeFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDecodeFile(file);
      setDecodedMessage('');
      
      const reader = new FileReader();
      reader.onload = (ev) => setDecodeImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDecodeAction = async () => {
    if (!decodeImagePreview) return;
    setLoading(true);
    setError('');
    try {
      const text = await decodeStego(decodeImagePreview);
      if (!text) setError('Pesan rahasia tidak ditemukan atau rusak.');
      else setDecodedMessage(text);
    } catch (err) {
      setError('Gagal mengekstrak pesan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          <span className="text-gradient">Image</span> Studio
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Kompresi ukuran gambar dan steganografi pesan rahasia dengan LSB.
        </p>
      </header>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('compress')}
          style={{ background: activeTab === 'compress' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'compress' ? '#fff' : 'var(--text-secondary)', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500' }}>
          🗜️ Kompresi
        </button>
        <button 
          onClick={() => setActiveTab('stego-encode')}
          style={{ background: activeTab === 'stego-encode' ? 'var(--accent-secondary)' : 'transparent', color: activeTab === 'stego-encode' ? '#fff' : 'var(--text-secondary)', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500' }}>
          🔒 Enkripsi Pesan (Stego)
        </button>
        <button 
          onClick={() => setActiveTab('stego-decode')}
          style={{ background: activeTab === 'stego-decode' ? '#10b981' : 'transparent', color: activeTab === 'stego-decode' ? '#fff' : 'var(--text-secondary)', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500' }}>
          🔓 Dekripsi Pesan
        </button>
      </div>

      {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

      {/* TAB CONTENT: COMPRESS */}
      {activeTab === 'compress' && (
        <div className="glass-card animate-fade-in">
          <h2 style={{ marginBottom: '1.5rem' }}>Kompresi Gambar</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pilih Gambar (JPG, PNG)</label>
            <input type="file" accept="image/*" onChange={handleCompressFile} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
          </div>

          {compressFile && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                Kualitas Kompresi: {Math.round(compressQuality * 100)}%
              </label>
              <input 
                type="range" min="0.1" max="1" step="0.1" 
                value={compressQuality} onChange={(e) => setCompressQuality(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          )}

          <button 
            onClick={handleCompressAction} 
            disabled={!compressFile || loading}
            style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', cursor: !compressFile || loading ? 'not-allowed' : 'pointer', opacity: !compressFile || loading ? 0.5 : 1, fontWeight: 'bold' }}>
            {loading ? 'Memproses...' : 'Mulai Kompresi'}
          </button>

          {compressedResult && (
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-glass)' }}>
              <h3 style={{ marginBottom: '1rem', color: '#10b981' }}>✅ Hasil Kompresi</h3>
              <img src={compressedResult} alt="Compressed" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
              <div>
                <button 
                  onClick={() => downloadDataUrl(compressedResult, 'compressed.webp')}
                  style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 'bold' }}>
                  ⬇️ Unduh Hasil (.webp)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: STEGO ENCODE */}
      {activeTab === 'stego-encode' && (
        <div className="glass-card animate-fade-in">
          <h2 style={{ marginBottom: '1.5rem' }}>Sisipkan Pesan Rahasia</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pilih Gambar Cover (PNG/JPG)</label>
            <input type="file" accept="image/png, image/jpeg" onChange={handleEncodeFile} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pesan Rahasia</label>
            <textarea 
              value={secretMessage} onChange={(e) => setSecretMessage(e.target.value)}
              placeholder="Ketik pesan yang ingin disembunyikan..."
              rows={4}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: '#fff', resize: 'vertical' }}
            />
          </div>

          <button 
            onClick={handleEncodeAction} 
            disabled={!encodeImagePreview || !secretMessage || loading}
            style={{ background: 'var(--accent-secondary)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', cursor: !encodeImagePreview || !secretMessage || loading ? 'not-allowed' : 'pointer', opacity: !encodeImagePreview || !secretMessage || loading ? 0.5 : 1, fontWeight: 'bold' }}>
            {loading ? 'Memproses LSB...' : 'Sisipkan Pesan'}
          </button>

          {encodedResult && (
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-glass)' }}>
              <h3 style={{ marginBottom: '1rem', color: '#10b981' }}>✅ Gambar Berhasil Disisipkan</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>Penting: Gambar harus diunduh dan disimpan sebagai <strong>PNG</strong> agar pixel LSB tidak rusak oleh kompresi.</p>
              <img src={encodedResult} alt="Encoded Stego" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
              <div>
                <button 
                  onClick={() => downloadDataUrl(encodedResult, 'secret_image.png')}
                  style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 'bold' }}>
                  ⬇️ Unduh Gambar Rahasia (.png)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: STEGO DECODE */}
      {activeTab === 'stego-decode' && (
        <div className="glass-card animate-fade-in">
          <h2 style={{ marginBottom: '1.5rem' }}>Ekstrak Pesan Rahasia</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pilih Gambar Rahasia (.PNG)</label>
            <input type="file" accept="image/png" onChange={handleDecodeFile} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
          </div>

          <button 
            onClick={handleDecodeAction} 
            disabled={!decodeImagePreview || loading}
            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', cursor: !decodeImagePreview || loading ? 'not-allowed' : 'pointer', opacity: !decodeImagePreview || loading ? 0.5 : 1, fontWeight: 'bold' }}>
            {loading ? 'Mengekstrak...' : 'Bongkar Pesan'}
          </button>

          {decodedMessage && (
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-glass)' }}>
              <h3 style={{ marginBottom: '1rem', color: '#10b981' }}>🔓 Pesan Ditemukan:</h3>
              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <code style={{ color: '#fff', whiteSpace: 'pre-wrap' }}>{decodedMessage}</code>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ImageStudio;
