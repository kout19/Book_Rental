import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { applyActionCode, getAuth, sendEmailVerification } from "firebase/auth";
import { app } from "../firebase/firebase";

const auth = getAuth(app);

export default function EmailVerify() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying...");
  const [user, setUser] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get("oobCode");
    
    if (oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          setStatus("Email verified successfully!");
          setTimeout(() => navigate("/login"), 2000);
        })
        .catch((error) => {
          console.error("Email verification error:", error);
          setStatus("Invalid or expired verification link.");
        });
    } else {
      // If no oobCode, check if user is logged in but not verified
      const currentUser = auth.currentUser;
      if (currentUser && !currentUser.emailVerified) {
        setUser(currentUser);
        setStatus("Please check your email and click the verification link.");
      } else {
        setStatus("Invalid verification link.");
      }
    }
  }, [navigate]);

  const handleResendVerification = async () => {
    if (!user) return;
    
    setResendLoading(true);
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true
      });
      setStatus("Verification email sent! Check your email (including spam folder).");
    } catch (error) {
      console.error("Resend error:", error);
      setStatus("Failed to resend verification email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        <p className="text-lg mb-6">{status}</p>
        
        {user && !user.emailVerified && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Didn't receive the email? Check your spam folder or request a new one.
            </p>
            <button
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend Verification Email"}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
            >
              Back to Login
            </button>
          </div>
        )}
        
        {!user && (
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
}
