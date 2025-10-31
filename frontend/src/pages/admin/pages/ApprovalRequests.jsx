import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Checkbox, Button, Box } from '@mui/material';
import API from '../../../api';

export default function ApprovalRequests(){
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [selectedBooks, setSelectedBooks] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetch = async ()=>{
    setLoading(true);
    try{
      const { data } = await API.get('/api/admin/approval-requests');
      setUsers(data.users || []);
      setBooks(data.books || []);
    }catch(err){ console.error('Failed to fetch approval requests', err); setUsers([]); setBooks([]); }
    setLoading(false);
  };

  useEffect(()=>{ fetch(); }, []);

  const toggle = (set, id) => {
    const copy = new Set(set);
    if (copy.has(id)) copy.delete(id); else copy.add(id);
    return copy;
  };

  const handleBulkUsers = async (approve=true) => {
    if (selectedUsers.size === 0) return alert('Select users');
    try{
      const ids = Array.from(selectedUsers);
      await API.put('/api/admin/users/approve-bulk', { ids, approved: approve });
      alert('Users updated');
      setSelectedUsers(new Set());
      fetch();
    }catch(err){ console.error(err); alert('Failed'); }
  };

  const handleBulkBooks = async (approve=true) => {
    if (selectedBooks.size === 0) return alert('Select books');
    try{
      const ids = Array.from(selectedBooks);
      await API.put('/api/admin/books/approve-bulk', { ids, approved: approve });
      alert('Books updated');
      setSelectedBooks(new Set());
      fetch();
    }catch(err){ console.error(err); alert('Failed'); }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Approval Requests</Typography>
      {loading ? <Typography>Loading...</Typography> : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Owner Requests</Typography>
            {users.length === 0 ? <Typography>No owner approval requests</Typography> : users.map(u => (
              <Card key={u._id} sx={{ mb: 1 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Checkbox checked={selectedUsers.has(u._id)} onChange={() => setSelectedUsers(toggle(selectedUsers, u._id))} />
                  <Box sx={{ flex: 1 }}>
                    <Typography><strong>{u.name}</strong> — {u.email}</Typography>
                    <Typography variant="body2">Requested approval: {String(u.approvalRequested)}</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
            <Box sx={{ mt: 1 }}>
              <Button variant="contained" onClick={() => handleBulkUsers(true)} sx={{ mr: 1 }}>Approve selected</Button>
              <Button variant="outlined" color="error" onClick={() => handleBulkUsers(false)}>Unapprove selected</Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6">Book Requests</Typography>
            {books.length === 0 ? <Typography>No book approval requests</Typography> : books.map(b => (
              <Card key={b._id} sx={{ mb: 1 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Checkbox checked={selectedBooks.has(b._id)} onChange={() => setSelectedBooks(toggle(selectedBooks, b._id))} />
                  <Box sx={{ flex: 1 }}>
                    <Typography><strong>{b.title}</strong> — {b.owner?.name || b.owner}</Typography>
                    <Typography variant="body2">Requested approval: {String(b.approvalRequested)}</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
            <Box sx={{ mt: 1 }}>
              <Button variant="contained" onClick={() => handleBulkBooks(true)} sx={{ mr: 1 }}>Approve selected</Button>
              <Button variant="outlined" color="error" onClick={() => handleBulkBooks(false)}>Unapprove selected</Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
