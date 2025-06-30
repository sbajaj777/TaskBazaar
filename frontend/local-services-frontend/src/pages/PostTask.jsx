import React, { useState } from 'react';
import api from '../lib/api';

const PostTask = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    category: '',
    timer: 60,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const timerEnd = new Date(Date.now() + form.timer * 60000).toISOString();
      await api.post('/tasks', {
        ...form,
        timerEnd,
      });
      setSuccess(true);
      setForm({ title: '', description: '', address: '', category: '', timer: 60 });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post task');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Post a Task for Bidding</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Task Title" className="w-full border rounded px-3 py-2" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Task Description" className="w-full border rounded px-3 py-2" required />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="w-full border rounded px-3 py-2" required />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category (e.g. Plumber)" className="w-full border rounded px-3 py-2" required />
        <input name="timer" type="number" min="5" max="1440" value={form.timer} onChange={handleChange} placeholder="Bidding Time (minutes)" className="w-full border rounded px-3 py-2" required />
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded" disabled={loading}>{loading ? 'Posting...' : 'Post Task'}</button>
        {success && <div className="text-green-600 mt-2">Task posted successfully!</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default PostTask; 