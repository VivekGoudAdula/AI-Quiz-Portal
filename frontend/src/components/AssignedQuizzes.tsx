import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api';

interface Quiz {
  quizId: string; // backend field
  id?: string; // fallback
  title: string;
  description?: string;
  durationSeconds: number;
  createdBy: string;
  startTime: string | number;
  endTime: string | number;
  maxAttempts: number;
  instructor?: {
    id: string;
    name: string;
    email: string;
  };
  attempted?: boolean;
  score?: number;
}

export const AssignedQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzes(filter);
  }, [quizzes, filter]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      console.log('Fetching assigned quizzes...');
      
      // Check if token exists
      const authStorage = localStorage.getItem('auth-storage');
      console.log('Auth storage:', authStorage ? 'exists' : 'missing');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          console.log('Token:', parsed.state?.token ? 'exists' : 'missing');
        } catch (e) {
          console.error('Failed to parse auth storage:', e);
        }
      }
      
      const response = await apiClient.getAssignedQuizzes();
      console.log('Quizzes response:', response.data);
      setQuizzes(response.data.quizzes || []);
    } catch (err: any) {
      console.error('Failed to fetch quizzes:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to fetch quizzes';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filterQuizzes = (filterType: string) => {
    const now = new Date();
    let filtered = quizzes;

    if (filterType === 'active') {
      filtered = quizzes.filter(q => {
        const start = new Date(q.startTime);
        const end = new Date(q.endTime);
        return start <= now && end > now;
      });
    } else if (filterType === 'upcoming') {
      filtered = quizzes.filter(q => new Date(q.startTime) > now);
    } else if (filterType === 'completed') {
      filtered = quizzes.filter(q => new Date(q.endTime) <= now);
    } else if (filterType === 'attempted') {
      filtered = quizzes.filter(q => q.attempted);
    }

    setFilteredQuizzes(filtered);
  };

  const handleStartQuiz = (quizId: string) => {
    navigate(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading quizzes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'all', label: 'All Quizzes', icon: '📚' },
          { key: 'active', label: 'Active', icon: '🔴' },
          { key: 'upcoming', label: 'Upcoming', icon: '⏰' },
          { key: 'attempted', label: 'Attempted', icon: '✓' },
          { key: 'completed', label: 'Completed', icon: '✔️' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-3 font-medium transition-all ${
              filter === tab.key
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No {filter !== 'all' ? filter : ''} quizzes available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map(quiz => {
            const qid = (quiz as any).quizId || (quiz as any).id;

            // Fix: After due date, quiz is not active
            const now = new Date();
            const start = new Date(quiz.startTime);
            const end = new Date(quiz.endTime);
            const isCompleted = end < now;
            const isUpcoming = start > now;
            const isActive = start <= now && end >= now && !isCompleted;

            return (
              <div
                key={qid}
                className={`rounded-lg border-2 overflow-hidden transition-all hover:shadow-lg ${
                  isActive
                    ? 'border-green-500 bg-gradient-to-br from-green-50 to-white'
                    : isUpcoming
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white'
                    : 'border-gray-300 bg-gradient-to-br from-gray-50 to-white'
                }`}
              >
                <div className="p-6 space-y-4">
                  {/* Status Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{quiz.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        By {quiz.instructor?.name || 'Unknown Instructor'}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                        isActive
                          ? 'bg-green-100 text-green-800'
                          : isUpcoming
                          ? 'bg-blue-100 text-blue-800'
                          : isCompleted
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Completed'}
                    </span>
                  </div>

                  {/* Description */}
                  {quiz.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{quiz.description}</p>
                  )}

                  {/* Quiz Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm py-3 border-y border-gray-200">
                    <div>
                      <p className="text-gray-500 text-xs">Duration</p>
                      <p className="font-semibold text-gray-800">{quiz.durationSeconds / 60} min</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Max Attempts</p>
                      <p className="font-semibold text-gray-800">{quiz.maxAttempts}</p>
                    </div>
                  </div>

                  {/* Score (if attempted) */}
                  {quiz.attempted && quiz.score !== null && quiz.score !== undefined && (
                    <div className="bg-blue-50 px-3 py-2 rounded-lg">
                      <p className="text-xs text-gray-600">Your Score</p>
                      <p className="text-2xl font-bold text-blue-600">{(quiz.score as number).toFixed(1)}%</p>
                    </div>
                  )}

                  {/* Due Date */}
                  <div className="text-xs text-gray-500">
                    <p>Available: {new Date(quiz.startTime).toLocaleDateString()}</p>
                    <p>Ends: {new Date(quiz.endTime).toLocaleDateString()}</p>
                  </div>

                  {/* Action Button */}
                  {quiz.attempted ? (
                    <button
                      onClick={() => quiz.attemptId && navigate(`/quiz/${qid}/results/${quiz.attemptId}`)}
                      className="w-full py-2 rounded-lg font-semibold bg-blue-600 text-white hover:shadow-lg transition-all"
                      disabled={!quiz.attemptId}
                    >
                      View Results
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartQuiz(qid)}
                      disabled={isUpcoming || isCompleted}
                      className={`w-full py-2 rounded-lg font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-lg'
                          : isUpcoming
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isUpcoming ? 'Coming Soon' : isActive ? 'Take Quiz Now' : 'Quiz Ended'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
