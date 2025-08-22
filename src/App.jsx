import React, { useState, useEffect } from 'react'

const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID
const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN

function App() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Team%20Data`,
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          },
        }
      )
      
      if (!response.ok) throw new Error('Failed to fetch data')
      
      const result = await response.json()
      setData(result.records)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  
  const todayCheckins = data.filter(record => 
    record.fields.Date === today
  )
  
  const alertPlayers = data.filter(record => 
    record.fields['Coach Action Needed'] || 
    record.fields['Anything feeling off physically?'] === 'Something\'s not right'
  )
  
  const missingToday = data.filter(record => {
    const playerJerseys = todayCheckins.map(r => r.fields.Jersey)
    return !playerJerseys.includes(record.fields.Jersey)
  })

  if (loading) return (
    <div className="dashboard">
      <div className="loading">Loading dashboard...</div>
    </div>
  )

  if (error) return (
    <div className="dashboard">
      <div className="error">Error: {error}</div>
    </div>
  )

  return (
    <div className="dashboard">
      <header className="header">
        <h1>🏒 Team Dashboard</h1>
        <div className="date">{new Date().toLocaleDateString()}</div>
      </header>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-number">{todayCheckins.length}</div>
          <div className="stat-label">Check-ins Today</div>
        </div>
        <div className="stat-card alert">
          <div className="stat-number">{alertPlayers.length}</div>
          <div className="stat-label">Need Attention</div>
        </div>
        <div className="stat-card missing">
          <div className="stat-number">{missingToday.length}</div>
          <div className="stat-label">Missing Today</div>
        </div>
      </div>

      {alertPlayers.length > 0 && (
        <section className="section">
          <h2>🚨 Players Need Attention</h2>
          <div className="alert-grid">
            {alertPlayers.map(record => (
              <div key={record.id} className="alert-card">
                <div className="player-info">
                  <span className="jersey">#{record.fields.Jersey}</span>
                  <span className="name">{record.fields.Name || 'Player'}</span>
                </div>
                <div className="alert-details">
                  <div className="feeling">{record.fields['How are you feeling?']}</div>
                  <div className="physical">{record.fields['Anything feeling off physically?']}</div>
                  <div className="energy">Energy: {record.fields['Energy level?']}</div>
                </div>
                {record.fields.Notes && (
                  <div className="notes">"{record.fields.Notes}"</div>
                )}
                <div className="alert-date">
                  {new Date(record.fields.Date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <h2>📝 Today's Check-ins</h2>
        <div className="checkin-grid">
          {todayCheckins.map(record => (
            <div key={record.id} className="checkin-card">
              <div className="player-header">
                <span className="jersey">#{record.fields.Jersey}</span>
                <span className="name">{record.fields.Name || 'Player'}</span>
              </div>
              <div className="checkin-data">
                <div className="data-row">
                  <span className="label">Feeling:</span>
                  <span className="value">{record.fields['How are you feeling?']}</span>
                </div>
                <div className="data-row">
                  <span className="label">Energy:</span>
                  <span className="value">{record.fields['Energy level?']}</span>
                </div>
                <div className="data-row">
                  <span className="label">Physical:</span>
                  <span className="value">{record.fields['Anything feeling off physically?']}</span>
                </div>
              </div>
              {record.fields.Notes && (
                <div className="notes">"{record.fields.Notes}"</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {missingToday.length > 0 && (
        <section className="section">
          <h2>⏰ Missing Check-ins</h2>
          <div className="missing-list">
            {missingToday.map(record => (
              <div key={record.id} className="missing-item">
                <span className="jersey">#{record.fields.Jersey}</span>
                <span className="name">{record.fields.Name || 'Player'}</span>
                <span className="last-contact">
                  Last: {record.fields['Last Coach Contact'] || 'Never'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <button className="refresh-btn" onClick={fetchData}>
        🔄 Refresh Data
      </button>
    </div>
  )
}

export default App
