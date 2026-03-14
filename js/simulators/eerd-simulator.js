/**
 * EERD Simulator - Interactive tools for Section B
 * Includes: Notation Converter, Subtype Validator, Weak Entity Identifier, Cardinality Reader
 */

class EERDSimulator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentMode = null;
        this.score = 0;
        this.currentQuestion = null;
    }

    // ============================================
    // MODE: Notation Converter
    // ============================================
    
    startNotationConverter() {
        this.currentMode = 'notation-converter';
        this.renderNotationConverter();
    }

    renderNotationConverter() {
        const modes = [
            { id: 'chen-to-ie', name: 'Chen → IE', desc: 'Identify elements in Chen notation' },
            { id: 'ie-to-chen', name: 'IE → Chen', desc: 'Identify elements in IE notation' },
            { id: 'cardinality-match', name: 'Cardinality Match', desc: 'Match cardinality between notations' }
        ];

        this.container.innerHTML = `
            <div class="simulator-container">
                <h3>🔄 Notation Converter</h3>
                <p class="simulator-intro">Practice identifying ERD elements in both Chen and IE notations.</p>
                
                <div class="mode-selector">
                    ${modes.map(m => `
                        <button class="mode-btn" onclick="simulator.startNotationQuiz('${m.id}')">
                            <span class="mode-name">${m.name}</span>
                            <span class="mode-desc">${m.desc}</span>
                        </button>
                    `).join('')}
                </div>
                
                <div id="notation-quiz-area"></div>
                
                <div class="notation-reference">
                    <h4>Quick Reference</h4>
                    <div class="notation-compare-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Concept</th>
                                    <th>Chen Notation</th>
                                    <th>IE Notation</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>Strong Entity</td><td>Rectangle</td><td>Rectangle (square corners)</td></tr>
                                <tr><td>Weak Entity</td><td>Double Rectangle</td><td>Rectangle (rounded corners)</td></tr>
                                <tr><td>Relationship</td><td>Diamond</td><td>Line</td></tr>
                                <tr><td>Identifying Relationship</td><td>Double Diamond</td><td>Solid Line</td></tr>
                                <tr><td>Non-Identifying Relationship</td><td>Not distinguished</td><td>Dotted Line</td></tr>
                                <tr><td>Attribute</td><td>Oval</td><td>Listed inside entity</td></tr>
                                <tr><td>Multi-valued Attribute</td><td>Double Oval</td><td>Not supported</td></tr>
                                <tr><td>Primary Key</td><td>Underlined</td><td>(PK) notation</td></tr>
                                <tr><td>Partial Key</td><td>Dashed Underline</td><td>Part of composite PK</td></tr>
                                <tr><td>Superclass/Subclass</td><td>Circle with lines</td><td>Line with circle</td></tr>
                                <tr><td>Exclusive Subtypes</td><td>Circle with 'd'</td><td>Circle with 'x'</td></tr>
                                <tr><td>Overlapping Subtypes</td><td>Circle with 'o'</td><td>Circle with 'o'</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    startNotationQuiz(quizType) {
        const quizArea = document.getElementById('notation-quiz-area');
        const questions = this.generateNotationQuestions(quizType);
        let currentQ = 0;
        let correct = 0;

        const showQuestion = () => {
            if (currentQ >= questions.length) {
                quizArea.innerHTML = `
                    <div class="quiz-complete">
                        <h4>🎉 Quiz Complete!</h4>
                        <p>You scored ${correct} out of ${questions.length}</p>
                        <button onclick="simulator.startNotationConverter()">Try Again</button>
                    </div>
                `;
                return;
            }

            const q = questions[currentQ];
            quizArea.innerHTML = `
                <div class="notation-question">
                    <div class="progress">Question ${currentQ + 1} of ${questions.length}</div>
                    <div class="diagram-container">${q.diagram}</div>
                    <div class="question-text">${q.question}</div>
                    <div class="options">
                        ${q.options.map((opt, i) => `
                            <button class="option-btn" onclick="simulator.checkNotationAnswer(${i}, ${q.correct}, this)">
                                ${opt}
                            </button>
                        `).join('')}
                    </div>
                    <div id="feedback" class="feedback"></div>
                    <button id="next-btn" class="next-btn" style="display:none" onclick="nextQuestion()">Next →</button>
                </div>
            `;
        };

        window.nextQuestion = () => {
            currentQ++;
            showQuestion();
        };

        showQuestion();
    }

    generateNotationQuestions(type) {
        const questions = {
            'chen-to-ie': [
                {
                    diagram: `<svg viewBox="0 0 200 100"><rect x="50" y="30" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/><text x="100" y="55" text-anchor="middle" font-size="14">CUSTOMER</text></svg>`,
                    question: "In Chen notation, what does this rectangle represent?",
                    options: ["A weak entity", "A relationship", "A strong entity", "An attribute"],
                    correct: 2
                },
                {
                    diagram: `<svg viewBox="0 0 200 100"><rect x="40" y="30" width="120" height="40" fill="#fff8e1" stroke="#f9a825" stroke-width="3"/><rect x="45" y="35" width="110" height="30" fill="#fff8e1" stroke="#f9a825" stroke-width="1"/><text x="100" y="55" text-anchor="middle" font-size="12">DEPENDENT</text></svg>`,
                    question: "In Chen notation, what do double rectangles indicate?",
                    options: ["A strong entity", "A weak entity", "A superclass", "A relationship"],
                    correct: 1
                },
                {
                    diagram: `<svg viewBox="0 0 200 100"><polygon points="100,30 140,55 100,80 60,55" fill="#fff3e0" stroke="#f57c00" stroke-width="2"/><text x="100" y="60" text-anchor="middle" font-size="12">places</text></svg>`,
                    question: "What does the diamond shape represent in Chen notation?",
                    options: ["An entity", "An attribute", "A relationship", "A key"],
                    correct: 2
                },
                {
                    diagram: `<svg viewBox="0 0 200 100"><ellipse cx="100" cy="55" rx="50" ry="25" fill="none" stroke="#7b1fa2" stroke-width="2"/><ellipse cx="100" cy="55" rx="43" ry="20" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="1"/><text x="100" y="60" text-anchor="middle" font-size="11">Phone</text></svg>`,
                    question: "In Chen notation, what does a double oval represent?",
                    options: ["A primary key", "A derived attribute", "A multi-valued attribute", "A composite attribute"],
                    correct: 2
                },
                {
                    diagram: `<svg viewBox="0 0 200 100"><ellipse cx="100" cy="55" rx="45" ry="25" fill="#ffebee" stroke="#c62828" stroke-width="2"/><text x="100" y="60" text-anchor="middle" font-size="12" fill="#b71c1c" text-decoration="underline" font-weight="bold">OrderID</text></svg>`,
                    question: "What does the underline indicate in Chen notation?",
                    options: ["A foreign key", "A primary key", "A partial key", "A multi-valued attribute"],
                    correct: 1
                }
            ],
            'ie-to-chen': [
                {
                    diagram: `<svg viewBox="0 0 200 100"><rect x="50" y="30" width="100" height="40" rx="12" fill="#fff8e1" stroke="#f9a825" stroke-width="2"/><text x="100" y="55" text-anchor="middle" font-size="12">LINE ITEM</text></svg>`,
                    question: "In IE notation, what do rounded corners on an entity indicate?",
                    options: ["A strong entity", "An abstract entity", "A weak entity", "A superclass"],
                    correct: 2
                },
                {
                    diagram: `<svg viewBox="0 0 300 80"><line x1="50" y1="40" x2="200" y2="40" stroke="#333" stroke-width="2"/><line x1="200" y1="30" x2="200" y2="50" stroke="#333" stroke-width="2"/><circle cx="190" cy="40" r="6" fill="none" stroke="#666" stroke-width="1.5"/><line x1="215" y1="35" x2="235" y2="40" stroke="#333" stroke-width="1.5"/><line x1="215" y1="45" x2="235" y2="40" stroke="#333" stroke-width="1.5"/><text x="130" y="30" font-size="10">Customer</text><text x="240" y="45" font-size="10">Order</text></svg>`,
                    question: "In IE notation, what does O| (circle with bar) mean?",
                    options: ["One and only one", "Zero or one", "Zero or many", "One or many"],
                    correct: 1
                },
                {
                    diagram: `<svg viewBox="0 0 300 80"><line x1="50" y1="40" x2="220" y2="40" stroke="#666" stroke-width="2" stroke-dasharray="5,3"/><line x1="220" y1="30" x2="220" y2="50" stroke="#666" stroke-width="1.5"/><circle cx="210" cy="40" r="5" fill="none" stroke="#666" stroke-width="1.5"/><line x1="235" y1="35" x2="250" y2="40" stroke="#666" stroke-width="1.5"/><line x1="235" y1="45" x2="250" y2="40" stroke="#666" stroke-width="1.5"/></svg>`,
                    question: "In IE notation, what does a DOTTED line indicate?",
                    options: ["An identifying relationship", "A non-identifying relationship", "A mandatory relationship", "A recursive relationship"],
                    correct: 1
                },
                {
                    diagram: `<svg viewBox="0 0 300 80"><line x1="50" y1="35" x2="50" y2="45" stroke="#333" stroke-width="2"/><line x1="220" y1="40" x2="250" y2="40" stroke="#666" stroke-width="1.5"/><line x1="235" y1="30" x2="250" y2="40" stroke="#333" stroke-width="2"/><line x1="235" y1="50" x2="250" y2="40" stroke="#333" stroke-width="2"/><line x1="240" y1="25" x2="255" y2="40" stroke="#333" stroke-width="2"/><line x1="240" y1="55" x2="255" y2="40" stroke="#333" stroke-width="2"/></svg>`,
                    question: "In IE notation, what does the crow's foot symbol (<) represent?",
                    options: ["One", "Zero", "Many", "Optional"],
                    correct: 2
                },
                {
                    diagram: `<svg viewBox="0 0 300 100"><line x1="150" y1="30" x2="150" y2="80" stroke="#666" stroke-width="1.5"/><circle cx="150" cy="55" r="12" fill="#fff" stroke="#666" stroke-width="1.5"/><line x1="142" y1="47" x2="158" y2="63" stroke="#666" stroke-width="1.5"/><line x1="158" y1="47" x2="142" y2="63" stroke="#666" stroke-width="1.5"/><line x1="135" y1="65" x2="80" y2="90" stroke="#666" stroke-width="1.5"/><line x1="165" y1="65" x2="220" y2="90" stroke="#666" stroke-width="1.5"/></svg>`,
                    question: "In IE notation, what does the circle with 'X' inside indicate for subtypes?",
                    options: ["Overlapping subtypes", "Exclusive subtypes", "Abstract superclass", "Mandatory participation"],
                    correct: 1
                }
            ],
            'cardinality-match': [
                {
                    diagram: `<div class="cardinality-match"><div class="side"><strong>Chen:</strong> 1:N</div><div class="arrow">↔</div><div class="side"><strong>IE:</strong> ?</div></div>`,
                    question: "What is the IE notation equivalent of Chen's 1:N?",
                    options: ["| (one bar)", "|< (bar with crow's foot)", "O| (circle with bar)", "|| (two bars)"],
                    correct: 1
                },
                {
                    diagram: `<div class="cardinality-match"><div class="side"><strong>IE:</strong> O<</div><div class="arrow">↔</div><div class="side"><strong>Chen:</strong> ?</div></div>`,
                    question: "What does O< (circle with crow's foot) mean in Chen terms?",
                    options: ["1:N (one-to-many)", "0:N or 0..* (zero to many)", "1:1 (one-to-one)", "M:N (many-to-many)"],
                    correct: 1
                },
                {
                    diagram: `<div class="cardinality-match"><div class="side"><strong>Chen:</strong> M:N</div><div class="arrow">↔</div><div class="side"><strong>IE:</strong> ?</div></div>`,
                    question: "What is the IE notation equivalent of Chen's M:N?",
                    options: ["|< on both ends", ">|< (crow's foot on both ends)", "O< on both ends", "|| on both ends"],
                    correct: 1
                }
            ]
        };
        return questions[type] || questions['chen-to-ie'];
    }

    checkNotationAnswer(selected, correct, btnElement) {
        const feedback = document.getElementById('feedback');
        const nextBtn = document.getElementById('next-btn');
        const allBtns = document.querySelectorAll('.option-btn');
        
        allBtns.forEach(btn => btn.disabled = true);
        
        if (selected === correct) {
            btnElement.classList.add('correct');
            feedback.innerHTML = '<span class="success">✓ Correct!</span>';
            this.score += 10;
        } else {
            btnElement.classList.add('incorrect');
            allBtns[correct].classList.add('correct');
            feedback.innerHTML = '<span class="error">✗ Incorrect. The correct answer is highlighted.</span>';
        }
        
        nextBtn.style.display = 'block';
    }

    // ============================================
    // MODE: Subtype Validator ("Is A" Test)
    // ============================================
    
    startSubtypeValidator() {
        this.currentMode = 'subtype-validator';
        this.renderSubtypeValidator();
    }

    renderSubtypeValidator() {
        this.container.innerHTML = `
            <div class="simulator-container">
                <h3>🧪 Subtype Validator ("Is A" Test)</h3>
                <p class="simulator-intro">Test your understanding of valid superclass/subclass relationships. 
                Does the relationship pass the "Is A" test?</p>
                
                <div class="isa-rules">
                    <h4>The "Is A" Test Rules:</h4>
                    <ul>
                        <li>✓ <strong>Valid:</strong> "House IS A Dwelling" - makes semantic sense as a type</li>
                        <li>✗ <strong>Invalid:</strong> "Active IS A Customer" - Active is a status, not a type</li>
                        <li>✗ <strong>Invalid:</strong> Subtypes should have different attributes or relationships</li>
                        <li>✓ <strong>Valid:</strong> Subtypes inherit all attributes and relationships from superclass</li>
                    </ul>
                </div>
                
                <div id="isa-quiz-area">
                    <button class="start-quiz-btn" onclick="simulator.startISAQuiz()">Start "Is A" Test Quiz</button>
                </div>
                
                <div class="isa-examples">
                    <h4>Example Classifications</h4>
                    <div class="example-grid">
                        <div class="example-card valid">
                            <span class="badge valid">✓ VALID</span>
                            <p>"Car IS A Vehicle"</p>
                            <small>A car is a specific type of vehicle</small>
                        </div>
                        <div class="example-card invalid">
                            <span class="badge invalid">✗ INVALID</span>
                            <p>"Red IS A Car"</p>
                            <small>Red is a color attribute, not a type of car</small>
                        </div>
                        <div class="example-card valid">
                            <span class="badge valid">✓ VALID</span>
                            <p>"Student IS A Person"</p>
                            <small>A student is a type of person with additional attributes</small>
                        </div>
                        <div class="example-card invalid">
                            <span class="badge invalid">✗ INVALID</span>
                            <p>"Premium IS A Customer"</p>
                            <small>Premium is typically a customer tier, not a distinct type</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    startISAQuiz() {
        const questions = [
            { statement: "House IS A Dwelling", isValid: true, explanation: "A house is a specific type of dwelling - valid subtype relationship." },
            { statement: "Condo IS A Dwelling", isValid: true, explanation: "A condo is a specific type of dwelling - valid subtype relationship." },
            { statement: "Apartment IS A Dwelling", isValid: true, explanation: "An apartment is a specific type of dwelling - valid subtype relationship." },
            { statement: "Active IS A Customer", isValid: false, explanation: "'Active' is a status/attribute, not a type of customer. Invalid." },
            { statement: "Student IS A Person", isValid: true, explanation: "A student is a type of person - valid subtype relationship." },
            { statement: "Employee IS A Person", isValid: true, explanation: "An employee is a type of person - valid subtype relationship." },
            { statement: "Verified IS A User", isValid: false, explanation: "'Verified' is a verification status, not a type of user. Invalid." },
            { statement: "Premium IS A Member", isValid: false, explanation: "'Premium' is typically a membership tier (attribute), not a distinct type. Invalid." },
            { statement: "Vehicle IS A Listing", isValid: true, explanation: "A vehicle listing is a type of marketplace listing - valid for Kijiji example." },
            { statement: "RealEstate IS A Listing", isValid: true, explanation: "A real estate listing is a type of marketplace listing - valid for Kijiji." },
            { statement: "Sedan IS A Vehicle", isValid: true, explanation: "A sedan is a specific type of vehicle - valid subtype relationship." },
            { statement: "Expensive IS A Product", isValid: false, explanation: "'Expensive' is a price classification (attribute), not a product type. Invalid." },
            { statement: "Freshman IS A Student", isValid: true, explanation: "A freshman is a type of student (by year) - can be valid depending on context." },
            { statement: "Graduated IS A Student", isValid: false, explanation: "'Graduated' is a status/alumni state, not a current student type. Invalid." },
            { statement: "Professor IS A Employee", isValid: true, explanation: "A professor is a type of university employee - valid subtype relationship." }
        ];

        let currentQ = 0;
        let correct = 0;
        const quizArea = document.getElementById('isa-quiz-area');

        const showQuestion = () => {
            if (currentQ >= questions.length) {
                quizArea.innerHTML = `
                    <div class="quiz-complete">
                        <h4>🎉 Quiz Complete!</h4>
                        <p>You scored ${correct} out of ${questions.length}</p>
                        <p class="score-message">${this.getScoreMessage(correct, questions.length)}</p>
                        <button onclick="simulator.startISAQuiz()">Try Again</button>
                    </div>
                `;
                return;
            }

            const q = questions[currentQ];
            quizArea.innerHTML = `
                <div class="isa-question">
                    <div class="progress">Question ${currentQ + 1} of ${questions.length}</div>
                    <div class="statement">"${q.statement}"</div>
                    <div class="isa-buttons">
                        <button class="isa-btn valid-btn" onclick="simulator.checkISAAnswer(true, ${q.isValid}, '${q.explanation}')">
                            ✓ VALID (Passes "Is A" test)
                        </button>
                        <button class="isa-btn invalid-btn" onclick="simulator.checkISAAnswer(false, ${q.isValid}, '${q.explanation}')">
                            ✗ INVALID (Fails "Is A" test)
                        </button>
                    </div>
                    <div id="isa-feedback" class="feedback"></div>
                    <button id="isa-next" class="next-btn" style="display:none" onclick="nextISA()">Next →</button>
                </div>
            `;
        };

        window.nextISA = () => {
            currentQ++;
            showQuestion();
        };

        showQuestion();
    }

    checkISAAnswer(selectedValid, actualValid, explanation) {
        const feedback = document.getElementById('isa-feedback');
        const nextBtn = document.getElementById('isa-next');
        const btns = document.querySelectorAll('.isa-btn');
        
        btns.forEach(btn => btn.disabled = true);
        
        if (selectedValid === actualValid) {
            feedback.innerHTML = `<span class="success">✓ Correct! ${explanation}</span>`;
            this.score += 15;
        } else {
            feedback.innerHTML = `<span class="error">✗ Incorrect. ${explanation}</span>`;
        }
        
        nextBtn.style.display = 'block';
    }

    // ============================================
    // MODE: Weak Entity Identifier
    // ============================================
    
    startWeakEntityIdentifier() {
        this.currentMode = 'weak-entity-identifier';
        this.renderWeakEntityIdentifier();
    }

    renderWeakEntityIdentifier() {
        this.container.innerHTML = `
            <div class="simulator-container">
                <h3>🔍 Weak Entity Identifier</h3>
                <p class="simulator-intro">Practice identifying weak entities, identifying relationships, and partial keys.</p>
                
                <div class="weak-entity-rules">
                    <h4>Key Concepts:</h4>
                    <div class="concept-cards">
                        <div class="concept-card">
                            <h5>Weak Entity</h5>
                            <p>Cannot be uniquely identified by its own attributes alone. Depends on another entity (owner).</p>
                            <ul>
                                <li>Chen: Double rectangle</li>
                                <li>IE: Rounded corners</li>
                            </ul>
                        </div>
                        <div class="concept-card">
                            <h5>Identifying Relationship</h5>
                            <p>Child's primary key includes the parent's primary key.</p>
                            <ul>
                                <li>Chen: Double diamond</li>
                                <li>IE: Solid line</li>
                            </ul>
                        </div>
                        <div class="concept-card">
                            <h5>Partial Key</h5>
                            <p>Identifies weak entity only within the context of its owner.</p>
                            <ul>
                                <li>Chen: Dashed underline</li>
                                <li>Logical: Part of composite PK</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="weak-entity-examples">
                    <h4>Common Weak Entity Examples</h4>
                    <div class="example-list">
                        <div class="example-item">
                            <strong>Order → Line Item</strong>
                            <p>Line Item #1 in Order #100 ≠ Line Item #1 in Order #200</p>
                            <span class="key">PK: (OrderID, LineNum)</span>
                        </div>
                        <div class="example-item">
                            <strong>Employee → Dependent</strong>
                            <p>"Mary" (John's spouse) ≠ "Mary" (Jane's spouse)</p>
                            <span class="key">PK: (EmpID, DepName)</span>
                        </div>
                        <div class="example-item">
                            <strong>Building → Room</strong>
                            <p>Room 101 in Building A ≠ Room 101 in Building B</p>
                            <span class="key">PK: (BuildingID, RoomNum)</span>
                        </div>
                    </div>
                </div>
                
                <div id="weak-entity-quiz-area">
                    <button class="start-quiz-btn" onclick="simulator.startWeakEntityQuiz()">Start Weak Entity Quiz</button>
                </div>
            </div>
        `;
    }

    startWeakEntityQuiz() {
        const scenarios = [
            {
                name: "Order / Line Item",
                diagram: "order_lineitem",
                questions: [
                    { text: "Is Line Item a weak entity?", answer: true, explanation: "Yes - Line Item cannot be uniquely identified without knowing which Order it belongs to." },
                    { text: "Is the relationship between Order and Line Item identifying?", answer: true, explanation: "Yes - Line Item's primary key includes OrderID." },
                    { text: "What is the complete primary key of Line Item?", options: ["Just LineNum", "OrderID + LineNum", "Just OrderID", "A surrogate key"], correct: 1, explanation: "The PK is composite: (OrderID, LineNum)." },
                    { text: "Is Order a weak entity?", answer: false, explanation: "No - Order has its own independent primary key (OrderID)." }
                ]
            },
            {
                name: "Customer / Rental Agreement",
                diagram: "customer_rental",
                questions: [
                    { text: "Is Rental Agreement a weak entity?", answer: false, explanation: "No - Rental Agreement has its own AgreementID and can be identified independently." },
                    { text: "Does Rental Agreement have mandatory participation with Customer?", answer: true, explanation: "Yes - A rental agreement must belong to a customer, but it's not weak because it has its own PK." },
                    { text: "What type of relationship is this in IE notation?", options: ["Identifying (solid line)", "Non-identifying (dotted line)", "Recursive", "Many-to-many"], correct: 1, explanation: "Non-identifying (dotted line) - the child has its own independent PK." }
                ]
            },
            {
                name: "Employee / Dependent",
                diagram: "employee_dependent",
                questions: [
                    { text: "Is Dependent a weak entity?", answer: true, explanation: "Yes - Dependents are identified in context of their employee (e.g., 'John's spouse')." },
                    { text: "What is the partial key (discriminator)?", options: ["EmployeeID", "DependentName", "Both", "Neither"], correct: 1, explanation: "DependentName is the partial key - it distinguishes dependents within one employee." },
                    { text: "What is the complete primary key of Dependent?", options: ["Just DependentName", "EmployeeID + DependentName", "Just EmployeeID", "A generated ID"], correct: 1, explanation: "The PK is composite: (EmployeeID, DependentName)." }
                ]
            }
        ];

        let currentScenario = 0;
        let currentQ = 0;
        let correct = 0;
        const quizArea = document.getElementById('weak-entity-quiz-area');

        const showQuestion = () => {
            if (currentScenario >= scenarios.length) {
                quizArea.innerHTML = `
                    <div class="quiz-complete">
                        <h4>🎉 Quiz Complete!</h4>
                        <p>You scored ${correct} points</p>
                        <button onclick="simulator.startWeakEntityIdentifier()">Try Again</button>
                    </div>
                `;
                return;
            }

            const scenario = scenarios[currentScenario];
            if (currentQ >= scenario.questions.length) {
                currentScenario++;
                currentQ = 0;
                showQuestion();
                return;
            }

            const q = scenario.questions[currentQ];
            
            let questionHTML = `
                <div class="weak-entity-question">
                    <div class="scenario-header">
                        <span class="scenario-name">${scenario.name}</span>
                        <span class="progress">Q ${currentQ + 1}/${scenario.questions.length}</span>
                    </div>
                    <div class="diagram-placeholder">[${scenario.diagram} diagram]</div>
                    <div class="question-text">${q.text}</div>
            `;

            if (q.options) {
                questionHTML += `<div class="options">${q.options.map((opt, i) => `
                    <button class="option-btn" onclick="simulator.checkWeakEntityAnswer(${i}, ${q.correct}, '${q.explanation}', false)">${opt}</button>
                `).join('')}</div>`;
            } else {
                questionHTML += `
                    <div class="yes-no-buttons">
                        <button class="yn-btn yes-btn" onclick="simulator.checkWeakEntityAnswer(true, ${q.answer}, '${q.explanation}', true)">Yes</button>
                        <button class="yn-btn no-btn" onclick="simulator.checkWeakEntityAnswer(false, ${q.answer}, '${q.explanation}', true)">No</button>
                    </div>
                `;
            }

            questionHTML += `
                    <div id="weak-feedback" class="feedback"></div>
                    <button id="weak-next" class="next-btn" style="display:none" onclick="nextWeakQ()">Next →</button>
                </div>
            `;

            quizArea.innerHTML = questionHTML;
        };

        window.nextWeakQ = () => {
            currentQ++;
            showQuestion();
        };

        showQuestion();
    }

    checkWeakEntityAnswer(selected, correct, explanation, isYesNo) {
        const feedback = document.getElementById('weak-feedback');
        const nextBtn = document.getElementById('weak-next');
        const btns = document.querySelectorAll('.option-btn, .yn-btn');
        
        btns.forEach(btn => btn.disabled = true);
        
        const isCorrect = isYesNo ? selected === correct : selected === correct;
        
        if (isCorrect) {
            feedback.innerHTML = `<span class="success">✓ Correct! ${explanation}</span>`;
            this.score += 20;
        } else {
            feedback.innerHTML = `<span class="error">✗ Incorrect. ${explanation}</span>`;
        }
        
        nextBtn.style.display = 'block';
    }

    // ============================================
    // MODE: Cardinality Reader
    // ============================================
    
    startCardinalityReader() {
        this.currentMode = 'cardinality-reader';
        this.renderCardinalityReader();
    }

    renderCardinalityReader() {
        this.container.innerHTML = `
            <div class="simulator-container">
                <h3>📊 Cardinality Reader</h3>
                <p class="simulator-intro">Practice reading cardinality in both Chen and IE notations.</p>
                
                <div class="cardinality-cheatsheet">
                    <h4>Cardinality Reference</h4>
                    <div class="ref-grid">
                        <div class="ref-section">
                            <h5>Chen Notation</h5>
                            <ul>
                                <li><strong>1:1</strong> - One to One</li>
                                <li><strong>1:N</strong> - One to Many</li>
                                <li><strong>M:N</strong> - Many to Many</li>
                                <li><strong>M:1</strong> - Many to One</li>
                            </ul>
                        </div>
                        <div class="ref-section">
                            <h5>IE Crow's Foot</h5>
                            <ul>
                                <li><strong>|</strong> - One and only one</li>
                                <li><strong>O</strong> - Zero</li>
                                <li><strong><</strong> - Many</li>
                                <li><strong>O|</strong> - Zero or one</li>
                                <li><strong>|<</strong> - One or many</li>
                                <li><strong>O<</strong> - Zero or many</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div id="cardinality-quiz-area">
                    <div class="cardinality-modes">
                        <button class="mode-btn" onclick="simulator.startCardinalityQuiz('chen')">Chen Notation</button>
                        <button class="mode-btn" onclick="simulator.startCardinalityQuiz('ie')">IE Notation</button>
                        <button class="mode-btn" onclick="simulator.startCardinalityQuiz('mixed')">Mixed Practice</button>
                    </div>
                </div>
            </div>
        `;
    }

    startCardinalityQuiz(type) {
        const chenQuestions = [
            { 
                diagram: `<svg viewBox="0 0 400 100"><rect x="30" y="30" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/><text x="80" y="55" text-anchor="middle" font-size="12">DEPT</text><polygon points="200,30 240,55 200,80 160,55" fill="#fff3e0" stroke="#f57c00" stroke-width="2"/><text x="140" y="25" font-size="12" font-weight="bold">1</text><text x="265" y="25" font-size="12" font-weight="bold">N</text><rect x="270" y="30" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/><text x="320" y="55" text-anchor="middle" font-size="12">EMP</text><line x1="130" y1="55" x2="160" y2="55" stroke="#666" stroke-width="1.5"/><line x1="240" y1="55" x2="270" y2="55" stroke="#666" stroke-width="1.5"/></svg>`,
                question: "What is the cardinality from DEPT to EMP?",
                options: ["1:1", "1:N", "M:N", "N:1"],
                correct: 1,
                explanation: "1:N - One department can have many employees."
            },
            {
                diagram: `<svg viewBox="0 0 400 100"><rect x="30" y="30" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/><text x="80" y="55" text-anchor="middle" font-size="12">STUDENT</text><polygon points="200,30 240,55 200,80 160,55" fill="#fff3e0" stroke="#f57c00" stroke-width="2"/><text x="130" y="25" font-size="12" font-weight="bold">M</text><text x="265" y="25" font-size="12" font-weight="bold">N</text><rect x="270" y="30" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/><text x="320" y="55" text-anchor="middle" font-size="12">COURSE</text><line x1="130" y1="55" x2="160" y2="55" stroke="#666" stroke-width="1.5"/><line x1="240" y1="55" x2="270" y2="55" stroke="#666" stroke-width="1.5"/></svg>`,
                question: "What is the cardinality between STUDENT and COURSE?",
                options: ["1:1", "1:N", "M:N", "M:1"],
                correct: 2,
                explanation: "M:N - Many students can enroll in many courses."
            }
        ];

        const ieQuestions = [
            {
                diagram: `<svg viewBox="0 0 350 100"><rect x="30" y="30" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/><text x="75" y="55" text-anchor="middle" font-size="11">CUSTOMER</text><line x1="120" y1="50" x2="220" y2="50" stroke="#666" stroke-width="1.5"/><line x1="220" y1="40" x2="220" y2="60" stroke="#333" stroke-width="2"/><circle cx="210" cy="50" r="5" fill="none" stroke="#666" stroke-width="1.5"/><line x1="225" y1="43" x2="240" y2="50" stroke="#333" stroke-width="1.5"/><line x1="225" y1="57" x2="240" y2="50" stroke="#333" stroke-width="1.5"/><rect x="245" y="30" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/><text x="290" y="55" text-anchor="middle" font-size="11">ORDER</text></svg>`,
                question: "Read the cardinality from CUSTOMER to ORDER",
                options: ["One and only one", "Zero or one", "One or many", "Zero or many"],
                correct: 3,
                explanation: "O< (zero or many) - A customer can have zero or many orders."
            },
            {
                diagram: `<svg viewBox="0 0 350 100"><rect x="30" y="30" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/><text x="75" y="55" text-anchor="middle" font-size="11">EMPLOYEE</text><line x1="120" y1="50" x2="220" y2="50" stroke="#666" stroke-width="1.5"/><line x1="220" y1="40" x2="220" y2="60" stroke="#333" stroke-width="2"/><line x1="225" y1="43" x2="240" y2="50" stroke="#333" stroke-width="1.5"/><line x1="225" y1="57" x2="240" y2="50" stroke="#333" stroke-width="1.5"/><rect x="245" y="30" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/><text x="290" y="55" text-anchor="middle" font-size="11">DEPARTMENT</text></svg>`,
                question: "Read the cardinality from EMPLOYEE to DEPARTMENT",
                options: ["One and only one", "Zero or one", "One or many", "Zero or many"],
                correct: 0,
                explanation: "| (one and only one) - An employee belongs to exactly one department."
            }
        ];

        let questions = type === 'chen' ? chenQuestions : type === 'ie' ? ieQuestions : [...chenQuestions, ...ieQuestions];
        let currentQ = 0;
        let correct = 0;
        const quizArea = document.getElementById('cardinality-quiz-area');

        const showQuestion = () => {
            if (currentQ >= questions.length) {
                quizArea.innerHTML = `
                    <div class="quiz-complete">
                        <h4>🎉 Quiz Complete!</h4>
                        <p>You scored ${correct} out of ${questions.length}</p>
                        <button onclick="simulator.startCardinalityReader()">Try Again</button>
                    </div>
                `;
                return;
            }

            const q = questions[currentQ];
            quizArea.innerHTML = `
                <div class="cardinality-question">
                    <div class="progress">Question ${currentQ + 1} of ${questions.length}</div>
                    <div class="diagram-container">${q.diagram}</div>
                    <div class="question-text">${q.question}</div>
                    <div class="options">
                        ${q.options.map((opt, i) => `
                            <button class="option-btn" onclick="simulator.checkCardinalityAnswer(${i}, ${q.correct}, '${q.explanation}')">${opt}</button>
                        `).join('')}
                    </div>
                    <div id="card-feedback" class="feedback"></div>
                    <button id="card-next" class="next-btn" style="display:none" onclick="nextCard()">Next →</button>
                </div>
            `;
        };

        window.nextCard = () => {
            currentQ++;
            showQuestion();
        };

        showQuestion();
    }

    checkCardinalityAnswer(selected, correct, explanation) {
        const feedback = document.getElementById('card-feedback');
        const nextBtn = document.getElementById('card-next');
        const btns = document.querySelectorAll('.option-btn');
        
        btns.forEach(btn => btn.disabled = true);
        
        if (selected === correct) {
            btns[selected].classList.add('correct');
            feedback.innerHTML = `<span class="success">✓ Correct! ${explanation}</span>`;
            this.score += 15;
        } else {
            btns[selected].classList.add('incorrect');
            btns[correct].classList.add('correct');
            feedback.innerHTML = `<span class="error">✗ Incorrect. ${explanation}</span>`;
        }
        
        nextBtn.style.display = 'block';
    }

    // ============================================
    // MODE: Exclusive vs Overlapping
    // ============================================
    
    startExclusiveOverlapping() {
        this.currentMode = 'exclusive-overlapping';
        this.renderExclusiveOverlapping();
    }

    renderExclusiveOverlapping() {
        this.container.innerHTML = `
            <div class="simulator-container">
                <h3>🔀 Exclusive vs Overlapping Subtypes</h3>
                <p class="simulator-intro">Practice distinguishing between exclusive (disjoint) and overlapping subtype structures.</p>
                
                <div class="subtype-comparison">
                    <div class="subtype-type">
                        <h4>Exclusive (Disjoint)</h4>
                        <div class="notation-example">
                            <p><strong>Chen:</strong> Circle with 'd'</p>
                            <p><strong>IE:</strong> Circle with 'x'</p>
                        </div>
                        <div class="meaning">
                            Entity can be <strong>ONLY ONE</strong> subtype
                            <p class="example">Example: Dwelling = House OR Condo OR Apartment (not multiple)</p>
                        </div>
                    </div>
                    <div class="subtype-type">
                        <h4>Overlapping</h4>
                        <div class="notation-example">
                            <p><strong>Chen:</strong> Circle with 'o'</p>
                            <p><strong>IE:</strong> Circle with 'o'</p>
                        </div>
                        <div class="meaning">
                            Entity can be <strong>MULTIPLE</strong> subtypes
                            <p class="example">Example: Person = Student AND Employee simultaneously</p>
                        </div>
                    </div>
                </div>
                
                <div id="subtype-quiz-area">
                    <button class="start-quiz-btn" onclick="simulator.startSubtypeQuiz()">Start Subtype Quiz</button>
                </div>
            </div>
        `;
    }

    startSubtypeQuiz() {
        const scenarios = [
            { description: "A vehicle can be a Car, Truck, or Motorcycle, but only one type", answer: "exclusive", explanation: "Exclusive - a vehicle can only be ONE type of vehicle." },
            { description: "A person can be both a Student and an Employee at the same time", answer: "overlapping", explanation: "Overlapping - a person can be BOTH subtypes simultaneously." },
            { description: "A dwelling can be a House, Condo, or Apartment", answer: "exclusive", explanation: "Exclusive - a dwelling is only ONE of these types (from lecture example)." },
            { description: "In a university system, a person can be a Student, Professor, or Administrator", answer: "overlapping", explanation: "Overlapping - a person could be both a Professor AND an Administrator." },
            { description: "A bank account can be Checking, Savings, or Investment", answer: "exclusive", explanation: "Exclusive - typically an account is one specific type." },
            { description: "An employee can have multiple roles: Manager, Developer, and Team Lead", answer: "overlapping", explanation: "Overlapping - an employee can have multiple roles simultaneously." },
            { description: "A file can be a Document, Image, or Video", answer: "exclusive", explanation: "Exclusive - a file is typically one type (though extensions can vary)." },
            { description: "A Kijiji listing can be for a Vehicle, Real Estate, or General Item", answer: "exclusive", explanation: "Exclusive - a listing is for ONE type of item (from lecture example)." }
        ];

        let currentQ = 0;
        let correct = 0;
        const quizArea = document.getElementById('subtype-quiz-area');

        const showQuestion = () => {
            if (currentQ >= scenarios.length) {
                quizArea.innerHTML = `
                    <div class="quiz-complete">
                        <h4>🎉 Quiz Complete!</h4>
                        <p>You got ${correct} out of ${scenarios.length} correct</p>
                        <button onclick="simulator.startExclusiveOverlapping()">Try Again</button>
                    </div>
                `;
                return;
            }

            const s = scenarios[currentQ];
            quizArea.innerHTML = `
                <div class="subtype-question">
                    <div class="progress">Question ${currentQ + 1} of ${scenarios.length}</div>
                    <div class="scenario">${s.description}</div>
                    <div class="subtype-buttons">
                        <button class="subtype-btn exclusive-btn" onclick="simulator.checkSubtypeAnswer('exclusive', '${s.answer}', '${s.explanation}')">
                            🔒 EXCLUSIVE
                            <small>Only ONE subtype</small>
                        </button>
                        <button class="subtype-btn overlapping-btn" onclick="simulator.checkSubtypeAnswer('overlapping', '${s.answer}', '${s.explanation}')">
                            🔀 OVERLAPPING
                            <small>Can be MULTIPLE</small>
                        </button>
                    </div>
                    <div id="subtype-feedback" class="feedback"></div>
                    <button id="subtype-next" class="next-btn" style="display:none" onclick="nextSubtype()">Next →</button>
                </div>
            `;
        };

        window.nextSubtype = () => {
            currentQ++;
            showQuestion();
        };

        showQuestion();
    }

    checkSubtypeAnswer(selected, actual, explanation) {
        const feedback = document.getElementById('subtype-feedback');
        const nextBtn = document.getElementById('subtype-next');
        const btns = document.querySelectorAll('.subtype-btn');
        
        btns.forEach(btn => btn.disabled = true);
        
        if (selected === actual) {
            feedback.innerHTML = `<span class="success">✓ Correct! ${explanation}</span>`;
            this.score += 15;
        } else {
            feedback.innerHTML = `<span class="error">✗ Incorrect. ${explanation}</span>`;
        }
        
        nextBtn.style.display = 'block';
    }

    // ============================================
    // UTILITY METHODS
    // ============================================
    
    getScoreMessage(correct, total) {
        const pct = (correct / total) * 100;
        if (pct >= 90) return "🌟 Excellent! You're an EERD expert!";
        if (pct >= 70) return "👍 Good job! Keep practicing!";
        if (pct >= 50) return "📚 Getting there! Review the concepts.";
        return "💪 Keep studying! You'll get it!";
    }

    // ============================================
    // NOTATION REFERENCE TABLE
    // ============================================
    
    renderNotationReference() {
        return `
            <div class="notation-reference-full">
                <h3>Complete Notation Reference</h3>
                <table class="notation-table">
                    <thead>
                        <tr>
                            <th>Concept</th>
                            <th>Chen Notation</th>
                            <th>IE Notation</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Strong Entity</td>
                            <td><div class="symbol chen-rect"></div>Rectangle</td>
                            <td><div class="symbol ie-rect"></div>Rectangle (square corners)</td>
                            <td>An entity with its own independent primary key</td>
                        </tr>
                        <tr>
                            <td>Weak Entity</td>
                            <td><div class="symbol chen-weak"></div>Double Rectangle</td>
                            <td><div class="symbol ie-weak"></div>Rounded corners</td>
                            <td>Depends on another entity for identification</td>
                        </tr>
                        <tr>
                            <td>Relationship</td>
                            <td><div class="symbol chen-diamond"></div>Diamond</td>
                            <td><div class="symbol ie-line"></div>Line</td>
                            <td>Association between entities</td>
                        </tr>
                        <tr>
                            <td>Identifying Relationship</td>
                            <td><div class="symbol chen-id-rel"></div>Double Diamond</td>
                            <td><div class="symbol ie-solid"></div>Solid Line</td>
                            <td>Child's PK includes parent's PK</td>
                        </tr>
                        <tr>
                            <td>Non-Identifying Relationship</td>
                            <td>Same diamond</td>
                            <td><div class="symbol ie-dotted"></div>Dotted Line</td>
                            <td>Child has independent PK</td>
                        </tr>
                        <tr>
                            <td>Attribute</td>
                            <td><div class="symbol chen-oval"></div>Oval</td>
                            <td>Listed inside entity</td>
                            <td>Property of an entity</td>
                        </tr>
                        <tr>
                            <td>Multi-valued Attribute</td>
                            <td><div class="symbol chen-multi"></div>Double Oval</td>
                            <td>Not supported</td>
                            <td>Attribute with multiple values</td>
                        </tr>
                        <tr>
                            <td>Primary Key</td>
                            <td>Underlined name</td>
                            <td>(PK) notation</td>
                            <td>Unique identifier</td>
                        </tr>
                        <tr>
                            <td>Partial Key</td>
                            <td>Dashed underline</td>
                            <td>Part of composite PK</td>
                            <td>Discriminator for weak entities</td>
                        </tr>
                        <tr>
                            <td>Superclass/Subclass</td>
                            <td>Circle with lines</td>
                            <td>Line with circle</td>
                            <td>Inheritance structure</td>
                        </tr>
                        <tr>
                            <td>Exclusive Subtypes</td>
                            <td>Circle with 'd'</td>
                            <td>Circle with 'x'</td>
                            <td>Only ONE subtype allowed</td>
                        </tr>
                        <tr>
                            <td>Overlapping Subtypes</td>
                            <td>Circle with 'o'</td>
                            <td>Circle with 'o'</td>
                            <td>MULTIPLE subtypes allowed</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
}

// Initialize simulator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.simulator = new EERDSimulator('simulator-container');
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EERDSimulator;
}
