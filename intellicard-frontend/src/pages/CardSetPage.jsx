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
    Settings
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { cardSetsAPI, cardsAPI, studyAPI } from '../services/api';
import toast from 'react-hot-toast';

const CardSetPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCard, setEditingCard] = useState({ term: '', definition: '' });

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

    // Delete card mutation
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

    // Update card mutation
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

    const filteredCards = cards?.filter(card =>
        card.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.definition.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

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

    if (cardSetLoading) return <LoadingSpinner />;

    if (cardSetError) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <p className="text-red-600">Failed to load card set. Please try again.</p>
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

    const isOwner = cardSet?.accessType === 'OWNER';
    const canStudy = cards && cards.length > 0;

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center space-x-3">
                            <h1 className="text-3xl font-bold text-gray-900">{cardSet?.name}</h1>
                            {getAccessIcon(cardSet?.accessType)}
                        </div>
                        <p className="text-gray-600 mt-1">
                            {getAccessLabel(cardSet?.accessType)} • by {cardSet?.creatorName}
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        {isOwner && (
                            <div className="relative group">
                                <button className="btn-secondary flex items-center space-x-2">
                                    <Settings size={16} />
                                    <span>Manage</span>
                                    <MoreHorizontal size={16} />
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                    <Link
                                        to={`/cardset/${id}/edit`}
                                        className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-t-lg"
                                    >
                                        <Edit size={14} />
                                        <span>Edit Card Set</span>
                                    </Link>
                                    <Link
                                        to={`/cardset/${id}/add-card`}
                                        className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-b-lg"
                                    >
                                        <Plus size={14} />
                                        <span>Add New Card</span>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {canStudy && (
                            <Link
                                to={`/cardset/${id}/study`}
                                className="btn-primary flex items-center space-x-2"
                            >
                                <Play size={16} />
                                <span>Study</span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Cards</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {studyOverview?.totalCards || cards?.length || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Due for Review</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {studyOverview?.dueCards || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Target className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Learning</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {studyOverview?.learningCards || 0}
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
                                <p className="text-sm font-medium text-gray-600">Mastered</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {studyOverview?.masteredCards || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions for Owners */}
                {isOwner && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <Link
                            to={`/cardset/${id}/add-card`}
                            className="card-hover flex items-center space-x-4 p-4"
                        >
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Plus className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Add New Card</h3>
                                <p className="text-sm text-gray-500">Create a new flashcard</p>
                            </div>
                        </Link>

                        <Link
                            to={`/cardset/${id}/edit`}
                            className="card-hover flex items-center space-x-4 p-4"
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

                {/* Cards Section */}
                <div className="card">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">All Cards</h2>
                        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search cards..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input pl-9 w-64"
                                />
                            </div>
                            {isOwner && (
                                <Link
                                    to={`/cardset/${id}/add-card`}
                                    className="btn-primary flex items-center space-x-2"
                                >
                                    <Plus size={16} />
                                    <span>Add Card</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {cardsLoading ? (
                        <LoadingSpinner size="medium" message="Loading cards..." />
                    ) : filteredCards.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                {searchTerm ? 'No cards match your search' : 'No cards yet'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm
                                    ? 'Try adjusting your search terms.'
                                    : isOwner
                                        ? 'Get started by adding your first card.'
                                        : 'This card set doesn\'t have any cards yet.'
                                }
                            </p>
                            {!searchTerm && isOwner && (
                                <div className="mt-6">
                                    <Link to={`/cardset/${id}/add-card`} className="btn-primary">
                                        Add your first card
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredCards.map((card) => (
                                <div key={card.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Term
                                                </label>
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-gray-900">{card.term}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Definition
                                                </label>
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-gray-900">{card.definition}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {isOwner && (
                                            <div className="ml-4 flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEditCard(card)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Edit card"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCard(card)}
                                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Delete card"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {(card.status || card.timesReviewed) && (
                                        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                                            <span>Status: {card.status || 'NEW'}</span>
                                            <span>Reviewed: {card.timesReviewed || 0} times</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

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

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Card</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to delete this card? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="btn-secondary"
                                    disabled={deleteCardMutation.isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteCard}
                                    className="btn-danger"
                                    disabled={deleteCardMutation.isPending}
                                >
                                    {deleteCardMutation.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CardSetPage;