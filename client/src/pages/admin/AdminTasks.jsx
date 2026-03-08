import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import API from '../../utils/api';
import { Search, Paperclip, X, FileText, Check, User } from 'lucide-react';

// Data Dictionary for Categories and Tasks
const TASK_CATEGORIES = {
    'MSBTE': [
        'Affiliation', 
        'Student Enrollment', 
        'Exam Form Filling', 
        'Result', 
        'Competition', 
        'Miscellaneous'
    ],
    'DTE': [
        'Admission', 
        'Audit', 
        'Scholarship', 
        'Staff Transfer', 
        'Miscellaneous'
    ],
    'Institute': [
        'Hostel', 
        'AICTE EOA', 
        'AISHE', 
        'Unit Test', 
        'Exam Center', 
        'CET Cell', 
        'Infrastructure', 
        'Sports', 
        'Gymkhana', 
        'Account', 
        'Finance', 
        'Miscellaneous'
    ]
};

const AdminTasks = () => {
    const [step, setStep] = useState(1);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    
    // Filters
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [deptFilter, setDeptFilter] = useState('');

    // Task Data
    const [taskData, setTaskData] = useState({
        category: '', // NEW
        heading: '',
        description: '',
        end_date: '',
        files: []
    });

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, deptFilter]);

    const fetchUsers = async () => {
        try {
            const res = await API.get(`/auth/users?role=${roleFilter}&department=${deptFilter}`);
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users");
        }
    };

    const toggleUser = (id) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter(uid => uid !== id));
        } else {
            setSelectedUsers([...selectedUsers, id]);
        }
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setTaskData({ ...taskData, files: [...taskData.files, ...newFiles] });
    };

    const removeFile = (indexToRemove) => {
        setTaskData({
            ...taskData,
            files: taskData.files.filter((_, index) => index !== indexToRemove)
        });
    };

    // Reset heading if category changes
    const handleCategoryChange = (e) => {
        setTaskData({ 
            ...taskData, 
            category: e.target.value, 
            heading: '' // Reset task heading when category changes
        });
    };

    const handleSubmit = async () => {
        if (!taskData.category || !taskData.heading || !taskData.end_date) {
            return alert("Please fill Category, Task Heading, and Due Date");
        }
        if (selectedUsers.length === 0) return alert("Please select at least one user");

        const formData = new FormData();
        formData.append('category', taskData.category); // NEW
        formData.append('heading', taskData.heading);
        formData.append('description', taskData.description);
        formData.append('end_date', taskData.end_date);
        formData.append('assigned_to', JSON.stringify(selectedUsers));
        
        taskData.files.forEach(file => {
            formData.append('files', file);
        });

        try {
            await API.post('/tasks/create', formData);
            
            alert("Task Assigned Successfully!");
            setStep(1);
            setSelectedUsers([]);
            setTaskData({ category: '', heading: '', description: '', end_date: '', files: [] });
        } catch (err) {
            alert("Failed to assign task. Please try again.");
            console.error(err);
        }
    };

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-4 md:px-0 h-full flex flex-col"> 
                {/* Header */}
                <div className="flex-none">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Create New Task</h1>

                    {/* Responsive Stepper */}
                    <div className="flex items-center justify-center md:justify-start mb-6 space-x-2 md:space-x-4">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
                        <span className={`text-sm md:text-base font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>Select Users</span>
                        
                        <div className="w-8 md:w-16 h-1 bg-gray-200">
                            <div className={`h-full bg-blue-600 transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`}></div>
                        </div>
                        
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
                        <span className={`text-sm md:text-base font-medium ${step === 2 ? 'text-blue-600' : 'text-gray-500'}`}>Task Details</span>
                    </div>
                </div>

                {/* STEP 1: SELECT USERS */}
                {step === 1 && (
                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border flex flex-col flex-1 max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-220px)]">
                        {/* Filters */}
                        <div className="flex-none flex flex-col md:flex-row gap-4 mb-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search by name..." 
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <select onChange={(e) => setDeptFilter(e.target.value)} className="flex-1 md:flex-none border p-2 rounded-lg outline-none bg-white">
                                    <option value="">All Depts</option>
                                    <option value="CM">CM</option>
                                    <option value="IF">IF</option>
                                    <option value="EJ">EJ</option>
                                </select>
                                <select onChange={(e) => setRoleFilter(e.target.value)} className="flex-1 md:flex-none border p-2 rounded-lg outline-none bg-white">
                                    <option value="">All Roles</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="clerk">Clerk</option>
                                </select>
                            </div>
                        </div>

                        {/* User List */}
                        <div className="flex-1 overflow-y-auto rounded-lg border border-gray-100 min-h-0">
                            {/* Desktop View */}
                            <table className="hidden md:table w-full text-left">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3 border-b shadow-sm">Select</th>
                                        <th className="p-3 border-b shadow-sm">Name</th>
                                        <th className="p-3 border-b shadow-sm">Role</th>
                                        <th className="p-3 border-b shadow-sm">Department</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="border-b hover:bg-gray-50 transition cursor-pointer" onClick={() => toggleUser(user.id)}>
                                            <td className="p-3">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedUsers.includes(user.id)}
                                                    readOnly
                                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="p-3 font-medium">{user.name}</td>
                                            <td className="p-3 capitalize text-gray-600">{user.role}</td>
                                            <td className="p-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">{user.department}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Mobile View */}
                            <div className="md:hidden space-y-2 p-2 bg-gray-50">
                                {filteredUsers.map(user => (
                                    <div 
                                        key={user.id} 
                                        onClick={() => toggleUser(user.id)}
                                        className={`p-4 rounded-lg border flex items-center justify-between cursor-pointer transition shadow-sm ${selectedUsers.includes(user.id) ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{user.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user.role} • <span className="font-medium text-blue-600">{user.department}</span></p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${selectedUsers.includes(user.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                                            {selectedUsers.includes(user.id) && <Check size={14} className="text-white"/>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex-none mt-4 pt-4 border-t flex justify-between items-center bg-white">
                            <span className="text-gray-600 font-medium text-sm md:text-base">{selectedUsers.length} selected</span>
                            <button 
                                onClick={() => selectedUsers.length > 0 ? setStep(2) : alert('Select at least one user')}
                                className={`px-6 py-3 text-white rounded-lg transition font-medium shadow-sm ${selectedUsers.length > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: TASK DETAILS */}
                {step === 2 && (
                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border flex flex-col flex-1 overflow-y-auto">
                        <div className="space-y-6">
                            
                            {/* NEW: Category and Heading Dropdowns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Category <span className="text-red-500">*</span></label>
                                    <select 
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                                        value={taskData.category}
                                        onChange={handleCategoryChange}
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {Object.keys(TASK_CATEGORIES).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Heading <span className="text-red-500">*</span></label>
                                    <select 
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                                        value={taskData.heading}
                                        onChange={(e) => setTaskData({...taskData, heading: e.target.value})}
                                        disabled={!taskData.category} // Disabled until category is selected
                                    >
                                        <option value="" disabled>
                                            {taskData.category ? 'Select Task' : 'Select Category First'}
                                        </option>
                                        {taskData.category && TASK_CATEGORIES[taskData.category].map(task => (
                                            <option key={task} value={task}>{task}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea 
                                    rows="3" 
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    value={taskData.description}
                                    onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                                    placeholder="Enter additional details..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer bg-white"
                                        value={taskData.end_date}
                                        onChange={(e) => setTaskData({...taskData, end_date: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (Optional)</label>
                                    <div className="relative border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition cursor-pointer bg-gray-50 md:bg-white">
                                        <input 
                                            type="file" 
                                            multiple 
                                            onChange={handleFileChange} 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <Paperclip size={24} className="text-gray-400 mb-2"/>
                                        <span className="text-sm text-gray-500 text-center">Tap to attach files</span>
                                    </div>

                                    {taskData.files.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {taskData.files.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border text-sm">
                                                    <div className="flex items-center gap-2 truncate overflow-hidden">
                                                        <FileText size={16} className="text-blue-500 flex-shrink-0"/>
                                                        <span className="truncate max-w-[150px] md:max-w-[200px]">{file.name}</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => removeFile(index)}
                                                        className="text-gray-400 hover:text-red-500 transition p-1"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-6 border-t mt-auto">
                            <button 
                                onClick={() => setStep(1)} 
                                className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium text-sm md:text-base"
                            >
                                Back
                            </button>
                            <button 
                                onClick={handleSubmit}
                                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition font-medium text-sm md:text-base"
                            >
                                Assign Task
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminTasks;