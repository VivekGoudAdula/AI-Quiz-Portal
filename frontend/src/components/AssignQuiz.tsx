import React, { useState, useEffect } from 'react';
import { apiClient } from '../api';

interface AssignQuizProps {
  quizId: string;
  quizTitle: string;
  onAssignmentComplete: () => void;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

export const AssignQuiz: React.FC<AssignQuizProps> = ({ quizId, quizTitle, onAssignmentComplete }) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    // Fetch real students from backend
    const fetchStudents = async () => {
      try {
        const res = await apiClient.listUsers('student');
        setStudents(res.data.users || []);
      } catch (err: any) {
        setError('Failed to load students');
      }
    };
    fetchStudents();
  }, []);

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (selectedStudents.length === 0) {
      setError('Please select at least one student');
      setLoading(false);
      return;
    }

    if (!dueDate) {
      setError('Please set a due date');
      setLoading(false);
      return;
    }

    try {
      await apiClient.assignQuizToStudents(quizId, selectedStudents, dueDate);
      setSuccess(`Quiz assigned to ${selectedStudents.length} student(s)`);
      setSelectedStudents([]);
      setDueDate('');
      onAssignmentComplete();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Assign Quiz to Students</h3>
      <p className="text-sm text-gray-600 mb-4">Quiz: <span className="font-semibold">{quizTitle}</span></p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          ✓ {success}
        </div>
      )}

      <form onSubmit={handleAssign} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Students ({selectedStudents.length} selected)
          </label>
          <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
            {students.map(student => (
              <label key={student.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => handleStudentToggle(student.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  title={`Select ${student.name}`}
                />
                <div className="ml-3 flex-1">
                  <p className="font-medium text-gray-700">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.email}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700 mb-2">
            Due Date
          </label>
          <input
            id="dueDate"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white dark:bg-gray-900 dark:text-white"
            title="Set the due date for this assignment"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Assigning...' : `Assign to ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}
        </button>
      </form>
    </div>
  );
};
