import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Button } from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api';

export default function AdminProfile() {
  const { user } = useAuth();
  const [serverUser, setServerUser] = useState(null);

  useEffect(() => {
    const fetchWhoami = async () => {
      try {
        const { data } = await API.get('/api/auth/whoami');
        setServerUser(data);
      } catch (err) {
        console.error('Failed to fetch whoami:', err);
      }
    };
    fetchWhoami();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Profile</Typography>
      <Card>
        <CardContent>
          <Typography variant="h6">Client-side</Typography>
          <Typography>Name: {user?.name || user?.displayName || 'N/A'}</Typography>
          <Typography>Email: {user?.email || 'N/A'}</Typography>
          <Typography>Role: {user?.role || 'N/A'}</Typography>
          <Button sx={{ mt: 2 }} variant="outlined" onClick={() => window.location.reload()}>Refresh</Button>
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6">Server-side</Typography>
          {serverUser ? (
            <>
              <Typography>ID: {serverUser.id}</Typography>
              <Typography>Email: {serverUser.email}</Typography>
              <Typography>Role: {serverUser.role}</Typography>
            </>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
