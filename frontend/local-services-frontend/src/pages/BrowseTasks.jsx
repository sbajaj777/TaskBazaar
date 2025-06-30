import React, { useEffect, useState } from 'react';
import api, { providerAPI } from '../lib/api';

function CountdownTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const now = new Date();
    const end = new Date(endTime);
    let diff = Math.max(0, end - now);
    const hours = Math.floor(diff / 3600000);
    diff %= 3600000;
    const minutes = Math.floor(diff / 60000);
    diff %= 60000;
    const seconds = Math.floor(diff / 1000);
    return { hours, minutes, seconds };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <span className="text-xs text-blue-700 font-mono ml-2">
      {String(timeLeft.hours).padStart(2, '0')}:
      {String(timeLeft.minutes).padStart(2, '0')}:
      {String(timeLeft.seconds).padStart(2, '0')} left
    </span>
  );
}

const BrowseTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ category: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [bidTask, setBidTask] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');
  const [myBids, setMyBids] = useState({});
  const [bidCoins, setBidCoins] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.address) params.address = filters.address;
    const res = await api.get('/tasks', { params });
    setTasks(res.data);
    setLoading(false);
  };

  const fetchMyBids = async () => {
    try {
      // Fetch all tasks, then for each, fetch this provider's bid
      const res = await api.get('/tasks');
      const tasks = res.data;
      const bids = {};
      for (const task of tasks) {
        try {
          const bidRes = await api.get(`/tasks/${task._id}/bids`);
          const myBid = bidRes.data.find(bid => bid.providerId?._id === JSON.parse(localStorage.getItem('user'))?._id);
          if (myBid) bids[task._id] = myBid;
        } catch {}
      }
      setMyBids(bids);
    } catch {}
  };

  const fetchBidCoins = async () => {
    try {
      const res = await providerAPI.getBidCoins();
      setBidCoins(res.data.bidCoins);
    } catch {
      setBidCoins(null);
    }
  };

  useEffect(() => { fetchTasks(); fetchMyBids(); fetchBidCoins(); }, [filters]);

  const handleBid = async (taskId) => {
    setBidError('');
    setBidSuccess('');
    try {
      await api.post(`/tasks/${taskId}/bids`, { amount: bidAmount });
      setBidSuccess('Bid placed successfully!');
      setBidAmount('');
      setBidTask(null);
      fetchTasks();
      fetchMyBids();
      setBidCoins(bidCoins - 1);
    } catch (err) {
      setBidError(err.response?.data?.error || 'Failed to place bid');
      fetchBidCoins();
    }
  };

  const now = new Date();
  const activeTasks = tasks.filter(task => new Date(task.timerEnd) > now);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Browse Open Tasks</h1>
      <div className="mb-2 flex items-center gap-4">
        <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-semibold">
          BidCoins: {bidCoins === null ? '...' : bidCoins}
        </span>
        <a href="/provider/subscription" className="text-blue-600 underline text-sm">Buy BidCoins</a>
      </div>
      <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> You can bid only once per task. You will not be allowed to bid again with a different amount.<br />
          The provider with the <strong>lowest bid</strong> at the end of the timer will get the deal. 
        </p>
      </div>
      <div className="flex gap-2 mb-4">
        <input placeholder="Category" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} className="border rounded px-3 py-2" />
        <input placeholder="Address" value={filters.address} onChange={e => setFilters(f => ({ ...f, address: e.target.value }))} className="border rounded px-3 py-2" />
        <button onClick={fetchTasks} className="bg-primary text-white px-4 py-2 rounded">Filter</button>
      </div>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-4">
          {activeTasks.map(task => (
            <div key={task._id} className="bg-white p-4 rounded shadow flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-bold text-lg">{task.title}</div>
                <div className="text-gray-600">{task.description}</div>
                <div className="text-sm text-gray-500">{task.category} | {task.address}</div>
                <div className="text-xs text-gray-400">
                  Bidding ends: {new Date(task.timerEnd).toLocaleString()}
                  <CountdownTimer endTime={task.timerEnd} />
                </div>
                {myBids[task._id] && (
                  <div className="text-xs text-blue-600 mt-1">Your bid: ₹{myBids[task._id].amount}</div>
                )}
              </div>
              {!myBids[task._id] && (
                <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2 md:mt-0" onClick={() => setBidTask(task)}>Bid</button>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Bid Modal */}
      {bidTask && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h2 className="font-bold mb-2">Bid for: {bidTask.title}</h2>
            <div className="mb-2 text-yellow-700 font-semibold">Your BidCoins: {bidCoins === null ? '...' : bidCoins}</div>
            {bidCoins === 0 ? (
              <div className="mb-2 text-red-600 font-semibold">You have 0 BidCoins. <a href='/provider/subscription' className='text-blue-600 underline'>Buy more</a> to place bids.</div>
            ) : (
              <input type="number" min="1" value={bidAmount} onChange={e => setBidAmount(e.target.value)} className="border rounded px-3 py-2 w-full mb-2" placeholder="Your bid amount" />
            )}
            {bidError && <div className="text-red-600 mb-2">{bidError}</div>}
            {bidSuccess && <div className="text-green-600 mb-2">{bidSuccess}</div>}
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => handleBid(bidTask._id)} disabled={bidCoins === 0}>Submit Bid</button>
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setBidTask(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseTasks; 