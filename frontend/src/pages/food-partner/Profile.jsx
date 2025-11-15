import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../../styles/profile.css'
import profileImage from '../../assets/profile.jpg'

const Profile = () => {
  const { partnerId } = useParams()
  const navigate = useNavigate()
  const [partner, setPartner] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadPartnerData() {
      setLoading(true)
      setError(null)
      try {
        // Fetch all food items from API
        const res = await fetch('http://localhost:3000/api/food', {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Unauthorized. Please log in.')
          }
          throw new Error(`Fetch error: ${res.status}`)
        }

        const data = await res.json()
        if (!cancelled) {
          const items = Array.isArray(data.foodItems) ? data.foodItems : []
          
          console.log(items);
          
          // Filter videos by partnerId if available
          let partnerVideos = items
          if (partnerId) {
            partnerVideos = items.filter(
              item => item.foodPartner === partnerId || item.foodPartner?._id === partnerId
            )
          }

          setVideos(partnerVideos)

          // Build partner info from first video's partner data or use default
          if (partnerVideos.length > 0) {
            const firstVideo = partnerVideos[0]
            const partnerData = firstVideo.foodPartner || {}
            
            setPartner({
              _id: partnerId,
              name: partnerData.name || 'Aman Khan',
              address: partnerData.address || 'Jagaheri, Muzaffarnagar, UP',
              totalMeals: partnerVideos.length,
              customerServe: partnerData.customerServe || '15K',
              image: partnerData.image || 'https://via.placeholder.com/120',
            })
          } else if (!partnerId) {
            // No partnerId in URL, show all items
            setPartner({
              name: 'All Food Partners',
              address: 'Browse all restaurants',
              totalMeals: items.length,
              customerServe: '50K+',
              image: 'https://via.placeholder.com/120',
            })
          } else {
            throw new Error('Partner not found')
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load profile')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPartnerData()
    return () => { cancelled = true }
  }, [partnerId])

  if (loading) {
    return <div className="profile-container"><div className="profile-loading">Loading profile...</div></div>
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          {error}
          <button 
            onClick={() => navigate('/')}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: 'var(--accent)',
              color: 'var(--surface)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (!partner) {
    return <div className="profile-container"><div className="profile-error">No partner data found.</div></div>
  }

  return (
    <div className="profile-container">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          top: '10px',
          left: '16px',
          zIndex: 100,
          padding: '8px 12px',
          background: 'rgba(0,0,0,0.5)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '500'
        }}
      >
        ← Back
      </button>

      {/* Header Section */}
      <div className="profile-header" style={{
          marginTop: "50px"
        }}>
        <div className="profile-info">
          <div className="profile-avatar">
            <img src={profileImage} alt={partner.name} />
          </div>
          <div className="profile-details">
            <div className="profile-name">{partner.name}</div>
            <div className="profile-address">{partner.address}</div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-label">Total meals</div>
          <div className="stat-value">{partner.totalMeals}</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-label">Customer serve</div>
          <div className="stat-value">{partner.customerServe}</div>
        </div>
      </div>

      {/* Videos Grid Section */}
      <div className="profile-videos">
        {videos.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
            No videos available for this partner
          </div>
        ) : (
          <div className="videos-grid">
            {videos.map((video) => (
              <div key={video._id} className="video-tile">
                <video
                  src={video.video}
                  className="video-tile-content"
                  muted
                  playsInline
                />
                <div className="video-overlay">
                  <span className="video-label">video</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile