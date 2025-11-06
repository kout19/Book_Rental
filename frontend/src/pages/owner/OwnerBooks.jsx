import React, { useEffect, useState, useRef } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, TextField, Box, MenuItem } from '@mui/material';
import API from '../../api';
import supabase from '../../config/supabase';
import { useLocation } from 'react-router-dom';
import {Snackbar, Alert} from '@mui/material';

export default function OwnerBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] =useState({open: false, message: '', severity:'success'});
  const showMessage= (message, severity='success') => setSnackbar({open: true, message, severity});
  const [form, setForm] = useState({ title: '', author: '', totalCopies: 1, description: '', publishedYear: new Date().getFullYear(), category: '', rentPrice: 0 });
  const titleRef = useRef(null);
  const location = useLocation();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/api/books/owner/me');
      setBooks(data || []);
    } catch (err) {
      console.error('Failed to fetch owner books', err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get('mode') === 'create') {
      setEditing(null);
      setTimeout(() => titleRef.current?.focus(), 150);
    }
  }, [location.search]);

  const handleCreate = async () => {
    try {
      await API.post('/api/books', form);
      alert('Book created');
      setForm({ title: '', totalCopies: 1, description: '' });
      fetchBooks();
    } catch (err) {
      console.error('Create failed', err);
      alert('Create failed');
    }
  };

  const handleEdit = (b) => {
    setEditing(b._id);
    setForm({ title: b.title, author: b.author || '', totalCopies: b.totalCopies || 1, description: b.description || '', publishedYear: b.publishedYear || new Date().getFullYear(), category: b.category || '' });
  };

  const handleSave = async () => {
    try {
      await API.put(`/api/books/${editing}`, form);
      alert('Saved');
      setEditing(null);
      fetchBooks();
    } catch (err) {
      console.error('Save failed', err);
      alert('Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this book?')) return;
    try {
      await API.delete(`/api/books/${id}`);
      alert('Deleted');
      fetchBooks();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete failed');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>My Books</Typography>
      <Box component="form" sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }} onSubmit={(e)=>{e.preventDefault(); editing ? handleSave() : handleCreate();}}>
        <TextField inputRef={titleRef} label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <TextField label="Author" required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        <TextField label="Price" required type="number" value={form.rentPrice} onChange={(e)=> setForm({...form, rentPrice: Number(e.target.value)})} sx={{ width: 120 }} />
        <TextField label="Copies" required type="number" value={form.totalCopies} onChange={(e) => setForm({ ...form, totalCopies: Number(e.target.value) })} sx={{ width: 120 }} />
        <TextField label="Published Year" type="number" value={form.publishedYear} onChange={(e) => setForm({ ...form, publishedYear: Number(e.target.value) })} sx={{ width: 140 }} />
        <TextField label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} sx={{ minWidth: 320 }} />
        <Button type="submit" variant="contained">{editing ? 'Save' : 'Create'}</Button>
        <label style={{ display: 'inline-block', marginLeft: 8 }}>
            <input
              type="file"
              accept=".json,.txt,.pdf,.epub"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const maxSize = 50 * 1024 * 1024; // 50MB
                if (file.size > maxSize) {
                  alert('File too large. Max 50MB.');
                  return;
                }
                 const user = supabase.auth.user();
                  if (!user) {
                    showMessage('You must be logged in to upload files.', 'error');
                    return;
                  }
                setUploading(true);
                try {
                  // If JSON file, try batch import
                  if (file.name.endsWith('.json') || file.type === 'application/json') {
                    const text = await file.text();
                    let parsed;
                    try { parsed = JSON.parse(text); } catch { parsed = null; }
                    if (Array.isArray(parsed)) {
                      for (const item of parsed) {
                        const payload = {
                          title: item.title || item.name,
                          author: item.author || item.writer || '',
                          description: item.description || item.summary || '',
                          totalCopies: item.totalCopies || 1,
                          publishedYear: item.publishedYear || item.year || new Date().getFullYear(),
                          category: item.category || 'Imported',
                          rentPrice: item.rentPrice || item.price || 0
                        };
                        await API.post('/api/books', payload);
                      }
                    showMessage('Book created successfully');
                      fetchBooks();
                    }
                  } else {
                    // For text/pdf/epub: upload directly to Supabase
                    const safeFileName = file.name.normalize('NFD').replace(/[^a-zA-Z0-9._-]/g, '_');
                    const filePath = `books/${Date.now()}_${safeFileName}`;

                    const { data: supaData, error: supaError } = await supabase.storage
                      .from('books')
                      .upload(filePath, file, {
                        contentType: file.type,
                        cacheControl: '3600',
                        upsert: false,
                      });
                    if (supaError) throw supaError;
                    {uploading && <Typography color="primary">Uploading...</Typography>}
                    const { data: publicUrlData } = supabase.storage.from('books').getPublicUrl(filePath);
                    const fileUrl = publicUrlData.publicUrl;

                    // Send only metadata to backend
                    const payload = {
                      title: form.title || file.name,
                      author: form.author || '',
                      category: form.category || 'Uploaded',
                      rentPrice: form.rentPrice || 0,
                      description: form.description || '',
                      fileUrl,
                      fileName: file.name,
                      mimeType: file.type,
                      size: file.size
                    };
                  if(!form.title || !form.author) 
                  {
                    showMessage('Please enter title and author');
                    return;
                  }
                    await API.post('/api/books/upload', payload);
                    showMessage('Book created successfully');
                    fetchBooks();
                  }
                } catch (err) {
                  console.error('Upload failed', err);
                  alert('Upload failed: ' + err.message);
                }
                setUploading(false);
              }}
            />
            <Button variant="outlined" component="span" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>

          </label>

      </Box>

      {loading ? <Typography>Loading...</Typography> : (
        <Grid container spacing={2}>
          {books.map((b) => (
            <Grid item key={b._id} xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{b.title}</Typography>
                  <Typography>Copies: {b.totalCopies} | Rented: {b.rentedCount}</Typography>
                  <Typography>Approved: {b.approved ? 'Yes' : 'No'}</Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button onClick={() => handleEdit(b)}>Edit</Button>
                    <Button color="error" onClick={() => handleDelete(b._id)}>Delete</Button>
                    {!b.approved && !b.approvalRequested && (
                      <Button onClick={async ()=>{ try{ await API.post(`/api/books/${b._id}/request-approval`); alert('Approval requested'); fetchBooks(); }catch(er){console.error(er); alert('Failed');}}}>Request Approval</Button>
                    )}
                    {b.approvalRequested && <Button disabled>Approval Pending</Button>}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
    </Snackbar>

    </Container>
  );
}
