import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';
import API from '../../api';

export default function ReadBook() {
  const { id } = useParams(); // book id
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [rentalId, setRentalId] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileType, setFileType] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/api/books/${id}/read`);
        setTitle(data.title || 'Book');
        setRentalId(data.rentalId || null);
        if (data.fileAvailable) {
          // fetch the file as blob via API (to include auth token) and render appropriately
          try {
            const resp = await API.get(`/api/books/${id}/file`, { responseType: 'blob' });
            const blob = resp.data;
            const url = URL.createObjectURL(blob);
            setContent('');
            setFileUrl(url);
            setFileType(data.fileType || 'application/octet-stream');
          } catch (err) {
            console.error('Failed to fetch file blob', err);
            alert('Failed to load book file');
            navigate(-1);
            return;
          }
        } else {
          setContent(data.content || 'No readable content available');
        }
      } catch (err) {
        console.error('Failed to load readable content', err);
        alert('You cannot read this book. Make sure you have an active rental.');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  // cleanup blob url when unmounting or when fileUrl changes
  useEffect(() => {
    return () => {
      try {
        if (fileUrl) URL.revokeObjectURL(fileUrl);
      } catch (err) {
        console.debug('revokeObjectURL failed', err);
      }
    };
  }, [fileUrl]);

  // const handleSaveOffline = () => {
  //   if (!rentalId) return alert('No rental id, cannot save');
  //   try {
  //     if (fileUrl) {
  //       // try to fetch blob and store as base64 (may be large)
  //       fetch(fileUrl).then((r) => r.blob()).then(async (blob) => {
  //         const arr = await blob.arrayBuffer();
  //         let binary = '';
  //         const bytes = new Uint8Array(arr);
  //         const chunkSize = 0x8000;
  //         for (let i = 0; i < bytes.length; i += chunkSize) {
  //           binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
  //         }
  //         const b64 = btoa(binary);
  //         const stored = { title, fileBase64: b64, fileType, savedAt: Date.now() };
  //         localStorage.setItem(`offline_rental_${rentalId}`, JSON.stringify(stored));
  //         alert('Saved file for offline reading (may be large)');
  //       }).catch((err) => { console.error('Failed to fetch file for offline save', err); alert('Failed to save offline'); });
  //     } else {
  //       localStorage.setItem(`offline_rental_${rentalId}`, JSON.stringify({ title, content, savedAt: Date.now() }));
  //       alert('Saved for offline reading');
  //     }
  //   } catch (err) {
  //     console.error('Save offline failed', err);
  //     alert('Failed to save offline');
  //   }
  // };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>{title}</Typography>
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
        {/* <Button variant="contained" sx={{ ml: 2 }} onClick={handleSaveOffline}>Save Offline</Button> */}
      </Box>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        fileUrl ? (
          // For pdfs use an iframe to display; also provide an "Open in new tab" button
          fileType && fileType.includes('pdf') ? (
            <Box>
              <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={() => {
                  try {
                    const w = window.open('about:blank');
                    if (w) {
                      // write a simple viewer that embeds the blob URL so browsers render it inline
                      const safeType = fileType || 'application/octet-stream';
                      const html = `<!doctype html><html><head><title>${title}</title></head><body style="margin:0;padding:0;">
                        ${safeType.includes('pdf') ? `<iframe src="${fileUrl}" style="width:100%;height:100vh;border:none"></iframe>` : `<object data="${fileUrl}" type="${safeType}" style="width:100%;height:100vh;border:none">Your browser does not support inline display. <a href="${fileUrl}" download>Download</a></object>`}
                      </body></html>`;
                      w.document.open();
                      w.document.write(html);
                      w.document.close();
                    } else {
                      // popup blocked, fallback to direct open which may trigger download
                      window.open(fileUrl, '_blank');
                    }
                  } catch (err) {
                    console.error('Open in new tab failed', err);
                    window.open(fileUrl, '_blank');
                  }
                }}>Open in new tab</Button>
                <Button variant="contained" component="a" href={fileUrl} download={title}>Download</Button>
              </Box>
              <iframe src={fileUrl} title={title} style={{ width: '100%', height: '80vh', border: 'none' }} />
            </Box>
          ) : (
            <Box>
              <Typography>File loaded. You can open or download the file.</Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={() => window.open(fileUrl, '_blank')}>Open in new tab</Button>
                <Button variant="contained" component="a" href={fileUrl} download={title}>Download</Button>
              </Box>
            </Box>
          )
        ) : (
          <Box
            sx={{
              border: '1px solid #ddd',
              borderRadius: 1,
              p: 2,
              bgcolor: '#fff',
              userSelect: 'none', // discourage copying
            }}
            onContextMenu={(e)=>e.preventDefault()}
          >
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{content}</Typography>
          </Box>
        )
      )}
    </Container>
  );
}
