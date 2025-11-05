import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="p-6 text-gray-800">
      <h2 className="text-2xl font-bold mb-4">Terms of Service</h2>

      <p className="mb-4">
        Welcome to <strong>Book Rental</strong>! By accessing or using our website, you agree to follow these Terms of Service. Please read them carefully before using our platform.
      </p>

      <h3 className="font-semibold mt-4 mb-2">1. Use of the Service</h3>
      <p className="mb-4">
        You may use our platform to browse, rent, or manage books. You agree not to use the website for any illegal or unauthorized purpose.
      </p>

      <h3 className="font-semibold mt-4 mb-2">2. Account Creation</h3>
      <p className="mb-4">
        To rent or manage books, you must create an account. You are responsible for maintaining the confidentiality of your login information and for all activities that occur under your account.
      </p>

      <h3 className="font-semibold mt-4 mb-2">3. Book Rentals and Returns</h3>
      <p className="mb-4">
        Users must follow rental periods and return policies as stated on the platform. Late returns or damages may result in additional charges or suspension of your account.
      </p>

      <h3 className="font-semibold mt-4 mb-2">4. Content Ownership</h3>
      <p className="mb-4">
        All materials, including images, designs, and content, are owned by <strong>Book Rental</strong> or its partners. You may not copy or redistribute any part of the site without permission.
      </p>

      <h3 className="font-semibold mt-4 mb-2">5. Termination</h3>
      <p className="mb-4">
        We reserve the right to suspend or terminate accounts that violate these terms or misuse our services.
      </p>

      <h3 className="font-semibold mt-4 mb-2">6. Changes to the Terms</h3>
      <p className="mb-6">
        We may update these terms at any time. Continued use of the website after changes means you accept the revised terms.
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
