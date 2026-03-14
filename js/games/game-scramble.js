/**
 * Game 1: SQL Keywords Scramble (Lecture 2)
 * Unscramble SQL keywords with timed rounds
 */

class SQLScrambleGame {
    constructor() {
        this.id = 'sql-scramble';
        this.name = 'SQL Keywords Scramble';
        this.description = 'Unscramble SQL keywords against the clock!';
        this.lecture = 2;
        this.score = 0;
        this.round = 1;
        this.maxRounds = 10;
        this.timeLeft = 30;
        this.timer = null;
        this.currentWord = null;
        this.streak = 0;
        this.isPlaying = false;
        
        // Difficulty settings
        this.difficultySettings = {
            easy: { time: 45, hints: true },
            medium: { time: 30, hints: false },
            hard: { time: 20, hints: false }
        };
        
        // SQL keywords by difficulty
        this.keywords = {
            easy: [
                { word: 'SELECT', hint: 'Retrieve data from database' },
                { word: 'FROM', hint: 'Specify table name' },
                { word: 'WHERE', hint: 'Filter rows' },
                { word: 'ORDER', hint: 'Sort results' },
                { word: 'BY', hint: 'Used with ORDER' },
                { word: 'INSERT', hint: 'Add new rows' },
                { word: 'INTO', hint: 'Specify destination' },
                { word: 'VALUES', hint: 'Specify data to insert' }
            ],
            medium: [
                { word: 'UPDATE', hint: 'Modify existing data' },
                { word: 'DELETE', hint: 'Remove rows' },
                { word: 'JOIN', hint: 'Combine tables' },
                { word: 'GROUP', hint: 'Aggregate data' },
                { word: 'HAVING', hint: 'Filter groups' },
                { word: 'COUNT', hint: 'Count rows' },
                { word: 'SUM', hint: 'Add values' },
                { word: 'AVG', hint: 'Average values' }
            ],
            hard: [
                { word: 'DISTINCT', hint: 'Remove duplicates' },
                { word: 'EXISTS', hint: 'Check for existence' },
                { word: 'UNION', hint: 'Combine results' },
                { word: 'INTERSECT', hint: 'Common rows' },
                { word: 'EXCEPT', hint: 'Difference operator' },
                { word: 'COALESCE', hint: 'Return first non-null' },
                { word: 'CASE', hint: 'Conditional logic' },
                { word: 'WHEN', hint: 'Condition in CASE' }
            ]
        };
        
        this.usedWords = [];
    }

    init(container) {
        this.container = container;
        this.renderStartScreen();
    }

    renderStartScreen() {
        this.container.innerHTML = `
            <div class="game-container scramble-game">
                <div class="game-header">
                    <h2>🔤 ${this.name}</h2>
                    <p class="game-description">${this.description}</p>
                    <div class="lecture-badge">Lecture ${this.lecture}</div>
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
                        <span class="stat-value">${this.maxRounds}</span>
                        <span class="stat-label">Rounds</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value" id="preview-time">30s</span>
                        <span class="stat-label">Per Round</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value">${gamesEngine.getHighScore(this.id)}</span>
                        <span class="stat-label">High Score</span>
                    </div>
                </div>
                
                <button class="start-btn" id="start-scramble">Start Game</button>
                
                <div class="instructions">
                    <h4>How to Play:</h4>
                    <ul>
                        <li>Unscramble the SQL keyword shown</li>
                        <li>Type your answer and press Enter</li>
                        <li>Faster answers = more points</li>
                        <li>Build a streak for bonus points!</li>
                    </ul>
                </div>
            </div>
        `;
        
        this.attachStartListeners();
    }

    attachStartListeners() {
        // Difficulty selection
        this.container.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.container.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                gamesEngine.difficulty = e.target.dataset.diff;
                gamesEngine.saveSettings();
                
                // Update preview time
                const settings = this.difficultySettings[gamesEngine.difficulty];
                document.getElementById('preview-time').textContent = settings.time + 's';
            });
        });
        
        // Start button
        document.getElementById('start-scramble').addEventListener('click', () => this.start());
    }

    start() {
        this.score = 0;
        this.round = 1;
        this.streak = 0;
        this.usedWords = [];
        this.isPlaying = true;
        gamesEngine.trackGamePlayed(this.id);
        
        const settings = this.difficultySettings[gamesEngine.difficulty];
        this.timeLeft = settings.time;
        
        this.renderGameScreen();
        this.nextRound();
    }

    renderGameScreen() {
        this.container.innerHTML = `
            <div class="game-container scramble-game active">
                <div class="game-hud">
                    <div class="hud-item">
                        <span class="hud-label">Score</span>
                        <span class="hud-value" id="score">0</span>
                    </div>
                    <div class="hud-item">
                        <span class="hud-label">Round</span>
                        <span class="hud-value" id="round">1/${this.maxRounds}</span>
                    </div>
                    <div class="hud-item">
                        <span class="hud-label">Streak</span>
                        <span class="hud-value" id="streak">0</span>
                    </div>
                    <div class="hud-item timer">
                        <span class="hud-label">Time</span>
                        <span class="hud-value" id="timer">${this.timeLeft}</span>
                    </div>
                </div>
                
                <div class="scramble-display">
                    <div class="scrambled-word" id="scrambled-word"></div>
                    <div class="hint" id="hint"></div>
                </div>
                
                <div class="input-area">
                    <input type="text" id="answer-input" placeholder="Type your answer..." autocomplete="off">
                    <button id="submit-answer">Submit</button>
                </div>
                
                <div class="feedback" id="feedback"></div>
                
                <div class="progress-bar">
                    <div class="progress-fill" id="progress"></div>
                </div>
            </div>
        `;
        
        // Attach input listeners
        const input = document.getElementById('answer-input');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
        input.addEventListener('input', () => gamesEngine.playSound('click'));
        
        document.getElementById('submit-answer').addEventListener('click', () => this.checkAnswer());
        
        // Focus input
        setTimeout(() => input.focus(), 100);
    }

    nextRound() {
        if (this.round > this.maxRounds) {
            this.endGame();
            return;
        }
        
        // Get available keywords for current difficulty
        const availableKeywords = this.keywords[gamesEngine.difficulty];
        const unusedKeywords = availableKeywords.filter(k => !this.usedWords.includes(k.word));
        
        // If all used, reset
        if (unusedKeywords.length === 0) {
            this.usedWords = [];
        }
        
        // Select random word
        const keywordPool = unusedKeywords.length > 0 ? unusedKeywords : availableKeywords;
        const keyword = keywordPool[Math.floor(Math.random() * keywordPool.length)];
        this.currentWord = keyword;
        this.usedWords.push(keyword.word);
        
        // Scramble the word
        const scrambled = this.scrambleWord(keyword.word);
        
        // Reset timer
        const settings = this.difficultySettings[gamesEngine.difficulty];
        this.timeLeft = settings.time;
        
        // Update display
        document.getElementById('scrambled-word').textContent = scrambled;
        document.getElementById('hint').textContent = settings.hints ? `Hint: ${keyword.hint}` : '';
        document.getElementById('hint').style.display = settings.hints ? 'block' : 'none';
        document.getElementById('round').textContent = `${this.round}/${this.maxRounds}`;
        document.getElementById('answer-input').value = '';
        document.getElementById('feedback').innerHTML = '';
        document.getElementById('answer-input').focus();
        
        // Start timer
        this.startTimer();
        
        // Update progress bar
        const progress = ((this.round - 1) / this.maxRounds) * 100;
        document.getElementById('progress').style.width = progress + '%';
    }

    scrambleWord(word) {
        let scrambled;
        do {
            const chars = word.split('');
            for (let i = chars.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [chars[i], chars[j]] = [chars[j], chars[i]];
            }
            scrambled = chars.join('');
        } while (scrambled === word); // Ensure it's actually scrambled
        return scrambled;
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        const timerEl = document.getElementById('timer');
        timerEl.classList.remove('warning', 'danger');
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            timerEl.textContent = this.timeLeft;
            
            // Visual warnings
            if (this.timeLeft <= 10) {
                timerEl.classList.add('danger');
                gamesEngine.playSound('tick');
            } else if (this.timeLeft <= 20) {
                timerEl.classList.add('warning');
            }
            
            if (this.timeLeft <= 0) {
                this.timeOut();
            }
        }, 1000);
    }

    checkAnswer() {
        const input = document.getElementById('answer-input');
        const answer = input.value.trim().toUpperCase();
        
        if (!answer) return;
        
        clearInterval(this.timer);
        
        const isCorrect = answer === this.currentWord.word;
        
        if (isCorrect) {
            // Calculate points
            const timeBonus = Math.floor(this.timeLeft / 5) * 10;
            const streakBonus = this.streak * 5;
            const points = 100 + timeBonus + streakBonus;
            
            this.score += points;
            this.streak++;
            
            gamesEngine.playSound('correct');
            this.showFeedback(true, `+${points} points!`, `Time bonus: +${timeBonus}, Streak: x${this.streak}`);
            
            // Check achievements
            if (this.streak >= 5) {
                gamesEngine.unlockAchievement('streak');
            }
        } else {
            this.streak = 0;
            gamesEngine.playSound('incorrect');
            this.showFeedback(false, `Incorrect!`, `The answer was: ${this.currentWord.word}`);
        }
        
        // Update HUD
        document.getElementById('score').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
        
        // Next round after delay
        this.round++;
        setTimeout(() => this.nextRound(), 1500);
    }

    timeOut() {
        clearInterval(this.timer);
        this.streak = 0;
        
        gamesEngine.playSound('lose');
        this.showFeedback(false, 'Time\'s up!', `The answer was: ${this.currentWord.word}`);
        
        document.getElementById('streak').textContent = this.streak;
        
        this.round++;
        setTimeout(() => this.nextRound(), 2000);
    }

    showFeedback(isCorrect, main, sub) {
        const feedback = document.getElementById('feedback');
        feedback.innerHTML = `
            <div class="feedback-content ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="feedback-icon">${isCorrect ? '✓' : '✗'}</div>
                <div class="feedback-main">${main}</div>
                <div class="feedback-sub">${sub}</div>
            </div>
        `;
        
        gamesEngine.animate(feedback.querySelector('.feedback-content'), 'feedback-pop');
    }

    endGame() {
        this.isPlaying = false;
        clearInterval(this.timer);
        
        const isHighScore = gamesEngine.saveHighScore(this.id, this.score);
        const isPerfect = this.score >= this.maxRounds * 150;
        
        // Unlock achievements
        gamesEngine.unlockAchievement('firstWin');
        if (isPerfect) gamesEngine.unlockAchievement('perfectScore');
        if (isHighScore) gamesEngine.unlockAchievement('highScorer');
        if (gamesEngine.difficulty === 'hard') gamesEngine.unlockAchievement('expert');
        
        gamesEngine.playSound('win');
        
        this.container.innerHTML = `
            <div class="game-container scramble-game ended">
                <div class="game-over">
                    <h2>🎉 Game Complete!</h2>
                    
                    <div class="final-score">
                        <span class="score-label">Final Score</span>
                        <span class="score-value">${this.score}</span>
                        ${isHighScore ? '<span class="high-score-badge">NEW HIGH SCORE!</span>' : ''}
                    </div>
                    
                    <div class="game-summary">
                        <div class="summary-stat">
                            <span class="summary-label">Difficulty</span>
                            <span class="summary-value">${gamesEngine.difficulty.toUpperCase()}</span>
                        </div>
                        <div class="summary-stat">
                            <span class="summary-label">Accuracy</span>
                            <span class="summary-value">${Math.round((this.score / (this.maxRounds * 150)) * 100)}%</span>
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

// Register game
window.SQLScrambleGame = SQLScrambleGame;
