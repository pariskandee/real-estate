import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import { Home, Language, AccountCircle } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const NavBar = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, logout, loginWithGoogle } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    handleClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="home"
          sx={{ mr: 2 }}
          component={Link}
          to="/"
        >
          <Home />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {t('navbar.appName')}
        </Typography>

        {/* Language Selector */}
        <Box sx={{ mr: 2 }}>
          <IconButton
            size="large"
            aria-label="change language"
            aria-controls="language-menu"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Language />
          </IconButton>
          <Menu
            id="language-menu"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => changeLanguage('en')}>English</MenuItem>
            <MenuItem onClick={() => changeLanguage('fr')}>Français</MenuItem>
          </Menu>
        </Box>

        {/* Auth Buttons */}
        {currentUser ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              color="inherit"
              component={Link}
              to="/add-property"
              sx={{ mr: 2 }}
            >
              {t('addProperty')}
            </Button>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              {currentUser.photoURL ? (
                <Avatar 
                  alt={currentUser.displayName} 
                  src={currentUser.photoURL} 
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem 
                component={Link} 
                to="/admin" 
                onClick={handleClose}
              >
                {t('adminPanel')}
              </MenuItem>
              <MenuItem onClick={() => {
                logout();
                handleClose();
              }}>
                {t('logout')}
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button 
            color="inherit"
            onClick={loginWithGoogle}
            startIcon={<AccountCircle />}
          >
            {t('login')}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;