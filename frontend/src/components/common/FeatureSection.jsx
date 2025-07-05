import { Box, Typography, Grid, Paper } from '@mui/material'

const features = [
  {
    icon: '📚',
    title: 'Rent Books Easily',
    desc: 'Find and borrow books from trusted owners in your area.',
  },
  {
    icon: '💸',
    title: 'Earn from Your Books',
    desc: 'Turn your bookshelf into passive income with zero hassle.',
  },
  {
    icon: '📍',
    title: 'Location-Based Matches',
    desc: 'Get books from owners nearby for quick and easy exchange.',
  },
  {
    icon: '🔒',
    title: 'Secure & Verified',
    desc: 'We verify all users and books to ensure safe rentals.',
  },
]

export default function FeatureSection() {
  return (
    <Box sx={{ py: 8, px: 4, backgroundColor: '#fafafa' }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
        Why BookRental?
      </Typography>

      <Grid container spacing={4} mt={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h3" component="div">
                {feature.icon}
              </Typography>
              <Typography variant="h6" mt={2}>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {feature.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
