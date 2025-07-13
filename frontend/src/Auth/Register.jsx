import {
  Typography,
  Link,
} from '@mui/material'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../utils/validationSchema';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import {app} from '../firebase/firebase';
import { ca } from 'zod/v4/locales';
const auth = getAuth(app);
const db = getFirestore(app);
// Function to handle user registration
const handleRegister =async (data) =>{
    try{
       const res = await createUserWithEmailAndPassword(auth, data.email, data.password);
       const user = res.user;
        await sendEmailVerification(user, {
            url: 'http://localhost:3000/verify-email', // Adjust this URL to your verification page
        });
        console.log("verification link sent");
        await setDoc(doc(db, 'users', user.uid), {
            name: data.name,
            email: data.email,
            role: 'user', // Default role, adjust as needed
            createdAt: serverTimestamp(),
        });
         alert("Registration successful! Please check your email to verify your account.");
        const token = await user.getIdToken();
        const userData = {
            email: user.email,
            name: data.name,
            role: 'user', // Default role, adjust as needed
            token: token,
        };
        console.log("Registration successful:", userData);
        return userData; // Return user data for further processing if needed
    }catch(error){
        console.error("Registration failed:", error);
        throw error; // Re-throw to handle in the calling function
    }   
}

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  // Creating Rechaptcha verifier for phone number authentication
const createRecaptchaVerifier = () => {
window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
    'size': 'invisible',
    'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log("Recaptcha verified");
    },
    'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        console.log("Recaptcha expired");
    }

}, auth);
return window.recaptchaVerifier;
}
// send verification code to phone number
const sendVerificationCode = async (phoneNumber) => {
  createRecaptchaVerifier();
  try {
    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult; // Store confirmation result for later use
    console.log("Verification code sent to phone number:", phoneNumber);
  } catch (error) {
    console.error("Error sending verification code:", error);
    throw error; // Re-throw to handle in the calling function
  }
};
//verify the code sent to phone number
const verifyCode = async (code) => {
  try {
    const result  = await window.confirmationResult.confirm(code);
    const user = result.user;
    console.log("Code verified successfully:", user);
    return user; // Return user for further processing if needed
  }catch (error) {
    console.error("Error verifying code:", error);
    throw error; // Re-throw to handle in the calling function
  }
};
const onSubmit = async (data) => {
    try {
    const userData = await handleRegister(data);
    console.log('Form Data:', userData);
    const verifUser = await verifyCode(data.phoneNumber);
    console.log('Verification User:', verifUser);
    }catch (error) {
      console.error('Error submitting form:', error.message);
    }
    // Handle registration (e.g., Firebase or your backend API)
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-6 text-center">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Name Field */}
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            {...register('name')}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        {/* Phone Number Field */}
        <div>
          <label className="block mb-1 font-medium">Phone Number</label>
          <input
            type="tel"
            {...register('phone')}
            placeholder="+251912345678" // Ethiopian example
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            {...register('email')}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            {...register('password')}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block mb-1 font-medium">Confirm Password</label>
          <input
            type="password"
            {...register('confirmPassword')}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Sign Up
        </button>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Aready have an account?{' '}
          <Link component={RouterLink} to="/login">
            Login here
          </Link>
        </Typography>
      </form>
      <div id="recaptcha-container"></div>
    </div>
  );
}
