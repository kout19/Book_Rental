// api/books.js
import API from "../../api";

// Wrapper around the shared API axios instance. Backend exposes books at /api/books
const BookAPI = {
  getBooks: (filters) => {
    return API.get(`/api/books`, { params: filters });
  },
  getBookDetails: (id) => {
    return API.get(`/api/books/${id}`);
  },
  getCategories: () => {
    return API.get(`/api/books/categories`);
  },
  // backend expects borrow endpoint: POST /api/books/borrow/:bookId
  rentBook: (bookId, userId) => {
    return API.post(`/api/books/borrow/${bookId}`, { userId });
  },
  getMyRentals: () => {
    return API.get(`/api/books/my-rentals`);
  },
  returnBook: (bookId) => {
    return API.post(`/api/books/return/${bookId}`);
  },


  // Request to become owner (user requests admin approval)
  requestOwnerApproval: () => {
    return API.post('/api/users/request-approval');
  }
};

export default BookAPI;

// Stripe
BookAPI.createStripeSession = ({ bookId, periodDays, startDate }) => {
  return API.post('/api/payments/create-stripe', { bookId, periodDays, startDate });
};
BookAPI.confirmStripe = ({ session_id, bookId, periodDays, startDate }) => {
  return API.post('/api/payments/confirm-stripe', { session_id, bookId, periodDays, startDate });
};

// AI assistant
BookAPI.aiAsk = (prompt) => {
  return API.post('/api/ai/ask', { prompt });
};
 