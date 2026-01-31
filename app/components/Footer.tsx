'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Security', href: '#security' },
      { name: 'Roadmap', href: '#roadmap' },
    ],
    Company: [
      { name: 'About', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Careers', href: '#careers' },
      { name: 'Contact', href: '#contact' },
    ],
    Resources: [
      { name: 'Documentation', href: '#docs' },
      { name: 'API Reference', href: '#api' },
      { name: 'Support', href: '#support' },
      { name: 'Status', href: '#status' },
    ],
    Legal: [
      { name: 'Privacy', href: '#privacy' },
      { name: 'Terms', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'Licenses', href: '#licenses' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <footer className="relative bg-black border-t border-neutral-800/50">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center group mb-4">
              <div className="relative">
                <Image 
                  src="/lume-logo.png" 
                  alt="Lume" 
                  width={120} 
                  height={44} 
                  className="h-11 w-auto object-contain group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-amber-500/30 blur-xl group-hover:bg-amber-400/40 transition-all" />
              </div>
            </Link>
            <p className="text-neutral-400 text-sm mb-4">
              Global payroll at the speed of light. Pay your international team with 90% lower fees.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-neutral-900/50 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all duration-300 hover:scale-110"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-neutral-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-neutral-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-400 text-sm">
              © {new Date().getFullYear()} Lume. All rights reserved.
            </p>
            <p className="text-neutral-400 text-sm">
              Built with ❤️ using{' '}
              <span className="text-amber-400 font-medium">Stellar Network</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
