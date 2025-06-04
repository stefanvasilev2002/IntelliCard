import React, { useState, useEffect } from 'react';
import {
    Brain,
    FileText,
    Users,
    Smartphone,
    ArrowRight,
    Play,
    BarChart3,
    Wand2,
    Monitor,
    Wifi,
    WifiOff,
    Sparkles,
    BookOpen,
    Target,
    TrendingUp,
    Shield
} from 'lucide-react';
import {Link} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext.jsx";

const HomePage = () => {
    const [animatedFeature, setAnimatedFeature] = useState(0);
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimatedFeature(prev => (prev + 1) % 4);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            icon: <Wand2 className="w-8 h-8" />,
            title: "AI-Powered Card Generation",
            description: "Upload PDFs, DOCX, or TXT files and let our AI automatically generate smart flashcards with varying complexity levels.",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: "Spaced Repetition System",
            description: "Advanced algorithms optimize your learning schedule, showing cards exactly when you need to review them.",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: <Monitor className="w-8 h-8" />,
            title: "Hybrid Web & Desktop",
            description: "Study anywhere with our web app or download the desktop version for complete offline functionality.",
            color: "from-green-500 to-emerald-500"
        },
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: "Smart Progress Tracking",
            description: "Detailed analytics and progress insights help you understand your learning patterns and optimize study time.",
            color: "from-orange-500 to-red-500"
        }
    ];

    const stats = [
        { number: "10M+", label: "Cards Studied", icon: <BookOpen className="w-5 h-5" /> },
        { number: "50K+", label: "Active Students", icon: <Users className="w-5 h-5" /> },
        { number: "95%", label: "Retention Rate", icon: <Target className="w-5 h-5" /> },
        { number: "24/7", label: "Offline Access", icon: <WifiOff className="w-5 h-5" /> }
    ];

    const handleNavClick = (href) => {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg flex items-center justify-center">
                                <Brain size={20} />
                            </div>
                            <span className="text-xl font-bold text-gray-900">IntelliCard</span>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <button onClick={() => handleNavClick('#features')} className="text-gray-600 hover:text-gray-900 transition-colors">Features</button>
                            <button onClick={() => handleNavClick('#how-it-works')} className="text-gray-600 hover:text-gray-900 transition-colors">How it Works</button>
                        </div>

                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all hover:scale-105">
                                    Go to Dashboard
                                </button>
                            ) : (
                                <>
                                    <Link  className="text-gray-600 hover:text-gray-900 transition-colors" to={"/login"}>
                                        Sign In
                                    </Link>
                                    <Link to={"/register"} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all hover:scale-105">
                                        Get Started Free
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium rounded-full">
                                <Sparkles className="w-4 h-4 mr-2" />
                                AI-Powered Learning Platform
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            Master Any Subject with
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> AI-Generated </span>
                            Flashcards
                        </h1>

                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Revolutionary learning platform that transforms your documents into intelligent flashcards.
                            Study smarter with spaced repetition, work offline, and track your progress with advanced analytics.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                            {isAuthenticated ? (
                                <button className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2">
                                    <Link to={"/dashboard"}>Continue Learning</Link>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <>
                                </>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8 border-t border-gray-200">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="flex items-center justify-center mb-2">
                                        <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                                    <div className="text-sm text-gray-600">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Powered by Advanced AI Technology
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Experience the next generation of learning with features that adapt to your study habits and maximize retention.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`relative overflow-hidden bg-gradient-to-br ${feature.color} rounded-2xl p-8 text-white transform transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                                    animatedFeature === index ? 'ring-4 ring-white ring-opacity-50 scale-105' : ''
                                }`}
                            >
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mb-6">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                                    <p className="text-white text-opacity-90 leading-relaxed">{feature.description}</p>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            How IntelliCard Works
                        </h2>
                        <p className="text-xl text-gray-600">
                            Three simple steps to transform your learning experience
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center group relative">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <FileText className="w-10 h-10 text-white" />
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-lg group-hover:shadow-xl transition-shadow">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">1. Upload Your Content</h3>
                                <p className="text-gray-600">
                                    Simply upload your study materials in PDF, DOCX, or TXT format. Our AI will analyze the content and extract key information.
                                </p>
                            </div>
                        </div>

                        <div className="text-center group relative">
                            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Wand2 className="w-10 h-10 text-white" />
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-lg group-hover:shadow-xl transition-shadow">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">2. AI Generates Cards</h3>
                                <p className="text-gray-600">
                                    Our advanced AI creates intelligent flashcards with varying difficulty levels, ensuring comprehensive coverage of your material.
                                </p>
                            </div>
                        </div>

                        <div className="text-center group">
                            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Brain className="w-10 h-10 text-white" />
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-lg group-hover:shadow-xl transition-shadow">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">3. Study & Master</h3>
                                <p className="text-gray-600">
                                    Learn with our spaced repetition system that adapts to your progress, ensuring maximum retention and efficient studying.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Platform Features */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">
                                Study Anywhere, Anytime
                            </h2>
                            <p className="text-xl text-gray-600 mb-8">
                                IntelliCard works seamlessly across all your devices. Use it as a web app or download the desktop version for complete offline functionality.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Wifi className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Web App</h4>
                                        <p className="text-sm text-gray-600">Access from any browser with real-time sync</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <WifiOff className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Offline Desktop</h4>
                                        <p className="text-sm text-gray-600">Full functionality without internet</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Smartphone className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Mobile Optimized</h4>
                                        <p className="text-sm text-gray-600">Perfect experience on phones and tablets</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Shield className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Secure Sync</h4>
                                        <p className="text-sm text-gray-600">Your data is always safe and synchronized</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                                <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                        <div className="h-8 bg-gradient-to-r from-blue-200 to-purple-200 rounded"></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-4 shadow-lg">
                                        <Monitor className="w-6 h-6 text-blue-600 mb-2" />
                                        <div className="text-sm font-medium">Desktop App</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-lg">
                                        <Smartphone className="w-6 h-6 text-purple-600 mb-2" />
                                        <div className="text-sm font-medium">Mobile Web</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Learning?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of students who are already studying smarter with AI-powered flashcards and spaced repetition.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                        {isAuthenticated ? (
                            <Link to={"/dashboard"} className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2">
                                <span>Go to Dashboard</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        ) : (
                            <>
                                <button className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2">
                                    <Link to={"/register"}>Get Started Free</Link>
                                    <ArrowRight className="w-5 h-5" />
                                </button>

                                <Link to={"/login"} className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>

                    <p className="text-blue-100 text-sm mt-6">
                        No credit card required • Free forever plan available
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg flex items-center justify-center">
                                    <Brain size={20} />
                                </div>
                                <span className="text-xl font-bold">IntelliCard</span>
                            </div>
                            <p className="text-gray-400 max-w-md">
                                The most advanced AI-powered flashcard platform for students and professionals.
                                Study smarter, not harder.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><button onClick={() => handleNavClick('#features')} className="hover:text-white transition-colors">Features</button></li>
                                <li><button onClick={() => handleNavClick('#how-it-works')} className="hover:text-white transition-colors">How it Works</button></li>
                                <li><button className="hover:text-white transition-colors">Download</button></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Support</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><button className="hover:text-white transition-colors">Help Center</button></li>
                                <li><button className="hover:text-white transition-colors">Contact Us</button></li>
                                <li><button className="hover:text-white transition-colors">Privacy</button></li>
                                <li><button className="hover:text-white transition-colors">Terms</button></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 IntelliCard. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;