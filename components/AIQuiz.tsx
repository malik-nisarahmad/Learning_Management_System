"use client";

import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  Brain,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { generateQuizAI } from '@/lib/aiQuizGenerator';
import type { Screen, User } from '@/app/page';

interface AIQuizProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
}

export function AIQuiz({ user, onNavigate, onLogout, darkMode }: AIQuizProps) {
  const [mode, setMode] = useState<'menu' | 'generate' | 'quiz' | 'results'>('menu');
  const [quizTopic, setQuizTopic] = useState('');
  const [questionCount, setQuestionCount] = useState('10');
  const [difficulty, setDifficulty] = useState('Medium');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1800);

  const mockQuestions: Question[] = [
    {
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correctAnswer: 1,
      explanation: 'Binary search divides the search interval in half each time, resulting in O(log n) time complexity.',
      difficulty: 'Medium'
    },
    {
      question: 'Which data structure uses LIFO principle?',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      correctAnswer: 1,
      explanation: 'A Stack uses Last-In-First-Out (LIFO) principle where the last element added is the first one to be removed.',
      difficulty: 'Easy'
    },
    {
      question: 'What is the worst-case time complexity of QuickSort?',
      options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
      correctAnswer: 2,
      explanation: 'QuickSort has a worst-case time complexity of O(n²) when the pivot selection consistently results in unbalanced partitions.',
      difficulty: 'Hard'
    }
  ];

  const [questions, setQuestions] = useState<Question[]>([]);

  const handleGenerateQuiz = async () => {
    if (!quizTopic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    try {
      const generated = await generateQuizAI(quizTopic, parseInt(questionCount), difficulty as any);
      setQuestions(generated);
      setAnswers(new Array(generated.length).fill(null));
      setMode('quiz');
      toast.success('AI quiz generated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate quiz. Try again.');
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1]);
    }
  };

  const handleSubmit = () => {
    setMode('results');
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: (correct / questions.length) * 100
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const score = calculateScore();

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <Navigation
        user={user}
        currentScreen="quiz"
        onNavigate={onNavigate}
        onLogout={onLogout}
        darkMode={darkMode}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 sm:pt-24 sm:pb-12 relative z-10">
        {mode === 'menu' && (
          <>
            {/* Header */}
            <div className="text-center mb-10 sm:mb-14">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-float">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">AI Quiz Generator</h1>
              <p className="text-slate-400 text-lg">
                Generate personalized quizzes with AI for effective practice
              </p>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-10">
              <div
                className="group bg-slate-900/60 border border-slate-800/50 backdrop-blur-sm rounded-2xl p-8 hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1"
                onClick={() => setMode('generate')}
              >
                <div className="w-14 h-14 rounded-xl bg-slate-800/50 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors">
                  <Sparkles className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Generate New Quiz</h3>
                <p className="text-slate-400 leading-relaxed">
                  Create a custom quiz on any topic using AI. Tailor difficulty and length to your needs.
                </p>
              </div>

              <div className="group bg-slate-900/60 border border-slate-800/50 backdrop-blur-sm rounded-2xl p-8 hover:bg-slate-800/60 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-slate-800/50 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
                  <TrendingUp className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Practice Mode</h3>
                <p className="text-slate-400 leading-relaxed">
                  Review past quizzes and track your progress over time.
                </p>
              </div>
            </div>

            {/* Recent Scores */}
            <div className="bg-slate-900/60 border border-slate-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                Recent Quiz Scores
              </h3>
              <div className="space-y-3">
                {[
                  { topic: 'Data Structures', score: 85, date: '2 days ago' },
                  { topic: 'Algorithms', score: 92, date: '5 days ago' },
                  { topic: 'Database Systems', score: 78, date: '1 week ago' }
                ].map((quiz, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-800/50 rounded-xl hover:border-indigo-500/30 transition-colors group">
                    <div>
                      <p className="text-white font-medium group-hover:text-indigo-400 transition-colors">{quiz.topic}</p>
                      <p className="text-slate-500 text-xs mt-1">{quiz.date}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-bold">{quiz.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {mode === 'generate' && (
          <div className="bg-slate-900/60 border border-slate-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Generate Quiz</h2>
              <p className="text-slate-400 text-sm">Configure your AI-generated quiz settings</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-slate-300 text-sm font-medium">
                  Quiz Topic
                </Label>
                <Input
                  id="topic"
                  placeholder="e.g., Data Structures, Algorithms, Databases"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 h-12 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="count" className="text-slate-300 text-sm font-medium">
                    Number of Questions
                  </Label>
                  <Input
                    id="count"
                    type="number"
                    min="5"
                    max="50"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="bg-slate-950/50 border-slate-800 text-white h-12 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm font-medium">
                    Difficulty Level
                  </Label>
                  <RadioGroup value={difficulty} onValueChange={setDifficulty} className="flex gap-2 mt-1">
                    {['Easy', 'Medium', 'Hard'].map((level) => (
                      <div key={level} className="flex-1">
                        <RadioGroupItem value={level} id={level.toLowerCase()} className="peer sr-only" />
                        <Label
                          htmlFor={level.toLowerCase()}
                          className="flex items-center justify-center h-11 rounded-xl border border-slate-800 bg-slate-950/30 text-slate-400 cursor-pointer hover:bg-slate-900 peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-500/10 peer-data-[state=checked]:text-indigo-400 transition-all"
                        >
                          {level}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setMode('menu')}
                  className="sm:flex-1 h-12 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateQuiz}
                  className="sm:flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Quiz
                </Button>
              </div>
            </div>
          </div>
        )}

        {mode === 'quiz' && currentQuestion && (
          <>
            {/* Quiz Header */}
            <div className="bg-slate-900/60 border border-slate-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-gradient-to-r from-[#6c5ce7]/20 to-[#a855f7]/20 text-[#a29bfe] border-0 text-xs rounded-lg">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </Badge>
                  <Badge className="bg-[#1e2545] text-[#8892b3] border border-[#2a3358] text-xs rounded-lg">
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[#8892b3] text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
              </div>
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2 bg-[#1e2545] rounded-full [&>div]:bg-gradient-to-r [&>div]:from-[#6c5ce7] [&>div]:to-[#a855f7]" />
            </div>

            {/* Question Card */}
            <div className="bg-[#171d36] border border-[#2a3358] rounded-2xl p-6 sm:p-8 mb-6">
              <h3 className="text-lg font-semibold text-white mb-6">
                {currentQuestion.question}
              </h3>

              <RadioGroup value={selectedAnswer?.toString()} onValueChange={(val) => handleAnswerSelect(parseInt(val))}>
                <div className="space-y-3">
                  {Array.isArray(currentQuestion.options) ? (
                    currentQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`flex items-center space-x-3 p-4 border rounded-xl transition-all duration-200 cursor-pointer ${
                          selectedAnswer === index
                            ? 'border-[#6c5ce7] bg-[#6c5ce7]/10 shadow-lg shadow-purple-500/10'
                            : 'border-[#2a3358] hover:border-[#6c5ce7]/50 bg-[#1e2545]'
                        }`}
                      >
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} className="border-[#2a3358] text-[#6c5ce7]" />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-[#b8c0e0]">
                          {option}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <div className="text-[#ff6b6b] text-sm">
                      Invalid options format received from AI.
                    </div>
                  )}
                </div>
              </RadioGroup>

              {showExplanation && (
                <div className="mt-6 p-4 bg-[#00cec9]/10 border border-[#00cec9]/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-[#81ecec] mt-0.5" />
                    <div>
                      <h4 className="text-[#81ecec] font-medium text-sm mb-2">Explanation</h4>
                      <p className="text-[#b8c0e0] text-sm">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowExplanation(!showExplanation)}
                  disabled={selectedAnswer === null}
                  className="h-10 bg-transparent border-[#2a3358] text-[#8892b3] hover:bg-[#1e2545] hover:border-[#00cec9]/50 hover:text-[#81ecec] disabled:opacity-50 rounded-xl"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {showExplanation ? 'Hide' : 'Show'} Explanation
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="h-11 bg-transparent border-[#2a3358] text-[#8892b3] hover:bg-[#1e2545] hover:border-[#6c5ce7]/50 disabled:opacity-50 rounded-xl"
              >
                Previous
              </Button>
              {currentQuestionIndex === questions.length - 1 ? (
                <Button onClick={handleSubmit} className="flex-1 h-11 bg-gradient-to-r from-[#00cec9] to-[#81ecec] hover:from-[#00b5b0] hover:to-[#6fd6d6] text-[#0c0f1a] font-semibold border-0 rounded-xl shadow-lg shadow-cyan-500/25">
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={handleNext} className="flex-1 h-11 bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] hover:from-[#5b4cdb] hover:to-[#9645e5] text-white border-0 rounded-xl shadow-lg shadow-purple-500/25">
                  Next Question
                </Button>
              )}
            </div>
          </>
        )}

        {mode === 'results' && (
          <div className="bg-[#171d36] border border-[#2a3358] rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                score.percentage >= 70
                  ? 'bg-gradient-to-br from-[#00b894]/20 to-[#00cec9]/20 border border-[#00b894]/30'
                  : 'bg-gradient-to-br from-[#ffd93d]/20 to-[#f9ca24]/20 border border-[#ffd93d]/30'
              }`}>
                <Award className={`w-10 h-10 ${
                  score.percentage >= 70
                    ? 'text-[#00b894]'
                    : 'text-[#ffd93d]'
                }`} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h2>
              <p className="text-[#8892b3]">
                Here's how you performed
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
              <div className="text-center p-4 bg-[#1e2545] border border-[#2a3358] rounded-xl">
                <p className="text-[#8892b3] text-xs mb-1">Score</p>
                <p className="text-white text-xl sm:text-2xl font-bold">{score.percentage.toFixed(0)}%</p>
              </div>
              <div className="text-center p-4 bg-[#1e2545] border border-[#2a3358] rounded-xl">
                <p className="text-[#8892b3] text-xs mb-1">Correct</p>
                <p className="text-white text-xl sm:text-2xl font-bold">{score.correct}/{score.total}</p>
              </div>
              <div className="text-center p-4 bg-[#1e2545] border border-[#2a3358] rounded-xl">
                <p className="text-[#8892b3] text-xs mb-1">Time</p>
                <p className="text-white text-xl sm:text-2xl font-bold">8:34</p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <h3 className="text-white font-semibold">Review Answers</h3>
              {questions.map((question, index) => {
                const isCorrect = answers[index] === question.correctAnswer;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-[#2a3358] rounded-xl bg-[#1e2545] hover:border-[#6c5ce7]/30 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium mb-1">
                        Question {index + 1}
                      </p>
                      <p className="text-[#8892b3] text-xs line-clamp-1">
                        {question.question}
                      </p>
                    </div>
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-[#00b894]" />
                    ) : (
                      <XCircle className="w-6 h-6 text-[#ff6b6b]" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setMode('menu')}
                className="sm:flex-1 h-11 bg-transparent border-[#2a3358] text-[#8892b3] hover:bg-[#1e2545] hover:border-[#6c5ce7]/50 rounded-xl"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
              <Button
                onClick={() => {
                  setMode('generate');
                  setQuizTopic('');
                }}
                className="sm:flex-1 h-11 bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] hover:from-[#5b4cdb] hover:to-[#9645e5] text-white border-0 rounded-xl shadow-lg shadow-purple-500/25"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New Quiz
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
