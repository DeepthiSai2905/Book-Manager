import { createContext, useContext, useState, useEffect } from 'react';
import { getBooks, createBook as createBookApi, updateBook as updateBookApi, deleteBook as deleteBookApi } from '../services/api';

const BookContext = createContext(null);

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await getBooks();
      setBooks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch books');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const addBook = async (bookData) => {
    try {
      const response = await createBookApi(bookData);
      setBooks(prev => [...prev, response.data]);
      return { success: true };
    } catch (err) {
      console.error('Error adding book:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to add book' 
      };
    }
  };

  const updateBook = async (id, bookData) => {
    try {
      const response = await updateBookApi(id, bookData);
      setBooks(prev => 
        prev.map(book => book.id === id ? response.data : book)
      );
      return { success: true };
    } catch (err) {
      console.error('Error updating book:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to update book' 
      };
    }
  };

  const deleteBook = async (id) => {
    try {
      await deleteBookApi(id);
      setBooks(prev => prev.filter(book => book.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting book:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to delete book' 
      };
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <BookContext.Provider value={{
      books,
      loading,
      error,
      addBook,
      updateBook,
      deleteBook,
      refreshBooks: fetchBooks
    }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};

export default BookContext;
