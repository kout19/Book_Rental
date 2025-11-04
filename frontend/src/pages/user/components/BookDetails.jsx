import React, { useEffect, useState } from "react";
import { Container, Typography, Button, Box, MenuItem, Select, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import BookAPI from "../../../components/books/book_api";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  // removed renting state (not used)
  const [periodDays, setPeriodDays] = useState(7);
  const [startDateOption, setStartDateOption] = useState('today');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // AI assistant
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');

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
          <Typography variant="h6" sx={{ mb: 2 }}>Rent Price (per day): ${book.rentPrice}</Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="body2">Select period</Typography>
              <Select value={periodDays} onChange={(e) => setPeriodDays(parseInt(e.target.value))} sx={{ minWidth: 140 }}>
                <MenuItem value={7}>1 week (7 days)</MenuItem>
                <MenuItem value={14}>2 weeks (14 days)</MenuItem>
                <MenuItem value={30}>1 month (30 days)</MenuItem>
              </Select>
            </Box>
            <Box>
              <Typography variant="body2">Start date</Typography>
              <Select value={startDateOption} onChange={(e) => setStartDateOption(e.target.value)} sx={{ minWidth: 180 }}>
                <MenuItem value={'today'}>Start today</MenuItem>
                <MenuItem value={'tomorrow'}>Start tomorrow</MenuItem>
                <MenuItem value={'in7'}>Start in 7 days</MenuItem>
                <MenuItem value={'custom'}>Pick date (enter below)</MenuItem>
              </Select>
            </Box>
            <Box>
              <TextField
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                sx={{ display: startDateOption === 'custom' ? 'inline-flex' : 'none' }}
              />
            </Box>
          </Box>

          <Typography sx={{ mb: 2 }}><strong>Total:</strong> ${((book.rentPrice || 0) * (periodDays || 1)).toFixed(2)}</Typography>

          <Button 
            variant="contained"
            sx={{ mr: 2 }}
            disabled={checkoutLoading}
            onClick={async () => {
              try {
                setCheckoutLoading(true);
                // compute startDate
                let start = new Date();
                if (startDateOption === 'tomorrow') start.setDate(start.getDate() + 1);
                else if (startDateOption === 'in7') start.setDate(start.getDate() + 7);
                else if (startDateOption === 'custom' && customStartDate) start = new Date(customStartDate);
                // Stripe flow
                const { data } = await BookAPI.createStripeSession({ bookId: id, periodDays, startDate: start.toISOString() });
                if (data) {
                  console.log('Checkout data', data);
                  if (data.mock && data.successUrl) {
                    // For mock flow the server returns a successUrl containing tx_ref.
                    // Redirect to that URL so CheckoutSuccess can confirm the mock tx_ref.
                    window.location.href = data.successUrl;
                    return;
                  }
                  if (data.url) {
                    // redirect to Chapa checkout URL
                    window.location.href = data.url;
                    return;
                  }
                }
                alert('Failed to start checkout');
              } catch (err) {
                console.error('Checkout error', err);
                const msg = err?.response?.data?.message || err?.message;
                alert('Checkout failed: ' + msg);
              } finally {
                setCheckoutLoading(false);
              }
            }}
          >
            {checkoutLoading ? 'Processing...' : 'Rent This Book'}
          </Button>
          <Button 
            variant="outlined"
            onClick={() => setAiOpen(true)}
          >
            Ask Assistant
          </Button>

          <Dialog open={aiOpen} onClose={() => setAiOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Assistant</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                multiline
                minRows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={`Ask about this book: e.g. "Summarize this book" or "Is this suitable for children?"`}
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Reply</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{aiReply || 'No reply yet'}</Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAiOpen(false)}>Close</Button>
              <Button onClick={async () => {
                try {
                  const { data } = await BookAPI.aiAsk(`Book: ${book.title}\nAuthor: ${book.author}\nQuestion: ${aiPrompt}`);
                  setAiReply(data?.answer || 'No answer');
                } catch (e) {
                  console.error('AI ask failed', e);
                  setAiReply('Failed to get answer');
                }
              }} variant="contained">Ask</Button>
            </DialogActions>
          </Dialog>
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
