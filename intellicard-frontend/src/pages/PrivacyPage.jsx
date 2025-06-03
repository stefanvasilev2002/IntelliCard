import React, { useState } from 'react';
import {
    Shield,
    Eye,
    Lock,
    Database,
    Cookie,
    Mail,
    ArrowLeft,
    CheckCircle,
    AlertTriangle,
    Globe,
    Users,
    FileText,
    Calendar,
    Trash2,
    Download,
    ChevronDown,
    ChevronUp,
    ExternalLink
} from 'lucide-react';

const PrivacyPage = () => {
    const [expandedSections, setExpandedSections] = useState({});
    const lastUpdated = "June 3, 2025";

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const sections = [
        {
            id: "information-collection",
            title: "Information We Collect",
            icon: Database,
            summary: "Details about the personal and usage data we collect to provide our service",
            content: [
                {
                    subtitle: "Account Information",
                    items: [
                        "Username and email address for account creation",
                        "Password (encrypted and securely stored)",
                        "Profile preferences and settings"
                    ]
                },
                {
                    subtitle: "Study Data",
                    items: [
                        "Flashcard sets you create or access",
                        "Study session progress and statistics",
                        "Card review history and performance metrics",
                        "Learning preferences and study patterns"
                    ]
                },
                {
                    subtitle: "Usage Information",
                    items: [
                        "App usage patterns and feature interactions",
                        "Session duration and frequency",
                        "Device and browser information",
                        "IP address and general location data"
                    ]
                }
            ]
        },
        {
            id: "data-usage",
            title: "How We Use Your Information",
            icon: Eye,
            summary: "How we use your data to provide and improve our flashcard learning service",
            content: [
                {
                    subtitle: "Core Functionality",
                    items: [
                        "Provide personalized study experiences",
                        "Track learning progress and optimize spaced repetition",
                        "Enable sharing and collaboration features",
                        "Maintain account security and prevent unauthorized access"
                    ]
                },
                {
                    subtitle: "Service Improvement",
                    items: [
                        "Analyze usage patterns to improve app performance",
                        "Develop new features based on user behavior",
                        "Provide customer support and troubleshooting",
                        "Send important service updates and notifications"
                    ]
                }
            ]
        },
        {
            id: "data-sharing",
            title: "Data Sharing and Disclosure",
            icon: Users,
            summary: "Our commitment to not selling your data and limited sharing scenarios",
            content: [
                {
                    subtitle: "We DO NOT sell your personal data",
                    items: [
                        "Your study data and personal information are never sold to third parties",
                        "We maintain strict confidentiality of your learning materials"
                    ]
                },
                {
                    subtitle: "Limited Sharing Scenarios",
                    items: [
                        "Public card sets (only if you explicitly make them public)",
                        "Shared study sets with users you specifically grant access",
                        "Anonymized usage statistics for research purposes",
                        "Legal compliance when required by law"
                    ]
                }
            ]
        },
        {
            id: "data-security",
            title: "Data Security",
            icon: Shield,
            summary: "Technical and administrative safeguards protecting your information",
            content: [
                {
                    subtitle: "Security Measures",
                    items: [
                        "End-to-end encryption for data transmission",
                        "Secure password hashing using industry standards",
                        "Regular security audits and vulnerability assessments",
                        "Protected servers with restricted access controls"
                    ]
                },
                {
                    subtitle: "Your Responsibilities",
                    items: [
                        "Use strong, unique passwords for your account",
                        "Keep your login credentials confidential",
                        "Report suspicious activity immediately",
                        "Log out from shared or public devices"
                    ]
                }
            ]
        },
        {
            id: "cookies",
            title: "Cookies and Tracking",
            icon: Cookie,
            summary: "Information about cookies and tracking technologies we use",
            content: [
                {
                    subtitle: "Essential Cookies",
                    items: [
                        "Authentication tokens to keep you logged in",
                        "Session management for app functionality",
                        "Security tokens to prevent unauthorized access"
                    ]
                },
                {
                    subtitle: "Analytics and Performance",
                    items: [
                        "Usage analytics to improve user experience",
                        "Performance monitoring to optimize app speed",
                        "Feature usage tracking to guide development"
                    ]
                }
            ]
        },
        {
            id: "user-rights",
            title: "Your Rights and Controls",
            icon: Lock,
            summary: "Your rights to access, control, and delete your personal data",
            content: [
                {
                    subtitle: "Data Access and Control",
                    items: [
                        "Access and download your personal data",
                        "Correct inaccurate information in your profile",
                        "Delete your account and associated data",
                        "Control sharing and privacy settings"
                    ]
                },
                {
                    subtitle: "Communication Preferences",
                    items: [
                        "Opt out of promotional emails",
                        "Control notification settings",
                        "Choose what study data to share",
                        "Manage public/private card set visibility"
                    ]
                }
            ]
        }
    ];

    const contactInfo = {
        email: "privacy@intellicard.com",
        address: "IntelliCard Privacy Team, 123 Learning St, Education City, EC 12345"
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <Shield className="w-8 h-8 text-blue-600" />
                            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                        </div>
                        <p className="text-gray-600">
                            Last updated: {lastUpdated}
                        </p>
                    </div>
                </div>

                {/* Introduction */}
                <div className="bg-white rounded-lg p-6 shadow-sm border mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-blue-900 mb-3">Your Privacy Matters</h2>
                            <p className="text-blue-800 leading-relaxed">
                                At IntelliCard, we are committed to protecting your privacy and being transparent about how we collect,
                                use, and protect your personal information. This policy explains our data practices in clear,
                                understandable terms.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Key Principles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg p-6 shadow-sm border text-center hover:shadow-md transition-shadow">
                        <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Transparency</h3>
                        <p className="text-sm text-gray-600">
                            Clear communication about what data we collect and how we use it
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm border text-center hover:shadow-md transition-shadow">
                        <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                            <Lock className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Security</h3>
                        <p className="text-sm text-gray-600">
                            Industry-standard security measures to protect your information
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm border text-center hover:shadow-md transition-shadow">
                        <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Control</h3>
                        <p className="text-sm text-gray-600">
                            You maintain control over your data and privacy settings
                        </p>
                    </div>
                </div>

                {/* Main Content Sections */}
                <div className="space-y-6">
                    {sections.map((section) => {
                        const IconComponent = section.icon;
                        const isExpanded = expandedSections[section.id];

                        return (
                            <div key={section.id} className="bg-white rounded-lg shadow-sm border">
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                <IconComponent className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                                                <p className="text-sm text-gray-600 mt-1">{section.summary}</p>
                                            </div>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="px-6 pb-6 border-t border-gray-100">
                                        <div className="space-y-6 mt-6">
                                            {section.content.map((subsection, index) => (
                                                <div key={index}>
                                                    <h3 className="font-semibold text-gray-800 mb-3">{subsection.subtitle}</h3>
                                                    <ul className="space-y-2">
                                                        {subsection.items.map((item, itemIndex) => (
                                                            <li key={itemIndex} className="flex items-start space-x-3">
                                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                <span className="text-gray-700 leading-relaxed">{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Data Retention */}
                <div className="bg-white rounded-lg p-6 shadow-sm border mt-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-gray-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Data Retention</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">How Long We Keep Your Data</h3>
                            <ul className="space-y-2">
                                <li className="flex items-start space-x-3">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-gray-700">Account data: Until you delete your account</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-gray-700">Study progress: 3 years after last activity</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-gray-700">Analytics data: Anonymized after 2 years</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-gray-700">Public card sets: Indefinitely or until you remove them</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Children's Privacy */}
                <div className="bg-white rounded-lg p-6 shadow-sm border mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-yellow-900 mb-3">Children's Privacy</h2>
                            <p className="text-yellow-800 leading-relaxed mb-3">
                                IntelliCard is designed for users 13 years and older. We do not knowingly collect personal
                                information from children under 13. If you believe a child under 13 has provided us with
                                personal information, please contact us immediately.
                            </p>
                            <p className="text-yellow-800 leading-relaxed">
                                For users between 13-18, we recommend parental guidance when using our service and
                                sharing study materials.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Changes to Privacy Policy */}
                <div className="bg-white rounded-lg p-6 shadow-sm border mt-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Changes to This Policy</h2>
                    </div>
                    <div className="space-y-4">
                        <p className="text-gray-700 leading-relaxed">
                            We may update this privacy policy from time to time to reflect changes in our practices,
                            technology, legal requirements, or other factors. When we make changes:
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-start space-x-3">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700">We'll update the "Last updated" date at the top of this page</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700">For significant changes, we'll send you an email notification</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700">We'll provide a 30-day notice period for major policy changes</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-lg p-6 shadow-sm border mt-8 bg-gradient-to-r from-gray-50 to-gray-100">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-gray-200 rounded-lg">
                            <Mail className="w-5 h-5 text-gray-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Contact Us</h2>
                    </div>
                    <div className="space-y-4">
                        <p className="text-gray-700 leading-relaxed">
                            If you have questions about this privacy policy or our data practices, please contact us:
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">
                                    Email: <a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:underline">{contactInfo.email}</a>
                                </span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                                <span className="text-gray-700">Address: {contactInfo.address}</span>
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800">
                                <strong>Response Time:</strong> We typically respond to privacy inquiries within 48 hours.
                                For urgent matters, please mark your email as "URGENT - Privacy Request".
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center py-8 text-sm text-gray-500">
                    <p>
                        This privacy policy is effective as of {lastUpdated} and applies to all users of IntelliCard.
                    </p>
                    <div className="mt-4 space-x-4">
                        <button className="hover:text-gray-700 hover:underline">Terms of Service</button>
                        <span>•</span>
                        <button className="hover:text-gray-700 hover:underline">Cookie Policy</button>
                        <span>•</span>
                        <button className="hover:text-gray-700 hover:underline">Support</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;