import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../utils/validationSchema'
import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { signInWithEmailAndPassword, signInWithPopup ,signOut} from 'firebase/auth';
import { auth,db, googleProvider, githubProvider } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { getDoc, doc} from 'firebase/firestore'

// Social login handlers are defined inside the component so they can use AuthContext.login
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState(null)
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })
    // social login handlers (use login from context)
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();
      const userData = {
        email: user.email,
        name: user.displayName,
        role: 'user',
        token: token,
      };
      // persist token and user in auth context (merge profile info)
      login(token, { uid: user.uid, email: user.email, name: user.displayName, role: 'user' });
      // Sync with backend to obtain server JWT
      try {
        const resp = await API.post('/api/auth/sync', { name: user.displayName, email: user.email, role: 'user' }, { headers: { Authorization: `Bearer ${token}` } });
        const serverToken = resp.data?.token;
        if (serverToken) login(serverToken, { uid: user.uid, email: user.email, name: user.displayName, role: 'user' });
      } catch (syncErr) {
        console.warn('Social sync failed:', syncErr?.response?.data || syncErr.message || syncErr);
      }
      console.log('Google login successful:', userData);
      navigate('/user/dashboard');
    } catch (error) {
      console.error('Google login failed:', error);
      setServerError('Social login failed.');
    }
  };
  const handleGithubLogin = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      const token = await user.getIdToken();
      login(token, { uid: user.uid, email: user.email, name: user.displayName, role: 'user' });
      try {
        const resp = await API.post('/api/auth/sync', { name: user.displayName, email: user.email, role: 'user' }, { headers: { Authorization: `Bearer ${token}` } });
        const serverToken = resp.data?.token;
        if (serverToken) login(serverToken, { uid: user.uid, email: user.email, name: user.displayName, role: 'user' });
      } catch (syncErr) {
        console.warn('Social sync failed:', syncErr?.response?.data || syncErr.message || syncErr);
      }
      console.log('Github login successful');
      navigate('/user/dashboard');
    } catch (error) {
      console.log('Github login failed:', error);
      setServerError('Social login failed.');
    }
  };

const onSubmit = async (data) => {
  setLoading(true);
  setServerError(null);

  try {
    // 🔹 Step 1: Firebase login
    const res = await signInWithEmailAndPassword(auth, data.email, data.password);
    const user = res.user;
    if (!user.emailVerified) {
      alert("Please verify your email before logging in.");
      setLoading(false);
      return;
    }

    // 🔹 Step 2: Get Firebase ID token
    const token = await user.getIdToken();

    // 🔹 Step 3: Fetch user profile from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      setServerError("No user profile found in Firestore. Please contact support.");
      setLoading(false);
      return;
    }

    const userData = userDoc.data();

    // 🔹 Step 4: Sync with backend (optional, keeps MongoDB up to date)
    try {
      const syncResp = await API.post(
        "/api/auth/sync",
        { name: userData.name, email: userData.email, role: userData.role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const serverToken = syncResp.data?.token;
      if (serverToken) {
        // Replace Firebase token with backend JWT
        login(serverToken, { uid: user.uid, ...userData });
      } else {
        login(token, { uid: user.uid, ...userData });
      }
    } catch (syncErr) {
      console.warn("Sync to backend failed:", syncErr?.response?.data || syncErr.message || syncErr);
      // Still continue with login, but log warning
      login(token, { uid: user.uid, ...userData });
    }

    // 🔹 Step 5: Verify MongoDB user status (disabled, deleted, etc.)
    try {
      const verifyRes = await API.post("/api/auth/login", { idToken: token });
      const { role } = verifyRes.data;

      // 🔹 Step 6: Redirect based on MongoDB role
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "owner") navigate("/owner/dashboard");
      else navigate("/user/dashboard");
    } catch (verifyErr) {
      console.error("Backend verification failed:", verifyErr);
      const msg =
        verifyErr?.response?.data?.message ||
        "Account could not be verified. Please contact support.";
      setServerError(msg);
      await signOut(auth);
    }
  } catch (err) {
    console.error(err.code, err.message);
    setServerError("Invalid email or password.");
  } finally {
    setLoading(false);
  }
};


  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Login
      </Typography>

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
        </Button>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don’t have an account?{' '}
          <Link component={RouterLink} to="/register">
            Register here
          </Link>
        </Typography>
      </Box>
       <button onClick={handleGoogleLogin} type='button'
         className="flex items-center justify-center gap-3 w-full max-w-sm px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:shadow-md hover:bg-gray-50 transition duration-200">
           <img
           src="https://www.svgrepo.com/show/475656/google-color.svg"
           alt="Google"
           className="w-5 h-5"
           />
        <span className="text-sm font-medium text-gray-700">
          Sign in with Google
        </span>
        </button>
        <button onClick={handleGithubLogin} type='button'
         className="flex items-center justify-center gap-3 w-full max-w-sm px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:shadow-md hover:bg-gray-50 transition duration-200 mt-2">
           <img   
            src="https://cdn.simpleicons.org/github/000000"
            alt="Github"
            className="w-5 h-5"
          />
        <span className="text-sm font-medium text-gray-700">  
          Sign in with Github
        </span>
        </button>
              <Link
          component={RouterLink}
          to="/"
          underline="none"
          sx={{
            display: 'inline-block',
            mt: 3,
            px: 2,
            py: 1,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          ← Back to Home
        </Link>
    </Container>
    
  )
}
