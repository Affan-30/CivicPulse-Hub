import React, { useState } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Signup state
  const [name, setName] = useState('');
  const [role, setRole] = useState('USER');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  // NEW: Admin Officer fields (hidden by default)
  const [officerDepartment, setOfficerDepartment] = useState('');
  const [officerPhone, setOfficerPhone] = useState('');

  const navigate = useNavigate();
  const isValidEmail = (e) => /^\S+@\S+\.\S+$/.test(e);
  const minPassLen = 6;

  //Login Function
  const handleLogin = async (ev) => {
    ev.preventDefault();
    setLoginError('');

    if (!isValidEmail(loginEmail)) {
      setLoginError('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (!res.ok) {
        const text = await res.text();
        setLoginError(text || 'Login failed');
        return;
      }

      const data = await res.json();
      localStorage.setItem('jwtToken', data.token);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userRole', data.role);

      if (data.role === "ADMIN" || data.role === "ADMIN2") {
        navigate('/admindashboard');
      } else if (data.role === "OFFICER") {
        localStorage.setItem('officerId', data.id);        // ✅ NEW
        localStorage.setItem('officerDepartment', data.department);
        navigate('/officer-dashboard');
      }
      else {
        navigate('/dashboard');
      }
    } catch (err) {
      setLoginError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (ev) => {
    ev.preventDefault();
    setSignupError('');

    if (!isValidEmail(signupEmail)) {
      setSignupError('Please enter a valid email');
      return;
    }
    if (signupPassword.length < minPassLen) {
      setSignupError(`Password must be at least ${minPassLen} characters`);
      return;
    }
    if (signupPassword !== confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }

    // ✅ VALIDATE officer fields
    if (role === 'OFFICER' && (!officerDepartment || !officerPhone)) {
      setSignupError('Department and Phone are required for Admin Officer');
      return;
    }

    setLoading(true);
    try {
      // Build complete request object
      const signupData = {
        name,
        role,
        email: signupEmail,
        password: signupPassword
      };

      // ✅ ADD officer fields when OFFICER role
      if (role === 'OFFICER') {
        signupData.department = officerDepartment;
        signupData.phone = officerPhone;
      }

      console.log('Sending to backend:', signupData); // DEBUG

      const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)  // ✅ Now includes department!
      });

      if (!res.ok) {
        const text = await res.text();
        setSignupError(text || 'Signup failed');
      } else {
        setMode('login');
        setLoginEmail(signupEmail);
        alert('Registration Completed! Please login.');
      }
    } catch (err) {
      setSignupError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="loginmain min-h-screen flex flex-col items-center justify-center pt-0">
      <div className="left-0 right-0 flex justify-center pb-4 pt-0">
        <h2 className="text-5xl font-bold text-black bg-amber-500 rounded-3xl p-4 pt-2 pb-2">CivicPulse Hub</h2>
      </div>

      <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Login Page Image */}
        <div className="LoginPanel md:flex flex-col items-center justify-center p-8 text-white">
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-3xl font-semibold">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h3>
            <div className="text-sm">
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-orange-400 hover:underline pl-8"
              >
                {mode === 'login' ? 'New user? Sign up' : 'Have an account? Log in'}
              </button>
            </div>
          </div>

          {mode === 'login' ? (
            // LOGIN FORM (unchanged)
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                  required
                />
              </div>

              {loginError && <p className="text-sm text-red-600">{loginError}</p>}

              <div className="flex items-center justify-between">
                <label className="text-sm">
                  <input type="checkbox" className="mr-2" /> Remember me
                </label>
                <button type="button" className="text-sm text-orange-400 hover:underline">Forgot password?</button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 rounded-md bg-orange-500 text-white font-semibold disabled:opacity-60"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>

              <p className="text-xs text-center text-gray-500">By continuing you agree to our Terms & Privacy.</p>

            </form>
          ) : (
            // SIGNUP FORM with DYNAMIC OFFICER FIELDS
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    // Reset officer fields when not OFFICER
                    if (e.target.value !== 'OFFICER') {
                      // setOfficerDepartment('');
                      setOfficerPhone('');
                    }
                  }}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                  required
                >
                  <option value="USER">Citizen</option>
                  <option value="ADMIN">Admin</option>
                  <option value="OFFICER">Admin Officer</option>
                </select>
              </div>

              {/* NEW: Admin Officer Fields - SHOW ONLY WHEN SELECTED */}
              {role === 'OFFICER' && (
                <div className="space-y-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <h4 className="font-bold text-blue-900 text-lg">Officer Details</h4>

                  <div>
                    <label className="block text-sm font-medium mb-1">Department *</label>
                    <select
                      value={officerDepartment}
                      onChange={(e) => setOfficerDepartment(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Electricity">Electricity</option>
                      <option value="Roads">Roads</option>
                      <option value="Water">Water</option>
                      <option value="Sanitation">Sanitation</option>
                      <option value="Agriculture">Agriculture</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={officerPhone}
                      onChange={(e) => setOfficerPhone(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Password *</label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                    required
                  />
                </div>
              </div>

              {signupError && <p className="text-sm text-red-600 p-3 bg-red-50 border rounded-lg">{signupError}</p>}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-linear-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
