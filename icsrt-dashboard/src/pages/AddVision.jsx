import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddVision = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        alert('Vision added successfully!');
        navigate('/vision');
      } else {
        alert('Failed to add.');
      }
    } catch (err) {
      console.error(err);
      alert('Error occurred while adding.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add Vision</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} required className="w-full border rounded p-2" />
        <textarea name="content" placeholder="Content" value={form.content} onChange={handleChange} required className="w-full border rounded p-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
      </form>
    </div>
  );
};

export default AddVision;