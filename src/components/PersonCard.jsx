import './PersonCard.css'

const PersonCard = ({ person, isSelected, onClick }) => {
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  const getRelationshipColor = (relationship) => {
    const colors = {
      'Family': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'Friend': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Work': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'School': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    }
    return colors[relationship] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }

  return (
    <div
      className={`person-node ${isSelected ? 'selected' : ''}`}
      style={{
        left: `${person.x}px`,
        top: `${person.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={onClick}
    >
      <div 
        className="person-avatar"
        style={{ background: getRelationshipColor(person.relationship) }}
      >
        {person.image ? (
          <img src={`/images/${person.image}`} alt={person.name} />
        ) : (
          <span className="person-initial">{getInitial(person.name)}</span>
        )}
      </div>
      <div className="person-name">{person.name}</div>
      <div className="person-subtitle">{person.relationship} - {person.note}</div>
    </div>
  )
}

export default PersonCard