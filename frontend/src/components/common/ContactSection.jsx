import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
} from '@mui/material'

export default function ContactSection() {
  return (
    <Box sx={{ py: 10, backgroundColor: '#f3f4f6' }}>
      <Container maxWidth="md">
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          Get in Touch
        </Typography>

        <Typography variant="body1" align="center" color="text.secondary" mb={4}>
          Have a question or feedback? We’d love to hear from you.
        </Typography>

        <Box component="form">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Your Name" fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email Address" type="email" fullWidth required />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Message"
                fullWidth
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} textAlign="center" mt={2}>
              <Button type="submit" variant="contained" size="large">
                Send Message
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  )
}
