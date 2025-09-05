import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { applyActionCode, getAuth } from "firebase/auth";
import { app } from "../firebase/firebase";

const auth = getAuth(app);

export default function EmailVerify() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get("oobCode");
    console.log(oobCode);
    if (oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          setStatus("Email verified successfully!");
          setTimeout(() => navigate("/dashboard"), 2000);
        })
        .catch((error) => {
          console.error("Email verification error:", error);
          setStatus("Invalid or expired verification link.");
        });
    } else {
      setStatus("Invalid verification link.");
    }
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-xl font-semibold">{status}</p>
    </div>
  );
}
