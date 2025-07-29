import { useState } from 'react';
import { Container, Box, Typography, Button, AppBar, Toolbar, CssBaseline, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BookList from '../components/BookList';
import AssumptionsPage from './AssumptionsPage';
import InfoIcon from '@mui/icons-material/Info';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    const loggedOut = logout();
    if (loggedOut) {
      navigate('/login');
    }
  };

  const [assumptionsOpen, setAssumptionsOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ 
            flexGrow: 1, 
            color: 'inherit',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.9
            }
          }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Book Manager
          </Typography>
          <Tooltip title="View Assumptions">
            <IconButton 
              color="inherit" 
              onClick={() => setAssumptionsOpen(true)}
              sx={{ mr: 1 }}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="subtitle1" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
            Welcome, {user?.username || 'User'}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <BookList />
      </Container>
      
      <AssumptionsPage 
        open={assumptionsOpen} 
        onClose={() => setAssumptionsOpen(false)} 
      />
      
      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: (theme) => 
        theme.palette.mode === 'light'
          ? theme.palette.grey[200]
          : theme.palette.grey[800],
      }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Book Manager. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
