import { Link } from "react-router-dom";
export default function Privacy() {
  return (
    <div className="p-6 text-6">
      <h2>Privacy Policy</h2>
      <p>Here you’ll write your privacy details...</p>
      <Link to ="/"
      className="text-black  hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium text-sm px-5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
        Back to Home</Link>
    </div>
  );
}