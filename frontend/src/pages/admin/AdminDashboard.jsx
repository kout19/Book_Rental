import { Box, Typography } from '@mui/material'

export default function AdminDashboard() {
  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography>Welcome, Admin! You can manage users, books, and more.</Typography>
    </Box>
  )
}
