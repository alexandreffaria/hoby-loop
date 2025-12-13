import { useState, useEffect } from 'react'
import axios from 'axios'

// Simple styles to make it readable
const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
  card: { border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '8px' },
  heading: { color: '#333' },
  button: { background: '#007bff', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }
}

function App() {
  // 1. STATE: Where we store the data coming from the backend
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)

  // 2. EFFECT: Run this code when the page loads
  useEffect(() => {
    // We are hardcoding Seller ID 1 (Alex) for this MVP
    axios.get('http://localhost:8080/sellers/1/subscriptions')
      .then(response => {
        console.log("Data received:", response.data) // Check your browser console!
        setSubscriptions(response.data.data) // Save the list to our state
        setLoading(false)
      })
      .catch(error => {
        console.error("Error fetching data:", error)
        setLoading(false)
      })
  }, [])

  // 3. ACTION: Function to mark an order as "Preparing"
  const notifyConsumer = (subId, basketName) => {
    axios.post('http://localhost:8080/orders', {
      subscription_id: subId,
      status: "Preparing"
    })
    .then(() => {
      alert(`Success! We notified the user about their ${basketName}.`)
    })
    .catch(err => alert("Something went wrong."))
  }

  // 4. RENDER: The HTML the user actually sees
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>📦 Seller Dashboard</h1>
      <p>Welcome back, Alex. Here are your active subscriptions:</p>

      {loading ? (
        <p>Loading your data...</p>
      ) : (
        <div>
          {subscriptions.map(sub => (
            <div key={sub.ID} style={styles.card}>
              <h3>{sub.basket.name}</h3>
              <p><strong>Customer:</strong> {sub.user.name} ({sub.user.email})</p>
              <p><strong>Frequency:</strong> {sub.frequency}</p>
              <p><strong>Status:</strong> {sub.status}</p>
              
              <button 
                style={styles.button}
                onClick={() => notifyConsumer(sub.ID, sub.basket.name)}
              >
                🔔 Mark as Preparing
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App