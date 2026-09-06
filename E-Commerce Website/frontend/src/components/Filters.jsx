const Filters = ({ categories, filters, setFilters }) => {
  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <aside className="filters">
      <h4>Search</h4>
      <input
        type="text"
        placeholder="Search products..."
        value={filters.keyword}
        onChange={(e) => update("keyword", e.target.value)}
      />

      <h4>Category</h4>
      <select value={filters.category} onChange={(e) => update("category", e.target.value)}>
        <option value="all">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <h4>Price range</h4>
      <div className="price-row">
        <input
          type="number"
          placeholder="Min"
          min="0"
          value={filters.minPrice}
          onChange={(e) => update("minPrice", e.target.value)}
        />
        <span>–</span>
        <input
          type="number"
          placeholder="Max"
          min="0"
          value={filters.maxPrice}
          onChange={(e) => update("maxPrice", e.target.value)}
        />
      </div>

      <h4>Sort by</h4>
      <select value={filters.sort} onChange={(e) => update("sort", e.target.value)}>
        <option value="">Newest</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
        <option value="rating">Top rated</option>
      </select>

      <button
        className="btn-outline full-width"
        onClick={() =>
          setFilters({ keyword: "", category: "all", minPrice: "", maxPrice: "", sort: "" })
        }
      >
        Clear filters
      </button>
    </aside>
  );
};

export default Filters;
