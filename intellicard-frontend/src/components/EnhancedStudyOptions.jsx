import React, { useState, useMemo } from 'react';
import {
    Play,
    Clock,
    Zap,
    Brain,
    ChevronDown,
    BookOpen,
    Star,
} from 'lucide-react';

const EnhancedStudyOptions = ({ cardSetId, cards = [], studyOverview, isOwner, onStartStudy }) => {
    const [showStudyOptions, setShowStudyOptions] = useState(false);
    const [selectedStudyMode, setSelectedStudyMode] = useState('smart');

    const filteredCards = useMemo(() => {
        if (!cards || cards.length === 0) return {};

        const now = new Date();

        return {
            new: cards.filter(card => !card.status || card.status === 'NEW'),
            due: cards.filter(card => {
                if (!card.nextReviewDate) return false;
                const reviewDate = new Date(card.nextReviewDate);
                return reviewDate <= now && card.status !== 'NEW';
            }),
            learning: cards.filter(card => card.status === 'LEARNING'),
            mastered: cards.filter(card => card.status === 'MASTERED'),
            all: cards
        };
    }, [cards]);

    const cardCounts = {
        new: filteredCards.new?.length || 0,
        due: filteredCards.due?.length || 0,
        learning: filteredCards.learning?.length || 0,
        mastered: filteredCards.mastered?.length || 0,
        newAndDue: (filteredCards.new?.length || 0) + (filteredCards.due?.length || 0),
        total: filteredCards.all?.length || 0
    };

    const studyModes = [
        {
            id: 'smart',
            name: 'Smart Study',
            description: 'Focus on new and due cards only',
            icon: <Brain className="w-5 h-5" />,
            color: 'bg-purple-100 text-purple-600',
            count: cardCounts.newAndDue,
            badge: 'Recommended',
            cards: [...(filteredCards.new || []), ...(filteredCards.due || [])]
        },
        {
            id: 'due-only',
            name: 'Due Cards Only',
            description: 'Review only cards that need attention',
            icon: <Clock className="w-5 h-5" />,
            color: 'bg-orange-100 text-orange-600',
            count: cardCounts.due,
            badge: cardCounts.due > 0 ? 'Urgent' : null,
            cards: filteredCards.due || []
        },
        {
            id: 'new-only',
            name: 'New Cards Only',
            description: 'Learn cards you haven\'t studied yet',
            icon: <Zap className="w-5 h-5" />,
            color: 'bg-blue-100 text-blue-600',
            count: cardCounts.new,
            cards: filteredCards.new || []
        },
        {
            id: 'all',
            name: 'All Cards',
            description: 'Study the entire deck',
            icon: <BookOpen className="w-5 h-5" />,
            color: 'bg-gray-100 text-gray-600',
            count: cardCounts.total,
            cards: filteredCards.all || []
        },
        {
            id: 'mastered',
            name: 'Mastered Review',
            description: 'Quick review of mastered cards',
            icon: <Star className="w-5 h-5" />,
            color: 'bg-green-100 text-green-600',
            count: cardCounts.mastered,
            badge: 'Maintenance',
            cards: filteredCards.mastered || []
        }
    ];

    const selectedMode = studyModes.find(mode => mode.id === selectedStudyMode);
    const hasAvailableCards = cardCounts.total > 0;
    const hasNewOrDueCards = cardCounts.newAndDue > 0;

    const handleStartStudy = (mode = 'normal', studyMode = selectedStudyMode) => {
        const modeConfig = studyModes.find(m => m.id === studyMode);
        if (!modeConfig || modeConfig.cards.length === 0) {
            alert('No cards available for this study mode');
            return;
        }

        onStartStudy({
            cards: modeConfig.cards,
            mode: mode,
            studyType: studyMode,
            config: {
                shuffle: mode === 'shuffle',
                speed: mode === 'speed',
                test: mode === 'test'
            }
        });

        setShowStudyOptions(false);
    };

    return (
        <div className="space-y-4">
            {/* Main Study Button with Dropdown */}
            <div className="relative">
                {hasAvailableCards ? (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleStartStudy()}
                            className={`btn-primary flex items-center space-x-2 hover:shadow-lg transition-all hover:scale-105 flex-1 ${
                                hasNewOrDueCards && selectedStudyMode === 'smart' ? 'animate-pulse ring-2 ring-orange-200' : ''
                            }`}
                            disabled={!selectedMode || selectedMode.count === 0}
                        >
                            <Play size={16} />
                            <span>
                                {selectedStudyMode === 'smart' ? 'Smart Study' :
                                    selectedStudyMode === 'due-only' ? 'Study Due Cards' :
                                        selectedStudyMode === 'new-only' ? 'Learn New Cards' :
                                            selectedStudyMode === 'mastered' ? 'Review Mastered' :
                                                'Study All Cards'}
                            </span>
                            {selectedMode && selectedMode.count > 0 && (
                                <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-bold">
                                    {selectedMode.count}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setShowStudyOptions(!showStudyOptions)}
                            className="btn-secondary p-3 hover:bg-gray-100 transition-colors"
                        >
                            <ChevronDown className={`w-4 h-4 transition-transform ${showStudyOptions ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">No cards available to study</p>
                    </div>
                )}

                {/* Study Options Dropdown */}
                {showStudyOptions && hasAvailableCards && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-1">Study Options</h3>
                            <p className="text-sm text-gray-500">Choose how you want to study</p>
                        </div>

                        <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                            {studyModes.map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => {
                                        setSelectedStudyMode(mode.id);
                                        setShowStudyOptions(false);
                                    }}
                                    className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-gray-50 ${
                                        selectedStudyMode === mode.id ? 'bg-blue-50 border border-blue-200' : ''
                                    } ${mode.count === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={mode.count === 0}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${mode.color}`}>
                                                {mode.icon}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="font-medium text-gray-900">{mode.name}</h4>
                                                    {mode.badge && (
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                            mode.badge === 'Recommended' ? 'bg-purple-100 text-purple-700' :
                                                                mode.badge === 'Urgent' ? 'bg-red-100 text-red-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {mode.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">{mode.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`font-bold ${mode.count === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
                                                {mode.count}
                                            </span>
                                            <p className="text-xs text-gray-500">cards</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Study Stats Summary */}
            {hasAvailableCards && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-blue-600">{cardCounts.new}</div>
                            <div className="text-xs text-blue-600">New</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-600">{cardCounts.due}</div>
                            <div className="text-xs text-orange-600">Due</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-yellow-600">{cardCounts.learning}</div>
                            <div className="text-xs text-yellow-600">Learning</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600">{cardCounts.mastered}</div>
                            <div className="text-xs text-green-600">Mastered</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default EnhancedStudyOptions;