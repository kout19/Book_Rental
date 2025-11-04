import { Box, Typography, Container, Stack, Link } from '@mui/material'

export default function LandingFooter() {

  return (
    <Box sx={{ py: 4, backgroundColor: '#1e293b', color: '#fff' }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body2">
            &copy; {new Date().getFullYear()} BookRental. All rights reserved.
          </Typography>

          <Stack direction="row" spacing={2}>
            <Link href="/privacy" underline="hover" color="inherit">
              Privacy
            </Link>
            <Link href="/terms" underline="hover" color="inherit">
              Terms
            </Link>
            {/* <Link href="/contact" underline="hover" color="inherit">
              Contact
            </Link> */}
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
