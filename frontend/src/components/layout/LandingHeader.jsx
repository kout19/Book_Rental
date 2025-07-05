// src/components/layout/LandingHeader.jsx
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'

export default function LandingHeader() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(false)

  const toggleDrawer = (state) => () => setOpen(state)

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ]

  const authLinks = [
    { label: 'Login', path: '/login' },
    { label: 'Register', path: '/register' },
  ]

  return (
    <>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ color: 'white', textDecoration: 'none' }}
          >
            📚 BookRental
          </Typography>

          {isMobile ? (
            // Mobile: Show hamburger
            <IconButton color="inherit" edge="end" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
          ) : (
            // Desktop/Tablet: Show nav buttons
            <Stack direction="row" spacing={2} alignItems="center">
              {navLinks.map((item) => (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  sx={{ color: 'white' }}
                >
                  {item.label}
                </Button>
              ))}
              {authLinks.map((item) => (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  variant={item.label === 'Register' ? 'outlined' : 'text'}
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    ml: item.label === 'Register' ? 1 : 0,
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            {navLinks.map((item) => (
              <ListItem button component={RouterLink} to={item.path} key={item.path}>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {authLinks.map((item) => (
              <ListItem button component={RouterLink} to={item.path} key={item.path}>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  )
}
