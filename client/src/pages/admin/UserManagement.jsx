import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import API from '../../utils/api';
import { Trash2, UserPlus, Edit, Download, Search, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    
    // Filters
    const [roleFilter, setRoleFilter] = useState('');
    const [deptFilter, setDeptFilter] = useState('');

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', phone_number: '', email: '', password: '', role: 'faculty', department: 'CM', gender: 'Male'
    });

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await API.get('/auth/users');
            setUsers(data);
        } catch (err) { console.error("Failed to load users"); }
    };

    // Handle Create or Update
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await API.put(`/auth/${editId}`, formData);
                alert("User Updated Successfully!");
                setIsEditing(false);
                setEditId(null);
            } else {
                await API.post('/auth/register', formData);
                alert("User Added Successfully!");
            }
            
            fetchUsers(); // Refresh
            setFormData({ name: '', phone_number: '', email: '', password: '', role: 'faculty', department: 'CM', gender: 'Male' });
        } catch (err) {
            alert(err.response?.data?.error || "Operation Failed");
        }
    };

    const handleEdit = (user) => {
        setFormData({
            name: user.name,
            phone_number: user.phone_number,
            email: user.email || '', // Populate Email
            password: user.password,
            role: user.role,
            department: user.department,
            gender: user.gender
        });
        setEditId(user.id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await API.delete(`/auth/${id}`);
            fetchUsers();
        } catch (err) { alert("Failed to delete user"); }
    };

    // Filter Logic
    const filteredUsers = users.filter(user => {
        return (
            (user.name.toLowerCase().includes(search.toLowerCase()) || 
             (user.email && user.email.toLowerCase().includes(search.toLowerCase()))) &&
            (roleFilter === '' || user.role === roleFilter) &&
            (deptFilter === '' || user.department === deptFilter)
        );
    });

    // Excel Export Logic
    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredUsers);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, "User_List.xlsx");
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({ name: '', phone_number: '', email: '', password: '', role: 'faculty', department: 'CM', gender: 'Male' });
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                    <button 
                        onClick={exportToExcel}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        <Download size={18} /> Export Excel
                    </button>
                </div>

                {/* Add / Edit User Form */}
                <div className={`p-6 rounded-xl shadow-sm border transition-colors ${isEditing ? 'bg-yellow-50 border-yellow-200' : 'bg-white'}`}>
                    <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${isEditing ? 'text-yellow-700' : 'text-gray-800'}`}>
                        {isEditing ? <Edit size={20}/> : <UserPlus size={20}/>} 
                        {isEditing ? "Edit User" : "Add New User"}
                    </h2>
                    
                    {/* Changed grid layout to md:grid-cols-4 to fit the new email field nicely */}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input type="text" placeholder="Full Name" required className="p-2 border rounded"
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        
                        <input type="text" placeholder="Phone Number" required className="p-2 border rounded"
                            value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
                        
                        <input type="email" placeholder="Email Address" required className="p-2 border rounded"
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        
                        <input type="text" placeholder="Password (Clear Text)" required className="p-2 border rounded"
                            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />

                        <select className="p-2 border rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="faculty">Faculty</option>
                            <option value="clerk">Clerk</option>
                        </select>

                        <select className="p-2 border rounded" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                            <option value="CM">CM</option><option value="IF">IF</option><option value="EJ">EJ</option>
                            <option value="EE">EE</option><option value="ME">ME</option><option value="CE">CE</option>
                        </select>

                        <select className="p-2 border rounded" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                            <option value="Male">Male</option><option value="Female">Female</option>
                        </select>

                        <div className="md:col-span-4 flex gap-3 mt-2">
                            <button type="submit" className={`flex-1 text-white py-2 rounded font-semibold transition ${isEditing ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {isEditing ? "Update User" : "Create User"}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={cancelEdit} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-lg border">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="text" placeholder="Search by name or email..." className="w-full pl-10 p-2 border rounded outline-none"
                            value={search} onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Filter className="absolute left-3 top-3 text-gray-400" size={16} />
                            <select className="pl-9 p-2 border rounded outline-none" onChange={(e) => setDeptFilter(e.target.value)}>
                                <option value="">All Depts</option>
                                <option value="CM">CM</option><option value="IF">IF</option><option value="EJ">EJ</option>
                            </select>
                        </div>
                        <select className="p-2 border rounded outline-none" onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="">All Roles</option>
                            <option value="faculty">Faculty</option>
                            <option value="clerk">Clerk</option>
                        </select>
                    </div>
                </div>

                {/* User List Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Phone</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Password</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Department</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="border-t hover:bg-gray-50">
                                    <td className="p-4 font-medium">{user.name}</td>
                                    <td className="p-4 text-gray-600">{user.phone_number}</td>
                                    <td className="p-4 text-gray-600 text-sm">{user.email || 'N/A'}</td>
                                    <td className="p-4 text-gray-500 font-mono text-sm bg-gray-50 rounded px-2">{user.password}</td>
                                    <td className="p-4 capitalize">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'faculty' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">{user.department}</span></td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <button onClick={() => handleEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && <p className="p-6 text-center text-gray-500">No users found.</p>}
                </div>
            </div>
        </Layout>
    );
};

export default UserManagement;