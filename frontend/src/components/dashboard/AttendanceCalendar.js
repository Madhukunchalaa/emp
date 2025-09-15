import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, User, Clock, X, Users, CalendarDays, ArrowLeft, MessageSquare, Eye } from 'lucide-react';

const AttendanceCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeUpdates, setEmployeeUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatesLoading, setUpdatesLoading] = useState(false);

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
      const token = localStorage.getItem("token");
      const formattedDate = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      // You can modify this API endpoint according to your backend
      const API_URL = `http://localhost:5000/api/manager/employee-updates?date=${formattedDate}&employeeId=${employeeId}`;
      
      const res = await fetch(API_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error("Network error");
      const json = await res.json();
      const updates = extractData(json);
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
    fetchEmployeeUpdates(clickedDate, employeeBlock.employee._id);
  };

  const handleViewUpdate = (update) => {
    // Handle view update functionality
    console.log('View update:', update);
  };

  // Fetch attendance data from your API
  useEffect(() => {
    const API_URL = "http://localhost:5000/api/manager/attendance";
    const token = localStorage.getItem("token");

    setLoading(true);

    fetch(API_URL, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((json) => {
        setAttendanceData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching attendance:", err);
        setLoading(false);
      });
  }, [currentMonth]);

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
    const stats = { present: 0, absent: 0, totalHours: 0 };
    
    Object.values(attendance).forEach(day => {
      if (day.status?.toLowerCase() === 'present' || day.status?.toLowerCase() === 'p') {
        stats.present++;
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
          className={`p-2 rounded-lg text-center cursor-pointer hover:opacity-80 transition-all ${getStatusColor(dayData.status)} hover:ring-2 hover:ring-orange-300`}
          title={`${day}: ${dayData.status?.charAt(0).toUpperCase() + dayData.status?.slice(1)} - ${dayData.totalHours} hours${dayData.punchIn ? `\nPunch In: ${dayData.punchIn}` : ''}${dayData.punchOut ? `\nPunch Out: ${dayData.punchOut}` : ''}\nClick to view work updates`}
          onClick={() => handleDateClick(day, employeeBlock)}
        >
          <div className="text-sm font-semibold">{day}</div>
          <div className="text-xs mt-1">{dayData.totalHours}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-800">{stats.present}</div>
                <div className="text-sm text-green-600">Days Present</div>
              </div>
              <div className="bg-red-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-800">{stats.absent}</div>
                <div className="text-sm text-red-600">Days Absent</div>
              </div>
              <div className="bg-blue-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-800">{stats.totalHours.toFixed(1)}h</div>
                <div className="text-sm text-blue-600">Total Hours</div>
              </div>
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
            <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-gray-200">
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
              <div className="text-sm text-gray-600 italic">
                Click on any date to view work updates
              </div>
            </div>
          </div>

          {/* Work Updates Modal/Section */}
          {selectedDate && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Work Updates - {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={() => {
                    setSelectedDate(null);
                    setEmployeeUpdates([]);
                  }}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {updatesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading work updates...</p>
                </div>
              ) : employeeUpdates.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No work updates found for this date.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {employeeUpdates.map((update) => (
                    <div key={update._id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 hover:shadow-lg hover:bg-white/80 transition-all duration-300 border border-white/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <UserAvatar
                            avatar={update.employee?.avatar}
                            name={update.employee?.name}
                            size="sm"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-800">{update.employee?.name}</h4>
                            <p className="text-xs text-gray-500">{new Date(update.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          update.status === 'approved' ? 'bg-green-100 text-green-800' :
                          update.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {update.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {update.tasks?.map(task => task.description).join(', ') || update.description || 'No description available'}
                      </p>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewUpdate(update)}
                          className="flex items-center space-x-1 bg-gray-200/70 text-gray-700 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-300/70 transition-all duration-200"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

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
          {loading ? (
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
                      <div className="bg-green-50 border border-green-200 rounded-lg p-1.5 text-center">
                        <div className="text-sm font-bold text-green-600">{stats.onTime}</div>
                        <div className="text-xs text-green-500">On Time</div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-1.5 text-center">
                        <div className="text-sm font-bold text-yellow-600">{stats.late}</div>
                        <div className="text-xs text-yellow-500">Late</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-1.5 text-center">
                        <div className="text-sm font-bold text-red-600">{stats.tooLate}</div>
                        <div className="text-xs text-red-500">Too Late</div>
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
      </div>
    </div>
  );
};

export default AttendanceCalendar;