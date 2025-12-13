// Modal to show auto-submit summary
function AutoSubmitSummaryModal({ open, percentage, reason, onClose }: { open: boolean, percentage: number, reason: string, onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full p-6 relative">
        <h2 className="text-xl font-bold mb-2 text-center text-red-600 dark:text-red-400">Exam Auto-Submitted</h2>
        <div className="mb-4 text-gray-800 dark:text-gray-100 text-center">
          Your exam was auto-submitted.<br />
          <b>{percentage}%</b> of questions were answered.<br />
          <span className="block mt-2">Reason: <b>{reason}</b></span>
        </div>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={onClose}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
import { useEffect, useState, useRef } from 'react';
// @ts-ignore
import useProctoring from '../hooks/useProctoring';
import { useParams, useNavigate } from 'react-router-dom';

import { apiClient } from '../api';
import Layout from '../components/Layout';
import { Flag } from 'lucide-react';

interface Question {
  id: string
  text: string
  type: 'mcq' | 'tf' | 'short_answer'
  options?: Array<{ id: string; text: string }>
  marks: number
  difficulty: string
}

interface Answer {
  questionId: string
  answer: string | string[]
  timeSpent: number
}


// WarningModal for displaying warnings
function WarningModal({ open, message, onClose, remaining }: { open: boolean, message: string, onClose: () => void, remaining: number }) {
  if (!open) return null;
  // Detect if the warning is about fullscreen exit
  const isFullscreenWarning = message.toLowerCase().includes('fullscreen');

  const handleBackToFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full p-6 relative">
        <h2 className="text-xl font-bold mb-2 text-center text-red-600 dark:text-red-400">Warning</h2>
        <div className="mb-4 text-gray-800 dark:text-gray-100 text-center">{message}</div>
        <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-300">
          Remaining warnings before auto-submit: <span className="font-bold">{remaining}</span>
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={onClose}
          >
            Close
          </button>
          {isFullscreenWarning && (
            <button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleBackToFullscreen}
            >
              Back to Fullscreen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Proctoring Consent Modal
function ProctoringConsentModal({ open, onConsent, requireWebcam, onWebcamReady }: { open: boolean, onConsent: () => void, requireWebcam: boolean, onWebcamReady?: (stream: MediaStream|null) => void }) {
  const [consentChecked, setConsentChecked] = useState(false);
  const [fullscreenGranted, setFullscreenGranted] = useState(false);
  const [webcamGranted, setWebcamGranted] = useState(!requireWebcam);
  const [webcamError, setWebcamError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Request fullscreen
  const handleFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setFullscreenGranted(true);
    } catch {
      setFullscreenGranted(false);
    }
  };

  // Request webcam
  const handleWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setWebcamGranted(true);
      setWebcamError('');
      if (videoRef.current) videoRef.current.srcObject = stream;
      if (onWebcamReady) onWebcamReady(stream);
    } catch (err) {
      setWebcamGranted(false);
      setWebcamError('Webcam access denied or unavailable.');
      if (onWebcamReady) onWebcamReady(null);
    }
  };

  // Cleanup webcam stream and video srcObject on modal close/unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  useEffect(() => {
    if (requireWebcam && open) handleWebcam();
    // eslint-disable-next-line
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-8 relative">
        <h2 className="text-2xl font-bold mb-4 text-center">Proctoring Consent Required</h2>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-200 text-sm">
          <li>Exam will run in strict proctoring mode.</li>
          <li>Tab switching, minimizing, or leaving fullscreen is not allowed.</li>
          <li>Webcam monitoring {requireWebcam ? <b>enabled</b> : <b>disabled</b>}.</li>
          <li>All violations will be logged and may result in auto-submission.</li>
        </ul>
        <div className="mb-4 flex items-center">
          <input type="checkbox" id="consent" checked={consentChecked} onChange={e => setConsentChecked(e.target.checked)} className="mr-2" />
          <label htmlFor="consent" className="text-gray-800 dark:text-gray-100">I have read and agree to the proctoring rules.</label>
        </div>
        <div className="mb-4">
          <button onClick={handleFullscreen} className={`px-4 py-2 rounded bg-blue-600 text-white font-bold mr-2 ${fullscreenGranted ? 'opacity-50' : ''}`}>Enable Fullscreen</button>
          {requireWebcam && (
            <button onClick={handleWebcam} className={`px-4 py-2 rounded bg-purple-600 text-white font-bold ${webcamGranted ? 'opacity-50' : ''}`}>Enable Webcam</button>
          )}
        </div>
        {requireWebcam && webcamGranted && (
          <div className="mb-2">
            <video ref={videoRef} autoPlay muted width={120} height={90} className="rounded border" />
          </div>
        )}
        {webcamError && <div className="text-red-600 text-sm mb-2">{webcamError}</div>}
        <button
          className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          disabled={!consentChecked || !fullscreenGranted || (requireWebcam && !webcamGranted)}
          onClick={onConsent}
        >
          Start Exam
        </button>
      </div>
    </div>
  );
}


export default function QuizPlayerPage() {
  // All hooks at the top level, before any return

  // State
  const [autoSubmitSummary, setAutoSubmitSummary] = useState<{ open: boolean, percentage: number, reason: string } | null>(null);
  const [proctoringConsentOpen, setProctoringConsentOpen] = useState(true);
  const [proctoringActive, setProctoringActive] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [violationEvents, setViolationEvents] = useState<any[]>([]);
  const MAX_WARNINGS = 3;
  const requireWebcam = true;

  const MAX_FACE_MISSING = 3;
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [warningModal, setWarningModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examLocked, setExamLocked] = useState(false);
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [attemptId, setAttemptId] = useState<string>('');
  const [showQuestionNav, setShowQuestionNav] = useState(false);

  // Helper: handle warning (fix: was missing)
  const handleWarning = (type: string, message: string, logMessage?: string) => {
    setWarningCount((prev) => prev + 1);
    setViolationEvents((prev) => [...prev, { type, time: Date.now() }]);
    setWarningModal({ open: true, message });
    if (logMessage) console.warn(logMessage);
  };

  // Helper: handle auto-submit continue (fix: was missing)
  const handleAutoSubmitContinue = () => {
    setAutoSubmitSummary(null);
    handleSubmitQuiz();
  };

  // All useEffect and hooks above this line

  // Proctoring logic using custom hook
  useProctoring({
    enabled: proctoringActive,
    maxWarnings: MAX_WARNINGS,
    onViolation: async ({ type, count }: { type: string; count: number }) => {
      setWarningCount(count || warningCount + 1);
      setViolationEvents((prev) => [...prev, { type, time: Date.now() }]);
      // Log to backend (only if attemptId exists)
      if (attemptId) {
        let severity = 'warning';
        if (type === 'AUTO_SUBMIT' || type === 'CRITICAL') severity = 'critical';
        try {
          await apiClient.logProctoringEvent(attemptId, type, {}, severity);
        } catch (err) {
          console.error('Failed to log proctoring event:', err);
        }
      }
      if (type === 'AUTO_SUBMIT') {
        const total = questions.length;
        const answered = Array.from(answers.values()).filter(a => a.answer && a.answer !== '').length;
        const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;
        let reason = 'Repeated violations';
        if (violationEvents.some(v => v.type === 'FACE_MISSING')) reason = 'Face not detected in webcam';
        setAutoSubmitSummary({ open: true, percentage, reason });
        return;
      }
      setWarningModal({ open: true, message: `Warning ${count || warningCount + 1}/${MAX_WARNINGS}: ${type}` });
    }
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!proctoringActive || !webcamStream) return;
    if (webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = webcamStream;
    }
    return () => {
      if (webcamVideoRef.current && webcamVideoRef.current.srcObject) {
        const tracks = (webcamVideoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        webcamVideoRef.current.srcObject = null;
      }
    };
  }, [proctoringActive, webcamStream]);

  useEffect(() => {
    if (!proctoringActive || !webcamStream) return;
    let interval: NodeJS.Timeout;
    let faceMissing = 0;
    const detectFace = async () => {
      if (!webcamVideoRef.current) return;
      const video = webcamVideoRef.current;
      if (!video.videoWidth || !video.videoHeight) return;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const nonBlack = frame.some(v => v > 10);
      if (!nonBlack) {
        faceMissing++;
        // setFaceMissingCount is not defined, so remove or define if needed. If not used, remove this line.
        // setFaceMissingCount(c => c + 1);
        handleWarning('FACE_MISSING', 'Face not detected in webcam. Please stay visible.', 'Face missing in webcam snapshot');
        if (faceMissing >= MAX_FACE_MISSING) {
          setTimeout(() => handleSubmitQuiz(), 1500);
        }
      } else {
        faceMissing = 0;
      }
    };
    interval = setInterval(detectFace, 20000);
    return () => clearInterval(interval);
  }, [proctoringActive, webcamStream]);

  // ...existing code...


  // Ensure currentQuestionIndex is always valid when questions change
  useEffect(() => {
    if (questions.length > 0 && (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length)) {
      setCurrentQuestionIndex(0);
    }
  }, [questions]);

  // Autosave: Load from localStorage on mount
  useEffect(() => {
    const key = `exam_autosave_${quizId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.answers) {
          setAnswers(new Map(data.answers));
        }
        if (data.flaggedQuestions) {
          setFlaggedQuestions(new Set(data.flaggedQuestions));
        }
        if (data.currentQuestionIndex !== undefined) {
          setCurrentQuestionIndex(data.currentQuestionIndex);
        }
        if (data.timeRemaining !== undefined) {
          setTimeRemaining(data.timeRemaining);
        }
      } catch {}
    }
  }, [quizId]);

  // Autosave: Save to localStorage every 10s
  useEffect(() => {
    if (!proctoringActive || examLocked) return;
    const key = `exam_autosave_${quizId}`;
    const interval = setInterval(() => {
      const data = {
        answers: Array.from(answers.entries()),
        flaggedQuestions: Array.from(flaggedQuestions),
        currentQuestionIndex,
        timeRemaining,
      };
      localStorage.setItem(key, JSON.stringify(data));
    }, 10000);
    return () => clearInterval(interval);
  }, [answers, flaggedQuestions, currentQuestionIndex, timeRemaining, proctoringActive, examLocked, quizId]);

  // Clear autosave cache on submit/auto-submit
  useEffect(() => {
    if (examLocked) {
      const key = `exam_autosave_${quizId}`;
      localStorage.removeItem(key);
    }
  }, [examLocked, quizId]);

  // ...existing code...

  // Load quiz and start attempt (but block exam start until consent)
  useEffect(() => {
    loadQuizAndStartAttempt();
  }, [quizId]);

  // Proctoring: Start exam only after consent
  const handleProctoringConsent = () => {
    console.log('Consent given, closing modal and starting exam.');
    setProctoringConsentOpen(false);
    setProctoringActive(true);
    // setIsFullScreen(!!document.fullscreenElement); // Removed undefined function
    // Optionally: Save consent status to DB here
    // Start timer only after consent
    setTimeRemaining(quiz?.durationSeconds || 0);
    setQuestionStartTime(Date.now());
  };

  // Timer countdown (only if proctoring active)
  useEffect(() => {
    if (!proctoringActive || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining, proctoringActive]);

  const loadQuizAndStartAttempt = async () => {
    try {
      setLoading(true)

      // Get quiz details (includes questions)
      const quizResponse = await apiClient.getQuizDetail(quizId!)
      console.log('Quiz API response:', quizResponse);
      const quizData = quizResponse.data.quiz || quizResponse.data
      // Map qId to id for frontend compatibility
      let questions = (quizData.questions || []).map((q: any) => ({
        ...q,
        id: q.id || q.qId, // prefer id, fallback to qId
      }));
      console.log('Loaded quizData.questions:', questions);
      setQuiz(quizData)
      setQuestions(questions)
      setCurrentQuestionIndex(0)

      // Start attempt
      const attemptResponse = await apiClient.startQuizAttempt(quizId!)
      setAttemptId(attemptResponse.data.attemptId)

      // Set timer (convert seconds to milliseconds)
      setTimeRemaining(quizData.durationSeconds)
      setQuestionStartTime(Date.now())
    } catch (err) {
      console.error('Failed to load quiz:', err)
      alert('Failed to load quiz. Please try again.')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  let currentAnswer = { answer: '', timeSpent: 0 };
  if (currentQuestion && currentQuestion.id) {
    const found = answers.get(currentQuestion.id);
    if (found) currentAnswer = { answer: Array.isArray(found.answer) ? found.answer[0] : found.answer, timeSpent: found.timeSpent };
  }
  // Log current answer only when question or answer changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.id) {
      console.log('Current answer for question', currentQuestion.id, ':', answers.get(currentQuestion.id) || { answer: '', timeSpent: 0 });
    }
    // eslint-disable-next-line
  }, [currentQuestionIndex, answers]);

  // Update answer for current question
  const handleAnswerChange = (value: string | string[]) => {
    if (!currentQuestion || !currentQuestion.id) {
      console.warn('handleAnswerChange called with no valid currentQuestion');
      return;
    }

    // For MCQ/TF, always store answer as string
    let answerValue: string | string[] = value;
    if ((currentQuestion.type === 'mcq' || currentQuestion.type === 'tf') && Array.isArray(value)) {
      answerValue = value[0] || '';
    }

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    setAnswers(prev => {
      const updated = new Map(prev);
      updated.set(currentQuestion.id, { questionId: currentQuestion.id, answer: answerValue, timeSpent });
      // Autosave with the latest value
      autoSaveAnswer(currentQuestion.id, answerValue, timeSpent);
      // Also update localStorage immediately for this answer
      const key = `exam_autosave_${quizId}`;
      const data = {
        answers: Array.from(updated.entries()),
        flaggedQuestions: Array.from(flaggedQuestions),
        currentQuestionIndex,
        timeRemaining,
      };
      localStorage.setItem(key, JSON.stringify(data));
      return updated;
    });
  }

  const autoSaveAnswer = async (questionId: string, answer: string | string[], timeSpent?: number) => {
    try {
      const payload = {
        questionId,
        answer: Array.isArray(answer) ? answer.join(',') : answer,
        timeSpent: timeSpent || 0,
        markedForReview: flaggedQuestions.has(questionId),
      };
      console.log('AutoSave Payload:', payload);
      await apiClient.saveQuizAnswer(attemptId, payload);
    } catch (err) {
      console.error('Autosave failed:', err)
    }
  }

  const toggleFlagQuestion = () => {
    if (!currentQuestion) return
    const newFlagged = new Set(flaggedQuestions)
    if (newFlagged.has(currentQuestion.id)) {
      newFlagged.delete(currentQuestion.id)
    } else {
      newFlagged.add(currentQuestion.id)
    }
    setFlaggedQuestions(newFlagged)
    // Update localStorage for flagged questions
    const key = `exam_autosave_${quizId}`;
    const data = {
      answers: Array.from(answers.entries()),
      flaggedQuestions: Array.from(newFlagged),
      currentQuestionIndex,
      timeRemaining,
    };
    localStorage.setItem(key, JSON.stringify(data));
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
      setQuestionStartTime(Date.now());
      setShowQuestionNav(false);
      // Update localStorage for question index
      const key = `exam_autosave_${quizId}`;
      const data = {
        answers: Array.from(answers.entries()),
        flaggedQuestions: Array.from(flaggedQuestions),
        currentQuestionIndex: index,
        timeRemaining,
      };
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const handleSubmitQuiz = async () => {
    if (examLocked) return;
    setExamLocked(true);
    try {
      setSubmitting(true);
      // Stop timer
      setTimeRemaining(0);
      // Stop webcam
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        setWebcamStream(null);
      }
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = null;
      }
      // Exit fullscreen
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }
      // Save all answers one more time
      const answersArray = Array.from(answers.values());
      for (const ans of answersArray) {
        if (!ans.questionId || ans.answer === undefined || ans.answer === null || ans.answer === '') {
          console.warn('Skipping empty answer:', ans);
          continue;
        }
        const payload = {
          questionId: ans.questionId,
          answer: ans.answer,
          timeSpent: ans.timeSpent || 0,
          markedForReview: flaggedQuestions.has(ans.questionId),
        };
        // Ensure answer is a string for the API
        await apiClient.saveQuizAnswer(attemptId, { ...payload, answer: Array.isArray(payload.answer) ? payload.answer[0] : payload.answer });
      }
      // Submit quiz
      const response = await apiClient.submitQuizAttempt(attemptId);
      // Navigate to results
      navigate(`/quiz/${quizId}/results/${attemptId}`, {
        state: { results: response.data },
      });
    } catch (err) {
      setExamLocked(false);
      setSubmitting(false);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  const getAnswerStatus = (questionId: string) => {
    if (flaggedQuestions.has(questionId)) return 'flagged'
    if (answers.has(questionId)) return 'answered'
    return 'unanswered'
  }

  const getAnswerColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-green-500 text-white'
      case 'flagged':
        return 'bg-orange-500 text-white'
      default:
        return 'bg-gray-300 dark:bg-gray-600'
    }
  }


  // Log when proctoring consent modal is open (only on open)
  useEffect(() => {
    if (proctoringConsentOpen) {
      console.log('Proctoring consent modal is open.');
    }
  }, [proctoringConsentOpen]);

  if (loading) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  // Show proctoring consent modal before exam starts
  // Render order: consent modal > loading > error > questions UI
  if (proctoringConsentOpen) {
    return (
      <>
        <ProctoringConsentModal
          open={proctoringConsentOpen}
          onConsent={handleProctoringConsent}
          requireWebcam={requireWebcam}
          onWebcamReady={setWebcamStream}
        />
        <Layout><></></Layout>
      </>
    );
  }

  // (Removed duplicate loading UI)

  if (!quiz || questions.length === 0) {
    // No quiz or questions found
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-xl">No quiz found</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Debug: reached main questions UI (removed excessive logging)

  // Show auto-submit summary modal if needed
  if (autoSubmitSummary && autoSubmitSummary.open) {
    return (
      <AutoSubmitSummaryModal
        open={autoSubmitSummary.open}
        percentage={autoSubmitSummary.percentage}
        reason={autoSubmitSummary.reason}
        onClose={handleAutoSubmitContinue}
      />
    );
  }

  // Main quiz UI
  return (
    <>
      <WarningModal
        open={warningModal.open}
        message={warningModal.message}
        onClose={() => setWarningModal({ open: false, message: '' })}
        remaining={Math.max(0, MAX_WARNINGS - warningCount)}
      />
      {/* Webcam preview in corner */}
      {proctoringActive && webcamStream && (
        <div style={{ position: 'fixed', insetBlockEnd: 24, insetInlineEnd: 24, zIndex: 40, background: '#222', borderRadius: 8, padding: 4 }}>
          <video ref={webcamVideoRef} autoPlay muted width={120} height={90} style={{ borderRadius: 6 }} />
          <div style={{ color: '#fff', fontSize: 12, textAlign: 'center' }}>Webcam Active</div>
        </div>
      )}
      {!isOnline && (
        <div className="fixed top-0 left-0 w-full bg-yellow-500 text-white text-center py-2 z-50 font-bold">Offline mode: Your answers are saved locally and will sync when online.</div>
      )}
      <div className="h-screen bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>
          <div className="mb-4">
            <span className="font-semibold">Time Remaining: </span>
            {formatTime(timeRemaining)}
          </div>
          <div className="w-full max-w-2xl bg-gray-100 dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</span>
              <button
                className="text-blue-600 hover:underline text-sm"
                onClick={() => setShowQuestionNav((v) => !v)}
              >
                {showQuestionNav ? 'Hide' : 'Show'} All Questions
              </button>
            </div>
            {/* Question navigation grid */}
            {showQuestionNav && (
              <div className="mb-4 grid grid-cols-8 gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    className={`rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 ${
                      idx === currentQuestionIndex
                        ? 'border-blue-600 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                        : getAnswerColor(getAnswerStatus(q.id)) + ' border-gray-400 dark:border-gray-700'
                    }`}
                    onClick={() => goToQuestion(idx)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
            <div className="mb-4">
              <p className="text-lg font-medium mb-2">{currentQuestion?.text}</p>
              {/* Render options for MCQ/TF, input for short_answer, etc. */}
              {currentQuestion?.type === 'mcq' && (
                <div className="space-y-2">
                  {currentQuestion.options?.map((opt) => (
                    <label key={opt.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`mcq_${currentQuestion.id}`}
                        value={opt.id}
                        checked={currentAnswer.answer === opt.id}
                        onChange={() => handleAnswerChange(opt.id)}
                        className="form-radio text-blue-600"
                        disabled={examLocked}
                      />
                      <span>{opt.text}</span>
                    </label>
                  ))}
                </div>
              )}
              {currentQuestion?.type === 'tf' && (
                <div className="space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`tf_${currentQuestion.id}`}
                      value="true"
                      checked={currentAnswer.answer === 'true'}
                      onChange={() => handleAnswerChange('true')}
                      className="form-radio text-blue-600"
                      disabled={examLocked}
                    />
                    <span>True</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`tf_${currentQuestion.id}`}
                      value="false"
                      checked={currentAnswer.answer === 'false'}
                      onChange={() => handleAnswerChange('false')}
                      className="form-radio text-blue-600"
                      disabled={examLocked}
                    />
                    <span>False</span>
                  </label>
                </div>
              )}
              {currentQuestion?.type === 'short_answer' && (
                <textarea
                  className="w-full border rounded p-2 mt-2 min-h-[60px]"
                  value={typeof currentAnswer.answer === 'string' ? currentAnswer.answer : ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  disabled={examLocked}
                  placeholder="Type your answer here..."
                />
              )}
            </div>
            <div className="flex items-center justify-between mb-2">
              <button
                className={`flex items-center px-3 py-1 rounded ${flaggedQuestions.has(currentQuestion.id) ? 'bg-orange-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100'}`}
                onClick={toggleFlagQuestion}
                disabled={examLocked}
              >
                <Flag className="w-4 h-4 mr-1" />
                {flaggedQuestions.has(currentQuestion.id) ? 'Unflag' : 'Flag for Review'}
              </button>
              <div className="space-x-2">
                <button
                  className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  onClick={() => goToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0 || examLocked}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  onClick={() => goToQuestion(currentQuestionIndex + 1)}
                  disabled={currentQuestionIndex === questions.length - 1 || examLocked}
                >
                  Next
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
                onClick={handleSubmitQuiz}
                disabled={examLocked || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
