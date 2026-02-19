const Footer = () => {
  return (
    <footer className="w-full bg-[#1E214F] border-t border-[#982598]/30 text-[#F1E9E9]/80 px-6 py-5 mt-auto">

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">

        {/* Brand */}
        <div className="flex items-center gap-2 text-sm sm:text-base">
          <span className="font-semibold bg-gradient-to-r from-[#982598] to-[#E491C9] bg-clip-text text-transparent">
            DevTinder
          </span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>

        {/* Social */}
        <div className="flex items-center gap-5">

          <a
            href="#"
            className="hover:text-[#E491C9] transition-transform hover:scale-110"
          >
            {/* Twitter/X */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 4.557a9.93 9.93 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.918 4.918 0 00-8.384 4.482A13.955 13.955 0 011.671 3.149a4.822 4.822 0 001.523 6.574 4.9 4.9 0 01-2.229-.616v.061a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.224.085 4.936 4.936 0 004.604 3.417A9.867 9.867 0 010 19.54a13.94 13.94 0 007.548 2.212c9.142 0 14.307-7.721 13.995-14.646A9.936 9.936 0 0024 4.557z" />
            </svg>
          </a>

          <a
            href="#"
            className="hover:text-[#E491C9] transition-transform hover:scale-110"
          >
            {/* YouTube */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z" />
            </svg>
          </a>

          <a
            href="#"
            className="hover:text-[#E491C9] transition-transform hover:scale-110"
          >
            {/* Facebook */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.378 14.192 5 15.115 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z" />
            </svg>
          </a>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
