import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import API from '../../utils/api';
import { Bell, Calendar, X, Paperclip, FileText, Download } from 'lucide-react';

const UserNotifications = () => {
    const [notifs, setNotifs] = useState([]);
    const [selectedNotif, setSelectedNotif] = useState(null); // Stores the clicked notification
    const [attachments, setAttachments] = useState([]); // Stores files for the popup
    const [loading, setLoading] = useState(true);

    // 1. Fetch Notifications on Load
    useEffect(() => {
        fetchNotifs();
    }, []);

    // 2. Fetch Attachments when a Notification is clicked
    useEffect(() => {
        if (selectedNotif) {
            setAttachments([]); // Clear previous
            API.get(`/notifications/${selectedNotif.id}/attachments`)
                .then(res => setAttachments(res.data))
                .catch(err => console.error("Failed to load attachments"));
        }
    }, [selectedNotif]);

    const fetchNotifs = async () => {
        try {
            const res = await API.get('/notifications/my');
            setNotifs(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load notifications");
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                        <Bell size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
                        <p className="text-gray-500 text-sm">Stay updated with latest tasks and announcements</p>
                    </div>
                </div>

                {/* Notification List */}
                <div className="space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-500 py-10">Loading notifications...</p>
                    ) : notifs.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                            <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No new notifications</p>
                        </div>
                    ) : (
                        notifs.map(n => (
                            <div 
                                key={n.id} 
                                onClick={() => setSelectedNotif(n)}
                                className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition cursor-pointer flex gap-4 items-start relative overflow-hidden"
                            >
                                {/* Left Accent Bar */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition"></div>

                                {/* Icon */}
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                                        <Bell size={20} />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-700 transition">{n.title}</h3>
                                        <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap">
                                            <Calendar size={12} /> {new Date(n.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mt-1 line-clamp-2 text-sm">{n.message}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* === DETAILED POPUP MODAL === */}
                {selectedNotif && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col">
                            
                            {/* Modal Header */}
                            <div className="p-6 border-b flex justify-between items-start bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 leading-snug">{selectedNotif.title}</h2>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} className="text-blue-500"/> 
                                            {new Date(selectedNotif.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedNotif(null)} 
                                    className="p-2 bg-white rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 shadow-sm border border-gray-100 transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6 flex-1">
                                {/* Message Content */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Message</h3>
                                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                                        {selectedNotif.message}
                                    </div>
                                </div>

                                {/* Attachments Section */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Paperclip size={16}/> Attachments ({attachments.length})
                                    </h3>
                                    
                                    {attachments.length === 0 ? (
                                        <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center text-gray-400 italic text-sm">
                                            No files attached to this notification.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {attachments.map(file => (
                                                <a 
                                                    key={file.id} 
                                                    // FIX IS HERE: Use direct Cloudinary URL
                                                    href={file.file_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="group flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition text-left"
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                                                            <FileText size={20} />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-700 transition">
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

                            {/* Modal Footer */}
                            <div className="p-4 border-t bg-gray-50 rounded-b-2xl text-right">
                                <button 
                                    onClick={() => setSelectedNotif(null)}
                                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition shadow-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default UserNotifications;