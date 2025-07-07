import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useState } from 'react'
import axios from 'axios'

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await axios.post('http://localhost:5000/api/contact', formData)
      if (res.status === 200) {
        setSuccess('Message sent successfully!')
        setFormData({ name: '', email: '', message: '' })
      } else {
        setError('Something went wrong.')
      }
    } catch (err) {
      setError('Failed to send message.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ py: 10, backgroundColor: '#f3f4f6' }}>
      <Container maxWidth="md">
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          Get in Touch
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" mb={4}>
          Have a question or feedback? We’d love to hear from you.
        </Typography>

        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Your Name"
                name="name"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Message"
                name="message"
                fullWidth
                multiline
                rows={4}
                required
                value={formData.message}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} textAlign="center" mt={2}>
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Message'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  )
}
