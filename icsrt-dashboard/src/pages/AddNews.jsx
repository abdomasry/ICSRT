import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';

const AddNews = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ title: '', date: '', summary: '', content: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/news', form);
      toast.success('News added successfully!');
      navigate('/news');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add News</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} required className="w-full border rounded p-2" />
        <input type="date" name="date" value={form.date} onChange={handleChange} required className="w-full border rounded p-2" />
        <input type="text" name="summary" placeholder="Summary" value={form.summary} onChange={handleChange} required className="w-full border rounded p-2" />
        <textarea name="content" placeholder="Full Content" value={form.content} onChange={handleChange} className="w-full border rounded p-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save News</button>
      </form>
    </div>
  );
};

export default AddNews;