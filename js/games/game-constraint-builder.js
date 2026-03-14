/**
 * Game 3: Constraint Builder (Lecture 4)
 * Build CREATE TABLE statements with correct constraints
 */

class ConstraintBuilderGame {
    constructor() {
        this.id = 'constraint-builder';
        this.name = 'Constraint Builder';
        this.description = 'Build valid CREATE TABLE statements with constraints!';
        this.lecture = 4;
        this.score = 0;
        this.round = 1;
        this.maxRounds = 6;
        this.timeLeft = 0;
        this.timer = null;
        this.isPlaying = false;
        
        this.difficultySettings = {
            easy: { time: 120, hints: true },
            medium: { time: 90, hints: false },
            hard: { time: 60, hints: false }
        };
        
        this.constraints = [
            { name: 'PRIMARY KEY', symbol: '🔑', description: 'Unique identifier', template: 'PRIMARY KEY' },
            { name: 'FOREIGN KEY', symbol: '🔗', description: 'References another table', template: 'FOREIGN KEY ({col}) REFERENCES {ref}' },
            { name: 'NOT NULL', symbol: '✓', description: 'Required value', template: 'NOT NULL' },
            { name: 'UNIQUE', symbol: '★', description: 'No duplicates', template: 'UNIQUE' },
            { name: 'CHECK', symbol: '⚡', description: 'Value condition', template: 'CHECK ({condition})' },
            { name: 'DEFAULT', symbol: '📝', description: 'Default value', template: 'DEFAULT {value}' }
        ];
        
        this.dataTypes = ['INT', 'VARCHAR(50)', 'DATE', 'DECIMAL(10,2)', 'BOOLEAN', 'TEXT'];
        
        this.scenarios = [
            {
                tableName: 'Students',
                description: 'Student information with unique student ID, required name, and email must be unique',
                columns: [
                    { name: 'student_id', type: 'INT', constraints: ['PRIMARY KEY'] },
                    { name: 'name', type: 'VARCHAR(50)', constraints: ['NOT NULL'] },
                    { name: 'email', type: 'VARCHAR(50)', constraints: ['UNIQUE', 'NOT NULL'] }
                ]
            },
            {
                tableName: 'Enrollments',
                description: 'Links students to courses with grade validation (0-100)',
                columns: [
                    { name: 'enrollment_id', type: 'INT', constraints: ['PRIMARY KEY'] },
                    { name: 'student_id', type: 'INT', constraints: ['FOREIGN KEY', 'NOT NULL'] },
                    { name: 'course_id', type: 'INT', constraints: ['FOREIGN KEY', 'NOT NULL'] },
                    { name: 'grade', type: 'DECIMAL(10,2)', constraints: ['CHECK'] }
                ],
                foreignKeys: [
                    { col: 'student_id', ref: 'Students(student_id)' },
                    { col: 'course_id', ref: 'Courses(course_id)' }
                ]
            },
            {
                tableName: 'Products',
                description: 'Products with auto-generated ID, required name, price must be positive',
                columns: [
                    { name: 'product_id', type: 'INT', constraints: ['PRIMARY KEY'] },
                    { name: 'name', type: 'VARCHAR(50)', constraints: ['NOT NULL'] },
                    { name: 'price', type: 'DECIMAL(10,2)', constraints: ['CHECK', 'NOT NULL'] },
                    { name: 'category', type: 'VARCHAR(50)', constraints: ['DEFAULT'] }
                ],
                defaultValue: { col: 'category', value: "'Uncategorized'" }
            },
            {
                tableName: 'Employees',
                description: 'Employee records with department reference and salary constraints',
                columns: [
                    { name: 'emp_id', type: 'INT', constraints: ['PRIMARY KEY'] },
                    { name: 'name', type: 'VARCHAR(50)', constraints: ['NOT NULL'] },
                    { name: 'dept_id', type: 'INT', constraints: ['FOREIGN KEY'] },
                    { name: 'salary', type: 'DECIMAL(10,2)', constraints: ['CHECK', 'NOT NULL'] }
                ],
                foreignKeys: [
                    { col: 'dept_id', ref: 'Departments(dept_id)' }
                ]
            },
            {
                tableName: 'Orders',
                description: 'Order tracking with status validation and default date',
                columns: [
                    { name: 'order_id', type: 'INT', constraints: ['PRIMARY KEY'] },
                    { name: 'customer_id', type: 'INT', constraints: ['FOREIGN KEY', 'NOT NULL'] },
                    { name: 'order_date', type: 'DATE', constraints: ['DEFAULT'] },
                    { name: 'status', type: 'VARCHAR(20)', constraints: ['CHECK'] }
                ],
                foreignKeys: [
                    { col: 'customer_id', ref: 'Customers(customer_id)' }
                ],
                defaultValue: { col: 'order_date', value: 'CURRENT_DATE' }
            },
            {
                tableName: 'Books',
                description: 'Library books with ISBN as unique identifier and publication year check',
                columns: [
                    { name: 'isbn', type: 'VARCHAR(20)', constraints: ['PRIMARY KEY'] },
                    { name: 'title', type: 'VARCHAR(100)', constraints: ['NOT NULL'] },
                    { name: 'author', type: 'VARCHAR(50)', constraints: ['NOT NULL'] },
                    { name: 'year_published', type: 'INT', constraints: ['CHECK'] }
                ]
            }
        ];
    }

    init(container) {
        this.container = container;
        this.renderStartScreen();
    }

    renderStartScreen() {
        this.container.innerHTML = `
            <div class="game-container constraint-builder-game">
                <div class="game-header">
                    <h2>🏗️ ${this.name}</h2>
                    <p class="game-description">${this.description}</p>
                    <div class="lecture-badge">Lecture ${this.lecture}</div>
                </div>
                
                <div class="constraints-reference">
                    <h4>Available Constraints:</h4>
                    <div class="constraints-grid">
                        ${this.constraints.map(c => `
                            <div class="constraint-ref">
                                <span class="constraint-symbol">${c.symbol}</span>
                                <span class="constraint-name">${c.name}</span>
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
                        <span class="stat-value">${this.maxRounds}</span>
                        <span class="stat-label">Tables</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value" id="preview-time">90s</span>
                        <span class="stat-label">Per Table</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value">${gamesEngine.getHighScore(this.id)}</span>
                        <span class="stat-label">High Score</span>
                    </div>
                </div>
                
                <button class="start-btn" id="start-constraint">Start Building</button>
                
                <div class="instructions">
                    <h4>How to Play:</h4>
                    <ul>
                        <li>Read the table requirements</li>
                        <li>Drag constraints to the correct columns</li>
                        <li>Build valid CREATE TABLE statements</li>
                        <li>All constraints must be correctly placed!</li>
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
                document.getElementById('preview-time').textContent = settings.time + 's';
            });
        });
        
        document.getElementById('start-constraint').addEventListener('click', () => this.start());
    }

    start() {
        this.score = 0;
        this.round = 1;
        this.isPlaying = true;
        gamesEngine.trackGamePlayed(this.id);
        
        const settings = this.difficultySettings[gamesEngine.difficulty];
        this.timeLeft = settings.time;
        
        this.renderGameScreen();
        this.loadScenario();
        this.startTimer();
    }

    renderGameScreen() {
        this.container.innerHTML = `
            <div class="game-container constraint-builder-game active">
                <div class="game-hud">
                    <div class="hud-item">
                        <span class="hud-label">Score</span>
                        <span class="hud-value" id="score">0</span>
                    </div>
                    <div class="hud-item">
                        <span class="hud-label">Table</span>
                        <span class="hud-value" id="round">1/${this.maxRounds}</span>
                    </div>
                    <div class="hud-item timer">
                        <span class="hud-label">Time</span>
                        <span class="hud-value" id="timer">${this.timeLeft}</span>
                    </div>
                </div>
                
                <div class="builder-area">
                    <div class="scenario-panel">
                        <h4 id="table-name"></h4>
                        <p id="table-description"></p>
                    </div>
                    
                    <div class="constraints-pool" id="constraints-pool">
                        <h5>Drag constraints to columns:</h5>
                        <div class="draggable-constraints">
                            ${this.constraints.map(c => `
                                <div class="draggable-constraint" draggable="true" data-constraint="${c.name}">
                                    <span class="constraint-icon">${c.symbol}</span>
                                    <span>${c.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="table-builder" id="table-builder">
                        <!-- Columns will be inserted here -->
                    </div>
                    
                    <div class="sql-preview">
                        <h5>SQL Preview:</h5>
                        <pre id="sql-preview"><code>CREATE TABLE ...</code></pre>
                    </div>
                </div>
                
                <div class="builder-actions">
                    <button class="validate-btn" id="validate-btn">Validate Schema</button>
                    <button class="reset-btn" id="reset-btn">Reset</button>
                </div>
                
                <div class="feedback-area" id="feedback"></div>
            </div>
        `;
        
        this.attachBuilderListeners();
    }

    attachBuilderListeners() {
        // Drag and drop for constraints
        let draggedConstraint = null;
        
        this.container.querySelectorAll('.draggable-constraint').forEach(el => {
            el.addEventListener('dragstart', (e) => {
                draggedConstraint = e.target.dataset.constraint;
                e.target.classList.add('dragging');
            });
            
            el.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
        });
        
        // Drop zones
        this.container.addEventListener('dragover', (e) => {
            if (e.target.classList.contains('constraint-drop-zone')) {
                e.preventDefault();
                e.target.classList.add('drag-over');
            }
        });
        
        this.container.addEventListener('dragleave', (e) => {
            if (e.target.classList.contains('constraint-drop-zone')) {
                e.target.classList.remove('drag-over');
            }
        });
        
        this.container.addEventListener('drop', (e) => {
            if (e.target.classList.contains('constraint-drop-zone')) {
                e.preventDefault();
                e.target.classList.remove('drag-over');
                
                const colIndex = parseInt(e.target.dataset.colIndex);
                this.addConstraintToColumn(colIndex, draggedConstraint);
            }
        });
        
        // Button listeners
        document.getElementById('validate-btn').addEventListener('click', () => this.validate());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetColumns());
    }

    loadScenario() {
        const scenario = this.scenarios[this.round - 1];
        this.currentScenario = scenario;
        this.columnConstraints = scenario.columns.map(() => []);
        
        document.getElementById('table-name').textContent = `Table: ${scenario.tableName}`;
        document.getElementById('table-description').textContent = scenario.description;
        document.getElementById('round').textContent = `${this.round}/${this.maxRounds}`;
        
        this.renderColumns();
        this.updateSQLPreview();
    }

    renderColumns() {
        const builder = document.getElementById('table-builder');
        builder.innerHTML = this.currentScenario.columns.map((col, index) => `
            <div class="column-row" data-index="${index}">
                <div class="column-info">
                    <span class="col-name">${col.name}</span>
                    <span class="col-type">${col.type}</span>
                </div>
                <div class="constraint-drop-zone" data-col-index="${index}">
                    <span class="drop-hint">Drop constraints here</span>
                    <div class="applied-constraints" id="constraints-${index}"></div>
                </div>
            </div>
        `).join('');
    }

    addConstraintToColumn(colIndex, constraint) {
        // Check if constraint already applied
        if (!this.columnConstraints[colIndex].includes(constraint)) {
            this.columnConstraints[colIndex].push(constraint);
            this.renderColumnConstraints(colIndex);
            this.updateSQLPreview();
            gamesEngine.playSound('click');
        }
    }

    removeConstraint(colIndex, constraint) {
        this.columnConstraints[colIndex] = this.columnConstraints[colIndex].filter(c => c !== constraint);
        this.renderColumnConstraints(colIndex);
        this.updateSQLPreview();
        gamesEngine.playSound('click');
    }

    renderColumnConstraints(colIndex) {
        const container = document.getElementById(`constraints-${colIndex}`);
        const constraints = this.columnConstraints[colIndex];
        
        container.innerHTML = constraints.map(c => {
            const constraintDef = this.constraints.find(con => con.name === c);
            return `
                <span class="applied-constraint" data-constraint="${c}">
                    ${constraintDef ? constraintDef.symbol : ''} ${c}
                    <button class="remove-constraint" data-col="${colIndex}" data-con="${c}">×</button>
                </span>
            `;
        }).join('');
        
        // Attach remove listeners
        container.querySelectorAll('.remove-constraint').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const col = parseInt(e.target.dataset.col);
                const con = e.target.dataset.con;
                this.removeConstraint(col, con);
            });
        });
        
        // Hide hint if constraints exist
        const hint = container.parentElement.querySelector('.drop-hint');
        if (hint) {
            hint.style.display = constraints.length > 0 ? 'none' : 'block';
        }
    }

    updateSQLPreview() {
        const scenario = this.currentScenario;
        let sql = `CREATE TABLE ${scenario.tableName} (\n`;
        
        const colDefs = scenario.columns.map((col, index) => {
            let def = `    ${col.name} ${col.type}`;
            
            const constraints = this.columnConstraints[index];
            if (constraints) {
                constraints.forEach(c => {
                    if (c === 'FOREIGN KEY' && scenario.foreignKeys) {
                        const fk = scenario.foreignKeys.find(f => f.col === col.name);
                        if (fk) def += `\n        FOREIGN KEY (${col.name}) REFERENCES ${fk.ref}`;
                    } else if (c === 'DEFAULT' && scenario.defaultValue && scenario.defaultValue.col === col.name) {
                        def += ` DEFAULT ${scenario.defaultValue.value}`;
                    } else if (c === 'CHECK') {
                        if (col.name.includes('grade') || col.name.includes('price') || col.name.includes('salary')) {
                            def += ` CHECK (${col.name} >= 0)`;
                        } else if (col.name.includes('year')) {
                            def += ` CHECK (${col.name} BETWEEN 1900 AND 2100)`;
                        } else if (col.name.includes('status')) {
                            def += ` CHECK (${col.name} IN ('Pending', 'Shipped', 'Delivered'))`;
                        }
                    } else if (c !== 'FOREIGN KEY' && c !== 'DEFAULT') {
                        def += ` ${c}`;
                    }
                });
            }
            
            return def;
        });
        
        sql += colDefs.join(',\n');
        sql += '\n);';
        
        document.getElementById('sql-preview').innerHTML = `<code>${sql}</code>`;
    }

    validate() {
        let allCorrect = true;
        let correctCount = 0;
        let totalConstraints = 0;
        
        this.currentScenario.columns.forEach((col, index) => {
            const required = col.constraints.sort().join(',');
            const applied = this.columnConstraints[index].sort().join(',');
            
            totalConstraints += col.constraints.length;
            
            const colRow = document.querySelector(`.column-row[data-index="${index}"]`);
            
            if (required === applied) {
                correctCount += col.constraints.length;
                colRow.classList.add('correct');
                colRow.classList.remove('incorrect');
            } else {
                allCorrect = false;
                colRow.classList.add('incorrect');
                colRow.classList.remove('correct');
            }
        });
        
        if (allCorrect) {
            const timeBonus = Math.floor(this.timeLeft / 5) * 10;
            const points = 200 + timeBonus;
            this.score += points;
            
            gamesEngine.playSound('correct');
            this.showFeedback(true, 'Perfect!', `All constraints correctly placed! +${points} points`);
            
            document.getElementById('score').textContent = this.score;
            
            setTimeout(() => {
                this.round++;
                if (this.round <= this.maxRounds) {
                    this.loadScenario();
                } else {
                    this.endGame();
                }
            }, 2000);
        } else {
            gamesEngine.playSound('incorrect');
            const accuracy = Math.round((correctCount / totalConstraints) * 100);
            this.showFeedback(false, 'Not quite right', `${accuracy}% correct. Check highlighted columns.`);
        }
    }

    resetColumns() {
        this.columnConstraints = this.currentScenario.columns.map(() => []);
        this.currentScenario.columns.forEach((_, index) => {
            this.renderColumnConstraints(index);
        });
        this.updateSQLPreview();
        
        document.querySelectorAll('.column-row').forEach(row => {
            row.classList.remove('correct', 'incorrect');
        });
    }

    showFeedback(isCorrect, title, message) {
        const feedback = document.getElementById('feedback');
        feedback.innerHTML = `
            <div class="feedback-banner ${isCorrect ? 'correct' : 'incorrect'}">
                <span class="feedback-icon">${isCorrect ? '✓' : '✗'}</span>
                <div>
                    <strong>${title}</strong>
                    <p>${message}</p>
                </div>
            </div>
        `;
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        const timerEl = document.getElementById('timer');
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            timerEl.textContent = this.timeLeft;
            
            if (this.timeLeft <= 15) {
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
        
        const isHighScore = gamesEngine.saveHighScore(this.id, this.score);
        
        gamesEngine.unlockAchievement('firstWin');
        if (isHighScore) gamesEngine.unlockAchievement('highScorer');
        if (gamesEngine.difficulty === 'hard') gamesEngine.unlockAchievement('expert');
        
        gamesEngine.playSound('win');
        
        this.container.innerHTML = `
            <div class="game-container constraint-builder-game ended">
                <div class="game-over">
                    <h2>🎉 Building Complete!</h2>
                    
                    <div class="final-score">
                        <span class="score-label">Final Score</span>
                        <span class="score-value">${this.score}</span>
                        ${isHighScore ? '<span class="high-score-badge">NEW HIGH SCORE!</span>' : ''}
                    </div>
                    
                    <div class="game-summary">
                        <div class="summary-stat">
                            <span class="summary-label">Tables Built</span>
                            <span class="summary-value">${this.round}/${this.maxRounds}</span>
                        </div>
                        <div class="summary-stat">
                            <span class="summary-label">Time Left</span>
                            <span class="summary-value">${this.timeLeft}s</span>
                        </div>
                    </div>
                    
                    <div class="game-actions">
                        <button class="play-again-btn" id="play-again">Build Again</button>
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

window.ConstraintBuilderGame = ConstraintBuilderGame;
