import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    RotateCcw,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle,
    Brain,
    Trophy,
    Clock,
    Target
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { studyAPI, cardSetsAPI } from '../services/api';
import toast from 'react-hot-toast';

const StudyPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [sessionStats, setSessionStats] = useState({
        correct: 0,
        incorrect: 0,
        total: 0
    });
    const [isComplete, setIsComplete] = useState(false);

    const { data: cardSet } = useQuery({
        queryKey: ['cardSet', id],
        queryFn: async () => {
            const response = await cardSetsAPI.getById(id);
            return response.data;
        },
    });

    const { data: dueCards, isLoading, error, refetch } = useQuery({
        queryKey: ['dueCards', id],
        queryFn: async () => {
            const response = await studyAPI.getDueCards(id);
            return response.data;
        },
        enabled: !!id,
    });

    const reviewCardMutation = useMutation({
        mutationFn: async ({ cardId, correct, difficulty }) => {
            await studyAPI.reviewCard(cardId, correct, difficulty);
        },
        onSuccess: () => {
            setSessionStats(prev => ({
                ...prev,
                total: prev.total + 1
            }));

            if (currentCardIndex < dueCards.length - 1) {
                setCurrentCardIndex(prev => prev + 1);
                setShowAnswer(false);
            } else {
                setIsComplete(true);
            }
        },
        onError: () => {
            toast.error('Failed to record review');
        },
    });

    const currentCard = dueCards?.[currentCardIndex];
    const progress = dueCards ? Math.round(((currentCardIndex + 1) / dueCards.length) * 100) : 0;

    const handleAnswer = (correct, difficulty = 3) => {
        if (!currentCard) return;

        setSessionStats(prev => ({
            ...prev,
            [correct ? 'correct' : 'incorrect']: prev[correct ? 'correct' : 'incorrect'] + 1
        }));

        reviewCardMutation.mutate({
            cardId: currentCard.id,
            correct,
            difficulty
        });
    };

    const handleRestart = () => {
        setCurrentCardIndex(0);
        setShowAnswer(false);
        setSessionStats({ correct: 0, incorrect: 0, total: 0 });
        setIsComplete(false);
        refetch();
    };

    const handleFlipCard = () => {
        setShowAnswer(!showAnswer);
    };

    const handleKeyPress = (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!showAnswer) {
                handleFlipCard();
            }
        } else if (e.key === '1' && showAnswer) {
            handleAnswer(false, 1);
        } else if (e.key === '2' && showAnswer) {
            handleAnswer(true, 2);
        } else if (e.key === '3' && showAnswer) {
            handleAnswer(true, 3);
        } else if (e.key === '4' && showAnswer) {
            handleAnswer(true, 4);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showAnswer, currentCard]);

    if (isLoading) return <LoadingSpinner />;

    if (error) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <p className="text-red-600">Failed to load study session. Please try again.</p>
                    <button
                        onClick={() => navigate(`/cardset/${id}`)}
                        className="mt-4 btn-primary"
                    >
                        Back to Card Set
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    if (!dueCards || dueCards.length === 0) {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto text-center py-12">
                    <Trophy className="mx-auto h-16 w-16 text-yellow-500" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">All caught up!</h2>
                    <p className="mt-2 text-gray-600">
                        You've reviewed all the cards that are due for this set. Great job!
                    </p>
                    <div className="mt-6 space-x-4">
                        <button
                            onClick={() => navigate(`/cardset/${id}`)}
                            className="btn-primary"
                        >
                            Back to Card Set
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-secondary"
                        >
                            Dashboard
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (isComplete) {
        const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;

        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto text-center py-12">
                    <Trophy className="mx-auto h-16 w-16 text-yellow-500" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Session Complete!</h2>
                    <p className="mt-2 text-gray-600">
                        You've finished reviewing all due cards for this session.
                    </p>

                    {/* Session Stats */}
                    <div className="mt-8 grid grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
                            <div className="text-sm text-green-800">Correct</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
                            <div className="text-sm text-red-800">Incorrect</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
                            <div className="text-sm text-blue-800">Accuracy</div>
                        </div>
                    </div>

                    <div className="mt-8 space-x-4">
                        <button
                            onClick={handleRestart}
                            className="btn-outline flex items-center space-x-2"
                        >
                            <RotateCcw size={16} />
                            <span>Study Again</span>
                        </button>
                        <button
                            onClick={() => navigate(`/cardset/${id}`)}
                            className="btn-primary"
                        >
                            Back to Card Set
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(`/cardset/${id}`)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{cardSet?.name}</h1>
                            <p className="text-gray-600">Study Session</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-sm text-gray-500">
                            Card {currentCardIndex + 1} of {dueCards.length}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            Press Space to flip • Use 1-4 keys to answer
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-500">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Session Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Correct</p>
                                <p className="text-lg font-bold text-gray-900">{sessionStats.correct}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Incorrect</p>
                                <p className="text-lg font-bold text-gray-900">{sessionStats.incorrect}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Target className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Remaining</p>
                                <p className="text-lg font-bold text-gray-900">{dueCards.length - currentCardIndex - 1}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flashcard */}
                <div className="mb-8">
                    <div
                        className="card min-h-[300px] flex flex-col justify-center items-center cursor-pointer hover:shadow-lg transition-all duration-200"
                        onClick={handleFlipCard}
                    >
                        <div className="text-center w-full">
                            {!showAnswer ? (
                                <>
                                    <div className="text-sm font-medium text-gray-500 mb-4">Term</div>
                                    <div className="text-2xl font-bold text-gray-900 mb-6">
                                        {currentCard?.term}
                                    </div>
                                    <div className="flex items-center justify-center text-gray-400">
                                        <Eye size={20} className="mr-2" />
                                        <span className="text-sm">Click to reveal answer</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-sm font-medium text-gray-500 mb-2">Term</div>
                                    <div className="text-lg text-gray-700 mb-4">{currentCard?.term}</div>

                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="text-sm font-medium text-gray-500 mb-2">Definition</div>
                                        <div className="text-2xl font-bold text-gray-900 mb-6">
                                            {currentCard?.definition}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center text-gray-400">
                                        <EyeOff size={20} className="mr-2" />
                                        <span className="text-sm">Click to hide answer</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Answer Buttons */}
                {showAnswer && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => handleAnswer(false, 1)}
                            disabled={reviewCardMutation.isPending}
                            className="btn bg-red-600 text-white hover:bg-red-700 py-3 flex flex-col items-center space-y-1"
                        >
                            <span className="font-bold">Again</span>
                            <span className="text-xs opacity-75">Press 1</span>
                        </button>

                        <button
                            onClick={() => handleAnswer(true, 2)}
                            disabled={reviewCardMutation.isPending}
                            className="btn bg-orange-600 text-white hover:bg-orange-700 py-3 flex flex-col items-center space-y-1"
                        >
                            <span className="font-bold">Hard</span>
                            <span className="text-xs opacity-75">Press 2</span>
                        </button>

                        <button
                            onClick={() => handleAnswer(true, 3)}
                            disabled={reviewCardMutation.isPending}
                            className="btn bg-green-600 text-white hover:bg-green-700 py-3 flex flex-col items-center space-y-1"
                        >
                            <span className="font-bold">Good</span>
                            <span className="text-xs opacity-75">Press 3</span>
                        </button>

                        <button
                            onClick={() => handleAnswer(true, 4)}
                            disabled={reviewCardMutation.isPending}
                            className="btn bg-blue-600 text-white hover:bg-blue-700 py-3 flex flex-col items-center space-y-1"
                        >
                            <span className="font-bold">Easy</span>
                            <span className="text-xs opacity-75">Press 4</span>
                        </button>
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">How to use:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Click the card or press <kbd className="px-1 py-0.5 bg-blue-200 rounded">Space</kbd> to flip</li>
                        <li>• Use number keys <kbd className="px-1 py-0.5 bg-blue-200 rounded">1-4</kbd> to quickly answer</li>
                        <li>• <strong>Again:</strong> Didn't know it, will see again soon</li>
                        <li>• <strong>Hard:</strong> Knew it with difficulty, shorter interval</li>
                        <li>• <strong>Good:</strong> Knew it well, normal interval</li>
                        <li>• <strong>Easy:</strong> Very easy, longer interval</li>
                    </ul>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudyPage;