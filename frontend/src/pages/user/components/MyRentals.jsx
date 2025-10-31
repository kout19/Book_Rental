import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Collapse,
  IconButton,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BookAPI from "../../../components/books/book_api";
import BookCard from "../../../components/books/BookCard";
import { useNavigate } from 'react-router-dom';

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
            // rental objects from backend may be Rental docs with populated book
            const normalized = rented.map((r) => {
              const book = r.book || r; // if Rental, r.book is populated; otherwise r may be Book
              const bookId = book._id || book.id;
              return {
                id: bookId,
                rentalId: r._id || null,
                title: book.title,
                author: book.author,
                image: book.image || book.cover || "/placeholder.jpg",
                rentPrice: book.rentPrice || book.rent_price || book.price || 0,
                description: book.description || book.first_sentence || "",
                category: book.category || "",
                available: book.available,
                startDate: r.startDate || null,
                endDate: r.endDate || null,
                days: r.days || null,
                totalPrice: r.totalPrice || null,
                returned: r.returned || false,
              };
            });
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

  const handleReturn = async (bookId) => {
    if (!confirm('Return this book?')) return;
    try {
      await BookAPI.returnBook(bookId);
      setBooks((b) => b.filter((x) => x.id !== bookId));
    } catch (err) {
      console.error('Return failed', err);
      alert('Failed to return');
    }
  };

  const [expanded, setExpanded] = useState({});
  const toggleExpand = (id) => {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  };
  const navigate = useNavigate();

  const fmtDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString();
    } catch (e) {
      console.error('fmtDate parse error', e);
      return d;
    }
  };

  const fmtCurrency = (v) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);
  };

  const computeActiveDays = (start) => {
    if (!start) return 0;
    const msPerDay = 1000 * 60 * 60 * 24;
    const startMs = new Date(start).setHours(0,0,0,0);
    const nowMs = new Date().setHours(0,0,0,0);
    const diff = nowMs - startMs;
    const days = Math.max(1, Math.ceil(diff / msPerDay));
    return days;
  };

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
                <Card>
                  <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 140, objectFit: 'cover' }}
                      image={book.image || '/placeholder.jpg'}
                      alt={book.title}
                    />
                    <Box sx={{ flex: 1 }}>
                      <CardContent>
                        <Typography variant="h6">{book.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{book.author}</Typography>
                        <Typography sx={{ mt: 1 }}><strong>Per day:</strong> {fmtCurrency(book.rentPrice)}</Typography>
                        <Typography sx={{ mt: 0.5 }} color="text.secondary">{book.category}</Typography>
                      </CardContent>
                      <CardActions disableSpacing sx={{ justifyContent: 'space-between' }}>
                        <Box>
                          <Button variant="contained" size="small" onClick={() => navigate(`/user/read/${book.id}`)}>Read</Button>
                          <Button variant="outlined" size="small" sx={{ ml: 1 }} onClick={() => handleReturn(book.id)}>Return</Button>
                          {/* Request to become owner button */}
                          <Button variant="text" size="small" sx={{ ml: 1 }} onClick={async () => {
                            try {
                              await BookAPI.requestOwnerApproval();
                              alert('Request sent to admin to become owner.');
                            } catch (err) {
                              alert('Failed to send request.',err);
                            }
                          }}>Request Owner</Button>
                        </Box>
                        <IconButton
                          onClick={() => toggleExpand(book.id)}
                          aria-expanded={!!expanded[book.id]}
                          aria-label="show details"
                        >
                          <ExpandMoreIcon sx={{ transform: expanded[book.id] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }} />
                        </IconButton>
                      </CardActions>
                      <Collapse in={!!expanded[book.id]} timeout="auto" unmountOnExit>
                        <Divider />
                        <Box sx={{ p: 2 }}>
                          <Typography variant="body2"><strong>Rental start:</strong> {fmtDate(book.startDate)}</Typography>
                          <Typography variant="body2"><strong>Rental end:</strong> {book.returned ? fmtDate(book.endDate) : 'Active'}</Typography>
                          <Typography variant="body2"><strong>Days:</strong> {book.returned ? (book.days || '—') : computeActiveDays(book.startDate)}</Typography>
                          <Typography variant="body2"><strong>Total:</strong> {book.returned ? fmtCurrency(book.totalPrice) : fmtCurrency((computeActiveDays(book.startDate) || 0) * (book.rentPrice || 0))}</Typography>
                          {book.description && (
                            <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">{book.description}</Typography>
                          )}
                        </Box>
                      </Collapse>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Container>
  );
};

export default MyRentals;
