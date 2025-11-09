import { useState } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Brain, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle,
  Lightbulb,
  Clock,
  Award,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import type { Screen, User } from '@/app/page';

interface AIQuizProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export function AIQuiz({ user, onNavigate, onLogout, darkMode, toggleTheme }: AIQuizProps) {
  const [mode, setMode] = useState<'menu' | 'generate' | 'quiz' | 'results'>('menu');
  const [quizTopic, setQuizTopic] = useState('');
  const [questionCount, setQuestionCount] = useState('10');
  const [difficulty, setDifficulty] = useState('Medium');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes

  const mockQuestions: Question[] = [
    {
      id: 1,
      question: 'What is the time complexity of Binary Search in a sorted array?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correctAnswer: 1,
      explanation: 'Binary Search divides the search space in half with each iteration, resulting in logarithmic time complexity O(log n).',
      difficulty: 'Medium'
    },
    {
      id: 2,
      question: 'Which data structure uses LIFO (Last In First Out) principle?',
      options: ['Queue', 'Stack', 'Array', 'Tree'],
      correctAnswer: 1,
      explanation: 'A Stack follows the LIFO principle where the last element added is the first one to be removed.',
      difficulty: 'Easy'
    },
    {
      id: 3,
      question: 'What is the space complexity of a recursive function that makes n recursive calls?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctAnswer: 2,
      explanation: 'Each recursive call adds a frame to the call stack, so n recursive calls result in O(n) space complexity.',
      difficulty: 'Medium'
    },
    {
      id: 4,
      question: 'Which sorting algorithm has the best average case time complexity?',
      options: ['Bubble Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort'],
      correctAnswer: 1,
      explanation: 'Quick Sort has an average time complexity of O(n log n), which is optimal for comparison-based sorting.',
      difficulty: 'Medium'
    },
    {
      id: 5,
      question: 'What is a hash collision?',
      options: [
        'When two keys have the same value',
        'When two different keys map to the same hash value',
        'When a hash function fails',
        'When memory overflow occurs'
      ],
      correctAnswer: 1,
      explanation: 'A hash collision occurs when two different keys produce the same hash value, requiring collision resolution techniques.',
      difficulty: 'Medium'
    }
  ];

  const [questions] = useState<Question[]>(mockQuestions);

  const handleGenerateQuiz = () => {
    if (!quizTopic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    toast.success('Quiz generated successfully!');
    setAnswers(new Array(questions.length).fill(null));
    setMode('quiz');
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1]);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1]);
      setShowExplanation(false);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation
        user={user}
        currentScreen="quiz"
        onNavigate={onNavigate}
        onLogout={onLogout}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === 'menu' && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-gray-900 dark:text-white mb-2">AI Quiz Generator</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Generate personalized quizzes with AI for effective practice
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card 
                className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setMode('generate')}
              >
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-gray-900 dark:text-white mb-2">Generate New Quiz</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Create a custom quiz on any topic using AI
                </p>
              </Card>

              <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-gray-900 dark:text-white mb-2">Practice Mode</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Practice with previously generated quizzes
                </p>
              </Card>
            </div>

            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-white mb-4">Recent Quiz Scores</h3>
              <div className="space-y-3">
                {[
                  { topic: 'Data Structures', score: 85, date: '2 days ago' },
                  { topic: 'Algorithms', score: 92, date: '5 days ago' },
                  { topic: 'Database Systems', score: 78, date: '1 week ago' }
                ].map((quiz, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-gray-900 dark:text-white">{quiz.topic}</p>
                      <p className="text-gray-600 dark:text-gray-400">{quiz.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-gray-900 dark:text-white">{quiz.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {mode === 'generate' && (
          <Card className="p-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <h2 className="text-gray-900 dark:text-white mb-6">Generate Quiz</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-gray-900 dark:text-white">
                  Quiz Topic
                </Label>
                <Input
                  id="topic"
                  placeholder="e.g., Data Structures, Algorithms, Databases"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="count" className="text-gray-900 dark:text-white">
                    Number of Questions
                  </Label>
                  <Input
                    id="count"
                    type="number"
                    min="5"
                    max="50"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-900 dark:text-white">
                    Difficulty Level
                  </Label>
                  <RadioGroup value={difficulty} onValueChange={setDifficulty}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Easy" id="easy" />
                        <Label htmlFor="easy" className="text-gray-900 dark:text-white">Easy</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Medium" id="medium" />
                        <Label htmlFor="medium" className="text-gray-900 dark:text-white">Medium</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Hard" id="hard" />
                        <Label htmlFor="hard" className="text-gray-900 dark:text-white">Hard</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setMode('menu')} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleGenerateQuiz} className="flex-1">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Quiz
                </Button>
              </div>
            </div>
          </Card>
        )}

        {mode === 'quiz' && currentQuestion && (
          <>
            {/* Quiz Header */}
            <Card className="p-4 mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </Badge>
                  <Badge>{currentQuestion.difficulty}</Badge>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
              </div>
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="mt-4" />
            </Card>

            {/* Question Card */}
            <Card className="p-8 mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-white mb-6">
                {currentQuestion.question}
              </h3>

              <RadioGroup value={selectedAnswer?.toString()} onValueChange={(val) => handleAnswerSelect(parseInt(val))}>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-4 border-2 rounded-lg transition-colors cursor-pointer ${
                        selectedAnswer === index
                          ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label 
                        htmlFor={`option-${index}`} 
                        className="flex-1 cursor-pointer text-gray-900 dark:text-white"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {showExplanation && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-blue-900 dark:text-blue-300 mb-2">Explanation</h4>
                      <p className="text-blue-800 dark:text-blue-200">
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
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {showExplanation ? 'Hide' : 'Show'} Explanation
                </Button>
              </div>
            </Card>

            {/* Navigation */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              {currentQuestionIndex === questions.length - 1 ? (
                <Button onClick={handleSubmit} className="flex-1">
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={handleNext} className="flex-1">
                  Next Question
                </Button>
              )}
            </div>
          </>
        )}

        {mode === 'results' && (
          <Card className="p-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="text-center mb-8">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                score.percentage >= 70 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : 'bg-orange-100 dark:bg-orange-900/30'
              }`}>
                <Award className={`w-10 h-10 ${
                  score.percentage >= 70 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-orange-600 dark:text-orange-400'
                }`} />
              </div>
              <h2 className="text-gray-900 dark:text-white mb-2">Quiz Complete!</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Here's how you performed
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Score</p>
                <p className="text-gray-900 dark:text-white">{score.percentage.toFixed(0)}%</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Correct</p>
                <p className="text-gray-900 dark:text-white">{score.correct}/{score.total}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Time</p>
                <p className="text-gray-900 dark:text-white">8:34</p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <h3 className="text-gray-900 dark:text-white">Review Answers</h3>
              {questions.map((question, index) => {
                const isCorrect = answers[index] === question.correctAnswer;
                return (
                  <div
                    key={question.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white mb-1">
                        Question {index + 1}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {question.question}
                      </p>
                    </div>
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setMode('menu')} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
              <Button onClick={() => {
                setMode('generate');
                setQuizTopic('');
              }} className="flex-1">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New Quiz
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
