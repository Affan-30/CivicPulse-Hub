import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  // New handler for the Profile button
  const handleProfile = () => {
    
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-orange-700 via-red-800 to-amber-900 border-b-4 border-amber-400 shadow-xl">
   <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between ">
        
        {/* Logo Section */}
        <div className="flex items-center space-x-2">
          
          <div className="bg-white/10 border border-amber-200/40 rounded-tl-2xl rounded-br-2xl px-4 py-2 backdrop-blur-sm">
            <span className="text-2xl md:text-3xl font-serif font-bold tracking-wider text-amber-50 drop-shadow-md">
              CivicPulse Hub
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          
          {/* New Profile Button */}
          <button
            type="button"
            onClick={handleProfile}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-red-900 font-bold border-2 border-amber-400 shadow-sm hover:bg-amber-200 hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            {/* Simple SVG User Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Profile</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="px-5 py-2 rounded-full bg-red-900 text-amber-50 font-semibold border border-red-700 shadow-md hover:bg-red-950 hover:text-white hover:border-amber-400 transition-all duration-300"
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
}