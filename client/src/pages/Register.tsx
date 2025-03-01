import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: ''
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [passwordError, setPasswordError] = useState('');
    const { register, loading, error } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        if (name === 'password' || name === 'password2') {
            setPasswordError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setFormErrors({});
        setPasswordError('');

        if (formData.password !== formData.password2) {
            setPasswordError("Passwords don't match");
            return;
        }

        const { password2, ...userData } = formData;

        try {
            await register(userData);
        } catch (err: any) {
            if (err.response?.data?.errors) {
                const apiErrors = err.response.data.errors;
                const fieldErrors: Record<string, string> = {};

                Object.keys(apiErrors).forEach(field => {
                    fieldErrors[field] = Array.isArray(apiErrors[field])
                        ? apiErrors[field][0]
                        : apiErrors[field];
                });

                setFormErrors(fieldErrors);
            }
        }
    };

    const hasError = (fieldName: string) => Boolean(formErrors[fieldName]);

    const getErrorMessage = (fieldName: string) => formErrors[fieldName] || '';

    const getInputClassName = (fieldName: string) => `
        appearance-none relative block w-full px-3 py-2 border 
        ${hasError(fieldName) ? 'border-red-500' : 'border-gray-300'} 
        placeholder-gray-500 text-gray-900 focus:outline-none 
        focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm
    `;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    {passwordError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{passwordError}</span>
                        </div>
                    )}

                    <div className="rounded-md shadow-sm space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    required
                                    className={getInputClassName('first_name')}
                                    placeholder="First Name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                                {hasError('first_name') && (
                                    <p className="mt-1 text-sm text-red-600">{getErrorMessage('first_name')}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    required
                                    className={getInputClassName('last_name')}
                                    placeholder="Last Name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                                {hasError('last_name') && (
                                    <p className="mt-1 text-sm text-red-600">{getErrorMessage('last_name')}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className={getInputClassName('username')}
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                            {hasError('username') && (
                                <p className="mt-1 text-sm text-red-600">{getErrorMessage('username')}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={getInputClassName('email')}
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {hasError('email') && (
                                <p className="mt-1 text-sm text-red-600">{getErrorMessage('email')}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className={getInputClassName('password')}
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {hasError('password') && (
                                <p className="mt-1 text-sm text-red-600">{getErrorMessage('password')}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input
                                id="password2"
                                name="password2"
                                type="password"
                                required
                                className={passwordError ? 'appearance-none relative block w-full px-3 py-2 border border-red-500 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm' : 'appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm'}
                                placeholder="Confirm Password"
                                value={formData.password2}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </>
                            ) : 'Register'}
                        </button>
                    </div>

                    <div className="text-sm text-center">
                        <Link to="/login" className="font-medium text-gray-600 hover:text-gray-500">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;