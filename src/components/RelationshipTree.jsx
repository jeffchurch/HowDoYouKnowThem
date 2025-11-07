import { useState, useEffect, useRef } from 'react'
import './RelationshipTree.css'
import PersonCard from './PersonCard'

const RelationshipTree = ({ people, centerPerson }) => {
  const [positions, setPositions] = useState([])
  const containerRef = useRef(null)
  const [selectedPerson, setSelectedPerson] = useState(null)

  useEffect(() => {
    if (!people || people.length === 0) return

    // Calculate positions using a network-based layout
    const calculatePositions = () => {
      const container = containerRef.current
      if (!container) return []

      const width = container.clientWidth
      const height = container.clientHeight
      const centerX = width / 2
      const centerY = height / 2

      const baseRadius = Math.min(width, height) * 0.4
      const secondaryRadius = baseRadius * 0.8 // Distance from primary nodes

      // Separate people into those connected to center and those who aren't
      const connectedToCenter = []
      const notConnectedToCenter = []

      people.forEach(person => {
        if (person.connections && person.connections.includes(centerPerson)) {
          connectedToCenter.push(person)
        } else {
          notConnectedToCenter.push(person)
        }
      })

      const positions = []
      const positionMap = new Map()

      // Position people connected to center in a circle
      connectedToCenter.forEach((person, index) => {
        const angle = (index / connectedToCenter.length) * 2 * Math.PI - Math.PI / 2
        const x = centerX + baseRadius * Math.cos(angle)
        const y = centerY + baseRadius * Math.sin(angle)

        const pos = {
          ...person,
          x,
          y,
          angle
        }
        positions.push(pos)
        positionMap.set(person.name, pos)
      })

      // Position people not connected to center near their first connection
      const positioned = new Set(connectedToCenter.map(p => p.name))
      const queue = [...notConnectedToCenter]
      let attempts = 0
      const maxAttempts = queue.length * 3

      while (queue.length > 0 && attempts < maxAttempts) {
        attempts++
        const person = queue.shift()

        // Find first connection that's already positioned
        const anchorConnection = person.connections?.find(conn => 
          positionMap.has(conn) || conn === centerPerson
        )

        if (anchorConnection) {
          let anchorX, anchorY

          if (anchorConnection === centerPerson) {
            anchorX = centerX
            anchorY = centerY
          } else {
            const anchor = positionMap.get(anchorConnection)
            anchorX = anchor.x
            anchorY = anchor.y
          }

          // Count how many people are already positioned around this anchor
          const siblingsAroundAnchor = positions.filter(p => 
            p.connections?.includes(anchorConnection) && p.name !== person.name
          ).length

          // Position in a circle around the anchor
          const angle = (siblingsAroundAnchor * (Math.PI * 2 / 6)) + Math.random() * 0.3
          const x = anchorX + secondaryRadius * Math.cos(angle)
          const y = anchorY + secondaryRadius * Math.sin(angle)

          const pos = {
            ...person,
            x,
            y,
            angle
          }
          positions.push(pos)
          positionMap.set(person.name, pos)
          positioned.add(person.name)
        } else {
          // No positioned connection yet, put back in queue
          queue.push(person)
        }
      }

      // If any people still aren't positioned (isolated nodes), place them in outer ring
      queue.forEach((person, index) => {
        const angle = (index / queue.length) * 2 * Math.PI
        const x = centerX + (baseRadius * 1.5) * Math.cos(angle)
        const y = centerY + (baseRadius * 1.5) * Math.sin(angle)

        positions.push({
          ...person,
          x,
          y,
          angle
        })
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

          // Draw lines based on the connections array
          if (!person.connections || person.connections.length === 0) return null

          return person.connections.map((connectionName, connIndex) => {
            // Check if connecting to center person
            if (connectionName === centerPerson) {
              return (
                <line
                  key={`line-${index}-${connIndex}`}
                  x1={centerX}
                  y1={centerY}
                  x2={person.x}
                  y2={person.y}
                  className="connection-line"
                  strokeWidth={selectedPerson?.name === person.name ? "3" : "2"}
                />
              )
            }

            // Find the connected person in positions
            const connectedPerson = positions.find(p => p.name === connectionName)
            if (!connectedPerson) return null

            // Only draw each line once (from person with lower index to higher index)
            const connectedIndex = positions.findIndex(p => p.name === connectionName)
            if (connectedIndex < index) return null

            return (
              <line
                key={`line-${index}-${connIndex}`}
                x1={person.x}
                y1={person.y}
                x2={connectedPerson.x}
                y2={connectedPerson.y}
                className="connection-line"
                strokeWidth={
                  (selectedPerson?.name === person.name || selectedPerson?.name === connectionName) ? "3" : "2"
                }
              />
            )
          })
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