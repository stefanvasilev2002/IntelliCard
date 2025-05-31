import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Edit,
    Settings,
    Eye,
    MoreHorizontal,
    RotateCcw,
    TrendingUp,
    Clock,
    Target,
    Brain,
    CheckCircle,
    XCircle,
    AlertCircle,
    Zap
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { cardsAPI, studyAPI, cardSetsAPI } from '../services/api';
import toast from 'react-hot-toast';

const StudyPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCard, setEditingCard] = useState({ term: '', definition: '' });
    const [studyStats, setStudyStats] = useState({
        cardsStudied: 0,
        correctAnswers: 0,
        sessionStartTime: Date.now()
    });

    // Fetch card set details
    const { data: cardSet } = useQuery({
        queryKey: ['cardSet', id],
        queryFn: async () => {
            const response = await cardSetsAPI.getById(id);
            return response.data;
        },
    });

    // Fetch cards for study
    const { data: cards, isLoading, error, refetch } = useQuery({
        queryKey: ['studyCards', id],
        queryFn: async () => {
            const response = await cardsAPI.getByCardSetId(id);
            return response.data;
        },
        enabled: !!id,
    });

    // Fetch study overview
    const { data: studyOverview } = useQuery({
        queryKey: ['studyOverview', id],
        queryFn: async () => {
            const response = await studyAPI.getOverview(id);
            return response.data;
        },
        enabled: !!id,
    });

    // Review card mutation
    const reviewCardMutation = useMutation({
        mutationFn: async ({ cardId, correct, difficulty }) => {
            await studyAPI.reviewCard(cardId, correct, difficulty);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['studyCards', id]);
            queryClient.invalidateQueries(['studyOverview', id]);

            // Update session stats
            setStudyStats(prev => ({
                ...prev,
                cardsStudied: prev.cardsStudied + 1,
                correctAnswers: prev.correctAnswers + (variables.correct ? 1 : 0)
            }));
        },
    });

    // Update card mutation
    const updateCardMutation = useMutation({
        mutationFn: async ({ cardId, cardData }) => {
            const response = await cardsAPI.update(cardId, cardData);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Card updated successfully');
            refetch();
            setShowEditModal(false);
        },
        onError: () => {
            toast.error('Failed to update card');
        },
    });

    const currentCard = cards?.[currentCardIndex];
    const isOwner = cardSet?.accessType === 'OWNER';
    const progress = cards ? ((currentCardIndex + 1) / cards.length) * 100 : 0;
    const sessionTime = Math.floor((Date.now() - studyStats.sessionStartTime) / 1000 / 60);
    const accuracy = studyStats.cardsStudied > 0 ? Math.round((studyStats.correctAnswers / studyStats.cardsStudied) * 100) : 0;

    const flipCard = () => {
        setIsFlipped(!isFlipped);
    };

    const nextCard = () => {
        if (currentCardIndex < (cards?.length - 1)) {
            setCurrentCardIndex(currentCardIndex + 1);
            setIsFlipped(false);
        }
    };

    const previousCard = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
            setIsFlipped(false);
        }
    };

    const resetSession = () => {
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setStudyStats({
            cardsStudied: 0,
            correctAnswers: 0,
            sessionStartTime: Date.now()
        });
    };

    const handleReview = (correct, difficulty = 3) => {
        if (currentCard) {
            reviewCardMutation.mutate({
                cardId: currentCard.id,
                correct,
                difficulty
            });

            // Auto advance to next card after review
            setTimeout(() => {
                if (currentCardIndex < (cards?.length - 1)) {
                    nextCard();
                } else {
                    // Study session complete
                    toast.success('Study session complete! 🎉');
                    navigate(`/cardset/${id}`);
                }
            }, 500);
        }
    };

    const openEditModal = () => {
        if (currentCard) {
            setEditingCard({
                term: currentCard.term,
                definition: currentCard.definition
            });
            setShowEditModal(true);
        }
    };

    const handleUpdateCard = () => {
        if (!editingCard.term.trim() || !editingCard.definition.trim()) {
            toast.error('Both term and definition are required');
            return;
        }

        updateCardMutation.mutate({
            cardId: currentCard.id,
            cardData: {
                term: editingCard.term,
                definition: editingCard.definition
            }
        });
    };

    const getDifficultyLabel = (level) => {
        const labels = {
            1: { text: 'Again', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
            2: { text: 'Hard', color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertCircle },
            3: { text: 'Good', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
            4: { text: 'Easy', color: 'text-blue-600', bg: 'bg-blue-50', icon: Zap }
        };
        return labels[level] || labels[3];
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    previousCard();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextCard();
                    break;
                case ' ':
                    e.preventDefault();
                    flipCard();
                    break;
                case '1':
                    if (isFlipped) handleReview(false, 1);
                    break;
                case '2':
                    if (isFlipped) handleReview(false, 2);
                    break;
                case '3':
                    if (isFlipped) handleReview(true, 3);
                    break;
                case '4':
                    if (isFlipped) handleReview(true, 4);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isFlipped, currentCardIndex, cards?.length]);

    if (isLoading) return <LoadingSpinner />;

    if (error || !cards || cards.length === 0) {
        return (
            <DashboardLayout>
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center space-x-4 mb-8">
                        <button
                            onClick={() => navigate(`/cardset/${id}`)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Study Mode</h1>
                    </div>

                    <div className="card text-center py-12">
                        <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {cards?.length === 0 ? 'No cards available for study' : 'Failed to load cards'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {cards?.length === 0
                                ? 'This card set doesn\'t have any cards yet. Add some cards to start studying.'
                                : 'There was an error loading the cards. Please try again.'
                            }
                        </p>
                        <Link to={`/cardset/${id}`} className="btn-primary">
                            Back to Card Set
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(`/cardset/${id}`)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Study Mode</h1>
                            <p className="text-gray-600">{cardSet?.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={resetSession}
                            className="btn-secondary flex items-center space-x-2"
                            title="Reset session"
                        >
                            <RotateCcw size={16} />
                            <span className="hidden sm:inline">Reset</span>
                        </button>

                        <Link to={`/cardset/${id}`} className="btn-secondary flex items-center space-x-2">
                            <Eye size={16} />
                            <span className="hidden sm:inline">View All</span>
                        </Link>

                        {isOwner && (
                            <div className="relative group">
                                <button className="btn-secondary p-2">
                                    <MoreHorizontal size={16} />
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                    <button
                                        onClick={openEditModal}
                                        className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-t-lg"
                                    >
                                        <Edit size={14} />
                                        <span>Edit Card</span>
                                    </button>
                                    <Link
                                        to={`/cardset/${id}/edit`}
                                        className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-b-lg"
                                    >
                                        <Settings size={14} />
                                        <span>Edit Set</span>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Progress</p>
                                <p className="text-lg font-bold text-gray-900">{Math.round(progress)}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Target className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Accuracy</p>
                                <p className="text-lg font-bold text-gray-900">{accuracy}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Brain className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Studied</p>
                                <p className="text-lg font-bold text-gray-900">{studyStats.cardsStudied}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Time</p>
                                <p className="text-lg font-bold text-gray-900">{sessionTime}m</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Study Instructions */}
                <div className="card mb-6">
                    <div className="text-center">
                        <p className="text-gray-700 mb-2">
                            <span className="font-medium">Click the card to flip it</span>, then rate your knowledge
                        </p>
                        <p className="text-sm text-gray-500">
                            Use arrow keys to navigate • Space to flip • 1-4 keys to rate
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Card {currentCardIndex + 1} of {cards?.length}</span>
                        <span>{cards?.length - currentCardIndex - 1} remaining</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Card Container */}
                <div className="flex justify-center mb-8">
                    <div className="relative w-full max-w-2xl h-96">
                        <div
                            className={`relative w-full h-full transition-transform duration-500 cursor-pointer ${
                                isFlipped ? 'scale-105' : ''
                            }`}
                            onClick={flipCard}
                            style={{
                                transformStyle: 'preserve-3d',
                                perspective: '1000px'
                            }}
                        >
                            {!isFlipped ? (
                                /* Front of card */
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-xl flex items-center justify-center p-8 border border-blue-300">
                                    <div className="text-center">
                                        <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-blue-400 bg-opacity-20 text-blue-100 text-xs font-medium rounded-full mb-4">
                        TERM
                      </span>
                                        </div>
                                        <p className="text-white text-2xl font-semibold mb-6 leading-relaxed">
                                            {currentCard?.term}
                                        </p>
                                        <p className="text-blue-100 text-sm opacity-80">
                                            Click to see definition
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* Back of card */
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-xl flex items-center justify-center p-8 border border-orange-300">
                                    <div className="text-center">
                                        <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-orange-400 bg-opacity-20 text-orange-100 text-xs font-medium rounded-full mb-4">
                        DEFINITION
                      </span>
                                        </div>
                                        <p className="text-white text-xl font-medium leading-relaxed">
                                            {currentCard?.definition}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={previousCard}
                        disabled={currentCardIndex === 0}
                        className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">
                            {currentCardIndex + 1} / {cards?.length}
                        </p>
                        {studyOverview && (
                            <p className="text-sm text-gray-500">
                                {studyOverview.dueCards} due for review
                            </p>
                        )}
                    </div>

                    <button
                        onClick={nextCard}
                        disabled={currentCardIndex === (cards?.length - 1)}
                        className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Review Buttons (shown only when flipped) */}
                {isFlipped && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                        {[1, 2, 3, 4].map((level) => {
                            const config = getDifficultyLabel(level);
                            const Icon = config.icon;
                            return (
                                <button
                                    key={level}
                                    onClick={() => handleReview(level >= 3, level)}
                                    className={`${config.bg} ${config.color} border border-current border-opacity-20 py-4 px-4 rounded-lg font-medium transition-all text-sm hover:shadow-md hover:scale-105 active:scale-95`}
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <Icon size={16} />
                                        <span>{config.text} ({level})</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Card Status Indicator */}
                {currentCard?.status && (
                    <div className="flex justify-center mt-6">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                            <span>Status: {currentCard.status}</span>
                            {currentCard.timesReviewed > 0 && (
                                <span>• Reviewed {currentCard.timesReviewed} times</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Edit Card Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Card</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Term
                                    </label>
                                    <textarea
                                        value={editingCard.term}
                                        onChange={(e) => setEditingCard({ ...editingCard, term: e.target.value })}
                                        className="input resize-none"
                                        rows={2}
                                        placeholder="Front of the card"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Definition
                                    </label>
                                    <textarea
                                        value={editingCard.definition}
                                        onChange={(e) => setEditingCard({ ...editingCard, definition: e.target.value })}
                                        className="input resize-none"
                                        rows={3}
                                        placeholder="Back of the card"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="btn-secondary"
                                    disabled={updateCardMutation.isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateCard}
                                    className="btn-primary"
                                    disabled={updateCardMutation.isPending}
                                >
                                    {updateCardMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudyPage;