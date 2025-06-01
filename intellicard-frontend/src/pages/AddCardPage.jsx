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

    const isLoading = addCardMutation.isPending;

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
                        <h1 className="text-3xl font-bold text-gray-900">Add New Card</h1>
                        <p className="text-gray-600 mt-1">Create a new flashcard</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form Section */}
                    <div>
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
                                            maxLength={255}
                                            className={`input ${errors.term ? 'border-red-500 focus:ring-red-500' : ''}`}
                                            disabled={isLoading}
                                        />
                                        {errors.term && (
                                            <p className="mt-1 text-sm text-red-600">{errors.term}</p>
                                        )}
                                        <div className="mt-1 flex justify-between">
                                            <p className="text-sm text-gray-500">
                                                This will be shown on the front of the flashcard
                                            </p>
                                            <p className={`text-xs ${
                                                formData.term.length > 230 ? 'text-red-600' :
                                                    formData.term.length > 200 ? 'text-orange-600' : 'text-gray-400'
                                            }`}>
                                                {formData.term.length}/255
                                            </p>
                                        </div>
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
                                            maxLength={255}
                                            rows={6}
                                            className={`input resize-none ${errors.definition ? 'border-red-500 focus:ring-red-500' : ''}`}
                                            disabled={isLoading}
                                        />
                                        {errors.definition && (
                                            <p className="mt-1 text-sm text-red-600">{errors.definition}</p>
                                        )}
                                        <div className="mt-1 flex justify-between">
                                            <p className="text-sm text-gray-500">
                                                This will be shown on the back of the flashcard
                                            </p>
                                            <p className={`text-xs ${
                                                formData.definition.length > 230 ? 'text-red-600' :
                                                    formData.definition.length > 200 ? 'text-orange-600' : 'text-gray-400'
                                            }`}>
                                                {formData.definition.length}/255
                                            </p>
                                        </div>
                                    </div>
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

                    {/* Preview Section */}
                    <div className="lg:sticky lg:top-8 lg:self-start">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>

                            {/* Front Card */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Front (Term)
                                </label>
                                <div className="relative w-full h-48 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg overflow-hidden">
                                    <div className="absolute inset-0 p-4 flex items-center justify-center">
                                        <div className="text-center w-full">
                                            <div className="mb-3">
                                                <span className="inline-block px-2 py-1 bg-blue-400 bg-opacity-20 text-blue-100 text-xs font-medium rounded-full">
                                                    TERM
                                                </span>
                                            </div>
                                            <div className="text-white font-semibold leading-tight break-all whitespace-pre-wrap overflow-hidden h-24 flex items-center justify-center">
                                                <p className={`text-center ${
                                                    formData.term.length > 80 ? 'text-sm' :
                                                        formData.term.length > 40 ? 'text-base' : 'text-lg'
                                                }`} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                                    {formData.term || 'Your term will appear here'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Back Card */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Back (Definition)
                                </label>
                                <div className="relative w-full h-48 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg overflow-hidden">
                                    <div className="absolute inset-0 p-4 flex items-center justify-center">
                                        <div className="text-center w-full">
                                            <div className="mb-3">
                                                <span className="inline-block px-2 py-1 bg-orange-400 bg-opacity-20 text-orange-100 text-xs font-medium rounded-full">
                                                    DEFINITION
                                                </span>
                                            </div>
                                            <div className="text-white leading-relaxed break-all whitespace-pre-wrap overflow-hidden h-24 flex items-center justify-center">
                                                <p className={`text-center ${
                                                    formData.definition.length > 200 ? 'text-xs' :
                                                        formData.definition.length > 100 ? 'text-sm' : 'text-base'
                                                }`} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                                    {formData.definition || 'Your definition will appear here'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Character Count */}
                            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                                <div className="text-center">
                                    <span className="font-medium text-gray-600">Term: </span>
                                    <span className={
                                        formData.term.length > 230 ? 'text-red-600 font-semibold' :
                                            formData.term.length > 200 ? 'text-orange-600 font-medium' : 'text-gray-500'
                                    }>
                                        {formData.term.length}/255
                                    </span>
                                </div>
                                <div className="text-center">
                                    <span className="font-medium text-gray-600">Definition: </span>
                                    <span className={
                                        formData.definition.length > 230 ? 'text-red-600 font-semibold' :
                                            formData.definition.length > 200 ? 'text-orange-600 font-medium' : 'text-gray-500'
                                    }>
                                        {formData.definition.length}/255
                                    </span>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-blue-700">
                                    <span className="font-medium">💡 Tips:</span> Keep content under 255 characters each.
                                    Use concise terms and clear definitions for the best study experience.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AddCardPage;