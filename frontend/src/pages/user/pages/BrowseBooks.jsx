// pages/renter/BrowseBooks.jsx
import React, { useEffect, useState } from "react";
import { Grid, Container, Typography, Alert, CircularProgress, Box } from "@mui/material";
import BookAPI from "../../../components/books/book_api"
import BookCard from "../../../components/books/BookCard";
import BookFilterBar from "../../../components/books/BookFilterBar";

const BrowseBooks = () => {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "", author: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await BookAPI.getBooks(filters);
        console.log(data);
        setBooks(data);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError("Failed to load books. Please check if the server is running.");
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooks();
  }, [filters]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Available Books</Typography>
      <BookFilterBar filters={filters} setFilters={setFilters} />
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {books.length === 0 && !error ? (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                No books found. Try adjusting your filters.
              </Typography>
            </Grid>
          ) : (
            books.map((book) => (
              <Grid item xs={12} sm={6} md={4} 
              key={book.id}>
              <BookCard book={book} />
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Container>
  );
};
export default BrowseBooks;
