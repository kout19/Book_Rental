import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import API from '../../../api';

export default function ManageOwnerUploads() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUnapproved = async () => {
    setLoading(true);
    try {
      // backend getBooks filters approved=true; admins can use a dedicated admin endpoint
      const adminRes = await API.get('/api/admin/unapproved-books');
      setBooks(adminRes.data || []);
    } catch (err) {
      console.error('Failed to fetch unapproved books', err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUnapproved(); }, []);

  const handleApprove = async (id, approve) => {
    try {
      await API.put(`/api/admin/books/${id}/approve`, { approved: approve });
      alert(approve ? 'Approved' : 'Unapproved');
      fetchUnapproved();
    } catch (err) {
      console.error('Approve failed', err);
      alert('Approve failed');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Owner Uploads</Typography>
      {loading ? <Typography>Loading...</Typography> : (
        <Grid container spacing={2}>
          {books.map((b) => (
            <Grid item key={b._id} xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{b.title}</Typography>
                  <Typography>Owner: {b.owner?.name} ({b.owner?.email})</Typography>
                  <Typography>Copies: {b.totalCopies}</Typography>
                  <Typography>Approved: {b.approved ? 'Yes' : 'No'}</Typography>
                  <Button sx={{ mt: 1 }} onClick={() => handleApprove(b._id, true)}>Approve</Button>
                  <Button sx={{ mt: 1, ml: 1 }} color="error" onClick={() => handleApprove(b._id, false)}>Unapprove</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
