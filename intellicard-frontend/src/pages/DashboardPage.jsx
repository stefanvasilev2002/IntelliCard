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
    Mail
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

    // Fetch study overviews for all card sets to get actual card counts and due cards
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
                        // If study overview fails, set default values
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
            // Show non-public cardsets that user has access to but doesn't own
            return matchesSearch && cardSet.accessType === 'ACCESSIBLE' && !cardSet.isPublic;
        } else if (filter === 'public') {
            return matchesSearch && cardSet.isPublic;
        } else if (filter === 'requests') {
            // Show cardsets with pending or rejected access requests
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
            refetch(); // Refresh to update the access status
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
            refetch(); // Refresh to update the access status
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

            // Refresh pending requests
            const response = await accessRequestsAPI.getPending(cardSetId);
            setPendingRequests(response.data);

            // If no more pending requests, close modal
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

    const getCardSetStats = (cardSetId) => {
        return studyOverviews?.[cardSetId] || {
            totalCards: 0,
            dueCards: 0,
            masteredCards: 0,
            learningCards: 0
        };
    };

    // Calculate overall stats
    const totalCardSets = cardSets?.length || 0;
    const ownedSets = cardSets?.filter(set => set.accessType === 'OWNER').length || 0;
    const sharedSets = cardSets?.filter(set => set.accessType === 'ACCESSIBLE' && !set.isPublic).length || 0;
    const publicSets = cardSets?.filter(set => set.isPublic).length || 0;
    const pendingRequestsCount = cardSets?.filter(set => set.accessType === 'PENDING').length || 0;

    if (isLoading) return <LoadingSpinner />;

    if (error) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <p className="text-red-600">Failed to load card sets. Please try again.</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 btn-primary"
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
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Your Card Sets</h1>
                        <p className="mt-1 text-gray-600">
                            Manage and study your flashcard collections
                        </p>
                    </div>
                    <Link
                        to="/create-cardset"
                        className="mt-4 sm:mt-0 btn-primary flex items-center space-x-2"
                    >
                        <Plus size={20} />
                        <span>Create New Set</span>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="card">
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

                    <div className="card">
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

                    <div className="card">
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

                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Globe className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Public Sets</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {publicSets}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search card sets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
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
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filter === filterOption.key
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                } ${filterOption.key === 'requests' && pendingRequestsCount > 0 ? 'relative' : ''}`}
                            >
                                {filterOption.label}
                                {filterOption.key === 'requests' && pendingRequestsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Card Sets Grid */}
                {filteredCardSets.length === 0 ? (
                    <div className="text-center py-12">
                        <Brain className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No card sets found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new card set.'}
                        </p>
                        {!searchTerm && (
                            <div className="mt-6">
                                <Link to="/create-cardset" className="btn-primary">
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
                                <div key={cardSet.id} className="card-hover group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-2">
                                            {getAccessIcon(cardSet.accessType, cardSet.isPublic)}
                                            <span className="text-xs font-medium text-gray-500">
                                                {getAccessLabel(cardSet.accessType, cardSet.isPublic)}
                                            </span>
                                        </div>

                                        {cardSet.accessType === 'OWNER' && (
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    to={`/cardset/${cardSet.id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Edit size={16} />
                                                </Link>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(cardSet.id);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                {/* Show pending requests count if any */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        fetchPendingRequests(cardSet.id);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-green-600 transition-colors relative"
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
                                                <span className={stats.dueCards > 0 ? 'text-orange-600 font-medium' : ''}>
                                                    {stats.dueCards} due
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Link
                                                to={`/cardset/${cardSet.id}`}
                                                className="btn-secondary flex items-center space-x-1 px-3 py-1 text-sm"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Eye size={14} />
                                                <span>View</span>
                                            </Link>

                                            {/* Study button - only show if has access and cards exist */}
                                            {(
                                                cardSet.accessType === 'OWNER' ||
                                                cardSet.accessType === 'ACCESSIBLE' ||
                                                cardSet.accessType === 'PUBLIC') && stats.totalCards > 0 && (
                                                <Link
                                                    to={`/cardset/${cardSet.id}/study`}
                                                    className="btn-primary flex items-center space-x-1 px-3 py-1 text-sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Play size={14} />
                                                    <span>Study</span>
                                                </Link>
                                            )}

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
                                                        className="btn-primary flex items-center space-x-1 px-3 py-1 text-sm"
                                                    >
                                                        <UserPlus size={14} />
                                                        <span>Request</span>
                                                    </button>
                                                )}
                                        </div>
                                    </div>

                                    {/* Progress indicator for cards with different statuses */}
                                    {stats.totalCards > 0 && (cardSet.accessType === 'OWNER' || cardSet.accessType === 'ACCESSIBLE') && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>Learning: {stats.learningCards}</span>
                                                <span>Mastered: {stats.masteredCards}</span>
                                            </div>
                                            <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                                                <div
                                                    className="bg-green-500 h-1 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${stats.totalCards > 0 ? (stats.masteredCards / stats.totalCards) * 100 : 0}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Status message for pending/rejected requests */}
                                    {(cardSet.accessType === 'PENDING' || cardSet.accessType === 'REJECTED') && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className={`flex items-center justify-between text-xs ${
                                                cardSet.accessType === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                                <div className="flex items-center space-x-2">
                                                    {cardSet.accessType === 'PENDING' ? (
                                                        <>
                                                            <Clock size={12} />
                                                            <span>Access request pending approval</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle size={12} />
                                                            <span>Access request was rejected</span>
                                                        </>
                                                    )}
                                                </div>
                                                {cardSet.accessType === 'PENDING' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRevokeRequest(cardSet);
                                                        }}
                                                        className="text-red-600 hover:text-red-800 underline"
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
            {/* Cancel Request Confirmation Modal */}
            {showCancelRequestModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Access Request</h3>
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
                                className="btn-secondary"
                            >
                                Keep Request
                            </button>
                            <button
                                onClick={confirmRevokeRequest}
                                className="btn-danger"
                            >
                                Cancel Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Pending Access Requests Modal */}
            {showPendingRequestsModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Access Requests</h3>

                        {pendingRequests.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No pending requests</p>
                        ) : (
                            <div className="space-y-3">
                                {pendingRequests.map((request) => (
                                    <div key={request.id} className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{request.requesterUsername}</p>
                                                <p className="text-sm text-gray-500">Requested access to {request.cardSetName}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleRespondToRequest(request.cardSetId, request.id, true)}
                                                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleRespondToRequest(request.cardSetId, request.id, false)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
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
                                className="btn-secondary"
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