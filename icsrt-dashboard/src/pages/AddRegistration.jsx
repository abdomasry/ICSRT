import React, { useState } from 'react';

const AddRegistration = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    institution: '',
    country: '',
    conference: '',
    paymentStatus: 'pending'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, registeredAt: new Date().toISOString() };

    try {
      const res = await fetch('http://localhost:3000/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Registration added successfully!');
        setForm({
          fullName: '', email: '', phone: '', institution: '',
          country: '', conference: '', paymentStatus: 'pending'
        });
      } else {
        alert('Failed to add registration.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while submitting.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {['fullName', 'email', 'phone', 'institution', 'country', 'conference'].map(field => (
          <div key={field}>
            <label className="block text-sm capitalize mb-1">{field.replace(/([A-Z])/g, ' $1')}</label>
            <input
              type="text"
              name={field}
              value={form[field]}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm mb-1">Payment Status</label>
          <select
            name="paymentStatus"
            value={form.paymentStatus}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddRegistration;
