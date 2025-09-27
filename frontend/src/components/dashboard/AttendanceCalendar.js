import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, User, Clock, X, Users, CalendarDays, ArrowLeft, MessageSquare, Eye } from 'lucide-react';
import { managerService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { formatToIST, formatDateToIST, formatDateTimeToIST } from '../../utils/timezone';

const AttendanceCalendar = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeUpdates, setEmployeeUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [dailyUpdatesCount, setDailyUpdatesCount] = useState({});
  const [error, setError] = useState(null);

  // Helper function to extract data (similar to your existing implementation)
  const extractData = (res) => {
    if (res && res.data) {
      return Array.isArray(res.data) ? res.data : [res.data];
    }
    return Array.isArray(res) ? res : [];
  };

  // Fetch employee updates for a specific date
  const fetchEmployeeUpdates = async (date, employeeId) => {
    try {
      setUpdatesLoading(true);
      const formattedDate = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      // Use the correct API endpoint with proper date range
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const res = await managerService.getEmployeeUpdatesByDate(employeeId, startDate.toISOString(), endDate.toISOString());
      const updates = extractData(res);
      setEmployeeUpdates(updates);
    } catch (error) {
      console.error('Failed to fetch updates:', error);
      setEmployeeUpdates([]);
    } finally {
      setUpdatesLoading(false);
    }
  };

  const handleDateClick = (day, employeeBlock) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(clickedDate);
    setSelectedEmployee(employeeBlock);
    fetchEmployeeUpdates(clickedDate, employeeBlock.employee._id);
  };

  const handleViewUpdate = (update) => {
    // Handle view update functionality
    console.log('View update:', update);
  };

  // Fetch daily updates count for calendar display
  const fetchDailyUpdatesCount = async (employeeId) => {
    try {
      const startDate = new Date(currentMonth);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(currentMonth);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      
      const res = await managerService.getEmployeeUpdatesByDate(employeeId, startDate.toISOString(), endDate.toISOString());
      const updates = extractData(res);
      
      // Group updates by date
      const updatesByDate = {};
      updates.forEach(update => {
        const date = new Date(update.date).getDate();
        updatesByDate[date] = (updatesByDate[date] || 0) + 1;
      });
      
      setDailyUpdatesCount(updatesByDate);
    } catch (error) {
      console.error('Failed to fetch daily updates count:', error);
      setDailyUpdatesCount({});
    }
  };

  // Helper function to format time properly in IST with AM/PM
  const formatTime = (timeValue) => {
    return formatToIST(timeValue);
  };

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login...');
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Fetch attendance data from your API
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        console.log('Fetching attendance data...');
        
        // Check if token exists
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        console.log('Token value:', token ? token.substring(0, 20) + '...' : 'No token');
        
        // Check if user is logged in
        const user = localStorage.getItem('user');
        console.log('User data:', user ? JSON.parse(user) : 'No user data');
        
        // Check if user role is manager
        if (user) {
          const userData = JSON.parse(user);
          console.log('User role:', userData.role);
          if (userData.role !== 'manager') {
            console.warn('User is not a manager, redirecting...');
            navigate('/login');
            return;
          }
        }
        
        const res = await managerService.getAttendanceHistory();
        console.log('Attendance data response:', res);
        
        // Handle different response formats
        if (res && res.data) {
          setAttendanceData(res.data);
        } else if (Array.isArray(res)) {
          setAttendanceData(res);
        } else {
          console.warn('Unexpected response format:', res);
          setAttendanceData([]);
        }
      } catch (err) {
        console.error("Error fetching attendance:", err);
        
        // Check if it's an authentication error
        if (err.response?.status === 401) {
          console.log('Authentication failed, redirecting to login...');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        
        setError(err.message || 'Failed to fetch attendance data');
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [currentMonth]);

  // Fetch daily updates count when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      fetchDailyUpdatesCount(selectedEmployee.employee._id);
    }
  }, [selectedEmployee, currentMonth]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
      case 'p': 
        return 'bg-green-500 text-white';
      case 'absent':
      case 'a':
        return 'bg-red-500 text-white';
      case 'sunday':
        return 'bg-blue-500 text-white';
      default: 
        return 'bg-gray-200 text-gray-800';
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
    // Clear selected date when navigating months
    setSelectedDate(null);
    setEmployeeUpdates([]);
  };

  const formatMonth = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Process attendance data for calendar view
  const processAttendanceForCalendar = (employeeBlock) => {
    const processedData = {};
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    employeeBlock.records.forEach(record => {
      const recordDate = new Date(record.date);
      if (recordDate.getFullYear() === year && recordDate.getMonth() === month) {
        const day = recordDate.getDate();
        processedData[day] = {
          status: record.status,
          totalHours: record.totalHours || '0:00',
          punchIn: record.punchIn,
          punchOut: record.punchOut,
          date: record.date
        };
      }
    });
    
    return processedData;
  };

  const calculateMonthlyStats = (employeeBlock) => {
    const attendance = processAttendanceForCalendar(employeeBlock);
    const stats = { 
      present: 0, 
      absent: 0, 
      totalHours: 0,
      onTime: 0,
      late: 0,
      tooLate: 0
    };
    
    // Define time thresholds (in minutes from 9:30 AM)
    const ON_TIME_THRESHOLD = 0; // On time: 9:30 AM or earlier
    const LATE_THRESHOLD = 10; // Late: 9:31 AM to 9:40 AM (10 minutes after 9:30)
    const TOO_LATE_THRESHOLD = 30; // Too late: after 10:00 AM (30 minutes after 9:30)
    
    Object.values(attendance).forEach(day => {
      if (day.status?.toLowerCase() === 'present' || day.status?.toLowerCase() === 'p') {
        stats.present++;
        
        // Calculate timing analytics
        if (day.punchIn) {
          try {
            const punchInTime = new Date(day.punchIn);
            const punchInMinutes = punchInTime.getHours() * 60 + punchInTime.getMinutes();
            const expectedTimeMinutes = 9 * 60 + 30; // 9:30 AM in minutes
            const minutesLate = punchInMinutes - expectedTimeMinutes;
            
            if (minutesLate <= ON_TIME_THRESHOLD) {
              stats.onTime++;
            } else if (minutesLate <= LATE_THRESHOLD) {
              stats.late++;
            } else {
              stats.tooLate++;
            }
          } catch (error) {
            console.error('Error calculating timing for day:', day, error);
            // If we can't parse the time, count as late
            stats.late++;
          }
        }
        
        // Calculate total hours
        if (day.totalHours && day.totalHours !== '0:00' && day.totalHours !== 0) {
          let hours = 0, minutes = 0;
          
          // Handle different totalHours formats
          if (typeof day.totalHours === 'string' && day.totalHours.includes(':')) {
            const parts = day.totalHours.split(':');
            hours = parseInt(parts[0]) || 0;
            minutes = parseInt(parts[1]) || 0;
          } else if (typeof day.totalHours === 'number') {
            // If it's already a number (decimal hours)
            stats.totalHours += day.totalHours;
            return;
          } else if (typeof day.totalHours === 'string') {
            // If it's a string number without ':'
            hours = parseFloat(day.totalHours) || 0;
          }
          
          if (!isNaN(hours) && !isNaN(minutes)) {
            stats.totalHours += hours + (minutes / 60);
          }
        }
      } else if (day.status?.toLowerCase() === 'absent' || day.status?.toLowerCase() === 'a') {
        stats.absent++;
      }
    });
    
    return stats;
  };

  const renderCalendarDays = (employeeBlock) => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const attendance = processAttendanceForCalendar(employeeBlock);

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayOfWeek = date.getDay();
      
      let dayData = attendance[day] || { status: 'absent', totalHours: '0:00' };
      
      // Override status for Sundays
      if (dayOfWeek === 0) {
        dayData = { ...dayData, status: 'sunday' };
      }

      days.push(
        <div
          key={day}
          className={`p-2 rounded-lg text-center cursor-pointer hover:opacity-80 transition-all ${getStatusColor(dayData.status)} hover:ring-2 hover:ring-white hover:shadow-lg`}
          title={`${day}: ${dayData.status?.charAt(0).toUpperCase() + dayData.status?.slice(1)} - ${dayData.totalHours} hours${dayData.punchIn ? `\nPunch In: ${formatTime(dayData.punchIn)}` : ''}${dayData.punchOut ? `\nPunch Out: ${formatTime(dayData.punchOut)}` : ''}\nClick to view details`}
          onClick={() => handleDateClick(day, employeeBlock)}
        >
          <div className="text-sm font-semibold">{day}</div>
          <div className="text-xs mt-1">{dayData.totalHours}</div>
          {/* Show punch times directly in calendar */}
          {dayData.punchIn && (
            <div className="text-xs mt-1 opacity-90">
              <div className="flex items-center justify-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>IN: {formatTime(dayData.punchIn)}</span>
              </div>
            </div>
          )}
          {dayData.punchOut && (
            <div className="text-xs mt-1 opacity-90">
              <div className="flex items-center justify-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>OUT: {formatTime(dayData.punchOut)}</span>
              </div>
            </div>
          )}
          {/* Show work updates count */}
          {dailyUpdatesCount[day] && dailyUpdatesCount[day] > 0 && (
            <div className="text-xs mt-1">
              <div className="flex items-center justify-center space-x-1">
                <MessageSquare className="w-3 h-3" />
                <span className="bg-blue-500 text-white px-1 rounded-full text-xs">
                  {dailyUpdatesCount[day]} update{dailyUpdatesCount[day] > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const UserAvatar = ({ name, avatar, size = "md" }) => {
    const sizeClasses = size === "sm" ? "w-8 h-8 text-xs" : "w-12 h-12 text-sm";
    
    if (avatar) {
      return (
        <img 
          src={avatar} 
          alt={name}
          className={`${sizeClasses} rounded-full object-cover`}
        />
      );
    }
    
    return (
      <div className={`${sizeClasses} bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold`}>
        {name?.charAt(0) || 'U'}
      </div>
    );
  };

  if (selectedEmployee) {
    const stats = calculateMonthlyStats(selectedEmployee);
    const attendance = processAttendanceForCalendar(selectedEmployee);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="p-6">
          {/* Header */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setSelectedDate(null);
                  setEmployeeUpdates([]);
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Employee List</span>
              </button>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">{formatMonth(currentMonth)}</h2>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Employee Info */}
            <div className="flex items-center space-x-4 mb-6">
              <UserAvatar name={selectedEmployee.employee.name} avatar={selectedEmployee.employee.avatar} />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{selectedEmployee.employee.name}</h3>
                <p className="text-gray-600">{selectedEmployee.employee.email}</p>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white border border-gray-300 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-black">{stats.present}</div>
                <div className="text-sm text-gray-600">Days Present</div>
              </div>
              <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-black">{stats.absent}</div>
                <div className="text-sm text-gray-600">Days Absent</div>
              </div>
              <div className="bg-white border border-gray-300 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-black">{stats.onTime}</div>
                <div className="text-sm text-gray-600">On Time</div>
              </div>
              <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-black">{stats.late}</div>
                <div className="text-sm text-gray-600">Late</div>
              </div>
              <div className="bg-gray-200 border border-gray-400 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-black">{stats.tooLate}</div>
                <div className="text-sm text-gray-600">Too Late</div>
              </div>
            </div>
            
            {/* Total Hours */}
            <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 text-center mb-6">
              <div className="text-2xl font-bold text-black">{stats.totalHours.toFixed(1)}h</div>
              <div className="text-sm text-gray-600">Total Hours</div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center font-semibold text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {renderCalendarDays(selectedEmployee)}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Present</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Absent</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Sunday</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Punch Times</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Work Updates</span>
              </div>
              <div className="text-sm text-gray-600 italic">
                Click on any date to view detailed work updates
              </div>
            </div>
          </div>

          {/* Date Details Modal */}
          {selectedDate && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-black">
                    {formatDateTimeToIST(selectedDate, {
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    })} (IST)
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedDate(null);
                      setEmployeeUpdates([]);
                    }}
                    className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Employee Info */}
                <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-100 rounded-xl">
                  <UserAvatar name={selectedEmployee.employee.name} avatar={selectedEmployee.employee.avatar} />
                  <div>
                    <h4 className="text-xl font-bold text-black">{selectedEmployee.employee.name}</h4>
                    <p className="text-gray-600">{selectedEmployee.employee.email}</p>
                  </div>
                </div>

                {/* Attendance Details */}
                {(() => {
                  const attendance = processAttendanceForCalendar(selectedEmployee);
                  const dayData = attendance[selectedDate.getDate()] || { status: 'absent', totalHours: '0:00' };
                  
                  // Calculate timing status for this specific day
                  let timingStatus = 'Not Available';
                  let timingColor = 'bg-gray-100 text-black';
                  
                  if (dayData.punchIn) {
                    try {
                      const punchInTime = new Date(dayData.punchIn);
                      const punchInMinutes = punchInTime.getHours() * 60 + punchInTime.getMinutes();
                      const expectedTimeMinutes = 9 * 60 + 30; // 9:30 AM in minutes
                      const minutesLate = punchInMinutes - expectedTimeMinutes;
                      
                      if (minutesLate <= 0) {
                        timingStatus = 'On Time';
                        timingColor = 'bg-white text-black border border-gray-300';
                      } else if (minutesLate <= 10) {
                        timingStatus = 'Late';
                        timingColor = 'bg-gray-100 text-black';
                      } else {
                        timingStatus = 'Too Late';
                        timingColor = 'bg-gray-200 text-black';
                      }
                    } catch (error) {
                      timingStatus = 'Error';
                      timingColor = 'bg-red-100 text-red-800';
                    }
                  }
                  
                  // Debug: Log the dayData to see the actual format
                  console.log('Day data for debugging:', dayData);
                  
                  return (
                    <div className="mb-6">
                      <h5 className="text-lg font-semibold text-black mb-4">Attendance Details</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-800">Punch In</span>
                          </div>
                          <p className="text-green-700 text-lg font-medium">
                            {formatTime(dayData.punchIn)}
                          </p>
                          {dayData.punchIn && (
                            <p className="text-xs text-green-600 mt-1">
                              {formatDateToIST(dayData.punchIn)} (IST)
                            </p>
                          )}
                        </div>
                        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="w-5 h-5 text-red-600" />
                            <span className="font-semibold text-red-800">Punch Out</span>
                          </div>
                          <p className="text-red-700 text-lg font-medium">
                            {formatTime(dayData.punchOut)}
                          </p>
                          {dayData.punchOut && (
                            <p className="text-xs text-red-600 mt-1">
                              {formatDateToIST(dayData.punchOut)} (IST)
                            </p>
                          )}
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-blue-800">Total Hours</span>
                          </div>
                          <p className="text-blue-700 text-lg font-medium">{dayData.totalHours}</p>
                          {dayData.totalHours && dayData.totalHours !== '0:00' && (
                            <p className="text-xs text-blue-600 mt-1">
                              {typeof dayData.totalHours === 'number' ? 
                                `${Math.floor(dayData.totalHours)}h ${Math.round((dayData.totalHours % 1) * 60)}m` : 
                                'Work completed'
                              }
                            </p>
                          )}
                        </div>
                        <div className="bg-gray-100 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-black">Status</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            dayData.status === 'present' || dayData.status === 'p' ? 'bg-white text-black border border-gray-300' :
                            dayData.status === 'absent' || dayData.status === 'a' ? 'bg-gray-200 text-black' :
                            dayData.status === 'sunday' ? 'bg-gray-300 text-black' :
                            'bg-gray-100 text-black'
                          }`}>
                            {dayData.status?.charAt(0).toUpperCase() + dayData.status?.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Timing Status */}
                      <div className="mt-4">
                        <div className="bg-gray-100 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="w-5 h-5 text-black" />
                            <span className="font-semibold text-black">Timing Status</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${timingColor}`}>
                            {timingStatus}
                          </span>
                          <p className="text-xs text-gray-500 mt-2">
                            Based on 9:30 AM expected arrival time
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Work Updates Section */}
                <div>
                  <h5 className="text-lg font-semibold text-black mb-4">Work Updates</h5>
                  
                  {updatesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                      <p className="text-gray-600 mt-4">Loading work updates...</p>
                    </div>
                  ) : employeeUpdates.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No work updates found for this date.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {employeeUpdates.map((update) => (
                        <div key={update._id} className="bg-gray-100 rounded-xl p-4 hover:bg-gray-200 transition-all duration-300 border border-gray-300">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <UserAvatar
                                avatar={update.employee?.avatar}
                                name={update.employee?.name}
                                size="sm"
                              />
                              <div>
                                <h6 className="font-semibold text-black">{update.employee?.name}</h6>
                                <p className="text-xs text-gray-500">{formatToIST(update.date)} (IST)</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              update.status === 'approved' ? 'bg-white text-black border border-gray-300' :
                              update.status === 'rejected' ? 'bg-gray-200 text-black' :
                              'bg-gray-300 text-black'
                            }`}>
                              {update.status}
                            </span>
                          </div>
                          
                          {update.project_title && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-black">Project: </span>
                              <span className="text-sm text-gray-600">{update.project_title}</span>
                            </div>
                          )}
                          
                          {update.taskDescription && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-black">Task: </span>
                              <span className="text-sm text-gray-600">{update.taskDescription}</span>
                            </div>
                          )}
                          
                          {update.priority && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-black">Priority: </span>
                              <span className={`text-sm px-2 py-1 rounded-full text-xs font-medium ${
                                update.priority === 'High' ? 'bg-red-100 text-red-800' :
                                update.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                update.priority === 'Low' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {update.priority}
                              </span>
                            </div>
                          )}
                          
                          {(update.plannedTime || update.actualTime) && (
                            <div className="mb-2 grid grid-cols-2 gap-2">
                              {update.plannedTime && (
                                <div>
                                  <span className="text-sm font-medium text-black">Planned: </span>
                                  <span className="text-sm text-gray-600">{update.plannedTime}h</span>
                                </div>
                              )}
                              {update.actualTime && (
                                <div>
                                  <span className="text-sm font-medium text-black">Actual: </span>
                                  <span className="text-sm text-gray-600">{update.actualTime}h</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-600 mb-3">
                            {update.tasks?.map(task => task.description).join(', ') || update.update || update.description || 'No description available'}
                          </p>
                          
                          {update.notes && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-black">Notes: </span>
                              <span className="text-sm text-gray-600">{update.notes}</span>
                            </div>
                          )}
                          
                          {update.plansForNextDay && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-black">Next Day Plans: </span>
                              <span className="text-sm text-gray-600">{update.plansForNextDay}</span>
                            </div>
                          )}
                          
                          {update.imageUrl && (
                            <div className="mb-3">
                              <img 
                                src={update.imageUrl} 
                                alt="Update attachment"
                                className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                              />
                            </div>
                          )}
                          
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewUpdate(update)}
                              className="flex items-center space-x-1 bg-black text-white px-3 py-1.5 rounded-lg text-xs hover:bg-gray-800 transition-all duration-200"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Details</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Add error boundary and debugging
  console.log('AttendanceCalendar render - loading:', loading, 'attendanceData:', attendanceData);

  try {
    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Attendance Calendar
              </h1>
              <p className="text-gray-600 mt-2">Click on any employee to view their attendance calendar</p>
              {/* Debug info */}
              <p className="text-xs text-gray-400 mt-1">
                Debug: Loading: {loading ? 'Yes' : 'No'}, Data count: {attendanceData?.length || 0}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-800 min-w-[200px] text-center">
                {formatMonth(currentMonth)}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Employee Grid */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
          {error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Data</h3>
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  // Retry fetching
                  const fetchAttendanceData = async () => {
                    try {
                      const res = await managerService.getAttendanceHistory();
                      if (res && res.data) {
                        setAttendanceData(res.data);
                      } else if (Array.isArray(res)) {
                        setAttendanceData(res);
                      } else {
                        setAttendanceData([]);
                      }
                    } catch (err) {
                      setError(err.message || 'Failed to fetch attendance data');
                    } finally {
                      setLoading(false);
                    }
                  };
                  fetchAttendanceData();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading attendance data...</p>
            </div>
          ) : attendanceData.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No attendance data found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {attendanceData.map((employeeBlock) => {
                const stats = calculateMonthlyStats(employeeBlock);
                const attendanceRate = stats.present + stats.absent > 0 
                  ? ((stats.present / (stats.present + stats.absent)) * 100).toFixed(1)
                  : 0;

                return (
                  <div
                    key={employeeBlock.employee._id}
                    onClick={() => setSelectedEmployee(employeeBlock)}
                    className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 hover:shadow-lg hover:bg-white/80 transition-all duration-300 border border-white/30 cursor-pointer group"
                  >
                    {/* Employee Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <UserAvatar 
                        name={employeeBlock.employee.name} 
                        avatar={employeeBlock.employee.avatar}
                        size="sm"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                          {employeeBlock.employee.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {employeeBlock.employee.email}
                        </p>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-green-600">{stats.present}</div>
                        <div className="text-xs text-green-500">Present</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-red-600">{stats.absent}</div>
                        <div className="text-xs text-red-500">Absent</div>
                      </div>
                    </div>

                    {/* Timing Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-white border border-gray-300 rounded-lg p-1.5 text-center">
                        <div className="text-sm font-bold text-black">{stats.onTime}</div>
                        <div className="text-xs text-gray-600">On Time</div>
                      </div>
                      <div className="bg-gray-100 border border-gray-300 rounded-lg p-1.5 text-center">
                        <div className="text-sm font-bold text-black">{stats.late}</div>
                        <div className="text-xs text-gray-600">Late</div>
                      </div>
                      <div className="bg-gray-200 border border-gray-400 rounded-lg p-1.5 text-center">
                        <div className="text-sm font-bold text-black">{stats.tooLate}</div>
                        <div className="text-xs text-gray-600">Too Late</div>
                      </div>
                    </div>

                    {/* Attendance Rate */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Attendance Rate</span>
                        <span className="text-xs font-semibold text-gray-700">{attendanceRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${attendanceRate}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Total Hours */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Hours:</span>
                      <span className="font-semibold text-gray-800">{stats.totalHours.toFixed(1)}h</span>
                    </div>

                    {/* Click indicator */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 text-center group-hover:text-orange-500 transition-colors">
                        Click to view calendar
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Date Details Modal for Main Calendar */}
        {selectedDate && !selectedEmployee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-black">
                  {formatDateTimeToIST(selectedDate, {
                    weekday: 'long', 
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric'
                  })} (IST)
                </h3>
                <button
                  onClick={() => {
                    setSelectedDate(null);
                    setEmployeeUpdates([]);
                  }}
                  className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select an employee to view their attendance details for this date.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    );
  } catch (error) {
    console.error('AttendanceCalendar render error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Component Error</h3>
          <p className="text-red-500 mb-4">Something went wrong rendering the attendance calendar.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default AttendanceCalendar;