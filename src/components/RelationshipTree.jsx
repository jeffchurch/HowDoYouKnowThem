import { useState, useEffect, useRef } from 'react'
import './RelationshipTree.css'
import PersonCard from './PersonCard'

const RelationshipTree = ({ people, centerPerson }) => {
  const [positions, setPositions] = useState([])
  const containerRef = useRef(null)
  const [selectedPerson, setSelectedPerson] = useState(null)

  useEffect(() => {
    if (!people || people.length === 0) return

    // Calculate positions for people in a circular layout around the center
    const calculatePositions = () => {
      const container = containerRef.current
      if (!container) return []

      const width = container.clientWidth
      const height = container.clientHeight
      const centerX = width / 2
      const centerY = height / 2

      // Responsive radius based on screen size
      const radius = Math.min(width, height) * 0.35

      const positions = people.map((person, index) => {
        const angle = (index / people.length) * 2 * Math.PI - Math.PI / 2
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)

        return {
          ...person,
          x,
          y,
          angle
        }
      })

      return positions
    }

    const updatePositions = () => {
      setPositions(calculatePositions())
    }

    updatePositions()
    window.addEventListener('resize', updatePositions)

    return () => {
      window.removeEventListener('resize', updatePositions)
    }
  }, [people])

  const handlePersonClick = (person) => {
    setSelectedPerson(selectedPerson?.name === person.name ? null : person)
  }

  return (
    <div className="relationship-tree" ref={containerRef}>
      <svg className="connections-svg">
        {positions.map((person, index) => {
          const container = containerRef.current
          if (!container) return null

          const centerX = container.clientWidth / 2
          const centerY = container.clientHeight / 2

          return (
            <line
              key={`line-${index}`}
              x1={centerX}
              y1={centerY}
              x2={person.x}
              y2={person.y}
              className="connection-line"
              strokeWidth={selectedPerson?.name === person.name ? "3" : "2"}
            />
          )
        })}
      </svg>

      {/* Center person (You) */}
      <div
        className="person-node center-person"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="person-avatar center-avatar">
          <span className="person-initial">J</span>
        </div>
        <div className="person-name">{centerPerson}</div>
        <div className="person-label">Me</div>
      </div>

      {/* Connected people */}
      {positions.map((person, index) => (
        <PersonCard
          key={index}
          person={person}
          isSelected={selectedPerson?.name === person.name}
          onClick={() => handlePersonClick(person)}
        />
      ))}

      {/* Info panel for selected person */}
      {selectedPerson && (
        <div className="info-panel">
          <button 
            className="close-button"
            onClick={() => setSelectedPerson(null)}
          >
            ×
          </button>
          <h3>{selectedPerson.name}</h3>
          <div className="info-row">
            <span className="info-label">Relationship:</span>
            <span className="info-value">{selectedPerson.relationship}</span>
          </div>
          {selectedPerson.note && (
            <div className="info-row">
              <span className="info-label">Note:</span>
              <span className="info-value">{selectedPerson.note}</span>
            </div>
          )}
          {selectedPerson.connections && selectedPerson.connections.length > 0 && (
            <div className="info-row">
              <span className="info-label">Also knows:</span>
              <div className="connections-list">
                {selectedPerson.connections.map((conn, idx) => (
                  <span key={idx} className="connection-tag">
                    {conn}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RelationshipTree