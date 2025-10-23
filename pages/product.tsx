"use client"

import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { useAuth } from '@clerk/nextjs';
import { fetchEventSource } from '@microsoft/fetch-event-source';

export default function Product() {
    const { getToken } = useAuth();
    const [idea, setIdea] = useState<string>('…loading');
    const [isGenerating, setIsGenerating] = useState<boolean>(true);
    const [progress, setProgress] = useState<number>(0);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let buffer = '';
        let progressTimer: NodeJS.Timeout;
        let progressValue = 0;

        const simulateProgress = () => {
            progressTimer = setInterval(() => {
                if (progressValue < 90) {
                    progressValue += Math.random() * 15;
                    setProgress(Math.min(progressValue, 90));
                }
            }, 200);
        };

        (async () => {
            const jwt = await getToken();
            if (!jwt) {
                setIdea('Authentication required');
                setIsGenerating(false);
                return;
            }

            simulateProgress();

            await fetchEventSource('/api', {
                headers: { Authorization: `Bearer ${jwt}` },
                onmessage(ev) {
                    buffer += ev.data;
                    setIdea(buffer);

                    // Smooth scroll to bottom as content updates
                    if (contentRef.current) {
                        contentRef.current.scrollTop = contentRef.current.scrollHeight;
                    }
                },
                onclose() {
                    setProgress(100);
                    setIsGenerating(false);
                    clearInterval(progressTimer);
                },
                onerror(err) {
                    console.error('SSE error:', err);
                    setIsGenerating(false);
                    clearInterval(progressTimer);
                }
            });
        })();

        return () => {
            if (progressTimer) clearInterval(progressTimer);
        };
    }, []);

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                        Business Idea Generator
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        AI-powered innovation at your fingertips
                    </p>
                </header>

                {/* Progress Bar */}
                {isGenerating && (
                    <div className="max-w-3xl mx-auto mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Generating your business idea...
                                </span>
                                <span className="text-sm text-gray-500">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Card */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl backdrop-blur-lg bg-opacity-95 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-bold">💼</span>
                                    </div>
                                    <h2 className="text-white font-semibold text-lg">Your AI-Generated Business Idea</h2>
                                </div>
                                {!isGenerating && (
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                                    >
                                        Generate New Idea
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div
                            ref={contentRef}
                            className="p-8 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100"
                        >
                            {idea === '…loading' ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                    <div className="text-gray-500 text-center">
                                        <p className="font-medium">AI is crafting your business idea...</p>
                                        <p className="text-sm mt-1">This may take a few moments</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="markdown-content text-gray-700 dark:text-gray-300 animate-fade-in">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkBreaks]}
                                    >
                                        {idea}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {!isGenerating && idea !== '…loading' && idea !== 'Authentication required' && (
                            <div className="bg-gray-50 dark:bg-gray-700 px-8 py-4 border-t border-gray-200 dark:border-gray-600">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(idea)}
                                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm font-medium">Copy to Clipboard</span>
                                        </button>
                                        <button
                                            onClick={() => window.print()}
                                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                            </svg>
                                            <span className="text-sm font-medium">Print</span>
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Generated with AI • {new Date().toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}