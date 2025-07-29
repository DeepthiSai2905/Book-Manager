const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const auth = require('../authMiddleware');
let books = require('../data/books');

// Middleware to check if user is the owner of the book
const isOwner = (req, res, next) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  
  // Ensure createdBy exists and matches the current user
  if (!book.createdBy || book.createdBy !== req.user.username) {
    return res.status(403).json({ 
      message: 'You do not have permission to modify this book' 
    });
  }
  next();
};

// Helper function to save books back to the data file
const saveBooks = () => {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, '../data/books.js');
  fs.writeFileSync(
    filePath,
    `let books = ${JSON.stringify(books, null, 2)};\n\nmodule.exports = books;`
  );
};


router.get('/', auth, (req, res) => {
  try {
    // Only return books created by the logged-in user
    res.json(books);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/mybooks', auth, (req, res) => {
  try {
    // Only return books created by the logged-in user
    const userBooks = books.filter(book => book.createdBy === req.user.username);
    res.json(userBooks);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST api/books
 * @desc    Add a new book
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { title, author, genre, yearPublished } = req.body;

    // Validation
    if (!title || !author || !genre || !yearPublished) {
      return res.status(400).json({ message: 'Please include all fields' });
    }

    const year = parseInt(yearPublished);
    if (isNaN(year) || year < 0 || year > new Date().getFullYear() + 1) {
      return res.status(400).json({ message: 'Please enter a valid year' });
    }

    const newBook = {
      id: uuidv4(),
      title,
      author,
      genre,
      yearPublished: year,
      createdBy: req.user.username,
      createdAt: new Date().toISOString()
    };

    books.push(newBook);
    saveBooks(); // Save to file
    res.status(201).json(newBook);
  } catch (err) {
    console.error('Error adding book:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pushing books in bulk to populate initial data triggered in backend - /api/books/bulk
/*router.post('/bulk', auth, (req, res) => {
  console.log("Bulk books received:", req.body);
  try {
    const newBooks = req.body;

    if (!Array.isArray(newBooks) || newBooks.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of books' });
    }

    const invalidBooks = [];
    const addedBooks = [];

    newBooks.forEach((book, index) => {
      const { title, author, genre, yearPublished } = book;

      const year = parseInt(yearPublished);

      if (!title || !author || !genre || isNaN(year) || year < 0 || year > new Date().getFullYear() + 1) {
        invalidBooks.push({ index, reason: 'Invalid or missing fields', book });
        return;
      }

      const newBook = {
        id: uuidv4(),
        title,
        author,
        genre,
        yearPublished: year,
        createdBy: req.user.username,
        createdAt: new Date().toISOString()
      };

      books.push(newBook);
      addedBooks.push(newBook);
    });

    saveBooks(); // Save updated list to file
    console.log("Bulk books added:", addedBooks);
    res.status(201).json({
      added: addedBooks.length,
      skipped: invalidBooks.length,
      addedBooks,
      errors: invalidBooks
    });
  } catch (err) {
    console.error('Error adding multiple books:', err);
    res.status(500).json({ message: 'Server error' });
  }
});*/


router.put('/:id', auth, isOwner, (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, genre, yearPublished } = req.body;
    
    const bookIndex = books.findIndex(book => book.id === id);
    
    if (bookIndex === -1) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Update only the allowed fields
    const updatedBook = {
      ...books[bookIndex],
      title: title || books[bookIndex].title,
      author: author || books[bookIndex].author,
      genre: genre || books[bookIndex].genre,
      yearPublished: yearPublished ? parseInt(yearPublished) : books[bookIndex].yearPublished,
      updatedAt: new Date().toISOString()
    };

    books[bookIndex] = updatedBook;
    saveBooks(); // Save to file
    res.json(updatedBook);
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/:id', auth, isOwner, (req, res) => {
  try {
    const { id } = req.params;
    books = books.filter(book => book.id !== id);
    saveBooks(); // Save to file
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('Error deleting book:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
