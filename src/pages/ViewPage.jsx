import { useState, useEffect } from 'react'
import RelationshipTree from '../components/RelationshipTree'

function ViewPage() {
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
      <div className="page-content">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-content">
        <div className="error">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="tree-container">
      <RelationshipTree people={people} />
    </div>
  )
}

export default ViewPage