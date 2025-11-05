import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="p-6 text-gray-800">
      <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>

      <p className="mb-4">
        Your privacy is important to us. This policy explains how we collect, use, and protect your information.
      </p>

      <h3 className="font-semibold mt-4 mb-2">1. Information We Collect</h3>
      <ul className="list-disc ml-6 mb-4">
        <li>
          <strong>Personal Information:</strong> such as name, email, and phone number when creating an account or sending messages.
        </li>
        <li>
          <strong>Usage Data:</strong> including browser type, IP address, and pages visited to improve our services.
        </li>
      </ul>

      <h3 className="font-semibold mt-4 mb-2">2. How We Use Your Information</h3>
      <ul className="list-disc ml-6 mb-4">
        <li>Provide and manage your account.</li>
        <li>Send notifications or updates about your rentals.</li>
        <li>Improve user experience and site functionality.</li>
      </ul>

      <h3 className="font-semibold mt-4 mb-2">3. Data Protection</h3>
      <p className="mb-4">
        We use secure servers and encryption to protect your personal information. Your data will not be shared with third parties except as required by law.
      </p>

      <h3 className="font-semibold mt-4 mb-2">4. Cookies</h3>
      <p className="mb-4">
        We may use cookies to enhance user experience and remember login sessions.
      </p>

      <h3 className="font-semibold mt-4 mb-2">5. Your Rights</h3>
      <p className="mb-4">
        You can request access, correction, or deletion of your personal data at any time by contacting us.
      </p>

      <h3 className="font-semibold mt-4 mb-2">6. Contact Us</h3>
      <p className="mb-6">
        If you have questions about these policies, please contact us through the contact page on our website.
      </p>

      <Link
        to="/"
        className="inline-block bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-md font-medium transition duration-200"
      >
        Back to Home
      </Link>
    </div>
  );
}
