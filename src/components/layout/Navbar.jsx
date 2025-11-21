import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Container,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  List as ListIcon,
  Book as BookIcon,
} from '@mui/icons-material';
import { AuthContext } from '../../contexts/AuthContext';
import { logout as apiLogout } from '../../utils/log_api';
import NotificationPanel from '../notifications/NotificationPanel';

function Navbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { token, email, clearAuth } = useContext(AuthContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  // handle logout
  const handleLogout = async () => {
    handleMenuClose();
    try {
      await apiLogout(token);
      clearAuth();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
      clearAuth();
      navigate('/');
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const navigateAndClose = (path) => {
    navigate(path);
    handleMobileMenuClose();
    handleMenuClose();
  };

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        backgroundColor: 'white',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
            onClick={() => navigate('/')}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                fontSize: { xs: '1.5rem', md: '2rem' },
                letterSpacing: '-0.5px',
              }}
            >
              airbrb
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {token ? (
                <>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/')}
                    startIcon={<HomeIcon />}
                    sx={{ fontWeight: 500 }}
                  >
                    Explore
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/hosted-listings')}
                    startIcon={<ListIcon />}
                    sx={{ fontWeight: 500 }}
                  >
                    My Listings
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/my-bookings')}
                    startIcon={<BookIcon />}
                    sx={{ fontWeight: 500 }}
                  >
                    My Trips
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/host-bookings')}
                    startIcon={<BookIcon />}
                    sx={{ fontWeight: 500 }}
                  >
                    Host
                  </Button>

                  {/* Notification Panel */}
                  <NotificationPanel />

                  {/* User Menu */}
                  <IconButton
                    onClick={handleMenuOpen}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '50px',
                      padding: '4px',
                      '&:hover': {
                        boxShadow: '0px 2px 8px rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    <MenuIcon sx={{ fontSize: 20, mr: 0.5 }} />
                    <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                      {email?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        minWidth: 200,
                        borderRadius: 2,
                        boxShadow: '0px 4px 16px rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    <MenuItem disabled sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                      {email}
                    </MenuItem>
                    <MenuItem onClick={() => navigateAndClose('/hosted-listings')}>
                      My Listings
                    </MenuItem>
                    <MenuItem onClick={() => navigateAndClose('/my-bookings')}>
                      My Trips
                    </MenuItem>
                    <MenuItem onClick={() => navigateAndClose('/host-bookings')}>
                      Host Bookings
                    </MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    variant="text"
                    onClick={() => navigate('/login')}
                    sx={{ fontWeight: 600, color: 'text.primary' }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/register')}
                    sx={{
                      fontWeight: 600,
                      background: 'linear-gradient(to right, #E61E4D 0%, #D70466 100%)',
                    }}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <IconButton
              onClick={handleMobileMenuOpen}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '50px',
              }}
            >
              <MenuIcon />
              {token && (
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', ml: 0.5, fontSize: '0.75rem' }}>
                  {email?.[0]?.toUpperCase() || 'U'}
                </Avatar>
              )}
            </IconButton>
          )}

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: 2,
              },
            }}
          >
            {token ? (
              [
                <MenuItem key="email" disabled sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  {email}
                </MenuItem>,
                <MenuItem key="explore" onClick={() => navigateAndClose('/')}>
                  Explore
                </MenuItem>,
                <MenuItem key="listings" onClick={() => navigateAndClose('/hosted-listings')}>
                  My Listings
                </MenuItem>,
                <MenuItem key="trips" onClick={() => navigateAndClose('/my-bookings')}>
                  My Trips
                </MenuItem>,
                <MenuItem key="host" onClick={() => navigateAndClose('/host-bookings')}>
                  Host Bookings
                </MenuItem>,
                <MenuItem key="logout" onClick={handleLogout} sx={{ color: 'error.main' }}>
                  Logout
                </MenuItem>,
              ]
            ) : (
              [
                <MenuItem key="login" onClick={() => navigateAndClose('/login')}>
                  Login
                </MenuItem>,
                <MenuItem key="register" onClick={() => navigateAndClose('/register')}>
                  Sign up
                </MenuItem>,
              ]
            )}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;