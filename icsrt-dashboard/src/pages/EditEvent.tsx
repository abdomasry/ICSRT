import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ title: '', date: '', location: '', description: '' });

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get(`/api/events/${id}`);
        setForm({
          title: data.title || '',
          date: data.date ? data.date.substring(0,10) : '',
          location: data.location || '',
          description: data.description || ''
        });
      } catch (err) {
        console.error('Fetch error:', err);
        toast.error('Failed to load event');
      }
    })();
  }, [id, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/events/${id}`, form);
      toast.success('Event updated successfully!');
      navigate('/events');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update event.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Edit Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} required className="w-full border rounded p-2" />
        <input type="date" name="date" placeholder="Date" value={form.date} onChange={handleChange} required className="w-full border rounded p-2" />
        <input type="text" name="location" placeholder="Location" value={form.location} onChange={handleChange} required className="w-full border rounded p-2" />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="w-full border rounded p-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Changes</button>
      </form>
    </div>
  );
};

export default EditEvent;