import { LayoutDashboard, Users, ClipboardList, LogOut, Activity, Home, List, Bell, X, Send } from 'lucide-react';
import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Admin Menu Items
    const adminMenu = [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'Task Manager', path: '/admin/tasks', icon: <ClipboardList size={20} /> },
        { name: 'Monitoring', path: '/admin/monitoring', icon: <Activity size={20} /> },
        { name: 'Notifications', path: '/admin/send-notification', icon: <Send size={20} /> },
        { name: 'User Management', path: '/admin/users', icon: <Users size={20} /> },
    ];

    // 2. User (Faculty/Clerk) Menu Items
    const userMenu = [
        { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
        { name: 'My Tasks', path: '/dashboard/tasks', icon: <List size={20} /> },
        { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell size={20} /> },
    ];

    // 3. Choose menu based on role
    const menu = user?.role === 'admin' ? adminMenu : userMenu;

    return (
        <>
            {/* Mobile Overlay (Dark background) */}
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={toggleSidebar}
            ></div>

            {/* Sidebar Container */}
            {/* CHANGED: 
                - 'left-0' -> 'right-0' (Fixes position to right side)
                - '-translate-x-full' -> 'translate-x-full' (Hides it to the right when closed)
            */}
            <div className={`
                fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-xl flex flex-col 
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : 'translate-x-full'} 
                md:static md:translate-x-0
            `}>
                <div className="p-6 text-center border-b flex justify-between items-center md:block">
                    {/* Title Section */}
                    <div className="text-left md:text-center">
                        <h1 className="text-2xl font-bold text-blue-600">GPS TaskSystem</h1>
                        <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                    </div>

                    {/* Close Button (X) for Mobile */}
                    <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-red-500 transition">
                        <X size={24} />
                    </button>
                </div>
                
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menu.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => {
                                navigate(item.path);
                                if (window.innerWidth < 768) toggleSidebar(); 
                            }}
                            className={`flex items-center w-full px-4 py-3 space-x-3 rounded-lg transition-colors ${
                                location.pathname === item.path 
                                ? 'bg-blue-50 text-blue-600 font-medium' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t bg-gray-50 md:bg-white">
                    <button 
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 space-x-3 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;