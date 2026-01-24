import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import API from '../../utils/api';
import { Clock, Paperclip, X, AlertCircle, FileText, Download, Calendar, CheckCircle2, AlertTriangle, Briefcase } from 'lucide-react';

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null); // For Modal
    const [attachments, setAttachments] = useState([]); // Store files for selected task
    const [loading, setLoading] = useState(true);

    // 1. Fetch Tasks on Load
    useEffect(() => {
        fetchTasks();
    }, []);

    // 2. Fetch Attachments when a Task is selected
    useEffect(() => {
        if (selectedTask) {
            setAttachments([]); // Clear previous files
            API.get(`/tasks/${selectedTask.id}/attachments`)
                .then(res => setAttachments(res.data))
                .catch(err => console.error("Failed to load attachments", err));
        }
    }, [selectedTask]);

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

    const updateStatus = async (taskId, newStatus) => {
        try {
            await API.put(`/tasks/${taskId}/status`, { status: newStatus });
            // Update local state to reflect change immediately
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
            if (selectedTask) setSelectedTask({ ...selectedTask, status: newStatus });
            // Optional: Add a toast notification here instead of alert
            alert("Status Updated Successfully!");
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const isNearDeadline = (dateString) => {
        const diff = new Date(dateString) - new Date();
        const hours = diff / (1000 * 60 * 60);
        return hours > 0 && hours < 48;
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'in_progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'viewed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'cant_be_done': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
                        <p className="text-gray-500 mt-1">Manage your assigned work and deadlines</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border shadow-sm text-sm text-gray-600 font-medium">
                        Total Tasks: {tasks.length}
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1,2,3].map(i => (
                            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600">No tasks assigned yet</h3>
                        <p className="text-gray-400">Enjoy your free time!</p>
                    </div>
                ) : (
                    /* Tasks Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map(task => {
                            const near = isNearDeadline(task.end_date) && task.status !== 'completed';
                            return (
                                <div 
                                    key={task.id} 
                                    onClick={() => setSelectedTask(task)}
                                    className={`
                                        group bg-white p-6 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden
                                        hover:shadow-lg hover:-translate-y-1
                                        ${near ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-100'}
                                    `}
                                >
                                    {/* Near Deadline Indicator */}
                                    {near && (
                                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                                            DUE SOON
                                        </div>
                                    )}

                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-2 rounded-lg ${getStatusColor(task.status)} bg-opacity-50`}>
                                            {task.status === 'completed' ? <CheckCircle2 size={20}/> : <Clock size={20}/>}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getStatusColor(task.status)}`}>
                                            {task.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {task.heading}
                                    </h3>
                                    
                                    {/* Date & Info */}
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg">
                                        <Calendar size={14} className="text-blue-500" />
                                        <span className={near ? 'text-red-600 font-medium' : ''}>
                                            {new Date(task.end_date).toLocaleDateString()}
                                        </span>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-xs">
                                            {new Date(task.end_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
                                        <span>From: <span className="font-medium text-gray-600">{task.assigned_by_name}</span></span>
                                        <div className="flex items-center gap-1 text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Details <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">→</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* === TASK DETAIL MODAL === */}
                {selectedTask && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div 
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b flex justify-between items-start bg-gray-50/80 sticky top-0 z-10 backdrop-blur-md rounded-t-2xl">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 leading-tight">{selectedTask.heading}</h2>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                        <span className="bg-white border px-2 py-0.5 rounded text-xs">Assigned by: <b>{selectedTask.assigned_by_name}</b></span>
                                        <span>•</span>
                                        <span>{new Date(selectedTask.assigned_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedTask(null)} 
                                    className="p-2 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full border shadow-sm transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-8">
                                {/* Description */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Task Description</h3>
                                    <div className="text-gray-700 leading-relaxed bg-gray-50 p-5 rounded-xl border border-gray-100">
                                        {selectedTask.description || <span className="italic text-gray-400">No description provided.</span>}
                                    </div>
                                </div>

                                {/* Dates Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <h3 className="text-xs font-bold text-blue-400 uppercase mb-1">Assigned Date</h3>
                                        <p className="text-blue-900 font-medium">{new Date(selectedTask.assigned_at).toLocaleString()}</p>
                                    </div>
                                    <div className={`p-4 rounded-xl border ${new Date(selectedTask.end_date) < new Date() ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                        <h3 className={`text-xs font-bold uppercase mb-1 ${new Date(selectedTask.end_date) < new Date() ? 'text-red-400' : 'text-green-400'}`}>
                                            Deadline
                                        </h3>
                                        <p className={`font-medium ${new Date(selectedTask.end_date) < new Date() ? 'text-red-900' : 'text-green-900'}`}>
                                            {new Date(selectedTask.end_date).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Attachments */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Paperclip size={16}/> Attachments ({attachments.length})
                                    </h3>
                                    
                                    {attachments.length === 0 ? (
                                        <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-sm">
                                            No files attached to this task.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {attachments.map(file => (
                                                <a 
                                                    key={file.id} 
                                                    // FIX IS HERE: Direct link to Cloudinary URL
                                                    href={file.file_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="group flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all duration-200"
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                            <FileText size={20} />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-700 transition-colors">
                                                            {file.file_url.split(/[\\/]/).pop()}
                                                        </span>
                                                    </div>
                                                    <Download size={16} className="text-gray-400 group-hover:text-blue-600"/>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer (Status Update) */}
                            <div className="p-6 bg-gray-50 border-t mt-auto rounded-b-2xl">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Update Task Status</label>
                                <div className="relative">
                                    <select 
                                        className="w-full p-4 pl-4 pr-10 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none font-medium text-gray-700 transition shadow-sm cursor-pointer hover:border-blue-400"
                                        value={selectedTask.status}
                                        onChange={(e) => updateStatus(selectedTask.id, e.target.value)}
                                    >
                                        <option value="viewed">👀 Viewed</option>
                                        <option value="in_progress">🚧 In Progress</option>
                                        <option value="completed">✅ Completed</option>
                                        <option value="cant_be_done">⚠️ Can't Be Done</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                        <AlertCircle size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MyTasks;