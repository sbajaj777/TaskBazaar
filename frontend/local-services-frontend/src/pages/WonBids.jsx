import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';

const WonBids = () => {
  const { user } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myBids, setMyBids] = useState({});

  useEffect(() => {
    fetchAssignedTasks();
    // eslint-disable-next-line
  }, []);

  const fetchAssignedTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks', { params: { assignedProvider: 'me' } });
      console.log('API /tasks?assignedProvider=me response:', res.data);
      console.log('Current user ID:', user?._id);
      const filtered = res.data.filter(task =>
        task.assignedProviderId === user?._id ||
        (task.assignedProviderId && task.assignedProviderId._id === user?._id)
      );
      setAssignedTasks(filtered);
      // Fetch bids for each assigned task
      const bidsObj = {};
      for (const task of filtered) {
        try {
          const bidRes = await api.get(`/tasks/${task._id}/bids`);
          const myBid = bidRes.data.find(bid => bid.providerId?._id === user?._id || bid.providerId === user?._id);
          if (myBid) bidsObj[task._id] = myBid.amount;
        } catch {}
      }
      setMyBids(bidsObj);
    } catch (error) {
      setAssignedTasks([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your winning bids...</p>
        </div>
      </div>
    );
  };

  const totalBidValue = Object.values(myBids).reduce((sum, bid) => sum + (bid || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold">🎉 Congratulations!</h1>
              <p className="text-blue-100 text-lg mt-1">Your Winning Bids & Assigned Tasks</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative">
        {/* Success Alert */}
        <div className="mb-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-start gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Great News!</h3>
              <p className="text-green-50">
                Customers have been automatically notified about your winning bids. They will contact you directly through phone or email to discuss project details and schedule the work.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Won Bids</p>
                <p className="text-2xl font-bold text-gray-800">{assignedTasks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <span className="text-green-600 font-bold text-lg">₹</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Value</p>
                <p className="text-2xl font-bold text-gray-800">₹{totalBidValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <div>
                <CardTitle className="text-2xl text-gray-800">Your Winning Bids</CardTitle>
                <CardDescription className="text-gray-600">
                  Tasks successfully assigned to you after winning the competitive bidding process
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {assignedTasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Winning Bids Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Don't worry! Keep bidding on tasks that match your expertise. Your winning streak is just around the corner.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
                  <p className="text-blue-800 text-sm">
                    💡 <strong>Pro Tip:</strong> Competitive pricing and quick responses increase your chances of winning bids!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {assignedTasks.map((task, index) => (
                  <div 
                    key={task._id} 
                    className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                  >
                    {/* Task Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                            #{index + 1} WON
                          </span>
                          {myBids[task._id] !== undefined && (
                            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                              ₹{myBids[task._id].toLocaleString()}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {task.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    {/* Task Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3 text-gray-600">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"/>
                        </svg>
                        <span className="font-medium">Category:</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          {task.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                        </svg>
                        <span className="font-medium">Location:</span>
                        <span>{task.address}</span>
                      </div>
                    </div>

                    {/* Assignment Date */}
                    <div className="flex items-center gap-3 text-gray-500 text-sm bg-gray-50 rounded-lg p-3">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                      </svg>
                      <span>Assigned on: {new Date(task.updatedAt).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 mb-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"/>
            </svg>
            Next Steps
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              <div>
                <strong>Customer Contact:</strong> Wait for customers to reach out via phone/email
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              <div>
                <strong>Schedule Work:</strong> Discuss timing and specific requirements
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              <div>
                <strong>Complete Task:</strong> Deliver quality service as promised
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
              <div>
                <strong>Get Paid:</strong> Receive payment upon successful completion
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WonBids;