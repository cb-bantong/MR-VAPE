import Header from "../components/Header";

export default function Contact() {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col antialiased relative overflow-hidden">
      {/* Decorative background glows matching the logo */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-2/3 w-[300px] h-[300px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-20 z-10 space-y-12">
        {/* Header Text */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.25)]">Touch</span>
          </h2>
          <p className="text-sm md:text-base text-slate-400">
            Have questions or want to reach out? Check our contact details below or visit our official social media channels.
          </p>
        </div>

        {/* Content Layout: Symmetric columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Column 1: Direct Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-900 pb-3 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>Shop Information</span>
            </h3>

            {/* Address */}
            <div className="glass-panel border border-slate-900 rounded-2xl p-5 flex items-start space-x-4">
              <div className="p-3 bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 rounded-xl shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Address</h4>
                <p className="text-sm text-slate-200 font-semibold leading-relaxed">
                  Mac&Kays Bakery - Alley 2 Baesa, Quezon City, Philippines, 1106
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="glass-panel border border-slate-900 rounded-2xl p-5 flex items-start space-x-4">
              <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Phone Number</h4>
                <a href="tel:+6309771575010" className="block text-sm text-slate-200 font-semibold hover:text-cyan-400 transition truncate">
                  +63 0977 157 5010
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="glass-panel border border-slate-900 rounded-2xl p-5 flex items-start space-x-4">
              <div className="p-3 bg-pink-600/10 border border-pink-500/20 text-pink-400 rounded-xl shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Email Address</h4>
                <a href="mailto:alrizzamhae22@gmail.com" className="block text-sm text-slate-200 font-semibold hover:text-pink-400 transition truncate">
                  alrizzamhae22@gmail.com
                </a>
              </div>
            </div>

            {/* Open Hours */}
            <div className="glass-panel border border-slate-900 rounded-2xl p-5 flex items-start space-x-4">
              <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Open Hours</h4>
                <p className="text-sm text-slate-200 font-semibold">
                  10:00 am - 9:00 pm
                </p>
              </div>
            </div>

          </div>

          {/* Column 2: Social Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-900 pb-3 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
              <span>Social Channels & Management</span>
            </h3>

            {/* Facebook Shop Page */}
            <div className="glass-panel border border-slate-900 rounded-2xl p-6 flex flex-col justify-between h-[156px]">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center font-bold text-xl select-none">
                    f
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">M.R Vapeshop II</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Official Facebook Page</p>
                  </div>
                </div>
              </div>
              <a
                href="https://www.facebook.com/profile.php?id=61580296598261"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/10 transition duration-200"
              >
                Send Message on Facebook
              </a>
            </div>

            {/* Owner Facebook Profile */}
            <div className="glass-panel border border-slate-900 rounded-2xl p-6 flex flex-col justify-between h-[156px]">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl flex items-center justify-center font-bold text-xl select-none">
                    👤
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Alrizza Mhae Sienna</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Owner & Administrator</p>
                  </div>
                </div>
              </div>
              <a
                href="https://www.facebook.com/alrzamhe22"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/25 hover:text-indigo-400 text-slate-300 font-bold rounded-xl text-xs transition duration-200"
              >
                Contact Owner Profile
              </a>
            </div>

          </div>

        </div>

      </main>

      <footer className="w-full border-t border-slate-900 py-6 text-center text-xs text-slate-600 mt-auto">
        <p>© 2026 MRVAPE Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
