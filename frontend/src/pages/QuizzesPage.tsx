
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiClient } from '../api';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.getQuizzes()
      .then(res => {
        setQuizzes(res.data.quizzes || []);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load quizzes');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-12">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">All Quizzes</h1>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-300">
            No quizzes found.
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Title</th>
                  <th className="py-2">Description</th>
                  <th className="py-2">Start</th>
                  <th className="py-2">End</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map(q => (
                  <tr key={q.quizId || q.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-2 font-semibold">{q.title}</td>
                    <td className="py-2">{q.description || '-'}</td>
                    <td className="py-2">{q.startTime ? new Date(q.startTime).toLocaleString() : '-'}</td>
                    <td className="py-2">{q.endTime ? new Date(q.endTime).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
