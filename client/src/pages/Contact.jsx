import React, { useState } from 'react';
import { Mail, MessageSquare, Phone } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        alert('Thank you for contacting us! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen px-6 py-32">
            <div className="max-w-[1200px] mx-auto">
                <h1 className="text-5xl md:text-7xl font-black italic mb-12 tracking-tight text-center">
                    Get In Touch
                </h1>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div className="bg-dark-card p-12 rounded-[48px] border border-white/10">
                        <h2 className="text-3xl font-black mb-8">Send us a message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-black uppercase tracking-wider mb-2 text-white/60">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black/50 border-2 border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-primary transition-all"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black uppercase tracking-wider mb-2 text-white/60">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black/50 border-2 border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-primary transition-all"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black uppercase tracking-wider mb-2 text-white/60">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black/50 border-2 border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-primary transition-all"
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black uppercase tracking-wider mb-2 text-white/60">
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="w-full bg-black/50 border-2 border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-primary transition-all resize-none"
                                    placeholder="Your message..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-light text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all hover:scale-105 shadow-2xl"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-dark-card p-10 rounded-[48px] border border-white/10 hover:border-primary/50 transition-all">
                            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                                <Mail className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-black mb-3">Email Us</h3>
                            <p className="text-white/60 font-bold mb-2">support@boostgg.com</p>
                            <p className="text-white/60 font-bold">sales@boostgg.com</p>
                        </div>

                        <div className="bg-dark-card p-10 rounded-[48px] border border-white/10 hover:border-primary/50 transition-all">
                            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                                <MessageSquare className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-black mb-3">Live Chat</h3>
                            <p className="text-white/60 font-bold mb-4">Available 24/7 for instant support</p>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('openSupportChat'))}
                                className="bg-primary hover:bg-primary-light px-8 py-3 rounded-2xl font-black text-sm transition-all"
                            >
                                Start Chat
                            </button>
                        </div>

                        <div className="bg-dark-card p-10 rounded-[48px] border border-white/10 hover:border-primary/50 transition-all">
                            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                                <Phone className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-black mb-3">Call Us</h3>
                            <p className="text-white/60 font-bold">+1 (555) 123-4567</p>
                            <p className="text-sm text-white/40 font-bold mt-2">Mon-Fri: 9AM - 6PM EST</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
