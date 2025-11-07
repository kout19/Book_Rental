import React, { useEffect, useState, useRef } from 'react';
import {
  Container, Typography, Grid, Card, CardContent,
  Button, TextField, Box, Snackbar, Alert, LinearProgress
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import supabase from '../../config/supabase';
import API from '../../api';
import { getAuth } from 'firebase/auth'; // ✅ Firebase import

export default function OwnerBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // ✅ new for progress
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showMessage = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const [form, setForm] = useState({
    title: '',
    author: '',
    totalCopies: 1,
    description: '',
    publishedYear: new Date().getFullYear(),
    category: '',
    rentPrice: 0,
  });

  const titleRef = useRef(null);
  const location = useLocation();

  // ✅ Fetch books for logged-in owner
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

  useEffect(() => {
    fetchBooks();
  }, []);

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
      showMessage('Book created successfully');
      setForm({ title: '', totalCopies: 1, description: '' });
      fetchBooks();
    } catch (err) {
      console.error('Create failed', err);
      showMessage('Create failed', 'error');
    }
  };

  const handleEdit = (b) => {
    setEditing(b._id);
    setForm({
      title: b.title,
      author: b.author || '',
      totalCopies: b.totalCopies || 1,
      description: b.description || '',
      publishedYear: b.publishedYear || new Date().getFullYear(),
      category: b.category || '',
      rentPrice: b.rentPrice || 0,
    });
  };

  const handleSave = async () => {
    try {
      await API.put(`/api/books/${editing}`, form);
      showMessage('Saved successfully');
      setEditing(null);
      fetchBooks();
    } catch (err) {
      console.error('Save failed', err);
      showMessage('Save failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this book?')) return;
    try {
      await API.delete(`/api/books/${id}`);
      showMessage('Deleted successfully');
      fetchBooks();
    } catch (err) {
      console.error('Delete failed', err);
      showMessage('Delete failed', 'error');
    }
  };

  /** ✅ Upload directly to Supabase with progress tracking */
 /** ✅ Upload directly to Supabase with progress tracking using Supabase SDK */
const handleFileUpload = async (file) => {
  if (!file) return;

  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    showMessage('File too large. Max 50MB.', 'error');
    return;
  }

  setUploading(true);
  setUploadProgress(0);

  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      showMessage('You must be logged in with Firebase to upload files.', 'error');
      setUploading(false);
      return;
    }

    const idToken = await user.getIdToken();

    // ✅ Wrap file in a stream so we can track progress
    const reader = file.stream().getReader();
    let uploaded = 0;
    const stream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        uploaded += value.length;
        setUploadProgress(Math.round((uploaded / file.size) * 100));
        controller.enqueue(value);
      },
    });

    const newFile = new File([await new Response(stream).arrayBuffer()], file.name, {
      type: file.type,
    });

    const safeFileName = file.name.normalize('NFD').replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `books/${Date.now()}_${safeFileName}`;

    const { data, error } = await supabase.storage
      .from('books')
      .upload(filePath, newFile, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage.from('books').getPublicUrl(filePath);
    const fileUrl = publicUrlData.publicUrl;

    const payload = {
      title: form.title || file.name,
      author: form.author || '',
      category: form.category || 'Uploaded',
      rentPrice: form.rentPrice || 0,
      description: form.description || '',
      fileUrl,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
    };

    await API.post('/api/books/upload', payload, {
      headers: { Authorization: `Bearer ${idToken}` },
    });

    showMessage('Book uploaded successfully');
    fetchBooks();
  } catch (err) {
    console.error('Upload failed', err);
    showMessage(`Upload failed: ${err.message}`, 'error');
  } finally {
    setUploading(false);
    setUploadProgress(0);
  }
};


  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>My Books</Typography>

      <Box
        component="form"
        sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}
        onSubmit={(e) => { e.preventDefault(); editing ? handleSave() : handleCreate(); }}
      >
        <TextField inputRef={titleRef} label="Title" required value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <TextField label="Author" required value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })} />
        <TextField label="Price" required type="number" value={form.rentPrice}
          onChange={(e) => setForm({ ...form, rentPrice: Number(e.target.value) })} sx={{ width: 120 }} />
        <TextField label="Copies" required type="number" value={form.totalCopies}
          onChange={(e) => setForm({ ...form, totalCopies: Number(e.target.value) })} sx={{ width: 120 }} />
        <TextField label="Published Year" type="number" value={form.publishedYear}
          onChange={(e) => setForm({ ...form, publishedYear: Number(e.target.value) })} sx={{ width: 140 }} />
        <TextField label="Category" value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <TextField label="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} sx={{ minWidth: 320 }} />
        <Button type="submit" variant="contained">{editing ? 'Save' : 'Create'}</Button>

        <label style={{ display: 'inline-block', marginLeft: 8 }}>
          <input
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => handleFileUpload(e.target.files?.[0])}
            accept=".json,.txt,.pdf,.epub"
          />
          <Button variant="outlined" component="span" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </label>
      </Box>

      {/* ✅ Progress bar below upload button */}
      {uploading && (
        <Box sx={{ width: '100%', mt: 1 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="body2" color="textSecondary" align="center">
            {uploadProgress}% uploaded
          </Typography>
        </Box>
      )}

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
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
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
