import React, { useState, useEffect } from 'react';
import {
  Calendar,
  XCircle,
  Send,
  User,
  FileText,
  CheckCircle
} from 'lucide-react';
import { applyForLeave, getMyLeaveHistory } from '../../services/api';

const LeaveManagement = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [leaveForm, setLeaveForm] = useState({
    type: 'Sick Leave',
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [leaveHistory, setLeaveHistory] = useState([]);

<<<<<<< HEAD
=======
  // Placeholder user info (replace with real user if available)
  const user = { name: 'Employee' };

>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
  const approvedLeavesCount = 4;
  const pendingLeavesCount = 3;
  const rejectedLeavesCount = 2;

  const rejectedLeaves = [
    { id: 1, name: 'Alice Brown', dates: '10-12 Jun', reason: 'Project deadline conflict', rejectedOn: '5 Jun' },
    { id: 2, name: 'Tom Wilson', dates: '8-9 Jun', reason: 'Insufficient notice period', rejectedOn: '3 Jun' }
  ];

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const fetchLeaveHistory = async () => {
    try {
      const data = await getMyLeaveHistory();
      setLeaveHistory(data);
      // You can use this data to update summary cards, calendar, etc.
      console.log('Leave history:', data);
    } catch (err) {
      console.error('Error fetching leave history:', err);
    }
  };

  const generateCalendar = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const handleDateClick = (date) => {
    const dateStr = date.toLocaleDateString('en-CA');
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const handleSubmitLeave = async () => {
    if (leaveForm.type && leaveForm.fromDate && leaveForm.toDate && leaveForm.reason) {
      try {
        await applyForLeave(leaveForm);
        alert('Leave request submitted to manager!');
        setLeaveForm({ type: 'Sick Leave', fromDate: '', toDate: '', reason: '' });
        setSelectedDates([]);
        fetchLeaveHistory(); // Refresh history after submitting
      } catch (err) {
        alert(err.response?.data?.message || 'Error submitting leave request');
      }
    }
  };

  const today = new Date();
  const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const calendarDays = generateCalendar();

  return (
<<<<<<< HEAD
    <div className="min-h-screen from-blue-50 via-indigo-50 to-purple-50 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className=" mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Leave Management</h1>
          <p className="text-gray-600">Overview and leave application</p>
        </div>

        {/* Leave Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300 flex flex-col justify-center items-center space-y-2">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-bold">{approvedLeavesCount}</p>
            <p className="text-sm">Approved Leaves</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-bold">{pendingLeavesCount}</p>
            <p className="text-sm">Pending Requests</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-md">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-bold">{rejectedLeavesCount}</p>
            <p className="text-sm">Rejected Leaves</p>
          </div>
        </div>

        {/* Leave Application Form and Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Leave Application Form */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Apply for Leave</h3>
                <p className="text-sm text-gray-600">Submit your leave request</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type of Leave</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  value={leaveForm.type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                >
                  <option>Sick Leave</option>
                  <option>Function</option>
                  <option>Marriage</option>
                  <option>Home</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    value={leaveForm.fromDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    value={leaveForm.toDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 h-20 resize-none"
                  placeholder="Reason for leave..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                />
              </div>

              <button
                onClick={handleSubmitLeave}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Submit to Manager</span>
                </div>
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">Leave Calendar</h3>
                <p className="text-sm text-gray-600">{monthName}</p>
              </div>
              <div className="flex space-x-2">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="rounded px-2 py-1 border">
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'short' })}</option>
                  ))}
                </select>
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="rounded px-2 py-1 border"
                  >
=======
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white/80 backdrop-blur-lg shadow-xl border-r border-white/30 p-6 fixed left-0 top-0 z-20">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-8 bg-gradient-to-b from-orange-400 to-pink-400 rounded-full" />
            <span className="text-xl font-extrabold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">Employee</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Leave</h1>
          <div className="text-xs text-gray-500">Your leave overview</div>
        </div>
        <div className="mb-8">
          <div className="text-gray-700 font-semibold mb-2">Stats</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> {approvedLeavesCount} Approved</div>
            <div className="flex items-center gap-2 text-blue-600"><User className="w-4 h-4" /> {pendingLeavesCount} Pending</div>
            <div className="flex items-center gap-2 text-red-600"><XCircle className="w-4 h-4" /> {rejectedLeavesCount} Rejected</div>
          </div>
        </div>
        <div className="mt-auto">
          <div className="text-xs text-gray-400">Logged in as</div>
          <div className="font-bold text-gray-700">{user.name}</div>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className=" mb-8">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent mb-2">Leave Management</h1>
            <p className="text-gray-600">Overview and leave application</p>
          </div>
          {/* Leave Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 border-green-400 w-full flex flex-col justify-center items-center space-y-2 animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-xl font-bold">{approvedLeavesCount}</p>
              <p className="text-sm">Approved Leaves</p>
            </div>
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 border-blue-400 w-full flex flex-col items-center justify-center text-center space-y-2 animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <p className="text-xl font-bold">{pendingLeavesCount}</p>
              <p className="text-sm">Pending Requests</p>
            </div>
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 border-red-400 w-full flex flex-col items-center justify-center text-center space-y-2 animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-md">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-xl font-bold">{rejectedLeavesCount}</p>
              <p className="text-sm">Rejected Leaves</p>
            </div>
          </div>
          {/* Leave Application Form and Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leave Application Form */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border-l-8 border-purple-400 p-8 animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Apply for Leave</h3>
                  <p className="text-sm text-gray-600">Submit your leave request</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type of Leave</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    value={leaveForm.type}
                    onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                  >
                    <option>Sick Leave</option>
                    <option>Function</option>
                    <option>Marriage</option>
                    <option>Home</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      value={leaveForm.fromDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      value={leaveForm.toDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 h-20 resize-none"
                    placeholder="Reason for leave..."
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  />
                </div>
                <button
                  onClick={handleSubmitLeave}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Submit to Manager</span>
                  </div>
                </button>
              </div>
            </div>
            {/* Calendar */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border-l-8 border-orange-400 p-8 animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">Leave Calendar</h3>
                  <p className="text-sm text-gray-600">{monthName}</p>
                </div>
                <div className="flex space-x-2">
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="rounded px-2 py-1 border">
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'short' })}</option>
                    ))}
                  </select>
                  <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="rounded px-2 py-1 border"
                    >
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
                    {Array.from({ length: 51 }, (_, i) => {
                      const year = 2000 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
<<<<<<< HEAD
                </select>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const isCurrentMonth = date.getMonth() === selectedMonth;
                const isToday = date.toDateString() === today.toDateString();
                const dateStr = date.toLocaleDateString('en-CA');
                const isSelected = selectedDates.includes(dateStr);

                return (
                  <button
                    key={index}
                    onClick={() => isCurrentMonth && handleDateClick(date)}
                    className={`w-8 h-8 text-sm rounded-full transition-all duration-200
                      ${!isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 cursor-pointer'}
                      ${isToday ? 'bg-blue-500 text-white font-semibold' : ''}
                      ${isSelected ? 'bg-orange-500 text-white font-semibold' : ''}`}
                    disabled={!isCurrentMonth}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {selectedDates.length > 0 && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-800">
                  Selected Dates: {selectedDates.length} day{selectedDates.length > 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedDates.sort().map((date) => (
                    <span key={date} className="inline-block bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded">
                      {new Date(date).getDate()}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Leave History Table */}
        <div className="bg-white/80 rounded-2xl shadow-sm border border-white/20 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">My Leave History</h3>
          {leaveHistory.length === 0 ? (
            <p className="text-gray-500">No leave requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted On</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {leaveHistory.map((leave) => (
                    <tr key={leave._id}>
                      <td className="px-4 py-2 whitespace-nowrap">{leave.type}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{leave.fromDate ? new Date(leave.fromDate).toLocaleDateString() : ''}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{leave.toDate ? new Date(leave.toDate).toLocaleDateString() : ''}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{leave.reason}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${leave.status === 'approved' ? 'bg-green-100 text-green-700' : leave.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{leave.status}</span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{leave.createdAt ? new Date(leave.createdAt).toLocaleDateString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
=======
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  const isCurrentMonth = date.getMonth() === selectedMonth;
                  const isToday = date.toDateString() === today.toDateString();
                  const dateStr = date.toLocaleDateString('en-CA');
                  const isSelected = selectedDates.includes(dateStr);
                  return (
                    <button
                      key={index}
                      onClick={() => isCurrentMonth && handleDateClick(date)}
                      className={`w-8 h-8 text-sm rounded-full transition-all duration-200
                        ${!isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 cursor-pointer'}
                        ${isToday ? 'bg-blue-500 text-white font-semibold' : ''}
                        ${isSelected ? 'bg-orange-500 text-white font-semibold' : ''}`}
                      disabled={!isCurrentMonth}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
              {selectedDates.length > 0 && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm font-medium text-orange-800">
                    Selected Dates: {selectedDates.length} day{selectedDates.length > 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedDates.sort().map((date) => (
                      <span key={date} className="inline-block bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded">
                        {new Date(date).getDate()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Leave History Table */}
          <div className="bg-white/80 rounded-2xl shadow-sm border border-white/20 p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">My Leave History</h3>
            {leaveHistory.length === 0 ? (
              <p className="text-gray-500">No leave requests found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted On</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {leaveHistory.map((leave) => (
                      <tr key={leave._id}>
                        <td className="px-4 py-2 whitespace-nowrap">{leave.type}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{leave.fromDate ? new Date(leave.fromDate).toLocaleDateString() : ''}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{leave.toDate ? new Date(leave.toDate).toLocaleDateString() : ''}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{leave.reason}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${leave.status === 'approved' ? 'bg-green-100 text-green-700' : leave.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{leave.status}</span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">{leave.createdAt ? new Date(leave.createdAt).toLocaleDateString() : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
      </div>
    </div>
  );
};

export default LeaveManagement;
