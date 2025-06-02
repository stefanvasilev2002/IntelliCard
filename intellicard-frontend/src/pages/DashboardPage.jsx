import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    BookOpen,
    Users,
    Globe,
    Lock,
    Eye,
    Edit,
    Trash2,
    Play,
    Clock,
    Target,
    Brain,
    UserPlus,
    CheckCircle,
    XCircle,
    AlertCircle,
    Mail,
    TrendingUp,
    Zap,
    Award,
    Calendar
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { cardSetsAPI, studyAPI, accessRequestsAPI } from '../services/api';
import toast from 'react-hot-toast';

const DashboardPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [showAccessRequestModal, setShowAccessRequestModal] = useState(false);
    const [selectedCardSet, setSelectedCardSet] = useState(null);
    const [showPendingRequestsModal, setShowPendingRequestsModal] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [showCancelRequestModal, setShowCancelRequestModal] = useState(false);
    const [requestToCancel, setRequestToCancel] = useState(null);

    const { data: cardSets, isLoading, error, refetch } = useQuery({
        queryKey: ['cardSets'],
        queryFn: async () => {
            const response = await cardSetsAPI.getAll();
            return response.data;
        },
    });

    const { data: studyOverviews } = useQuery({
        queryKey: ['studyOverviews', cardSets],
        queryFn: async () => {
            if (!cardSets || cardSets.length === 0) return {};

            const overviews = {};
            await Promise.all(
                cardSets.map(async (cardSet) => {
                    try {
                        const response = await studyAPI.getOverview(cardSet.id);
                        overviews[cardSet.id] = response.data;
                    } catch (error) {
                        overviews[cardSet.id] = {
                            totalCards: 0,
                            dueCards: 0,
                            masteredCards: 0,
                            learningCards: 0
                        };
                    }
                })
            );
            return overviews;
        },
        enabled: !!cardSets && cardSets.length > 0,
    });

    const filteredCardSets = cardSets?.filter(cardSet => {
        const matchesSearch = cardSet.name.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'owned') {
            return matchesSearch && cardSet.accessType === 'OWNER';
        } else if (filter === 'shared') {
            return matchesSearch && cardSet.accessType === 'ACCESSIBLE' && !cardSet.isPublic;
        } else if (filter === 'public') {
            return matchesSearch && cardSet.isPublic;
        } else if (filter === 'requests') {
            return matchesSearch && (cardSet.accessType === 'PENDING' || cardSet.accessType === 'REJECTED');
        }

        return matchesSearch;
    }) || [];

    const handleDelete = async (cardSetId) => {
        if (!window.confirm('Are you sure you want to delete this card set?')) {
            return;
        }

        try {
            await cardSetsAPI.delete(cardSetId);
            toast.success('Card set deleted successfully');
            refetch();
        } catch (error) {
            toast.error('Failed to delete card set');
        }
    };

    const handleRequestAccess = async (cardSet) => {
        try {
            await accessRequestsAPI.request(cardSet.id);
            toast.success('Access request sent successfully');
            refetch();
        } catch (error) {
            toast.error('Failed to send access request');
        }
    };

    const handleRevokeRequest = async (cardSet) => {
        setRequestToCancel(cardSet);
        setShowCancelRequestModal(true);
    };

    const confirmRevokeRequest = async () => {
        if (!requestToCancel) return;

        try {
            await accessRequestsAPI.revoke(requestToCancel.id);
            toast.success('Access request revoked successfully');
            refetch();
            setShowCancelRequestModal(false);
            setRequestToCancel(null);
        } catch (error) {
            toast.error('Failed to revoke access request');
        }
    };

    const fetchPendingRequests = async (cardSetId) => {
        try {
            const response = await accessRequestsAPI.getPending(cardSetId);
            setPendingRequests(response.data);
            setShowPendingRequestsModal(true);
        } catch (error) {
            toast.error('Failed to fetch pending requests');
        }
    };

    const handleRespondToRequest = async (cardSetId, requestId, approve) => {
        try {
            await accessRequestsAPI.respond(cardSetId, requestId, approve);
            toast.success(`Request ${approve ? 'approved' : 'rejected'} successfully`);

            const response = await accessRequestsAPI.getPending(cardSetId);
            setPendingRequests(response.data);

            if (response.data.length === 0) {
                setShowPendingRequestsModal(false);
            }
        } catch (error) {
            toast.error('Failed to respond to request');
        }
    };

    const getAccessIcon = (accessType, isPublic) => {
        switch (accessType) {
            case 'OWNER':
                return <Edit size={16} className="text-blue-600" />;
            case 'ACCESSIBLE':
                return isPublic ? <Globe size={16} className="text-gray-600" /> : <Users size={16} className="text-green-600" />;
            case 'PUBLIC':
                return <Globe size={16} className="text-gray-600" />;
            case 'PENDING':
                return <Clock size={16} className="text-yellow-600" />;
            case 'REJECTED':
                return <XCircle size={16} className="text-red-600" />;
            default:
                return <Lock size={16} className="text-gray-400" />;
        }
    };

    const getAccessLabel = (accessType, isPublic) => {
        switch (accessType) {
            case 'OWNER':
                return 'Owned';
            case 'ACCESSIBLE':
                return isPublic ? 'Public' : 'Shared';
            case 'PUBLIC':
                return 'Public';
            case 'PENDING':
                return 'Pending';
            case 'REJECTED':
                return 'Rejected';
            default:
                return 'Requires access';
        }
    };

    const getAccessBadgeStyle = (accessType, isPublic) => {
        switch (accessType) {
            case 'OWNER':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ACCESSIBLE':
                return isPublic ? 'bg-gray-100 text-gray-800 border-gray-200' : 'bg-green-100 text-green-800 border-green-200';
            case 'PUBLIC':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'REJECTED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const getCardBorderStyle = (accessType, stats) => {
        if (accessType === 'PENDING') return 'border-yellow-200 bg-yellow-50/30';
        if (accessType === 'REJECTED') return 'border-red-200 bg-red-50/30';
        if (stats.dueCards > 10) return 'border-red-200 bg-red-50/20 hover:border-red-300';
        if (stats.dueCards > 5) return 'border-orange-200 bg-orange-50/20 hover:border-orange-300';
        if (stats.dueCards > 0) return 'border-yellow-200 bg-yellow-50/20 hover:border-yellow-300';
        return 'border-gray-200 hover:border-gray-300';
    };

    const getDueCardsStyle = (dueCards) => {
        if (dueCards === 0) return 'text-green-600';
        if (dueCards > 10) return 'text-red-600 font-bold animate-pulse';
        if (dueCards > 5) return 'text-orange-600 font-semibold';
        return 'text-yellow-600 font-medium';
    };

    const getMasteryStyle = (masteredCards, totalCards) => {
        if (totalCards === 0) return 'text-gray-500';
        const percentage = (masteredCards / totalCards) * 100;
        if (percentage >= 80) return 'text-green-600 font-semibold';
        if (percentage >= 60) return 'text-yellow-600 font-medium';
        if (percentage >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    const getFilterButtonStyle = (filterKey, isActive, count) => {
        const baseStyle = 'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200';
        const activeStyle = 'bg-primary-600 text-white shadow-lg';
        const inactiveStyle = 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md';

        let style = `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`;

        if (filterKey === 'requests' && count > 0 && !isActive) {
            style += ' ring-2 ring-red-200';
        }

        return style;
    };

    const getCardSetStats = (cardSetId) => {
        return studyOverviews?.[cardSetId] || {
            totalCards: 0,
            dueCards: 0,
            masteredCards: 0,
            learningCards: 0
        };
    };

    const totalCardSets = cardSets?.length || 0;
    const ownedSets = cardSets?.filter(set => set.accessType === 'OWNER').length || 0;
    const sharedSets = cardSets?.filter(set => set.accessType === 'ACCESSIBLE' && !set.isPublic).length || 0;
    const publicSets = cardSets?.filter(set => set.isPublic).length || 0;
    const pendingRequestsCount = cardSets?.filter(set => set.accessType === 'PENDING').length || 0;

    const totalDueCards = cardSets?.reduce((sum, set) => {
        const stats = getCardSetStats(set.id);
        return sum + (stats.dueCards || 0);
    }, 0) || 0;

    if (isLoading) return <LoadingSpinner />;

    if (error) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <div className="mb-4">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium text-red-900 mb-2">Failed to load card sets</h3>
                    <p className="text-red-600 mb-6">Please check your connection and try again.</p>
                    <button
                        onClick={() => refetch()}
                        className="btn-primary hover:shadow-lg transition-shadow"
                    >
                        Retry
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Enhanced Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Your Card Sets</h1>
                        <p className="mt-1 text-gray-600">
                            Manage and study your flashcard collections
                            {totalDueCards > 0 && (
                                <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    totalDueCards > 10 ? 'bg-red-100 text-red-800' :
                                        totalDueCards > 5 ? 'bg-orange-100 text-orange-800' :
                                            'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {totalDueCards} cards due for review
                                </span>
                            )}
                        </p>
                    </div>
                    <Link
                        to="/create-cardset"
                        className="mt-4 sm:mt-0 btn-primary flex items-center space-x-2 hover:shadow-lg transition-all hover:scale-105"
                    >
                        <Plus size={20} />
                        <span>Create New Set</span>
                    </Link>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="card hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Sets</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {totalCardSets}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Target className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Owned Sets</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {ownedSets}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Shared Sets</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {sharedSets}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-lg ${
                                totalDueCards > 10 ? 'bg-red-100' :
                                    totalDueCards > 5 ? 'bg-orange-100' :
                                        totalDueCards > 0 ? 'bg-yellow-100' : 'bg-green-100'
                            }`}>
                                <Clock className={`w-6 h-6 ${
                                    totalDueCards > 10 ? 'text-red-600' :
                                        totalDueCards > 5 ? 'text-orange-600' :
                                            totalDueCards > 0 ? 'text-yellow-600' : 'text-green-600'
                                }`} />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Cards Due</p>
                                <p className={`text-2xl font-bold ${getDueCardsStyle(totalDueCards)}`}>
                                    {totalDueCards}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Filters and Search */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search card sets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex space-x-2">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'owned', label: 'Owned' },
                            { key: 'shared', label: 'Shared' },
                            { key: 'public', label: 'Public' },
                            { key: 'requests', label: `Requests${pendingRequestsCount > 0 ? ` (${pendingRequestsCount})` : ''}` },
                        ].map((filterOption) => (
                            <button
                                key={filterOption.key}
                                onClick={() => setFilter(filterOption.key)}
                                className={`${getFilterButtonStyle(filterOption.key, filter === filterOption.key, pendingRequestsCount)} ${
                                    filterOption.key === 'requests' && pendingRequestsCount > 0 ? 'relative' : ''
                                }`}
                            >
                                {filterOption.label}
                                {filterOption.key === 'requests' && pendingRequestsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Enhanced Card Sets Grid */}
                {filteredCardSets.length === 0 ? (
                    <div className="text-center py-12">
                        <Brain className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No card sets found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new card set.'}
                        </p>
                        {!searchTerm && (
                            <div className="mt-6">
                                <Link to="/create-cardset" className="btn-primary hover:shadow-lg transition-shadow">
                                    Create your first card set
                                </Link>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCardSets.map((cardSet) => {
                            const stats = getCardSetStats(cardSet.id);

                            return (
                                <div key={cardSet.id} className={`card-hover group transition-all duration-200 ${getCardBorderStyle(cardSet.accessType, stats)}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-2">
                                            {getAccessIcon(cardSet.accessType, cardSet.isPublic)}
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getAccessBadgeStyle(cardSet.accessType, cardSet.isPublic)}`}>
                                                {getAccessLabel(cardSet.accessType, cardSet.isPublic)}
                                            </span>
                                        </div>

                                        {cardSet.accessType === 'OWNER' && (
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    to={`/cardset/${cardSet.id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Edit size={16} />
                                                </Link>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(cardSet.id);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        fetchPendingRequests(cardSet.id);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all relative"
                                                    title="Manage access requests"
                                                >
                                                    <Mail size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4">
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                            {cardSet.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            by {cardSet.creatorName}
                                        </p>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <BookOpen size={14} />
                                                <span>{stats.totalCards} cards</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Clock size={14} />
                                                <span className={getDueCardsStyle(stats.dueCards)}>
                                                    {stats.dueCards} due
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {(
                                                cardSet.accessType === 'OWNER' ||
                                                cardSet.accessType === 'ACCESSIBLE' ||
                                                cardSet.accessType === 'PUBLIC') && stats.totalCards > 0 && (
                                                <Link
                                                    to={`/cardset/${cardSet.id}`}
                                                    className="btn-secondary flex items-center space-x-1 px-3 py-1 text-sm hover:shadow-md transition-shadow"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Eye size={14} />
                                                    <span>View</span>
                                                </Link>
                                            )}

                                            {/* Enhanced Study button */}
                                            {(
                                                cardSet.accessType === 'OWNER' ||
                                                cardSet.accessType === 'ACCESSIBLE' ||
                                                cardSet.accessType === 'PUBLIC') && stats.totalCards > 0 && (
                                                <Link
                                                    to={`/cardset/${cardSet.id}/study`}
                                                    className={`btn-primary flex items-center space-x-1 px-3 py-1 text-sm transition-all hover:shadow-md ${
                                                        stats.dueCards > 0 ? 'ring-2 ring-orange-200 animate-pulse' : ''
                                                    }`}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Play size={14} />
                                                    <span>Study</span>
                                                    {stats.dueCards > 0 && (
                                                        <span className="bg-white bg-opacity-20 px-1.5 py-0.5 rounded-full text-xs font-bold">
                                                            {stats.dueCards}
                                                        </span>
                                                    )}
                                                </Link>
                                            )}

                                            {/* Request Access button */}
                                            {!cardSet.isPublic &&
                                                cardSet.accessType !== 'OWNER' &&
                                                cardSet.accessType !== 'ACCESSIBLE' &&
                                                cardSet.accessType !== 'PENDING' &&
                                                cardSet.accessType !== 'REJECTED' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRequestAccess(cardSet);
                                                        }}
                                                        className="btn-primary flex items-center space-x-1 px-3 py-1 text-sm hover:shadow-md transition-all"
                                                    >
                                                        <UserPlus size={14} />
                                                        <span>Request</span>
                                                    </button>
                                                )}
                                        </div>
                                    </div>

                                    {/* Enhanced Progress indicator */}
                                    {stats.totalCards > 0 && (cardSet.accessType === 'OWNER' || cardSet.accessType === 'ACCESSIBLE') && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                <span className={getMasteryStyle(stats.masteredCards, stats.totalCards)}>
                                                    Mastered: {stats.masteredCards} / {stats.totalCards}
                                                </span>
                                                <span className="text-gray-400">
                                                    {Math.round((stats.masteredCards / stats.totalCards) * 100)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-500 ${
                                                        stats.masteredCards / stats.totalCards >= 0.8 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                                            stats.masteredCards / stats.totalCards >= 0.6 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                                stats.masteredCards / stats.totalCards >= 0.4 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                                                                    'bg-gradient-to-r from-red-400 to-red-600'
                                                    }`}
                                                    style={{
                                                        width: `${stats.totalCards > 0 ? (stats.masteredCards / stats.totalCards) * 100 : 0}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Enhanced Status message for pending/rejected requests */}
                                    {(cardSet.accessType === 'PENDING' || cardSet.accessType === 'REJECTED') && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className={`flex items-center justify-between text-xs rounded-lg p-2 ${
                                                cardSet.accessType === 'PENDING' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                                <div className="flex items-center space-x-2">
                                                    {cardSet.accessType === 'PENDING' ? (
                                                        <>
                                                            <Clock size={12} />
                                                            <span className="font-medium">Access request pending approval</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle size={12} />
                                                            <span className="font-medium">Access request was rejected</span>
                                                        </>
                                                    )}
                                                </div>
                                                {cardSet.accessType === 'PENDING' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRevokeRequest(cardSet);
                                                        }}
                                                        className="text-red-600 hover:text-red-800 underline font-medium transition-colors"
                                                        title="Cancel request"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Enhanced Cancel Request Confirmation Modal */}
            {showCancelRequestModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-yellow-100 rounded-full">
                                <AlertCircle className="w-6 h-6 text-yellow-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Cancel Access Request</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to cancel your access request for "{requestToCancel?.name}"?
                            You can request access again later if needed.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowCancelRequestModal(false);
                                    setRequestToCancel(null);
                                }}
                                className="btn-secondary hover:shadow-md transition-shadow"
                            >
                                Keep Request
                            </button>
                            <button
                                onClick={confirmRevokeRequest}
                                className="btn-danger hover:shadow-md transition-shadow"
                            >
                                Cancel Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Pending Access Requests Modal */}
            {showPendingRequestsModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto shadow-xl">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <Mail className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Pending Access Requests</h3>
                        </div>

                        {pendingRequests.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                <p className="text-gray-500">No pending requests</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingRequests.map((request) => (
                                    <div key={request.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-gray-100 rounded-full">
                                                    <UserPlus className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{request.requesterUsername}</p>
                                                    <p className="text-sm text-gray-500">Requested access to {request.cardSetName}</p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleRespondToRequest(request.cardSetId, request.id, true)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all hover:shadow-md"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleRespondToRequest(request.cardSetId, request.id, false)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:shadow-md"
                                                    title="Reject"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowPendingRequestsModal(false)}
                                className="btn-secondary hover:shadow-md transition-shadow"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default DashboardPage;