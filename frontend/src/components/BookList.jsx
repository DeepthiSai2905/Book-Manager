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
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: 6,
  },
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
    <Box sx={{ p: 3 }}>
      {/* Header and Add Book Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h5" component="h1">
          Book Manager
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => handleOpenModal()}
          sx={{ minWidth: '150px' }}
        >
          Add Book
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search books..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
            }}
            sx={{ flex: 1, minWidth: '200px' }}
          />
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="genre-filter-label">Filter by Genre</InputLabel>
            <Select
              labelId="genre-filter-label"
              value={genreFilter}
              label="Filter by Genre"
              onChange={(e) => setGenreFilter(e.target.value)}
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
        <Box sx={{ textAlign: 'center', mt: 4, p: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" color="textSecondary">
            {searchTerm || genreFilter !== 'all' 
              ? 'No books match your filters.' 
              : 'No books found. Add a new book to get started!'}
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {currentBooks.map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book.id}>
                <Card sx={cardStyle}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {book.title}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      by {book.author}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip 
                        label={book.genre} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {book.yearPublished}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    {user && user.username === book.createdBy ? (
                      <>
                        <Button 
                          size="small" 
                          onClick={() => handleOpenModal(book)}
                          startIcon={<Edit />}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteClick(book)}
                          startIcon={<Delete />}
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Created by {book.createdBy}
                      </Typography>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={currentPage} 
                onChange={handlePageChange} 
                color="primary"
                showFirstButton 
                showLastButton
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
