import React, { useState } from 'react'
import '../../styles/create-food.css'

const CreateFood = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    video: null,
  })
  const [videoPreview, setVideoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate video file
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file')
        return
      }
      if (file.size > 100 * 1024 * 1024) {
        // 100 MB limit
        setError('Video file must be less than 100 MB')
        return
      }

      setFormData((prev) => ({ ...prev, video: file }))
      setError(null)

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setVideoPreview(previewUrl)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter a food name')
      return
    }
    if (!formData.description.trim()) {
      setError('Please enter a description')
      return
    }
    if (!formData.video) {
      setError('Please select a video')   
      return
    }

    setLoading(true)

    try {
      const fd = new FormData()
      fd.append('name', formData.name)
      fd.append('description', formData.description)
      fd.append('video', formData.video)

      const res = await fetch('http://localhost:3000/api/food', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Unauthorized. Please log in as a food partner.')
        }
        const text = await res.text()
        throw new Error(text || `Error: ${res.status}`)
      }

      const data = await res.json()
      setSuccess(true)
      setFormData({ name: '', description: '', video: null })
      setVideoPreview(null)

      // Redirect after 2 seconds
      setTimeout(() => {
        // Optionally redirect to profile or home
        window.location.href = '/'
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to create food item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-food-page">
      <div className="create-food-container">
        <div className="create-food-header">
          <h1>Create Food Item</h1>
          <p>Share your delicious food with customers</p>
        </div>

        {success && (
          <div className="alert alert-success">
            ✓ Food item created successfully! Redirecting...
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ✕ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-food-form">
          {/* Video Upload Section */}
          <div className="form-section">
            <label className="section-title">Video</label>
            <div className="video-upload-wrapper">
              {videoPreview ? (
                <div className="video-preview-container">
                  <video
                    src={videoPreview}
                    className="video-preview"
                    controls
                    playsInline
                  />
                  <button
                    type="button"
                    className="btn-remove-video"
                    onClick={() => {
                      setVideoPreview(null)
                      setFormData((prev) => ({ ...prev, video: null }))
                      URL.revokeObjectURL(videoPreview)
                    }}
                  >
                    Remove Video
                  </button>
                </div>
              ) : (
                <label className="video-upload-label">
                  <div className="upload-icon">📹</div>
                  <span className="upload-text">Click to upload or drag & drop</span>
                  <span className="upload-hint">MP4, WebM, or other video formats (Max 100 MB)</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="video-input-hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Food Name Section */}
          <div className="form-section">
            <label htmlFor="name" className="section-title">
              Food Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Spicy Biryani, Chocolate Cake"
              className="form-input"
              maxLength={100}
            />
            <div className="char-count">{formData.name.length}/100</div>
          </div>

          {/* Description Section */}
          <div className="form-section">
            <label htmlFor="description" className="section-title">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your food item, ingredients, special notes..."
              className="form-textarea"
              rows={4}
              maxLength={500}
            />
            <div className="char-count">{formData.description.length}/500</div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Food Item'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateFood