import { Box, Button, Typography, Stack, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Link as RouterLink } from 'react-router-dom'
import heroImage from '../../assets/images/hero-books.jpg' // ⬅️ We'll use this below

export default function HeroSection() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box
      sx={{
        px: 4,
        py: 8,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* Text Content */}
      <Box sx={{ flex: 1, textAlign: isMobile ? 'center' : 'left', mb: isMobile ? 4 : 0 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Discover, Rent & Earn — All with Books You Love.
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 500 }}>
          BookRental connects readers and local book owners to share stories, earn income, and make reading affordable for everyone.
        </Typography>

        <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ mt: 4 }} justifyContent={isMobile ? 'center' : 'flex-start'}>
          <Button variant="contained" color="primary" component={RouterLink} to="/login">
            Browse Books
          </Button>
          <Button variant="outlined" color="primary" component={RouterLink} to="/register">
            Become a Book Owner
          </Button>
        </Stack>
      </Box>

      {/* Image */}
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', borderRadius: 3, overflow: 'hidden' }}>
        <img
          src={heroImage}
          alt="Hero illustration"
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: theme.shadows[3] }}
        />
      </Box>
    </Box>
  )
}
