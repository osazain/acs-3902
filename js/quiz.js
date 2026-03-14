/**
 * Quiz Engine for Midterm 2 Study Platform
 * Handles loading questions, quiz flow, scoring, and results
 */

const QuizApp = (function() {
    // Private state
    let state = {
        allQuestions: [],
        filteredQuestions: [],
        currentQuiz: [],
        currentQuestionIndex: 0,
        userAnswers: {},
        flaggedQuestions: new Set(),
        questionStartTime: null,
        questionTimes: {},
        quizStartTime: null,
        isQuizActive: false,
        currentSection: null
    };

    // DOM Elements cache
    let elements = {};

    /**
     * Initialize the quiz application
     * @param {string} section - The section identifier (e.g., 'sectionA')
     */
    function init(section) {
        state.currentSection = section;
        cacheElements();
        bindEvents();
        loadQuestions(section);
        updateAvailableCount();
        loadUserStats();
    }

    /**
     * Cache DOM element references
     */
    function cacheElements() {
        elements = {
            // Setup panel
            setupPanel: document.getElementById('quiz-setup'),
            topicCheckboxes: document.querySelectorAll('[data-topic]'),
            difficultyCheckboxes: document.querySelectorAll('[data-difficulty]'),
            questionCountRadios: document.querySelectorAll('input[name="question-count"]'),
            availableCount: document.getElementById('available-count'),
            maxXp: document.getElementById('max-xp'),
            startQuizBtn: document.getElementById('start-quiz-btn'),

            // Quiz panel
            quizPanel: document.getElementById('quiz-interface'),
            currentQNum: document.getElementById('current-q-num'),
            totalQNum: document.getElementById('total-q-num'),
            quizTimer: document.getElementById('quiz-timer'),
            progressFill: document.getElementById('progress-fill'),
            correctSoFar: document.getElementById('correct-so-far'),
            incorrectSoFar: document.getElementById('incorrect-so-far'),
            flaggedSoFar: document.getElementById('flagged-so-far'),

            // Question card
            questionCard: document.getElementById('question-card'),
            qTopic: document.getElementById('q-topic'),
            qDifficulty: document.getElementById('q-difficulty'),
            qPoints: document.getElementById('q-points'),
            qText: document.getElementById('q-text'),
            sqlExampleContainer: document.getElementById('sql-example-container'),
            sqlExample: document.getElementById('sql-example'),
            optionsContainer: document.getElementById('options-container'),
            flagBtn: document.getElementById('flag-btn'),

            // Feedback
            feedbackSection: document.getElementById('feedback-section'),
            feedbackHeader: document.getElementById('feedback-header'),
            explanationText: document.getElementById('explanation-text'),

            // Navigation
            prevBtn: document.getElementById('prev-btn'),
            submitBtn: document.getElementById('submit-btn'),
            nextBtn: document.getElementById('next-btn'),
            finishBtn: document.getElementById('finish-btn'),
            navigatorDots: document.getElementById('navigator-dots'),

            // Results panel
            resultsPanel: document.getElementById('results-panel'),
            resultsMessage: document.getElementById('results-message'),
            scorePercent: document.getElementById('score-percent'),
            scoreFraction: document.getElementById('score-fraction'),
            scoreCircleFill: document.getElementById('score-circle-fill'),
            xpEarned: document.getElementById('xp-earned'),
            topicBreakdown: document.getElementById('topic-breakdown'),
            timeTaken: document.getElementById('time-taken'),
            avgTime: document.getElementById('avg-time'),
            finalCorrect: document.getElementById('final-correct'),
            finalIncorrect: document.getElementById('final-incorrect'),
            finalFlagged: document.getElementById('final-flagged'),
            reviewSection: document.getElementById('review-section'),
            reviewList: document.getElementById('review-list'),

            // Action buttons
            reviewWrongBtn: document.getElementById('review-wrong-btn'),
            retryMissedBtn: document.getElementById('retry-missed-btn'),
            newQuizBtn: document.getElementById('new-quiz-btn'),

            // User stats
            xpDisplay: document.getElementById('xp-display'),
            levelDisplay: document.getElementById('level-display')
        };
    }

    /**
     * Bind event listeners
     */
    function bindEvents() {
        // Setup events
        elements.startQuizBtn?.addEventListener('click', startQuiz);
        
        elements.topicCheckboxes?.forEach(cb => {
            cb.addEventListener('change', updateAvailableCount);
        });
        
        elements.difficultyCheckboxes?.forEach(cb => {
            cb.addEventListener('change', updateAvailableCount);
        });

        // Quiz navigation
        elements.prevBtn?.addEventListener('click', goToPrevious);
        elements.submitBtn?.addEventListener('click', submitAnswer);
        elements.nextBtn?.addEventListener('click', goToNext);
        elements.finishBtn?.addEventListener('click', finishQuiz);
        elements.flagBtn?.addEventListener('click', toggleFlag);

        // Results actions
        elements.reviewWrongBtn?.addEventListener('click', showReview);
        elements.retryMissedBtn?.addEventListener('click', retryMissed);
        elements.newQuizBtn?.addEventListener('click', resetQuiz);
    }

    /**
     * Load questions from JSON file
     */
    async function loadQuestions(section) {
        try {
            const response = await fetch(`../js/data/${section}.json`);
            const data = await response.json();
            state.allQuestions = data.questions || [];
            state.filteredQuestions = [...state.allQuestions];
            updateAvailableCount();
        } catch (error) {
            console.error('Error loading questions:', error);
            // Fallback: use embedded data
            state.allQuestions = getFallbackQuestions();
            state.filteredQuestions = [...state.allQuestions];
            updateAvailableCount();
        }
    }

    /**
     * Get fallback questions if JSON fails to load
     */
    function getFallbackQuestions() {
        // Minimal fallback - in practice, the JSON should load
        return [
            {
                id: 'fallback_001',
                topic: 'transactions',
                difficulty: 'easy',
                question: 'What is the purpose of BEGIN TRANSACTION?',
                options: [
                    'A) To end a transaction',
                    'B) To start a new transaction block',
                    'C) To rollback changes',
                    'D) To save data to disk'
                ],
                correct: 1,
                explanation: 'BEGIN TRANSACTION marks the start of a transaction block.',
                sql_example: null,
                points: 10
            }
        ];
    }

    /**
     * Update the available question count based on filters
     */
    function updateAvailableCount() {
        const selectedTopics = Array.from(elements.topicCheckboxes || [])
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        
        const selectedDifficulties = Array.from(elements.difficultyCheckboxes || [])
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        state.filteredQuestions = state.allQuestions.filter(q => {
            return selectedTopics.includes(q.topic) && 
                   selectedDifficulties.includes(q.difficulty);
        });

        const count = state.filteredQuestions.length;
        const maxXp = state.filteredQuestions.reduce((sum, q) => sum + (q.points || 10), 0);

        if (elements.availableCount) {
            elements.availableCount.textContent = count;
        }
        if (elements.maxXp) {
            elements.maxXp.textContent = maxXp;
        }

        // Disable start button if no questions
        if (elements.startQuizBtn) {
            elements.startQuizBtn.disabled = count === 0;
            elements.startQuizBtn.textContent = count === 0 ? 'No Questions Available' : '🚀 Start Quiz';
        }
    }

    /**
     * Start the quiz with selected filters
     */
    function startQuiz() {
        const countRadio = document.querySelector('input[name="question-count"]:checked');
        let questionCount = countRadio ? parseInt(countRadio.value) || 'all' : 20;
        
        if (questionCount === 'all' || questionCount > state.filteredQuestions.length) {
            questionCount = state.filteredQuestions.length;
        }

        // Shuffle and select questions
        state.currentQuiz = shuffleArray([...state.filteredQuestions]).slice(0, questionCount);
        state.currentQuestionIndex = 0;
        state.userAnswers = {};
        state.flaggedQuestions.clear();
        state.questionTimes = {};
        state.quizStartTime = Date.now();
        state.isQuizActive = true;

        // Show quiz panel
        elements.setupPanel?.classList.add('hidden');
        elements.quizPanel?.classList.remove('hidden');
        elements.resultsPanel?.classList.add('hidden');

        // Update UI
        elements.totalQNum.textContent = state.currentQuiz.length;
        createNavigatorDots();
        showQuestion(0);
        startTimer();
    }

    /**
     * Display a question
     */
    function showQuestion(index) {
        state.currentQuestionIndex = index;
        const question = state.currentQuiz[index];
        state.questionStartTime = Date.now();

        // Update question info
        elements.qTopic.textContent = formatTopic(question.topic);
        elements.qDifficulty.textContent = capitalize(question.difficulty);
        elements.qDifficulty.className = `difficulty-badge ${question.difficulty}`;
        elements.qPoints.textContent = question.points || 10;
        elements.qText.textContent = question.question;

        // Show/hide SQL example
        if (question.sql_example) {
            elements.sqlExampleContainer.classList.remove('hidden');
            elements.sqlExample.textContent = question.sql_example;
            // Re-highlight
            if (window.Prism) {
                Prism.highlightElement(elements.sqlExample);
            }
        } else {
            elements.sqlExampleContainer.classList.add('hidden');
        }

        // Generate options
        renderOptions(question);

        // Reset feedback
        elements.feedbackSection.classList.add('hidden');

        // Update navigation buttons
        updateNavigation();

        // Update progress
        updateProgress();

        // Update flag button
        updateFlagButton();

        // Update navigator
        updateNavigatorDots();

        // Restore answer if previously answered
        restoreAnswer();
    }

    /**
     * Render answer options
     */
    function renderOptions(question) {
        elements.optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionEl = document.createElement('div');
            optionEl.className = 'option';
            optionEl.dataset.index = index;
            optionEl.innerHTML = `
                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${escapeHtml(option.substring(3))}</span>
            `;
            optionEl.addEventListener('click', () => selectOption(index));
            elements.optionsContainer.appendChild(optionEl);
        });
    }

    /**
     * Handle option selection
     */
    function selectOption(index) {
        if (state.userAnswers[state.currentQuestionIndex] !== undefined) {
            return; // Already answered
        }

        // Remove previous selection
        elements.optionsContainer.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Select new option
        const selected = elements.optionsContainer.querySelector(`[data-index="${index}"]`);
        selected?.classList.add('selected');
    }

    /**
     * Submit the selected answer
     */
    function submitAnswer() {
        const selected = elements.optionsContainer.querySelector('.option.selected');
        if (!selected) {
            shakeElement(elements.optionsContainer);
            return;
        }

        const answerIndex = parseInt(selected.dataset.index);
        const question = state.currentQuiz[state.currentQuestionIndex];
        const isCorrect = answerIndex === question.correct;

        // Record answer
        state.userAnswers[state.currentQuestionIndex] = {
            answer: answerIndex,
            correct: isCorrect,
            question: question
        };

        // Record time
        const timeSpent = Date.now() - state.questionStartTime;
        state.questionTimes[state.currentQuestionIndex] = timeSpent;

        // Show feedback
        showFeedback(isCorrect, question);

        // Update option styling
        updateOptionStyles(answerIndex, question.correct);

        // Update stats
        updateQuizStats();

        // Update navigation buttons
        elements.submitBtn.classList.add('hidden');
        
        if (state.currentQuestionIndex < state.currentQuiz.length - 1) {
            elements.nextBtn.classList.remove('hidden');
        } else {
            elements.finishBtn.classList.remove('hidden');
        }

        // Award XP if correct
        if (isCorrect && typeof Gamification !== 'undefined') {
            Gamification.addXP(question.points || 10);
        }

        // Save progress
        saveProgress();
    }

    /**
     * Show feedback after answering
     */
    function showFeedback(isCorrect, question) {
        elements.feedbackSection.classList.remove('hidden');
        elements.feedbackSection.className = `feedback-section ${isCorrect ? 'correct' : 'incorrect'}`;
        
        elements.feedbackHeader.innerHTML = isCorrect 
            ? '<span class="feedback-icon">✓</span><span class="feedback-text">Correct!</span>'
            : `<span class="feedback-icon">✗</span><span class="feedback-text">Incorrect. The correct answer was: ${String.fromCharCode(65 + question.correct)}</span>`;
        
        elements.explanationText.textContent = question.explanation;
    }

    /**
     * Update option styling after answer
     */
    function updateOptionStyles(selectedIndex, correctIndex) {
        elements.optionsContainer.querySelectorAll('.option').forEach((opt, index) => {
            opt.classList.remove('selected');
            opt.style.pointerEvents = 'none';
            
            if (index === correctIndex) {
                opt.classList.add('correct');
            } else if (index === selectedIndex && index !== correctIndex) {
                opt.classList.add('incorrect');
            }
        });
    }

    /**
     * Restore previous answer when navigating
     */
    function restoreAnswer() {
        const previous = state.userAnswers[state.currentQuestionIndex];
        if (previous === undefined) return;

        updateOptionStyles(previous.answer, previous.question.correct);
        showFeedback(previous.correct, previous.question);

        elements.submitBtn.classList.add('hidden');
        if (state.currentQuestionIndex < state.currentQuiz.length - 1) {
            elements.nextBtn.classList.remove('hidden');
        } else {
            elements.finishBtn.classList.remove('hidden');
        }
    }

    /**
     * Navigate to previous question
     */
    function goToPrevious() {
        if (state.currentQuestionIndex > 0) {
            showQuestion(state.currentQuestionIndex - 1);
        }
    }

    /**
     * Navigate to next question
     */
    function goToNext() {
        if (state.currentQuestionIndex < state.currentQuiz.length - 1) {
            showQuestion(state.currentQuestionIndex + 1);
        }
    }

    /**
     * Update navigation button states
     */
    function updateNavigation() {
        elements.prevBtn.disabled = state.currentQuestionIndex === 0;
        elements.submitBtn.classList.remove('hidden');
        elements.nextBtn.classList.add('hidden');
        elements.finishBtn.classList.add('hidden');
    }

    /**
     * Update progress indicators
     */
    function updateProgress() {
        const progress = ((state.currentQuestionIndex + 1) / state.currentQuiz.length) * 100;
        elements.progressFill.style.width = `${progress}%`;
        elements.currentQNum.textContent = state.currentQuestionIndex + 1;
    }

    /**
     * Update quiz stats display
     */
    function updateQuizStats() {
        let correct = 0, incorrect = 0;
        Object.values(state.userAnswers).forEach(ans => {
            if (ans.correct) correct++;
            else incorrect++;
        });
        
        elements.correctSoFar.textContent = correct;
        elements.incorrectSoFar.textContent = incorrect;
        elements.flaggedSoFar.textContent = state.flaggedQuestions.size;
    }

    /**
     * Toggle flag for current question
     */
    function toggleFlag() {
        const index = state.currentQuestionIndex;
        if (state.flaggedQuestions.has(index)) {
            state.flaggedQuestions.delete(index);
        } else {
            state.flaggedQuestions.add(index);
        }
        updateFlagButton();
        updateQuizStats();
    }

    /**
     * Update flag button appearance
     */
    function updateFlagButton() {
        if (state.flaggedQuestions.has(state.currentQuestionIndex)) {
            elements.flagBtn.classList.add('flagged');
            elements.flagBtn.textContent = '🚩';
        } else {
            elements.flagBtn.classList.remove('flagged');
            elements.flagBtn.textContent = '🏳️';
        }
    }

    /**
     * Create navigator dots
     */
    function createNavigatorDots() {
        elements.navigatorDots.innerHTML = '';
        state.currentQuiz.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'nav-dot';
            dot.dataset.index = index;
            dot.addEventListener('click', () => {
                // Only allow navigation to answered questions or current
                if (index <= Math.max(...Object.keys(state.userAnswers).map(Number)) + 1) {
                    showQuestion(index);
                }
            });
            elements.navigatorDots.appendChild(dot);
        });
    }

    /**
     * Update navigator dots
     */
    function updateNavigatorDots() {
        elements.navigatorDots.querySelectorAll('.nav-dot').forEach((dot, index) => {
            dot.className = 'nav-dot';
            if (index === state.currentQuestionIndex) {
                dot.classList.add('current');
            } else if (state.userAnswers[index] !== undefined) {
                dot.classList.add(state.userAnswers[index].correct ? 'correct' : 'incorrect');
            } else if (state.flaggedQuestions.has(index)) {
                dot.classList.add('flagged');
            }
        });
    }

    /**
     * Start the quiz timer
     */
    function startTimer() {
        setInterval(() => {
            if (!state.isQuizActive) return;
            const elapsed = Math.floor((Date.now() - state.quizStartTime) / 1000);
            elements.quizTimer.textContent = formatTime(elapsed);
        }, 1000);
    }

    /**
     * Finish the quiz and show results
     */
    function finishQuiz() {
        state.isQuizActive = false;
        
        elements.quizPanel.classList.add('hidden');
        elements.resultsPanel.classList.remove('hidden');

        // Calculate results
        const results = calculateResults();
        displayResults(results);

        // Save to storage
        saveQuizResults(results);
    }

    /**
     * Calculate quiz results
     */
    function calculateResults() {
        let correct = 0, incorrect = 0, totalXP = 0, earnedXP = 0;
        const topicStats = {};
        const wrongQuestions = [];

        Object.entries(state.userAnswers).forEach(([index, ans]) => {
            const q = ans.question;
            
            // Topic stats
            if (!topicStats[q.topic]) {
                topicStats[q.topic] = { correct: 0, total: 0 };
            }
            topicStats[q.topic].total++;

            if (ans.correct) {
                correct++;
                earnedXP += q.points || 10;
                topicStats[q.topic].correct++;
            } else {
                incorrect++;
                wrongQuestions.push({
                    index: parseInt(index),
                    question: q,
                    userAnswer: ans.answer
                });
            }
            totalXP += q.points || 10;
        });

        const totalTime = Date.now() - state.quizStartTime;
        const answeredCount = Object.keys(state.userAnswers).length;
        const avgTime = answeredCount > 0 ? totalTime / answeredCount : 0;

        return {
            total: state.currentQuiz.length,
            answered: answeredCount,
            correct,
            incorrect,
            totalXP,
            earnedXP,
            percentage: answeredCount > 0 ? Math.round((correct / answeredCount) * 100) : 0,
            topicStats,
            wrongQuestions,
            totalTime,
            avgTime,
            flagged: state.flaggedQuestions.size
        };
    }

    /**
     * Display results
     */
    function displayResults(results) {
        // Score circle
        const circumference = 283;
        const offset = circumference - (results.percentage / 100) * circumference;
        elements.scoreCircleFill.style.strokeDashoffset = offset;
        elements.scorePercent.textContent = `${results.percentage}%`;
        elements.scoreFraction.textContent = `${results.correct}/${results.answered}`;

        // XP
        elements.xpEarned.textContent = results.earnedXP;

        // Message
        let message = 'Keep practicing!';
        if (results.percentage >= 90) message = '🌟 Outstanding! You\'re a database master!';
        else if (results.percentage >= 80) message = '🎉 Great job! You know your stuff!';
        else if (results.percentage >= 70) message = '👍 Good work! Room for improvement.';
        else if (results.percentage >= 60) message = '💪 Not bad! Keep studying.';
        elements.resultsMessage.textContent = message;

        // Topic breakdown
        elements.topicBreakdown.innerHTML = '';
        Object.entries(results.topicStats).forEach(([topic, stats]) => {
            const percentage = Math.round((stats.correct / stats.total) * 100);
            const row = document.createElement('div');
            row.className = 'topic-row';
            row.innerHTML = `
                <span class="topic-name">${formatTopic(topic)}</span>
                <div class="topic-bar-container">
                    <div class="topic-bar" style="width: ${percentage}%"></div>
                </div>
                <span class="topic-score ${percentage >= 70 ? 'good' : percentage >= 50 ? 'ok' : 'poor'}">
                    ${stats.correct}/${stats.total}
                </span>
            `;
            elements.topicBreakdown.appendChild(row);
        });

        // Stats
        elements.timeTaken.textContent = formatTime(Math.floor(results.totalTime / 1000));
        elements.avgTime.textContent = formatTime(Math.floor(results.avgTime / 1000));
        elements.finalCorrect.textContent = results.correct;
        elements.finalIncorrect.textContent = results.incorrect;
        elements.finalFlagged.textContent = results.flagged;

        // Store wrong questions for review
        state.wrongQuestions = results.wrongQuestions;
    }

    /**
     * Show review of incorrect answers
     */
    function showReview() {
        elements.reviewSection.classList.remove('hidden');
        elements.reviewList.innerHTML = '';

        if (!state.wrongQuestions || state.wrongQuestions.length === 0) {
            elements.reviewList.innerHTML = '<p class="no-wrong">🎉 No incorrect answers to review! Great job!</p>';
            return;
        }

        state.wrongQuestions.forEach(({ question, userAnswer }) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            reviewItem.innerHTML = `
                <div class="review-header">
                    <span class="topic-badge">${formatTopic(question.topic)}</span>
                    <span class="difficulty-badge ${question.difficulty}">${capitalize(question.difficulty)}</span>
                </div>
                <p class="review-question">${question.question}</p>
                <div class="review-answers">
                    <div class="your-answer incorrect">
                        <span>Your answer: ${String.fromCharCode(65 + userAnswer)}</span>
                    </div>
                    <div class="correct-answer">
                        <span>Correct answer: ${String.fromCharCode(65 + question.correct)}</span>
                    </div>
                </div>
                <div class="review-explanation">
                    <strong>Explanation:</strong> ${question.explanation}
                </div>
                ${question.sql_example ? `
                    <div class="review-sql">
                        <pre><code class="language-sql">${escapeHtml(question.sql_example)}</code></pre>
                    </div>
                ` : ''}
            `;
            elements.reviewList.appendChild(reviewItem);
        });

        // Highlight code
        if (window.Prism) {
            Prism.highlightAllUnder(elements.reviewList);
        }

        elements.reviewSection.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Retry only the missed questions
     */
    function retryMissed() {
        if (!state.wrongQuestions || state.wrongQuestions.length === 0) {
            alert('No questions to retry!');
            return;
        }

        state.currentQuiz = state.wrongQuestions.map(w => w.question);
        state.currentQuestionIndex = 0;
        state.userAnswers = {};
        state.flaggedQuestions.clear();
        state.questionTimes = {};
        state.quizStartTime = Date.now();
        state.isQuizActive = true;

        elements.resultsPanel.classList.add('hidden');
        elements.quizPanel.classList.remove('hidden');

        elements.totalQNum.textContent = state.currentQuiz.length;
        createNavigatorDots();
        showQuestion(0);
    }

    /**
     * Reset and return to setup
     */
    function resetQuiz() {
        state.isQuizActive = false;
        elements.resultsPanel.classList.add('hidden');
        elements.setupPanel.classList.remove('hidden');
        elements.reviewSection?.classList.add('hidden');
        updateAvailableCount();
    }

    /**
     * Save quiz progress to localStorage
     */
    function saveProgress() {
        if (typeof Storage !== 'undefined') {
            const progress = {
                section: state.currentSection,
                answers: state.userAnswers,
                currentIndex: state.currentQuestionIndex,
                questionIds: state.currentQuiz.map(q => q.id),
                timestamp: Date.now()
            };
            localStorage.setItem('quiz_progress', JSON.stringify(progress));
        }
    }

    /**
     * Save quiz results
     */
    function saveQuizResults(results) {
        if (typeof Storage !== 'undefined' && typeof Gamification !== 'undefined') {
            const history = JSON.parse(localStorage.getItem('quiz_history') || '[]');
            history.push({
                section: state.currentSection,
                results: results,
                timestamp: Date.now()
            });
            localStorage.setItem('quiz_history', JSON.stringify(history.slice(-20)));
            
            // Clear progress
            localStorage.removeItem('quiz_progress');
            
            // Update user stats
            Gamification.addXP(results.earnedXP);
        }
    }

    /**
     * Load user stats
     */
    function loadUserStats() {
        if (typeof Gamification !== 'undefined') {
            const stats = Gamification.getStats();
            if (elements.xpDisplay) {
                elements.xpDisplay.textContent = stats.xp;
            }
            if (elements.levelDisplay) {
                elements.levelDisplay.textContent = stats.level;
            }
        }
    }

    // Utility functions
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function formatTopic(topic) {
        const topicNames = {
            'transactions': 'Transactions',
            'union': 'UNION Operations',
            'cte': 'CTEs',
            'triggers': 'Triggers',
            'indexes': 'Indexes',
            'relational_algebra': 'Relational Algebra'
        };
        return topicNames[topic] || topic;
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function shakeElement(el) {
        el?.classList.add('shake');
        setTimeout(() => el?.classList.remove('shake'), 500);
    }

    // Public API
    return {
        init,
        loadQuestions,
        startQuiz,
        submitAnswer,
        goToPrevious,
        goToNext,
        finishQuiz,
        toggleFlag,
        resetQuiz
    };
})();

// Make available globally
window.QuizApp = QuizApp;
