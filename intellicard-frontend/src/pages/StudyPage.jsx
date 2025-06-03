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
    Target,
    Brain,
    CheckCircle,
    XCircle,
    AlertCircle,
    Zap,
    BarChart3,
    Timer,
    Flame,
    Trophy,
    Shuffle,
    Pause,
    Play,
    Filter
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { cardsAPI, studyAPI, cardSetsAPI } from '../services/api';
import toast from 'react-hot-toast';

const StudyPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [studyConfig, setStudyConfig] = useState(null);
    const [studyCards, setStudyCards] = useState([]);
    const [originalCards, setOriginalCards] = useState([]);

    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCard, setEditingCard] = useState({ term: '', definition: '' });
    const [studyStats, setStudyStats] = useState({
        cardsStudied: 0,
        correctAnswers: 0,
        sessionStartTime: Date.now(),
        streak: 0,
        bestStreak: 0
    });
    const [isAutoFlip, setIsAutoFlip] = useState(false);
    const [autoFlipDelay, setAutoFlipDelay] = useState(3);
    const [showStats, setShowStats] = useState(false);
    const [cardHistory, setCardHistory] = useState([]);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [isPaused, setIsPaused] = useState(false);

    const { data: cardSet } = useQuery({
        queryKey: ['cardSet', id],
        queryFn: async () => {
            const response = await cardSetsAPI.getById(id);
            return response.data;
        },
    });

    const { data: allCards, isLoading, error, refetch } = useQuery({
        queryKey: ['studyCards', id],
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

    useEffect(() => {
        if (allCards && allCards.length > 0) {
            setOriginalCards(allCards);

            const storedConfig = sessionStorage.getItem('studyConfig');
            if (storedConfig) {
                try {
                    const config = JSON.parse(storedConfig);
                    setStudyConfig(config);

                    let cardsToStudy = config.cards || allCards;

                    if (config.config?.shuffle) {
                        cardsToStudy = shuffleArray([...cardsToStudy]);
                    }

                    setStudyCards(cardsToStudy);

                    sessionStorage.removeItem('studyConfig');

                    const modeLabels = {
                        'smart': 'Smart Study (New & Due Cards)',
                        'due-only': 'Due Cards Only',
                        'new-only': 'New Cards Only',
                        'mastered': 'Mastered Cards Review',
                        'all': 'All Cards'
                    };

                    toast.success(`${modeLabels[config.studyType] || 'Study Mode'}: ${cardsToStudy.length} cards`, {
                        icon: '📚',
                        duration: 3000
                    });

                } catch (error) {
                    setStudyCards(allCards);
                }
            } else {
                setStudyCards(allCards);
            }
        }
    }, [allCards]);

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const reviewCardMutation = useMutation({
        mutationFn: async ({ cardId, correct, difficulty }) => {
            await studyAPI.reviewCard(cardId, correct, difficulty);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['studyCards', id]);
            queryClient.invalidateQueries(['studyOverview', id]);

            const isCorrect = variables.correct;
            setStudyStats(prev => {
                const newStreak = isCorrect ? prev.streak + 1 : 0;
                const newBestStreak = Math.max(prev.bestStreak, newStreak);

                return {
                    ...prev,
                    cardsStudied: prev.cardsStudied + 1,
                    correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
                    streak: newStreak,
                    bestStreak: newBestStreak
                };
            });

            setCardHistory(prev => [...prev, {
                cardId: currentCard?.id,
                correct: isCorrect,
                difficulty: variables.difficulty,
                timestamp: Date.now()
            }]);

            if (isCorrect && studyStats.streak > 0 && (studyStats.streak + 1) % 5 === 0) {
                toast.success(`🔥 ${studyStats.streak + 1} card streak!`, {
                    icon: '🔥',
                    duration: 2000
                });
            }
        },
    });

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

    const currentCard = studyCards?.[currentCardIndex];
    const isOwner = cardSet?.accessType === 'OWNER';
    const progress = studyCards?.length ? ((currentCardIndex + 1) / studyCards.length) * 100 : 0;
    const sessionTime = Math.floor((currentTime - studyStats.sessionStartTime) / 1000);
    const sessionTimeFormatted = sessionTime >= 60
        ? `${Math.floor(sessionTime / 60)}:${(sessionTime % 60).toString().padStart(2, '0')}`
        : `0:${sessionTime.toString().padStart(2, '0')}`;
    const accuracy = studyStats.cardsStudied > 0 ? Math.round((studyStats.correctAnswers / studyStats.cardsStudied) * 100) : 0;
    const cardsRemaining = studyCards?.length ? studyCards.length - currentCardIndex - 1 : 0;

    const getTextSize = (text, isDefinition = false) => {
        if (!text) return 'text-lg';

        const length = text.length;

        if (isDefinition) {
            if (length > 200) return 'text-sm leading-tight';
            if (length > 120) return 'text-base leading-snug';
            if (length > 80) return 'text-lg leading-normal';
            return 'text-xl leading-relaxed';
        } else {
            if (length > 150) return 'text-base leading-tight';
            if (length > 100) return 'text-lg leading-snug';
            if (length > 60) return 'text-xl leading-normal';
            return 'text-2xl leading-relaxed';
        }
    };

    const getStreakColor = (streak) => {
        if (streak >= 20) return 'text-purple-600';
        if (streak >= 15) return 'text-blue-600';
        if (streak >= 10) return 'text-green-600';
        if (streak >= 5) return 'text-yellow-600';
        return 'text-gray-600';
    };

    const getAccuracyColor = (accuracy) => {
        if (accuracy >= 90) return 'text-green-600';
        if (accuracy >= 80) return 'text-blue-600';
        if (accuracy >= 70) return 'text-yellow-600';
        if (accuracy >= 60) return 'text-orange-600';
        return 'text-red-600';
    };

    const flipCard = () => {
        if (!isPaused) {
            setIsFlipped(!isFlipped);
        }
    };

    const nextCard = () => {
        if (currentCardIndex < (studyCards?.length - 1)) {
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

    const shuffleCards = () => {
        if (studyCards && studyCards.length > 1) {
            const currentCard = studyCards[currentCardIndex];
            const otherCards = studyCards.filter((_, index) => index !== currentCardIndex);
            const shuffled = [...otherCards].sort(() => Math.random() - 0.5);
            const newCards = [currentCard, ...shuffled];

            setStudyCards(newCards);
            setCurrentCardIndex(0);
            setIsFlipped(false);

            toast.success('Cards shuffled! 🔀', {
                icon: '🔀',
                duration: 2000
            });
        }
    };

    const resetSession = () => {
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setStudyStats({
            cardsStudied: 0,
            correctAnswers: 0,
            sessionStartTime: Date.now(),
            streak: 0,
            bestStreak: 0
        });
        setCardHistory([]);
        setIsPaused(false);
    };

    const switchToAllCards = () => {
        if (originalCards && originalCards.length > 0) {
            setStudyCards(originalCards);
            setCurrentCardIndex(0);
            setIsFlipped(false);
            setStudyConfig(null);
            toast.success(`Switched to All Cards: ${originalCards.length} cards`, {
                icon: '📚',
                duration: 2000
            });
        }
    };

    const handleReview = (correct, difficulty = 3) => {
        if (currentCard) {
            reviewCardMutation.mutate({
                cardId: currentCard.id,
                correct,
                difficulty
            });

            setTimeout(() => {
                if (currentCardIndex < (studyCards?.length - 1)) {
                    nextCard();
                } else {
                    const finalStats = {
                        totalCards: studyCards.length,
                        cardsStudied: studyStats.cardsStudied + 1,
                        accuracy: Math.round(((studyStats.correctAnswers + (correct ? 1 : 0)) / (studyStats.cardsStudied + 1)) * 100),
                        bestStreak: Math.max(studyStats.bestStreak, correct ? studyStats.streak + 1 : studyStats.streak),
                        timeSpent: sessionTime
                    };

                    toast.success(`🎉 Session complete! ${finalStats.accuracy}% accuracy`, {
                        duration: 4000
                    });

                    setTimeout(() => navigate(`/cardset/${id}`), 1500);
                }
            }, 300);
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
            1: { text: 'Again', color: 'text-red-600', bg: 'bg-red-50 hover:bg-red-100', border: 'border-red-200', icon: XCircle },
            2: { text: 'Hard', color: 'text-orange-600', bg: 'bg-orange-50 hover:bg-orange-100', border: 'border-orange-200', icon: AlertCircle },
            3: { text: 'Good', color: 'text-green-600', bg: 'bg-green-50 hover:bg-green-100', border: 'border-green-200', icon: CheckCircle },
            4: { text: 'Easy', color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100', border: 'border-blue-200', icon: Zap }
        };
        return labels[level] || labels[3];
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (isAutoFlip && !isFlipped && !isPaused && currentCard) {
            const timer = setTimeout(() => {
                setIsFlipped(true);
            }, autoFlipDelay * 1000);
            return () => clearTimeout(timer);
        }
    }, [isAutoFlip, isFlipped, autoFlipDelay, currentCardIndex, isPaused]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (isPaused) return;

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
                case 'p':
                case 'P':
                    e.preventDefault();
                    setIsPaused(!isPaused);
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    resetSession();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isFlipped, currentCardIndex, studyCards?.length, isPaused]);

    if (isLoading) return <LoadingSpinner />;

    if (error || !studyCards || studyCards.length === 0) {
        return (
            <DashboardLayout>
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center space-x-4 mb-8">
                        <button
                            onClick={() => navigate(`/cardset/${id}`)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Study Mode</h1>
                    </div>

                    <div className="card text-center py-12">
                        <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {studyCards?.length === 0 ? 'No cards available for this study mode' : 'Failed to load cards'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {studyCards?.length === 0
                                ? 'The selected study mode has no cards to study. Try a different study mode or add more cards.'
                                : 'There was an error loading the cards. Please try again.'
                            }
                        </p>
                        <div className="space-x-3">
                            <Link to={`/cardset/${id}`} className="btn-primary">
                                Back to Card Set
                            </Link>
                            {originalCards && originalCards.length > 0 && studyCards?.length === 0 && (
                                <button onClick={switchToAllCards} className="btn-secondary">
                                    Study All Cards
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Enhanced Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(`/cardset/${id}`)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-3xl font-bold text-gray-900">Study Mode</h1>
                                {studyConfig && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full flex items-center space-x-1">
                                        <Filter size={12} />
                                        <span>{studyConfig.studyType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                    </span>
                                )}
                                {isPaused && (
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full animate-pulse">
                                        PAUSED
                                    </span>
                                )}
                                {studyStats.streak >= 5 && (
                                    <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                                        <Flame size={14} />
                                        <span>{studyStats.streak}</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-600">{cardSet?.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Switch to All Cards button if using filtered study mode */}
                        {studyConfig && originalCards && originalCards.length > studyCards.length && (
                            <button
                                onClick={switchToAllCards}
                                className="btn-secondary flex items-center space-x-2 hover:shadow-md transition-all"
                                title="Switch to studying all cards"
                            >
                                <Filter size={16} />
                                <span className="hidden sm:inline">All Cards ({originalCards.length})</span>
                            </button>
                        )}

                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className={`btn-secondary flex items-center space-x-2 hover:shadow-md transition-all ${
                                isPaused ? 'bg-yellow-50 border-yellow-200' : ''
                            }`}
                            title={isPaused ? 'Resume (P)' : 'Pause (P)'}
                        >
                            {isPaused ? <Play size={16} /> : <Pause size={16} />}
                            <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
                        </button>

                        <button
                            onClick={shuffleCards}
                            className="btn-secondary flex items-center space-x-2 hover:shadow-md transition-all"
                            title="Shuffle cards"
                        >
                            <Shuffle size={16} />
                            <span className="hidden sm:inline">Shuffle</span>
                        </button>

                        <button
                            onClick={resetSession}
                            className="btn-secondary flex items-center space-x-2 hover:shadow-md transition-all"
                            title="Reset session (R)"
                        >
                            <RotateCcw size={16} />
                            <span className="hidden sm:inline">Reset</span>
                        </button>

                        <button
                            onClick={() => setShowStats(!showStats)}
                            className="btn-secondary flex items-center space-x-2 hover:shadow-md transition-all"
                            title="Toggle stats"
                        >
                            <BarChart3 size={16} />
                            <span className="hidden sm:inline">Stats</span>
                        </button>

                        <Link to={`/cardset/${id}`} className="btn-secondary flex items-center space-x-2 hover:shadow-md transition-all">
                            <Eye size={16} />
                            <span className="hidden sm:inline">View All</span>
                        </Link>

                        {isOwner && (
                            <div className="relative group">
                                <button className="btn-secondary p-2 hover:shadow-md transition-all">
                                    <MoreHorizontal size={16} />
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                    <button
                                        onClick={openEditModal}
                                        className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors"
                                    >
                                        <Edit size={14} />
                                        <span>Edit Card</span>
                                    </button>
                                    <Link
                                        to={`/cardset/${id}/edit`}
                                        className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-b-lg transition-colors"
                                    >
                                        <Settings size={14} />
                                        <span>Edit Set</span>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rest of your existing StudyPage JSX remains the same, just replace references to `cards` with `studyCards` */}
                {/* Enhanced Progress & Stats */}
                <div className={`grid gap-4 mb-6 ${showStats ? 'grid-cols-1 md:grid-cols-6' : 'grid-cols-1 md:grid-cols-4'}`}>
                    <div className="card hover:shadow-md transition-shadow">
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

                    <div className="card hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${
                                accuracy >= 90 ? 'bg-green-100' :
                                    accuracy >= 80 ? 'bg-blue-100' :
                                        accuracy >= 70 ? 'bg-yellow-100' : 'bg-red-100'
                            }`}>
                                <Target className={`w-5 h-5 ${getAccuracyColor(accuracy)}`} />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Accuracy</p>
                                <p className={`text-lg font-bold ${getAccuracyColor(accuracy)}`}>{accuracy}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="card hover:shadow-md transition-shadow">
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

                    <div className="card hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Timer className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Time</p>
                                <p className="text-lg font-bold text-gray-900">{sessionTimeFormatted}</p>
                            </div>
                        </div>
                    </div>

                    {showStats && (
                        <>
                            <div className="card hover:shadow-md transition-shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <Flame className={`w-5 h-5 ${getStreakColor(studyStats.streak)}`} />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-600">Streak</p>
                                        <p className={`text-lg font-bold ${getStreakColor(studyStats.streak)}`}>{studyStats.streak}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card hover:shadow-md transition-shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Trophy className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-600">Best</p>
                                        <p className="text-lg font-bold text-green-600">{studyStats.bestStreak}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Continue with rest of your existing JSX, making sure to use studyCards instead of cards */}
                {/* ... */}

                {/* Enhanced Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Card {currentCardIndex + 1} of {studyCards?.length}</span>
                        <div className="flex items-center space-x-4">
                            <span>{cardsRemaining} remaining</span>
                            {studyConfig && (
                                <span className="text-blue-600 font-medium">
                                    {studyConfig.studyType.replace('-', ' ')} mode
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div className="relative h-full">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                            {studyStats.streak >= 5 && (
                                <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-r from-orange-400 to-orange-500 opacity-75 animate-pulse"></div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Study Settings */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                            <p className="text-gray-700 mb-2">
                                <span className="font-medium">Click the card to flip it</span>, then rate your knowledge
                            </p>
                            <p className="text-sm text-gray-500">
                                Space to flip • Arrow keys to navigate • 1-4 to rate • P to pause • R to reset
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="autoFlip"
                                    checked={isAutoFlip}
                                    onChange={(e) => setIsAutoFlip(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="autoFlip" className="text-sm text-gray-700">Auto-flip</label>
                            </div>
                            {isAutoFlip && (
                                <select
                                    value={autoFlipDelay}
                                    onChange={(e) => setAutoFlipDelay(Number(e.target.value))}
                                    className="text-sm border border-gray-300 rounded px-2 py-1"
                                >
                                    <option value={2}>2s</option>
                                    <option value={3}>3s</option>
                                    <option value={5}>5s</option>
                                    <option value={10}>10s</option>
                                </select>
                            )}
                        </div>
                    </div>
                </div>

                {/* Enhanced Card Container */}
                <div className="flex justify-center mb-8">
                    <div className="relative w-full max-w-2xl h-96">
                        <div
                            className={`relative w-full h-full transition-all duration-500 cursor-pointer ${
                                !isPaused ? 'hover:scale-105' : 'opacity-75'
                            } ${isFlipped ? 'scale-105' : ''} ${
                                studyStats.streak >= 10 ? 'ring-4 ring-orange-300 ring-opacity-50' : ''
                            }`}
                            onClick={flipCard}
                            style={{
                                transformStyle: 'preserve-3d',
                                perspective: '1000px'
                            }}
                        >
                            {!isFlipped ? (
                                /* Front of card */
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-xl flex items-center justify-center p-6 border border-blue-300">
                                    <div className="text-center w-full h-full flex flex-col justify-center">
                                        <div className="mb-4">
                                            <span className="inline-block px-3 py-1 bg-blue-400 bg-opacity-20 text-blue-100 text-xs font-medium rounded-full">
                                                TERM
                                            </span>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center overflow-hidden">
                                            <p className={`text-white font-semibold leading-relaxed text-center break-words ${getTextSize(currentCard?.term)}`}
                                               style={{
                                                   wordBreak: 'break-word',
                                                   overflowWrap: 'break-word',
                                                   hyphens: 'auto'
                                               }}>
                                                {currentCard?.term}
                                            </p>
                                        </div>
                                        <p className="text-blue-100 text-sm opacity-80 mt-4">
                                            {isPaused ? 'Study paused' : 'Click to see definition'}
                                        </p>
                                    </div>
                                    {/* Auto-flip timer indicator */}
                                    {isAutoFlip && !isFlipped && !isPaused && (
                                        <div className="absolute bottom-2 right-2">
                                            <div className="w-3 h-3 bg-white bg-opacity-30 rounded-full animate-ping"></div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Back of card */
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-xl flex items-center justify-center p-6 border border-orange-300">
                                    <div className="text-center w-full h-full flex flex-col justify-center">
                                        <div className="mb-4">
                                            <span className="inline-block px-3 py-1 bg-orange-400 bg-opacity-20 text-orange-100 text-xs font-medium rounded-full">
                                                DEFINITION
                                            </span>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center overflow-hidden">
                                            <p className={`text-white font-medium leading-relaxed text-center break-words ${getTextSize(currentCard?.definition, true)}`}
                                               style={{
                                                   wordBreak: 'break-word',
                                                   overflowWrap: 'break-word',
                                                   hyphens: 'auto'
                                               }}>
                                                {currentCard?.definition}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Enhanced Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={previousCard}
                        disabled={currentCardIndex === 0 || isPaused}
                        className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">
                            {currentCardIndex + 1} / {studyCards?.length}
                        </p>
                        <div className="flex items-center justify-center space-x-4 mt-1 text-sm text-gray-500">
                            {studyConfig && (
                                <span className="text-blue-600 font-medium">
                                    {studyConfig.studyType.replace('-', ' ')}
                                </span>
                            )}
                            {cardsRemaining > 0 && (
                                <span>{cardsRemaining} remaining</span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={nextCard}
                        disabled={currentCardIndex === (studyCards?.length - 1) || isPaused}
                        className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Enhanced Review Buttons (shown only when flipped) */}
                {isFlipped && !isPaused && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-6">
                        {[1, 2, 3, 4].map((level) => {
                            const config = getDifficultyLabel(level);
                            const Icon = config.icon;
                            return (
                                <button
                                    key={level}
                                    onClick={() => handleReview(level >= 3, level)}
                                    className={`${config.bg} ${config.color} ${config.border} border py-4 px-4 rounded-lg font-medium transition-all text-sm hover:shadow-lg hover:scale-105 active:scale-95 group`}
                                >
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <Icon size={20} className="group-hover:scale-110 transition-transform" />
                                        <div className="text-center">
                                            <div className="font-semibold">{config.text}</div>
                                            <div className="text-xs opacity-75">({level})</div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Pause Overlay */}
                {isPaused && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center shadow-xl">
                            <Pause className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Study Paused</h3>
                            <p className="text-gray-600 mb-6">Take a break! Click resume when you're ready to continue.</p>
                            <button
                                onClick={() => setIsPaused(false)}
                                className="btn-primary flex items-center space-x-2 mx-auto"
                            >
                                <Play size={16} />
                                <span>Resume Study</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Enhanced Card Status & History */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Current Card Status */}
                    {currentCard?.status && (
                        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                            <span>Status: <span className="font-medium">{currentCard.status}</span></span>
                            {currentCard.timesReviewed > 0 && (
                                <span>• Reviewed <span className="font-medium">{currentCard.timesReviewed}</span> times</span>
                            )}
                        </div>
                    )}

                    {/* Session Stats Summary */}
                    {studyStats.cardsStudied > 0 && (
                        <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-full">
                                <CheckCircle size={14} />
                                <span>{studyStats.correctAnswers} correct</span>
                            </div>
                            <div className="flex items-center space-x-2 px-3 py-1 bg-red-50 text-red-700 rounded-full">
                                <XCircle size={14} />
                                <span>{studyStats.cardsStudied - studyStats.correctAnswers} incorrect</span>
                            </div>
                            {studyStats.bestStreak > 0 && (
                                <div className="flex items-center space-x-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-full">
                                    <Flame size={14} />
                                    <span>Best: {studyStats.bestStreak}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Motivational Messages */}
                {studyStats.streak >= 10 && (
                    <div className="mt-6 card bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-full">
                                <Flame className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-orange-900">🔥 You're on fire!</h4>
                                <p className="text-sm text-orange-700">
                                    {studyStats.streak} cards in a row! Keep up the amazing work!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {accuracy >= 90 && studyStats.cardsStudied >= 5 && (
                    <div className="mt-6 card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-full">
                                <Trophy className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-green-900">🏆 Excellent Performance!</h4>
                                <p className="text-sm text-green-700">
                                    {accuracy}% accuracy - you're mastering this material!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Edit Card Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                            <div className="flex items-center space-x-2 mb-4">
                                <Edit className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-medium text-gray-900">Edit Card</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Term
                                    </label>
                                    <textarea
                                        value={editingCard.term}
                                        onChange={(e) => setEditingCard({ ...editingCard, term: e.target.value })}
                                        className={`input resize-none transition-all duration-200 ${
                                            editingCard.term.length > 230 ? 'border-red-500 focus:ring-red-500 bg-red-50' :
                                                editingCard.term.length > 200 ? 'border-orange-500 focus:ring-orange-500 bg-orange-50' :
                                                    'focus:ring-blue-500'
                                        }`}
                                        maxLength={255}
                                        rows={2}
                                        placeholder="Front of the card"
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <p className={`text-xs ${
                                            editingCard.term.length > 230 ? 'text-red-600 font-semibold' :
                                                editingCard.term.length > 200 ? 'text-orange-600 font-medium' : 'text-gray-400'
                                        }`}>
                                            {editingCard.term.length}/255
                                        </p>
                                        <div className={`w-2 h-2 rounded-full ${
                                            editingCard.term.length > 230 ? 'bg-red-500 animate-pulse' :
                                                editingCard.term.length > 200 ? 'bg-orange-500' :
                                                    editingCard.term.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Definition
                                    </label>
                                    <textarea
                                        value={editingCard.definition}
                                        onChange={(e) => setEditingCard({ ...editingCard, definition: e.target.value })}
                                        className={`input resize-none transition-all duration-200 ${
                                            editingCard.definition.length > 230 ? 'border-red-500 focus:ring-red-500 bg-red-50' :
                                                editingCard.definition.length > 200 ? 'border-orange-500 focus:ring-orange-500 bg-orange-50' :
                                                    'focus:ring-blue-500'
                                        }`}
                                        maxLength={255}
                                        rows={3}
                                        placeholder="Back of the card"
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <p className={`text-xs ${
                                            editingCard.definition.length > 230 ? 'text-red-600 font-semibold' :
                                                editingCard.definition.length > 200 ? 'text-orange-600 font-medium' : 'text-gray-400'
                                        }`}>
                                            {editingCard.definition.length}/255
                                        </p>
                                        <div className={`w-2 h-2 rounded-full ${
                                            editingCard.definition.length > 230 ? 'bg-red-500 animate-pulse' :
                                                editingCard.definition.length > 200 ? 'bg-orange-500' :
                                                    editingCard.definition.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="btn-secondary hover:shadow-md transition-all"
                                    disabled={updateCardMutation.isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateCard}
                                    className="btn-primary hover:shadow-md transition-all"
                                    disabled={updateCardMutation.isPending || !editingCard.term.trim() || !editingCard.definition.trim()}
                                >
                                    {updateCardMutation.isPending ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Saving...</span>
                                        </div>
                                    ) : (
                                        'Save Changes'
                                    )}
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