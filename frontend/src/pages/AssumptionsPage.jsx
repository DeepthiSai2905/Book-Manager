import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Box,
  IconButton
} from '@mui/material';
import { Close as CloseIcon, Info as InfoIcon, Lock as LockIcon, Edit as EditIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

const AssumptionsPage = ({ open, onClose }) => {
  const assumptions = [
    {
      title: 'User Authentication',
      items: [
        'Users must be logged in to view the book list',
        'Only registered users can add new books',
        'User sessions are managed using JWT tokens',
      ],
      icon: <LockIcon color="primary" />
    },
    {
      title: 'Book Management',
      items: [
        'Users can only edit or delete books they have created',
        'All users can view all books in the system',
        'Book details include title, author, genre, and publication year',
      ],
      icon: <EditIcon color="primary" />
    },
    {
      title: 'Data Persistence',
      items: [
        'Book data is stored in a JSON file on the server',
        'Changes are immediately reflected in the UI',
        'The application maintains data between server restarts',
      ],
      icon: <InfoIcon color="primary" />
    },
    {
      title: 'UI/UX',
      items: [
        'Responsive design works on desktop and mobile devices',
        'Interactive elements provide visual feedback',
        'Loading and error states are handled gracefully',
      ],
      icon: <VisibilityIcon color="primary" />
    }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh',
          my: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Application Assumptions
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0 }}>

        <Box sx={{ p: 3 }}>
          <Typography variant="body1" paragraph sx={{ mb: 3, color: 'text.secondary' }}>
            This outlines the key assumptions and design decisions made during the development of the Book Manager application.
          </Typography>
          
          {assumptions.map((section, index) => (
        <Paper 
          key={index} 
          elevation={2} 
          sx={{ 
            mb: 3, 
            p: 3, 
            borderRadius: 2,
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            backgroundColor: 'background.paper'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {section.icon}
            <Typography variant="h6" component="h2" sx={{ ml: 1, fontWeight: 600 }}>
              {section.title}
            </Typography>
          </Box>
          <List dense>
            {section.items.map((item, itemIndex) => (
              <ListItem key={itemIndex} sx={{ py: 0.5, pl: 4 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <InfoIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={item} 
                  primaryTypographyProps={{ 
                    variant: 'body1',
                    color: 'text.primary'
                  }} 
                />
              </ListItem>
            ))}
          </List>
        </Paper>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} color="primary" variant="contained">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssumptionsPage;
