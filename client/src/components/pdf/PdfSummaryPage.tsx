import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Link as LinkIcon, 
  FileText, 
  Loader, 
  CheckCircle, 
  AlertCircle,
  LogOut,
  Menu,
  X,
  FileUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../service/api';

interface UploadResponse {
  message: string;
  pdf: {
    id: string;
    user_id: string;
    filename: string;
    file_size: number;
    mime_type: string;
    storage_path: string;
    original_text: string;
    summary: string;
  };
}

interface Flashcard {
  id: string;
  userId: string;
  pdfId: string;
  question: string;
  answer: string;
}

const PdfSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [pdfId, setPdfId] = useState<string>('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [flashcardsError, setFlashcardsError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Study mode states
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a valid PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'file' && !selectedFile) {
      setError('Please select a PDF file');
      return;
    }

    if (activeTab === 'url' && !url) {
      setError('Please enter a PDF URL');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSummary(null);

      const formData = new FormData();
      
      if (activeTab === 'file' && selectedFile) {
        formData.append('pdf', selectedFile);
        setUploadedFileName(selectedFile.name);
      } else if (activeTab === 'url') {
        formData.append('pdfLink', url);
        setUploadedFileName(url.split('/').pop() || 'URL PDF');
      }

      const response = await api.post<UploadResponse>('/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true, // Important for cookies
      });

      console.log('Upload response:', response.data);
      setPdfId(response.data.pdf.id);
      setFlashcards([]);
      setFlashcardsError(null);
      setSummary(response.data.pdf.summary);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to process PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNewUpload = () => {
    setSelectedFile(null);
    setUrl('');
    setSummary(null);
    setPdfId('');
    setFlashcards([]);
    setFlashcardsError(null);
    setError(null);
    setUploadedFileName('');
    setStudyMode(false);
    setCurrentCardIndex(0);
    setUserAnswer('');
    setShowAnswer(false);
    setAnswerChecked(false);
    setIsCorrect(null);
    setCorrectCount(0);
    setAttemptCount(0);
  };

  const generateFlashcards = async () => {
    if (!pdfId) {
      setFlashcardsError('PDF id is missing. Upload a PDF first.');
      return;
    }

    try {
      setFlashcardsLoading(true);
      setFlashcardsError(null);
      setStudyMode(false); // Exit study mode when generating new cards

      const response = await api.post<{ flashcards: Flashcard[] }>('/flashcards/generate', { pdfId }, {
        withCredentials: true,
      });

      setFlashcards(response.data.flashcards || []);
    } catch (err: any) {
      console.error('Error generating flashcards:', err);
      setFlashcardsError(err.response?.data?.error || err.response?.data?.message || 'Failed to generate flashcards');
    } finally {
      setFlashcardsLoading(false);
    }
  };

  const loadUserFlashcards = async () => {
    try {
      setFlashcardsLoading(true);
      setFlashcardsError(null);

      const response = await api.get<{ flashcards: Flashcard[] }>('/flashcards', {
        withCredentials: true,
      });

      setFlashcards(response.data.flashcards || []);
    } catch (err: any) {
      console.error('Error fetching flashcards:', err);
      setFlashcardsError(err.response?.data?.error || err.response?.data?.message || 'Failed to load saved flashcards');
    } finally {
      setFlashcardsLoading(false);
    }
  };

  // Study mode functions
  const startStudyMode = () => {
    if (flashcards.length === 0) return;
    setStudyMode(true);
    setCurrentCardIndex(0);
    setUserAnswer('');
    setShowAnswer(false);
    setAnswerChecked(false);
    setIsCorrect(null);
    setCorrectCount(0);
    setAttemptCount(0);
  };

  const exitStudyMode = () => {
    setStudyMode(false);
    setCurrentCardIndex(0);
    setUserAnswer('');
    setShowAnswer(false);
    setAnswerChecked(false);
    setIsCorrect(null);
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;
    if (answerChecked) return; // only score once per evaluation

    const currentCard = flashcards[currentCardIndex];
    const correctAnswer = currentCard.answer.toLowerCase().trim();
    const userInput = userAnswer.toLowerCase().trim();

    // Simple string comparison - could be enhanced with fuzzy matching
    const correct = userInput === correctAnswer ||
                   correctAnswer.includes(userInput) ||
                   userInput.includes(correctAnswer);

    setIsCorrect(correct);
    setAnswerChecked(true);
    setShowAnswer(true);
    setAttemptCount((prev) => prev + 1);
    if (correct) setCorrectCount((prev) => prev + 1);
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setUserAnswer('');
      setShowAnswer(false);
      setAnswerChecked(false);
      setIsCorrect(null);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setUserAnswer('');
      setShowAnswer(false);
      setAnswerChecked(false);
      setIsCorrect(null);
    }
  };

  const revealAnswer = () => {
    setShowAnswer(true);
    setAnswerChecked(false);
    setIsCorrect(null);
  };

  // Format summary with preserved line breaks (bullet points)
  const renderSummary = (text: string) => {
    // Split by newlines and map each line, preserving bullet points
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // If line starts with a bullet character, treat it specially
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} className="flex items-start text-gray-300 mb-2">
            <span className="text-green-400 mr-2">•</span>
            <span>{line.trim().substring(1).trim()}</span>
          </div>
        );
      }
      if (line.trim() === '') return <div key={idx} className="mb-2"></div>;
      return <p key={idx} className="text-gray-300 mb-2">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Navigation Bar */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold text-white">PDF Summarizer</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user && (
                <span className="text-white/80">
                  Welcome, {user.name}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-white bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:bg-white/10 p-2 rounded-lg"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden py-4 border-t border-white/20"
              >
                <div className="flex flex-col space-y-3">
                  {user && (
                    <span className="text-white/80 px-2">
                      Welcome, {user.name}
                    </span>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-white bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!summary ? (
          // Upload Form
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                PDF Summary Generator
              </h1>
              <p className="text-xl text-gray-300">
                Upload a PDF file or provide a URL to get an AI-generated summary
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 rounded-lg p-1 flex">
                <button
                  onClick={() => setActiveTab('file')}
                  className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                    activeTab === 'file'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </button>
                <button
                  onClick={() => setActiveTab('url')}
                  className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                    activeTab === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  PDF URL
                </button>
              </div>
            </div>

            {/* Form */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'file' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl"
            >
              <form onSubmit={handleSubmit}>
                {activeTab === 'file' ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-300 mb-2">
                          {selectedFile ? selectedFile.name : 'Click to select a PDF file'}
                        </p>
                        <p className="text-sm text-gray-400">
                          Max file size: 10MB
                        </p>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={url}
                        onChange={handleUrlChange}
                        placeholder="Enter PDF URL (e.g., https://example.com/document.pdf)"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-center text-red-200"
                  >
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader className="h-5 w-5 mr-2 animate-spin" />
                      Processing PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5 mr-2" />
                      Generate Summary
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        ) : (
          // Summary Results
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Summary Generated
                </h2>
                <p className="text-gray-400">
                  File: {uploadedFileName}
                </p>
              </div>
              <button
                onClick={handleNewUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Upload
              </button>
            </div>

            {/* Summary Content */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">AI-Generated Summary</h3>
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {renderSummary(summary)}
              </div>
            </div>

            {/* Flashcard generation */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
              <div className="flex flex-wrap gap-3 items-center mb-4">
                <button
                  onClick={generateFlashcards}
                  disabled={flashcardsLoading || !pdfId}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {flashcardsLoading ? 'Generating flashcards...' : 'Generate Flashcards'}
                </button>
                <button
                  onClick={loadUserFlashcards}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Load My Flashcards
                </button>
                {pdfId && <span className="text-sm text-gray-400">pdfId: {pdfId}</span>}
              </div>

              {flashcardsError && (
                <div className="mb-3 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
                  {flashcardsError}
                </div>
              )}

              {!flashcardsLoading && flashcards.length === 0 && (
                <p className="text-gray-400">No flashcards generated yet. Click the button above.</p>
              )}

              {flashcards.length > 0 && !studyMode && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Generated Flashcards</h3>
                    <button
                      onClick={startStudyMode}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Start Study Mode
                    </button>
                  </div>
                  {flashcards.map((card, index) => (
                    <div key={card.id} className="rounded-lg border border-gray-700 p-4 bg-black/20">
                      <p className="text-gray-200 font-semibold">Q: {card.question}</p>
                      <p className="text-gray-300 mt-1">A: {card.answer}</p>
                    </div>
                  ))}
                </div>
              )}

              {flashcards.length > 0 && studyMode && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Study Mode - Card {currentCardIndex + 1} of {flashcards.length}
                      </h3>
                      <p className="text-sm text-gray-300 mt-1">
                        Score: {correctCount} / {attemptCount} correct
                      </p>
                    </div>
                    <button
                      onClick={exitStudyMode}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Exit Study Mode
                    </button>
                  </div>

                  <motion.div
                    key={currentCardIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-black/30 rounded-lg p-6 border border-gray-600"
                  >
                    <div className="mb-6">
                      <h4 className="text-xl font-semibold text-white mb-4">
                        Question:
                      </h4>
                      <p className="text-gray-200 text-lg leading-relaxed">
                        {flashcards[currentCardIndex].question}
                      </p>
                    </div>

                    {!showAnswer && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Your Answer:
                          </label>
                          <textarea
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Type your answer here..."
                            className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={checkAnswer}
                            disabled={!userAnswer.trim()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Check Answer
                          </button>
                          <button
                            onClick={revealAnswer}
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Show Answer
                          </button>
                        </div>
                      </div>
                    )}

                    {showAnswer && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">Your Answer:</h4>
                          <p className="text-gray-300 bg-white/5 p-3 rounded-lg">
                            {userAnswer || "No answer provided"}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">Correct Answer:</h4>
                          <p className="text-green-300 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                            {flashcards[currentCardIndex].answer}
                          </p>
                        </div>

                        {answerChecked && (
                          <div className={`p-4 rounded-lg border ${
                            isCorrect
                              ? 'bg-green-500/10 border-green-500/20 text-green-200'
                              : 'bg-red-500/10 border-red-500/20 text-red-200'
                          }`}>
                            <div className="flex items-center">
                              {isCorrect ? (
                                <>
                                  <CheckCircle className="h-5 w-5 mr-2" />
                                  <span className="font-semibold">Correct!</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-5 w-5 mr-2" />
                                  <span className="font-semibold">Incorrect</span>
                                </>
                              )}
                            </div>
                            <p className="mt-2 text-sm">
                              {isCorrect
                                ? "Great job! You got it right."
                                : "Keep practicing! Review the correct answer above."
                              }
                            </p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setUserAnswer('');
                              setShowAnswer(false);
                              setAnswerChecked(false);
                              setIsCorrect(null);
                            }}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Try Again
                          </button>
                          <button
                            onClick={revealAnswer}
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Show Answer Again
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={prevCard}
                      disabled={currentCardIndex === 0}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous Card
                    </button>
                    <span className="text-gray-400">
                      {currentCardIndex + 1} / {flashcards.length}
                    </span>
                    <button
                      onClick={nextCard}
                      disabled={currentCardIndex === flashcards.length - 1}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next Card
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PdfSummaryPage;