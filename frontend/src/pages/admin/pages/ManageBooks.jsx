import { useState, useEffect } from "react";
import API from "../../../api";

export default function AdminImportBooks() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [page, setPage] = useState(1);
  const [modalBook, setModalBook] = useState(null); // for book preview modal
  const [existingBooks, setExistingBooks] = useState([]);
  const [numFound, setNumFound] = useState(0);

  const limit = 12; // books per page

  // 🔍 Search books from Open Library API
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);

    try {
      // Use a direct fetch to Open Library so we don't send our app Authorization
      // header (attached by the shared API instance). Sending Authorization
      // triggers a CORS preflight which Open Library doesn't accept.
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`Open Library request failed: ${r.status}`);
      const data = await r.json();
      setNumFound(data.numFound);
      const formatted = data.docs.map((doc) => ({
        key: doc.key,
        title: doc.title,
        author: doc.author_name?.[0] || "Unknown",
        publish_year: doc.publish_year,
        isbn: doc.isbn?.[0],
        cover: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
          : "https://via.placeholder.com/150x200?text=No+Cover",
        first_sentence: doc.first_sentence?.[0] || "No description available.",
        publisher: doc.publisher?.[0] || "Unknown publisher",
      }));
      setBooks(formatted);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Select or unselect a book
  const toggleSelect = (book) => {
    setSelectedBooks((prev) =>
      prev.find((b) => b.key === book.key)
        ? prev.filter((b) => b.key !== book.key)
        : [...prev, book]
    );
  };

  // 🚀 Import selected books
  const handleImportSelected = async () => {
    if (selectedBooks.length === 0) {
      alert("Please select at least one book!");
      return;
    }
    await importBooks(selectedBooks);
  };

  // 🚀 Import single book
  const handleImportSingle = async (book) => {
    await importBooks([book]);
  };

  // 🧠 Helper function to import books
  const importBooks = async (booksToImport) => {
    setImporting(true);
    try {
      // console.log("Import payload:", booksToImport);
      const res = await API.post(`/api/books/import`, { books: booksToImport });
      console.log("saved books", res.data.savedBooks);
      alert(`✅ ${res.data.savedBooks.length} books imported successfully!`);
      setSelectedBooks([]);
      // refresh existing books list so imported books appear immediately
      await fetchExistingBooks();
    } catch (error) {
      console.error("Error importing books:", error);
      // Show server-provided message when available
      const serverMsg = error?.response?.data?.error || error?.response?.data?.message;
      if (serverMsg) {
        alert(`❌ Failed to import books: ${serverMsg}`);
      } else {
        alert("❌ Failed to import books. See console for details.");
      }
    } finally {
      setImporting(false);
    }
  };

  // Fetch existing books (admin can see all)
  const fetchExistingBooks = async () => {
    try {
      const { data } = await API.get('/api/books');
      // data may be an array
      setExistingBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch existing books', err);
      setExistingBooks([]);
    }
  };

  useEffect(() => {
    // load admin's view of books on mount
    fetchExistingBooks();
  }, []);

  const handleDeleteBook = async (id) => {
    if (!confirm('Delete this book?')) return;
    try {
      await API.delete(`/api/books/${id}`);
      alert('Book deleted');
      fetchExistingBooks();
    } catch (err) {
      console.error('Failed to delete book', err);
      alert('Failed to delete book');
    }
  };

  const handleApproveBook = async (book, approved = true) => {
    try {
      await API.put(`/api/admin/books/${book._id}/approve`, { approved });
      alert(`Book ${approved ? 'approved' : 'unapproved'}`);
      fetchExistingBooks();
    } catch (err) {
      console.error('Failed to set approval', err);
      alert('Failed to update approval');
    }
  };

  // 📄 Pagination controls
  const nextPage = async () => {
    setPage((p) => p + 1);
    await handleSearch({ preventDefault: () => {} });
  };
  const prevPage = async () => {
    if (page === 1) return;
    setPage((p) => p - 1);
    await handleSearch({ preventDefault: () => {} });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        📚 Import Books from Open Library
      </h2>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search by title, author, or subject..."
          className="flex-grow border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Book Results */}
      {loading ? (
        <p className="text-gray-500 text-center">Loading books...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map((book) => (
            <div
              key={book.key}
              className={`p-3 border rounded-xl shadow-sm hover:shadow-md transition bg-white relative`}
            >
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-56 object-cover rounded-lg mb-3 cursor-pointer"
                onClick={() => setModalBook(book)}
              />
              <h3 className="font-semibold text-gray-800 truncate">{book.title}</h3>
              <p className="text-sm text-gray-600 truncate">{book.author}</p>
              <p className="text-xs text-gray-500 mb-2">
                {book.publish_year?.[0] || "Unknown Year"}
              </p>

              {/* Buttons */}
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={() => toggleSelect(book)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    selectedBooks.find((b) => b.key === book.key)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {selectedBooks.find((b) => b.key === book.key)
                    ? "Selected"
                    : "Select"}
                </button>

                <button
                  onClick={() => handleImportSingle(book)}
                  disabled={importing}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {numFound > limit && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={prevPage}
            disabled={page === 1 || loading}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-gray-600">
            Page {page} / {Math.ceil(numFound / limit)}
          </span>
          <button
            onClick={nextPage}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Import Selected Button */}
      {selectedBooks.length > 0 && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleImportSelected}
            disabled={importing}
            className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 disabled:opacity-50"
          >
            {importing
              ? "Importing..."
              : `Import ${selectedBooks.length} Selected`}
          </button>
        </div>
      )}

      {/* Existing books (admin listing + actions) */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-3">Existing Books</h3>
        {existingBooks.length === 0 ? (
          <p className="text-gray-600">No books found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {existingBooks.map((b) => (
              <div key={b._id} className="p-3 border rounded-xl shadow-sm bg-white">
                <div className="flex gap-3">
                  <img src={b.image || 'https://via.placeholder.com/100x140?text=No+Cover'} alt={b.title} className="w-20 h-28 object-cover rounded" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 truncate">{b.title}</h4>
                    <p className="text-sm text-gray-600">{b.author}</p>
                    <p className="text-xs text-gray-500">{b.publishedYear || ''}</p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => handleApproveBook(b, true)} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                      <button onClick={() => handleApproveBook(b, false)} className="px-3 py-1 bg-yellow-500 text-white rounded">Unapprove</button>
                      <button onClick={() => handleDeleteBook(b._id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                      <a href={`/admin/books?view=${b._id}`} className="px-3 py-1 bg-gray-200 rounded">View</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Book Preview Modal */}
      {modalBook && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setModalBook(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-96 shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalBook(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <img
              src={modalBook.cover}
              alt={modalBook.title}
              className="w-full h-64 object-cover rounded-xl mb-4"
            />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {modalBook.title}
            </h3>
            <p className="text-gray-600 mb-1">
              <strong>Author:</strong> {modalBook.author}
            </p>
            <p className="text-gray-600 mb-1">
              <strong>Publisher:</strong> {modalBook.publisher}
            </p>
            <p className="text-gray-600 mb-1">
              <strong>Year:</strong>{" "}
              {modalBook.publish_year?.[0] || "Unknown"}
            </p>
            <p className="text-gray-700 mt-3 text-sm">
              {modalBook.first_sentence}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
