import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar receives the open state and the toggle function */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            
            <div className="flex-1 flex flex-col h-full w-full relative">
                {/* === MOBILE HEADER === */}
                {/* md:hidden ensures this only shows on mobile */}
                <div className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between z-30 relative">
                    {/* Logo on Left */}
                    <h1 className="text-xl font-bold text-blue-600">GPS TaskSystem</h1>
                    
                    {/* Three Lines (Hamburger) on RIGHT */}
                    <button 
                        onClick={toggleSidebar} 
                        className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition"
                    >
                        <Menu size={28} />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;