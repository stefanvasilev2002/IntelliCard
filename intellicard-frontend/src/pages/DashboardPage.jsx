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
    Brain
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { cardSetsAPI } from '../services/api';
import toast from 'react-hot-toast';

const DashboardPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    const { data: cardSets, isLoading, error, refetch } = useQuery({
        queryKey: ['cardSets'],
        queryFn: async () => {
            const response = await cardSetsAPI.getAll();
            return response.data;
        },
    });

    const filteredCardSets = cardSets?.filter(cardSet => {
        const matchesSearch = cardSet.name.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'owned') {
            return matchesSearch && cardSet.accessType === 'OWNER';
        } else if (filter === 'shared') {
            return matchesSearch && cardSet.accessType === 'ACCESSIBLE';
        } else if (filter === 'public') {
            return matchesSearch && cardSet.accessType === 'PUBLIC';
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
                return 'Owned';
            case 'ACCESSIBLE':
                return 'Shared';
            case 'PUBLIC':
                return 'Public';
            default:
                return 'Unknown';
        }
    };

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Sets</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {cardSets?.length || 0}
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
                                    {cardSets?.filter(set => set.accessType === 'OWNER').length || 0}
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
                                    {cardSets?.filter(set => set.accessType === 'ACCESSIBLE').length || 0}
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
                        ].map((filterOption) => (
                            <button
                                key={filterOption.key}
                                onClick={() => setFilter(filterOption.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filter === filterOption.key
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {filterOption.label}
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
                        {filteredCardSets.map((cardSet) => (
                            <div key={cardSet.id} className="card-hover group">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-2">
                                        {getAccessIcon(cardSet.accessType)}
                                        <span className="text-xs font-medium text-gray-500">
                      {getAccessLabel(cardSet.accessType)}
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
                                            <span>0 cards</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Clock size={14} />
                                            <span>0 due</span>
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
                                        <Link
                                            to={`/cardset/${cardSet.id}/study`}
                                            className="btn-primary flex items-center space-x-1 px-3 py-1 text-sm"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Play size={14} />
                                            <span>Study</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;