import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    Save,
    Plus,
    AlertCircle,
    CheckCircle,
    Eye,
    RotateCcw,
    Lightbulb,
    Zap,
    Target,
    Clock
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { cardsAPI, cardSetsAPI } from '../services/api';
import toast from 'react-hot-toast';

const AddCardPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        term: '',
        definition: '',
    });
    const [errors, setErrors] = useState({});
    const [showPreview, setShowPreview] = useState(true);
    const [isFlipped, setIsFlipped] = useState(false);

    const { data: cardSet } = useQuery({
        queryKey: ['cardSet', id],
        queryFn: async () => {
            const response = await cardSetsAPI.getById(id);
            return response.data;
        },
    });

    const addCardMutation = useMutation({
        mutationFn: async (cardData) => {
            const response = await cardsAPI.create(id, cardData);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Card added successfully! 🎉');
            queryClient.invalidateQueries(['cards', id]);
            queryClient.invalidateQueries(['studyOverview', id]);
            navigate(`/cardset/${id}`);
        },
        onError: (error) => {
            toast.error('Failed to add card');
        },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.term.trim()) {
            newErrors.term = 'Term is required';
        } else if (formData.term.trim().length > 255) {
            newErrors.term = 'Term must be 255 characters or less';
        }

        if (!formData.definition.trim()) {
            newErrors.definition = 'Definition is required';
        } else if (formData.definition.trim().length > 255) {
            newErrors.definition = 'Definition must be 255 characters or less';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        addCardMutation.mutate({
            term: formData.term.trim(),
            definition: formData.definition.trim(),
        });
    };

    const resetForm = () => {
        setFormData({ term: '', definition: '' });
        setErrors({});
        setIsFlipped(false);
    };

    const handleKeyDown = (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    useEffect(() => {
        if (formData.term && formData.definition && !isFlipped) {
            const timer = setTimeout(() => setIsFlipped(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [formData.term, formData.definition]);

    const isLoading = addCardMutation.isPending;
    const hasContent = formData.term.trim() || formData.definition.trim();
    const isValid = formData.term.trim() && formData.definition.trim() && Object.keys(errors).length === 0;

    const getCharacterCountStyle = (length, field = 'term') => {
        const limits = field === 'term' ? [200, 230] : [200, 230];
        if (length > limits[1]) return 'text-red-600 font-bold animate-pulse';
        if (length > limits[0]) return 'text-orange-600 font-semibold';
        if (length > limits[0] * 0.7) return 'text-yellow-600 font-medium';
        return 'text-gray-400';
    };

    const getPreviewTextSize = (text, isDefinition = false) => {
        if (!text) return 'text-lg';
        const length = text.length;

        if (isDefinition) {
            if (length > 200) return 'text-xs leading-tight';
            if (length > 120) return 'text-sm leading-snug';
            if (length > 80) return 'text-base leading-normal';
            return 'text-lg leading-relaxed';
        } else {
            if (length > 150) return 'text-sm leading-tight';
            if (length > 100) return 'text-base leading-snug';
            if (length > 60) return 'text-lg leading-normal';
            return 'text-xl leading-relaxed';
        }
    };

    const getInputStyle = (fieldName) => {
        const hasError = errors[fieldName];
        const length = formData[fieldName].length;
        const isNearLimit = length > 200;
        const isAtLimit = length > 230;

        if (hasError) return 'border-red-500 focus:ring-red-500 bg-red-50';
        if (isAtLimit) return 'border-red-400 focus:ring-red-400 bg-red-50';
        if (isNearLimit) return 'border-orange-400 focus:ring-orange-400 bg-orange-50';
        if (length > 0) return 'border-green-400 focus:ring-green-400 bg-green-50';
        return 'focus:ring-blue-500';
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Enhanced Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(`/cardset/${id}`)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Add New Card</h1>
                            <p className="text-gray-600 mt-1">
                                Create a new flashcard for <span className="font-medium text-gray-800">{cardSet?.name}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {hasContent && (
                            <button
                                onClick={resetForm}
                                className="btn-secondary flex items-center space-x-2 hover:shadow-md transition-all"
                                disabled={isLoading}
                                title="Reset form"
                            >
                                <RotateCcw size={16} />
                                <span className="hidden sm:inline">Reset</span>
                            </button>
                        )}

                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="btn-secondary flex items-center space-x-2 hover:shadow-md transition-all"
                            title="Toggle preview"
                        >
                            <Eye size={16} />
                            <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Show'} Preview</span>
                        </button>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Card Creation Progress</span>
                        <span className="font-medium">
                            {formData.term.trim() && formData.definition.trim() ? 'Ready to save!' :
                                formData.term.trim() || formData.definition.trim() ? 'In progress...' : 'Getting started...'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                                isValid ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                    hasContent ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                        'bg-gradient-to-r from-gray-400 to-gray-500'
                            }`}
                            style={{
                                width: `${
                                    isValid ? 100 :
                                        formData.term.trim() && formData.definition.trim() ? 80 :
                                            formData.term.trim() || formData.definition.trim() ? 40 : 10
                                }%`
                            }}
                        ></div>
                    </div>
                </div>

                <div className={`grid gap-8 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
                    {/* Enhanced Form Section */}
                    <div className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={handleKeyDown}>
                            <div className="card hover:shadow-lg transition-shadow">
                                <div className="flex items-center space-x-2 mb-6">
                                    <Plus className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">Card Details</h2>
                                </div>

                                <div className="space-y-6">
                                    {/* Enhanced Term Input */}
                                    <div className="group">
                                        <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-2">
                                            <div className="flex items-center space-x-2">
                                                <Target className="w-4 h-4 text-blue-600" />
                                                <span>Term / Question *</span>
                                            </div>
                                        </label>
                                        <input
                                            type="text"
                                            id="term"
                                            name="term"
                                            value={formData.term}
                                            onChange={handleChange}
                                            placeholder="Enter the term or question..."
                                            maxLength={255}
                                            className={`input transition-all duration-200 ${getInputStyle('term')}`}
                                            disabled={isLoading}
                                        />
                                        {errors.term && (
                                            <div className="mt-2 flex items-center space-x-2 text-red-600">
                                                <AlertCircle size={14} />
                                                <p className="text-sm">{errors.term}</p>
                                            </div>
                                        )}
                                        <div className="mt-2 flex justify-between items-center">
                                            <p className="text-sm text-gray-500 flex items-center space-x-1">
                                                <Lightbulb size={14} className="text-blue-500" />
                                                <span>This appears on the front of your flashcard</span>
                                            </p>
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    formData.term.length > 230 ? 'bg-red-500 animate-pulse' :
                                                        formData.term.length > 200 ? 'bg-orange-500' :
                                                            formData.term.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                                                }`}></div>
                                                <p className={`text-xs font-medium ${getCharacterCountStyle(formData.term.length, 'term')}`}>
                                                    {formData.term.length}/255
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced Definition Input */}
                                    <div className="group">
                                        <label htmlFor="definition" className="block text-sm font-medium text-gray-700 mb-2">
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <span>Definition / Answer *</span>
                                            </div>
                                        </label>
                                        <textarea
                                            id="definition"
                                            name="definition"
                                            value={formData.definition}
                                            onChange={handleChange}
                                            placeholder="Enter the definition or answer..."
                                            maxLength={255}
                                            rows={6}
                                            className={`input resize-none transition-all duration-200 ${getInputStyle('definition')}`}
                                            disabled={isLoading}
                                        />
                                        {errors.definition && (
                                            <div className="mt-2 flex items-center space-x-2 text-red-600">
                                                <AlertCircle size={14} />
                                                <p className="text-sm">{errors.definition}</p>
                                            </div>
                                        )}
                                        <div className="mt-2 flex justify-between items-center">
                                            <p className="text-sm text-gray-500 flex items-center space-x-1">
                                                <Lightbulb size={14} className="text-green-500" />
                                                <span>This appears on the back of your flashcard</span>
                                            </p>
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    formData.definition.length > 230 ? 'bg-red-500 animate-pulse' :
                                                        formData.definition.length > 200 ? 'bg-orange-500' :
                                                            formData.definition.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                                                }`}></div>
                                                <p className={`text-xs font-medium ${getCharacterCountStyle(formData.definition.length, 'definition')}`}>
                                                    {formData.definition.length}/255
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Actions */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/cardset/${id}`)}
                                        className="btn-secondary hover:shadow-md transition-all"
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>

                                    {hasContent && !isLoading && (
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="btn-secondary hover:shadow-md transition-all"
                                            title="Reset form"
                                        >
                                            <RotateCcw size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center space-x-3">
                                    {isValid && (
                                        <div className="flex items-center space-x-2 text-green-600 text-sm font-medium">
                                            <CheckCircle size={16} />
                                            <span>Ready to save</span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading || !isValid}
                                        className={`btn-primary flex items-center space-x-2 transition-all duration-200 ${
                                            isValid ? 'hover:shadow-lg hover:scale-105 animate-pulse' : ''
                                        }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Adding...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                <span>Add Card</span>
                                                {isValid && <Zap size={14} className="text-yellow-300" />}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Keyboard Shortcut Hint */}
                            <div className="text-center text-xs text-gray-500 py-2">
                                💡 Tip: Press <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl + Enter</kbd> to save quickly
                            </div>
                        </form>
                    </div>

                    {/* Enhanced Preview Section */}
                    {showPreview && (
                        <div className="lg:sticky lg:top-8 lg:self-start space-y-6">
                            <div className="card hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                        <Eye className="w-5 h-5 text-purple-600" />
                                        <span>Live Preview</span>
                                    </h3>
                                    <button
                                        onClick={() => setIsFlipped(!isFlipped)}
                                        className="btn-secondary text-xs px-3 py-1 hover:shadow-md transition-all"
                                        disabled={!formData.term && !formData.definition}
                                    >
                                        <RotateCcw size={12} className="mr-1" />
                                        Flip
                                    </button>
                                </div>

                                {/* Animated Card Preview */}
                                <div className="relative">
                                    <div
                                        className={`transition-all duration-700 transform ${isFlipped ? 'scale-y-0' : 'scale-y-100'}`}
                                        style={{ transformOrigin: 'center' }}
                                    >
                                        {/* Front Card */}
                                        <div className="relative w-full h-56 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-xl overflow-hidden border-2 border-blue-300">
                                            <div className="absolute inset-0 p-6 flex flex-col justify-center">
                                                <div className="text-center">
                                                    <div className="mb-4">
                                                        <span className="inline-block px-3 py-1 bg-blue-400 bg-opacity-20 text-blue-100 text-xs font-medium rounded-full">
                                                            TERM
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 flex items-center justify-center min-h-[120px]">
                                                        <p className={`text-white font-semibold text-center break-words ${getPreviewTextSize(formData.term)}`}
                                                           style={{
                                                               wordBreak: 'break-word',
                                                               overflowWrap: 'break-word',
                                                               hyphens: 'auto'
                                                           }}>
                                                            {formData.term || (
                                                                <span className="text-blue-200 italic">
                                                                    Your term will appear here...
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            {formData.term && (
                                                <div className="absolute bottom-2 right-2">
                                                    <div className="w-2 h-2 bg-white bg-opacity-50 rounded-full animate-pulse"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className={`absolute inset-0 transition-all duration-700 transform ${isFlipped ? 'scale-y-100' : 'scale-y-0'}`}
                                        style={{ transformOrigin: 'center' }}
                                    >
                                        {/* Back Card */}
                                        <div className="relative w-full h-56 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-xl overflow-hidden border-2 border-orange-300">
                                            <div className="absolute inset-0 p-6 flex flex-col justify-center">
                                                <div className="text-center">
                                                    <div className="mb-4">
                                                        <span className="inline-block px-3 py-1 bg-orange-400 bg-opacity-20 text-orange-100 text-xs font-medium rounded-full">
                                                            DEFINITION
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 flex items-center justify-center min-h-[120px]">
                                                        <p className={`text-white font-medium text-center break-words ${getPreviewTextSize(formData.definition, true)}`}
                                                           style={{
                                                               wordBreak: 'break-word',
                                                               overflowWrap: 'break-word',
                                                               hyphens: 'auto'
                                                           }}>
                                                            {formData.definition || (
                                                                <span className="text-orange-200 italic">
                                                                    Your definition will appear here...
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            {formData.definition && (
                                                <div className="absolute bottom-2 right-2">
                                                    <div className="w-2 h-2 bg-white bg-opacity-50 rounded-full animate-pulse"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Character Count Display */}
                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center justify-center space-x-2 mb-1">
                                            <Target className="w-4 h-4 text-blue-600" />
                                            <span className="font-medium text-blue-700 text-sm">Term</span>
                                        </div>
                                        <span className={`text-xs font-semibold ${getCharacterCountStyle(formData.term.length, 'term')}`}>
                                            {formData.term.length}/255
                                        </span>
                                        <div className="mt-2 w-full bg-blue-200 rounded-full h-1">
                                            <div
                                                className={`h-1 rounded-full transition-all duration-300 ${
                                                    formData.term.length > 230 ? 'bg-red-500' :
                                                        formData.term.length > 200 ? 'bg-orange-500' :
                                                            'bg-blue-500'
                                                }`}
                                                style={{ width: `${(formData.term.length / 255) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                                        <div className="flex items-center justify-center space-x-2 mb-1">
                                            <CheckCircle className="w-4 h-4 text-orange-600" />
                                            <span className="font-medium text-orange-700 text-sm">Definition</span>
                                        </div>
                                        <span className={`text-xs font-semibold ${getCharacterCountStyle(formData.definition.length, 'definition')}`}>
                                            {formData.definition.length}/255
                                        </span>
                                        <div className="mt-2 w-full bg-orange-200 rounded-full h-1">
                                            <div
                                                className={`h-1 rounded-full transition-all duration-300 ${
                                                    formData.definition.length > 230 ? 'bg-red-500' :
                                                        formData.definition.length > 200 ? 'bg-orange-500' :
                                                            'bg-orange-500'
                                                }`}
                                                style={{ width: `${(formData.definition.length / 255) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AddCardPage;