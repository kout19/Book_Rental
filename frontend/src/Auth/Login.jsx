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
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth,db, googleProvider, githubProvider } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { getDoc, doc} from 'firebase/firestore'

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
    console.log("Google login successful:", userData);
  }catch (error) {
    console.error("Google login failed:", error);
    throw error; // Re-throw to handle in the calling function
  }
}
const handleGithubLogin =async()=>{
  try{
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;
    const token = await user.getIdToken();
    const userData = {
      email: user.email,
      name: user.displayName,
      role: 'user', 
      token: token,
    };
    console.log("Github login successful:", userData);
  }catch(error){
    console.log("Github login failed:", error);
    throw error; // Re-throw to handle in the calling function
  }
}
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

  const onSubmit = async (data) => {
    setLoading(true)
    setServerError(null)

    try {
      const res = await signInWithEmailAndPassword(auth, data.email, data.password  )
      const user = res.user;
      console.log("user",user);
      if( !user.emailVerified){
        alert("Please verify your email before logging in.")
        return;
      }
      // login(user)
      const userDoc=await getDoc(doc(db,'users',user.uid));
      if(userDoc.exists()){
        const userData=userDoc.data();
        console.log("user Data:", userData);
        login({uid:user.uid,...userData});
      if (userData.role === 'admin') navigate('/admin/dashboard')
      else if (userData.role === 'owner') navigate('/owner/dashboard')
      else navigate('/user/dashboard')
      }
      else{
        setServerError('No user data found. Please contact support.') 
      }  
    } catch (err) {
      console.log(err.code, err.message)
      setServerError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

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
    </Container>
    
  )
}
