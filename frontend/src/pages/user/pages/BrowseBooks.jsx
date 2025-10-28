// pages/renter/BrowseBooks.jsx
import React, { useEffect, useState } from "react";
import { Grid, Container, Typography, Alert, CircularProgress, Box } from "@mui/material";
import BookAPI from "../../../components/books/book_api"
import BookCard from "../../../components/books/BookCard";
import BookFilterBar from "../../../components/books/BookFilterBar";

const BrowseBooks = () => {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "", author: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // debounce searchTerm -> filters.search
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchTerm }));
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await BookAPI.getBooks(filters);
        console.log("Fetched books:", data);
        // Normalize backend documents to frontend-friendly shape
        const normalized = data.map((b) => ({
          id: b._id || b.id,
          title: b.title,
          author: b.author,
          image: b.image || b.cover || "/placeholder.jpg",
          rentPrice: b.rentPrice || b.rent_price || b.price || 0,
          description: b.description || b.first_sentence || "",
          category: b.category || "",
          available: b.available,
        }));
        setBooks(normalized);
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

  // Fetch categories from backend once
  useEffect(() => {
    let mounted = true;
    const loadCats = async () => {
      try {
        const { data } = await BookAPI.getCategories();
        if (mounted) setCategories(data || []);
      } catch (err) {
        // fallback: categories may be derived from books
        console.warn('Could not load categories from API, falling back to local extraction', err);
      }
    };
    loadCats();
    return () => { mounted = false; };
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Available Books</Typography>
      <BookFilterBar
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
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
