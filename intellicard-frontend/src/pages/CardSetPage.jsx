import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    Edit,
    Play,
    Plus,
    Trash2,
    Search,
    BookOpen,
    Clock,
    Target,
    Users,
    Globe,
    Lock,
    MoreHorizontal,
    Settings,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Zap,
    Wand2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Calendar
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import DocumentCardGenerator from '../components/DocumentCardGenerator';
import { cardSetsAPI, cardsAPI, studyAPI } from '../services/api';
import toast from 'react-hot-toast';
import EnhancedStudyOptions from "../components/EnhancedStudyOptions.jsx";
import {isElectron} from "@/utils/environment.js";

const CardSetPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCard, setEditingCard] = useState({ term: '', definition: '' });
    const [showDocumentGenerator, setShowDocumentGenerator] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage, setCardsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [reviewFilter, setReviewFilter] = useState('ALL');

    const { data: cardSet, isLoading: cardSetLoading, error: cardSetError } = useQuery({
        queryKey: ['cardSet', id],
        queryFn: async () => {
            const response = await cardSetsAPI.getById(id);
            return response.data;
        },
    });

    const { data: cards, isLoading: cardsLoading } = useQuery({
        queryKey: ['cards', id],
        queryFn: async () => {
            const response = await cardsAPI.getByCardSetId(id);
            return response.data;
        },
        enabled: !!id,
    });

    const { data: studyOverview } = useQuery({
        queryKey: ['studyOverview', id],
        queryFn: async () => {
            const response = await studyAPI.getOverview(id);
            return response.data;
        },
        enabled: !!id,
    });

    const deleteCardMutation = useMutation({
        mutationFn: async (cardId) => {
            await cardsAPI.delete(cardId);
        },
        onSuccess: () => {
            toast.success('Card deleted successfully');
            queryClient.invalidateQueries(['cards', id]);
            queryClient.invalidateQueries(['studyOverview', id]);
            setShowDeleteModal(false);
            setCardToDelete(null);
        },
        onError: () => {
            toast.error('Failed to delete card');
        },
    });

    const updateCardMutation = useMutation({
        mutationFn: async ({ cardId, cardData }) => {
            const response = await cardsAPI.update(cardId, cardData);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Card updated successfully');
            queryClient.invalidateQueries(['cards', id]);
            setShowEditModal(false);
        },
        onError: () => {
            toast.error('Failed to update card');
        },
    });

    const formatNextReviewDate = (nextReviewDate) => {
        if (!nextReviewDate){
            return {
                text: 'New',
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                isOverdue: false
            }
        }
        const reviewDate = new Date(nextReviewDate);
        const now = new Date();
        const diffTime = reviewDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                text: 'Overdue',
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                isOverdue: true
            };
        } else if (diffDays === 0) {
            return {
                text: 'Due today',
                color: 'text-orange-600',
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
                isDueToday: true
            };
        } else if (diffDays === 1) {
            return {
                text: 'Due tomorrow',
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
                isDueSoon: true
            };
        } else if (diffDays <= 7) {
            return {
                text: `Due in ${diffDays} days`,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                isDueSoon: true
            };
        } else {
            return {
                text: reviewDate.toLocaleDateString(),
                color: 'text-gray-600',
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-200',
                isFuture: true
            };
        }
    };

    const filteredCards = cards?.filter(card => {
        const matchesSearch = card.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.definition.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' ||
            (statusFilter === 'NEW' && (!card.status || card.status === 'NEW')) ||
            card.status === statusFilter;

        const reviewInfo = formatNextReviewDate(card.nextReviewDate);
        const matchesReview = reviewFilter === 'ALL' ||
            (reviewFilter === 'OVERDUE' && reviewInfo?.isOverdue) ||
            (reviewFilter === 'DUE_TODAY' && reviewInfo?.isDueToday) ||
            (reviewFilter === 'DUE_SOON' && reviewInfo?.isDueSoon) ||
            (reviewFilter === 'FUTURE' && reviewInfo?.isFuture) ||
            (reviewFilter === 'NEW' && !card.nextReviewDate);

        return matchesSearch && matchesStatus && matchesReview;
    }) || [];

    const totalCards = filteredCards.length;
    const totalPages = Math.ceil(totalCards / cardsPerPage);
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const currentCards = filteredCards.slice(startIndex, endIndex);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, reviewFilter]);

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const goToFirstPage = () => goToPage(1);
    const goToLastPage = () => goToPage(totalPages);
    const goToPreviousPage = () => goToPage(currentPage - 1);
    const goToNextPage = () => goToPage(currentPage + 1);

    const handleCardsPerPageChange = (newCardsPerPage) => {
        setCardsPerPage(newCardsPerPage);
        setCurrentPage(1);
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            const halfVisible = Math.floor(maxVisiblePages / 2);
            let startPage = Math.max(1, currentPage - halfVisible);
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
        }

        return pageNumbers;
    };

    const handleDeleteCard = (card) => {
        setCardToDelete(card);
        setShowDeleteModal(true);
    };

    const confirmDeleteCard = () => {
        if (cardToDelete) {
            deleteCardMutation.mutate(cardToDelete.id);
        }
    };

    const handleEditCard = (card) => {
        setEditingCard({
            id: card.id,
            term: card.term,
            definition: card.definition
        });
        setShowEditModal(true);
    };

    const handleUpdateCard = () => {
        if (!editingCard.term.trim() || !editingCard.definition.trim()) {
            toast.error('Both term and definition are required');
            return;
        }

        updateCardMutation.mutate({
            cardId: editingCard.id,
            cardData: {
                term: editingCard.term,
                definition: editingCard.definition
            }
        });
    };

    const handleCardsGenerated = (generatedCards) => {
        queryClient.invalidateQueries(['cards', id]);
        queryClient.invalidateQueries(['studyOverview', id]);

        toast.success(`Successfully generated ${generatedCards.length} cards! 🎉`, {
            duration: 4000,
            icon: '✨'
        });
    };

    const handleStartStudy = (studyConfig) => {
        sessionStorage.setItem('studyConfig', JSON.stringify(studyConfig));

        navigate(`/cardset/${id}/study`);
    };

    const getAccessIcon = (accessType) => {
        switch (accessType) {
            case 'OWNER':
                return <Edit size={16} className="text-blue-600" />;
            case 'ACCESSIBLE':
                return <Users size={16} className="text-green-600" />;
            case 'PUBLIC':
                return <Globe size={16} className="text-gray-600" />;
            default:
                return <Lock size={16} className="text-gray-400" />;
        }
    };

    const getAccessLabel = (accessType) => {
        switch (accessType) {
            case 'OWNER':
                return 'Owned by you';
            case 'ACCESSIBLE':
                return 'Shared with you';
            case 'PUBLIC':
                return 'Public set';
            default:
                return 'Unknown';
        }
    };

    const getAccessBadgeStyle = (accessType) => {
        switch (accessType) {
            case 'OWNER':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ACCESSIBLE':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'PUBLIC':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'MASTERED':
                return <CheckCircle size={14} className="text-green-600" />;
            case 'LEARNING':
                return <TrendingUp size={14} className="text-yellow-600" />;
            case 'REVIEW':
                return <AlertCircle size={14} className="text-orange-600" />;
            default:
                return <Zap size={14} className="text-gray-500" />;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'MASTERED':
                return 'text-green-700 bg-green-50 border border-green-200';
            case 'LEARNING':
                return 'text-yellow-700 bg-yellow-50 border border-yellow-200';
            case 'REVIEW':
                return 'text-orange-700 bg-orange-50 border border-orange-200';
            default:
                return 'text-gray-600 bg-gray-50 border border-gray-200';
        }
    };

    const getCardBorderStyle = (status) => {
        switch (status) {
            case 'MASTERED':
                return 'border-green-300 hover:border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg shadow-green-100/50';
            case 'LEARNING':
                return 'border-yellow-300 hover:border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg shadow-yellow-100/50';
            case 'REVIEW':
                return 'border-orange-300 hover:border-orange-400 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg shadow-orange-100/50';
            default:
                return 'border-blue-200 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-100/50';
        }
    };

    const getMasteryPercentage = () => {
        if (!studyOverview || studyOverview.totalCards === 0) return 0;
        return Math.round((studyOverview.masteredCards / studyOverview.totalCards) * 100);
    };

    const getMasteryStyle = () => {
        const percentage = getMasteryPercentage();
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        if (percentage >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    };

    const getCardPriorityStyle = (card) => {
        const reviewInfo = formatNextReviewDate(card.nextReviewDate);

        if (reviewInfo?.isOverdue) {
            return 'ring-2 ring-red-300 ring-opacity-50 border-red-300';
        } else if (reviewInfo?.isDueToday) {
            return 'ring-2 ring-orange-300 ring-opacity-50 border-orange-300';
        }

        return getCardBorderStyle(card.status);
    };

    if (cardSetLoading) return <LoadingSpinner />;

    if (cardSetError) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <div className="mb-4">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium text-red-900 mb-2">Failed to load card set</h3>
                    <p className="text-red-600 mb-6">Please check your connection and try again.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-primary hover:shadow-lg transition-shadow"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const isOwner = cardSet?.accessType === 'OWNER';
    const masteryPercentage = getMasteryPercentage();

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center space-x-4 mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{cardSet?.name}</h1>
                            {getAccessIcon(cardSet?.accessType)}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getAccessBadgeStyle(cardSet?.accessType)}`}>
                                {getAccessLabel(cardSet?.accessType)}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>by {cardSet?.creatorName}</span>
                            {masteryPercentage > 0 && (
                                <span className={`font-medium ${getMasteryStyle()}`}>
                                    {masteryPercentage}% mastered
                                </span>
                            )}
                        </div>
                    </div>

                    {isOwner && (
                        <div className="relative group">
                            <button className="btn-secondary flex items-center space-x-2 hover:bg-gray-100 hover:shadow-md transition-all">
                                <Settings size={16} />
                                <span>Manage</span>
                                <MoreHorizontal size={16} />
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                <Link
                                    to={`/cardset/${id}/add-card`}
                                    className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Plus size={14} />
                                    <span>Add New Card</span>
                                </Link>
                                {!isElectron() && (
                                    <button
                                        onClick={() => setShowDocumentGenerator(true)}
                                        className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <Wand2 size={14} />
                                        <span>Generate from Document</span>
                                    </button>
                                )}
                                <Link
                                    to={`/cardset/${id}/edit`}
                                    className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-b-lg transition-colors"
                                >
                                    <Edit size={14} />
                                    <span>Edit Card Set</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-8">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-blue-900 mb-1 flex items-center space-x-2">
                                    <Play className="w-6 h-6 text-blue-600" />
                                    <span>Ready to Study?</span>
                                </h2>
                                <p className="text-blue-700 text-sm">
                                    Choose your study mode and start learning
                                </p>
                            </div>
                            {studyOverview?.dueCards > 0 && (
                                <div className="bg-orange-100 border border-orange-300 rounded-lg px-3 py-2 text-center">
                                    <div className="text-orange-700 text-xs font-medium">Cards Due</div>
                                    <div className="text-orange-800 text-xl font-bold">{studyOverview.dueCards}</div>
                                </div>
                            )}
                        </div>

                        <EnhancedStudyOptions
                            cardSetId={id}
                            cards={cards}
                            studyOverview={studyOverview}
                            isOwner={isOwner}
                            onStartStudy={handleStartStudy}
                        />
                    </div>
                </div>

                {isOwner && (
                    <div className={`grid grid-cols-1 gap-4 mb-8 ${isElectron() ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                        <Link
                            to={`/cardset/${id}/add-card`}
                            className="card-hover flex items-center space-x-4 p-4 transition-all hover:shadow-lg hover:scale-105"
                        >
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Plus className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Add New Card</h3>
                                <p className="text-sm text-gray-500">Create a new flashcard manually</p>
                            </div>
                        </Link>

                        {!isElectron() && (
                            <button
                                onClick={() => setShowDocumentGenerator(true)}
                                className="card-hover flex items-center space-x-4 p-4 transition-all hover:shadow-lg hover:scale-105 text-left"
                            >
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Wand2 className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Generate from Document</h3>
                                    <p className="text-sm text-gray-500">Upload PDF/TXT and create cards with AI</p>
                                </div>
                            </button>
                        )}

                        <Link
                            to={`/cardset/${id}/edit`}
                            className="card-hover flex items-center space-x-4 p-4 transition-all hover:shadow-lg hover:scale-105"
                        >
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Settings className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Edit Card Set</h3>
                                <p className="text-sm text-gray-500">Manage cards and settings</p>
                            </div>
                        </Link>
                    </div>
                )}

                <div className="card">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">All Cards</h2>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search cards..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input pl-9 w-64 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                    <label className="text-sm text-gray-600 whitespace-nowrap">Status:</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="input py-1 px-2 text-sm w-28"
                                    >
                                        <option value="ALL">All</option>
                                        <option value="NEW">New</option>
                                        <option value="LEARNING">Learning</option>
                                        <option value="REVIEW">Review</option>
                                        <option value="MASTERED">Mastered</option>
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <label className="text-sm text-gray-600 whitespace-nowrap">Review:</label>
                                    <select
                                        value={reviewFilter}
                                        onChange={(e) => setReviewFilter(e.target.value)}
                                        className="input py-1 px-2 text-sm w-32"
                                    >
                                        <option value="ALL">All</option>
                                        <option value="OVERDUE">Overdue</option>
                                        <option value="DUE_TODAY">Due Today</option>
                                        <option value="DUE_SOON">Due Soon</option>
                                        <option value="FUTURE">Future</option>
                                        <option value="NEW">Never Studied</option>
                                    </select>
                                </div>

                                {totalCards > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <label className="text-sm text-gray-600 whitespace-nowrap">Show:</label>
                                        <select
                                            value={cardsPerPage}
                                            onChange={(e) => handleCardsPerPageChange(Number(e.target.value))}
                                            className="input py-1 px-2 text-sm w-16"
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {(statusFilter !== 'ALL' || reviewFilter !== 'ALL' || searchTerm) && (
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-600">Active filters:</span>
                            {searchTerm && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                    Search: "{searchTerm}"
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {statusFilter !== 'ALL' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                    Status: {statusFilter}
                                    <button
                                        onClick={() => setStatusFilter('ALL')}
                                        className="ml-1 text-green-600 hover:text-green-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {reviewFilter !== 'ALL' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                    Review: {reviewFilter.replace('_', ' ').toLowerCase()}
                                    <button
                                        onClick={() => setReviewFilter('ALL')}
                                        className="ml-1 text-purple-600 hover:text-purple-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('ALL');
                                    setReviewFilter('ALL');
                                }}
                                className="text-xs text-gray-500 hover:text-gray-700 underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}

                    {totalCards > 0 && (
                        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                            <div>
                                Showing {startIndex + 1}-{Math.min(endIndex, totalCards)} of {totalCards} cards
                                {(searchTerm || statusFilter !== 'ALL' || reviewFilter !== 'ALL') && cards &&
                                    ` (filtered from ${cards.length} total)`
                                }
                            </div>
                        </div>
                    )}

                    {cardsLoading ? (
                        <LoadingSpinner size="medium" message="Loading cards..." />
                    ) : totalCards === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                {(searchTerm || statusFilter !== 'ALL' || reviewFilter !== 'ALL')
                                    ? 'No cards match your filters'
                                    : 'No cards yet'
                                }
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {(searchTerm || statusFilter !== 'ALL' || reviewFilter !== 'ALL')
                                    ? 'Try adjusting your search terms or filters.'
                                    : isOwner
                                        ? 'Get started by adding your first card.'
                                        : 'This card set doesn\'t have any cards yet.'
                                }
                            </p>
                            {!(searchTerm || statusFilter !== 'ALL' || reviewFilter !== 'ALL') && isOwner && (
                                <div className="mt-6 space-y-3">
                                    <Link to={`/cardset/${id}/add-card`} className="btn-primary hover:shadow-lg transition-shadow mr-3">
                                        Add your first card
                                    </Link>
                                    {!isElectron() && (
                                        <button
                                            onClick={() => setShowDocumentGenerator(true)}
                                            className="btn-secondary hover:shadow-lg transition-shadow flex items-center space-x-2 mx-auto"
                                        >
                                            <Wand2 size={16} />
                                            <span>Generate from document</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-6">
                                {currentCards.map((card, index) => {
                                    const reviewInfo = formatNextReviewDate(card.nextReviewDate);

                                    return (
                                        <div key={card.id} className={`relative group rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${getCardPriorityStyle(card)} overflow-hidden`}>
                                            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50/50 rounded-xl"></div>

                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                                reviewInfo?.isOverdue ? 'bg-gradient-to-b from-red-400 to-red-600' :
                                                    reviewInfo?.isDueToday ? 'bg-gradient-to-b from-orange-400 to-orange-600' :
                                                        card.status === 'MASTERED' ? 'bg-gradient-to-b from-green-400 to-green-600' :
                                                            card.status === 'LEARNING' ? 'bg-gradient-to-b from-yellow-400 to-yellow-600' :
                                                                card.status === 'REVIEW' ? 'bg-gradient-to-b from-orange-400 to-orange-600' :
                                                                    'bg-gradient-to-b from-blue-400 to-blue-600'
                                            }`}></div>

                                            <div className="absolute top-4 right-4 flex items-center space-x-2">
                                                {reviewInfo && (
                                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${reviewInfo.bgColor} ${reviewInfo.color} border ${reviewInfo.borderColor}`}>
                                                        <Calendar size={12} />
                                                        <span>{reviewInfo.text}</span>
                                                    </div>
                                                )}
                                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                                    #{startIndex + index + 1}
                                                </div>
                                            </div>

                                            <div className="relative z-10 flex items-start justify-between">
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg shadow-sm">
                                                                <BookOpen className="w-4 h-4 text-blue-600" />
                                                            </div>
                                                            <label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                                                Term
                                                            </label>
                                                        </div>
                                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 min-h-[80px] flex items-center shadow-inner">
                                                            <p className="text-gray-900 font-medium text-lg leading-relaxed break-words"
                                                               style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                                                               title={card.term}>
                                                                {truncateText(card.term, 150)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg shadow-sm">
                                                                <Target className="w-4 h-4 text-emerald-600" />
                                                            </div>
                                                            <label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                                                Definition
                                                            </label>
                                                        </div>
                                                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 min-h-[80px] flex items-center shadow-inner">
                                                            <p className="text-gray-900 leading-relaxed break-words"
                                                               style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                                                               title={card.definition}>
                                                                {truncateText(card.definition, 200)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {isOwner && (
                                                    <div className="ml-6 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                        <button
                                                            onClick={() => handleEditCard(card)}
                                                            className="p-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all transform hover:scale-110 shadow-lg hover:shadow-xl"
                                                            title="Edit card"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCard(card)}
                                                            className="p-3 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all transform hover:scale-110 shadow-lg hover:shadow-xl"
                                                            title="Delete card"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="relative z-10 mt-6 pt-4 border-t border-gray-200/50">
                                                <div className="flex items-center justify-between">
                                                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium shadow-sm ${getStatusStyle(card.status)} backdrop-blur-sm`}>
                                                        {getStatusIcon(card.status)}
                                                        <span>{card.status || 'NEW'}</span>
                                                    </div>

                                                    <div className="flex items-center space-x-4 text-sm">
                                                        <div className="flex items-center space-x-1 text-gray-600">
                                                            <Clock size={14} className="text-gray-400" />
                                                            <span>Studied <span className="font-semibold text-gray-800">{card.timesReviewed || 0}</span> times</span>
                                                        </div>

                                                        {card.timesCorrect !== undefined && card.timesReviewed > 0 && (
                                                            <div className="flex items-center space-x-1 text-gray-600">
                                                                <CheckCircle size={14} className="text-green-500" />
                                                                <span>
                                                                    <span className="font-semibold text-gray-800">{Math.round((card.timesCorrect / card.timesReviewed) * 100)}%</span> correct
                                                                </span>
                                                            </div>
                                                        )}

                                                        {reviewInfo && (
                                                            <div className={`flex items-center space-x-1 ${reviewInfo.color}`}>
                                                                <Calendar size={14} />
                                                                <span className="font-medium">{reviewInfo.text}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="absolute inset-0 opacity-5 rounded-xl" style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                                            }}></div>
                                        </div>
                                    );
                                })}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={goToFirstPage}
                                            disabled={currentPage === 1}
                                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg transition-all"
                                            title="First page"
                                        >
                                            <ChevronsLeft size={18} />
                                        </button>
                                        <button
                                            onClick={goToPreviousPage}
                                            disabled={currentPage === 1}
                                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg transition-all"
                                            title="Previous page"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                    </div>

                                    <div className="flex items-center space-x-1">
                                        {getPageNumbers().map((pageNumber) => (
                                            <button
                                                key={pageNumber}
                                                onClick={() => goToPage(pageNumber)}
                                                className={`px-3 py-2 text-sm rounded-lg transition-all ${
                                                    currentPage === pageNumber
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={goToNextPage}
                                            disabled={currentPage === totalPages}
                                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg transition-all"
                                            title="Next page"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                        <button
                                            onClick={goToLastPage}
                                            disabled={currentPage === totalPages}
                                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg transition-all"
                                            title="Last page"
                                        >
                                            <ChevronsRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {showEditModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Card</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Term
                                    </label>
                                    <textarea
                                        value={editingCard.term}
                                        onChange={(e) => setEditingCard({ ...editingCard, term: e.target.value })}
                                        className={`input resize-none ${
                                            editingCard.term.length > 230 ? 'border-red-500 focus:ring-red-500' :
                                                editingCard.term.length > 200 ? 'border-orange-500 focus:ring-orange-500' :
                                                    'focus:ring-blue-500'
                                        }`}
                                        maxLength={255}
                                        rows={2}
                                        placeholder="Front of the card"
                                    />
                                    <p className={`text-xs mt-1 ${
                                        editingCard.term.length > 230 ? 'text-red-600' :
                                            editingCard.term.length > 200 ? 'text-orange-600' : 'text-gray-400'
                                    }`}>
                                        {editingCard.term.length}/255
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Definition
                                    </label>
                                    <textarea
                                        value={editingCard.definition}
                                        onChange={(e) => setEditingCard({ ...editingCard, definition: e.target.value })}
                                        className={`input resize-none ${
                                            editingCard.definition.length > 230 ? 'border-red-500 focus:ring-red-500' :
                                                editingCard.definition.length > 200 ? 'border-orange-500 focus:ring-orange-500' :
                                                    'focus:ring-blue-500'
                                        }`}
                                        maxLength={255}
                                        rows={3}
                                        placeholder="Back of the card"
                                    />
                                    <p className={`text-xs mt-1 ${
                                        editingCard.definition.length > 230 ? 'text-red-600' :
                                            editingCard.definition.length > 200 ? 'text-orange-600' : 'text-gray-400'
                                    }`}>
                                        {editingCard.definition.length}/255
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="btn-secondary hover:bg-gray-100"
                                    disabled={updateCardMutation.isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateCard}
                                    className="btn-primary hover:bg-blue-700"
                                    disabled={updateCardMutation.isPending}
                                >
                                    {updateCardMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Delete Card</h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to delete this card? This action cannot be undone and will remove all progress data.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="btn-secondary hover:bg-gray-100"
                                    disabled={deleteCardMutation.isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteCard}
                                    className="btn-danger hover:bg-red-700"
                                    disabled={deleteCardMutation.isPending}
                                >
                                    {deleteCardMutation.isPending ? 'Deleting...' : 'Delete Card'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!isElectron() && showDocumentGenerator && (
                    <DocumentCardGenerator
                        cardSetId={id}
                        onCardsGenerated={handleCardsGenerated}
                        onClose={() => setShowDocumentGenerator(false)}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default CardSetPage;