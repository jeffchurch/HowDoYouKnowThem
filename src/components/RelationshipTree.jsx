import { useState, useEffect, useRef } from 'react'
import './RelationshipTree.css'
import PersonCard from './PersonCard'

const RelationshipTree = ({ people }) => {
  const [positions, setPositions] = useState([])
  const containerRef = useRef(null)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    if (!people || people.length === 0) return

    // Calculate positions using a network-based layout
    const calculatePositions = () => {
      const container = containerRef.current
      if (!container) return []

      const verticalSpacing = 200 // Vertical distance between levels
      const horizontalSpacing = 180 // Horizontal spacing between nodes

      // Build a hierarchical tree layout using breadth-first search
      if (people.length === 0) return []
      
      const positions = []
      const positionMap = new Map()
      const levels = [] // Track people by level
      const nodeLevel = new Map() // Track which level each person belongs to
      
      // Build bidirectional connection map
      // If A lists B as connection, B should also be connected to A
      const connectionMap = new Map()
      people.forEach(person => {
        if (!connectionMap.has(person.name)) {
          connectionMap.set(person.name, new Set())
        }
        person.connections?.forEach(connName => {
          // Add forward connection (person -> connName)
          connectionMap.get(person.name).add(connName)
          // Add reverse connection (connName -> person)
          if (!connectionMap.has(connName)) {
            connectionMap.set(connName, new Set())
          }
          connectionMap.get(connName).add(person.name)
        })
      })
      
      // Start with the first person (root) at level 0
      const rootPerson = people[0]
      levels[0] = [rootPerson]
      nodeLevel.set(rootPerson.name, 0)
      
      // Build levels using breadth-first search
      // Each level contains people who are exactly N connections away from root
      let currentLevelIndex = 0
      
      while (currentLevelIndex < levels.length) {
        const currentLevelPeople = levels[currentLevelIndex]
        const nextLevelPeople = []
        
        currentLevelPeople.forEach(person => {
          // Find all connections (bidirectional) that haven't been assigned a level yet
          const connections = connectionMap.get(person.name) || new Set()
          
          connections.forEach(connName => {
            const connectedPerson = people.find(p => p.name === connName)
            
            // Only add if not already assigned to a level
            if (connectedPerson && !nodeLevel.has(connName)) {
              nextLevelPeople.push(connectedPerson)
              nodeLevel.set(connName, currentLevelIndex + 1)
            }
          })
        })
        
        // Remove duplicates from next level (in case multiple people connect to same person)
        const uniqueNextLevel = Array.from(new Set(nextLevelPeople.map(p => p.name)))
          .map(name => people.find(p => p.name === name))
        
        if (uniqueNextLevel.length > 0) {
          levels[currentLevelIndex + 1] = uniqueNextLevel
        }
        
        currentLevelIndex++
      }
      
      // Calculate the maximum width needed for any level
      let maxLevelWidth = 0
      levels.forEach(levelPeople => {
        const levelWidth = (levelPeople.length - 1) * horizontalSpacing
        if (levelWidth > maxLevelWidth) {
          maxLevelWidth = levelWidth
        }
      })
      
      // Position nodes in each level, centered based on max width
      const padding = 300 // Padding on each side
      const baseX = padding + maxLevelWidth / 2
      
      levels.forEach((levelPeople, levelIndex) => {
        const levelWidth = (levelPeople.length - 1) * horizontalSpacing
        const startX = baseX - levelWidth / 2
        const y = 100 + levelIndex * verticalSpacing // Start from top with padding
        
        levelPeople.forEach((person, index) => {
          const x = startX + index * horizontalSpacing
          const pos = {
            ...person,
            x,
            y,
            level: levelIndex // Store level for reference
          }
          positions.push(pos)
          positionMap.set(person.name, pos)
        })
      })
      
      // Handle any unconnected nodes (people not connected to the root at all)
      const unconnectedNodes = []
      people.forEach(person => {
        if (!nodeLevel.has(person.name)) {
          unconnectedNodes.push(person)
        }
      })
      
      if (unconnectedNodes.length > 0) {
        const unconnectedY = 100 + levels.length * verticalSpacing
        const unconnectedWidth = (unconnectedNodes.length - 1) * horizontalSpacing
        const unconnectedStartX = baseX - unconnectedWidth / 2
        
        unconnectedNodes.forEach((person, index) => {
          const x = unconnectedStartX + index * horizontalSpacing
          positions.push({
            ...person,
            x,
            y: unconnectedY,
            level: levels.length
          })
          positionMap.set(person.name, { x, y: unconnectedY })
        })
      }

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

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.3))
  }

  const handleResetZoom = () => {
    setZoom(1)
  }

  // Center the view on the first person when component loads
  useEffect(() => {
    if (positions.length > 0 && containerRef.current) {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      setTimeout(() => {
        requestAnimationFrame(() => {
          const container = containerRef.current
          const scrollableParent = container.parentElement // tree-container
          if (!container || !scrollableParent) return
          
          // Get the viewport size from the scrollable parent
          const viewportWidth = scrollableParent.clientWidth
          const viewportHeight = scrollableParent.clientHeight
          
          // First person is positioned at 50% of the container's actual dimensions
          // Use scrollWidth/scrollHeight to get the actual canvas size
          const canvasWidth = container.scrollWidth
          const canvasHeight = container.scrollHeight
          const firstPersonX = canvasWidth / 2
          const firstPersonY = canvasHeight / 2
          
          // Scroll to position first person near the top (family tree style)
          const scrollLeft = firstPersonX - viewportWidth / 2
          const scrollTop = Math.max(0, firstPersonY - 150) // Position 150px from top of viewport
          
          // Set scroll position directly (most reliable method)
          scrollableParent.scrollLeft = scrollLeft
          scrollableParent.scrollTop = scrollTop
        })
      }, 300)
    }
  }, [positions])

  return (
    <div className="relationship-tree" ref={containerRef}>
      <svg 
        className="connections-svg"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        {positions.map((person, index) => {
          const container = containerRef.current
          if (!container) return null

          const centerX = container.clientWidth / 2
          const centerY = container.clientHeight / 2

          // Draw lines based on the connections array
          if (!person.connections || person.connections.length === 0) return null

          return person.connections.map((connectionName, connIndex) => {
            // Find the connected person in positions
            const connectedPerson = positions.find(p => p.name === connectionName)
            if (!connectedPerson) return null

            // Only draw lines between different levels (parent-child), not same level (siblings)
            if (person.y === connectedPerson.y) return null

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

      <div
        className="tree-content"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        {positions.map((person, index) => (
          <PersonCard
            key={index}
            person={person}
            isSelected={selectedPerson?.name === person.name}
            onClick={() => handlePersonClick(person)}
          />
        ))}
      </div>

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

      {/* Zoom controls */}
      <div className="zoom-controls">
        <button className="zoom-button" onClick={handleZoomIn} title="Zoom In">
          +
        </button>
        <button className="zoom-button" onClick={handleResetZoom} title="Reset Zoom">
          ⟲
        </button>
        <button className="zoom-button" onClick={handleZoomOut} title="Zoom Out">
          −
        </button>
      </div>
    </div>
  )
}

export default RelationshipTree