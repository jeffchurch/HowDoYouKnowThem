import { useState, useEffect } from 'react'
import './App.css'
import RelationshipTree from './components/RelationshipTree'

function App() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Load the JSON data
    fetch('/data/relationships.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load data')
        }
        return response.json()
      })
      .then(data => {
        setPeople(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>How Do You Know Them?</h1>
      </header>
      <RelationshipTree people={people} centerPerson="Jeff Church" />
    </div>
  )
}

export default App
