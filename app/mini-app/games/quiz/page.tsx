'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain, Trophy, Coins, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    question: 'ما هي عاصمة المملكة العربية السعودية؟',
    options: ['جدة', 'الرياض', 'الدمام', 'مكة المكرمة'],
    correctAnswer: 1,
    category: 'جغرافيا'
  },
  {
    id: 2,
    question: 'كم عدد أركان الإسلام؟',
    options: ['3', '4', '5', '6'],
    correctAnswer: 2,
    category: 'دين'
  },
  {
    id: 3,
    question: 'ما هو أكبر كوكب في المجموعة الشمسية؟',
    options: ['المريخ', 'زحل', 'المشتري', 'نبتون'],
    correctAnswer: 2,
    category: 'علوم'
  },
  {
    id: 4,
    question: 'من مؤلف كتاب "الأيام"؟',
    options: ['نجيب محفوظ', 'طه حسين', 'عباس محمود العقاد', 'توفيق الحكيم'],
    correctAnswer: 1,
    category: 'أدب'
  },
  {
    id: 5,
    question: 'كم عدد قارات العالم؟',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    category: 'جغرافيا'
  },
  {
    id: 6,
    question: 'ما هي عملة اليابان؟',
    options: ['يوان', 'ين', 'وون', 'دولار'],
    correctAnswer: 1,
    category: 'ثقافة'
  },
  {
    id: 7,
    question: 'كم عدد أحرف اللغة العربية؟',
    options: ['26', '27', '28', '29'],
    correctAnswer: 2,
    category: 'لغة'
  },
  {
    id: 8,
    question: 'من هو مخترع الكهرباء؟',
    options: ['توماس إديسون', 'نيكولا تسلا', 'بنجامين فرانكلين', 'ألكسندر جراهام بيل'],
    correctAnswer: 0,
    category: 'تاريخ'
  },
  {
    id: 9,
    question: 'كم عدد أيام السنة الميلادية؟',
    options: ['363', '364', '365', '366'],
    correctAnswer: 2,
    category: 'عامة'
  },
  {
    id: 10,
    question: 'ما هو أطول نهر في العالم؟',
    options: ['النيل', 'الأمازون', 'المسيسيبي', 'اليانغتسي'],
    correctAnswer: 0,
    category: 'جغرافيا'
  }
];

function QuizContent() {
  const { user, updateBalance } = useAuth();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answered, setAnswered] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (gameState === 'playing' && !answered && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !answered) {
      handleTimeout();
    }
  }, [gameState, answered, timeLeft]);

  const startGame = () => {
    // Get random 5 questions
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuestions(shuffled);
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(15);
    setAnswered(false);
    setSelectedAnswer(null);
  };

  const handleTimeout = () => {
    setAnswered(true);
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const handleAnswer = (answerIndex: number) => {
    if (answered) return;

    setSelectedAnswer(answerIndex);
    setAnswered(true);

    const currentQuestion = questions[currentQuestionIndex];
    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(15);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameState('finished');

    // Calculate reward
    const reward = score * 100; // 100 coins per correct answer

    if (reward > 0 && user) {
      try {
        const response = await fetch('/api/games/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.telegramId,
            score,
            totalQuestions: questions.length,
            reward
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            updateBalance(data.newBalance);
          }
        }
      } catch (error) {
        console.error('Error submitting quiz:', error);
      }
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/mini-app/games">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">🧠 Quiz Challenge</h1>
              <p className="text-sm text-blue-300">اختبر معلوماتك!</p>
            </div>
          </div>

          {gameState === 'playing' && (
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-400">النقاط</p>
                <p className="text-2xl font-bold text-yellow-400">{score}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">الوقت</p>
                <p className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
                  {timeLeft}s
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {gameState === 'menu' && (
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <div className="p-8 text-center">
              <Brain className="w-20 h-20 mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-bold mb-4">كيفية اللعب</h2>
              <div className="space-y-2 text-gray-300 mb-6">
                <p>🧠 أجب على 5 أسئلة متنوعة</p>
                <p>⏱️ لديك 15 ثانية لكل سؤال</p>
                <p>💯 كل إجابة صحيحة = 100 عملة</p>
                <p>🏆 احصل على 500 عملة كحد أقصى!</p>
              </div>
              <Button
                onClick={startGame}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-14 px-8 text-lg"
              >
                <Brain className="w-5 h-5 mr-2" />
                ابدأ التحدي!
              </Button>
            </div>
          </Card>
        )}

        {gameState === 'playing' && currentQuestion && (
          <div className="space-y-6">
            {/* Progress */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">
                    السؤال {currentQuestionIndex + 1} من {questions.length}
                  </span>
                  <span className="text-sm px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">
                    {currentQuestion.category}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </Card>

            {/* Question */}
            <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30">
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-6">{currentQuestion.question}</h3>
              </div>
            </Card>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showResult = answered;

                let bgClass = 'bg-white/5 hover:bg-white/10';
                if (showResult) {
                  if (isCorrect) {
                    bgClass = 'bg-green-600/30 border-green-500';
                  } else if (isSelected && !isCorrect) {
                    bgClass = 'bg-red-600/30 border-red-500';
                  }
                }

                return (
                  <Card
                    key={index}
                    className={`${bgClass} backdrop-blur-md border-white/10 transition-all cursor-pointer ${
                      answered ? 'pointer-events-none' : 'hover:scale-102'
                    }`}
                    onClick={() => handleAnswer(index)}
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-lg">{option}</span>
                      </div>
                      {showResult && isCorrect && <CheckCircle className="w-6 h-6 text-green-400" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-400" />}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {gameState === 'finished' && (
          <Card className="bg-gradient-to-br from-purple-600 to-blue-600 border-0 shadow-2xl">
            <div className="p-8 text-center">
              <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-300 animate-bounce" />
              <h2 className="text-3xl font-bold mb-6">انتهى التحدي! 🎉</h2>
              
              <div className="space-y-3 mb-6">
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm text-blue-200 mb-1">إجاباتك الصحيحة</p>
                  <p className="text-4xl font-bold">{score} / {questions.length}</p>
                </div>
                
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm text-blue-200 mb-1">المكافأة</p>
                  <div className="flex items-center justify-center gap-2">
                    <Coins className="w-8 h-8 text-yellow-300" />
                    <p className="text-4xl font-bold text-yellow-300">
                      +{score * 100}
                    </p>
                  </div>
                </div>

                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm text-blue-200 mb-1">نسبة النجاح</p>
                  <p className="text-3xl font-bold">
                    {((score / questions.length) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={startGame}
                  className="flex-1 bg-white/20 hover:bg-white/30 h-12"
                >
                  العب مرة أخرى
                </Button>
                <Link href="/mini-app/games" className="flex-1">
                  <Button className="w-full bg-white/20 hover:bg-white/30 h-12">
                    رجوع
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <ProtectedRoute>
      <QuizContent />
    </ProtectedRoute>
  );
}
