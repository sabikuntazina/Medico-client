import Link from "next/link";
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from "react-icons/fi";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <FiFacebook />, href: "https://facebook.com", label: "Facebook" },
    { icon: <FiTwitter />, href: "https://twitter.com", label: "Twitter" },
    { icon: <FiInstagram />, href: "https://instagram.com", label: "Instagram" },
    { icon: <FiLinkedin />, href: "https://linkedin.com", label: "LinkedIn" }
  ];

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition-colors duration-200 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-cyan-300">
              Medico Connect
            </span>
            <p className="text-sm leading-relaxed">
              Medicare Connect is a modern healthcare management platform connecting patients with certified specialists. Streamline your consultations, appointments, and prescriptions online.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-slate-200/50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-455 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="hover:text-emerald-600 dark:hover:text-emerald-455 transition-colors">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-emerald-600 dark:hover:text-emerald-455 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-emerald-600 dark:hover:text-emerald-455 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
              Contact Information
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <FiMapPin className="mr-2 mt-1 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>123 Healthcare Ave, Medical District, NY 10001</span>
              </li>
              <li className="flex items-center">
                <FiMail className="mr-2 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <a href="mailto:support@medico.com" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  support@medico.com
                </a>
              </li>
              <li className="flex items-center">
                <FiPhone className="mr-2 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>+1 (555) 019-2834</span>
              </li>
            </ul>
          </div>

          {/* Emergency Hotline */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Emergency Hotline
            </h3>
            <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-4 dark:border-red-900/30 dark:bg-red-950/10">
              <p className="text-xs font-semibold text-red-800 dark:text-red-300 uppercase tracking-wide">
                24/7 Urgent Care
              </p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
                1-800-MED-ALERT
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Call this number for immediate emergency hospital support.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-200 dark:border-slate-800 mt-12 pt-6 text-center text-xs">
          <p>&copy; {currentYear} Medico Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
