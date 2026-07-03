import React, { useState } from 'react';
import { compressVideo, encodeVideoStego, decodeVideoStego } from '../utils/videoCodec';

const VideoStudio = () => {
  const [activeTab, setActiveTab] = useState('compress');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Compress States
  const [compressFile, setCompressFile] = useState(null);
  const [resolution, setResolution] = useState('854x480'); // 480p default
  const [compressedResult, setCompressedResult] = useState(null);

  // Stego Encode States
  const [encodeFile, setEncodeFile] = useState(null);
  const [secretMessage, setSecretMessage] = useState('');
  const [encodedResult, setEncodedResult] = useState(null);

  // Stego Decode States
  const [decodeFile, setDecodeFile] = useState(null);
  const [decodedMessage, setDecodedMessage] = useState('');

  const onProgress = (p) => setProgress(p);

  const handleCompressAction = async () => {
    if (!compressFile) return;
    setLoading(true);
    setError('');
    setProgress(0);
    try {
      const result = await compressVideo(compressFile, resolution, onProgress);
      setCompressedResult(result);
    } catch (err) {
      setError('Gagal mengompresi video. FFmpeg Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEncodeAction = async () => {
    if (!encodeFile || !secretMessage) return;
    setLoading(true);
    setError('');
    setProgress(0);
    try {
      const result = await encodeVideoStego(encodeFile, secretMessage, onProgress);
      setEncodedResult(result);
    } catch (err) {
      setError('Gagal menyisipkan pesan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecodeAction = async () => {
    if (!decodeFile) return;
    setLoading(true);
    setError('');
    setProgress(0);
    try {
      const text = await decodeVideoStego(decodeFile, onProgress);
      setDecodedMessage(text);
    } catch (err) {
      setError(err.message || 'Gagal mengekstrak metadata dari video.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          <span style={{ color: '#ec4899' }}>Video</span> Studio
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Powered by FFmpeg.wasm. Kompresi video dan sisipkan data ke dalam metadata secara langsung di browser Anda.
        </p>
        <div style={{ marginTop: '1rem', background: 'rgba(236, 72, 153, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(236, 72, 153, 0.2)', fontSize: '0.9rem' }}>
          <strong>Peringatan:</strong> Proses FFmpeg membutuhkan memori perangkat. Disarankan menggunakan video berdurasi pendek (kurang dari 1 menit) untuk uji coba.
        </div>
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
          🔒 Enkripsi (Metadata)
        </button>
        <button 
          onClick={() => setActiveTab('stego-decode')}
          style={{ background: activeTab === 'stego-decode' ? '#10b981' : 'transparent', color: activeTab === 'stego-decode' ? '#fff' : 'var(--text-secondary)', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500' }}>
          🔓 Dekripsi (Metadata)
        </button>
      </div>

      {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

      {/* LOADING PROGRESS */}
      {loading && (
        <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Memproses FFmpeg...</h3>
          <div style={{ width: '100%', background: 'var(--bg-secondary)', height: '10px', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, background: 'var(--accent-gradient)', height: '100%', transition: 'width 0.3s' }}></div>
          </div>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{progress}% Selesai</p>
        </div>
      )}

      {/* COMPRESS TAB */}
      {activeTab === 'compress' && !loading && (
        <div className="glass-card animate-fade-in">
          <h2 style={{ marginBottom: '1.5rem' }}>Kompresi Video</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pilih Video (.MP4)</label>
            <input type="file" accept="video/mp4" onChange={(e) => setCompressFile(e.target.files[0])} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
          </div>

          {compressFile && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                Target Resolusi
              </label>
              <select 
                value={resolution} onChange={(e) => setResolution(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: '#fff' }}>
                <option value="1280x720">720p (HD)</option>
                <option value="854x480">480p (SD)</option>
                <option value="640x360">360p (Kecil)</option>
              </select>
            </div>
          )}

          <button 
            onClick={handleCompressAction} 
            disabled={!compressFile}
            style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', cursor: !compressFile ? 'not-allowed' : 'pointer', opacity: !compressFile ? 0.5 : 1, fontWeight: 'bold' }}>
            Mulai Kompresi
          </button>

          {compressedResult && (
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-glass)' }}>
              <h3 style={{ marginBottom: '1rem', color: '#10b981' }}>✅ Video Selesai Dikompres</h3>
              <video controls src={compressedResult} style={{ width: '100%', maxWidth: '600px', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
              <div>
                <a href={compressedResult} download="compressed_video.mp4"
                  style={{ display: 'inline-block', background: '#10b981', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 'bold' }}>
                  ⬇️ Unduh Video (.mp4)
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEGO ENCODE TAB */}
      {activeTab === 'stego-encode' && !loading && (
        <div className="glass-card animate-fade-in">
          <h2 style={{ marginBottom: '1.5rem' }}>Sisipkan Pesan (Metadata)</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pilih Video (.MP4)</label>
            <input type="file" accept="video/mp4" onChange={(e) => setEncodeFile(e.target.files[0])} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pesan Rahasia</label>
            <textarea 
              value={secretMessage} onChange={(e) => setSecretMessage(e.target.value)}
              placeholder="Pesan ini akan disisipkan di dalam kode metadata video..."
              rows={4}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: '#fff', resize: 'vertical' }}
            />
          </div>

          <button 
            onClick={handleEncodeAction} 
            disabled={!encodeFile || !secretMessage}
            style={{ background: 'var(--accent-secondary)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', cursor: !encodeFile || !secretMessage ? 'not-allowed' : 'pointer', opacity: !encodeFile || !secretMessage ? 0.5 : 1, fontWeight: 'bold' }}>
            Sisipkan Pesan
          </button>

          {encodedResult && (
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-glass)' }}>
              <h3 style={{ marginBottom: '1rem', color: '#10b981' }}>✅ Metadata Disisipkan</h3>
              <video controls src={encodedResult} style={{ width: '100%', maxWidth: '600px', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
              <div>
                <a href={encodedResult} download="stego_video.mp4"
                  style={{ display: 'inline-block', background: '#10b981', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 'bold' }}>
                  ⬇️ Unduh Video Rahasia (.mp4)
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEGO DECODE TAB */}
      {activeTab === 'stego-decode' && !loading && (
        <div className="glass-card animate-fade-in">
          <h2 style={{ marginBottom: '1.5rem' }}>Ekstrak Pesan (Metadata)</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pilih Video Rahasia (.MP4)</label>
            <input type="file" accept="video/mp4" onChange={(e) => setDecodeFile(e.target.files[0])} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
          </div>

          <button 
            onClick={handleDecodeAction} 
            disabled={!decodeFile}
            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', cursor: !decodeFile ? 'not-allowed' : 'pointer', opacity: !decodeFile ? 0.5 : 1, fontWeight: 'bold' }}>
            Bongkar Metadata
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

export default VideoStudio;
