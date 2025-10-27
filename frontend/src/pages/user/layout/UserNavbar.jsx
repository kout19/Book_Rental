import React,{useEffect, useState} from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { AccountCircle, Logout, Person, Menu as MenuIcon, LibraryBooks, MenuBook } from "@mui/icons-material";
import { Link, useNavigate, Outlet} from "react-router-dom";
import { auth } from "../../../firebase/firebase";
import { onAuthStateChanged, reload, signOut } from "firebase/auth";
import { useAuth } from "../../../context/AuthContext";
const RenterNavbar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [firebaseUser, setFirebaseUser] = useState(null);

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            await reload(user);
            setFirebaseUser(user);
            if (!user.emailVerified) {
              alert("You must verify your email to access the dashboard.");
              navigate("/login");
            }
          } else {
            setFirebaseUser(null);
            navigate("/login");
          }
        });
      }, [navigate]);

    const handleProfileMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
      setAnchorEl(null);
    };

    const handleLogout = async () => {
      try {
        await signOut(auth);
        logout();
        navigate("/login");
      } catch (error) {
        console.error("Logout error:", error);
      }
      handleProfileMenuClose();
      setMobileDrawerOpen(false);
    };

    const handleMobileDrawerToggle = () => {
      setMobileDrawerOpen(!mobileDrawerOpen);
    };

    const handleMobileDrawerClose = () => {
      setMobileDrawerOpen(false);
    };
    
  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#1E293B" }}>
        <Toolbar>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleMobileDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            📚 Book Rental
          </Typography>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              <Button color="inherit" component={Link} to="/user/browse-books">Browse Books</Button>
              <Button color="inherit" component={Link} to="/user/my-rentals">My Rentals</Button>
            </>
          )}
          
          {/* Profile Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: isMobile ? 1 : 2 }}>
            {firebaseUser && !isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <Avatar 
                  sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.light' }}
                  src={firebaseUser.photoURL}
                >
                  {firebaseUser.displayName ? firebaseUser.displayName.charAt(0).toUpperCase() : firebaseUser.email?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  {firebaseUser.displayName || firebaseUser.email}
                </Typography>
              </Box>
            )}
            
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            
            <Menu
              id="profile-menu"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem onClick={handleProfileMenuClose} component={Link} to="/user/profile">
                <Person sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleMobileDrawerClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* User Info in Drawer */}
          {firebaseUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Avatar 
                sx={{ width: 48, height: 48, mr: 2, bgcolor: 'primary.main' }}
                src={firebaseUser.photoURL}
              >
                {firebaseUser.displayName ? firebaseUser.displayName.charAt(0).toUpperCase() : firebaseUser.email?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {firebaseUser.displayName || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {firebaseUser.email}
                </Typography>
              </Box>
            </Box>
          )}
          
          {/* Navigation Links */}
          <List>
            <ListItemButton component={Link} to="/user/browse-books" onClick={handleMobileDrawerClose}>
              <ListItemIcon>
                <MenuBook />
              </ListItemIcon>
              <ListItemText primary="Browse Books" />
            </ListItemButton>
            
            <ListItemButton component={Link} to="/user/my-rentals" onClick={handleMobileDrawerClose}>
              <ListItemIcon>
                <LibraryBooks />
              </ListItemIcon>
              <ListItemText primary="My Rentals" />
            </ListItemButton>
            
            <ListItemButton component={Link} to="/user/profile" onClick={handleMobileDrawerClose}>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
            
            <Divider sx={{ my: 1 }} />
            
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Outlet />
    </>
  );
};

export default RenterNavbar;
