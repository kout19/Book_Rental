import React, { useEffect, useState } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api';

export default function AdminSettings() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || user?.displayName || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) {
      alert('No user id found. Please ensure you are logged in.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.put(`/api/users/${user.id}`, { name, email });
      // Update client-side user info (optimistic). If backend returns updated user, merge.
      if (data?.user) {
        login(localStorage.getItem('token') || '', { name: data.user.name, email: data.user.email });
        alert('Profile updated');
      } else {
        alert('Profile updated (server did not return user)');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      const msg = err?.response?.data?.message || err.message;
      alert('Failed to update profile: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Settings</Typography>
      <Box sx={{ maxWidth: 520 }}>
        <TextField fullWidth label="Name" value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
        <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
        <Button variant="contained" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
      </Box>
    </Container>
  );
}
