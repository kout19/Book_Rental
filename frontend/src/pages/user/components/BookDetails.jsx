import React, { useEffect, useState } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import BookAPI from "../../../components/books/book_api";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await BookAPI.getBookDetails(id);
        setBook(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchBook();
    }
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Book not found</Typography>
        <Button onClick={() => navigate("/user/browse-books")}>
          Back to Browse Books
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <img 
            src={book.image || "/placeholder.jpg"} 
            alt={book.title}
            style={{ width: "100%", maxWidth: 400, height: "auto" }}
          />
        </Box>
        <Box sx={{ flex: 2 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>{book.title}</Typography>
          <Typography variant="h6" sx={{ mb: 1 }}>Author: {book.author}</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{book.description}</Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>Rent Price: ${book.rentPrice}</Typography>
          <Button 
            variant="contained" 
            sx={{ mr: 2 }}
            onClick={() => {
              // TODO: Implement rent functionality
              alert("Rent functionality not implemented yet");
            }}
          >
            Rent This Book
          </Button>
          <Button 
            variant="outlined"
            onClick={() => navigate("/user/browse-books")}
          >
            Back to Browse Books
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default BookDetails;
