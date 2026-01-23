import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import API from '../../utils/api';
import { Users, ClipboardList, Activity, AlertTriangle, Send, UserPlus, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_users: 0,
        active_tasks: 0,
        overdue_tasks: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await API.get('/tasks/admin-stats');
                setStats(res.data);
            } catch (err) {
                console.error("Failed to load admin stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Quick Action Buttons Configuration
    const quickActions = [
        { 
            title: "Assign New Task", 
            desc: "Create and assign tasks to faculty/clerks.", 
            path: "/admin/tasks", 
            icon: <ClipboardList size={24} className="text-white"/>,
            color: "bg-blue-600"
        },
        { 
            title: "Monitor Progress", 
            desc: "Track status and send reminders.", 
            path: "/admin/monitoring", 
            icon: <Activity size={24} className="text-white"/>,
            color: "bg-purple-600"
        },
        { 
            title: "Send Notification", 
            desc: "Broadcast messages to departments.", 
            path: "/admin/send-notification", 
            icon: <Send size={24} className="text-white"/>,
            color: "bg-orange-500"
        },
        { 
            title: "Manage Users", 
            desc: "Add or remove faculty and clerks.", 
            path: "/admin/users", 
            icon: <UserPlus size={24} className="text-white"/>,
            color: "bg-green-600"
        },
    ];

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* 1. Header Section */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Overview of system performance and activities.</p>
                </div>

                {/* 2. Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Users */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-blue-500 flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Users</h3>
                            <p className="text-4xl font-bold text-gray-800 mt-2">{loading ? "..." : stats.total_users}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                            <Users size={28} />
                        </div>
                    </div>

                    {/* Active Tasks */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-green-500 flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Active Tasks</h3>
                            <p className="text-4xl font-bold text-gray-800 mt-2">{loading ? "..." : stats.active_tasks}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full text-green-600">
                            <Activity size={28} />
                        </div>
                    </div>

                    {/* Overdue Tasks */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-red-500 flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Overdue Tasks</h3>
                            <p className="text-4xl font-bold text-gray-800 mt-2">{loading ? "..." : stats.overdue_tasks}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-full text-red-600">
                            <AlertTriangle size={28} />
                        </div>
                    </div>
                </div>

                {/* 3. Quick Actions Grid */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quickActions.map((action, index) => (
                            <div 
                                key={index} 
                                onClick={() => navigate(action.path)}
                                className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition cursor-pointer group"
                            >
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${action.color} shadow-md`}>
                                    {action.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition">
                                    {action.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-2 mb-4">
                                    {action.desc}
                                </p>
                                <div className="flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Go Now <ArrowRight size={16} className="ml-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default AdminDashboard;