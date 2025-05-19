import React, { useState } from 'react';
import './App.css';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

function App() {
  const [rows, setRows] = useState([
    { title: '', uri: '', language: 'en', category: '', source: '', sourceUrl: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (index: number, field: string, value: string) => {
    const updatedRows = [...rows];
    updatedRows[index][field as keyof typeof updatedRows[number]] = value;
    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([...rows, { title: '', uri: '', language: 'en', category: '', source: '', sourceUrl: '' }]);
  };

  const removeRow = (index: number) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated.length ? updated : [{ title: '', uri: '', language: 'en', category: '', source: '', sourceUrl: '' }]);
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const uploadPromises = rows.map((row) =>
  addDoc(collection(db, 'videos'), {
    id: Date.now().toString() + Math.random().toString().slice(2, 6),
    createdAt: Date.now(),
    viewCount: 0,
    ...row
  })
);

      await Promise.all(uploadPromises);
      setSuccess(true);
      setRows([{ title: '', uri: '', language: 'en', category: '', source: '', sourceUrl: '' }]);
    } catch (error) {
      console.error('Error adding documents: ', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h2>📤 Bulk Upload Videos to Firestore</h2>
      <form onSubmit={handleBulkSubmit}>
        {rows.map((row, index) => (
          <div key={index} className="grid-row">
            <input
              placeholder="Title"
              value={row.title}
              onChange={(e) => handleChange(index, 'title', e.target.value)}
              required
            />
            <input
              placeholder="Video URL"
              value={row.uri}
              onChange={(e) => handleChange(index, 'uri', e.target.value)}
              required
            />
            <select
              value={row.language}
              onChange={(e) => handleChange(index, 'language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
            </select>
            <input
              placeholder="Category"
              value={row.category}
              onChange={(e) => handleChange(index, 'category', e.target.value)}
              required
            />
            <input
              placeholder="Source (e.g., @ANI)"
              value={row.source}
              onChange={(e) => handleChange(index, 'source', e.target.value)}
            />
            <input
              placeholder="Source URL (optional)"
              value={row.sourceUrl}
              onChange={(e) => handleChange(index, 'sourceUrl', e.target.value)}
            />
            <button type="button" onClick={() => removeRow(index)}>🗑️</button>
          </div>
        ))}

        <button type="button" onClick={addRow}>➕ Add Row</button>

        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload All'}
        </button>

        {success && <p className="success">✅ Videos uploaded successfully!</p>}
      </form>
    </div>
  );
}

export default App;
