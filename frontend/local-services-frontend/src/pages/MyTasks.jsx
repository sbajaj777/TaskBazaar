import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchMyTasks();
    // eslint-disable-next-line
  }, []);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks', { params: { userId: 'me' } });
      // Sort tasks by createdAt descending (latest first)
      setTasks(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = async (task, checked) => {
    setUpdating(prev => ({ ...prev, [task._id]: true }));
    try {
      await api.put(`/tasks/${task._id}`, { status: checked ? 'completed' : 'open' });
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: checked ? 'completed' : 'open' } : t));
    } catch (error) {
      // Optionally show error
    } finally {
      setUpdating(prev => ({ ...prev, [task._id]: false }));
    }
  };

  const doneTasks = tasks.filter(task => task.status === 'completed');
  const allTasks = tasks.filter(task => task.status !== 'completed');

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">My Tasks</h1>
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded text-blue-800">
        <strong>Note:</strong> You can contact your assigned provider.
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">All Tasks</h2>
        {allTasks.length === 0 ? <p className="text-gray-500">No tasks posted yet.</p> :
          allTasks.map(task => (
            <div key={task._id} className="bg-white p-4 rounded shadow flex items-center md:items-start md:flex-row md:justify-between mb-4" style={{paddingLeft: '0.5rem'}}>
              <div className="flex-shrink-0 flex flex-col justify-center items-center mr-4" style={{minWidth: '2.5rem'}}>
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 mt-2"
                  checked={task.status === 'completed'}
                  disabled={updating[task._id]}
                  onChange={e => handleCheckboxChange(task, e.target.checked)}
                />
              </div>
              <div className="flex-1">
                <CardHeader>
                  <CardTitle>{task.title}</CardTitle>
                  <CardDescription>Status: {task.status}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>{task.description}</div>
                  <div className="text-sm text-gray-500">Category: {task.category}</div>
                  <div className="text-sm text-gray-500">Address: {task.address}</div>
                  {task.assignedProviderId && (
                    <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
                      <Link
                        to={`/provider/profile/${task.assignedProviderId._id || task.assignedProviderId}`}
                        className="inline-block bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition mb-1 md:mb-0 md:mr-2"
                      >
                        View Assigned Provider
                      </Link>
                      {task.winningBidAmount && (
                        <div className="mt-1 text-green-700 font-semibold md:mt-0">
                          Won Bid Amount: ₹{task.winningBidAmount}
                        </div>
                      )}
                      {task.assignedProviderId.contactInfo && (
                        <a
                          href={`https://wa.me/${task.assignedProviderId.contactInfo.replace(/[^\d]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition md:ml-2"
                        >
                          WhatsApp Provider
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </div>
            </div>
          ))}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Done Tasks</h2>
        {doneTasks.length === 0 ? <p className="text-gray-500">No completed tasks.</p> :
          doneTasks.map(task => (
            <div key={task._id} className="bg-white p-4 rounded shadow flex items-center md:items-start md:flex-row md:justify-between mb-4" style={{paddingLeft: '0.5rem'}}>
              <div className="flex-shrink-0 flex flex-col justify-center items-center mr-4" style={{minWidth: '2.5rem'}}>
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 mt-2"
                  checked={true}
                  disabled={updating[task._id]}
                  onChange={e => handleCheckboxChange(task, e.target.checked)}
                />
              </div>
              <div className="flex-1">
                <CardHeader>
                  <CardTitle>{task.title}</CardTitle>
                  <CardDescription>Status: {task.status}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>{task.description}</div>
                  <div className="text-sm text-gray-500">Category: {task.category}</div>
                  <div className="text-sm text-gray-500">Address: {task.address}</div>
                  {task.assignedProviderId && (
                    <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
                      <Link
                        to={`/provider/profile/${task.assignedProviderId._id || task.assignedProviderId}`}
                        className="inline-block bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition mb-1 md:mb-0 md:mr-2"
                      >
                        View Assigned Provider
                      </Link>
                      {task.winningBidAmount && (
                        <div className="mt-1 text-green-700 font-semibold md:mt-0">
                          Won Bid Amount: ₹{task.winningBidAmount}
                        </div>
                      )}
                      {task.assignedProviderId.contactInfo && (
                        <a
                          href={`https://wa.me/${task.assignedProviderId.contactInfo.replace(/[^\d]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition md:ml-2"
                        >
                          WhatsApp Provider
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MyTasks; 