import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Layout from '../../components/Layout';
import AuthContext from '../../context/AuthContext';
import API from '../../utils/api';
import { CheckCircle, Clock, AlertTriangle, FileText, Bell, List, ArrowRight } from 'lucide-react';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate(); // Hook for navigation
    const [stats, setStats] = useState({ total: 0, completed: 0, in_progress: 0, near_deadline: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await API.get('/tasks/stats');
                setStats(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load stats");
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
                        <p className="text-gray-500 mt-1 flex flex-col md:flex-row md:gap-2">
                            <span className="font-medium text-gray-700">{user?.name}</span> 
                            <span className="hidden md:inline">•</span>
                            <span>{user?.department} Department</span>
                            <span className="hidden md:inline">•</span>
                            <span className="capitalize">{user?.role}</span>
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-blue-500 hover:shadow-md transition">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Assigned</p>
                                <h2 className="text-4xl font-bold text-gray-800 mt-2">{loading ? "..." : stats.total}</h2>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-full text-blue-500">
                                <FileText size={28} />
                            </div>
                        </div>
                    </div>

                    {/* Completed */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-green-500 hover:shadow-md transition">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Completed</p>
                                <h2 className="text-4xl font-bold text-gray-800 mt-2">{loading ? "..." : stats.completed}</h2>
                            </div>
                            <div className="p-3 bg-green-50 rounded-full text-green-500">
                                <CheckCircle size={28} />
                            </div>
                        </div>
                    </div>

                    {/* In Progress */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-yellow-500 hover:shadow-md transition">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">In Progress</p>
                                <h2 className="text-4xl font-bold text-gray-800 mt-2">{loading ? "..." : stats.in_progress}</h2>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-full text-yellow-500">
                                <Clock size={28} />
                            </div>
                        </div>
                    </div>

                    {/* Due Soon */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-red-500 hover:shadow-md transition">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Due Soon (48h)</p>
                                <h2 className="text-4xl font-bold text-gray-800 mt-2">{loading ? "..." : stats.near_deadline}</h2>
                            </div>
                            <div className="p-3 bg-red-50 rounded-full text-red-500">
                                <AlertTriangle size={28} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deadline Alert */}
                {stats.near_deadline > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-red-800 text-lg">Action Required</h3>
                            <p className="text-red-700 mt-1">
                                You have <b>{stats.near_deadline}</b> tasks nearing their deadline (within 2 days). 
                                Please check "My Tasks" to prioritize them.
                            </p>
                        </div>
                    </div>
                )}

                {/* Quick Actions / Navigation */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Go to Tasks Button */}
                        <div 
                            onClick={() => navigate('/dashboard/tasks')}
                            className="group bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden"
                        >
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="text-white">
                                    <h3 className="text-xl font-bold mb-1">View My Tasks</h3>
                                    <p className="text-blue-100 text-sm">Check details, update status & submit work</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full text-white group-hover:bg-white group-hover:text-blue-600 transition-colors">
                                    <List size={28} />
                                </div>
                            </div>
                            {/* Decorative background circle */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                        </div>

                        {/* Go to Notifications Button */}
                        <div 
                            onClick={() => navigate('/dashboard/notifications')}
                            className="group bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden"
                        >
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="text-white">
                                    <h3 className="text-xl font-bold mb-1">Check Notifications</h3>
                                    <p className="text-purple-100 text-sm">See reminders, announcements & updates</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full text-white group-hover:bg-white group-hover:text-purple-600 transition-colors">
                                    <Bell size={28} />
                                </div>
                            </div>
                            {/* Decorative background circle */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                        </div>

                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default UserDashboard;