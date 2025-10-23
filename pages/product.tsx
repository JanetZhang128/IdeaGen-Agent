"use client"

import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { useAuth } from '@clerk/nextjs';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Product() {
    const { getToken } = useAuth();
    const [idea, setIdea] = useState<string>('…loading');
    const [isGenerating, setIsGenerating] = useState<boolean>(true);
    const [progress, setProgress] = useState<number>(0);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const printableContentRef = useRef<HTMLDivElement>(null);

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

    const downloadAsPDF = async () => {
        if (!printableContentRef.current || idea === '…loading' || idea === 'Authentication required') {
            return;
        }

        setIsGeneratingPDF(true);

        try {
            // Create a temporary container for PDF generation
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            tempContainer.style.width = '210mm'; // A4 width
            tempContainer.style.padding = '20mm';
            tempContainer.style.backgroundColor = 'white';
            tempContainer.style.fontFamily = 'Arial, sans-serif';
            tempContainer.style.fontSize = '12px';
            tempContainer.style.lineHeight = '1.6';
            tempContainer.style.color = '#333';

            // Create PDF content with proper styling
            tempContainer.innerHTML = `
                <div style="margin-bottom: 30px; text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px;">
                    <h1 style="color: #1e40af; font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">AI-Generated Business Idea</h1>
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">Generated on ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="pdf-content" style="line-height: 1.7;">
                    ${printableContentRef.current.innerHTML}
                </div>
            `;

            // Apply PDF-specific styles
            const style = document.createElement('style');
            style.textContent = `
                .pdf-content h1 {
                    color: #1e40af !important;
                    font-size: 24px !important;
                    font-weight: bold !important;
                    margin: 20px 0 10px 0 !important;
                    border-bottom: 2px solid #e0e7ff !important;
                    padding-bottom: 8px !important;
                }
                .pdf-content h2 {
                    color: #1d4ed8 !important;
                    font-size: 20px !important;
                    font-weight: 600 !important;
                    margin: 18px 0 8px 0 !important;
                }
                .pdf-content h3 {
                    color: #2563eb !important;
                    font-size: 16px !important;
                    font-weight: 600 !important;
                    margin: 14px 0 6px 0 !important;
                }
                .pdf-content h4, .pdf-content h5, .pdf-content h6 {
                    color: #3b82f6 !important;
                    font-weight: 600 !important;
                    margin: 12px 0 4px 0 !important;
                }
                .pdf-content p {
                    margin: 8px 0 !important;
                    text-align: justify !important;
                }
                .pdf-content ul, .pdf-content ol {
                    margin: 10px 0 !important;
                    padding-left: 20px !important;
                }
                .pdf-content li {
                    margin: 4px 0 !important;
                }
                .pdf-content strong {
                    font-weight: bold !important;
                    color: #1f2937 !important;
                }
                .pdf-content em {
                    font-style: italic !important;
                    color: #6b7280 !important;
                }
            `;
            tempContainer.appendChild(style);
            document.body.appendChild(tempContainer);

            // Generate canvas from the temp container
            const canvas = await html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: tempContainer.scrollWidth,
                height: tempContainer.scrollHeight,
            });

            // Remove temp container
            document.body.removeChild(tempContainer);

            // Create PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add additional pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Add metadata
            pdf.setProperties({
                title: 'AI-Generated Business Idea',
                subject: 'Business Idea Generated by AI',
                author: 'AI Business Idea Generator',
                creator: 'AI Business Idea Generator',
            });

            // Download the PDF
            const fileName = `business-idea-${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

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
                                <div
                                    ref={printableContentRef}
                                    className="markdown-content text-gray-700 dark:text-gray-300 animate-fade-in"
                                >
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
                                            onClick={downloadAsPDF}
                                            disabled={isGeneratingPDF}
                                            className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isGeneratingPDF ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                                    <span className="text-sm font-medium">Generating PDF...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">Download PDF</span>
                                                </>
                                            )}
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