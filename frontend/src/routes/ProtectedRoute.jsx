import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ children }) {
	const { user } = useAuth();
	// If no user, redirect to login
	if (!user) return <Navigate to="/login" replace />;
	return children;
}
