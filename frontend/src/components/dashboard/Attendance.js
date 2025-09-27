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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { punchIn, punchOut, fetchAttendance } from '../../store/slices/employeeSlice';
import { formatToIST, formatDateToIST } from '../../utils/timezone';

const Attendance = () => {
  const dispatch = useDispatch();
  const { attendance = { today: null, history: [] }, loading = false, error = null } = useSelector((state) => state.employee || {});
  const { user = { name: 'Employee' } } = useSelector((state) => state.auth || {});

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
    return formatToIST(date);
  };

  const formatDate = (date) => {
    return formatDateToIST(date);
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

  const getAttendanceForDate = (date) => {
    const dateStr = date.toDateString();
    const history = attendance?.history || [];
    const dayRecords = history.filter(record => 
      new Date(record.punchIn).toDateString() === dateStr
    );
    return dayRecords.length > 0;
  };

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    while (current <= lastDay || current.getDay() !== 0) {
      const isCurrentMonth = current.getMonth() === month;
      const isToday = current.toDateString() === new Date().toDateString();
      const isPresent = getAttendanceForDate(current);
      
      days.push({
        date: new Date(current),
        isCurrentMonth,
        isToday,
        isPresent
      });

      current.setDate(current.getDate() + 1);
      if (days.length >= 42) break; // 6 weeks max
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const todayStats = getTodayStats();
  const calendarDays = renderCalendar();

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
            <div className="flex items-center gap-2 text-orange-600"><Calendar className="w-4 h-4" /> {todayStats.records} Sessions</div>
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
      <div className="flex-1 ml-0  min-h-screen flex flex-col">
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
                  <Calendar className="w-5 h-5 text-white" />
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

          {/* Attendance Calendar */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30">
            <div className="flex items-center justify-between px-10 py-8 border-b border-white/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Attendance Calendar</h2>
                  <p className="text-sm text-gray-600">Monthly attendance overview</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">Absent</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-10">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      h-12 w-12 mx-auto flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200
                      ${!day.isCurrentMonth 
                        ? 'text-gray-300' 
                        : day.isToday
                        ? 'bg-blue-500 text-white shadow-lg'
                        : day.isPresent
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-red-500 text-white hover:bg-red-600'
                      }
                      ${day.isCurrentMonth && !day.isToday ? 'cursor-pointer' : ''}
                    `}
                  >
                    {day.date.getDate()}
                  </div>
                ))}
              </div>

              {/* Calendar Legend */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-wrap gap-4 justify-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-gray-600">Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-600">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-600">Absent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;