import Header from "../components/Header";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useState } from "react";

const MySwal = withReactContent(Swal);

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      MySwal.fire({
        title: "Validation Error",
        text: "Please fill in all required fields.",
        icon: "warning",
        background: "#0d121e",
        color: "#f3f4f6",
        confirmButtonText: "OK",
        buttonsStyling: false,
        customClass: {
          confirmButton:
            "px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/30 transition-all duration-200 outline-none text-sm cursor-pointer",
          popup: "border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md",
        },
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);

    await MySwal.fire({
      title: "Message Sent!",
      text: "Thank you for reaching out to MRVAPE. We will respond shortly.",
      icon: "success",
      background: "#0d121e",
      color: "#f3f4f6",
      confirmButtonText: "Okay",
      buttonsStyling: false,
      customClass: {
        confirmButton:
          "px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/30 transition-all duration-200 outline-none text-sm cursor-pointer",
        popup: "border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md",
      },
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
  };

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
            Have questions about our products, orders, or want to drop by? Contact us below or visit our shop!
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 gap-4">
              
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

              {/* Contact Details (Phone & Email) */}
              <div className="glass-panel border border-slate-900 rounded-2xl p-5 flex items-start space-x-4">
                <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Phone</h4>
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
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Working Hours</h4>
                  <p className="text-sm text-slate-200 font-semibold">
                    10:00 am - 9:00 pm
                  </p>
                </div>
              </div>

            </div>

            {/* Social & Owner Section */}
            <div className="glass-panel border border-slate-900 rounded-2xl p-6 space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-3">
                Social Pages & Management
              </h4>
              
              <div className="space-y-4">
                {/* Official Page */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center font-bold text-lg select-none">
                      f
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">M.R Vapeshop II</p>
                      <p className="text-[10px] text-slate-500">Official Facebook Page</p>
                    </div>
                  </div>
                  <a
                    href="https://www.facebook.com/profile.php?id=61580296598261"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-slate-950 border border-slate-850 hover:border-blue-500/35 hover:text-blue-400 rounded-xl text-xs font-bold transition duration-200"
                  >
                    Visit Page
                  </a>
                </div>

                {/* Owner */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl flex items-center justify-center font-bold text-lg select-none">
                      👤
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Alrizza Mhae Sienna</p>
                      <p className="text-[10px] text-slate-500">Owner & Administrator</p>
                    </div>
                  </div>
                  <a
                    href="https://www.facebook.com/alrzamhe22"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-slate-950 border border-slate-850 hover:border-indigo-500/35 hover:text-indigo-400 rounded-xl text-xs font-bold transition duration-200"
                  >
                    Contact Owner
                  </a>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel border border-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl relative">
              <h3 className="text-xl font-black text-white mb-2">Send us a Message</h3>
              <p className="text-xs text-slate-400 mb-6">
                Have inquiries? Send us a quick note and our team will get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400" htmlFor="name">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="w-full px-4 py-3 text-sm input-premium text-white placeholder-slate-600"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400" htmlFor="email">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="w-full px-4 py-3 text-sm input-premium text-white placeholder-slate-600"
                      placeholder="Your email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400" htmlFor="subject">
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    className="w-full px-4 py-3 text-sm input-premium text-white placeholder-slate-600"
                    placeholder="Subject of message"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400" htmlFor="message">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full px-4 py-3 text-sm input-premium text-white placeholder-slate-600 resize-none"
                    placeholder="Write your message details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mt-6"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending message...</span>
                    </>
                  ) : (
                    <span>Send Message</span>
                  )}
                </button>
              </form>
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
