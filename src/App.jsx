import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import ViewPage from './pages/ViewPage'
import EditorPage from './pages/EditorPage'

function App() {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return (
    <Router basename="/HowDoYouKnowThem">
      <div className="app">
        {isLocalhost && (
          <header className="app-header">
            <h1>How Do You Know Them?</h1>
            <nav className="app-nav">
              <Link to="/" className="nav-link">View</Link>
              <Link to="/edit" className="nav-link">Edit</Link>
            </nav>
          </header>
        )}
        <Routes>
          <Route path="/" element={<ViewPage />} />
          <Route path="/edit" element={<EditorPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
