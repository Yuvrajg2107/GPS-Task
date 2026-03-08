import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import API from '../../utils/api';
import { Users, ClipboardList, Activity, AlertTriangle, Send, UserPlus, ArrowRight, Bell, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_users: 0, active_tasks: 0, overdue_tasks: 0, 
        near_deadline: [], category_stats: [], subtask_stats: []
    });
    const [loading, setLoading] = useState(true);

    // Chart Filters State
    const [chartCategory, setChartCategory] = useState('MSBTE');
    const [chartStatus, setChartStatus] = useState('all');

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Filter logic for Sub-Task Chart
    const filteredSubtasks = stats.subtask_stats
        ?.filter(s => s.category === chartCategory)
        .map(s => {
            if (chartStatus === 'completed') return { subtask: s.subtask, value: s.completed, fill: '#10B981' };
            if (chartStatus === 'incomplete') return { subtask: s.subtask, value: s.incomplete, fill: '#F59E0B' };
            return { subtask: s.subtask, completed: s.completed, incomplete: s.incomplete };
        }) || [];

    const quickActions = [
        { title: "Assign New Task", desc: "Create and assign tasks to faculty.", path: "/admin/tasks", icon: <ClipboardList size={24} className="text-white"/>, color: "bg-blue-600" },
        { title: "Monitor Progress", desc: "Track status and send reminders.", path: "/admin/monitoring", icon: <Activity size={24} className="text-white"/>, color: "bg-purple-600" },
        { title: "Send Notification", desc: "Broadcast messages to departments.", path: "/admin/send-notification", icon: <Send size={24} className="text-white"/>, color: "bg-orange-500" },
        { title: "Manage Users", desc: "Add or remove faculty and clerks.", path: "/admin/users", icon: <UserPlus size={24} className="text-white"/>, color: "bg-green-600" },
    ];

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Overview of system performance and activities.</p>
                </div>

                {/* HIGHLIGHT: Due Soon Slider (Only shows if tasks are due soon) */}
                {!loading && stats.near_deadline?.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-orange-800 flex items-center gap-2">
                                <Bell className="text-orange-600 animate-pulse" size={20}/> Action Required: Due Soon
                            </h2>
                            {/* Navigates to Monitoring Page AND passes filter state */}
                            <button 
                                onClick={() => navigate('/admin/monitoring', { state: { defaultFilter: 'near' } })}
                                className="text-orange-600 font-medium text-sm hover:underline flex items-center"
                            >
                                Show All <ArrowRight size={16} className="ml-1"/>
                            </button>
                        </div>
                        
                        <div className="flex overflow-x-auto pb-2 gap-4 snap-x">
                            {stats.near_deadline.map(task => (
                                <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 min-w-[280px] snap-start flex-shrink-0 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
                                        {task.category}
                                    </span>
                                    <h3 className="font-bold text-gray-800 truncate mb-1">{task.heading}</h3>
                                    <p className="text-sm text-gray-600 mb-3">Assigned to: <span className="font-medium text-gray-800">{task.assigned_to_name}</span></p>
                                    <div className="flex items-center text-xs text-orange-600 font-semibold bg-orange-50 w-max px-2 py-1 rounded-md">
                                        <Calendar size={12} className="mr-1"/> Due: {formatDate(task.end_date)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-blue-500 flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Users</h3>
                            <p className="text-4xl font-bold text-gray-800 mt-2">{loading ? "..." : stats.total_users}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full text-blue-600"><Users size={28} /></div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-green-500 flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Active Tasks</h3>
                            <p className="text-4xl font-bold text-gray-800 mt-2">{loading ? "..." : stats.active_tasks}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full text-green-600"><Activity size={28} /></div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-red-500 flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Overdue Tasks</h3>
                            <p className="text-4xl font-bold text-gray-800 mt-2">{loading ? "..." : stats.overdue_tasks}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-full text-red-600"><AlertTriangle size={28} /></div>
                    </div>
                </div>

                {/* CHARTS & ANALYTICS SECTION */}
                {!loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Chart 1: Category Overview */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-lg font-bold text-gray-800 mb-6">Task Progress by Category</h2>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.category_stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                                        <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                                        <RechartsTooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                                        <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                                        <Bar dataKey="completed" name="Completed" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
                                        <Bar dataKey="incomplete" name="Incomplete" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Chart 2: Sub-Task Deep Dive */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                                <h2 className="text-lg font-bold text-gray-800">Sub-Task Analysis</h2>
                                <div className="flex gap-2">
                                    <select 
                                        className="text-xs p-2 border rounded-lg bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500"
                                        value={chartCategory} onChange={(e) => setChartCategory(e.target.value)}
                                    >
                                        <option value="MSBTE">MSBTE</option>
                                        <option value="DTE">DTE</option>
                                        <option value="Institute">Institute</option>
                                    </select>
                                    <select 
                                        className="text-xs p-2 border rounded-lg bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500"
                                        value={chartStatus} onChange={(e) => setChartStatus(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="completed">Completed Only</option>
                                        <option value="incomplete">Incomplete Only</option>
                                    </select>
                                </div>
                            </div>

                            <div className="h-72 w-full">
                                {filteredSubtasks.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">No data for this selection</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={filteredSubtasks} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                                            {/* Angle X-Axis text so long sub-task names fit */}
                                            <XAxis dataKey="subtask" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 10}} interval={0} angle={-30} textAnchor="end" />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                                            <RechartsTooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                                            
                                            {chartStatus === 'all' ? (
                                                <>
                                                    <Legend wrapperStyle={{fontSize: '12px'}} verticalAlign="top" height={30} />
                                                    <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="incomplete" name="Incomplete" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                                </>
                                            ) : (
                                                <Bar dataKey="value" name={chartStatus === 'completed' ? 'Completed' : 'Incomplete'} fill={chartStatus === 'completed' ? '#10B981' : '#F59E0B'} radius={[4, 4, 0, 0]} />
                                            )}
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                    </div>
                )}

                {/* Quick Actions Grid */}
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