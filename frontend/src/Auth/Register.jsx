import {
  Typography,
  Link,
} from '@mui/material'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../utils/validationSchema';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useState } from 'react';
import { app } from '../firebase/firebase';

const auth = getAuth(app);
const db = getFirestore(app);

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const handleRegister = async (data) => {
    console.log("From data sumbited", data);
    try {
      const res = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = res.user;

      // Send email verification
      await sendEmailVerification(user);

      // Save user in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: data.name,
        email: data.email,
        role: 'user',
        createdAt: serverTimestamp(),
      });

      alert('Registration successful! Check your email to verify your account.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register. Try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-6 text-center">Register</h2>
      <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">

        {/* Name */}
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input type="text" {...register('name')} className="w-full border px-3 py-2 rounded" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input type="email" {...register('email')} className="w-full border px-3 py-2 rounded" />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input type="password" {...register('password')} className="w-full border px-3 py-2 rounded" />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block mb-1 font-medium">Confirm Password</label>
          <input type="password" {...register('confirmPassword')} className="w-full border px-3 py-2 rounded" />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* Submit */}
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
          Sign Up
        </button>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login">
            Login here
          </Link>
        </Typography>
      </form>
    </div>
  );
}
