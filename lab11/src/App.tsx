import React, { useState, useEffect } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch all results and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/solr/jcgAritcles/select?indent=true&q.op=OR&q=*:*&wt=json`);
      const data = await res.json();
      setResults(data.response.docs);
      setFilteredResults(data.response.docs);

      // Extract categories for filter options
      const allCategories = data.response.docs.reduce((acc, doc) => {
        doc.category.forEach((cat: string) => {
          if (!acc.includes(cat)) {
            acc.push(cat);
          }
        });
        return acc;
      }, []);
      setCategories(allCategories);
    };

    fetchData();
  }, []);

  // Filter results based on selected category
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSelectedCategory(selected);

    if (selected === '') {
      // Show all results if no category is selected
      setFilteredResults(results);
    } else {
      // Filter the results based on the selected category
      const filtered = results.filter((doc: any) =>
        doc.category.includes(selected)
      );
      setFilteredResults(filtered);
    }
  };

  // Handle search query
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/solr/jcgAritcles/select?indent=true&q.op=OR&q=${encodeURIComponent(query)}&wt=json`);
    const data = await res.json();
    setResults(data.response.docs);

    // Filter the results based on the selected category
    if (selectedCategory) {
      const filtered = data.response.docs.filter((doc: any) =>
        doc.category.includes(selectedCategory)
      );
      setFilteredResults(filtered);
    } else {
      setFilteredResults(data.response.docs);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Solr Search UI</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          style={{ width: '300px', padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px' }}>Search</button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          style={{ padding: '10px', marginBottom: '20px' }}
        >
          <option value="">Select Category</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: '20px' }}>
        {filteredResults.map((doc: any, index) => (
          <div key={index} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
            <strong>{doc.title[0]}</strong><br />
            <em>{doc.author[0]}</em> | {doc.category.join(', ')}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
