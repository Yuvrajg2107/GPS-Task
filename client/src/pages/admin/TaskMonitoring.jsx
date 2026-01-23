import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import API from '../../utils/api';
import { Bell, CheckCircle, Clock, AlertTriangle, Filter, Search, Calendar, User, Eye } from 'lucide-react'; // Added Eye icon

const TaskMonitoring = () => {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all'); // all, viewed, completed, pending, overdue, near
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await API.get('/tasks');
            setTasks(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load tasks");
            setLoading(false);
        }
    };

    // Helper: Calculate Time Difference
    const getTaskStatus = (task) => {
        const now = new Date();
        const end = new Date(task.end_date);
        const diffHours = (end - now) / (1000 * 60 * 60);

        if (task.status === 'completed') return 'completed';
        if (end < now) return 'overdue';
        if (diffHours > 0 && diffHours < 48) return 'near';
        return task.status;
    };

    // Advanced Filter Logic
    const filteredTasks = tasks.filter(task => {
        const computedStatus = getTaskStatus(task);
        const matchesSearch = task.heading.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;

        if (filter === 'all') return true;
        if (filter === 'viewed') return task.status === 'viewed'; // NEW: Specific Viewed Filter
        if (filter === 'completed') return task.status === 'completed';
        if (filter === 'pending') return task.status === 'in_progress'; // Changed to match exact status
        if (filter === 'overdue') return computedStatus === 'overdue' && task.status !== 'completed';
        if (filter === 'near') return computedStatus === 'near' && task.status !== 'completed';
        
        return true;
    });

    const sendReminder = async (userId, taskHeading) => {
        try {
            await API.post('/tasks/remind', { user_id: userId, task_heading: taskHeading });
            alert("Reminder Notification Sent!");
        } catch (err) {
            alert("Failed to send reminder");
        }
    };

    const getStatusBadge = (status, computed) => {
        if (status === 'completed') return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>;
        if (status === 'viewed') return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Viewed</span>;
        if (computed === 'overdue') return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Overdue</span>;
        if (computed === 'near') return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Due Soon</span>;
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">{status.replace('_', ' ')}</span>;
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Task Monitoring</h1>
                    
                    {/* Search Bar */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search tasks..." 
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Responsive Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { id: 'all', label: 'All', icon: <Filter size={16}/>, color: 'blue' },
                        { id: 'viewed', label: 'Viewed', icon: <Eye size={16}/>, color: 'purple' }, // NEW BUTTON
                        { id: 'pending', label: 'In Progress', icon: <Clock size={16}/>, color: 'yellow' },
                        { id: 'completed', label: 'Completed', icon: <CheckCircle size={16}/>, color: 'green' },
                        { id: 'overdue', label: 'Overdue', icon: <AlertTriangle size={16}/>, color: 'red' },
                        { id: 'near', label: 'Due Soon', icon: <Bell size={16}/>, color: 'orange' },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium whitespace-nowrap transition border ${
                                filter === tab.id 
                                ? `bg-${tab.color}-600 text-white border-${tab.color}-600 shadow-md` 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                            style={filter === tab.id ? { backgroundColor: getTabColor(tab.color) } : {}}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {loading ? (
                        <div className="p-10 text-center text-gray-500">Loading tasks...</div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                            <Filter size={48} className="text-gray-200 mb-2"/>
                            <p>No tasks found matching your filters.</p>
                        </div>
                    ) : (
                        <>
                            {/* DESKTOP VIEW: Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-700 border-b">
                                        <tr>
                                            <th className="p-4 font-semibold">Task Heading</th>
                                            <th className="p-4 font-semibold">Assigned To</th>
                                            <th className="p-4 font-semibold">Due Date</th>
                                            <th className="p-4 font-semibold">Status</th>
                                            <th className="p-4 text-right font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTasks.map(task => {
                                            const computedStatus = getTaskStatus(task);
                                            return (
                                                <tr key={`${task.id}-${task.assigned_to_id}`} className="border-b hover:bg-gray-50 transition">
                                                    <td className="p-4 font-medium text-gray-800">{task.heading}</td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                                                {task.assigned_to_name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold">{task.assigned_to_name}</div>
                                                                <div className="text-xs text-gray-500">{task.assigned_to_dept}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600">
                                                        {new Date(task.end_date).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(task.end_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        {getStatusBadge(task.status, computedStatus)}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {task.status !== 'completed' && (
                                                            <button 
                                                                onClick={() => sendReminder(task.assigned_to_id, task.heading)}
                                                                className="px-3 py-1.5 text-sm bg-white text-blue-600 rounded-md hover:bg-blue-50 border border-blue-200 flex items-center gap-1 ml-auto shadow-sm transition"
                                                            >
                                                                <Bell size={14} /> Remind
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* MOBILE VIEW: Cards */}
                            <div className="md:hidden space-y-4 p-4 bg-gray-50">
                                {filteredTasks.map(task => {
                                    const computedStatus = getTaskStatus(task);
                                    return (
                                        <div key={`${task.id}-${task.assigned_to_id}`} className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-gray-800">{task.heading}</h3>
                                                {getStatusBadge(task.status, computedStatus)}
                                            </div>
                                            
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <User size={16} className="text-gray-400"/>
                                                <span>{task.assigned_to_name} <span className="text-xs text-gray-400">({task.assigned_to_dept})</span></span>
                                            </div>

                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <Calendar size={16} className="text-gray-400"/>
                                                <span>{new Date(task.end_date).toLocaleString()}</span>
                                            </div>

                                            {task.status !== 'completed' && (
                                                <button 
                                                    onClick={() => sendReminder(task.assigned_to_id, task.heading)}
                                                    className="w-full py-2 mt-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200 flex items-center justify-center gap-2 transition font-medium"
                                                >
                                                    <Bell size={16} /> Send Reminder
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

// Helper for dynamic colors
const getTabColor = (color) => {
    const colors = {
        blue: '#2563eb',
        green: '#16a34a',
        yellow: '#eab308',
        red: '#dc2626',
        orange: '#f97316',
        purple: '#9333ea' // Added purple for Viewed
    };
    return colors[color];
};

export default TaskMonitoring;