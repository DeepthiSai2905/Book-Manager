import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Card, 
  CardContent, 
  CardActions, 
  Grid, 
  TextField, 
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Modal,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Add, 
  Search, 
  Close, 
  Edit, 
  Delete 
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const cardStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  borderRadius: '12px',
  overflow: 'hidden',
  width: '320px', // Fixed width for cards
  border: '2px solid rgb(144, 186, 229)', // Blue border
  boxShadow: '0 4px 6px rgba(25, 118, 210, 0.1)',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 8px 15px rgba(25, 118, 210, 0.2)',
    borderColor: '#1565c0', // Darker blue on hover
  },
  '@media (max-width: 600px)': {
    width: '100%',
    maxWidth: '320px',
    margin: '0 auto',
  }
};

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    yearPublished: ''
  });
  const [formError, setFormError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Available genres for the dropdown
  const availableGenres = [
    'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery',
    'Thriller', 'Romance', 'Biography', 'History', 'Self-Help'
  ];

  // Fetch books on component mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await api.get('/books');
        setBooks(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch books');
        console.error('Error fetching books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const addBook = async (bookData) => {
    try {
      // Add createdBy field with current user's username
      const bookWithCreator = {
        ...bookData,
        createdBy: user?.username || 'anonymous'
      };
      const response = await api.post('/books', bookWithCreator);
      setBooks([...books, response.data]);
      return { success: true };
    } catch (error) {
      console.error('Error adding book:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to add book' };
    }
  };

  const updateBook = async (id, bookData) => {
    try {
      const response = await api.put(`/books/${id}`, bookData);
      setBooks(books.map(book => book.id === id ? response.data : book));
      return { success: true };
    } catch (error) {
      console.error('Error updating book:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update book' };
    }
  };

  const deleteBook = async (id) => {
    try {
      await api.delete(`/books/${id}`);
      setBooks(books.filter(book => book.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting book:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete book' };
    }
  };

    // Get unique genres from books
  const genres = useMemo(() => {
    const genreSet = new Set(books.map(book => book.genre).filter(Boolean));
    return Array.from(genreSet).sort();
  }, [books]);

  // Filter and pagination
  const filteredBooks = useMemo(() => {
    let result = [...books];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(book => 
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term)
      );
    }
    
    // Apply genre filter
    if (genreFilter && genreFilter !== 'all') {
      result = result.filter(book => book.genre === genreFilter);
    }
    
    return result;
  }, [books, searchTerm, genreFilter]);

  // Pagination
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const indexOfLastBook = currentPage * itemsPerPage;
  const indexOfFirstBook = indexOfLastBook - itemsPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenModal = (book = null) => {
    setSelectedBook(book);
    setFormData({
      title: book?.title || '',
      author: book?.author || '',
      genre: book?.genre || '',
      yearPublished: book?.yearPublished?.toString() || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.author || !formData.genre || !formData.yearPublished) {
      setFormError('All fields are required');
      return;
    }

    const year = parseInt(formData.yearPublished, 10);
    if (isNaN(year) || year < 1000 || year > new Date().getFullYear() + 1) {
      setFormError('Please enter a valid year');
      return;
    }

    const bookData = {
      ...formData,
      yearPublished: year
    };

    try {
      setLoading(true);
      if (selectedBook) {
        await updateBook(selectedBook.id, bookData);
      } else {
        await addBook(bookData);
      }
      setIsModalOpen(false);
    } catch (error) {
      setFormError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedBook) return;
    
    try {
      setLoading(true);
      await deleteBook(selectedBook.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete book:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading && books.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  const handleDeleteClick = (book) => {
    setSelectedBook(book);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3, md: 4 },
      maxWidth: '1600px',
      mx: 'auto',
    }}>
      {/* Header and Add Book Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: { xs: 2, sm: 3, md: 4 },
        flexWrap: 'wrap',
        gap: 2,
        '& h1': {
          fontSize: { xs: '1.5rem', sm: '1.75rem' },
          fontWeight: 600,
          color: 'text.primary',
        }
      }}>
        <Typography variant="h4" component="h1">
          Book Manager
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => handleOpenModal()}
          sx={{ 
            minWidth: '150px',
            py: 1,
            px: 3,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
            }
          }}
        >
          Add Book
        </Button>
      </Box>

      {/* Filters */}
      <Card 
        elevation={0}
        sx={{ 
          mb: { xs: 3, md: 4 },
          p: { xs: 1.5, sm: 2 },
          borderRadius: '12px',
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          '& .MuiFormControl-root': {
            flex: '1 1 300px',
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
          '& .MuiInputBase-input': {
            py: 1.2,
          },
          '& .MuiSelect-select': {
            py: '10px',
          },
        }}>
          <TextField
            placeholder="Search books by title or author..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: {
                '& input::placeholder': {
                  opacity: 0.8,
                },
              },
            }}
            sx={{ 
              flex: 2,
              minWidth: '200px',
            }}
          />
          
          <FormControl size="small">
            <InputLabel id="genre-filter-label" sx={{ mt: searchTerm ? 0 : 0.5 }}>Genre</InputLabel>
            <Select
              labelId="genre-filter-label"
              value={genreFilter}
              label="Genre"
              onChange={(e) => setGenreFilter(e.target.value)}
              sx={{
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
            >
              <MenuItem value="all">All Genres</MenuItem>
              {availableGenres.map((genre) => (
                <MenuItem key={genre} value={genre}>
                  {genre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          mt: 6, 
          p: { xs: 4, sm: 6 },
          backgroundColor: 'background.paper',
          borderRadius: '12px',
          border: '1px dashed',
          borderColor: 'divider',
        }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            {searchTerm || genreFilter !== 'all' 
              ? 'No books match your search criteria' 
              : 'Your book collection is empty'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8, mb: 2 }}>
            {searchTerm || genreFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Add your first book to get started!'}
          </Typography>
          {!(searchTerm || genreFilter !== 'all') && (
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => handleOpenModal()}
              sx={{ mt: 1 }}
            >
              Add Your First Book
            </Button>
          )}
        </Box>
      ) : (
        <>
          <Grid 
            container 
            spacing={{ xs: 3, sm: 4, md: 4 }}
            sx={{
              justifyContent: { xs: 'center', sm: 'flex-start' },
              '& .MuiGrid-item': {
                display: 'flex',
                justifyContent: 'center',
              }
            }}
          >
            {currentBooks.map((book) => (
              <Grid item key={book.id} sx={{ display: 'flex' }}>
                <Card sx={cardStyle}>
                  <CardContent sx={{ 
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    '&:last-child': {
                      pb: { xs: 2, sm: 3 },
                    }
                  }}>
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      sx={{ 
                        mb: 1.5,
                        fontWeight: 600,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        lineHeight: 1.3,
                        minHeight: '3em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {book.title}
                    </Typography>
                    <Typography 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        fontStyle: 'italic',
                        fontSize: '0.95rem',
                      }}
                    >
                      by {book.author}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap',
                      gap: 1,
                      mb: 2,
                      alignItems: 'center',
                    }}>
                      <Chip 
                        label={book.genre} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{
                          borderRadius: '6px',
                          fontWeight: 500,
                          borderWidth: '1.5px',
                          '& .MuiChip-label': {
                            px: 1,
                          },
                        }}
                      />
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          ml: 'auto',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                        }}
                      >
                        {book.yearPublished}
                      </Typography>
                    </Box>
                  <CardActions sx={{ 
                    p: { xs: 1.5, sm: 2 },
                    pt: 0,
                    mt: 'auto',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}>
                    {user && user.username === book.createdBy ? (
                      <Box sx={{ 
                        display: 'flex',
                        gap: 1,
                        width: '100%',
                        '& .MuiButton-root': {
                          flex: 1,
                          py: 0.75,
                          borderRadius: '6px',
                          textTransform: 'none',
                          fontWeight: 500,
                          fontSize: '0.85rem',
                          '& .MuiSvgIcon-root': {
                            fontSize: '1.1rem',
                            mr: 0.5,
                          },
                        },
                      }}>
                        <Button 
                          variant="outlined"
                          size="small" 
                          onClick={() => handleOpenModal(book)}
                          startIcon={<Edit fontSize="small" />}
                          sx={{
                            color: 'primary.main',
                            borderColor: 'divider',
                            '&:hover': {
                              borderColor: 'primary.main',
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outlined"
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteClick(book)}
                          startIcon={<Delete fontSize="small" />}
                          sx={{
                            borderColor: 'divider',
                            '&:hover': {
                              borderColor: 'error.main',
                              backgroundColor: 'rgba(211, 47, 47, 0.04)',
                            },
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    ) : (
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'right',
                          fontSize: '0.75rem',
                          opacity: 0.8,
                          '&:before': {
                            content: '"Added by "',
                            opacity: 0.7,
                          }
                        }}
                      >
                        {book.createdBy}
                      </Typography>
                    )}
                  </CardActions>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: { xs: 3, sm: 4, md: 5 },
              '& .MuiPagination-ul': {
                flexWrap: 'nowrap',
              },
              '& .MuiPaginationItem-root': {
                margin: '0 4px',
                minWidth: '32px',
                height: '32px',
                borderRadius: '8px',
                '&.Mui-selected': {
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                },
              },
            }}>
              <Pagination 
                count={totalPages} 
                page={currentPage} 
                onChange={handlePageChange} 
                color="primary"
                size={window.innerWidth < 600 ? 'small' : 'medium'}
                showFirstButton 
                showLastButton
                siblingCount={window.innerWidth < 600 ? 0 : 1}
                boundaryCount={1}
                sx={{
                  '& .MuiPaginationItem-page': {
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* Add/Edit Book Modal */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              {selectedBook ? 'Edit Book' : 'Add New Book'}
            </Typography>
            <IconButton onClick={handleCloseModal} size="small">
              <Close />
            </IconButton>
          </Box>
          
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              autoFocus
              margin="normal"
              name="title"
              label="Title"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              required
              disabled={loading}
            />
            <TextField
              margin="normal"
              name="author"
              label="Author"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.author}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              required
              disabled={loading}
            />
            <FormControl fullWidth margin="normal" required disabled={loading}>
              <InputLabel>Genre</InputLabel>
              <Select
                name="genre"
                value={formData.genre}
                label="Genre"
                onChange={handleInputChange}
              >
                {availableGenres.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    {genre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              name="yearPublished"
              label="Year Published"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.yearPublished}
              onChange={handleInputChange}
              inputProps={{
                min: 1000,
                max: new Date().getFullYear() + 1,
                step: 1,
              }}
              required
              disabled={loading}
              sx={{ mt: 2 }}
            />
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button 
                onClick={handleCloseModal}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Saving...' : (selectedBook ? 'Update' : 'Add')} Book
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Book</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedBook?.title}" by {selectedBook?.author}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookList;
