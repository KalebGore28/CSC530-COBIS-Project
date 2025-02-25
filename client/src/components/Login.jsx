import React from 'react';
import logo from '../assets/primary_white.png';
import { Helmet } from 'react-helmet';

const Login = () => {
  const handleLogin = () => {
    // Redirect to the SSO login page
    window.location.href = `/api/auth/google`;
  };

  return (
    <div className="flex h-screen bg-blue-950">
      <Helmet>
        <title>COBIS Login - Murray State University</title>
      </Helmet>

      {/* Main Login Area */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <img src={logo} alt="Logo" className="mb-8 w-72 h-auto shadow-lg rounded-md" />
        <h1 className="text-2xl font-extrabold text-white text-center mb-4">COBIS Tool <span className="font-normal text-xl">(v0.1)</span></h1>
        <div className="bg-white p-10 rounded-xl shadow-2xl w-96 text-center">
          <h2 className="text-2xl font-semibold text-gray-750">Welcome to COBIS</h2>
          <h2 className="text-sm italic mb-6 text-gray-500">User authentication is required</h2>
          <p className="text-gray-600 mb-8">Please click the button below to log in.</p>
          <button
            className="bg-blue-950 text-white px-6 py-3 rounded-full shadow-md hover:bg-blue-900 transition-colors ease-in-out duration-300 transform hover:scale-105"
            onClick={handleLogin}
          >
            Login with SSO
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;