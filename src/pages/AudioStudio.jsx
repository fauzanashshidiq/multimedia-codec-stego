import React, { useState } from 'react';
import { compressAudio } from '../utils/audioCodec';
import { encodeAudioStego, decodeAudioStego } from '../utils/stegoAudio';
import { downloadDataUrl } from '../utils/imageCodec'; // We can reuse the download helper

const AudioStudio = () => {
  const [activeTab, setActiveTab] = useState('compress');
  
  // Compress States
  const [compressFile, setCompressFile] = useState(null);
  const [sampleRate, setSampleRate] = useState(16000);
  const [compressedResult, setCompressedResult] = useState(null);
  
  // Decompress States
  const [decompressFile, setDecompressFile] = useState(null);
  const [decompressPreview, setDecompressPreview] = useState(null);
  const [decompressInfo, setDecompressInfo] = useState('');
  
  // Stego Encode States
  const [encodeFile, setEncodeFile] = useState(null);
  const [secretMessage, setSecretMessage] = useState('');
  const [encodedResult, setEncodedResult] = useState(null);
  
  // Stego Decode States
  const [decodeFile, setDecodeFile] = useState(null);
  const [decodedMessage, setDecodedMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Handlers ---
  const handleCompressAction = async () => {
    if (!compressFile) return;
    setLoading(true);
    setError('');
    try {
      const result = await compressAudio(compressFile, sampleRate);
      setCompressedResult(result);
    } catch (err) {
      setError('Gagal mengompresi audio. Pastikan file valid.');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for Decompress ---
  const handleDecompressFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDecompressFile(file);
      setDecompressPreview(null);
      setDecompressInfo(`Ukuran File: ${(file.size / 1024).toFixed(2)} KB | Tipe: ${file.type}`);
    }
  };

  const handleDecompressAction = () => {
    if (!decompressFile) return;
    setLoading(true);
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setDecompressPreview(ev.target.result);
        setLoading(false);
      };
      reader.readAsDataURL(decompressFile);
    }, 800);
  };


  const handleEncodeAction = async () => {
    if (!encodeFile || !secretMessage) return;
    setLoading(true);
    setError('');
    try {
      const result = await encodeAudioStego(encodeFile, secretMessage);
      setEncodedResult(result);
    } catch (err) {
      setError(err.message || 'Gagal menyisipkan pesan pada audio.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecodeAction = async () => {
    if (!decodeFile) return;
    setLoading(true);
    setError('');
    try {
      const text = await decodeAudioStego(decodeFile);
      if (!text || text.length === 0) setError('Pesan rahasia tidak ditemukan.');
      else setDecodedMessage(text);
    } catch (err) {
      setError('Gagal mengekstrak pesan dari audio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          <span className="text-gradient">Audio</span> Studio
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Kompresi audio dengan manipulasi sample rate & sisipkan pesan rahasia di gelombang suara.
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
          onClick={() => setActiveTab('decompress')}
          style={{ background: activeTab === 'decompress' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'decompress' ? '#fff' : 'var(--text-secondary)', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500' }}>
          🎵 Dekompresi
        </button>
        <button 
          onClick={() => setActiveTab('stego-encode')}
          style={{ background: activeTab === 'stego-encode' ? 'var(--accent-secondary)' : 'transparent', color: activeTab === 'stego-encode' ? '#fff' : 'var(--text-secondary)', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500' }}>
          🔒 Enkripsi Pesan
        </button>
        <button 
          onClick={() => setActiveTab('stego-decode')}
          style={{ background: activeTab === 'stego-decode' ? '#10b981' : 'transparent', color: activeTab === 'stego-decode' ? '#fff' : 'var(--text-secondary)', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500' }}>
          🔓 Dekripsi Pesan
        </button>
      </div>

      {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

      {/* COMPRESS TAB */}
      {activeTab === 'compress' && (
        <div className="glass-card animate-fade-in">
          <h2 style={{ marginBottom: '1.5rem' }}>Kompresi Audio (Downsampling)</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pilih File Audio (MP3/WAV/OGG)</label>
            <input type="file" accept="audio/*" onChange={(e) => setCompressFile(e.target.files[0])} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
          </div>

          {compressFile && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                Target Sample Rate: {sampleRate} Hz
              </label>
              <select 
                value={sampleRate} onChange={(e) => setSampleRate(Number(e.target.value))}
                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: '#fff' }}>
                <option value="44100">44100 Hz (Kualitas CD - Besar)</option>
                <option value="22050">22050 Hz (Radio - Sedang)</option>
                <option value="16000">16000 Hz (Voice - Kecil)</option>
                <option value="8000">8000 Hz (Telepon - Sangat Kecil)</option>
              </select>
            </div>
          )}

          <button 
            onClick={handleCompressAction} 
            disabled={!compressFile || loading}
            style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', cursor: !compressFile || loading ? 'not-allowed' : 'pointer', opacity: !compressFile || loading ? 0.5 : 1, fontWeight: 'bold' }}>
            {loading ? 'Memproses Audio...' : 'Mulai Kompresi'}
          </button>

          {compressedResult && (
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-glass)' }}>
              <h3 style={{ marginBottom: '1rem', color: '#10b981' }}>✅ Berhasil Dikompresi</h3>
              <audio controls src={compressedResult} style={{ width: '100%', marginBottom: '1rem' }} />
              <div>
                <button 
                  onClick={() => downloadDataUrl(compressedResult, 'compressed_audio.wav')}
                  style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 'bold' }}>
                  ⬇️ Unduh Audio (.wav)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DECOMPRESS TAB */}
      {activeTab === 'decompress' && (
        <div className="glass-card animate-fade-in">
          <h2 style={{ marginBottom: '1.5rem' }}>Dekompresi Audio</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Unggah audio hasil kompresi untuk melihat ukurannya dan mendekode gelombangnya agar bisa diputar.
          </p>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pilih Audio Terkompresi</label>
            <input type="file" accept="audio/*" onChange={handleDecompressFile} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
          </div>

          <button 
            onClick={handleDecompressAction} 
            disabled={!decompressFile || loading}
            style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', cursor: !decompressFile || loading ? 'not-allowed' : 'pointer', opacity: !decompressFile || loading ? 0.5 : 1, fontWeight: 'bold' }}>
            {loading ? 'Mendekompresi ke Memori...' : 'Mulai Dekompresi (Putar)'}
          </button>

          {decompressPreview && (
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-glass)' }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#10b981' }}>✅ Audio Berhasil Didekompresi</h3>
              <p style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontWeight: 'bold' }}>{decompressInfo}</p>
              <audio controls src={decompressPreview} style={{ width: '100%', marginBottom: '1rem' }} />
            </div>
          )}
        </div>
      )}

      {/* STEGO ENCODE TAB */}
      {activeTab === 'stego-encode' && (
        <div className="glass-card animate-fade-in">
          <h2 style={{ marginBottom: '1.5rem' }}>Sisipkan Pesan ke Audio</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pilih Audio Cover (Disarankan WAV)</label>
            <input type="file" accept="audio/*" onChange={(e) => setEncodeFile(e.target.files[0])} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
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
            disabled={!encodeFile || !secretMessage || loading}
            style={{ background: 'var(--accent-secondary)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', cursor: !encodeFile || !secretMessage || loading ? 'not-allowed' : 'pointer', opacity: !encodeFile || !secretMessage || loading ? 0.5 : 1, fontWeight: 'bold' }}>
            {loading ? 'Menyisipkan Pesan...' : 'Sisipkan Pesan'}
          </button>

          {encodedResult && (
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-glass)' }}>
              <h3 style={{ marginBottom: '1rem', color: '#10b981' }}>✅ Audio Rahasia Selesai</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>Penting: File harus disimpan sebagai <strong>WAV (Lossless)</strong> agar data rahasia tidak terhapus.</p>
              <audio controls src={encodedResult} style={{ width: '100%', marginBottom: '1rem' }} />
              <div>
                <button 
                  onClick={() => downloadDataUrl(encodedResult, 'secret_audio.wav')}
                  style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 'bold' }}>
                  ⬇️ Unduh Audio Rahasia (.wav)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEGO DECODE TAB */}
      {activeTab === 'stego-decode' && (
        <div className="glass-card animate-fade-in">
          <h2 style={{ marginBottom: '1.5rem' }}>Ekstrak Pesan dari Audio</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pilih Audio Rahasia (.WAV)</label>
            <input type="file" accept="audio/wav" onChange={(e) => setDecodeFile(e.target.files[0])} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
          </div>

          <button 
            onClick={handleDecodeAction} 
            disabled={!decodeFile || loading}
            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', cursor: !decodeFile || loading ? 'not-allowed' : 'pointer', opacity: !decodeFile || loading ? 0.5 : 1, fontWeight: 'bold' }}>
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

export default AudioStudio;
