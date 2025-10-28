import React, { useEffect, useState } from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import BookAPI from "../../../components/books/book_api";
import BookCard from "../../../components/books/BookCard";

const MyRentals = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        // Use protected endpoint to get current user's rentals
        const { data } = await BookAPI.getMyRentals();
        const rented = data || [];
        const normalized = rented.map((b) => ({
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
        console.error('Error fetching rentals:', err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>My Rentals</Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={3}>
          {books.length === 0 ? (
            <Grid item xs={12}>
              <Typography>No rentals found.</Typography>
            </Grid>
          ) : (
            books.map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book.id}>
                <Box>
                  <BookCard book={book} />
                </Box>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Container>
  );
};

export default MyRentals;
