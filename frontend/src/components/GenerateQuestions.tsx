import React, { useState } from 'react';
import { apiClient } from '../api';

interface Quiz {
  quizId: string;  // Changed from 'id' to 'quizId' to match backend
  title: string;
}

interface GenerateQuestionsProps {
  onQuestionsGenerated: (questions: any[]) => void;
  quizzes: Quiz[];
  onQuestionsAdded?: (count: number) => void;
}

export const GenerateQuestions: React.FC<GenerateQuestionsProps> = ({ 
  onQuestionsGenerated, 
  quizzes,
  onQuestionsAdded 
}) => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!selectedQuizId) {
      setError('Please select a quiz first');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.generateAIQuestions(
        topic,
        parseInt(numQuestions.toString()),
        difficulty
      );

      const questions = response.data.questions;
      console.log(`Generated ${questions.length} questions for quiz: ${selectedQuizId}`);
      onQuestionsGenerated(questions);

      // AUTO-ADD QUESTIONS TO SELECTED QUIZ
      let successCount = 0;
      let failedCount = 0;
      
      for (let idx = 0; idx < questions.length; idx++) {
        const q = questions[idx];
        try {
          console.log(`[${idx + 1}/${questions.length}] Creating question:`, q.text?.substring(0, 50));
          
          // Build options array
          const options = (q.options || []).map((opt: any) => ({
            text: typeof opt === 'string' ? opt : (opt.text || opt.option || ''),
            isCorrect: opt.is_correct === true || opt.isCorrect === true
          }));
          
          console.log(`[${idx + 1}/${questions.length}] Options:`, options);
          
          const payload = {
            text: q.text || q.question || '',
            type: 'mcq',
            difficulty: q.difficulty || difficulty,
            marks: 1,
            tags: [],
            explanation: '',
            options: options
          };
          
          console.log(`[${idx + 1}/${questions.length}] Payload:`, payload);
          
          const createQRes = await apiClient.createQuestion(payload);

          console.log(`[${idx + 1}/${questions.length}] ✓ Question created:`, createQRes.data?.question?.qId);
          const questionId = createQRes.data?.question?.qId;
          
          if (questionId) {
            console.log(`[${idx + 1}/${questions.length}] Adding to quiz ${selectedQuizId}...`);
            await apiClient.addQuestionToQuiz(selectedQuizId, questionId);
            console.log(`[${idx + 1}/${questions.length}] ✓ Added to quiz`);
            successCount++;
          } else {
            console.error(`[${idx + 1}/${questions.length}] ✗ No questionId in response`);
            failedCount++;
          }
        } catch (qErr: any) {
          console.error(`[${idx + 1}/${questions.length}] ✗ Error:`, qErr.response?.data || qErr.message);
          failedCount++;
          // Continue with next question even if one fails
        }
      }
      
      console.log(`Completed: ${successCount} added, ${failedCount} failed`);

      if (successCount > 0) {
        setSuccess(`✅ Generated and added ${successCount} questions to the quiz!`);
      } else if (failedCount > 0) {
        setError(`❌ Failed to add questions. Check console (F12) for details.`);
      }
      onQuestionsAdded?.(successCount);
      // Force reload quizzes after assignment to update UI
      if (window.location.pathname.includes('instructor')) {
        setTimeout(() => window.location.reload(), 1000);
      }
      
      // Reset form
      setTopic('');
      setNumQuestions(5);
      setDifficulty('medium');
      setSelectedQuizId('');

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('Error in generation process:', err);
      setError(err.response?.data?.error || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Generate & Add AI Questions</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 font-semibold">
          {success}
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label htmlFor="selectQuiz" className="block text-sm font-semibold text-gray-700 mb-2">
            Select Quiz to Add Questions To
          </label>
          <select
            id="selectQuiz"
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white dark:bg-gray-900 dark:text-white"
            title="Select a quiz to add generated questions to"
            required
          >
            <option value="">-- Select a Quiz --</option>
            {quizzes.map((quiz) => (
              <option key={quiz.quizId} value={quiz.quizId}>
                {quiz.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-semibold text-gray-700 mb-2">
            Topic
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Machine Learning, Database Design, Web Security"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-600 bg-white dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
            required
            title="Enter the topic for question generation"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="numQuestions" className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Questions
            </label>
            <input
              id="numQuestions"
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.min(50, Math.max(1, parseInt(e.target.value))))}
              min="1"
              max="50"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500 bg-white dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
              title="Select number of questions to generate"
            />
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-semibold text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white dark:bg-gray-900 dark:text-white"
              title="Select question difficulty level"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedQuizId}
          className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
            loading || !selectedQuizId
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:shadow-lg'
          }`}
          title={selectedQuizId ? 'Generate and add questions to selected quiz' : 'Select a quiz first'}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating & Adding...
            </>
          ) : (
            '🚀 Generate & Add Questions'
          )}
        </button>
      </form>
    </div>
  );
};
