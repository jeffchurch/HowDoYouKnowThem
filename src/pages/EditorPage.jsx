import { useState, useEffect } from 'react'
import './EditorPage.css'

function EditorPage() {
  const [people, setPeople] = useState([])
  const [editingPerson, setEditingPerson] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    note: '',
    image: '',
    connections: []
  })
  const [imageFile, setImageFile] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Load the JSON data
    fetch('/data/relationships.json')
      .then(response => response.json())
      .then(data => setPeople(data))
      .catch(err => console.error('Failed to load data:', err))
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleConnectionToggle = (personName) => {
    setFormData(prev => {
      const connections = prev.connections.includes(personName)
        ? prev.connections.filter(c => c !== personName)
        : [...prev.connections, personName]
      return { ...prev, connections }
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setFormData(prev => ({ ...prev, image: file.name }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Upload image if present
      if (imageFile) {
        const formDataImg = new FormData()
        formDataImg.append('image', imageFile)
        
        const uploadResponse = await fetch('http://localhost:3001/api/upload-image', {
          method: 'POST',
          body: formDataImg
        })
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image')
        }
      }

      // Update or add person
      let updatedPeople
      if (editingPerson !== null) {
        updatedPeople = [...people]
        updatedPeople[editingPerson] = formData
      } else {
        updatedPeople = [...people, formData]
      }

      // Save to backend
      const response = await fetch('http://localhost:3001/api/relationships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPeople)
      })

      if (!response.ok) {
        throw new Error('Failed to save relationships')
      }

      setPeople(updatedPeople)
      setMessage('Successfully saved changes!')
      resetForm()
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    }
  }

  const handleEdit = (index) => {
    setEditingPerson(index)
    setFormData({ ...people[index] })
  }

  const handleDelete = async (index) => {
    if (confirm(`Delete ${people[index].name}?`)) {
      try {
        const updatedPeople = people.filter((_, i) => i !== index)
        
        // Save to backend
        const response = await fetch('http://localhost:3001/api/relationships', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedPeople)
        })

        if (!response.ok) {
          throw new Error('Failed to delete person')
        }
        
        setPeople(updatedPeople)
        setMessage('Successfully deleted person!')
      } catch (error) {
        setMessage(`Error: ${error.message}`)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      note: '',
      image: '',
      connections: []
    })
    setImageFile(null)
    setEditingPerson(null)
  }

  const relationshipTypes = ['Self', 'Family', 'Friend', 'Work', 'School']

  return (
    <div className="editor">
      <div className="editor-header">
        <h2>{editingPerson !== null ? 'Edit Person' : 'Add New Person'}</h2>
        {message && <div className="message">{message}</div>}
      </div>

      <div className="editor-content">
        <div className="editor-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="relationship">Relationship Type *</label>
              <select
                id="relationship"
                name="relationship"
                value={formData.relationship}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a type...</option>
                {relationshipTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="note">Note</label>
              <input
                type="text"
                id="note"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="e.g., College friend, Cousin, etc."
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Profile Image</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
              />
              {formData.image && <small>Current: {formData.image}</small>}
            </div>

            <div className="form-group">
              <label>Connections</label>
              <div className="connections-list">
                {people
                  .filter((_, i) => i !== editingPerson)
                  .map((person) => (
                    <label key={person.name} className="connection-item">
                      <input
                        type="checkbox"
                        checked={formData.connections.includes(person.name)}
                        onChange={() => handleConnectionToggle(person.name)}
                      />
                      <span>{person.name}</span>
                    </label>
                  ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingPerson !== null ? 'Update Person' : 'Add Person'}
              </button>
              {editingPerson !== null && (
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="people-list">
          <h3>Current People ({people.length})</h3>
          <div className="list-items">
            {people.map((person, index) => (
              <div key={index} className="person-item">
                <div className="person-info">
                  <strong>{person.name}</strong>
                  <span className="relationship-badge">{person.relationship}</span>
                  {person.note && <small>{person.note}</small>}
                  <small>{person.connections.length} connection(s)</small>
                </div>
                <div className="person-actions">
                  <button onClick={() => handleEdit(index)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(index)} className="btn-delete">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorPage