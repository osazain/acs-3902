/**
 * Game 2: Join Matcher (Lecture 3)
 * Match table pairs to correct JOIN type
 */

class JoinMatcherGame {
    constructor() {
        this.id = 'join-matcher';
        this.name = 'Join Matcher';
        this.description = 'Match tables to the correct JOIN type!';
        this.lecture = 3;
        this.score = 0;
        this.round = 1;
        this.maxRounds = 8;
        this.timeLeft = 0;
        this.timer = null;
        this.currentPuzzle = null;
        this.isPlaying = false;
        this.correctAnswers = 0;
        
        this.difficultySettings = {
            easy: { time: 60, puzzles: 6 },
            medium: { time: 45, puzzles: 8 },
            hard: { time: 30, puzzles: 10 }
        };
        
        this.joinTypes = [
            { type: 'INNER JOIN', symbol: '⋈', description: 'Returns matching rows from both tables', color: '#4CAF50' },
            { type: 'LEFT JOIN', symbol: '⟕', description: 'Returns all from left, matching from right', color: '#2196F3' },
            { type: 'RIGHT JOIN', symbol: '⟖', description: 'Returns all from right, matching from left', color: '#FF9800' },
            { type: 'FULL JOIN', symbol: '⟗', description: 'Returns all rows when match in either table', color: '#9C27B0' },
            { type: 'CROSS JOIN', symbol: '×', description: 'Returns Cartesian product', color: '#F44336' }
        ];
        
        this.puzzles = [
            {
                scenario: 'Find all students who have enrolled in courses',
                tables: ['Students', 'Enrollments'],
                answer: 'INNER JOIN',
                hint: 'Only students with enrollments'
            },
            {
                scenario: 'List all employees and their departments (including employees without departments)',
                tables: ['Employees', 'Departments'],
                answer: 'LEFT JOIN',
                hint: 'All employees, some departments'
            },
            {
                scenario: 'Show all products and their categories (including unused categories)',
                tables: ['Products', 'Categories'],
                answer: 'RIGHT JOIN',
                hint: 'All categories, some products'
            },
            {
                scenario: 'Display all customers and all orders regardless of matches',
                tables: ['Customers', 'Orders'],
                answer: 'FULL JOIN',
                hint: 'Everything from both tables'
            },
            {
                scenario: 'Generate all possible color and size combinations',
                tables: ['Colors', 'Sizes'],
                answer: 'CROSS JOIN',
                hint: 'Every combination possible'
            },
            {
                scenario: 'Find books that have been borrowed by members',
                tables: ['Books', 'Borrowings'],
                answer: 'INNER JOIN',
                hint: 'Only borrowed books'
            },
            {
                scenario: 'List all projects and assigned employees (show projects even if unassigned)',
                tables: ['Projects', 'Assignments'],
                answer: 'LEFT JOIN',
                hint: 'All projects, some assignments'
            },
            {
                scenario: 'Show suppliers and their products (show all suppliers even without products)',
                tables: ['Suppliers', 'Products'],
                answer: 'LEFT JOIN',
                hint: 'All suppliers, some products'
            },
            {
                scenario: 'Find doctors and their patients (include doctors without patients)',
                tables: ['Doctors', 'Patients'],
                answer: 'LEFT JOIN',
                hint: 'All doctors, some patients'
            },
            {
                scenario: 'Get all possible store and promotion combinations for analysis',
                tables: ['Stores', 'Promotions'],
                answer: 'CROSS JOIN',
                hint: 'Every store with every promotion'
            }
        ];
        
        this.usedPuzzles = [];
    }

    init(container) {
        this.container = container;
        this.renderStartScreen();
    }

    renderStartScreen() {
        this.container.innerHTML = `
            <div class="game-container join-matcher-game">
                <div class="game-header">
                    <h2>🔗 ${this.name}</h2>
                    <p class="game-description">${this.description}</p>
                    <div class="lecture-badge">Lecture ${this.lecture}</div>
                </div>
                
                <div class="join-legend">
                    <h4>JOIN Types:</h4>
                    <div class="join-types">
                        ${this.joinTypes.map(j => `
                            <div class="join-type-card" style="border-color: ${j.color}">
                                <span class="join-symbol">${j.symbol}</span>
                                <span class="join-name">${j.type}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="difficulty-selector">
                    <label>Select Difficulty:</label>
                    <div class="difficulty-buttons">
                        <button class="diff-btn ${gamesEngine.difficulty === 'easy' ? 'active' : ''}" data-diff="easy">Easy</button>
                        <button class="diff-btn ${gamesEngine.difficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium</button>
                        <button class="diff-btn ${gamesEngine.difficulty === 'hard' ? 'active' : ''}" data-diff="hard">Hard</button>
                    </div>
                </div>
                
                <div class="game-stats-preview">
                    <div class="stat-box">
                        <span class="stat-value" id="preview-puzzles">8</span>
                        <span class="stat-label">Puzzles</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value" id="preview-time">45s</span>
                        <span class="stat-label">Total Time</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value">${gamesEngine.getHighScore(this.id)}</span>
                        <span class="stat-label">High Score</span>
                    </div>
                </div>
                
                <button class="start-btn" id="start-join">Start Game</button>
                
                <div class="instructions">
                    <h4>How to Play:</h4>
                    <ul>
                        <li>Read the scenario carefully</li>
                        <li>Choose the correct JOIN type</li>
                        <li>Speed matters - answer quickly for bonus points!</li>
                        <li>Watch for hints in the scenarios</li>
                    </ul>
                </div>
            </div>
        `;
        
        this.attachStartListeners();
    }

    attachStartListeners() {
        this.container.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.container.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                gamesEngine.difficulty = e.target.dataset.diff;
                gamesEngine.saveSettings();
                
                const settings = this.difficultySettings[gamesEngine.difficulty];
                document.getElementById('preview-puzzles').textContent = settings.puzzles;
                document.getElementById('preview-time').textContent = settings.time + 's';
            });
        });
        
        document.getElementById('start-join').addEventListener('click', () => this.start());
    }

    start() {
        this.score = 0;
        this.round = 1;
        this.correctAnswers = 0;
        this.usedPuzzles = [];
        this.isPlaying = true;
        gamesEngine.trackGamePlayed(this.id);
        
        const settings = this.difficultySettings[gamesEngine.difficulty];
        this.maxRounds = settings.puzzles;
        this.timeLeft = settings.time;
        
        this.renderGameScreen();
        this.nextRound();
        this.startTimer();
    }

    renderGameScreen() {
        this.container.innerHTML = `
            <div class="game-container join-matcher-game active">
                <div class="game-hud">
                    <div class="hud-item">
                        <span class="hud-label">Score</span>
                        <span class="hud-value" id="score">0</span>
                    </div>
                    <div class="hud-item">
                        <span class="hud-label">Puzzle</span>
                        <span class="hud-value" id="round">1/${this.maxRounds}</span>
                    </div>
                    <div class="hud-item timer">
                        <span class="hud-label">Time</span>
                        <span class="hud-value" id="timer">${this.timeLeft}</span>
                    </div>
                </div>
                
                <div class="puzzle-area">
                    <div class="scenario-card">
                        <div class="scenario-label">Scenario</div>
                        <div class="scenario-text" id="scenario"></div>
                        <div class="tables-display" id="tables"></div>
                    </div>
                    
                    <div class="join-options" id="join-options"></div>
                </div>
                
                <div class="feedback-area" id="feedback"></div>
                
                <div class="progress-bar">
                    <div class="progress-fill" id="progress"></div>
                </div>
            </div>
        `;
    }

    nextRound() {
        if (this.round > this.maxRounds) {
            this.endGame();
            return;
        }
        
        // Get unused puzzle
        const unusedPuzzles = this.puzzles.filter(p => !this.usedPuzzles.includes(p.scenario));
        const puzzlePool = unusedPuzzles.length > 0 ? unusedPuzzles : this.puzzles;
        this.currentPuzzle = puzzlePool[Math.floor(Math.random() * puzzlePool.length)];
        this.usedPuzzles.push(this.currentPuzzle.scenario);
        
        // Update display
        document.getElementById('scenario').textContent = this.currentPuzzle.scenario;
        document.getElementById('round').textContent = `${this.round}/${this.maxRounds}`;
        
        // Show tables
        const tablesHtml = this.currentPuzzle.tables.map(t => 
            `<span class="table-badge">${t}</span>`
        ).join('<span class="join-arrow">↔</span>');
        document.getElementById('tables').innerHTML = tablesHtml;
        
        // Show join options
        const shuffledJoins = gamesEngine.shuffleArray([...this.joinTypes]);
        document.getElementById('join-options').innerHTML = shuffledJoins.map(j => `
            <button class="join-option" data-join="${j.type}" style="border-color: ${j.color}">
                <span class="option-symbol">${j.symbol}</span>
                <span class="option-name">${j.type}</span>
            </button>
        `).join('');
        
        // Attach listeners
        this.container.querySelectorAll('.join-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectJoin(e.target.closest('.join-option').dataset.join));
        });
        
        // Clear feedback
        document.getElementById('feedback').innerHTML = '';
        
        // Update progress
        const progress = ((this.round - 1) / this.maxRounds) * 100;
        document.getElementById('progress').style.width = progress + '%';
    }

    selectJoin(selectedJoin) {
        if (!this.isPlaying) return;
        
        const isCorrect = selectedJoin === this.currentPuzzle.answer;
        
        // Disable all buttons
        this.container.querySelectorAll('.join-option').forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.join === this.currentPuzzle.answer) {
                btn.classList.add('correct');
            } else if (btn.dataset.join === selectedJoin && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        if (isCorrect) {
            this.correctAnswers++;
            const timeBonus = Math.floor(this.timeLeft / 10) * 5;
            const points = 100 + timeBonus;
            this.score += points;
            
            gamesEngine.playSound('correct');
            this.showFeedback(true, 'Correct!', this.currentPuzzle.hint, points);
        } else {
            gamesEngine.playSound('incorrect');
            this.showFeedback(false, 'Incorrect', `The answer was: ${this.currentPuzzle.answer}`, 0);
        }
        
        document.getElementById('score').textContent = this.score;
        
        this.round++;
        setTimeout(() => this.nextRound(), 2000);
    }

    showFeedback(isCorrect, title, explanation, points) {
        const feedback = document.getElementById('feedback');
        feedback.innerHTML = `
            <div class="feedback-card ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="feedback-icon">${isCorrect ? '✓' : '✗'}</div>
                <div class="feedback-title">${title}</div>
                <div class="feedback-explanation">${explanation}</div>
                ${points > 0 ? `<div class="points-earned">+${points} points</div>` : ''}
            </div>
        `;
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        const timerEl = document.getElementById('timer');
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            timerEl.textContent = this.timeLeft;
            
            if (this.timeLeft <= 10) {
                timerEl.classList.add('danger');
            }
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    endGame() {
        this.isPlaying = false;
        clearInterval(this.timer);
        
        const accuracy = Math.round((this.correctAnswers / (this.round - 1)) * 100) || 0;
        const isHighScore = gamesEngine.saveHighScore(this.id, this.score);
        
        gamesEngine.unlockAchievement('firstWin');
        if (accuracy === 100) gamesEngine.unlockAchievement('perfectScore');
        if (isHighScore) gamesEngine.unlockAchievement('highScorer');
        if (gamesEngine.difficulty === 'hard') gamesEngine.unlockAchievement('expert');
        
        gamesEngine.playSound('win');
        
        this.container.innerHTML = `
            <div class="game-container join-matcher-game ended">
                <div class="game-over">
                    <h2>🎉 Game Complete!</h2>
                    
                    <div class="final-score">
                        <span class="score-label">Final Score</span>
                        <span class="score-value">${this.score}</span>
                        ${isHighScore ? '<span class="high-score-badge">NEW HIGH SCORE!</span>' : ''}
                    </div>
                    
                    <div class="game-summary">
                        <div class="summary-stat">
                            <span class="summary-label">Accuracy</span>
                            <span class="summary-value">${accuracy}%</span>
                        </div>
                        <div class="summary-stat">
                            <span class="summary-label">Correct</span>
                            <span class="summary-value">${this.correctAnswers}/${this.round - 1}</span>
                        </div>
                        <div class="summary-stat">
                            <span class="summary-label">Time Left</span>
                            <span class="summary-value">${this.timeLeft}s</span>
                        </div>
                    </div>
                    
                    <div class="game-actions">
                        <button class="play-again-btn" id="play-again">Play Again</button>
                        <button class="back-btn" id="back-to-games">Back to Games</button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('play-again').addEventListener('click', () => this.start());
        document.getElementById('back-to-games').addEventListener('click', () => {
            window.location.href = 'games.html';
        });
    }
}

window.JoinMatcherGame = JoinMatcherGame;
