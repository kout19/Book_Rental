import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, Box, Button, List, ListItem, ListItemText } from '@mui/material';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box as MuiBox } from '@mui/material';

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const [server, setServer] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [{ data: whoami }, { data: ownerBooks }] = await Promise.all([
          API.get('/api/auth/whoami'),
          API.get('/api/books/owner/me')
        ]);
        setServer(whoami);
        setBooks(ownerBooks || []);
      } catch (err) {
        console.error('Failed to fetch owner dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleRequestApproval = async () => {
    try {
      await API.post('/api/users/request-approval');
      alert('Approval requested. An admin will review your account.');
      // refresh whoami
      const { data } = await API.get('/api/auth/whoami');
      setServer(data);
    } catch (err) {
      console.error('Request approval failed', err);
      alert('Failed to request approval');
    }
  };

  // const handleProfile = () => {
  //   navigate('/profile');
  // };

  // const handleLogout = () => {
  //   logout();
  //   navigate('/');
  // };

  const totalBooks = books.length;
  const approvedCount = books.filter((b) => b.approved).length;
  const pendingCount = books.filter((b) => !b.approved).length;
  const totalRentedCopies = books.reduce((s, b) => s + (b.rentedCount || 0), 0);
  const totalCopies = books.reduce((s, b) => s + (b.totalCopies || 1), 0);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Owner Dashboard</Typography>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>Welcome, {user?.name || server?.name || 'Owner'}</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Wallet</Typography>
              <Typography variant="h5">${server?.wallet ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Total Books</Typography>
              <Typography variant="h5">{totalBooks}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Approved</Typography>
              <Typography variant="h5">{approvedCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Rented Copies</Typography>
              <Typography variant="h5">{totalRentedCopies}/{totalCopies}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={() => navigate('/owner/books')}>Manage My Books</Button>
        <Button variant="outlined" onClick={() => navigate('/owner/books')}>Add New Book</Button>
        {/* <Button variant="text" onClick={handleProfile}>Profile</Button>
        <Button variant="text" onClick={handleLogout}>Logout</Button> */}
        {!server?.isApproved && !server?.approvalRequested && (
          <Button color="secondary" onClick={handleRequestApproval}>Request Account Approval</Button>
        )}
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6">Recent Books</Typography>
          <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>Pending approvals: {pendingCount}</Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : books.length === 0 ? (
            <Typography>No books yet. Click "Add New Book" to create one.</Typography>
          ) : (
            <List>
              {books.slice(0, 5).map((b) => (
                <ListItem key={b._id} secondaryAction={
                  <Button size="small" onClick={() => navigate('/owner/books')}>Manage</Button>
                }>
                  <ListItemText
                    primary={b.title}
                    secondary={`Copies: ${b.totalCopies || 1} • Rented: ${b.rentedCount || 0} • Approved: ${b.approved ? 'Yes' : 'No'}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
