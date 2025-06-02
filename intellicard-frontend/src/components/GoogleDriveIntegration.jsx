import React, { useState, useEffect } from 'react';
import { FiCloud, FiDownload, FiFile, FiFolder } from 'react-icons/fi';

const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

const GoogleDriveIntegration = ({ onFileSelect, setFile, setDocumentMetadata }) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [files, setFiles] = useState([]);
    const [showFileBrowser, setShowFileBrowser] = useState(false);
    const [currentFolder, setCurrentFolder] = useState('root');
    const [folderPath, setFolderPath] = useState([{ id: 'root', name: 'My Drive' }]);
    const [tokenClient, setTokenClient] = useState(null);

    useEffect(() => {
        // Load Google API
        const loadGoogleApi = async () => {
            // Load Google Identity Services script
            if (!window.google?.accounts?.oauth2) {
                const gisScript = document.createElement('script');
                gisScript.src = 'https://accounts.google.com/gsi/client';
                gisScript.async = true;
                gisScript.defer = true;
                gisScript.onload = initializeAuth;
                document.head.appendChild(gisScript);
            } else {
                initializeAuth();
            }

            // Load Google API script
            if (!window.gapi) {
                const gapiScript = document.createElement('script');
                gapiScript.src = 'https://apis.google.com/js/api.js';
                gapiScript.async = true;
                gapiScript.defer = true;
                gapiScript.onload = initializeGapi;
                document.head.appendChild(gapiScript);
            } else {
                initializeGapi();
            }
        };

        loadGoogleApi();

        return () => {
            // Cleanup
            setShowFileBrowser(false);
        };
    }, []);

    const initializeAuth = () => {
        if (!window.google?.accounts?.oauth2) return;
        try {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (response) => {
                    if (response.access_token) {
                        // Store token in session storage
                        sessionStorage.setItem('google_drive_token', response.access_token);
                        setIsAuthorized(true);

                        // If file browser is active, load files
                        if (showFileBrowser) {
                            listFiles('root');
                        }
                    }
                },
                error_callback: (err) => {
                    console.error('Auth error:', err);
                    setError('Authentication failed. Please try again.');
                }
            });
            setTokenClient(client);
        } catch (err) {
            console.error('Error initializing authentication:', err);
            setError('Failed to initialize Google Drive integration');
        }
    };

    const initializeGapi = () => {
        if (!window.gapi) return;
        window.gapi.load('client', async () => {
            try {
                await window.gapi.client.init({
                    apiKey: API_KEY,
                });
                await window.gapi.client.load('drive', 'v3');
            } catch (err) {
                console.error('Error initializing gapi client:', err);
            }
        });
    };

    const handleSignIn = () => {
        try {
            if (tokenClient) {
                // Request an access token
                tokenClient.requestAccessToken();
            } else {
                setError('Google authentication is not ready yet. Please try again in a moment.');
            }
        } catch (err) {
            console.error('Sign in error:', err);
            setError('Failed to sign in to Google Drive');
        }
    };

    const handleSignOut = () => {
        try {
            // Clear token from session storage
            sessionStorage.removeItem('google_drive_token');
            setIsAuthorized(false);
            setShowFileBrowser(false);
            setFiles([]);

            // Revoke token if Google API is available
            const token = sessionStorage.getItem('google_drive_token');
            if (window.google?.accounts?.oauth2 && token) {
                window.google.accounts.oauth2.revoke(token, () => {
                    console.log('Token revoked');
                });
            }
        } catch (err) {
            console.error('Sign out error:', err);
        }
    };

    const openFileBrowser = async () => {
        setShowFileBrowser(true);
        setError(null);

        if (isAuthorized) {
            await listFiles('root');
        } else {
            // Will trigger auth flow
            handleSignIn();
        }
    };

    const closeFileBrowser = () => {
        setShowFileBrowser(false);
        setFiles([]);
    };

    const listFiles = async (folderId) => {
        try {
            setIsLoading(true);
            setError(null);

            const token = sessionStorage.getItem('google_drive_token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            // Update current folder
            setCurrentFolder(folderId);

            // Query for files and folders in the current folder
            let query = `'${folderId}' in parents and trashed = false`;

            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,modifiedTime)&orderBy=folder,name`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to list files');
            }

            const data = await response.json();
            setFiles(data.files || []);

            // Update folder path if navigating to a subfolder
            if (folderId !== 'root' && folderId !== folderPath[folderPath.length - 1].id) {
                // Get folder name
                const folderResponse = await fetch(
                    `https://www.googleapis.com/drive/v3/files/${folderId}?fields=name`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (folderResponse.ok) {
                    const folderData = await folderResponse.json();
                    const newPath = [...folderPath];

                    // Check if we're going back in the path
                    const existingIndex = newPath.findIndex(folder => folder.id === folderId);
                    if (existingIndex >= 0) {
                        // Trim the path if we're going back
                        setFolderPath(newPath.slice(0, existingIndex + 1));
                    } else {
                        // Add new folder to path
                        newPath.push({ id: folderId, name: folderData.name });
                        setFolderPath(newPath);
                    }
                }
            } else if (folderId === 'root') {
                // Reset to root
                setFolderPath([{ id: 'root', name: 'My Drive' }]);
            }

        } catch (err) {
            console.error('Error listing files:', err);
            setError('Failed to load files from Google Drive');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadFile = async (file) => {
        try {
            setIsLoading(true);
            setError(null);

            const token = sessionStorage.getItem('google_drive_token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            // Check for supported file type
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (!['pdf', 'docx', 'txt'].includes(fileExtension)) {
                setError('Unsupported file format. Please select PDF, DOCX, or TXT files.');
                setIsLoading(false);
                return;
            }

            // Get file metadata to check size
            const metadataResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files/${file.id}?fields=size,name`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!metadataResponse.ok) {
                throw new Error('Failed to get file metadata');
            }

            const metadata = await metadataResponse.json();

            // Check file size (5MB limit)
            const fileSize = parseInt(metadata.size || '0');
            if (fileSize > 5 * 1024 * 1024) {
                setError('File is too large. Maximum size is 5MB.');
                setIsLoading(false);
                return;
            }

            // Download file
            const downloadResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!downloadResponse.ok) {
                throw new Error('Failed to download file');
            }

            const blob = await downloadResponse.blob();

            // Create file object
            const downloadedFile = new File(
                [blob],
                metadata.name,
                {
                    type: getFileType(fileExtension),
                    lastModified: Date.now()
                }
            );

            // Set metadata
            const newMetadata = {
                title: metadata.name.replace(/\.[^/.]+$/, ''),
                language: 'en',
                type: 'LECTURE',
                format: fileExtension.toUpperCase()
            };

            // Pass to parent component
            setFile(downloadedFile);
            setDocumentMetadata(newMetadata);
            onFileSelect(downloadedFile, newMetadata);

            // Close file browser
            setShowFileBrowser(false);

        } catch (err) {
            console.error('Error downloading file:', err);
            setError('Failed to download file from Google Drive');
        } finally {
            setIsLoading(false);
        }
    };

    const getFileType = (extension) => {
        const types = {
            'pdf': 'application/pdf',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain'
        };
        return types[extension] || 'application/octet-stream';
    };

    const isFolder = (file) => {
        return file.mimeType === 'application/vnd.google-apps.folder';
    };

    const handleFileClick = (file) => {
        if (isFolder(file)) {
            listFiles(file.id);
        } else {
            downloadFile(file);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0 || !bytes) return '—';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Import from Google Drive</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
                    <div className="mr-2">⚠️</div>
                    {error}
                </div>
            )}

            {!showFileBrowser ? (
                <div>
                    {!isAuthorized ? (
                        <button
                            onClick={handleSignIn}
                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FiCloud className="mr-2" />
                            Connect to Google Drive
                        </button>
                    ) : (
                        <button
                            onClick={openFileBrowser}
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FiFolder className="mr-2" />
                            Browse Google Drive
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                    {/* File browser header */}
                    <div className="flex items-center justify-between border-b px-4 py-3 bg-gray-50">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 overflow-x-auto">
                            {folderPath.map((folder, index) => (
                                <div key={folder.id} className="flex items-center">
                                    {index > 0 && <span className="mx-1 text-gray-400">/</span>}
                                    <button
                                        onClick={() => listFiles(folder.id)}
                                        className="hover:text-blue-600 whitespace-nowrap"
                                    >
                                        {folder.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={closeFileBrowser}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    {/* File browser content */}
                    <div className="max-h-80 overflow-y-auto p-2">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : files.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No files found in this folder
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {files.map(file => (
                                    <tr
                                        key={file.id}
                                        onClick={() => handleFileClick(file)}
                                        className="hover:bg-gray-50 cursor-pointer"
                                    >
                                        <td className="py-2 px-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {isFolder(file) ? (
                                                    <FiFolder className="mr-2 text-yellow-500" />
                                                ) : (
                                                    <FiFile className="mr-2 text-blue-500" />
                                                )}
                                                <span className="truncate max-w-xs">{file.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 whitespace-nowrap text-gray-500">
                                            {isFolder(file) ? '—' : formatFileSize(file.size)}
                                        </td>
                                        <td className="py-2 px-3 whitespace-nowrap text-gray-500">
                                            {formatDate(file.modifiedTime)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* File browser footer */}
                    <div className="border-t px-4 py-3 bg-gray-50 flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                            Select a file to import it
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="text-sm text-gray-600 hover:text-gray-800"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            )}

            {isAuthorized && !showFileBrowser && (
                <div className="mt-2 text-right">
                    <button
                        onClick={handleSignOut}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Sign out from Google Drive
                    </button>
                </div>
            )}
        </div>
    );
};

export default GoogleDriveIntegration;