
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiClient } from '../api';
import { BookOpen, Clock, Users, TrendingUp, Calendar } from 'lucide-react';

export default function InstructorQuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.getQuizzes('all')
      .then(res => setQuizzes(res.data.quizzes || []))
      .catch(() => setError('Failed to load quizzes'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12">
        <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">My Quizzes</h1>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center font-semibold">{error}</div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={48} className="mx-auto text-blue-400 mb-4" />
            <div className="text-2xl font-semibold text-gray-500 mb-2">No quizzes created yet</div>
            <div className="text-gray-400">Start by creating your first quiz!</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map(q => {
              const now = new Date();
              const start = new Date(q.startTime);
              const end = new Date(q.endTime);
              const isCompleted = end < now;
              const isUpcoming = start > now;
              const isActive = start <= now && end >= now && !isCompleted;
              return (
                <div key={q.quizId} className={`relative rounded-2xl shadow-xl overflow-hidden bg-gradient-to-br ${isActive ? 'from-green-100 to-blue-50' : isUpcoming ? 'from-blue-100 to-purple-50' : 'from-gray-100 to-gray-200'} border-2 ${isActive ? 'border-green-400' : isUpcoming ? 'border-blue-400' : 'border-gray-300'} hover:scale-[1.03] transition-transform duration-200`}> 
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow ${isActive ? 'bg-green-500 text-white' : isUpcoming ? 'bg-blue-500 text-white' : 'bg-gray-400 text-white'}`}>
                      {isActive ? 'ACTIVE' : isUpcoming ? 'UPCOMING' : 'ENDED'}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col gap-3">
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen size={28} className="text-blue-500" />
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-1">{q.title}</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">{q.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium"><Calendar size={14}/> {start.toLocaleDateString()}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-100 text-purple-700 font-medium"><Clock size={14}/> {Math.floor(q.durationSeconds/60)} min</span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 font-medium"><Users size={14}/> {q.maxAttempts} attempts</span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-medium"><TrendingUp size={14}/> Pass: {q.passingScore}%</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow hover:from-blue-600 hover:to-purple-600 transition"
                        onClick={() => window.location.href = `/instructor/analytics?quizId=${q.quizId}`}
                      >View Analytics</button>
                      <button
                        className="flex-1 py-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold shadow hover:from-green-600 hover:to-blue-600 transition"
                        onClick={() => window.location.href = `/instructor/quizzes?edit=${q.quizId}`}
                      >Edit</button>
                      <button
                        className="flex-1 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow hover:from-red-600 hover:to-pink-600 transition"
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this quiz?')) {
                            try {
                              await apiClient.deleteQuiz(q.quizId);
                              setQuizzes(quizzes => quizzes.filter(quiz => quiz.quizId !== q.quizId));
                            } catch (err) {
                              alert('Failed to delete quiz.');
                            }
                          }
                        }}
                      >Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
