import React, { useState, useEffect } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Sun, 
  Wrench, 
  Users, 
  Award, 
  Clock, 
  Loader,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContexts';

const Home = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTopics: 0,
    solarProjects: 0,
    electricalProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Services data (static)
  const services = [
    { 
      icon: Sun, 
      title: 'Solar Installation', 
      desc: 'Residential & commercial solar panel systems', 
      color: 'from-amber-500 to-orange-500',
      link: '/solar'
    },
    { 
      icon: Zap, 
      title: 'Electrical Engineering', 
      desc: 'Wiring, panels, switchgear & automation', 
      color: 'from-blue-500 to-cyan-500',
      link: '/electrical'
    },
    { 
      icon: Wrench, 
      title: 'Maintenance & Repairs', 
      desc: 'Regular upkeep and emergency fixes', 
      color: 'from-emerald-500 to-teal-500',
      link: '/services'
    },
  ];

  // Fetch public stats only (no users/messages)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          projectsSnap,
          topicsSnap,
          solarSnap,
          electricalSnap
        ] = await Promise.all([
          getDocs(collection(db, "projects")),
          getDocs(collection(db, "topics")),
          getDocs(query(collection(db, "projects"), where("category", "==", "Solar"))),
          getDocs(query(collection(db, "projects"), where("category", "==", "Electrical"))),
        ]);

        setStats({
          totalProjects: projectsSnap.size,
          totalTopics: topicsSnap.size,
          solarProjects: solarSnap.size,
          electricalProjects: electricalSnap.size,
        });
        setError('');
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError('Failed to load stats. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Display stats
  const displayStats = [
    { icon: Users, label: 'Happy Clients', value: stats.totalProjects > 0 ? `${stats.totalProjects}+` : '500+', color: 'text-blue-400' },
    { icon: Sun, label: 'Solar Projects', value: stats.solarProjects > 0 ? `${stats.solarProjects}+` : '200+', color: 'text-amber-400' },
    { icon: Wrench, label: 'Electrical Jobs', value: stats.electricalProjects > 0 ? `${stats.electricalProjects}+` : '350+', color: 'text-cyan-400' },
    { icon: Award, label: 'Years Experience', value: '10+', color: 'text-purple-400' },
  ];

  if (loading) {
    return (
      <>
        <HeroCarousel />
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center">
          <Loader className="w-12 h-12 text-blue-400 animate-spin mb-4" />
          <p className="text-gray-400">Loading stats...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <HeroCarousel />
      
      {error && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => window.location.reload()} className="text-sm text-blue-400 hover:text-blue-300 transition">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayStats.map((stat, i) => (
            <div 
              key={i} 
              className="bg-[#131b2e] border border-white/10 rounded-xl p-6 text-center glass-effect hover:border-blue-400/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/5 group"
            >
              <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2 group-hover:scale-110 transition`} />
              <div className="text-2xl font-bold text-white group-hover:text-blue-400 transition">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Stats */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-[#131b2e] border border-white/10 rounded-2xl p-6 md:p-8 glass-effect">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Platform Overview</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0a0f1e] rounded-xl p-4 text-center border border-white/5">
              <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
              <p className="text-xs text-gray-400">Total Projects</p>
            </div>
            <div className="bg-[#0a0f1e] rounded-xl p-4 text-center border border-white/5">
              <p className="text-2xl font-bold text-white">{stats.totalTopics}</p>
              <p className="text-xs text-gray-400">Total Lessons</p>
            </div>
            <div className="bg-[#0a0f1e] rounded-xl p-4 text-center border border-white/5">
              <p className="text-2xl font-bold text-amber-400">{stats.solarProjects}</p>
              <p className="text-xs text-gray-400">Solar Projects</p>
            </div>
            <div className="bg-[#0a0f1e] rounded-xl p-4 text-center border border-white/5">
              <p className="text-2xl font-bold text-cyan-400">{stats.electricalProjects}</p>
              <p className="text-xs text-gray-400">Electrical Projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Services</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Expert solutions in solar and electrical engineering</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, i) => (
            <Link 
              to={service.link} 
              key={i} 
              className="group bg-[#131b2e] border border-white/10 rounded-2xl p-8 hover:border-blue-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 glass-effect"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                <service.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition">
                {service.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{service.desc}</p>
              <div className="mt-4 text-blue-400 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 text-sm font-medium">
                Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-3xl p-8 md:p-12 border border-white/10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Why Choose <span className="text-blue-400">ElectroSolar</span>?
              </h2>
              <p className="text-gray-300 mb-6">
                We deliver reliable, efficient, and innovative solar and electrical engineering solutions.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span>10+ years of industry experience</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span>{stats.totalProjects}+ successful projects completed</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span>Certified and licensed professionals</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0a0f1e] rounded-xl p-6 text-center border border-white/5">
                <div className="text-3xl font-bold text-amber-400">{stats.solarProjects}+</div>
                <div className="text-xs text-gray-400">Solar Projects</div>
              </div>
              <div className="bg-[#0a0f1e] rounded-xl p-6 text-center border border-white/5">
                <div className="text-3xl font-bold text-cyan-400">{stats.electricalProjects}+</div>
                <div className="text-xs text-gray-400">Electrical Jobs</div>
              </div>
              <div className="bg-[#0a0f1e] rounded-xl p-6 text-center border border-white/5">
                <div className="text-3xl font-bold text-blue-400">{stats.totalTopics}+</div>
                <div className="text-xs text-gray-400">Video Lessons</div>
              </div>
              <div className="bg-[#0a0f1e] rounded-xl p-6 text-center border border-white/5">
                <div className="text-3xl font-bold text-purple-400">{stats.totalProjects}+</div>
                <div className="text-xs text-gray-400">Projects Done</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-3xl p-8 md:p-12 text-center border border-white/10">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Ready to Power Your Future?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Get a free consultation or start learning today
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              to="/contact" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105 shadow-lg shadow-blue-500/20 inline-flex items-center gap-2"
            >
              Request a Quote <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/learn" 
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105 backdrop-blur-sm inline-flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" /> Start Learning
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;