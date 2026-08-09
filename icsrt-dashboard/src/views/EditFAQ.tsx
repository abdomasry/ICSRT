'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';

const EditFAQ = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ question: '', answer: '' });
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get(`/api/faq/${id}`);
        setForm({ question: data.question || '', answer: data.answer || '' });
      } catch (err) {
        console.error('Fetch error:', err);
        toast.error('Failed to load question');
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
      await api.put(`/api/faq/${id}`, form);
      toast.success('Question updated successfully!');
      navigate('/faq');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update question.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Edit Question</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="question" placeholder="Question" value={form.question} onChange={handleChange} required className="w-full border rounded p-2" />
        <textarea name="answer" placeholder="Answer" value={form.answer} onChange={handleChange} required className="w-full border rounded p-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Changes</button>
      </form>
    </div>
  );
};

export default EditFAQ;