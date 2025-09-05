// src/pages/PhoneVerification.jsx
import { useState } from 'react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { app } from '../firebase/firebase';

const auth = getAuth(app);

export default function PhoneVerification() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isCodeSent, setIsCodeSent] = useState(false);

  // Step 2: Set up Recaptcha
  const setUpRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': () => {
        console.log('reCAPTCHA verified');
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired. Please retry.');
      },
    }, auth);
  };

  // Step 3: Send SMS
  const handleSendCode = async () => {
    setUpRecaptcha();
    const appVerifier = window.recaptchaVerifier;

    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setIsCodeSent(true);
      console.log("SMS sent to", phoneNumber);
    } catch (error) {
      console.error("Failed to send SMS", error);
    }
  };

  // Step 4: Verify SMS code
  const handleVerifyCode = async () => {
    try {
      const result = await confirmationResult.confirm(verificationCode);
      console.log("Phone verified!", result.user);
      alert("Phone number verified!");
    } catch (error) {
      console.error("Verification failed", error);
      alert("Invalid code.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Phone Verification</h2>

      <div className="mb-4">
        <label className="block mb-1">Phone Number</label>
        <input
          type="tel"
          placeholder="+2519XXXXXXX"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded"
        />
      </div>

      {!isCodeSent ? (
        <button
          onClick={handleSendCode}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Send Verification Code
        </button>
      ) : (
        <>
          <div className="mt-4">
            <label className="block mb-1">Verification Code</label>
            <input
              type="text"
              placeholder="Enter code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
            />
          </div>
          <button
            onClick={handleVerifyCode}
            className="w-full mt-3 bg-green-600 text-white py-2 rounded"
          >
            Verify Code
          </button>
        </>
      )}

      <div id="recaptcha-container" className="mt-2" />
    </div>
  );
}
