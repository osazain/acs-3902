/**
 * Test Engine for Midterm 2 Study Platform
 * Handles practice tests, quick quizzes, scoring, and progress tracking
 */

class TestEngine {
  constructor() {
    this.currentTest = null;
    this.currentQuiz = null;
    this.answers = {};
    this.flaggedQuestions = new Set();
    this.startTime = null;
    this.sectionStartTimes = {};
    this.currentSection = null;
    this.currentQuestionIndex = 0;
    this.timerInterval = null;
    this.autoSaveInterval = null;
    this.timeRemaining = 0;
    this.testConfig = {
      timed: true,
      showAnswersImmediately: false,
      strictMode: false
    };
    this.testHistory = [];
  }

  /**
   * Initialize the test engine
   */
  init() {
    this.loadTestHistory();
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for test interface
   */
  setupEventListeners() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.currentTest && !this.currentQuiz) return;
      
      switch(e.key) {
        case 'ArrowRight':
          if (e.ctrlKey) this.nextQuestion();
          break;
        case 'ArrowLeft':
          if (e.ctrlKey) this.previousQuestion();
          break;
        case 'f':
          if (e.ctrlKey) {
            e.preventDefault();
            this.toggleFlagCurrent();
          }
          break;
      }
    });
  }

  /**
   * Load test history from localStorage
   */
  loadTestHistory() {
    try {
      const history = localStorage.getItem('test-history');
      if (history) {
        this.testHistory = JSON.parse(history);
      }
    } catch (e) {
      console.warn('Could not load test history:', e);
    }
  }

  /**
   * Start a practice test
   * @param {string} testId - The test ID from practice-tests.json
   * @param {Object} config - Test configuration options
   */
  async startTest(testId, config = {}) {
    try {
      const response = await fetch('../js/data/practice-tests.json');
      const data = await response.json();
      const test = data.tests.find(t => t.test_id === testId);
      
      if (!test) {
        throw new Error(`Test ${testId} not found`);
      }

      this.currentTest = test;
      this.testConfig = { ...this.testConfig, ...config };
      this.answers = {};
      this.flaggedQuestions.clear();
      this.startTime = Date.now();
      this.timeRemaining = test.duration_minutes * 60;
      this.currentSection = 'section_a';
      this.currentQuestionIndex = 0;

      // Record section start times
      Object.keys(test.sections).forEach(section => {
        this.sectionStartTimes[section] = null;
      });
      this.sectionStartTimes['section_a'] = Date.now();

      // Start timer if timed mode
      if (this.testConfig.timed) {
        this.startTimer();
      }

      // Start auto-save
      this.startAutoSave();

      // Save test state
      this.saveTestState();

      return {
        success: true,
        test: test,
        config: this.testConfig
      };
    } catch (error) {
      console.error('Error starting test:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start a quick quiz
   * @param {string} quizId - The quiz ID from quick-quizzes.json
   * @param {Object} config - Quiz configuration options
   */
  async startQuiz(quizId, config = {}) {
    try {
      const response = await fetch('../js/data/quick-quizzes.json');
      const data = await response.json();
      const quiz = data.quizzes.find(q => q.quiz_id === quizId);
      
      if (!quiz) {
        throw new Error(`Quiz ${quizId} not found`);
      }

      this.currentQuiz = quiz;
      this.testConfig = { ...this.testConfig, ...config };
      this.answers = {};
      this.flaggedQuestions.clear();
      this.startTime = Date.now();
      this.timeRemaining = quiz.duration_minutes * 60;
      this.currentQuestionIndex = 0;

      // Start timer
      if (this.testConfig.timed) {
        this.startTimer();
      }

      // Start auto-save
      this.startAutoSave();

      return {
        success: true,
        quiz: quiz,
        config: this.testConfig
      };
    } catch (error) {
      console.error('Error starting quiz:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start the countdown timer
   */
  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      this.updateTimerDisplay();

      // Warning at 15 minutes
      if (this.timeRemaining === 15 * 60) {
        this.showTimeWarning(15);
      }

      // Warning at 5 minutes
      if (this.timeRemaining === 5 * 60) {
        this.showTimeWarning(5);
      }

      // Time's up
      if (this.timeRemaining <= 0) {
        this.timeUp();
      }
    }, 1000);
  }

  /**
   * Update the timer display
   */
  updateTimerDisplay() {
    const timerElement = document.getElementById('test-timer');
    if (!timerElement) return;

    const hours = Math.floor(this.timeRemaining / 3600);
    const minutes = Math.floor((this.timeRemaining % 3600) / 60);
    const seconds = this.timeRemaining % 60;

    let timeString = '';
    if (hours > 0) {
      timeString = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    timerElement.textContent = timeString;

    // Visual warning states
    timerElement.classList.remove('warning', 'danger');
    if (this.timeRemaining <= 5 * 60) {
      timerElement.classList.add('danger');
    } else if (this.timeRemaining <= 15 * 60) {
      timerElement.classList.add('warning');
    }
  }

  /**
   * Show time warning
   * @param {number} minutes - Minutes remaining
   */
  showTimeWarning(minutes) {
    const warningEvent = new CustomEvent('timeWarning', {
      detail: { minutes: minutes, seconds: this.timeRemaining }
    });
    document.dispatchEvent(warningEvent);

    // Show toast notification
    this.showToast(`⚠️ ${minutes} minutes remaining!`, 'warning');
  }

  /**
   * Handle time up
   */
  timeUp() {
    clearInterval(this.timerInterval);
    clearInterval(this.autoSaveInterval);

    const timeUpEvent = new CustomEvent('timeUp');
    document.dispatchEvent(timeUpEvent);

    // Auto-submit the test
    this.showToast("Time's up! Submitting your test...", 'danger');
    setTimeout(() => this.submitTest(), 3000);
  }

  /**
   * Start auto-save interval
   */
  startAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    // Auto-save every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      this.saveTestState();
    }, 30000);
  }

  /**
   * Submit an answer for a question
   * @param {string} questionId - The question ID
   * @param {*} answer - The answer value
   */
  submitAnswer(questionId, answer) {
    this.answers[questionId] = {
      value: answer,
      timestamp: Date.now()
    };

    // If show answers immediately mode, check and show result
    if (this.testConfig.showAnswersImmediately) {
      this.showImmediateFeedback(questionId, answer);
    }

    // Update progress
    this.updateProgress();

    return { success: true };
  }

  /**
   * Show immediate feedback for an answer
   * @param {string} questionId - The question ID
   * @param {*} answer - The submitted answer
   */
  showImmediateFeedback(questionId, answer) {
    const question = this.getCurrentQuestion();
    if (!question) return;

    const isCorrect = this.checkAnswer(question, answer);
    const feedbackEvent = new CustomEvent('answerFeedback', {
      detail: { 
        questionId, 
        isCorrect, 
        correctAnswer: question.correct_answer,
        explanation: question.explanation
      }
    });
    document.dispatchEvent(feedbackEvent);
  }

  /**
   * Check if an answer is correct
   * @param {Object} question - The question object
   * @param {*} answer - The submitted answer
   */
  checkAnswer(question, answer) {
    if (question.type === 'multiple_choice' || question.type === 'query_tree') {
      return answer === question.correct_answer;
    }
    
    if (question.type === 'ra_to_sql' || question.type === 'sql_to_ra' || question.type === 'cte_writing') {
      // Normalize and compare SQL/RA answers
      return this.normalizeAndCompare(answer, question.correct_answer);
    }

    return false;
  }

  /**
   * Normalize and compare SQL/RA answers
   * @param {string} userAnswer - User's answer
   * @param {string} correctAnswer - Correct answer
   */
  normalizeAndCompare(userAnswer, correctAnswer) {
    const normalize = (str) => {
      return str.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/;\s*$/, '')
        .trim();
    };

    return normalize(userAnswer) === normalize(correctAnswer);
  }

  /**
   * Flag/unflag a question for review
   * @param {string} questionId - The question ID
   */
  flagQuestion(questionId) {
    if (this.flaggedQuestions.has(questionId)) {
      this.flaggedQuestions.delete(questionId);
      return { flagged: false };
    } else {
      this.flaggedQuestions.add(questionId);
      return { flagged: true };
    }
  }

  /**
   * Toggle flag for current question
   */
  toggleFlagCurrent() {
    const question = this.getCurrentQuestion();
    if (question) {
      const result = this.flagQuestion(question.id);
      this.updateFlagDisplay(result.flagged);
      return result;
    }
  }

  /**
   * Update flag display
   * @param {boolean} isFlagged - Whether current question is flagged
   */
  updateFlagDisplay(isFlagged) {
    const flagBtn = document.getElementById('flag-btn');
    if (flagBtn) {
      flagBtn.classList.toggle('flagged', isFlagged);
      flagBtn.innerHTML = isFlagged ? '🔖 Flagged' : '📍 Flag for Review';
    }
  }

  /**
   * Navigate to a specific question
   * @param {number} index - Question index
   * @param {string} section - Section key (for tests)
   */
  navigateToQuestion(index, section = null) {
    if (section && this.currentTest) {
      this.currentSection = section;
      this.currentQuestionIndex = index;
    } else if (this.currentQuiz) {
      this.currentQuestionIndex = index;
    }

    const navigationEvent = new CustomEvent('questionNavigation', {
      detail: { 
        section: this.currentSection,
        index: this.currentQuestionIndex,
        question: this.getCurrentQuestion()
      }
    });
    document.dispatchEvent(navigationEvent);

    // Update flag display
    const question = this.getCurrentQuestion();
    if (question) {
      this.updateFlagDisplay(this.flaggedQuestions.has(question.id));
    }

    return { success: true };
  }

  /**
   * Go to next question
   */
  nextQuestion() {
    const currentQuestions = this.getCurrentQuestionsArray();
    
    if (this.currentQuestionIndex < currentQuestions.length - 1) {
      return this.navigateToQuestion(this.currentQuestionIndex + 1, this.currentSection);
    } else {
      // Try to go to next section
      const sections = Object.keys(this.currentTest?.sections || {});
      const currentSectionIndex = sections.indexOf(this.currentSection);
      
      if (currentSectionIndex < sections.length - 1) {
        const nextSection = sections[currentSectionIndex + 1];
        this.sectionStartTimes[nextSection] = Date.now();
        return this.navigateToQuestion(0, nextSection);
      }
    }
    
    return { success: false, message: 'Already at last question' };
  }

  /**
   * Go to previous question
   */
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      return this.navigateToQuestion(this.currentQuestionIndex - 1, this.currentSection);
    } else {
      // Try to go to previous section
      const sections = Object.keys(this.currentTest?.sections || {});
      const currentSectionIndex = sections.indexOf(this.currentSection);
      
      if (currentSectionIndex > 0) {
        const prevSection = sections[currentSectionIndex - 1];
        const prevQuestions = this.currentTest.sections[prevSection].questions_data;
        return this.navigateToQuestion(prevQuestions.length - 1, prevSection);
      }
    }
    
    return { success: false, message: 'Already at first question' };
  }

  /**
   * Get current question object
   */
  getCurrentQuestion() {
    if (this.currentTest) {
      const section = this.currentTest.sections[this.currentSection];
      return section?.questions_data[this.currentQuestionIndex];
    } else if (this.currentQuiz) {
      return this.currentQuiz.questions[this.currentQuestionIndex];
    }
    return null;
  }

  /**
   * Get current questions array
   */
  getCurrentQuestionsArray() {
    if (this.currentTest) {
      return this.currentTest.sections[this.currentSection]?.questions_data || [];
    } else if (this.currentQuiz) {
      return this.currentQuiz.questions || [];
    }
    return [];
  }

  /**
   * Get total questions count
   */
  getTotalQuestions() {
    if (this.currentTest) {
      return Object.values(this.currentTest.sections)
        .reduce((sum, section) => sum + section.questions_data.length, 0);
    } else if (this.currentQuiz) {
      return this.currentQuiz.questions.length;
    }
    return 0;
  }

  /**
   * Get answered questions count
   */
  getAnsweredCount() {
    return Object.keys(this.answers).length;
  }

  /**
   * Update progress display
   */
  updateProgress() {
    const total = this.getTotalQuestions();
    const answered = this.getAnsweredCount();
    const progress = total > 0 ? (answered / total) * 100 : 0;

    const progressEvent = new CustomEvent('progressUpdate', {
      detail: {
        total,
        answered,
        progress,
        flagged: this.flaggedQuestions.size
      }
    });
    document.dispatchEvent(progressEvent);
  }

  /**
   * Submit the test/quiz
   */
  submitTest() {
    clearInterval(this.timerInterval);
    clearInterval(this.autoSaveInterval);

    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - this.startTime) / 1000);

    const results = this.calculateScore();
    results.timeSpent = timeSpent;
    results.timeRemaining = this.timeRemaining;

    // Save results
    this.saveTestResults(results);

    // Clear test state
    this.clearTestState();

    const submitEvent = new CustomEvent('testSubmitted', {
      detail: results
    });
    document.dispatchEvent(submitEvent);

    return results;
  }

  /**
   * Calculate test score
   */
  calculateScore() {
    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;
    const sectionResults = {};
    const questionResults = [];
    const topicPerformance = {};

    if (this.currentTest) {
      // Calculate for practice test
      Object.entries(this.currentTest.sections).forEach(([sectionKey, section]) => {
        let sectionScore = 0;
        let sectionMax = 0;
        let sectionCorrect = 0;
        const sectionTime = this.calculateSectionTime(sectionKey);

        section.questions_data.forEach(question => {
          const answer = this.answers[question.id];
          const isCorrect = answer ? this.checkAnswer(question, answer.value) : false;
          const points = isCorrect ? question.points : 0;

          sectionScore += points;
          sectionMax += question.points;
          if (isCorrect) sectionCorrect++;

          // Track topic performance
          question.topics?.forEach(topic => {
            if (!topicPerformance[topic]) {
              topicPerformance[topic] = { correct: 0, total: 0 };
            }
            topicPerformance[topic].total++;
            if (isCorrect) topicPerformance[topic].correct++;
          });

          questionResults.push({
            id: question.id,
            question: question.question,
            type: question.type,
            userAnswer: answer?.value,
            correctAnswer: question.correct_answer,
            isCorrect,
            points,
            maxPoints: question.points,
            explanation: question.explanation,
            flagged: this.flaggedQuestions.has(question.id),
            topic: question.topic
          });
        });

        sectionResults[sectionKey] = {
          name: section.name,
          score: sectionScore,
          maxScore: sectionMax,
          correct: sectionCorrect,
          total: section.questions_data.length,
          percentage: sectionMax > 0 ? (sectionScore / sectionMax) * 100 : 0,
          timeSpent: sectionTime
        };

        totalScore += sectionScore;
        maxScore += sectionMax;
        correctCount += sectionCorrect;
      });
    } else if (this.currentQuiz) {
      // Calculate for quiz
      let sectionScore = 0;
      let sectionMax = 0;

      this.currentQuiz.questions.forEach((question, index) => {
        const answer = this.answers[question.id];
        const isCorrect = answer ? this.checkAnswer(question, answer.value) : false;
        const points = isCorrect ? question.points : 0;

        sectionScore += points;
        sectionMax += question.points;
        if (isCorrect) correctCount++;

        if (!topicPerformance[this.currentQuiz.topic]) {
          topicPerformance[this.currentQuiz.topic] = { correct: 0, total: 0 };
        }
        topicPerformance[this.currentQuiz.topic].total++;
        if (isCorrect) topicPerformance[this.currentQuiz.topic].correct++;

        questionResults.push({
          id: question.id,
          question: question.question,
          type: 'multiple_choice',
          userAnswer: answer?.value,
          correctAnswer: question.correct_answer,
          isCorrect,
          points,
          maxPoints: question.points,
          explanation: question.explanation,
          flagged: this.flaggedQuestions.has(question.id),
          topic: this.currentQuiz.topic
        });
      });

      sectionResults['quiz'] = {
        name: this.currentQuiz.title,
        score: sectionScore,
        maxScore: sectionMax,
        correct: correctCount,
        total: this.currentQuiz.questions.length,
        percentage: sectionMax > 0 ? (sectionScore / sectionMax) * 100 : 0,
        timeSpent: Math.floor((Date.now() - this.startTime) / 1000)
      };

      totalScore = sectionScore;
      maxScore = sectionMax;
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const grade = this.calculateGrade(percentage);

    return {
      testId: this.currentTest?.test_id || this.currentQuiz?.quiz_id,
      testTitle: this.currentTest?.title || this.currentQuiz?.title,
      type: this.currentTest ? 'practice_test' : 'quick_quiz',
      score: totalScore,
      maxScore,
      percentage: Math.round(percentage * 100) / 100,
      grade,
      correctCount,
      totalQuestions: this.getTotalQuestions(),
      sectionResults,
      topicPerformance,
      questionResults,
      submittedAt: new Date().toISOString()
    };
  }

  /**
   * Calculate time spent on a section
   * @param {string} sectionKey - Section identifier
   */
  calculateSectionTime(sectionKey) {
    const startTime = this.sectionStartTimes[sectionKey];
    if (!startTime) return 0;

    // If this is the current section, calculate up to now
    const sections = Object.keys(this.currentTest?.sections || {});
    const currentSectionIndex = sections.indexOf(this.currentSection);
    const sectionIndex = sections.indexOf(sectionKey);

    if (sectionIndex === currentSectionIndex) {
      return Math.floor((Date.now() - startTime) / 1000);
    }

    // For completed sections, we would need to track end time
    // For now, return estimated time
    return Math.floor((Date.now() - startTime) / 1000);
  }

  /**
   * Calculate letter grade
   * @param {number} percentage - Score percentage
   */
  calculateGrade(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  /**
   * Save test results to localStorage
   * @param {Object} results - Test results
   */
  saveTestResults(results) {
    const history = this.getTestHistory();
    history.push(results);
    
    // Keep only last 50 attempts
    if (history.length > 50) {
      history.shift();
    }

    localStorage.setItem('testHistory', JSON.stringify(history));
    
    // Also save to attempt history for this specific test
    const testKey = `testHistory_${results.testId}`;
    const testHistory = JSON.parse(localStorage.getItem(testKey) || '[]');
    testHistory.push({
      date: results.submittedAt,
      score: results.percentage,
      grade: results.grade
    });
    localStorage.setItem(testKey, JSON.stringify(testHistory));
  }

  /**
   * Get test history from localStorage
   */
  getTestHistory() {
    return JSON.parse(localStorage.getItem('testHistory') || '[]');
  }

  /**
   * Get attempt history for a specific test
   * @param {string} testId - Test ID
   */
  getTestAttemptHistory(testId) {
    return JSON.parse(localStorage.getItem(`testHistory_${testId}`) || '[]');
  }

  /**
   * Save current test state for recovery
   */
  saveTestState() {
    if (!this.currentTest && !this.currentQuiz) return;

    const state = {
      currentTest: this.currentTest,
      currentQuiz: this.currentQuiz,
      answers: this.answers,
      flaggedQuestions: Array.from(this.flaggedQuestions),
      startTime: this.startTime,
      timeRemaining: this.timeRemaining,
      currentSection: this.currentSection,
      currentQuestionIndex: this.currentQuestionIndex,
      testConfig: this.testConfig,
      sectionStartTimes: this.sectionStartTimes
    };

    localStorage.setItem('currentTestState', JSON.stringify(state));
  }

  /**
   * Load test state from localStorage
   */
  loadTestState() {
    const saved = localStorage.getItem('currentTestState');
    if (!saved) return null;

    try {
      const state = JSON.parse(saved);
      this.currentTest = state.currentTest;
      this.currentQuiz = state.currentQuiz;
      this.answers = state.answers || {};
      this.flaggedQuestions = new Set(state.flaggedQuestions || []);
      this.startTime = state.startTime;
      this.timeRemaining = state.timeRemaining;
      this.currentSection = state.currentSection;
      this.currentQuestionIndex = state.currentQuestionIndex;
      this.testConfig = state.testConfig || {};
      this.sectionStartTimes = state.sectionStartTimes || {};

      return state;
    } catch (e) {
      console.error('Error loading test state:', e);
      return null;
    }
  }

  /**
   * Clear saved test state
   */
  clearTestState() {
    localStorage.removeItem('currentTestState');
  }

  /**
   * Resume a saved test
   */
  resumeTest() {
    const state = this.loadTestState();
    if (!state) return { success: false, message: 'No saved test to resume' };

    // Restart timer if it was timed
    if (this.testConfig.timed && this.timeRemaining > 0) {
      this.startTimer();
    }

    this.startAutoSave();

    return {
      success: true,
      test: this.currentTest,
      quiz: this.currentQuiz,
      section: this.currentSection,
      questionIndex: this.currentQuestionIndex
    };
  }

  /**
   * Pause the test (if not in strict mode)
   */
  pauseTest() {
    if (this.testConfig.strictMode) {
      return { success: false, message: 'Cannot pause in strict exam mode' };
    }

    clearInterval(this.timerInterval);
    clearInterval(this.autoSaveInterval);
    this.saveTestState();

    return { success: true };
  }

  /**
   * Get weak topics based on performance
   */
  getWeakTopics() {
    const history = this.getTestHistory();
    const topicStats = {};

    history.forEach(result => {
      Object.entries(result.topicPerformance || {}).forEach(([topic, perf]) => {
        if (!topicStats[topic]) {
          topicStats[topic] = { correct: 0, total: 0 };
        }
        topicStats[topic].correct += perf.correct;
        topicStats[topic].total += perf.total;
      });
    });

    // Calculate accuracy for each topic and filter weak ones
    return Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
        total: stats.total
      }))
      .filter(t => t.accuracy < 70 && t.total >= 3)
      .sort((a, b) => a.accuracy - b.accuracy);
  }

  /**
   * Get strong topics based on performance
   */
  getStrongTopics() {
    const history = this.getTestHistory();
    const topicStats = {};

    history.forEach(result => {
      Object.entries(result.topicPerformance || {}).forEach(([topic, perf]) => {
        if (!topicStats[topic]) {
          topicStats[topic] = { correct: 0, total: 0 };
        }
        topicStats[topic].correct += perf.correct;
        topicStats[topic].total += perf.total;
      });
    });

    return Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
        total: stats.total
      }))
      .filter(t => t.accuracy >= 80 && t.total >= 3)
      .sort((a, b) => b.accuracy - a.accuracy);
  }

  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type: 'success', 'warning', 'danger', 'info'
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    const container = document.getElementById('toast-container') || document.body;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Get summary statistics
   */
  getStatistics() {
    const history = this.getTestHistory();
    
    if (history.length === 0) {
      return {
        totalTests: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0
      };
    }

    const scores = history.map(h => h.percentage);
    const totalTime = history.reduce((sum, h) => sum + (h.timeSpent || 0), 0);

    return {
      totalTests: history.length,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      bestScore: Math.max(...scores),
      totalTimeSpent: totalTime,
      recentTrend: this.calculateTrend(scores.slice(-5))
    };
  }

  /**
   * Calculate performance trend
   * @param {number[]} scores - Recent scores
   */
  calculateTrend(scores) {
    if (scores.length < 2) return 'stable';
    
    const first = scores[0];
    const last = scores[scores.length - 1];
    const diff = last - first;

    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }
}

// Create global instance
const testEngine = new TestEngine();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  testEngine.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestEngine;
}
