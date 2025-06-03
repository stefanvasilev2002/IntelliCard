import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Plus, Trash2, Globe, Lock, Edit } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { cardSetsAPI, cardsAPI } from '../services/api';
import toast from 'react-hot-toast';

const EditCardSetPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        isPublic: false,
    });
    const [cards, setCards] = useState([]);
    const [errors, setErrors] = useState({});

    const { data: cardSet, isLoading: cardSetLoading } = useQuery({
        queryKey: ['cardSet', id],
        queryFn: async () => {
            const response = await cardSetsAPI.getById(id);
            return response.data;
        },
    });

    const { data: existingCards, isLoading: cardsLoading } = useQuery({
        queryKey: ['cards', id],
        queryFn: async () => {
            const response = await cardsAPI.getByCardSetId(id);
            return response.data;
        },
        enabled: !!id,
    });

    const updateCardSetMutation = useMutation({
        mutationFn: async (data) => {
            const response = await cardSetsAPI.update(id, data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Card set updated successfully!');
            navigate(`/cardset/${id}`);
        },
        onError: (error) => {
            toast.error('Failed to update card set');
        },
    });

    const addCardMutation = useMutation({
        mutationFn: async (cardData) => {
            const response = await cardsAPI.create(id, cardData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['cards', id]);
            toast.success('Card added successfully');
        },
        onError: () => {
            toast.error('Failed to add card');
        },
    });

    const updateCardMutation = useMutation({
        mutationFn: async ({ cardId, cardData }) => {
            const response = await cardsAPI.update(cardId, cardData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['cards', id]);
            toast.success('Card updated successfully');
        },
        onError: () => {
            toast.error('Failed to update card');
        },
    });

    const deleteCardMutation = useMutation({
        mutationFn: async (cardId) => {
            await cardsAPI.delete(cardId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['cards', id]);
            toast.success('Card deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete card');
        },
    });

    useEffect(() => {
        if (cardSet) {
            setFormData({
                name: cardSet.name,
                isPublic: cardSet.isPublic,
            });
        }
    }, [cardSet]);

    useEffect(() => {
        if (existingCards) {
            setCards(existingCards.map(card => ({ ...card, isExisting: true })));
        }
    }, [existingCards]);

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

    const addNewCard = () => {
        setCards([...cards, { term: '', definition: '', isExisting: false }]);
    };

    const removeCard = (index) => {
        const card = cards[index];

        if (card.isExisting && card.id) {
            if (window.confirm('Are you sure you want to delete this card?')) {
                deleteCardMutation.mutate(card.id);
                const newCards = cards.filter((_, i) => i !== index);
                setCards(newCards);
            }
        } else {
            const newCards = cards.filter((_, i) => i !== index);
            setCards(newCards);
        }
    };

    const saveCard = async (index) => {
        const card = cards[index];

        if (!card.term.trim() || !card.definition.trim()) {
            toast.error('Both term and definition are required');
            return;
        }

        if (card.isExisting && card.id) {
            updateCardMutation.mutate({
                cardId: card.id,
                cardData: {
                    term: card.term,
                    definition: card.definition
                }
            });
        } else {
            addCardMutation.mutate({
                term: card.term,
                definition: card.definition
            });

            const newCards = cards.filter((_, i) => i !== index);
            setCards(newCards);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Card set name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const cardSetData = {
            name: formData.name.trim(),
            isPublic: formData.isPublic,
        };

        updateCardSetMutation.mutate(cardSetData);
    };

    const isLoading = updateCardSetMutation.isPending;

    if (cardSetLoading || cardsLoading) return <LoadingSpinner />;

    if (!cardSet) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <p className="text-red-600">Card set not found or access denied</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 btn-primary"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <button
                        onClick={() => navigate(`/cardset/${id}`)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Card Set</h1>
                        <p className="text-gray-600 mt-1">Modify your flashcard collection</p>
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
                                onClick={addNewCard}
                                className="btn-outline flex items-center space-x-2"
                                disabled={isLoading}
                            >
                                <Plus size={16} />
                                <span>Add Card</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {cards.map((card, index) => (
                                <div key={card.id || `new-${index}`} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      {card.isExisting ? `Card ${index + 1}` : `New Card ${index + 1}`}
                    </span>
                                        <div className="flex items-center space-x-2">
                                            {!card.isExisting && (
                                                <button
                                                    type="button"
                                                    onClick={() => saveCard(index)}
                                                    className="text-green-600 hover:text-green-700 p-1"
                                                    disabled={isLoading}
                                                >
                                                    <Save size={16} />
                                                </button>
                                            )}
                                            {card.isExisting && (
                                                <button
                                                    type="button"
                                                    onClick={() => saveCard(index)}
                                                    className="text-blue-600 hover:text-blue-700 p-1"
                                                    disabled={isLoading}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeCard(index)}
                                                className="text-red-600 hover:text-red-700 p-1"
                                                disabled={isLoading}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
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
                                                maxLength={255}
                                                className="input"
                                                disabled={isLoading}
                                            />
                                            <p className={`text-xs mt-1 ${
                                                card.term.length > 230 ? 'text-red-600' :
                                                    card.term.length > 200 ? 'text-orange-600' : 'text-gray-400'
                                            }`}>
                                                {card.term.length}/255
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Definition
                                            </label>
                                            <textarea
                                                value={card.definition}
                                                onChange={(e) => handleCardChange(index, 'definition', e.target.value)}
                                                placeholder="Enter the definition or answer"
                                                maxLength={255}
                                                rows={3}
                                                className="input resize-none"
                                                disabled={isLoading}
                                            />
                                            <p className={`text-xs mt-1 ${
                                                card.definition.length > 230 ? 'text-red-600' :
                                                    card.definition.length > 200 ? 'text-orange-600' : 'text-gray-400'
                                            }`}>
                                                {card.definition.length}/255
                                            </p>
                                        </div>
                                    </div>

                                    {!card.isExisting && (
                                        <div className="mt-3 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                                            💡 This is a new card. Click the save icon to add it to your set.
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {cards.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>No cards yet. Add some cards to get started!</p>
                            </div>
                        )}

                        <div className="mt-4 text-sm text-gray-500">
                            <p>💡 Tip: You can add multiple cards and save them individually, or update existing cards by clicking the edit icon.</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigate(`/cardset/${id}`)}
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
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    <span>Update Card Set</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default EditCardSetPage;