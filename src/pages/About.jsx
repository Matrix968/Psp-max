import React from 'react';
import { Users, Target, Shield, Zap } from 'lucide-react';

const About = () => {
  const values = [
    { icon: Shield, title: 'Safety First', desc: 'We prioritize safety in every project' },
    { icon: Target, title: 'Quality Work', desc: 'Premium materials and craftsmanship' },
    { icon: Zap, title: 'Innovation', desc: 'Cutting-edge solar and electrical solutions' },
    { icon: Users, title: 'Customer Focus', desc: 'Tailored solutions for your needs' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-4">About ElectroSolar Hub</h1>
        <p className="text-gray-400 mb-8">Expert solar and electrical engineering solutions</p>

        <div className="bg-[#131b2e] rounded-2xl p-8 border border-white/10 mb-8">
          <p className="text-gray-300 leading-relaxed">
            ElectroSolar Hub is a premier provider of solar and electrical engineering services. 
            With over 10 years of experience, we deliver reliable, efficient, and innovative solutions 
            for residential, commercial, and industrial clients.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {values.map((item, i) => (
            <div key={i} className="bg-[#131b2e] p-6 rounded-2xl border border-white/10">
              <item.icon className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;