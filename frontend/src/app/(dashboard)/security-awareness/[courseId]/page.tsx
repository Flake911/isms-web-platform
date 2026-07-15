'use client';
import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Button, StatusBadge, ProgressBar } from '@/components/ui';
import { courses } from '../courseData';
import {
  ArrowLeft, ArrowRight, ChevronRight, Shield, AlertTriangle,
  CheckCircle, XCircle, RotateCcw, Trophy, Clock, Flame, Eye, HelpCircle
} from 'lucide-react';
import AttackScene from '../AttackScene';
import { useEmployee } from '@/context/EmployeeContext';
import AccessGuard from '@/components/AccessGuard';

type Section = 'overview' | 'simulation' | 'quiz' | 'results';

export default function LessonPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const course = courses.find(c => c.id === courseId);
  const { currentEmployee, completeCourse } = useEmployee();
  const [section, setSection] = useState<Section>('overview');
  const [simChoice, setSimChoice] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!course) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <AlertTriangle className="w-12 h-12 text-warning mb-4" />
        <h2 className="text-lg font-semibold text-text-primary mb-2">Course Not Found</h2>
        <Link href="/security-awareness"><Button variant="secondary"><ArrowLeft className="w-3.5 h-3.5" /> Back to Library</Button></Link>
      </div>
    );
  }

  // Quiz scoring
  const totalQuestions = course.quiz.length;
  const correctAnswers = quizAnswers.filter((a, i) => a === course.quiz[i].correctIndex).length;
  const scorePercent = Math.round((correctAnswers / totalQuestions) * 100);

  const handleQuizAnswer = (qIndex: number, aIndex: number) => {
    if (quizSubmitted) return;
    const newAnswers = [...quizAnswers];
    newAnswers[qIndex] = aIndex;
    setQuizAnswers(newAnswers);
  };

  const submitQuiz = () => {
    if (quizAnswers.filter(a => a !== null && a !== undefined).length === totalQuestions) {
      setQuizSubmitted(true);
    }
  };

  // Save progress when quiz is submitted
  useEffect(() => {
    if (quizSubmitted && currentEmployee && !saved) {
      completeCourse(courseId, scorePercent);
      setSaved(true);
    }
  }, [quizSubmitted, currentEmployee, saved, completeCourse, courseId, scorePercent]);

  const resetLesson = () => {
    setSection('overview');
    setSimChoice(null);
    setQuizAnswers([]);
    setQuizSubmitted(false);
    setSaved(false);
  };

  const sections: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Attack Flow', icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'simulation', label: 'Simulation', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: 'results', label: 'Results', icon: <Trophy className="w-3.5 h-3.5" /> },
  ];

  const sectionIndex = sections.findIndex(s => s.id === section);

  return (
    <AccessGuard page="security-awareness">
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/security-awareness">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{course.icon}</span>
            <h1 className="text-lg font-semibold text-text-primary">{course.title}</h1>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge status={course.difficulty} variant={course.difficulty === 'Beginner' ? 'success' : 'warning'} />
            <span className="text-xs text-text-muted flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-surface rounded-xl border border-border">
        {sections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              if (s.id === 'results' && !quizSubmitted) return;
              setSection(s.id);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium flex-1 justify-center transition-all ${
              section === s.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : s.id === 'results' && !quizSubmitted
                  ? 'text-text-muted/40 cursor-not-allowed'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface-light'
            }`}
          >
            {s.icon}
            <span className="hidden sm:inline">{s.label}</span>
            {i < sections.length - 1 && <ChevronRight className="w-3 h-3 text-text-muted/30 ml-auto hidden sm:block" />}
          </button>
        ))}
      </div>

      {/* Section 1: Animated Attack Scene */}
      {section === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <AttackScene courseId={course.id} color={course.color} onComplete={() => setSection('simulation')} />

          {/* Explanation */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" /> Key Knowledge
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">{course.explanation}</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setSection('simulation')}>
              Continue to Simulation <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Section 2: Simulation */}
      {section === 'simulation' && (
        <div className="space-y-6 animate-fade-in">
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-text-primary mb-1 flex items-center gap-2">
              <Flame className="w-4 h-4 text-warning" /> Interactive Simulation
            </h2>
            <p className="text-xs text-text-muted mb-4">{course.simulation.scenario}</p>

            {course.simulation.context && (
              <p className="text-xs text-text-muted italic mb-4 pl-3 border-l-2 border-border">{course.simulation.context}</p>
            )}

            {/* Fake email UI */}
            {course.simulation.emailFrom && (
              <div className="rounded-xl border border-border overflow-hidden mb-6 bg-bg">
                <div className="px-4 py-3 border-b border-border bg-surface-light/50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-danger/20 flex items-center justify-center text-[10px] font-bold text-danger">
                      {course.simulation.emailFrom[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text-primary">{course.simulation.emailFrom}</p>
                      <p className="text-[10px] text-text-muted">to: you@company.com</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-text-primary mt-2">{course.simulation.emailSubject}</p>
                </div>
                <div className="px-4 py-4">
                  <pre className="text-xs text-text-secondary whitespace-pre-wrap font-sans leading-relaxed">{course.simulation.emailBody}</pre>
                </div>
              </div>
            )}

            {/* Choices */}
            <p className="text-xs font-semibold text-text-primary mb-3">👉 What should you do?</p>
            <div className="space-y-2">
              {course.simulation.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => setSimChoice(i)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                    simChoice === null
                      ? 'border-border hover:border-primary/30 hover:bg-surface-light/50 text-text-secondary'
                      : simChoice === i
                        ? choice.correct
                          ? 'border-success/50 bg-success/8 text-success'
                          : 'border-danger/50 bg-danger/8 text-danger'
                        : simChoice !== null && choice.correct
                          ? 'border-success/30 bg-success/5 text-success/80'
                          : 'border-border/50 text-text-muted/60'
                  }`}
                  disabled={simChoice !== null}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                      simChoice === null
                        ? 'bg-surface-light text-text-muted'
                        : simChoice === i
                          ? choice.correct ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                          : choice.correct ? 'bg-success/10 text-success/70' : 'bg-surface-light/50 text-text-muted/40'
                    }`}>
                      {simChoice !== null ? (
                        choice.correct ? <CheckCircle className="w-3.5 h-3.5" /> : simChoice === i ? <XCircle className="w-3.5 h-3.5" /> : String.fromCharCode(65 + i)
                      ) : String.fromCharCode(65 + i)}
                    </div>
                    <div>
                      <span className="font-medium">{choice.text}</span>
                      {simChoice !== null && (simChoice === i || choice.correct) && (
                        <p className="text-xs mt-1.5 leading-relaxed opacity-90">{choice.feedback}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setSection('overview')}>
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
            <Button onClick={() => setSection('quiz')} disabled={simChoice === null}>
              Continue to Quiz <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Section 3: Quiz */}
      {section === 'quiz' && (
        <div className="space-y-6 animate-fade-in">
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-text-primary mb-1 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" /> Knowledge Check
            </h2>
            <p className="text-xs text-text-muted mb-6">Answer all questions to complete the course.</p>

            <div className="space-y-6">
              {course.quiz.map((q, qi) => (
                <div key={qi} className="pb-6 border-b border-border/50 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-text-primary mb-3">
                    <span className="text-primary font-bold mr-2">Q{qi + 1}.</span>
                    {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => handleQuizAnswer(qi, oi)}
                        disabled={quizSubmitted}
                        className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                          !quizSubmitted
                            ? quizAnswers[qi] === oi
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-border-light text-text-secondary'
                            : oi === q.correctIndex
                              ? 'border-success/50 bg-success/10 text-success'
                              : quizAnswers[qi] === oi
                                ? 'border-danger/50 bg-danger/10 text-danger'
                                : 'border-border/30 text-text-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                            !quizSubmitted
                              ? quizAnswers[qi] === oi ? 'bg-primary/20 text-primary' : 'bg-surface-light text-text-muted'
                              : oi === q.correctIndex ? 'bg-success/20 text-success' : quizAnswers[qi] === oi ? 'bg-danger/20 text-danger' : 'bg-surface-light/50 text-text-muted/40'
                          }`}>
                            {quizSubmitted ? (oi === q.correctIndex ? '✓' : quizAnswers[qi] === oi ? '✗' : String.fromCharCode(65 + oi)) : String.fromCharCode(65 + oi)}
                          </span>
                          {opt}
                        </div>
                      </button>
                    ))}
                  </div>
                  {quizSubmitted && (
                    <p className="text-xs text-text-muted mt-2 pl-3 border-l-2 border-primary/30 leading-relaxed">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setSection('simulation')}>
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
            {!quizSubmitted ? (
              <Button
                onClick={submitQuiz}
                disabled={quizAnswers.filter(a => a !== null && a !== undefined).length !== totalQuestions}
              >
                Submit Answers <CheckCircle className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button onClick={() => setSection('results')}>
                View Results <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Section 4: Results */}
      {section === 'results' && quizSubmitted && (
        <div className="space-y-6 animate-fade-in">
          <div className="card p-8 text-center">
            {/* Score gauge */}
            <div className="relative w-40 h-40 mx-auto mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#1F2937" strokeWidth="8" fill="none" />
                <circle
                  cx="50" cy="50" r="42"
                  stroke={scorePercent >= 80 ? '#22C55E' : scorePercent >= 60 ? '#F97316' : '#EF4444'}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${scorePercent * 2.64} 264`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  style={{ animation: 'scoreReveal 1s ease-out forwards' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-text-primary">{scorePercent}%</span>
                <span className="text-xs text-text-muted">Score</span>
              </div>
            </div>

            {/* Feedback */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium mb-4 ${
              scorePercent >= 80 ? 'bg-success/10 text-success' : scorePercent >= 60 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
            }`}>
              {scorePercent >= 80 ? (
                <><Trophy className="w-4 h-4" /> Excellent Security Awareness!</>
              ) : scorePercent >= 60 ? (
                <><AlertTriangle className="w-4 h-4" /> Good, but room for improvement</>
              ) : (
                <><XCircle className="w-4 h-4" /> Needs more training</>
              )}
            </div>

            <p className="text-sm text-text-secondary mb-2">
              You answered <strong className="text-text-primary">{correctAnswers}</strong> out of <strong className="text-text-primary">{totalQuestions}</strong> questions correctly.
            </p>

            {scorePercent < 100 && (
              <div className="mt-4 p-4 rounded-xl bg-surface-light/50 border border-border text-left max-w-md mx-auto">
                <p className="text-xs font-semibold text-text-primary mb-2">💡 Tips for Improvement:</p>
                <ul className="text-xs text-text-muted space-y-1.5 leading-relaxed">
                  {scorePercent < 80 && <li>• Review the attack flow to understand the full chain</li>}
                  {scorePercent < 60 && <li>• Pay close attention to the simulation scenarios</li>}
                  <li>• Practice identifying red flags in real-world scenarios</li>
                  <li>• Report suspicious activities to your security team immediately</li>
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={resetLesson}>
              <RotateCcw className="w-3.5 h-3.5" /> Retry Course
            </Button>
            <Link href="/security-awareness">
              <Button>
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Library
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
    </AccessGuard>
  );
}
