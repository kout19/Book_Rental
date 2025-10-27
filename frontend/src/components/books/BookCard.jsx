// components/books/BookCard.jsx
import React from "react";
import { Card, CardContent, CardMedia, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ maxWidth: 300, mx: "auto" }}>
      <CardMedia
        component="img"
        height="180"
        image={book.image || "/placeholder.jpg"}
        alt={book.title}
      />
      <CardContent>
        <Typography variant="h6">{book.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {book.author}
        </Typography>
        <Typography sx={{ mt: 1 }}><strong>Price:</strong> ${book.rentPrice}</Typography>
        <Button
          onClick={() => navigate(`/user/book/${book.id}`)}
          variant="contained"
          sx={{ mt: 2 }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default BookCard;
