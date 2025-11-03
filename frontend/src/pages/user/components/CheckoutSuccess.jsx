import React, { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import BookAPI from '../../../components/books/book_api';

const useQuery = () => new URLSearchParams(useLocation().search);

const CheckoutSuccess = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing payment...');

  const sessionId = query.get('session_id') || query.get('sessionId');
  const bookId = query.get('bookId');
  const periodDays = query.get('periodDays');
  const startDate = query.get('startDate');

  useEffect(() => {
    const doConfirm = async () => {
      try {
        setStatus('Confirming payment and creating rental...');
        if (!sessionId) {
          setStatus('No payment session found in the return URL. If you completed payment, contact support.');
          return;
        }
        await BookAPI.confirmStripe({ session_id: sessionId, bookId, periodDays, startDate });
        setStatus('Rental created! Redirecting...');
        setTimeout(() => navigate('/user/my-rentals'), 1200);
      } catch (err) {
        console.error('Confirm failed', err);
        setStatus('Failed to confirm payment. Please contact support.');
      }
    };
    if (sessionId && bookId) doConfirm();
  }, [sessionId, bookId, periodDays, startDate, navigate]);

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h5">{status}</Typography>
      {(status.includes('Processing') || status.includes('Confirming')) && <CircularProgress sx={{ mt: 2 }} />}
      {status.includes('Failed') && (
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/user/browse-books')}>Back to browse</Button>
      )}
    </Container>
  );
};

export default CheckoutSuccess;
