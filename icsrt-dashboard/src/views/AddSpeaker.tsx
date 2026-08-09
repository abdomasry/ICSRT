'use client';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';

const AddSpeaker = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', title: '', image: '', country: '', bio: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/speakers', form);
      toast.success('Speaker added successfully!');
      navigate('/speakers');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add Speaker</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="w-full border rounded p-2" />
        <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} required className="w-full border rounded p-2" />
        <input type="text" name="country" placeholder="Country" value={form.country} onChange={handleChange} className="w-full border rounded p-2" />
        <input type="text" name="image" placeholder="Image URL" value={form.image} onChange={handleChange} className="w-full border rounded p-2" />
        <textarea name="bio" placeholder="Bio" value={form.bio} onChange={handleChange} className="w-full border rounded p-2"></textarea>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Speaker</button>
      </form>
    </div>
  );
};

export default AddSpeaker;

