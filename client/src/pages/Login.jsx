import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import AuthContext from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react'; // 1. Import Icons

const Login = () => {
    const { login, user, loading } = useContext(AuthContext);
    const navigate = useNavigate(); 

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // 2. State for toggle

    // 1. AUTO-REDIRECT
    useEffect(() => {
        if (!loading && user) {
            if (user.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [user, loading, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        login(phone, password);
    };

    if (loading) return null; 

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-blue-600">Task Manager</h1>
                    <p className="text-gray-500 mt-2">Sign in to your account</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Enter your phone number"
                            className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <div className="relative mt-1"> {/* Relative container needed for absolute positioning */}
                            <input 
                                type={showPassword ? "text" : "password"} // 3. Dynamic Type
                                required 
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none pr-12" // Added pr-12 for space
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            
                            {/* 4. Eye Button */}
                            <button
                                type="button" // Prevent form submission
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-blue-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold shadow-md"
                    >
                        Login
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Login;