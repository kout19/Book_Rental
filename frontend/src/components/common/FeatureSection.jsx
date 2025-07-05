import { Box, Typography, Grid, Paper, Container } from '@mui/material'
import { BookOpenIcon, CurrencyDollarIcon, MapPinIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
const features = [
  {
    icon: <BookOpenIcon style={{ width: 40, height: 40, color: '#1976d2' }} />,
    title: 'Rent Books Easily',
    desc: 'Find and borrow books from trusted owners in your area.',
  },
  {
    icon: <CurrencyDollarIcon style={{ width: 40, height: 40, color: '#1976d2' }} />,
    title: 'Earn from Your Books',
    desc: 'Turn your bookshelf into passive income with zero hassle.',
  },
  {
    icon: <MapPinIcon style={{ width: 40, height: 40, color: '#1976d2' }} />,
    title: 'Location-Based Matches',
    desc: 'Get books from owners nearby for quick and easy exchange.',
  },
  {
    icon: <ShieldCheckIcon style={{ width: 40, height: 40, color: '#1976d2' }} />,
    title: 'Secure & Verified',
    desc: 'We verify all users and books to ensure safe rentals.',
  },
]

export default function FeatureSection() {
  return (
    <Box sx={{ py: 10, backgroundColor: '#fafafa' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
          Why BookRental?
        </Typography>

        <Grid container spacing={4} mt={4} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h3" component="div">
                    <Box mb={1}>
                  {feature.icon}
                  </Box>
                </Typography>
                <Typography variant="h6" mt={2} fontWeight="bold">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {feature.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
