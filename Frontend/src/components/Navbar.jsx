import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const handleProfile = () => {

  };

  return (
    <nav className="md:fixed md:top-0.5 md:left-1 md:right-1 z-50 md:p-0 bg-linear-to-r md:rounded-4xl rounded-2xl bg-[#162f7a] border-b-4 border-amber-400 shadow-xl">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between ">

        <div className="flex items-center space-x-2">
          
          <div className=" rounded-tl-2xl rounded-br-2xl px-2 py-1 backdrop-blur-sm flex flex-row  items-center">
            <span className="text-lg md:text-3xl font-serif font-bold tracking-wider text-amber-100 drop-shadow-md">
              CivicPulse Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={handleProfile}
            className="flex items-center gap-2 md:px-4 md:py-2 px-2 py-1 rounded-full bg-amber-100 text-red-900 font-bold border-2 border-amber-400 shadow-sm hover:bg-red-900 hover:text-amber-200 hover:shadow-lg hover:scale-105 transition-all duration-300"
          >

            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Profile</span>
          </button>
          
          <button
            type="button"
            onClick={handleLogout}
            className="md:px-5 md:py-2 px-2.5 py-1 rounded-full bg-red-900 text-amber-50 font-semibold border border-red-700 shadow-md hover:bg-red-950 hover:text-white hover:border-amber-400 transition-all duration-300"
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
}