// File: client/src/pages/Login.jsx
import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Call the login function from AuthContext
        login(phone, password);
    };

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
                        <input 
                            type="password" 
                            required 
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold shadow-md"
                    >
                        Login
                    </button>
                </form>

                <div className="text-center text-sm text-gray-500">
                    <p>Demo Admin: 9999999999 / 12345</p>
                </div>
            </div>
        </div>
    );
};

export default Login;