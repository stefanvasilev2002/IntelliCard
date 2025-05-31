import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { cardsAPI } from '../services/api';
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

    const addCardMutation = useMutation({
        mutationFn: async (cardData) => {
            const response = await cardsAPI.create(id, cardData);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Card added successfully!');
            queryClient.invalidateQueries(['cards', id]);
            queryClient.invalidateQueries(['studyOverview', id]);
            navigate(`/cardset/${id}`);
        },
        onError: (error) => {
            toast.error('Failed to add card');
            console.error('Error adding card:', error);
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
        }

        if (!formData.definition.trim()) {
            newErrors.definition = 'Definition is required';
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

    const isLoading = addCardMutation.isPending;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <button
                        onClick={() => navigate(`/cardset/${id}`)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add New Card</h1>
                        <p className="text-gray-600 mt-1">Create a new flashcard</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Card Details</h2>

                        <div className="space-y-6">
                            {/* Term */}
                            <div>
                                <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-2">
                                    Term / Question *
                                </label>
                                <input
                                    type="text"
                                    id="term"
                                    name="term"
                                    value={formData.term}
                                    onChange={handleChange}
                                    placeholder="Enter the term or question"
                                    className={`input ${errors.term ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    disabled={isLoading}
                                />
                                {errors.term && (
                                    <p className="mt-1 text-sm text-red-600">{errors.term}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    This will be shown on the front of the flashcard
                                </p>
                            </div>

                            {/* Definition */}
                            <div>
                                <label htmlFor="definition" className="block text-sm font-medium text-gray-700 mb-2">
                                    Definition / Answer *
                                </label>
                                <textarea
                                    id="definition"
                                    name="definition"
                                    value={formData.definition}
                                    onChange={handleChange}
                                    placeholder="Enter the definition or answer"
                                    rows={4}
                                    className={`input resize-none ${errors.definition ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    disabled={isLoading}
                                />
                                {errors.definition && (
                                    <p className="mt-1 text-sm text-red-600">{errors.definition}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    This will be shown on the back of the flashcard
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    {(formData.term || formData.definition) && (
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Front (Term)
                                    </label>
                                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white min-h-[100px] flex items-center justify-center">
                                        <p className="text-center font-medium">
                                            {formData.term || 'Your term will appear here'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Back (Definition)
                                    </label>
                                    <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg text-white min-h-[100px] flex items-center justify-center">
                                        <p className="text-center">
                                            {formData.definition || 'Your definition will appear here'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    <span>Add Card</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default AddCardPage;