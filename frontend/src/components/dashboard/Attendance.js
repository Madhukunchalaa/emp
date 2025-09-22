import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Clock, 
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Square,
  TrendingUp,
  Calendar as CalendarIcon
} from 'lucide-react';
import { punchIn, punchOut, fetchAttendance } from '../../store/slices/employeeSlice';

const Attendance = () => {
  const dispatch = useDispatch();
  const { attendance = { today: null, history: [] }, loading = false, error = null } = useSelector((state) => state.employee || {});
  const { user = { name: 'Employee' } } = useSelector((state) => state.auth || {});

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    dispatch(fetchAttendance());
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [dispatch]);

  useEffect(() => {
    // Check if currently punched in
    if (attendance?.today && !attendance.today.punchOut) {
      setIsPunchedIn(true);
      setCurrentSession(attendance.today);
    } else {
      setIsPunchedIn(false);
      setCurrentSession(null);
    }
  }, [attendance]);

  const handlePunchIn = async () => {
    try {
      await dispatch(punchIn());
      setIsPunchedIn(true);
    } catch (error) {
      console.error('Failed to punch in:', error);
    }
  };

  const handlePunchOut = async () => {
    try {
      await dispatch(punchOut());
      setIsPunchedIn(false);
      setCurrentSession(null);
    } catch (error) {
      console.error('Failed to punch out:', error);
    }
  };

  const formatTime = (date) => {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Time';
      }
      return dateObj.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Time formatting error:', error);
      return 'Invalid Time';
    }
  };

  const formatDate = (date) => {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      return dateObj.toLocaleDateString('en-US', { 
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  const calculateDuration = (punchIn, punchOut) => {
    try {
      const start = new Date(punchIn);
      const end = punchOut ? new Date(punchOut) : new Date();
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return '0h 0m';
      }
      const diff = end - start;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error('Duration calculation error:', error);
      return '0h 0m';
    }
  };

  const getCurrentSessionDuration = () => {
    if (!currentSession || !currentSession.punchIn) return '0h 0m';
    return calculateDuration(currentSession.punchIn, null);
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const history = attendance?.history || [];
    const todayRecords = history.filter(record => 
      new Date(record.punchIn).toDateString() === today
    );
    const totalHours = todayRecords.reduce((total, record) => {
      if (record.punchOut) {
        const duration = new Date(record.punchOut) - new Date(record.punchIn);
        return total + (duration / (1000 * 60 * 60));
      }
      return total;
    }, 0);
    return {
      records: todayRecords.length,
      totalHours: Math.round(totalHours * 100) / 100,
      isPresent: todayRecords.length > 0 || (attendance?.today && !attendance.today.punchOut)
    };
  };

  const todayStats = getTodayStats();

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white/80 backdrop-blur-lg shadow-xl border-r border-white/30 p-6 fixed left-0 top-0 z-20">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-8 bg-gradient-to-b from-orange-400 to-pink-400 rounded-full" />
            <span className="text-xl font-extrabold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">Employee</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Attendance</h1>
          <div className="text-xs text-gray-500">Your attendance overview</div>
        </div>
        <div className="mb-8">
          <div className="text-gray-700 font-semibold mb-2">Stats</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-600"><CalendarIcon className="w-4 h-4" /> {todayStats.records} Sessions</div>
            <div className="flex items-center gap-2 text-green-600"><Clock className="w-4 h-4" /> {todayStats.totalHours}h</div>
            <div className={`flex items-center gap-2 ${todayStats.isPresent ? 'text-green-600' : 'text-red-600'}`}>
              {todayStats.isPresent ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {todayStats.isPresent ? 'Present' : 'Absent'}
            </div>
          </div>
        </div>
        <div className="mt-auto">
          <div className="text-xs text-gray-400">Logged in as</div>
          <div className="font-bold text-gray-700">{user.name}</div>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 min-h-screen flex flex-col">
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        <div className="px-6 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent mb-2">
              Attendance
            </h1>
            <p className="text-gray-600">Track your work hours and attendance</p>
          </div>
          {/* Current Time and Punch Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Current Time */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-l-8 border-orange-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <div className="mb-4">
                  <Clock className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Current Time</h3>
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">
                  {formatTime(currentTime)}
                </div>
                <div className="text-lg text-gray-600">
                  {formatDate(currentTime)}
                </div>
              </div>
            </div>
            {/* Punch Card */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-l-8 border-green-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <div className="mb-4">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    isPunchedIn ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {isPunchedIn ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {isPunchedIn ? 'Currently Working' : 'Not Punched In'}
                  </h3>
                </div>
                {isPunchedIn && currentSession && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Session Duration</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {getCurrentSessionDuration()}
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  {!isPunchedIn ? (
                    <button
                      onClick={handlePunchIn}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <Play className="w-5 h-5" />
                      <span>Punch In</span>
                    </button>
                  ) : (
                    <button
                      onClick={handlePunchOut}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <Square className="w-5 h-5" />
                      <span>Punch Out</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Today's Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-8 mx-auto">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 border-orange-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <CalendarIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{todayStats.records}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Today's Sessions</h3>
              <p className="text-sm text-gray-500">Punch in/out records</p>
            </div>
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 border-green-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{todayStats.totalHours}h</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Total Hours</h3>
              <p className="text-sm text-gray-500">Worked today</p>
            </div>
            <div className={`bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 ${todayStats.isPresent ? 'border-green-400' : 'border-red-400'} w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl shadow-lg ${todayStats.isPresent ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`}> 
                  {todayStats.isPresent ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <XCircle className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {todayStats.isPresent ? 'Present' : 'Absent'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Status</h3>
              <p className="text-sm text-gray-500">Today's attendance</p>
            </div>
          </div>
          {/* Attendance History */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30">
            <div className="flex items-center justify-between px-10 py-8 border-b border-white/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Attendance History</h2>
                  <p className="text-sm text-gray-600">Your punch in/out records</p>
                </div>
              </div>
            </div>
            <div className="p-10">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading attendance records...</p>
                </div>
              ) : (attendance?.history || []).length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No attendance records found.</p>
                  <p className="text-sm text-gray-400 mt-2">Start by punching in for your first day.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(attendance?.history || []).map((record) => (
                    <div 
                      key={record._id} 
                      className="relative bg-white/90 backdrop-blur rounded-2xl shadow-xl border-l-8 border-orange-400 p-6 hover:shadow-2xl hover:bg-white transition-all duration-300 cursor-pointer group animate-fade-in"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{formatDate(record.punchIn)}</h3>
                          <p className="text-sm text-gray-500">Session #{record._id.slice(-6)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {record.punchOut ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-medium">
                              Completed
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Punch In:</span>
                          <p className="text-gray-700 font-medium">{formatTime(new Date(record.punchIn))}</p>
                        </div>
                        {record.punchOut && (
                          <div>
                            <span className="text-gray-500">Punch Out:</span>
                            <p className="text-gray-700 font-medium">{formatTime(new Date(record.punchOut))}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <p className="text-gray-700 font-medium">
                            {calculateDuration(record.punchIn, record.punchOut)}
                          </p>
                        </div>
                      </div>
                      {/* Add a subtle animated bar at the bottom on hover */}
                      <div className="absolute left-0 bottom-0 h-1 w-full bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-b-2xl" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance; 