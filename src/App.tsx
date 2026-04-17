import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Layout, Plus, LogIn, UserPlus, LogOut, CheckCircle, Circle, Clock, AlertCircle, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>('login');

  // Form states
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({ status: '', priority: '', page: 1 });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const interval = setInterval(checkHealth, 5000);
    checkHealth();
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (err) {
      setServerStatus('offline');
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...filters,
        page: filters.page.toString(),
        limit: '5'
      }).toString();
      
      const res = await fetch(`/api/tasks?${query}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchTasks();
    }
  }, [isLoggedIn, filters]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = view === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        setError(`Server returned an invalid response (${res.status}). The backend might still be starting up.`);
        return;
      }

      if (data.success) {
        if (view === 'login') {
          setIsLoggedIn(true);
          setUser(data.data);
          setView('dashboard');
        } else {
          setView('login');
          alert('Registration successful! Please login.');
        }
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Connection error: Could not reach the backend. Please wait a few seconds and try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLoggedIn(false);
      setUser(null);
      setView('login');
      setTasks([]);
    } catch (err) {
      console.error('Logout failed');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowTaskForm(false);
        setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
        fetchTasks();
      }
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: task.status === 'pending' ? 'completed' : 'pending' }),
      });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error('Update failed');
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      console.error('Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529] font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Layout className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">TaskFlow</span>
          <div className="ml-4 flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${
              serverStatus === 'online' ? 'bg-green-500' : 
              serverStatus === 'offline' ? 'bg-red-500 animate-pulse' : 
              'bg-amber-500'
            }`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {serverStatus === 'online' ? 'Backend Online' : 
               serverStatus === 'offline' ? 'Backend Offline' : 
               'Connecting...'}
            </span>
          </div>
        </div>
        
        {isLoggedIn && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">Hi, {user?.username}</span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-5xl mx-auto p-6">
        {!isLoggedIn ? (
          <div className="max-w-md mx-auto mt-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
            >
              <h2 className="text-3xl font-bold mb-6 text-center">
                {view === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {view === 'register' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Username</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="johndoe"
                      value={authForm.username}
                      onChange={e => setAuthForm({...authForm, username: e.target.value})}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="name@company.com"
                    value={authForm.email}
                    onChange={e => setAuthForm({...authForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Password</label>
                  <input 
                    type="password" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={e => setAuthForm({...authForm, password: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                >
                  {view === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {view === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-gray-500 text-sm">
                  {view === 'login' ? "Don't have an account?" : "Already have an account?"}
                  <button 
                    onClick={() => setView(view === 'login' ? 'register' : 'login')}
                    className="ml-2 text-indigo-600 font-bold hover:underline"
                  >
                    {view === 'login' ? 'Create one' : 'Sign in'}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight">My Tasks</h1>
                <p className="text-gray-500 mt-1">Manage your daily goals and productivity.</p>
              </div>
              <button 
                onClick={() => setShowTaskForm(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Plus size={20} />
                New Task
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Filter size={18} />
                <span className="text-sm font-bold uppercase tracking-wider">Filters:</span>
              </div>
              <select 
                className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.status}
                onChange={e => setFilters({...filters, status: e.target.value, page: 1})}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <select 
                className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.priority}
                onChange={e => setFilters({...filters, priority: e.target.value, page: 1})}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Task List */}
            <div className="grid gap-4">
              {loading ? (
                <div className="py-20 text-center text-gray-500 font-medium">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl py-20 text-center">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="text-gray-300" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">No tasks found</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mt-2">Get started by creating your first task using the button above.</p>
                </div>
              ) : (
                tasks.map(task => (
                  <motion.div 
                    layout
                    key={task._id}
                    className={`bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-6 transition-all hover:shadow-md ${task.status === 'completed' ? 'opacity-75' : ''}`}
                  >
                    <button 
                      onClick={() => toggleTaskStatus(task)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${task.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
                    >
                      {task.status === 'completed' ? <CheckCircle size={24} /> : <Circle size={24} />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`font-bold text-lg truncate ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-600' : 
                          task.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className={`text-sm line-clamp-1 ${task.status === 'completed' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {task.description}
                      </p>
                    </div>

                    <div className="hidden md:flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                        <Clock size={12} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteTask(task._id)}
                      className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                    >
                      <AlertCircle size={20} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-4">
                <button 
                  disabled={filters.page === 1}
                  onClick={() => setFilters({...filters, page: filters.page - 1})}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold text-gray-600">
                  Page {filters.page} of {pagination.pages}
                </span>
                <button 
                  disabled={filters.page === pagination.pages}
                  onClick={() => setFilters({...filters, page: filters.page + 1})}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Task Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">Create New Task</h2>
              <form onSubmit={handleCreateTask} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Task Title</label>
                  <input 
                    type="text" 
                    required
                    maxLength={100}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Design Landing Page"
                    value={taskForm.title}
                    onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Description</label>
                  <textarea 
                    required
                    maxLength={500}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="What needs to be done?"
                    value={taskForm.description}
                    onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Priority</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      value={taskForm.priority}
                      onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Due Date</label>
                    <input 
                      type="date" 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={taskForm.dueDate}
                      onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowTaskForm(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
