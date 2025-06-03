import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Save, Globe, Lock, Plus } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { cardSetsAPI } from '../services/api';
import toast from 'react-hot-toast';

const CreateCardSetPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        isPublic: false,
    });
    const [errors, setErrors] = useState({});

    const createCardSetMutation = useMutation({
        mutationFn: async (data) => {
            const response = await cardSetsAPI.create(data);
            return response.data;
        },
        onSuccess: (cardSet) => {
            toast.success('Card set created successfully!');
            navigate(`/cardset/${cardSet.id}/add-card`);
        },
        onError: (error) => {
            toast.error('Failed to create card set');
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

        createCardSetMutation.mutate(cardSetData);
    };

    const isLoading = createCardSetMutation.isPending;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
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

                    {/* Next Steps Info */}
                    <div className="card bg-blue-50 border-blue-200">
                        <div className="flex items-start space-x-3">
                            <Plus className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-blue-900 mb-1">Next Steps</h3>
                                <p className="text-sm text-blue-700">
                                    After creating your card set, you'll be taken to the card creation page where you can add your first cards.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Study Features Preview */}
                    <div className="card bg-gray-50 border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Features You'll Get</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Spaced repetition algorithm</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Progress tracking</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Study statistics</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Mobile-friendly interface</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
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