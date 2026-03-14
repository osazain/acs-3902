/**
 * Section B Quiz Module
 * Handles quiz functionality for EERD questions
 */

class SectionBQuiz {
    constructor() {
        this.questions = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.userAnswers = [];
        this.filteredQuestions = [];
        
        this.init();
    }

    async init() {
        await this.loadQuestions();
        this.setupEventListeners();
    }

    async loadQuestions() {
        try {
            const response = await fetch('../js/data/sectionB.json');
            const data = await response.json();
            this.questions = data.questions;
            this.filteredQuestions = [...this.questions];
        } catch (error) {
            console.error('Error loading questions:', error);
            // Fallback to embedded questions if fetch fails
            this.loadFallbackQuestions();
        }
    }

    loadFallbackQuestions() {
        // Minimal fallback in case JSON load fails
        this.questions = [
            {
                id: "fallback_001",
                topic: "chen_notation",
                question: "In Chen notation, what does a rectangle represent?",
                options: ["A weak entity", "A relationship", "A strong entity", "An attribute"],
                correct: 2,
                explanation: "In Chen notation, rectangles represent strong entities.",
                points: 15
            }
        ];
        this.filteredQuestions = [...this.questions];
    }

    setupEventListeners() {
        const startBtn = document.getElementById('start-quiz-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startQuiz());
        }

        const topicFilter = document.getElementById('topic-filter');
        const difficultyFilter = document.getElementById('difficulty-filter');
        
        if (topicFilter) {
            topicFilter.addEventListener('change', () => this.filterQuestions());
        }
        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', () => this.filterQuestions());
        }
    }

    filterQuestions() {
        const topic = document.getElementById('topic-filter').value;
        const difficulty = document.getElementById('difficulty-filter').value;

        this.filteredQuestions = this.questions.filter(q => {
            const topicMatch = topic === 'all' || q.topic === topic || q.topic.includes(topic);
            const difficultyMatch = difficulty === 'all' || q.difficulty === difficulty;
            return topicMatch && difficultyMatch;
        });
    }

    startQuiz() {
        this.filterQuestions();
        
        if (this.filteredQuestions.length === 0) {
            alert('No questions match your filters. Please try different options.');
            return;
        }

        this.currentQuestion = 0;
        this.score = 0;
        this.userAnswers = [];
        
        // Shuffle questions
        this.filteredQuestions = this.shuffleArray([...this.filteredQuestions]);
        
        this.showQuestion();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    showQuestion() {
        const container = document.getElementById('quiz-container');
        const q = this.filteredQuestions[this.currentQuestion];
        
        const progress = ((this.currentQuestion + 1) / this.filteredQuestions.length) * 100;
        
        container.innerHTML = `
            <div class="quiz-active">
                <div class="quiz-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">Question ${this.currentQuestion + 1} of ${this.filteredQuestions.length}</span>
                </div>
                
                <div class="question-card">
                    <div class="question-header">
                        <span class="question-topic">${this.formatTopic(q.topic)}</span>
                        <span class="question-difficulty ${q.difficulty}">${q.difficulty}</span>
                        <span class="question-points">${q.points} pts</span>
                    </div>
                    
                    ${q.diagram ? `<div class="question-diagram" id="diagram-${q.id}"></div>` : ''}
                    
                    <h3 class="question-text">${q.question}</h3>
                    
                    <div class="answer-options">
                        ${q.options.map((opt, i) => `
                            <button class="option-btn" onclick="sectionBQuiz.selectAnswer(${i})">
                                <span class="option-letter">${String.fromCharCode(65 + i)}</span>
                                <span class="option-text">${opt}</span>
                            </button>
                        `).join('')}
                    </div>
                    
                    <div id="feedback-area" class="feedback-area"></div>
                    
                    <div class="question-actions">
                        <button id="next-btn" class="btn-next" style="display:none" onclick="sectionBQuiz.nextQuestion()">
                            ${this.currentQuestion < this.filteredQuestions.length - 1 ? 'Next →' : 'Finish'}
                        </button>
                    </div>
                </div>
                
                <div class="quiz-sidebar">
                    <div class="score-display">
                        <span class="score-label">Score</span>
                        <span class="score-value">${this.score}</span>
                    </div>
                    <div class="question-nav">
                        ${this.filteredQuestions.map((_, i) => `
                            <div class="nav-dot ${i === this.currentQuestion ? 'active' : i < this.currentQuestion ? 'answered' : ''}">
                                ${i + 1}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Load diagram if present
        if (q.diagram && typeof ERDDiagrams !== 'undefined' && ERDDiagrams[q.diagram]) {
            const diagramContainer = document.getElementById(`diagram-${q.id}`);
            if (diagramContainer) {
                const diagram = ERDDiagrams[q.diagram];
                diagramContainer.innerHTML = diagram.svg || `<pre>${diagram.ascii}</pre>`;
            }
        }

        // Disable all option buttons initially for feedback
        this.selectedAnswer = null;
    }

    selectAnswer(index) {
        if (this.selectedAnswer !== null) return; // Already answered
        
        this.selectedAnswer = index;
        const q = this.filteredQuestions[this.currentQuestion];
        const isCorrect = index === q.correct;
        
        // Update UI
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach((btn, i) => {
            btn.disabled = true;
            if (i === q.correct) {
                btn.classList.add('correct');
            } else if (i === index && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        // Show feedback
        const feedbackArea = document.getElementById('feedback-area');
        feedbackArea.innerHTML = `
            <div class="feedback ${isCorrect ? 'success' : 'error'}">
                <div class="feedback-icon">${isCorrect ? '✓' : '✗'}</div>
                <div class="feedback-content">
                    <strong>${isCorrect ? 'Correct!' : 'Incorrect'}</strong>
                    <p>${q.explanation}</p>
                </div>
            </div>
        `;

        // Update score
        if (isCorrect) {
            this.score += q.points;
            document.querySelector('.score-value').textContent = this.score;
        }

        // Store answer
        this.userAnswers.push({
            questionId: q.id,
            selected: index,
            correct: q.correct,
            isCorrect: isCorrect,
            points: isCorrect ? q.points : 0
        });

        // Show next button
        document.getElementById('next-btn').style.display = 'inline-block';
    }

    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion >= this.filteredQuestions.length) {
            this.showResults();
        } else {
            this.showQuestion();
        }
    }

    showResults() {
        const container = document.getElementById('quiz-container');
        const totalPoints = this.filteredQuestions.reduce((sum, q) => sum + q.points, 0);
        const percentage = Math.round((this.score / totalPoints) * 100);
        
        const correctCount = this.userAnswers.filter(a => a.isCorrect).length;
        const incorrectCount = this.userAnswers.length - correctCount;

        let grade = 'F';
        let gradeClass = 'fail';
        if (percentage >= 90) { grade = 'A'; gradeClass = 'excellent'; }
        else if (percentage >= 80) { grade = 'B'; gradeClass = 'good'; }
        else if (percentage >= 70) { grade = 'C'; gradeClass = 'average'; }
        else if (percentage >= 60) { grade = 'D'; gradeClass = 'pass'; }

        container.innerHTML = `
            <div class="quiz-results">
                <h2>🎉 Quiz Complete!</h2>
                
                <div class="results-summary">
                    <div class="grade-circle ${gradeClass}">
                        <span class="grade">${grade}</span>
                        <span class="percent">${percentage}%</span>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-num">${correctCount}</span>
                            <span class="stat-label">Correct</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-num">${incorrectCount}</span>
                            <span class="stat-label">Incorrect</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-num">${this.score}</span>
                            <span class="stat-label">Points Earned</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-num">${totalPoints}</span>
                            <span class="stat-label">Total Points</span>
                        </div>
                    </div>
                </div>
                
                <div class="results-message">
                    ${this.getResultsMessage(percentage)}
                </div>
                
                <div class="topic-breakdown">
                    <h3>Performance by Topic</h3>
                    ${this.getTopicBreakdown()}
                </div>
                
                <div class="results-actions">
                    <button class="btn-primary" onclick="sectionBQuiz.startQuiz()">Retake Quiz</button>
                    <button class="btn-secondary" onclick="sectionBQuiz.reviewAnswers()">Review Answers</button>
                    <button class="btn-secondary" onclick="location.reload()">Back to Menu</button>
                </div>
            </div>
        `;
    }

    getResultsMessage(percentage) {
        if (percentage >= 90) return "🌟 Outstanding! You're an EERD master! Ready for the midterm!";
        if (percentage >= 80) return "👍 Great job! You have a solid understanding of EERD concepts.";
        if (percentage >= 70) return "📚 Good work! Review the topics you missed and try again.";
        if (percentage >= 60) return "💪 Keep practicing! Focus on understanding the notation differences.";
        return "📖 Keep studying! Use the Study Mode and Simulators to reinforce concepts.";
    }

    getTopicBreakdown() {
        const topicStats = {};
        
        this.userAnswers.forEach((answer, i) => {
            const q = this.filteredQuestions[i];
            const topic = q.topic;
            
            if (!topicStats[topic]) {
                topicStats[topic] = { correct: 0, total: 0, points: 0, totalPoints: 0 };
            }
            
            topicStats[topic].total++;
            topicStats[topic].totalPoints += q.points;
            if (answer.isCorrect) {
                topicStats[topic].correct++;
                topicStats[topic].points += q.points;
            }
        });

        return Object.entries(topicStats).map(([topic, stats]) => {
            const pct = Math.round((stats.correct / stats.total) * 100);
            const topicName = this.formatTopic(topic);
            return `
                <div class="topic-item">
                    <span class="topic-name">${topicName}</span>
                    <div class="topic-bar">
                        <div class="topic-fill" style="width: ${pct}%; background: ${pct >= 70 ? '#4caf50' : pct >= 50 ? '#ff9800' : '#f44336'}"></div>
                    </div>
                    <span class="topic-pct">${pct}%</span>
                </div>
            `;
        }).join('');
    }

    reviewAnswers() {
        const container = document.getElementById('quiz-container');
        
        container.innerHTML = `
            <div class="review-mode">
                <h2>📋 Review Your Answers</h2>
                <div class="review-list">
                    ${this.userAnswers.map((answer, i) => {
                        const q = this.filteredQuestions[i];
                        return `
                            <div class="review-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
                                <div class="review-header">
                                    <span class="review-num">${i + 1}</span>
                                    <span class="review-status">${answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
                                    <span class="review-points">${answer.points}/${q.points} pts</span>
                                </div>
                                <div class="review-question">${q.question}</div>
                                <div class="review-answer">
                                    <div class="your-answer ${answer.isCorrect ? 'correct' : 'incorrect'}">
                                        <strong>Your answer:</strong> ${q.options[answer.selected]}
                                    </div>
                                    ${!answer.isCorrect ? `
                                        <div class="correct-answer">
                                            <strong>Correct answer:</strong> ${q.options[q.correct]}
                                        </div>
                                    ` : ''}
                                    <div class="review-explanation">
                                        <strong>Explanation:</strong> ${q.explanation}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="review-actions">
                    <button class="btn-primary" onclick="sectionBQuiz.showResults()">Back to Results</button>
                </div>
            </div>
        `;
    }

    formatTopic(topic) {
        const topicNames = {
            'chen_notation': 'Chen Notation',
            'ie_notation': 'IE Notation',
            'superclass_subclass': 'Superclass/Subclass',
            'weak_entities': 'Weak Entities',
            'role_names': 'Role Names',
            'notation_comparison': 'Notation Comparison',
            'application': 'Application'
        };
        return topicNames[topic] || topic.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
}

// Initialize quiz when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('quiz-container')) {
        window.sectionBQuiz = new SectionBQuiz();
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionBQuiz;
}
