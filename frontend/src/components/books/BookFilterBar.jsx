// components/books/BookFilterBar.jsx
import React from "react";
import { TextField, FormControl, Select, MenuItem, Box } from "@mui/material";

const BookFilterBar = ({ filters, setFilters }) => {
  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      <TextField
        label="Search"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        size="small"
      />
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={filters.category}
          displayEmpty
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <MenuItem value="">All Categories</MenuItem>
          <MenuItem value="fiction">Fiction</MenuItem>
          <MenuItem value="science">Science</MenuItem>
          <MenuItem value="history">History</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default BookFilterBar;
