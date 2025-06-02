import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Upload,
    File,
    FileText,
    X,
    Loader,
    Wand2,
    Settings,
    AlertCircle,
    CheckCircle,
    Zap,
    Target,
    Brain
} from 'lucide-react';
import { generateCardsAPI } from '../services/api.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const DocumentCardGenerator = ({ cardSetId, onCardsGenerated, onClose }) => {
    const [file, setFile] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [generationProgress, setGenerationProgress] = useState(0);

    const [settings, setSettings] = useState({
        questionCount: 10,
        difficulty: 'MEDIUM',
        language: 'English'
    });

    const validateFile = (selectedFile) => {
        setError('');

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
            return false;
        }

        const fileExt = selectedFile.name.split('.').pop().toLowerCase();
        if (!['pdf', 'txt'].includes(fileExt)) {
            setError('Unsupported file format. Please upload PDF or TXT files.');
            return false;
        }

        return true;
    };

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];

        if (!validateFile(selectedFile)) {
            return;
        }

        setFile(selectedFile);
        setError('');
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt']
        },
        maxSize: MAX_FILE_SIZE,
        multiple: false
    });

    const generateCards = async () => {
        setIsGenerating(true);
        setGenerationProgress(0);
        setError('');

        const progressInterval = setInterval(() => {
            setGenerationProgress(prev => Math.min(prev + 10, 90));
        }, 800);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('questionCount', settings.questionCount.toString());
            formData.append('difficultyLevel', settings.difficulty);
            formData.append('language', settings.language);

            console.log('Sending request with:', {
                cardSetId,
                fileName: file.name,
                fileSize: file.size,
                questionCount: settings.questionCount,
                difficulty: settings.difficulty,
                language: settings.language
            });

            const response = await generateCardsAPI.generateCards(cardSetId, formData);

            clearInterval(progressInterval);
            setGenerationProgress(100);

            const generatedCards = response.data;

            if (!generatedCards || generatedCards.length === 0) {
                setError('No cards could be generated from the document. Please try a different document or adjust settings.');
                return;
            }

            onCardsGenerated(generatedCards);
            onClose();
        } catch (err) {
            clearInterval(progressInterval);
            console.error('Card generation error:', err);

            let errorMessage = 'Failed to generate cards. Please try again.';

            if (err.response) {
                const status = err.response.status;
                const errorData = err.response.data;

                if (status === 400) {
                    errorMessage = errorData.message || 'Invalid request. Please check your file and settings.';
                } else if (status === 413) {
                    errorMessage = 'File is too large. Please upload a smaller file.';
                } else if (status === 500) {
                    errorMessage = 'Server error occurred while generating cards. Please try again later.';
                } else {
                    errorMessage = errorData.message || `Request failed with status: ${status}`;
                }
            } else if (err.request) {
                errorMessage = 'Network error. Please check your connection and try again.';
            }

            setError(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    const removeFile = () => {
        setFile(null);
        setError('');
        setGenerationProgress(0);
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            'EASY': 'text-green-600 bg-green-50 border-green-200',
            'MEDIUM': 'text-yellow-600 bg-yellow-50 border-yellow-200',
            'HARD': 'text-red-600 bg-red-50 border-red-200',
            'MIXED': 'text-purple-600 bg-purple-50 border-purple-200'
        };
        return colors[difficulty] || colors['MEDIUM'];
    };

    const getDifficultyIcon = (difficulty) => {
        const icons = {
            'EASY': Target,
            'MEDIUM': Zap,
            'HARD': Brain,
            'MIXED': Settings
        };
        const Icon = icons[difficulty] || Zap;
        return <Icon size={16} />;
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Generate Cards from Document</h3>
                        <p className="text-sm text-gray-500">Upload a document and let AI create flashcards for you</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isGenerating}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-red-800">Error</h4>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* File Upload */}
                    {!file ? (
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
                            } ${isGenerating ? 'pointer-events-none opacity-50' : ''}`}
                        >
                            <input {...getInputProps()} disabled={isGenerating} />
                            <div className="flex flex-col items-center justify-center">
                                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                                <p className="text-gray-600 mb-2">
                                    {isDragActive
                                        ? 'Drop the document here'
                                        : 'Drag & drop your document here'}
                                </p>
                                <p className="text-gray-500 text-sm mb-4">
                                    Supported formats: PDF, TXT (Max 10MB)
                                </p>
                                <button
                                    type="button"
                                    className="btn-primary"
                                    disabled={isGenerating}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Browse Files
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* File Info */}
                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {file.name.endsWith('.pdf') ? (
                                        <File className="w-8 h-8 text-red-500" />
                                    ) : (
                                        <FileText className="w-8 h-8 text-blue-500" />
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900">{file.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                {!isGenerating && (
                                    <button
                                        onClick={removeFile}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>

                            {/* Generation Settings */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                                    <Settings size={16} />
                                    <span>Generation Settings</span>
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Number of Cards
                                        </label>
                                        <select
                                            value={settings.questionCount}
                                            onChange={(e) => setSettings({...settings, questionCount: parseInt(e.target.value)})}
                                            className="input"
                                            disabled={isGenerating}
                                        >
                                            <option value={5}>5 cards</option>
                                            <option value={10}>10 cards</option>
                                            <option value={15}>15 cards</option>
                                            <option value={20}>20 cards</option>
                                            <option value={25}>25 cards</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Difficulty Level
                                        </label>
                                        <select
                                            value={settings.difficulty}
                                            onChange={(e) => setSettings({...settings, difficulty: e.target.value})}
                                            className="input"
                                            disabled={isGenerating}
                                        >
                                            <option value="EASY">Easy</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HARD">Hard</option>
                                            <option value="MIXED">Mixed Difficulty</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Language
                                    </label>
                                    <select
                                        value={settings.language}
                                        onChange={(e) => setSettings({...settings, language: e.target.value})}
                                        className="input max-w-xs"
                                        disabled={isGenerating}
                                    >
                                        <option value="English">English</option>
                                        <option value="Spanish">Spanish</option>
                                        <option value="French">French</option>
                                        <option value="German">German</option>
                                        <option value="Italian">Italian</option>
                                        <option value="Macedonian">Macedonian</option>
                                    </select>
                                </div>

                                {/* Generation Progress */}
                                {isGenerating && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700">Generating cards...</span>
                                            <span className="text-gray-700">{generationProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${generationProgress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            The AI is processing your document and creating flashcards...
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {file && (
                    <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                        <div className="flex items-center space-x-2">
                            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm ${getDifficultyColor(settings.difficulty)}`}>
                                {getDifficultyIcon(settings.difficulty)}
                                <span>{settings.difficulty.toLowerCase()}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                                {settings.questionCount} cards
                            </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={onClose}
                                className="btn-secondary"
                                disabled={isGenerating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={generateCards}
                                className="btn-primary flex items-center space-x-2"
                                disabled={isGenerating || !file}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Wand2 size={16} />
                                        <span>Generate Cards</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentCardGenerator;