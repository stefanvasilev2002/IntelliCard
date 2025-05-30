import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Save, Plus, Trash2, Globe, Lock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { cardSetsAPI } from '../services/api';
import toast from 'react-hot-toast';

const CreateCardSetPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        isPublic: false,
    });
    const [cards, setCards] = useState([
        { term: '', definition: '' },
        { term: '', definition: '' },
    ]);
    const [errors, setErrors] = useState({});

    const createCardSetMutation = useMutation({
        mutationFn: async (data) => {
            const response = await cardSetsAPI.create(data);
            return response.data;
        },
        onSuccess: (cardSet) => {
            toast.success('Card set created successfully!');
            navigate(`/cardset/${cardSet.id}`);
        },
        onError: (error) => {
            toast.error('Failed to create card set');
            console.error('Error creating card set:', error);
        },
    });

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleCardChange = (index, field, value) => {
        const newCards = [...cards];
        newCards[index] = { ...newCards[index], [field]: value };
        setCards(newCards);
    };

    const addCard = () => {
        setCards([...cards, { term: '', definition: '' }]);
    };

    const removeCard = (index) => {
        if (cards.length > 2) {
            setCards(cards.filter((_, i) => i !== index));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Card set name is required';
        }
        const validCards = cards.filter(card => card.term.trim() && card.definition.trim());
        if (validCards.length === 0) {
            newErrors.cards = 'At least one complete card (term and definition) is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const validCards = cards.filter(card => card.term.trim() && card.definition.trim());

        const cardSetData = {
            name: formData.name.trim(),
            isPublic: formData.isPublic,
        };

        createCardSetMutation.mutate(cardSetData);
    };

    const isLoading = createCardSetMutation.isPending;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create New Card Set</h1>
                        <p className="text-gray-600 mt-1">Create a new collection of flashcards</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Card Set Details */}
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Card Set Details</h2>

                        <div className="space-y-6">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Card Set Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    placeholder="Enter a name for your card set"
                                    className={`input ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    disabled={isLoading}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Visibility */}
                            <div>
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        name="isPublic"
                                        checked={formData.isPublic}
                                        onChange={handleFormChange}
                                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                                        disabled={isLoading}
                                    />
                                    <div className="flex items-center space-x-2">
                                        {formData.isPublic ? (
                                            <Globe size={16} className="text-green-600" />
                                        ) : (
                                            <Lock size={16} className="text-gray-500" />
                                        )}
                                        <span className="text-sm font-medium text-gray-700">
                      Make this card set public
                    </span>
                                    </div>
                                </label>
                                <p className="mt-1 text-sm text-gray-500 ml-7">
                                    {formData.isPublic
                                        ? 'Anyone can view and study this card set'
                                        : 'Only you can access this card set (you can share it later)'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Cards Section */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Cards</h2>
                            <button
                                type="button"
                                onClick={addCard}
                                className="btn-outline flex items-center space-x-2"
                                disabled={isLoading}
                            >
                                <Plus size={16} />
                                <span>Add Card</span>
                            </button>
                        </div>

                        {errors.cards && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{errors.cards}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {cards.map((card, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-gray-700">Card {index + 1}</span>
                                        {cards.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => removeCard(index)}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                disabled={isLoading}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Term
                                            </label>
                                            <input
                                                type="text"
                                                value={card.term}
                                                onChange={(e) => handleCardChange(index, 'term', e.target.value)}
                                                placeholder="Enter the term or question"
                                                className="input"
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Definition
                                            </label>
                                            <textarea
                                                value={card.definition}
                                                onChange={(e) => handleCardChange(index, 'definition', e.target.value)}
                                                placeholder="Enter the definition or answer"
                                                rows={3}
                                                className="input resize-none"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 text-sm text-gray-500">
                            <p>💡 Tip: You can add more cards after creating the set. We recommend starting with at least a few cards.</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="btn-secondary"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary flex items-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    <span>Create Card Set</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default CreateCardSetPage;