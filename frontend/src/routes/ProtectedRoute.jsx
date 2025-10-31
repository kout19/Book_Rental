import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export default function RequireAuth({ children }) {
	const { user, ready } = useAuth();
	// Wait until auth initialization completes to avoid premature redirects
	if (!ready) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
				<CircularProgress />
			</Box>
		);
	}
	if (!user) return <Navigate to="/login" replace />;
	return children;
}
