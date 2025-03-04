import React, { useState, useEffect } from "react";
import logo from './assets/primary_white.png';
import { Helmet } from "react-helmet";
import Login from "./components/Login";
import StudentFilter from "./components/StudentFilter";

// var authenticated = false; // For demo purposes of the login page

const App = () => {
  const [authenticated, setAuthenticated] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        setUser(data);
        setAuthenticated(data.user_id ? true : false);
      } catch (err) {
        setAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (authenticated === null) {
    return <div>Loading...</div>
  }
  if (authenticated === false) {
    return <Login />;
  }

  const getContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div>
            <header className="mb-12">
              <h2 className="text-3xl font-bold text-center text-gray-800">Welcome Back, {user.first_name}</h2>
              <p className="text-gray-600 text-center">Query student information and generate reports.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">Student Lookup</h3>
                <p className="text-gray-600 text-center mb-4">
                  Search for students by name, ID, department, major, minor, GPA, or previous classes.
                </p>
                <div className="flex justify-center">
                  <button className="bg-blue-950 text-white px-4 py-2 rounded hover:bg-blue-900" onClick={() => setActiveTab('Student Lookup')}>
                    Search Students
                  </button></div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">Class Lookup</h3>
                <p className="text-gray-600 text-center mb-4">
                  Query and view specific students from a particular class.
                </p>
                <div className="flex justify-center">
                  <button className="bg-blue-950 text-white px-4 py-2 rounded hover:bg-blue-900" onClick={() => setActiveTab('Generate Reports')}>
                    Search Classes
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">Generate Reports</h3>
                <p className="text-gray-600 text-center mb-4">
                  Create custom reports for student or department data.
                </p>
                <div className="flex justify-center">
                  <button className="bg-blue-950 text-white px-4 py-2 rounded hover:bg-blue-900" onClick={() => setActiveTab('Generate Reports')}>
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Student Lookup':
        return <StudentFilter/>
      case 'Generate Reports':
        return <div>Any content related to generating reports goes here...</div>;
      case 'Settings':
        return <div>Any content related to settings goes here...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Helmet>
        <title>COBIS Application - Murray State University</title>
      </Helmet>
      {/* Left Side Navigation Bar */}
      <div className="w-64 bg-blue-950 text-white p-6 flex flex-col justify-between">
        <div>
          <img src={logo} alt="Logo" className="mx-auto mb-2 w-96 h-auto" />
          <h1 className="text-sm text-center text-gray-300 font-bold">COBIS Tool v0.1</h1>
          <hr className="mb-8"></hr>
          <nav>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className={`block p-2 text-center rounded ${activeTab === 'Dashboard' ? 'bg-blue-900' : 'hover:bg-blue-900'}`}
                  onClick={() => setActiveTab('Dashboard')}
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`block p-2 text-center rounded ${activeTab === 'Student Lookup' ? 'bg-blue-900' : 'hover:bg-blue-900'}`}
                  onClick={() => setActiveTab('Student Lookup')}
                >
                  Student Lookup
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`block p-2 text-center rounded ${activeTab === 'Generate Reports' ? 'bg-blue-900' : 'hover:bg-blue-900'}`}
                  onClick={() => setActiveTab('Generate Reports')}
                >
                  Generate Reports
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`block p-2 text-center rounded ${activeTab === 'Settings' ? 'bg-blue-900' : 'hover:bg-blue-900'}`}
                  onClick={() => setActiveTab('Settings')}
                >
                  Settings
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        {getContent()}
      </div>
    </div>
  );
};

export default App;