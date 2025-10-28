// components/books/BookFilterBar.jsx
import React from "react";
import { TextField, FormControl, Select, MenuItem, Box } from "@mui/material";

const BookFilterBar = ({ filters, setFilters, categories = [], searchTerm, setSearchTerm }) => {
  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: 'center' }}>
      <TextField
        label="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="small"
      />
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <Select
          value={filters.category}
          displayEmpty
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories && categories.length > 0 ? (
            categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))
          ) : (
            // Fallback hard-coded categories
            <>
              <MenuItem value="fiction">Fiction</MenuItem>
              <MenuItem value="science">Science</MenuItem>
              <MenuItem value="history">History</MenuItem>
            </>
          )}
        </Select>
      </FormControl>
    </Box>
  );
};

export default BookFilterBar;
