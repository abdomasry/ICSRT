import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';

const EditMission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ title: '', content: '' });

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get(`/api/mission/${id}`);
        setForm({ title: data.title || '', content: data.content || '' });
      } catch (err) {
        console.error('Fetch error:', err);
        toast.error('Failed to load mission');
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
      await api.put(`/api/mission/${id}`, form);
      toast.success('Mission updated successfully!');
      navigate('/mission');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update mission.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Edit Mission</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} required className="w-full border rounded p-2" />
        <textarea name="content" placeholder="Content" value={form.content} onChange={handleChange} required className="w-full border rounded p-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Changes</button>
      </form>
    </div>
  );
};

export default EditMission;