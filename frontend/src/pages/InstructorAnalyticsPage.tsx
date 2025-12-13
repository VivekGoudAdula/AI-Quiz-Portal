
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiClient } from '../api';
import { BookOpen, Users, TrendingUp, Clock } from 'lucide-react';

export default function InstructorAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.getInstructorDashboardStats()
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Quizzes', value: stats.totalQuizzes, icon: BookOpen, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'from-purple-500 to-purple-600' },
    { label: 'Avg Performance', value: `${stats.avgPerformance}%`, icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { label: 'Active Quizzes', value: stats.activeQuizzes, icon: Clock, color: 'from-orange-500 to-orange-600' },
  ] : [];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">Analytics</h1>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center font-semibold">{error}</div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={`rounded-2xl shadow-xl bg-gradient-to-br ${stat.color} p-8 flex flex-col items-center justify-center text-white hover:scale-[1.03] transition-transform duration-200`}>
                  <Icon size={40} className="mb-4 opacity-90" />
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-lg font-semibold tracking-wide uppercase opacity-90">{stat.label}</div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
