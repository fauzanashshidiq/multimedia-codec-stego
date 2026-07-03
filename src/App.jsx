import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'

// Placeholder pages for empty routes
const ImageStudio = () => <div className="animate-fade-in"><h2>Image Studio</h2><p>Module coming soon...</p></div>
const AudioStudio = () => <div className="animate-fade-in"><h2>Audio Studio</h2><p>Module coming soon...</p></div>
const VideoStudio = () => <div className="animate-fade-in"><h2>Video Studio</h2><p>Module coming soon...</p></div>
const Team = () => <div className="animate-fade-in"><h2>Tentang Kelompok</h2><p>Module coming soon...</p></div>

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/image" element={<ImageStudio />} />
            <Route path="/audio" element={<AudioStudio />} />
            <Route path="/video" element={<VideoStudio />} />
            <Route path="/team" element={<Team />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
