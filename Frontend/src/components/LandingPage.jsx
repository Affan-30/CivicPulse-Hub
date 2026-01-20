import React from "react";
import { 
  ArrowRight, 
  CheckCircle, 
  MapPin, 
  Shield, 
  Zap, 
  BarChart2, 
  MessageSquare,
  Users
} from "react-feather";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LandingPage = () => {
  const navigate = useNavigate();

  // Animation Variants
  const fadeInDown = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-orange-500" />,
      title: "Swift Redressal",
      description: "Automated routing of grievances to the right department for 40% faster resolution."
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-500" />,
      title: "Transparent Tracking",
      description: "Real-time updates and status tracking for every complaint lodged."
    },
    {
      icon: <BarChart2 className="w-8 h-8 text-blue-500" />,
      title: "Data-Driven Governance",
      description: "Analytics-backed insights to help city officials identify and fix systemic issues."
    }
  ];

  const steps = [
    { number: "01", title: "Lodge", desc: "Report issues with photos and location." },
    { number: "02", title: "Track", desc: "Watch the progress in your live dashboard." },
    { number: "03", title: "Resolve", desc: "Verify the fix and provide your feedback." }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      
      {/* Navigation */}
      <motion.nav 
        initial="hidden"
        animate="visible"
        variants={fadeInDown}
        className="flex items-center justify-between px-5 py-3 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-2">
          <img
            src="/src/assets/hub-logo.png"
            alt="India"
            className="w-40 h-25 object-contain"
          />
          <span className="text-3xl md:text-5xl font-black tracking-tighter bg-linear-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            CivicPulse Hub
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-semibold text-gray-600">
          <a href="#features" className="hover:text-orange-500 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-orange-500 transition-colors">How it Works</a>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="px-6 py-2.5 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-all"
          >
            Login / SignUp
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-10 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
              <CheckCircle className="w-4 h-4" />
              Empowering 1M+ Citizens
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-black leading-[1.1] text-slate-900">
              Your Voice for a <br />
              <span className="bg-linear-to-r from-orange-500 via-amber-500 to-emerald-600 bg-clip-text text-transparent">
                Smarter City.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 leading-relaxed max-w-xl">
              CivicPulseHub bridges the gap between citizens and administration. 
              Report grievances, track resolutions in real-time.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0px 20px 30px rgba(249, 115, 22, 0.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-200 flex items-center justify-center gap-2"
              >
                Register Grievance <ArrowRight />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all"
              >
                Explore Dashboard
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Visual Element with Floating Animation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="relative bg-white/80 backdrop-blur-xl border border-white p-4 rounded-[2.5rem] shadow-2xl"
            >
              <img 
                src="/src/assets/dashboard-preview.png" 
                alt="Dashboard Preview" 
                className="rounded-4xl shadow-inner"
              />
              
              {/* Animated Floating Stat Card */}
              <motion.div 
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-orange-50 flex items-center gap-4"
              >
                <div className="p-3 bg-emerald-100 rounded-2xl">
                  <Users className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500">Resolved Today</p>
                  <p className="text-2xl font-black text-gray-800">1,284</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid with Scroll Reveal */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-6">Built for Modern Governance</h2>
            <p className="text-gray-600 text-lg">Our platform uses advanced heuristics to ensure no citizen is left unheard.</p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((f, i) => (
              <motion.div 
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all group"
              >
                <div className="mb-6 p-4 bg-gray-50 rounded-2xl w-fit group-hover:bg-orange-50 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works - Animated Steps */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ borderRadius: "100px", opacity: 0 }}
            whileInView={{ borderRadius: "48px", opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-linear-to-r from-slate-900 to-slate-800 p-12 md:p-20 text-white overflow-hidden relative"
          >
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-16 text-center">Three Steps to a Better City</h2>
              <div className="grid md:grid-cols-3 gap-12">
                {steps.map((s, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="relative text-center"
                  >
                    <span className="text-8xl font-black text-white/5 absolute -top-10 left-1/2 -translate-x-1/2">
                      {s.number}
                    </span>
                    <h4 className="text-2xl font-bold mb-4">{s.title}</h4>
                    <p className="text-slate-400">{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex justify-between items-center gap-1">
          <div className="flex items-center gap-2">
            <MapPin className="text-orange-500 w-5 h-5" />
            <span className="text-gray-600 font-extrabold text-xl tracking-tight">CivicPulseHub - Built for Smarter Governance</span>
          </div>
          <div className="text-gray-500 text-sm text-center items-center justify-center">
            © 2026 All rights reserved 
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;