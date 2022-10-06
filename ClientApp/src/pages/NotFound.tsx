import React from 'react';
import { useNavigate } from 'react-router-dom';

export function NotFound() {
    const navigate = useNavigate();

    const handleClick = (e:any) => {
        e.preventDefault();
        navigate('/');
      };

    return (
        <div className="bg-gradient-to-r from-blue-300 to-cyan-200">
        <div className="w-9/12 m-auto py-16 min-h-screen flex items-center justify-center">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg pb-8">
        <div className="border-t border-black-200 text-center pt-8">
        <h1 className="text-9xl font-bold text-blue-400">404</h1>
        <h1 className="text-6xl font-medium py-8">oops! Page not found</h1>
        <p className="text-2xl pb-8 px-12 font-medium">Oops! The page you are looking for does not exist. It might have been moved or deleted.</p>
        <button onClick={handleClick} className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-red-500 hover:to-orange-500 text-white font-semibold px-6 py-3 rounded-md mr-6">
        HOME
        </button>
        <button className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-500 text-white font-semibold px-6 py-3 rounded-md">
        Contact Us
        </button>
        </div>
        </div>
        </div>
        </div>
      );
}