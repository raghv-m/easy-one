import React, { useState, useRef } from 'react';
import { Menu, X, ChefHat, LogIn, UserPlus, Mail, Phone, MapPin, Linkedin, Instagram, Github, Star, Send, Eye, EyeOff, Clock, TrendingUp, Users, Zap, BarChart3, CheckCircle, ArrowRight, Calendar, DollarSign, Utensils } from 'lucide-react';
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
              <span className="text-xl font-bold text-gray-800">DineSync Solutions</span>
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
      <section id="home" className="pt-32 pb-20 bg-gradient-to-r from-blue-50 via-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                ✨ Proudly Built in Alberta
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                Run Your Restaurant <span className="text-orange-600">Smarter</span>
              </h1>
              <p className="text-xl text-gray-600">
                All-in-one software for scheduling, payroll, POS, kitchen screens, and more—designed to save time and boost profits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setShowSignupModal(true)} className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center gap-2">
                  <span>Book a Free Demo</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={() => scrollToSection('features')} className="px-8 py-3 border-2 border-orange-600 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition">
                  See How It Works
                </button>
              </div>
              <div className="flex items-center gap-4 pt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>30-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>No credit card needed</span>
                </div>
              </div>
            </div>
            <div className="relative h-96 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg shadow-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Zap className="w-24 h-24 mx-auto mb-4 opacity-80" />
                  <p className="text-2xl font-bold">Streamlined Operations</p>
                  <p className="text-sm opacity-75">Real-time Kitchen Display System</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem-Solution Section */}
      <section className="py-20 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Tired of Restaurant Chaos?</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">Common pain points solved by DineSync</p>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { problem: '❌ Missed orders due to poor communication', solution: '✅ Real-time kitchen screens keep orders on track' },
              { problem: '❌ Wasting hours on manual scheduling', solution: '✅ Automated scheduling saves 10+ hours weekly' },
              { problem: '❌ Inventory waste and food spoilage', solution: '✅ Real-time tracking prevents waste' },
              { problem: '❌ Payroll errors and compliance issues', solution: '✅ Automated payroll, Alberta labor law compliant' },
              { problem: '❌ Slow POS and payment processing', solution: '✅ Fast integrated payments with real-time reporting' },
              { problem: '❌ Staff confusion and role conflicts', solution: '✅ Clear role management across locations' },
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition">
                <p className="text-gray-700 mb-3 font-semibold">{item.problem}</p>
                <p className="text-green-700 font-semibold">{item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Everything Your Restaurant Needs</h2>
          <p className="text-center text-gray-600 mb-16 text-lg">All in one powerful app</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Calendar, title: 'Scheduling', desc: 'Create staff schedules in minutes with drag-and-drop ease.' },
              { icon: DollarSign, title: 'Payroll', desc: 'Automate payroll calculations, compliant with Alberta labor laws.' },
              { icon: Utensils, title: 'POS System', desc: 'Fast, integrated payments with real-time reporting.' },
              { icon: ChefHat, title: 'Kitchen Screens', desc: 'Sync orders instantly to reduce errors.' },
              { icon: Users, title: 'Staff Management', desc: 'Track performance and roles across multiple locations.' },
              { icon: BarChart3, title: 'Menu Management', desc: 'Update menus instantly, no reprinting needed.' },
              { icon: TrendingUp, title: 'Analytics', desc: 'Understand what customers love with sales insights.' },
              { icon: Zap, title: 'Multi-Location', desc: 'Manage multiple restaurants from one dashboard.' },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
                  <Icon className="w-10 h-10 text-orange-600 mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Affordable Plans for Every Restaurant</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">No hidden fees • 30-day free trial • Cancel anytime</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Basic', price: '$69', desc: 'Perfect for small eateries', features: ['Up to 10 staff members', 'Basic POS', 'Scheduling', 'Inventory tracking', 'Email support'] },
              { name: 'Pro', price: '$199', desc: 'For growing restaurants', features: ['Up to 50 staff members', 'Advanced POS', 'Multi-location support', 'Kitchen screens', 'Payroll integration', 'Priority support'], popular: true },
              { name: 'Enterprise', price: 'Custom', desc: 'For restaurant chains', features: ['Unlimited staff', 'Full customization', 'API access', 'Dedicated account manager', '24/7 phone support', 'Custom integrations'] },
            ].map((plan, idx) => (
              <div key={idx} className={`p-8 rounded-lg shadow-md transition transform hover:scale-105 ${plan.popular ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white ring-2 ring-orange-600 relative' : 'bg-gray-50'}`}>
                {plan.popular && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">MOST POPULAR</div>}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={`mb-4 ${plan.popular ? 'text-orange-100' : 'text-gray-600'}`}>{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className={plan.popular ? 'text-orange-100' : 'text-gray-600'}>/month</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-lg font-semibold transition ${plan.popular ? 'bg-white text-orange-600 hover:bg-gray-100' : 'bg-orange-600 text-white hover:bg-orange-700'}`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-8">One-time $500 installation fee for setup and customization</p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Trusted by Restaurants Like Yours</h2>
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

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Get Started in 3 Easy Steps</h2>
          <p className="text-center text-gray-600 mb-16 text-lg">From sign-up to serving in days</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Book Your Demo', desc: 'Schedule a free 30-minute demo with our team. We\'ll show you how DineSync works for your restaurant.' },
              { step: '2', title: 'Customize Your Setup', desc: 'We customize the app for your restaurant\'s unique needs—menus, staff roles, locations, and more.' },
              { step: '3', title: 'Launch & Succeed', desc: 'Go live and start saving time and money. Our support team is here to help every step of the way.' },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-3xl font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center text-gray-900 mb-3">{item.title}</h3>
                <p className="text-center text-gray-600">{item.desc}</p>
                {idx < 2 && <div className="hidden md:block absolute top-8 -right-4 text-3xl text-orange-300">→</div>}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button onClick={() => setShowSignupModal(true)} className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center gap-2 mx-auto">
              <span>Book Your Demo Now</span>
              <ArrowRight className="w-5 h-5" />
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
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Left */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ChefHat className="w-6 h-6 text-orange-600" />
                <h3 className="font-bold text-lg">DineSync Solutions</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">Restaurant management software built by chefs, for chefs.</p>
              <div className="inline-block bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                🍁 Built in Alberta
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <button onClick={() => scrollToSection('features')} className="block hover:text-orange-600">Features</button>
                <button onClick={() => scrollToSection('pricing')} className="block hover:text-orange-600">Pricing</button>
                <button onClick={() => scrollToSection('testimonials')} className="block hover:text-orange-600">Testimonials</button>
                <a href="#" className="block hover:text-orange-600">Security</a>
              </div>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <button onClick={() => scrollToSection('about')} className="block hover:text-orange-600">About Creator</button>
                <a href="https://www.raghv.dev" target="_blank" rel="noopener noreferrer" className="block hover:text-orange-600">Portfolio</a>
                <a href="https://www.linkedin.com/in/raghav-mahajan-17611b24b/" target="_blank" rel="noopener noreferrer" className="block hover:text-orange-600">LinkedIn</a>
                <a href="https://github.com/raghv-m" target="_blank" rel="noopener noreferrer" className="block hover:text-orange-600">GitHub</a>
              </div>
            </div>

            {/* Contact */}
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
                <div className="flex space-x-3 pt-2">
                  <a href="https://www.linkedin.com/in/raghav-mahajan-17611b24b/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="https://www.instagram.com/ragh.v_/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="https://github.com/raghv-m" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600">
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">© 2025 DineSync Solutions. All rights reserved. PIPEDA Compliant.</p>
              <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
                <a href="#" className="hover:text-orange-600">Privacy Policy</a>
                <a href="#" className="hover:text-orange-600">Terms of Service</a>
                <a href="#" className="hover:text-orange-600">PIPEDA Compliance</a>
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

