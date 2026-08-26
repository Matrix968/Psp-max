import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Zap, Wrench, Shield, Clock, Users } from 'lucide-react';

const Services = () => {
  const services = [
    { icon: Sun, title: 'Solar Panel Installation', desc: 'Complete solar systems for homes and businesses', color: 'from-amber-500 to-orange-500' },
    { icon: Zap, title: 'Electrical Engineering', desc: 'Wiring, panels, switchgear, and automation', color: 'from-blue-500 to-cyan-500' },
    { icon: Wrench, title: 'Maintenance & Repairs', desc: 'Regular upkeep and emergency fixes', color: 'from-emerald-500 to-teal-500' },
    { icon: Shield, title: 'Safety Inspections', desc: 'Comprehensive electrical safety audits', color: 'from-red-500 to-pink-500' },
    { icon: Clock, title: '24/7 Support', desc: 'Round-the-clock assistance for urgent issues', color: 'from-purple-500 to-indigo-500' },
    { icon: Users, title: 'Training & Consultation', desc: 'Expert guidance and staff training', color: 'from-yellow-500 to-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-4">Our Services</h1>
        <p className="text-gray-400 mb-8">Comprehensive solar and electrical solutions</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <div key={i} className="bg-[#131b2e] rounded-2xl p-6 border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                <service.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{service.title}</h3>
              <p className="text-gray-400 text-sm">{service.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/contact" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105 inline-block">
            Request a Quote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;