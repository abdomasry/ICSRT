import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddTestimonial = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', role: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        alert('Testimonial added successfully!');
        navigate('/testimonials');
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
      <h2 className="text-xl font-bold mb-4">Add Testimonial</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="w-full border rounded p-2" />
        <input type="text" name="role" placeholder="Role" value={form.role} onChange={handleChange} required className="w-full border rounded p-2" />
        <textarea name="message" placeholder="Message" value={form.message} onChange={handleChange} required className="w-full border rounded p-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Testimonial</button>
      </form>
    </div>
  );
};

export default AddTestimonial;