import React from 'react';
import { Briefcase, ShieldCheck, Globe } from 'lucide-react';

export function AboutPage() {
  const features = [
    { icon: Briefcase, title: 'Enterprise Ready', description: 'Scalable architecture designed for industry workloads.' },
    { icon: ShieldCheck, title: 'Secure by Design', description: 'End-to-end encryption and rigorous access controls.' },
    { icon: Globe, title: 'Global Access', description: 'Deployable worldwide with multilingual support.' }
  ];
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">About Vault of Legacy</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Vault of Legacy is a professional platform for preserving and managing digital heritage assets. Built with enterprise requirements in mind, it provides organizations with the tools needed to safeguard information for generations.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
            <f.icon className="h-8 w-8 mx-auto text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
            <p className="text-sm text-gray-600">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
