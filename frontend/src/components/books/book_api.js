// api/books.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BOOK_BASE_URL;

const API = {
  getBooks: (filters) => {
    return axios.get(BASE_URL, { params: filters });
  },
  getBookDetails: (id) => {
    return axios.get(`${BASE_URL}/${id}`);
  },
  rentBook: (bookId, userId) => {
    return axios.post(`${BASE_URL}/${bookId}/rent`, { userId });
  },
};

export default API;
