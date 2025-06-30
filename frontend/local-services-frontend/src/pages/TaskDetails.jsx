import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const TaskDetails = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      const res = await axios.get(`/api/tasks/${id}`);
      setTask(res.data);
      const bidsRes = await axios.get(`/api/tasks/${id}/bids`);
      setBids(bidsRes.data);
      setLoading(false);
    };
    fetchTask();
  }, [id]);

  const getTimeLeft = () => {
    if (!task) return '';
    const ms = new Date(task.timerEnd) - new Date();
    if (ms <= 0) return 'Bidding ended';
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}m ${sec}s left`;
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {loading ? <div>Loading...</div> : task && (
        <div className="bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-2">{task.title}</h1>
          <div className="mb-2 text-gray-600">{task.description}</div>
          <div className="mb-2 text-sm text-gray-500">{task.category} | {task.address}</div>
          <div className="mb-2 text-xs text-gray-400">Bidding ends: {new Date(task.timerEnd).toLocaleString()}</div>
          <div className="mb-2 text-xs text-gray-400">Status: {task.status}</div>
          <div className="mb-4 text-xs text-blue-600">{getTimeLeft()}</div>
          {task.assignedProviderId && (
            <div className="mb-2 text-green-600">Assigned to: {task.assignedProviderId.name || task.assignedProviderId.email}</div>
          )}
          <h2 className="text-lg font-bold mt-4 mb-2">Bids</h2>
          <div className="space-y-2">
            {bids.length === 0 && <div>No bids yet.</div>}
            {bids.map(bid => (
              <div key={bid._id} className="flex justify-between items-center border-b pb-1">
                <div>
                  <span className="font-semibold">{bid.providerId?.name || bid.providerId?.email || 'Provider'}</span>
                  <span className="ml-2 text-gray-500">Bid: ₹{bid.amount}</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(bid.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetails; 