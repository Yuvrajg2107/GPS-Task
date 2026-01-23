import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import API from '../../utils/api';
import { Send, Users, User, Globe, Paperclip, X, FileText, Trash2, Search, History, PenTool, Calendar } from 'lucide-react';

const SendNotification = () => {
    const [activeTab, setActiveTab] = useState('compose'); 
    
    // --- COMPOSE STATE ---
    const [targetType, setTargetType] = useState('everyone'); 
    const [users, setUsers] = useState([]); 
    const [selectedUsers, setSelectedUsers] = useState([]); 
    const [userSearch, setUserSearch] = useState(''); 

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        target_dept: '',
        target_role: '',
        files: []
    });

    // --- HISTORY STATE ---
    const [history, setHistory] = useState([]);
    const [historySearch, setHistorySearch] = useState('');

    useEffect(() => {
        if (targetType === 'individual') fetchUsers();
    }, [targetType]);

    useEffect(() => {
        if (activeTab === 'history') fetchHistory();
    }, [activeTab, historySearch]);

    const fetchUsers = async () => {
        try { const res = await API.get('/auth/users'); setUsers(res.data); } catch (err) {}
    };

    const fetchHistory = async () => {
        try { 
            const res = await API.get(`/notifications/all?search=${historySearch}`); 
            setHistory(res.data); 
        } catch (err) {}
    };

    const deleteNotification = async (id) => {
        if(!window.confirm("Are you sure you want to delete this notification?")) return;
        try {
            await API.delete(`/notifications/${id}`);
            fetchHistory(); 
        } catch (err) { alert("Failed to delete"); }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, files: [...formData.files, ...Array.from(e.target.files)] });
    };

    const removeFile = (indexToRemove) => {
        setFormData({
            ...formData,
            files: formData.files.filter((_, index) => index !== indexToRemove)
        });
    };

    const toggleUser = (id) => {
        if (selectedUsers.includes(id)) setSelectedUsers(selectedUsers.filter(uid => uid !== id));
        else setSelectedUsers([...selectedUsers, id]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const data = new FormData();
        data.append('title', formData.title);
        data.append('message', formData.message);

        if (targetType === 'group') {
            if (formData.target_dept) data.append('target_dept', formData.target_dept);
            if (formData.target_role) data.append('target_role', formData.target_role);
        } else if (targetType === 'individual') {
            if (selectedUsers.length === 0) return alert("Please select at least one user");
            data.append('specific_recipient_ids', JSON.stringify(selectedUsers)); 
        }

        formData.files.forEach(file => data.append('files', file));

        try {
            await API.post('/notifications/create', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert("Notification Sent!");
            setFormData({ title: '', message: '', target_dept: '', target_role: '', files: [] });
            setSelectedUsers([]);
            setTargetType('everyone');
            setActiveTab('history'); 
        } catch (err) {
            console.error(err);
            alert("Failed to send. Check server console.");
        }
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-4 md:px-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Notification Center</h1>
                    
                    <div className="bg-white border rounded-lg p-1 flex w-full md:w-auto">
                        <button 
                            onClick={() => setActiveTab('compose')}
                            className={`flex-1 md:flex-none justify-center px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition ${activeTab === 'compose' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <PenTool size={16}/> Compose
                        </button>
                        <button 
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 md:flex-none justify-center px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition ${activeTab === 'history' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <History size={16}/> History
                        </button>
                    </div>
                </div>

                {/* === COMPOSE TAB === */}
                {activeTab === 'compose' && (
                    <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Target Audience</label>
                                <div className="flex flex-col md:flex-row gap-3">
                                    {['everyone', 'group', 'individual'].map((type) => (
                                        <button 
                                            key={type} type="button" onClick={() => setTargetType(type)}
                                            className={`flex-1 py-3 px-4 rounded-lg border flex items-center justify-center gap-2 capitalize transition ${targetType === type ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}
                                        >
                                            {type === 'everyone' && <Globe size={18} />}
                                            {type === 'group' && <Users size={18} />}
                                            {type === 'individual' && <User size={18} />}
                                            {type === 'individual' ? 'Specific People' : type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {targetType === 'group' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Department</label>
                                        <select className="w-full p-2 border rounded mt-1 bg-white outline-none" onChange={(e) => setFormData({...formData, target_dept: e.target.value})}>
                                            <option value="">All</option><option value="CM">CM</option><option value="IF">IF</option><option value="EJ">EJ</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Role</label>
                                        <select className="w-full p-2 border rounded mt-1 bg-white outline-none" onChange={(e) => setFormData({...formData, target_role: e.target.value})}>
                                            <option value="">All</option><option value="faculty">Faculty</option><option value="clerk">Clerk</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {targetType === 'individual' && (
                                <div className="p-4 bg-gray-50 rounded-lg border">
                                    <div className="flex items-center gap-2 mb-3 bg-white border p-2 rounded">
                                        <Search size={18} className="text-gray-400"/>
                                        <input 
                                            type="text" placeholder="Search person..." className="w-full outline-none"
                                            value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-48 overflow-y-auto space-y-1">
                                        {users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                                            <div key={u.id} onClick={() => toggleUser(u.id)} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer transition">
                                                <input type="checkbox" checked={selectedUsers.includes(u.id)} readOnly className="h-4 w-4 text-blue-600 rounded"/>
                                                <div>
                                                    <p className="font-medium text-sm text-gray-800">{u.name}</p>
                                                    <p className="text-xs text-gray-500">{u.role} • {u.department}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-blue-600 mt-2 font-medium">{selectedUsers.length} people selected</p>
                                </div>
                            )}

                            <input type="text" placeholder="Notification Heading" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                            <textarea rows="4" placeholder="Message content..." required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                                <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-50 relative transition cursor-pointer bg-white">
                                    <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer"/>
                                    <Paperclip size={24} className="text-gray-400 mb-2"/>
                                    <span className="text-sm text-gray-500">Click to attach files</span>
                                </div>

                                {formData.files.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {formData.files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border text-sm">
                                                <div className="flex items-center gap-2 truncate">
                                                    <FileText size={16} className="text-blue-500"/>
                                                    <span className="truncate max-w-[200px]">{file.name}</span>
                                                </div>
                                                <button type="button" onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500 transition">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 shadow-md transition"><Send size={18} /> Send Notification</button>
                        </form>
                    </div>
                )}

                {/* === HISTORY TAB === */}
                {activeTab === 'history' && (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input 
                                type="text" placeholder="Search history by title..." 
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={historySearch} onChange={(e) => setHistorySearch(e.target.value)}
                            />
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b text-gray-700">
                                        <tr>
                                            <th className="p-4 font-semibold">Title</th>
                                            <th className="p-4 font-semibold">Message</th>
                                            <th className="p-4 font-semibold">Target</th>
                                            <th className="p-4 font-semibold">Sent At</th>
                                            <th className="p-4 text-right font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.length === 0 ? (
                                            <tr><td colSpan="5" className="p-6 text-center text-gray-500">No history found.</td></tr>
                                        ) : (
                                            history.map(item => (
                                                <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                                                    <td className="p-4 font-medium text-gray-800">{item.title}</td>
                                                    <td className="p-4 text-sm text-gray-600 truncate max-w-xs">{item.message}</td>
                                                    <td className="p-4 text-xs">
                                                        {item.recipient_names ? (
                                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded inline-block max-w-[150px] truncate" title={item.recipient_names}>
                                                                {item.recipient_names}
                                                            </span>
                                                        ) : (
                                                            <>
                                                                {item.target_dept ? <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1">{item.target_dept}</span> : null}
                                                                {item.target_role ? <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded mr-1 capitalize">{item.target_role}</span> : null}
                                                                {!item.target_dept && !item.target_role && <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">Everyone</span>}
                                                            </>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600">{new Date(item.created_at).toLocaleDateString()}</td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => deleteNotification(item.id)} className="text-red-500 hover:text-red-700 transition"><Trash2 size={18} /></button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-4 p-4 bg-gray-50">
                                {history.map(item => (
                                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border space-y-3 relative">
                                        <div className="flex justify-between items-start pr-8">
                                            <h3 className="font-bold text-gray-800">{item.title}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2">{item.message}</p>
                                        
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            {item.recipient_names ? (
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded break-all">
                                                    {item.recipient_names}
                                                </span>
                                            ) : (
                                                <>
                                                    {item.target_dept ? <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{item.target_dept}</span> : null}
                                                    {item.target_role ? <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded capitalize">{item.target_role}</span> : null}
                                                    {!item.target_dept && !item.target_role && <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">Everyone</span>}
                                                </>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t">
                                            <Calendar size={12}/> {new Date(item.created_at).toLocaleString()}
                                        </div>

                                        <button 
                                            onClick={() => deleteNotification(item.id)} 
                                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SendNotification;