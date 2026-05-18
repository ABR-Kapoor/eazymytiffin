"use client";

import { useState } from "react";
import { ArrowRight, Phone, MapPin, Clock, MessageSquare, Instagram, Youtube } from "lucide-react";

const quickLinks = [
  { label: "Home",    href: "#home" },
  { label: "About Us",   href: "#why-us" },
  { label: "Weekly Menu",    href: "#weekly-menu" },
  { label: "Meal Plans",   href: "#meal-plans" },
  { label: "Contact", href: "#contact" },
];

const mealPlanLinks = [
  { label: "Veg Meals",            href: "#meal-plans" },
  { label: "Non-Veg Meals",        href: "#meal-plans" },
  { label: "Mix Meals",            href: "#meal-plans" },
  { label: "Monthly Subscription", href: "#subscription" },
];

const socials = [
  { 
    label: "Instagram", 
    Icon: Instagram, 
    href: "https://www.instagram.com/eazymytiffin?igsh=MW0wYjdwNGhmd2Q2eg==", 
    color: "#E1306C" 
  },
  { 
    label: "Youtube", 
    Icon: Youtube, 
    href: "https://youtube.com/@eazymy-tiffin?si=ZaeJWBnHzSNHE94C", 
    color: "#FF0000" 
  },
];

export default function Footer() {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  return (
    <footer id="footer" className="bg-[#1A1A1A] border-t border-white/10 relative overflow-hidden">
      <div className="mx-auto px-6 pt-24 pb-12 relative z-10" style={{ maxWidth: "var(--max-width)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Brand Column */}
          <div className="space-y-8">
            <div className="flex flex-col leading-none">
              <span className="font-black text-2xl tracking-tight">
                <span className="text-white">EazyMy-</span>
                <span className="text-[#E8392A]">Tiffin</span>
              </span>
              <span className="text-[10px] font-semibold tracking-[1.5px] uppercase mt-1 text-slate-400">
                India's Premium Tiffin Brand
              </span>
            </div>
            <p className="text-[15px] text-slate-500 leading-relaxed max-w-xs">
              Delivering fresh, home-style meals to your doorstep with love and care.
            </p>
            <div className="flex gap-4">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  onMouseEnter={() => setHoveredSocial(social.label)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border border-white/10 shadow-sm"
                  style={{ 
                    backgroundColor: hoveredSocial === social.label ? social.color : 'rgba(255,255,255,0.05)',
                    color: 'white'
                  }}
                >
                  <social.Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[2px] text-white mb-8">
              Explore
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-[14px] text-slate-400 hover:text-[#E8392A] hover:translate-x-1 flex items-center gap-2 transition-all duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Offerings */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[2px] text-white mb-8">
              Our Plans
            </h3>
            <ul className="space-y-4">
              {mealPlanLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-[14px] text-slate-400 hover:text-[#E8392A] transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[2px] text-white mb-8">
              Contact Info
            </h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#E8392A] shrink-0 border border-white/10">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white uppercase tracking-wider mb-1">Call Us</p>
                  <a href="tel:9770144899" className="text-[15px] text-slate-400 hover:text-[#E8392A]">9770144899</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 shrink-0 border border-white/10">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white uppercase tracking-wider mb-1">Location</p>
                  <p className="text-[15px] text-slate-400">Tarbahar, Bilaspur, Chhattisgarh 495004</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-amber-400 shrink-0 border border-white/10">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white uppercase tracking-wider mb-1">Hours</p>
                  <p className="text-[15px] text-slate-400">Mon–Sat: 11am–9pm</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-[13px] text-slate-500 font-medium">
            © 2025 EazyMy-Tiffin. India's Premium Tiffin Brand.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-[13px] text-slate-500 font-medium w-full md:w-auto">
            <div className="flex items-center gap-6 justify-center">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
            <span className="flex items-center justify-center gap-2 flex-wrap">
              Built with <span className="text-[#E8392A]">❤️</span> by{" "}
              <a 
                href="https://www.frequnsync.online/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors font-bold underline decoration-[#E8392A]/50 decoration-2 underline-offset-4"
              >
                FrequnSync
              </a>
              {" "}· Made in India 
              <img 
                src="https://flagcdn.com/w40/in.png" 
                alt="India Flag" 
                className="w-5 h-3.5 object-cover rounded-sm border border-white/10 shrink-0"
              />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
