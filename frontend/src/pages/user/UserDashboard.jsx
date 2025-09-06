import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged, reload } from "firebase/auth";

export default function UserDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await reload(user);
        if (!user.emailVerified) {
          alert("You must verify your email to access the dashboard.");
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    });
  }, [navigate]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome to Your Dashboard</h1>
    </div>
  );
}
