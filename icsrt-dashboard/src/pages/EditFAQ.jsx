import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditFAQ = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ question: '', answer: '' });

  useEffect(() => {
    fetch(`http://localhost:3000/api/faq/${id}`)
      .then(res => res.json())
      .then(setForm)
      .catch(err => console.error('Fetch error:', err));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/api/faq/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        alert('Question updated successfully!');
        navigate('/faq');
      } else {
        alert('Failed to update question.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating.');
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