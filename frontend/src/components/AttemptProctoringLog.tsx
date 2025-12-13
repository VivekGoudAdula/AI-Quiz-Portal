import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiClient } from '../api';

export default function AttemptProctoringLog({ attemptId }: { attemptId: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!attemptId) return;
    apiClient.getProctoringEvents(attemptId)
      .then(res => setEvents(res.data.events || res.data))
      .catch(() => setError('Failed to load proctoring events'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return <div>Loading proctoring log...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!events.length) return <div>No proctoring events logged for this attempt.</div>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Proctoring Violation Timeline</h2>
      <ul className="space-y-2">
        {events.map((ev, idx) => (
          <li key={idx} className="bg-gray-100 dark:bg-gray-800 rounded p-3 flex flex-col md:flex-row md:items-center gap-2">
            <span className="font-mono text-xs text-gray-500">{new Date(ev.timestamp).toLocaleString()}</span>
            <span className="font-semibold text-blue-700 dark:text-blue-300">{ev.eventType}</span>
            <span className="text-gray-700 dark:text-gray-200">{ev.details}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
