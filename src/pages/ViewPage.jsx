import { useState, useEffect } from 'react'
import RelationshipTree from '../components/RelationshipTree'
import relationshipsData from '../data/relationships.json'

function ViewPage() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      setPeople(relationshipsData)
      setLoading(false)
    } catch (err) {
      setError('Failed to load data')
      setLoading(false)
    }
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