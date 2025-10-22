import React, { useState, useRef } from 'react';
import { Menu, X, ChefHat, LogIn, UserPlus, Mail, Phone, MapPin, Linkedin, Instagram, Github, Star, Send, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [testimonials, setTestimonials] = useState([
    { id: 1, name: 'Priya Sharma', role: 'Restaurant Owner', message: 'Saves us hours on inventory management every week!', rating: 5 },
    { id: 2, name: 'Rajesh Kumar', role: 'Kitchen Manager', message: 'Staff scheduling is now so easy. No more confusion!', rating: 5 },
    { id: 3, name: 'Meera Patel', role: 'Owner', message: 'The sales insights help me understand what customers love.', rating: 4 },
  ]);

  const [loginData, setLoginData] = useState({ email: '', password: '', showPassword: false });
  const [signupData, setSignupData] = useState({ email: '', password: '', confirmPassword: '', showPassword: false });
  const [forgotData, setForgotData] = useState({ email: '' });
  const [testimonialData, setTestimonialData] = useState({ name: '', email: '', message: '', rating: 5, agreeSpamCheck: false });
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    setShowLoginModal(false);
    navigate('/login');
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setShowSignupModal(false);
    navigate('/signup');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Password reset link sent to ' + forgotData.email);
    setShowForgotModal(false);
  };

  const handleTestimonialSubmit = (e) => {
    e.preventDefault();
    if (!testimonialData.agreeSpamCheck) {
      alert('Please confirm you are not a robot');
      return;
    }
    const newTestimonial = {
      id: testimonials.length + 1,
      name: testimonialData.name,
      role: 'User',
      message: testimonialData.message,
      rating: testimonialData.rating,
    };
    setTestimonials([...testimonials, newTestimonial]);
    setTestimonialData({ name: '', email: '', message: '', rating: 5, agreeSpamCheck: false });
    setShowTestimonialForm(false);
    alert('Thank you for your testimonial!');
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Message sent! We will get back to you soon.');
    setContactData({ name: '', email: '', message: '' });
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <ChefHat className="w-8 h-8 text-orange-600" />
              <span className="text-xl font-bold text-gray-800">Restaurant Management App</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-orange-600 transition">Home</button>
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-orange-600 transition">Features</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-gray-700 hover:text-orange-600 transition">Testimonials</button>
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-orange-600 transition">About Creator</button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-orange-600 transition">Contact</button>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex space-x-4">
              <button onClick={() => setShowLoginModal(true)} className="flex items-center space-x-2 px-4 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition">
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
              <button onClick={() => setShowSignupModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                <UserPlus className="w-4 h-4" />
                <span>Signup</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <button onClick={() => scrollToSection('home')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50">Home</button>
              <button onClick={() => scrollToSection('features')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50">Features</button>
              <button onClick={() => scrollToSection('testimonials')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50">Testimonials</button>
              <button onClick={() => scrollToSection('about')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50">About Creator</button>
              <button onClick={() => scrollToSection('contact')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50">Contact</button>
              <div className="flex space-x-2 px-4 pt-2">
                <button onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }} className="flex-1 px-3 py-2 text-orange-600 border border-orange-600 rounded-lg text-sm">Login</button>
                <button onClick={() => { setShowSignupModal(true); setMobileMenuOpen(false); }} className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm">Signup</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 bg-gradient-to-r from-orange-50 via-red-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                Revolutionize Your <span className="text-orange-600">Restaurant Operations</span>
              </h1>
              <p className="text-xl text-gray-600">
                Tools for scheduling, inventory, and orders, built by a chef who knows the grind.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setShowSignupModal(true)} className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition">
                  Get Started
                </button>
                <button onClick={() => scrollToSection('features')} className="px-8 py-3 border-2 border-orange-600 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition">
                  Learn More
                </button>
              </div>
            </div>
            <div className="relative h-96 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg shadow-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <ChefHat className="w-24 h-24 mx-auto mb-4 opacity-80" />
                  <p className="text-2xl font-bold">Bustling Kitchen</p>
                  <p className="text-sm opacity-75">Professional Restaurant Operations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">What Our App Does</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Smart Scheduling', desc: 'Plan staff shifts and sync with calendars.' },
              { title: 'Inventory Control', desc: 'Track stock in real-time, avoid waste.' },
              { title: 'Easy Ordering', desc: 'Manage orders with clear roles for staff.' },
              { title: 'Sales Insights', desc: 'Get reports on what\'s selling and what\'s not.' },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">What Our Users Say</h2>
          <p className="text-center text-gray-600 mb-12">Real feedback from restaurant owners and managers</p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.message}"</p>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button onClick={() => setShowTestimonialForm(true)} className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition">
              Share Your Experience
            </button>
          </div>
        </div>
      </section>

      {/* About Creator Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Meet Raghav Mahajan – Chef & Creator</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="h-96 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg shadow-2xl flex items-center justify-center">
              <div className="text-center text-white">
                <ChefHat className="w-32 h-32 mx-auto mb-4 opacity-80" />
                <p className="text-xl font-bold">Professional Chef</p>
                <p className="text-sm opacity-75">North Indian Cuisine Specialist</p>
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-700">
                I'm a professional chef specializing in North Indian cuisine, with experience running kitchens at Leopold's Tavern (Feb-Jul 2025) and Boston Pizza (Sep 2022-Sep 2023), and currently cooking at Earls and St. Louis Bar & Grill (Aug 2025-Present) in Edmonton.
              </p>
              <p className="text-lg text-gray-700">
                I know the chaos of restaurants—wasted stock, messy schedules, order mix-ups. That's why I built Restaurant Management App to fix these problems with tools chefs actually need.
              </p>
              <p className="text-lg text-gray-700">
                I've also created apps like ImmigrateX (for immigration help), Chattr (a private social platform), bat-APP (a secure chat app), and 3D Chess (a fun multiplayer game), so I know how to build stuff that works.
              </p>
              <div className="flex space-x-4 pt-4">
                <a href="https://www.linkedin.com/in/raghav-mahajan-17611b24b/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn</span>
                </a>
                <a href="https://www.instagram.com/ragh.v_/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition">
                  <Instagram className="w-5 h-5" />
                  <span>Instagram</span>
                </a>
                <a href="https://github.com/raghv-m" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">
                  <Github className="w-5 h-5" />
                  <span>GitHub</span>
                </a>
              </div>
              <div className="pt-4">
                <a href="https://www.raghv.dev" target="_blank" rel="noopener noreferrer" className="text-orange-600 font-semibold hover:text-orange-700">
                  Visit Portfolio: www.raghv.dev →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Get In Touch</h2>
          <form onSubmit={handleContactSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input type="text" required value={contactData.name} onChange={(e) => setContactData({...contactData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input type="email" required value={contactData.email} onChange={(e) => setContactData({...contactData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
              <textarea required rows="5" value={contactData.message} onChange={(e) => setContactData({...contactData, message: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"></textarea>
            </div>
            <button type="submit" className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center space-x-2">
              <Send className="w-5 h-5" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Left */}
            <div>
              <h3 className="font-bold mb-4">Restaurant Management App</h3>
              <p className="text-gray-400 text-sm mb-4">Built for chefs, by a chef.</p>
              <div className="space-y-2 text-sm text-gray-400">
                <button onClick={() => scrollToSection('features')} className="block hover:text-orange-600">Features</button>
                <button onClick={() => scrollToSection('testimonials')} className="block hover:text-orange-600">Testimonials</button>
                <button onClick={() => scrollToSection('about')} className="block hover:text-orange-600">About</button>
              </div>
            </div>

            {/* Middle */}
            <div>
              <h3 className="font-bold mb-4">Created by Raghav Mahajan</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="https://www.raghv.dev" target="_blank" rel="noopener noreferrer" className="block hover:text-orange-600">Portfolio: www.raghv.dev</a>
                <a href="https://www.linkedin.com/in/raghav-mahajan-17611b24b/" target="_blank" rel="noopener noreferrer" className="block hover:text-orange-600">LinkedIn</a>
                <a href="https://www.instagram.com/ragh.v_/" target="_blank" rel="noopener noreferrer" className="block hover:text-orange-600">Instagram</a>
                <a href="https://github.com/raghv-m" target="_blank" rel="noopener noreferrer" className="block hover:text-orange-600">GitHub</a>
              </div>
            </div>

            {/* Right */}
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:raaghvv0508@gmail.com" className="hover:text-orange-600">raaghvv0508@gmail.com</a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>(825) 343-1168</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">© 2025 Raghav Mahajan. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
                <a href="#" className="hover:text-orange-600">Privacy Policy</a>
                <a href="#" className="hover:text-orange-600">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full p-8 animate-fade-in">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input type="email" required value={loginData.email} onChange={(e) => setLoginData({...loginData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input type={loginData.showPassword ? 'text' : 'password'} required value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600" />
                  <button type="button" onClick={() => setLoginData({...loginData, showPassword: !loginData.showPassword})} className="absolute right-3 top-2.5">
                    {loginData.showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>
              <button type="button" onClick={() => { setShowLoginModal(false); setShowForgotModal(true); }} className="text-sm text-orange-600 hover:text-orange-700">Forgot Password?</button>
              <button type="submit" className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition">Login</button>
            </form>
            <p className="text-center text-gray-600 mt-4">Don't have an account? <button onClick={() => { setShowLoginModal(false); setShowSignupModal(true); }} className="text-orange-600 hover:text-orange-700 font-semibold">Sign up</button></p>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full p-8 animate-fade-in">
            <button onClick={() => setShowSignupModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Sign Up</h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input type="email" required value={signupData.email} onChange={(e) => setSignupData({...signupData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input type={signupData.showPassword ? 'text' : 'password'} required value={signupData.password} onChange={(e) => setSignupData({...signupData, password: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600" />
                  <button type="button" onClick={() => setSignupData({...signupData, showPassword: !signupData.showPassword})} className="absolute right-3 top-2.5">
                    {signupData.showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <input type="password" required value={signupData.confirmPassword} onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600" />
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition">Sign Up</button>
            </form>
            <p className="text-center text-gray-600 mt-4">Already have an account? <button onClick={() => { setShowSignupModal(false); setShowLoginModal(true); }} className="text-orange-600 hover:text-orange-700 font-semibold">Login</button></p>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full p-8 animate-fade-in">
            <button onClick={() => setShowForgotModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Reset Password</h2>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-gray-600 text-sm mb-4">Enter your email address and we'll send you a link to reset your password.</p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input type="email" required value={forgotData.email} onChange={(e) => setForgotData({email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600" />
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition">Send Reset Link</button>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Form Modal */}
      {showTestimonialForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full p-8 animate-fade-in">
            <button onClick={() => setShowTestimonialForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Share Your Experience</h2>
            <form onSubmit={handleTestimonialSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input type="text" required value={testimonialData.name} onChange={(e) => setTestimonialData({...testimonialData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input type="email" required value={testimonialData.email} onChange={(e) => setTestimonialData({...testimonialData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                <select value={testimonialData.rating} onChange={(e) => setTestimonialData({...testimonialData, rating: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600">
                  <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                  <option value="4">⭐⭐⭐⭐ Good</option>
                  <option value="3">⭐⭐⭐ Average</option>
                  <option value="2">⭐⭐ Fair</option>
                  <option value="1">⭐ Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Message</label>
                <textarea required rows="4" value={testimonialData.message} onChange={(e) => setTestimonialData({...testimonialData, message: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"></textarea>
              </div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" required checked={testimonialData.agreeSpamCheck} onChange={(e) => setTestimonialData({...testimonialData, agreeSpamCheck: e.target.checked})} className="w-4 h-4 rounded border-gray-300" />
                <span className="text-sm text-gray-600">I confirm I'm not a robot</span>
              </label>
              <button type="submit" className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition">Submit Testimonial</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

