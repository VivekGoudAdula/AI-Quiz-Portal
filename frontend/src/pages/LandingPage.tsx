import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Lock, Monitor, User, Shield, ClipboardCheck, BarChart2, Cloud, ArrowRightCircle } from 'lucide-react';
import ExamsPreparationAnimation from '../components/ExamsPreparationAnimation';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#e0e7ff] via-white to-[#f3e8ff] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-[Montserrat,sans-serif]">
      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-r from-blue-400/30 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-center gap-12">
          <div className="flex-1 flex flex-col items-center md:items-end">
            <h1 className="text-6xl font-extrabold bg-gradient-to-r from-[#0093E9] via-[#7928CA] to-[#FF61A6] bg-clip-text text-transparent mb-4 drop-shadow-lg">
              Proctored Online Quiz Portal
            </h1>
            <p className="text-2xl font-semibold mb-10 max-w-2xl mx-auto bg-gradient-to-r from-[#0093E9] via-[#7928CA] to-[#FF61A6] bg-clip-text text-transparent">
              Secure, Browser-Based Online Assessments with Real-Time Proctoring
            </p>
            <div className="flex gap-6 justify-center mb-12 w-full md:w-auto mx-auto">
              <button onClick={() => navigate('/login')} className="px-10 py-4 bg-[#0093E9] hover:bg-[#2563eb] text-white font-bold rounded-xl shadow-xl flex items-center gap-2 text-xl transition-all focus:outline-none focus:ring-4 focus:ring-[#0093E9]/40 hover:scale-105 active:scale-95">
                <LogIn size={24} /> Login
              </button>
              <button onClick={() => navigate('/signup')} className="px-10 py-4 bg-gradient-to-r from-[#7928CA] to-[#FF61A6] hover:from-[#7e22ce] hover:to-[#db2777] text-white font-bold rounded-xl shadow-xl flex items-center gap-2 text-xl transition-all focus:outline-none focus:ring-4 focus:ring-[#7928CA]/40 hover:scale-105 active:scale-95">
                <UserPlus size={24} /> Get Started
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <ExamsPreparationAnimation />
          </div>
        </div>
      </section>

      {/* WHY THIS PLATFORM? */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#f8fafc] via-[#f3e8ff] to-[#e0e7ff] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-t border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-[#0093E9] via-[#7928CA] to-[#FF61A6] bg-clip-text text-transparent drop-shadow-lg">Why This Platform?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Problem Card */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-[#0093E9]/90 via-[#7928CA]/90 to-[#FF61A6]/90 border border-[#0093E9]/30 shadow-2xl rounded-3xl p-10 text-center flex flex-col items-center transition-transform hover:scale-105 hover:shadow-blue-200/40">
            <span className="text-6xl mb-6 animate-bounce-slow text-white drop-shadow">❌</span>
            <h3 className="text-3xl font-extrabold text-white mb-6 drop-shadow">The Problem</h3>
            <ul className="space-y-4 text-white font-bold text-xl drop-shadow">
              <li>Cheating in online exams</li>
              <li>No monitoring in basic quizzes</li>
              <li>Manual evaluation delays</li>
            </ul>
          </div>
          {/* Solution Card */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-[#0093E9]/90 via-[#7928CA]/90 to-[#FF61A6]/90 border border-[#0093E9]/30 shadow-2xl rounded-3xl p-10 text-center flex flex-col items-center transition-transform hover:scale-105 hover:shadow-blue-200/40">
            <span className="text-6xl mb-6 animate-bounce-slow text-white drop-shadow">➡️</span>
            <h3 className="text-3xl font-extrabold text-white mb-6 drop-shadow">Our Solution</h3>
            <ul className="space-y-4 text-white font-bold text-xl drop-shadow">
              <li className="flex items-center gap-2"><span className="text-green-300">✔</span> Browser-based proctoring</li>
              <li className="flex items-center gap-2"><span className="text-green-300">✔</span> Automated evaluation</li>
              <li className="flex items-center gap-2"><span className="text-green-300">✔</span> Real-time analytics</li>
            </ul>
          </div>
        </div>
      </section>

      {/* KEY FEATURES */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#e0e7ff] via-[#f3e8ff] to-[#f8fafc] dark:from-gray-900 dark:to-gray-800">
        <h2 className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-[#0093E9] via-[#7928CA] to-[#FF61A6] bg-clip-text text-transparent drop-shadow-lg">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="backdrop-blur-2xl bg-gradient-to-br from-[#0093E9]/70 via-[#7928CA]/60 to-[#FF61A6]/60 border border-white/20 shadow-2xl rounded-3xl p-8 flex flex-col items-center glass-card hover:scale-105 transition-transform group">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 mb-4 border border-white/30 group-hover:shadow-lg">
              <Shield className="text-[#0093E9]" size={36} />
            </div>
            <span className="font-bold text-lg text-white drop-shadow">Secure Login & Role-Based Access</span>
          </div>
          {/* Feature 2 */}
          <div className="backdrop-blur-2xl bg-gradient-to-br from-[#7928CA]/70 via-[#0093E9]/60 to-[#FF61A6]/60 border border-white/20 shadow-2xl rounded-3xl p-8 flex flex-col items-center glass-card hover:scale-105 transition-transform group">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 mb-4 border border-white/30 group-hover:shadow-lg">
              <Monitor className="text-[#7928CA]" size={36} />
            </div>
            <span className="font-bold text-lg text-white drop-shadow">Fullscreen Exam Mode</span>
          </div>
          {/* Feature 3 */}
          <div className="backdrop-blur-2xl bg-gradient-to-br from-[#FF61A6]/70 via-[#0093E9]/60 to-[#7928CA]/60 border border-white/20 shadow-2xl rounded-3xl p-8 flex flex-col items-center glass-card hover:scale-105 transition-transform group">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 mb-4 border border-white/30 group-hover:shadow-lg">
              <ClipboardCheck className="text-[#FF61A6]" size={36} />
            </div>
            <span className="font-bold text-lg text-white drop-shadow">Tab Switch & Copy-Paste Detection</span>
          </div>
          {/* Feature 4 */}
          <div className="backdrop-blur-2xl bg-gradient-to-br from-[#0093E9]/70 via-[#FF61A6]/60 to-[#7928CA]/60 border border-white/20 shadow-2xl rounded-3xl p-8 flex flex-col items-center glass-card hover:scale-105 transition-transform group">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 mb-4 border border-white/30 group-hover:shadow-lg">
              <Lock className="text-[#0093E9]" size={36} />
            </div>
            <span className="font-bold text-lg text-white drop-shadow">Auto Submit on Violations</span>
          </div>
          {/* Feature 5 */}
          <div className="backdrop-blur-2xl bg-gradient-to-br from-[#7928CA]/70 via-[#FF61A6]/60 to-[#0093E9]/60 border border-white/20 shadow-2xl rounded-3xl p-8 flex flex-col items-center glass-card hover:scale-105 transition-transform group">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 mb-4 border border-white/30 group-hover:shadow-lg">
              <BarChart2 className="text-[#7928CA]" size={36} />
            </div>
            <span className="font-bold text-lg text-white drop-shadow">Instant Results & Analytics</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900 border-t border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">How It Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 max-w-4xl mx-auto">
          <div className="flex flex-col items-center">
            <UserPlus className="text-blue-600 mb-3" size={40} />
            <span className="font-semibold text-lg">Instructor creates & assigns quiz</span>
          </div>
          <ArrowRightCircle className="text-gray-400 hidden md:block" size={44} />
          <div className="flex flex-col items-center">
            <User className="text-purple-600 mb-3" size={40} />
            <span className="font-semibold text-lg">Student attempts exam in proctored mode</span>
          </div>
          <ArrowRightCircle className="text-gray-400 hidden md:block" size={44} />
          <div className="flex flex-col items-center">
            <BarChart2 className="text-pink-600 mb-3" size={40} />
            <span className="font-semibold text-lg">System evaluates & shows analytics</span>
          </div>
        </div>
      </section>

      {/* WHO CAN USE THIS? */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <h2 className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-[#0093E9] via-[#7928CA] to-[#FF61A6] bg-clip-text text-transparent drop-shadow-lg">Who Can Use This?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Students Card */}
          <div className="backdrop-blur-2xl bg-gradient-to-br from-[#0093E9]/80 via-[#7928CA]/70 to-[#FF61A6]/70 border border-white/20 shadow-2xl rounded-3xl p-10 flex flex-col items-center hover:scale-105 transition-transform group">
            <span className="text-6xl mb-4 drop-shadow-lg">🎓</span>
            <span className="font-extrabold text-2xl text-white drop-shadow mb-2">Students</span>
            <span className="text-lg text-white/80 text-center">Take secure online exams</span>
          </div>
          {/* Instructors Card */}
          <div className="backdrop-blur-2xl bg-gradient-to-br from-[#7928CA]/80 via-[#0093E9]/70 to-[#FF61A6]/70 border border-white/20 shadow-2xl rounded-3xl p-10 flex flex-col items-center hover:scale-105 transition-transform group">
            <span className="text-6xl mb-4 drop-shadow-lg">👩‍🏫</span>
            <span className="font-extrabold text-2xl text-white drop-shadow mb-2">Instructors</span>
            <span className="text-lg text-white/80 text-center">Create & monitor quizzes</span>
          </div>
          {/* Institutions Card */}
          <div className="backdrop-blur-2xl bg-gradient-to-br from-[#FF61A6]/80 via-[#0093E9]/70 to-[#7928CA]/70 border border-white/20 shadow-2xl rounded-3xl p-10 flex flex-col items-center hover:scale-105 transition-transform group">
            <span className="text-6xl mb-4 drop-shadow-lg">🏫</span>
            <span className="font-extrabold text-2xl text-white drop-shadow mb-2">Institutions</span>
            <span className="text-lg text-white/80 text-center">Conduct remote assessments</span>
          </div>
        </div>
      </section>

      {/* SECURITY & TRUST */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900 border-t border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Security & Trust</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <ul className="space-y-5 text-gray-700 dark:text-gray-200 text-xl">
            <li>• Fullscreen enforcement</li>
            <li>• Tab-switch monitoring</li>
            <li>• Clipboard restrictions</li>
            <li>• Violation logging</li>
          </ul>
          <div className="flex flex-col justify-center items-start">
            <span className="text-green-600 dark:text-green-400 font-semibold mb-3 text-lg">No external plugins. No third-party software.</span>
            <span className="text-gray-500 dark:text-gray-400 text-base">All proctoring is browser-based for maximum security and privacy.</span>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-16 px-4 text-center bg-gradient-to-r from-blue-700 to-purple-700">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-lg">Ready to start your secure online exam?</h2>
        <div className="flex gap-6 justify-center">
          <button onClick={() => navigate('/login')} className="px-10 py-4 bg-white text-blue-700 font-bold rounded-xl shadow-xl flex items-center gap-2 text-xl transition-all hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-300">
            <LogIn size={24} /> Login
          </button>
          <button onClick={() => navigate('/signup')} className="px-10 py-4 bg-white text-purple-700 font-bold rounded-xl shadow-xl flex items-center gap-2 text-xl transition-all hover:bg-purple-50 focus:outline-none focus:ring-4 focus:ring-purple-300">
            <UserPlus size={24} /> Sign Up
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-4 bg-gray-100 dark:bg-gray-900 text-center text-gray-600 dark:text-gray-400 text-base mt-auto border-t border-gray-200 dark:border-gray-800 animate-fade-in delay-300">
        <div className="mb-2 font-bold text-lg animate-slide-up">Proctored Online Quiz Portal</div>
        <div>Developed by: Vishnu Vardhan Polla, Vivek Goud Adula</div>
      </footer>
      {/* Custom Animations */}
      <style>{`
        .animate-gradient-move {
          animation: gradientMove 8s ease-in-out infinite alternate;
        }
        @keyframes gradientMove {
          0% { transform: translateX(-50%) scale(1); }
          100% { transform: translateX(-40%) scale(1.08); }
        }
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 1.2s ease forwards;
        }
        .animate-fade-in.delay-100 { animation-delay: 0.1s; }
        .animate-fade-in.delay-200 { animation-delay: 0.2s; }
        .animate-fade-in.delay-300 { animation-delay: 0.3s; }
        .animate-fade-in.delay-400 { animation-delay: 0.4s; }
        .animate-fade-in.delay-500 { animation-delay: 0.5s; }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        .animate-slide-up {
          opacity: 0;
          transform: translateY(40px);
          animation: slideUp 1s cubic-bezier(.4,2,.6,1) forwards;
        }
        @keyframes slideUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-bounce-slow {
          animation: bounceSlow 2.5s infinite;
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
