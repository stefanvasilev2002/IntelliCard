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
    Shield,
    Download,
    Apple,
    HardDrive,
    CheckCircle
} from 'lucide-react';
import {Link} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext.jsx";

const HomePage = () => {
    const [animatedFeature, setAnimatedFeature] = useState(0);
    const [selectedPlatform, setSelectedPlatform] = useState('windows');
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

    const downloadOptions = [
        {
            id: 'windows',
            name: 'Windows',
            icon: <HardDrive className="w-6 h-6" />,
            version: '1.0.0',
            size: '85 MB',
            format: '.exe',
            downloadUrl: '/downloads/IntelliCard-Setup-1.0.0.exe',
            requirements: 'Windows 10 or later',
            description: 'Full offline functionality with automatic updates'
        },
        {
            id: 'macos',
            name: 'macOS',
            icon: <Apple className="w-6 h-6" />,
            version: '1.0.0',
            size: '90 MB',
            format: '.dmg',
            downloadUrl: '/downloads/IntelliCard-1.0.0.dmg',
            requirements: 'macOS 10.15 or later',
            description: 'Native Mac experience with Touch Bar support'
        },
        {
            id: 'linux',
            name: 'Linux',
            icon: <Monitor className="w-6 h-6" />,
            version: '1.0.0',
            size: '95 MB',
            format: '.AppImage',
            downloadUrl: '/downloads/IntelliCard-1.0.0.AppImage',
            requirements: 'Ubuntu 18.04+ or equivalent',
            description: 'Portable application, no installation required'
        }
    ];

    const handleNavClick = (href) => {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleDownload = (platform) => {
        const downloadOption = downloadOptions.find(opt => opt.id === platform);
        if (downloadOption) {
            window.open(downloadOption.downloadUrl, '_blank');

            gtag?.('event', 'download', {
                event_category: 'Desktop App',
                event_label: platform,
                value: 1
            });
        }
    };

    const detectUserPlatform = () => {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('mac')) return 'macos';
        if (userAgent.includes('linux')) return 'linux';
        return 'windows';
    };

    useEffect(() => {
        setSelectedPlatform(detectUserPlatform());
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
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
                            <button onClick={() => handleNavClick('#download')} className="text-gray-600 hover:text-gray-900 transition-colors">Download</button>
                        </div>

                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all hover:scale-105">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link className="text-gray-600 hover:text-gray-900 transition-colors" to="/login">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all hover:scale-105">
                                        Get Started Free
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

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
                                <Link to="/dashboard" className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2">
                                    <span>Continue Learning</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2">
                                        <span>Get Started Free</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <button
                                        onClick={() => handleNavClick('#download')}
                                        className="group border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all flex items-center space-x-2"
                                    >
                                        <Download className="w-5 h-5" />
                                        <span>Download Desktop App</span>
                                    </button>
                                </>
                            )}
                        </div>

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
                            <Link to="/dashboard" className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2">
                                <span>Go to Dashboard</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2">
                                    <span>Get Started Free</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>

                                <button
                                    onClick={() => handleDownload(selectedPlatform)}
                                    className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all flex items-center space-x-2"
                                >
                                    <Download className="w-5 h-5" />
                                    <span>Download Desktop</span>
                                </button>
                            </>
                        )}
                    </div>

                    <p className="text-blue-100 text-sm mt-6">
                        No credit card required • Free forever plan available • Desktop app includes offline mode
                    </p>
                </div>
            </section>
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

            <section id="download" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Download IntelliCard Desktop
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Get the full IntelliCard experience with our desktop app. Study offline, sync across devices, and enjoy enhanced performance.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
                        <div className="flex flex-col lg:flex-row items-center justify-between">
                            <div className="lg:w-1/2 mb-8 lg:mb-0">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Desktop?</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <span className="text-gray-700">Complete offline functionality - study anywhere</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <span className="text-gray-700">Enhanced performance and faster loading</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <span className="text-gray-700">Native system integration and notifications</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <span className="text-gray-700">Automatic updates and sync with web version</span>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:w-1/2 flex justify-center">
                                <div className="relative">
                                    <div className="w-64 h-40 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 shadow-2xl">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-3 bg-gray-600 rounded"></div>
                                            <div className="h-3 bg-gray-600 rounded w-3/4"></div>
                                            <div className="h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                                            <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <WifiOff className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {downloadOptions.map((option) => (
                            <div
                                key={option.id}
                                className={`relative bg-white rounded-xl border-2 p-6 transition-all cursor-pointer ${
                                    selectedPlatform === option.id
                                        ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                }`}
                                onClick={() => setSelectedPlatform(option.id)}
                            >
                                {selectedPlatform === option.id && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                )}

                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        {option.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{option.name}</h3>
                                        <p className="text-sm text-gray-500">v{option.version}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Size:</span>
                                        <span className="font-medium">{option.size}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Format:</span>
                                        <span className="font-medium">{option.format}</span>
                                    </div>
                                    <div className="text-xs text-gray-500">{option.requirements}</div>
                                </div>

                                <p className="text-sm text-gray-600 mb-4">{option.description}</p>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(option.id);
                                    }}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download for {option.name}</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-sm text-gray-500 mb-4">
                            All downloads are free and include a 30-day trial of premium features
                        </p>
                        <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
                            <span>✓ No ads or tracking</span>
                            <span>✓ Automatic updates</span>
                            <span>✓ Cross-platform sync</span>
                            <span>✓ Offline mode</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-gray-50">
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
                            <p className="text-gray-400 max-w-md mb-6">
                                The most advanced AI-powered flashcard platform for students and professionals.
                                Study smarter, not harder.
                            </p>
                            <div className="flex items-center space-x-4">
                                <div className="text-sm text-gray-400">
                                    Available on:
                                </div>
                                <div className="flex items-center space-x-2">
                                    <HardDrive className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-400">Windows</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Apple className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-400">macOS</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Monitor className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-400">Linux</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><button onClick={() => handleNavClick('#features')} className="hover:text-white transition-colors">Features</button></li>
                                <li><button onClick={() => handleNavClick('#how-it-works')} className="hover:text-white transition-colors">How it Works</button></li>
                                <li><button onClick={() => handleNavClick('#download')} className="hover:text-white transition-colors">Download</button></li>
                                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Support</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link to="/changelog" className="hover:text-white transition-colors">What's New</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <p className="text-gray-400 text-sm">
                                &copy; 2025 IntelliCard. All rights reserved.
                            </p>
                            <div className="flex items-center space-x-4 mt-4 md:mt-0">
                                <div className="flex items-center space-x-2 text-sm text-gray-400">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span>All systems operational</span>
                                </div>
                                <div className="text-sm text-gray-400">
                                    Version 1.0.0
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;