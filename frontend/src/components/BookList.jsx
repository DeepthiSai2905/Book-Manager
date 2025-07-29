import { useState, useEffect } from 'react';
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
  Paper,
  Alert,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Add, 
  Search, 
  FilterList, 
  Close, 
  Edit, 
  Delete 
} from '@mui/icons-material';
import { useBooks } from '../contexts/BookContext';

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
  const { books, loading, error, deleteBook, addBook, updateBook } = useBooks();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    yearPublished: ''
  });
  const [formError, setFormError] = useState('');
  
  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const itemsPerPage = 6;

  // Extract all unique genres
  useEffect(() => {
    const uniqueGenres = [...new Set(books.map(book => book.genre))];
    setGenres(uniqueGenres);
  }, [books]);

  // Apply filters and pagination
  useEffect(() => {
    let result = [...books];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(book => 
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        book.genre.toLowerCase().includes(term)
      );
    }
    
    // Apply genre filter
    if (genreFilter && genreFilter !== 'all') {
      result = result.filter(book => book.genre === genreFilter);
    }
    
    setFilteredBooks(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [books, searchTerm, genreFilter]);

  // Get current books for pagination
  const indexOfLastBook = currentPage * itemsPerPage;
  const indexOfFirstBook = indexOfLastBook - itemsPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpen = (book = null) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        title: book.title,
        author: book.author,
        genre: book.genre,
        yearPublished: book.yearPublished.toString()
      });
    } else {
      setEditingBook(null);
      setFormData({
        title: '',
        author: '',
        genre: '',
        yearPublished: ''
      });
    }
    setFormError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormError('');
  };

  const handleDeleteClick = (book) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (bookToDelete) {
      await deleteBook(bookToDelete.id);
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setBookToDelete(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!formData.title || !formData.author || !formData.genre || !formData.yearPublished) {
      setFormError('All fields are required');
      return;
    }
    
    const year = parseInt(formData.yearPublished);
    if (isNaN(year) || year < 0 || year > new Date().getFullYear() + 1) {
      setFormError('Please enter a valid year');
      return;
    }
    
    try {
      const bookData = {
        ...formData,
        yearPublished: year
      };
      
      if (editingBook) {
        await updateBook(editingBook.id, bookData);
      } else {
        await addBook(bookData);
      }
      
      handleClose();
    } catch (error) {
      setFormError(error.message || 'An error occurred');
    }
  };

  if (loading && books.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

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
          onClick={() => handleOpen()}
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
              startAdornment={<FilterList sx={{ color: 'action.active', mr: 1 }} />}
            >
              <MenuItem value="all">All Genres</MenuItem>
              {genres.map((genre) => (
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
                    <Button 
                      size="small" 
                      onClick={() => handleOpen(book)}
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
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </Typography>
            <IconButton onClick={handleClose} size="small">
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
              onChange={handleChange}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              margin="normal"
              name="author"
              label="Author"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.author}
              onChange={handleChange}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              margin="normal"
              name="genre"
              label="Genre"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.genre}
              onChange={handleChange}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              margin="normal"
              name="yearPublished"
              label="Year Published"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.yearPublished}
              onChange={handleChange}
              inputProps={{
                min: 0,
                max: new Date().getFullYear() + 1
              }}
              required
            />
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
              >
                {editingBook ? 'Update' : 'Add'} Book
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Book</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{bookToDelete?.title}" by {bookToDelete?.author}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookList;
