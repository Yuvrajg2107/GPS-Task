import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import API from '../../utils/api';
import { Bell, CheckCircle, Clock, AlertTriangle, Filter, Search, Calendar, User, Eye, Trash2, Edit, X, Save, Paperclip, FileText, Download, Users } from 'lucide-react';

const TaskMonitoring = () => {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    const [selectedTask, setSelectedTask] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [editFormData, setEditFormData] = useState({ heading: '', description: '', end_date: '' });

    // Delete Choice Modal State
    const [deleteModal, setDeleteModal] = useState(null); 

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        if (selectedTask) {
            setAttachments([]); 
            API.get(`/tasks/${selectedTask.id}/attachments`)
                .then(res => setAttachments(res.data))
                .catch(err => console.error(err));
            
            setEditFormData({
                heading: selectedTask.heading,
                description: selectedTask.description,
                end_date: selectedTask.end_date
            });
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

    // --- FIX: Safe Date Formatter ---
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid Date";
        return date.toLocaleDateString();
    };

    // --- DELETE LOGIC ---
    const openDeletePrompt = (task, e) => {
        e.stopPropagation();
        setDeleteModal({
            taskId: task.id,
            userId: task.assigned_to_id,
            userName: task.assigned_to_name,
            taskTitle: task.heading
        });
    };

    const handleDeleteSingle = async () => {
        try {
            await API.delete(`/tasks/${deleteModal.taskId}/assignment/${deleteModal.userId}`);
            alert(`Task removed for ${deleteModal.userName}`);
            setDeleteModal(null);
            fetchTasks();
        } catch (err) {
            alert("Failed to remove assignment");
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm("WARNING: This will delete the task for ALL users permanently. Are you sure?")) return;
        try {
            await API.delete(`/tasks/${deleteModal.taskId}`);
            alert("Task deleted for everyone");
            setDeleteModal(null);
            fetchTasks();
        } catch (err) {
            alert("Failed to delete task");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/tasks/${selectedTask.id}`, editFormData);
            alert("Task Updated Successfully!");
            setIsEditing(false);
            setSelectedTask(null);
            fetchTasks(); 
        } catch (err) {
            alert("Failed to update task");
        }
    };

    const sendReminder = async (userId, taskHeading, e) => {
        e.stopPropagation();
        try {
            await API.post('/tasks/remind', { user_id: userId, task_heading: taskHeading });
            alert("Reminder Notification Sent!");
        } catch (err) {
            alert("Failed to send reminder");
        }
    };

    const getTaskStatus = (task) => {
        const now = new Date();
        const end = new Date(task.end_date);
        const diffHours = (end - now) / (1000 * 60 * 60);

        if (task.status === 'completed') return 'completed';
        if (end < now) return 'overdue';
        if (diffHours > 0 && diffHours < 48) return 'near';
        return task.status;
    };

    const filteredTasks = tasks.filter(task => {
        const computedStatus = getTaskStatus(task);
        const matchesSearch = task.heading.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;
        if (filter === 'all') return true;
        if (filter === 'viewed') return task.status === 'viewed';
        if (filter === 'completed') return task.status === 'completed';
        if (filter === 'pending') return task.status === 'in_progress';
        if (filter === 'overdue') return computedStatus === 'overdue' && task.status !== 'completed';
        if (filter === 'near') return computedStatus === 'near' && task.status !== 'completed';
        return true;
    });

    const getStatusBadge = (status, computed) => {
        if (status === 'completed') return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>;
        if (status === 'viewed') return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Viewed</span>;
        if (computed === 'overdue') return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Overdue</span>;
        if (computed === 'near') return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Due Soon</span>;
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">{status.replace('_', ' ')}</span>;
    };

    const getTabColor = (color) => {
        const colors = { blue: '#2563eb', green: '#16a34a', yellow: '#eab308', red: '#dc2626', orange: '#f97316', purple: '#9333ea' };
        return colors[color];
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Task Monitoring</h1>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="text" placeholder="Search tasks..." 
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { id: 'all', label: 'All', icon: <Filter size={16}/>, color: 'blue' },
                        { id: 'viewed', label: 'Viewed', icon: <Eye size={16}/>, color: 'purple' },
                        { id: 'pending', label: 'In Progress', icon: <Clock size={16}/>, color: 'yellow' },
                        { id: 'completed', label: 'Completed', icon: <CheckCircle size={16}/>, color: 'green' },
                        { id: 'overdue', label: 'Overdue', icon: <AlertTriangle size={16}/>, color: 'red' },
                        { id: 'near', label: 'Due Soon', icon: <Bell size={16}/>, color: 'orange' },
                    ].map(tab => (
                        <button 
                            key={tab.id} onClick={() => setFilter(tab.id)}
                            className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium whitespace-nowrap transition border ${filter === tab.id ? `bg-${tab.color}-600 text-white border-${tab.color}-600 shadow-md` : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            style={filter === tab.id ? { backgroundColor: getTabColor(tab.color) } : {}}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Task Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {loading ? <div className="p-10 text-center text-gray-500">Loading tasks...</div> : filteredTasks.length === 0 ? <div className="p-10 text-center text-gray-500">No tasks found matching your filters.</div> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-700 border-b">
                                    <tr>
                                        <th className="p-4 font-semibold">Task Heading</th>
                                        <th className="p-4 font-semibold">Assigned To</th>
                                        <th className="p-4 font-semibold">Due Date</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 text-right font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTasks.map(task => {
                                        const computedStatus = getTaskStatus(task);
                                        return (
                                            <tr key={`${task.id}-${task.assigned_to_id}`} className="border-b hover:bg-gray-50 transition cursor-pointer" onClick={() => { setSelectedTask(task); setIsEditing(false); }}>
                                                <td className="p-4 font-medium text-gray-800">{task.heading}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">{task.assigned_to_name.charAt(0)}</div>
                                                        <div><div className="text-sm font-semibold">{task.assigned_to_name}</div><div className="text-xs text-gray-500">{task.assigned_to_dept}</div></div>
                                                    </div>
                                                </td>
                                                {/* FIX: Use helper function */}
                                                <td className="p-4 text-sm text-gray-600">{formatDate(task.end_date)}</td>
                                                <td className="p-4">{getStatusBadge(task.status, computedStatus)}</td>
                                                <td className="p-4 text-right flex justify-end gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); setSelectedTask(task); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"><Edit size={16}/></button>
                                                    <button onClick={(e) => openDeletePrompt(task, e)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"><Trash2 size={16}/></button>
                                                    {task.status !== 'completed' && (
                                                        <button onClick={(e) => sendReminder(task.assigned_to_id, task.heading, e)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-full transition" title="Send Reminder"><Bell size={16}/></button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* === TASK EDIT MODAL === */}
                {selectedTask && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                            
                            <div className="p-6 border-b flex justify-between items-start bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {isEditing ? "Modify Task" : selectedTask.heading}
                                    </h2>
                                    {!isEditing && <p className="text-sm text-gray-500 mt-1">Assigned to: <b>{selectedTask.assigned_to_name}</b></p>}
                                </div>
                                <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition"><X size={20} /></button>
                            </div>

                            <div className="p-6 space-y-6">
                                {isEditing ? (
                                    <form id="editForm" onSubmit={handleUpdate} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Heading</label>
                                            <input type="text" className="w-full p-2 border rounded mt-1" value={editFormData.heading} onChange={e => setEditFormData({...editFormData, heading: e.target.value})} required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Description</label>
                                            <textarea className="w-full p-2 border rounded mt-1" rows="4" value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Deadline</label>
                                            {/* FIX: Check if date exists before calling toISOString to avoid crash */}
                                            <input 
                                                type="datetime-local" 
                                                className="w-full p-2 border rounded mt-1" 
                                                value={editFormData.end_date ? new Date(editFormData.end_date).toISOString().slice(0, 16) : ''} 
                                                onChange={e => setEditFormData({...editFormData, end_date: e.target.value})} 
                                                required 
                                            />
                                        </div>
                                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                            Warning: Modifying this will change the task details for ALL assigned users.
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="text-gray-700 bg-gray-50 p-4 rounded-lg border">{selectedTask.description}</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* FIX: Use helper function */}
                                            <div className="p-3 bg-blue-50 rounded-lg"><h3 className="text-xs font-bold text-blue-500">Assigned</h3><p className="text-blue-900 font-medium">{formatDate(selectedTask.assigned_at)}</p></div>
                                            <div className="p-3 bg-red-50 rounded-lg"><h3 className="text-xs font-bold text-red-500">Deadline</h3><p className="text-red-900 font-medium">{formatDate(selectedTask.end_date)}</p></div>
                                        </div>
                                        
                                        {/* Attachments */}
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Paperclip size={16}/> Attachments</h3>
                                            {attachments.length === 0 ? <p className="text-sm text-gray-400 italic">No files.</p> : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {attachments.map(file => (
                                                        <a 
                                                            key={file.id} 
                                                            // FIX: Direct Cloudinary URL
                                                            href={file.file_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="flex items-center justify-between p-3 bg-white border rounded hover:border-blue-400 transition group"
                                                        >
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <FileText size={18} className="text-blue-500 flex-shrink-0"/>
                                                                <span className="text-sm truncate">{file.file_url.split(/[\\/]/).pop()}</span>
                                                            </div>
                                                            <Download size={14} className="text-gray-400 group-hover:text-blue-600"/>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                                {isEditing ? (
                                    <>
                                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
                                        <button type="submit" form="editForm" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"><Save size={16}/> Save Changes</button>
                                    </>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"><Edit size={16}/> Modify Task</button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* === DELETE CHOICE MODAL === */}
                {deleteModal && (
                    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Task</h3>
                            <p className="text-gray-600 mb-6">
                                You are deleting <b>"{deleteModal.taskTitle}"</b>. Who do you want to remove this task for?
                            </p>
                            
                            <div className="space-y-3">
                                <button 
                                    onClick={handleDeleteSingle}
                                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition"><User size={20}/></div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-800">Only for {deleteModal.userName}</p>
                                            <p className="text-xs text-gray-500">Remove assignment for this specific user</p>
                                        </div>
                                    </div>
                                </button>

                                <button 
                                    onClick={handleDeleteAll}
                                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 text-red-600 rounded-full group-hover:bg-red-600 group-hover:text-white transition"><Users size={20}/></div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-800">For Everyone</p>
                                            <p className="text-xs text-gray-500">Delete this task completely for all users</p>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <button onClick={() => setDeleteModal(null)} className="w-full mt-4 py-2 text-gray-500 hover:text-gray-800">Cancel</button>
                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
};

export default TaskMonitoring;