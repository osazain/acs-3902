/**
 * ACS-3902 Database Systems Course Platform - Main Application Controller
 * Comprehensive study platform with gamification, lectures, quizzes, and progress tracking
 * 
 * @author ACS-3902 Course Platform
 * @version 2.0.0
 */

// ========================================
// APP STATE MANAGEMENT
// ========================================
const AppState = {
    // Current view state
    currentView: 'dashboard',
    currentLecture: null,
    currentQuiz: null,
    
    // User progress and gamification
    user: {
        name: 'Student',
        initials: 'ST',
        xp: 0,
        level: 1,
        xpToNext: 100,
        streak: 0,
        lastStudyDate: null,
        totalStudyTime: 0,
        questionsAnswered: 0,
        correctAnswers: 0
    },
    
    // Lecture progress tracking
    lectureProgress: {},
    
    // Completed questions tracking
    completedQuestions: new Set(),
    
    // Badges unlocked
    unlockedBadges: new Set(),
    
    // Settings
    settings: {
        theme: 'light',
        sidebarCollapsed: false,
        notificationsEnabled: true,
        soundEnabled: false
    },
    
    // UI state
    isSidebarOpen: false,
    isLoading: false,
    
    /**
     * Initialize app state from localStorage
     */
    init() {
        this.loadFromStorage();
        this.updateStreak();
        this.calculateLevelProgress();
    },
    
    /**
     * Load all data from localStorage
     */
    loadFromStorage() {
        try {
            // Load user data
            const savedUser = localStorage.getItem('acs3902_user');
            if (savedUser) {
                this.user = { ...this.user, ...JSON.parse(savedUser) };
            }
            
            // Load lecture progress
            const savedProgress = localStorage.getItem('acs3902_lectureProgress');
            if (savedProgress) {
                this.lectureProgress = JSON.parse(savedProgress);
            }
            
            // Load completed questions
            const savedQuestions = localStorage.getItem('acs3902_completedQuestions');
            if (savedQuestions) {
                this.completedQuestions = new Set(JSON.parse(savedQuestions));
            }
            
            // Load badges
            const savedBadges = localStorage.getItem('acs3902_badges');
            if (savedBadges) {
                this.unlockedBadges = new Set(JSON.parse(savedBadges));
            }
            
            // Load settings
            const savedSettings = localStorage.getItem('acs3902_settings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    },
    
    /**
     * Save all data to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('acs3902_user', JSON.stringify(this.user));
            localStorage.setItem('acs3902_lectureProgress', JSON.stringify(this.lectureProgress));
            localStorage.setItem('acs3902_completedQuestions', JSON.stringify([...this.completedQuestions]));
            localStorage.setItem('acs3902_badges', JSON.stringify([...this.unlockedBadges]));
            localStorage.setItem('acs3902_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },
    
    /**
     * Update study streak based on last study date
     */
    updateStreak() {
        const today = new Date().toDateString();
        const lastDate = this.user.lastStudyDate;
        
        if (lastDate) {
            const last = new Date(lastDate);
            const now = new Date();
            const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                // Same day, streak continues
            } else if (diffDays === 1) {
                // Next day, increment streak
                this.user.streak++;
            } else {
                // Streak broken
                this.user.streak = 1;
            }
        } else {
            // First time studying
            this.user.streak = 1;
        }
        
        this.user.lastStudyDate = today;
    },
    
    /**
     * Calculate XP needed for next level
     */
    calculateLevelProgress() {
        // Level formula: each level requires 20% more XP
        this.user.xpToNext = Math.floor(100 * Math.pow(1.2, this.user.level - 1));
    }
};

// ========================================
// LECTURE DATA STRUCTURE
// ========================================
const LECTURES = [
    {
        id: 1,
        title: 'Course Introduction',
        description: 'Course outline, expectations, grading policies, assignment guidelines, and common pitfalls in database coursework.',
        topics: ['Course outline', 'Grade components', 'Academic integrity', 'Gen AI policy', 'Assignment policies', 'Common pitfalls'],
        questionCount: 15,
        estimatedTime: '1.5 hours',
        difficulty: 'easy',
        color: '#4CAF50',
        icon: '📚',
        dataFile: 'js/data/lectures/lectures-1-4.json'
    },
    {
        id: 2,
        title: 'SQL Select Fundamentals',
        description: 'SQL command categories, SELECT statement structure, joins, aliases, wildcards, comparison operators, NULL handling, and query processing sequence.',
        topics: ['DDL/DCL/DML/TCL', 'SELECT structure', 'Joins', 'Aliases', 'Wildcards', 'NULL handling', 'Query processing'],
        questionCount: 19,
        estimatedTime: '2.5 hours',
        difficulty: 'medium',
        color: '#2196F3',
        icon: '🔍',
        dataFile: 'js/data/lectures/lectures-1-4.json'
    },
    {
        id: 3,
        title: 'Joins, Aggregates, Subqueries',
        description: 'Advanced join types, aggregate functions, GROUP BY and HAVING, subqueries with IN/EXISTS/ANY/ALL, inline views, and DML operations.',
        topics: ['INNER/OUTER JOIN', 'Self-joins', 'Aggregate functions', 'GROUP BY', 'HAVING', 'Subqueries', 'Inline views'],
        questionCount: 20,
        estimatedTime: '2.5 hours',
        difficulty: 'hard',
        color: '#9C27B0',
        icon: '🔗',
        dataFile: 'js/data/lectures/lectures-1-4.json'
    },
    {
        id: 4,
        title: 'DDL & Constraints',
        description: 'Data Definition Language, table creation, constraints, primary keys, foreign keys, and database schema design.',
        topics: ['CREATE TABLE', 'ALTER TABLE', 'Constraints', 'Primary Keys', 'Foreign Keys', 'Unique constraints'],
        questionCount: 20,
        estimatedTime: '2 hours',
        difficulty: 'medium',
        color: '#FF9800',
        icon: '🏗️',
        dataFile: 'js/data/lectures/lectures-1-4.json'
    },
    {
        id: 5,
        title: 'Transactions & UNION',
        description: 'Database transaction management, ACID properties, savepoints, and SQL UNION operations for combining query results.',
        topics: ['ACID Properties', 'BEGIN/COMMIT/ROLLBACK', 'Savepoints', 'UNION/UNION ALL', 'Transaction isolation'],
        questionCount: 15,
        estimatedTime: '75 minutes',
        difficulty: 'medium',
        color: '#E91E63',
        icon: '⚡',
        dataFile: 'js/data/lectures/lectures-5-9.json'
    },
    {
        id: 6,
        title: 'CTEs, Triggers, and Indexes',
        description: 'Common Table Expressions for query organization, database triggers for automated actions, and index strategies.',
        topics: ['CTEs', 'Recursive CTEs', 'BEFORE/AFTER Triggers', 'OLD/NEW keywords', 'CREATE INDEX', 'Composite Indexes'],
        questionCount: 18,
        estimatedTime: '90 minutes',
        difficulty: 'hard',
        color: '#00BCD4',
        icon: '⚙️',
        dataFile: 'js/data/lectures/lectures-5-9.json'
    },
    {
        id: 7,
        title: 'Indexes & Relational Algebra',
        description: 'Advanced indexing concepts including clustered vs non-clustered, EXPLAIN, and the mathematical foundation of databases.',
        topics: ['Clustered Indexes', 'EXPLAIN', 'Query Plans', 'Relational Algebra', 'SELECT/PROJECT/JOIN', 'Query Trees'],
        questionCount: 15,
        estimatedTime: '85 minutes',
        difficulty: 'hard',
        color: '#673AB7',
        icon: '📐',
        dataFile: 'js/data/lectures/lectures-5-9.json'
    },
    {
        id: 8,
        title: 'EERD Modeling',
        description: 'Enhanced Entity-Relationship Diagrams, Chen vs IE notation, inheritance structures, and weak entities.',
        topics: ['Chen Notation', 'IE Notation', 'Supertype/Subtype', 'Weak Entities', 'Identifying Relationships', 'Recursive Relationships'],
        questionCount: 15,
        estimatedTime: '80 minutes',
        difficulty: 'medium',
        color: '#795548',
        icon: '📊',
        dataFile: 'js/data/lectures/lectures-5-9.json'
    },
    {
        id: 9,
        title: '8-Step Transformation',
        description: 'The 8-step methodology for transforming EERDs into relational database schemas with proper keys and relationships.',
        topics: ['Step 1-2: Strong/Weak Entities', 'Step 3-4: 1:N Relationships', 'Step 5: M:N Relationships', 'Step 6: Multi-valued', 'Step 7-8: Subtypes/Recursive'],
        questionCount: 15,
        estimatedTime: '90 minutes',
        difficulty: 'hard',
        color: '#3F51B5',
        icon: '🔄',
        dataFile: 'js/data/lectures/lectures-5-9.json'
    }
];

// ========================================
// GAMIFICATION SYSTEM
// ========================================

/**
 * XP Values by difficulty
 */
const XP_VALUES = {
    easy: 10,
    medium: 20,
    hard: 35,
    expert: 50
};

/**
 * Level definitions (15 levels total)
 */
const LEVELS = [
    { level: 1, title: 'Database Novice', xpRequired: 0 },
    { level: 2, title: 'SQL Explorer', xpRequired: 100 },
    { level: 3, title: 'Query Apprentice', xpRequired: 220 },
    { level: 4, title: 'Join Master', xpRequired: 364 },
    { level: 5, title: 'Aggregate Analyst', xpRequired: 537 },
    { level: 6, title: 'Subquery Sage', xpRequired: 744 },
    { level: 7, title: 'Transaction Pro', xpRequired: 993 },
    { level: 8, title: 'Trigger Expert', xpRequired: 1292 },
    { level: 9, title: 'Index Optimizer', xpRequired: 1646 },
    { level: 10, title: 'Schema Designer', xpRequired: 2065 },
    { level: 11, title: 'EERD Architect', xpRequired: 2558 },
    { level: 12, title: 'Relational Guru', xpRequired: 3130 },
    { level: 13, title: 'Database Master', xpRequired: 3796 },
    { level: 14, title: 'SQL Wizard', xpRequired: 4566 },
    { level: 15, title: 'Database Legend', xpRequired: 5459 }
];

/**
 * Badge definitions (25+ badges)
 */
const BADGES = [
    // Achievement badges
    { id: 'first_steps', name: 'First Steps', description: 'Answer your first question', icon: '👣', condition: () => AppState.user.questionsAnswered >= 1 },
    { id: 'quick_learner', name: 'Quick Learner', description: 'Answer 10 questions with 80%+ accuracy', icon: '🚀', condition: () => AppState.user.questionsAnswered >= 10 && getAccuracy() >= 80 },
    { id: 'consistent', name: 'Consistent', description: 'Study 3 days in a row', icon: '🔥', condition: () => AppState.user.streak >= 3 },
    { id: 'dedicated', name: 'Dedicated', description: 'Study 7 days in a row', icon: '⭐', condition: () => AppState.user.streak >= 7 },
    { id: 'unstoppable', name: 'Unstoppable', description: 'Study 14 days in a row', icon: '💫', condition: () => AppState.user.streak >= 14 },
    
    // Lecture completion badges
    { id: 'lecture_1_complete', name: 'Course Initiate', description: 'Complete Lecture 1', icon: '📖', condition: () => isLectureComplete(1) },
    { id: 'lecture_2_complete', name: 'SQL Beginner', description: 'Complete Lecture 2', icon: '💻', condition: () => isLectureComplete(2) },
    { id: 'lecture_3_complete', name: 'Join Expert', description: 'Complete Lecture 3', icon: '🔗', condition: () => isLectureComplete(3) },
    { id: 'lecture_4_complete', name: 'Schema Builder', description: 'Complete Lecture 4', icon: '🏗️', condition: () => isLectureComplete(4) },
    { id: 'lecture_5_complete', name: 'Transaction Master', description: 'Complete Lecture 5', icon: '⚡', condition: () => isLectureComplete(5) },
    { id: 'lecture_6_complete', name: 'Trigger Specialist', description: 'Complete Lecture 6', icon: '⚙️', condition: () => isLectureComplete(6) },
    { id: 'lecture_7_complete', name: 'Query Optimizer', description: 'Complete Lecture 7', icon: '📐', condition: () => isLectureComplete(7) },
    { id: 'lecture_8_complete', name: 'EERD Designer', description: 'Complete Lecture 8', icon: '📊', condition: () => isLectureComplete(8) },
    { id: 'lecture_9_complete', name: 'Transformation Pro', description: 'Complete Lecture 9', icon: '🔄', condition: () => isLectureComplete(9) },
    
    // Milestone badges
    { id: 'halfway', name: 'Halfway There', description: 'Complete 5 lectures', icon: '🎯', condition: () => getCompletedLectureCount() >= 5 },
    { id: 'all_lectures', name: 'Course Graduate', description: 'Complete all lectures', icon: '🎓', condition: () => getCompletedLectureCount() >= 9 },
    { id: 'perfect_score', name: 'Perfect Score', description: 'Get 100% on any quiz', icon: '💯', condition: () => hasPerfectScore() },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a quiz in under 5 minutes', icon: '⚡', condition: () => false }, // Tracked separately
    { id: 'night_owl', name: 'Night Owl', description: 'Study after 10 PM', icon: '🦉', condition: () => isNightOwl() },
    { id: 'early_bird', name: 'Early Bird', description: 'Study before 8 AM', icon: '🐦', condition: () => isEarlyBird() },
    
    // XP milestones
    { id: 'xp_100', name: 'Century', description: 'Earn 100 XP', icon: '💯', condition: () => AppState.user.xp >= 100 },
    { id: 'xp_500', name: 'High Achiever', description: 'Earn 500 XP', icon: '🏆', condition: () => AppState.user.xp >= 500 },
    { id: 'xp_1000', name: 'XP Master', description: 'Earn 1,000 XP', icon: '👑', condition: () => AppState.user.xp >= 1000 },
    { id: 'xp_2000', name: 'XP Legend', description: 'Earn 2,000 XP', icon: '🌟', condition: () => AppState.user.xp >= 2000 },
    
    // Question count badges
    { id: 'questions_25', name: 'Getting Warm', description: 'Answer 25 questions', icon: '🔥', condition: () => AppState.user.questionsAnswered >= 25 },
    { id: 'questions_50', name: 'Question Master', description: 'Answer 50 questions', icon: '📋', condition: () => AppState.user.questionsAnswered >= 50 },
    { id: 'questions_100', name: 'Century Club', description: 'Answer 100 questions', icon: '🏅', condition: () => AppState.user.questionsAnswered >= 100 },
    { id: 'questions_200', name: 'Expert Analyst', description: 'Answer 200 questions', icon: '🎖️', condition: () => AppState.user.questionsAnswered >= 200 },
    
    // Level badges
    { id: 'level_5', name: 'Rising Star', description: 'Reach Level 5', icon: '⭐', condition: () => AppState.user.level >= 5 },
    { id: 'level_10', name: 'Database Expert', description: 'Reach Level 10', icon: '🌟', condition: () => AppState.user.level >= 10 },
    { id: 'level_15', name: 'Database Legend', description: 'Reach Level 15', icon: '👑', condition: () => AppState.user.level >= 15 }
];

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Calculate current accuracy percentage
 */
function getAccuracy() {
    if (AppState.user.questionsAnswered === 0) return 0;
    return Math.round((AppState.user.correctAnswers / AppState.user.questionsAnswered) * 100);
}

/**
 * Check if a lecture is complete
 */
function isLectureComplete(lectureId) {
    const progress = AppState.lectureProgress[lectureId];
    if (!progress) return false;
    const lecture = LECTURES.find(l => l.id === lectureId);
    return progress.completed >= lecture.questionCount;
}

/**
 * Get count of completed lectures
 */
function getCompletedLectureCount() {
    return LECTURES.filter(l => isLectureComplete(l.id)).length;
}

/**
 * Check if user has any perfect score
 */
function hasPerfectScore() {
    return Object.values(AppState.lectureProgress).some(p => p.perfectScore);
}

/**
 * Check if studying after 10 PM
 */
function isNightOwl() {
    const hour = new Date().getHours();
    return hour >= 22 || hour < 2;
}

/**
 * Check if studying before 8 AM
 */
function isEarlyBird() {
    const hour = new Date().getHours();
    return hour >= 5 && hour < 8;
}

// ========================================
// QUESTION DATA LOADING
// ========================================

/**
 * Cache for loaded question data
 */
const questionCache = {};

/**
 * Load questions from a JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<Array>} Array of questions
 */
async function loadQuestions(filePath) {
    if (questionCache[filePath]) {
        return questionCache[filePath];
    }
    
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Handle different data structures
        let questions = [];
        if (data.lectures) {
            // Lecture data format
            data.lectures.forEach(lecture => {
                if (lecture.questions) {
                    lecture.questions.forEach(q => {
                        q.lectureId = lecture.id;
                        q.lectureTitle = lecture.title;
                    });
                    questions.push(...lecture.questions);
                }
            });
        } else if (data.questions) {
            // Section data format
            questions = data.questions;
        }
        
        questionCache[filePath] = questions;
        return questions;
    } catch (error) {
        console.error(`Error loading questions from ${filePath}:`, error);
        return [];
    }
}

/**
 * Load questions for a specific lecture
 * @param {number} lectureId - Lecture ID
 * @returns {Promise<Array>} Array of questions for the lecture
 */
async function loadLectureQuestions(lectureId) {
    const lecture = LECTURES.find(l => l.id === lectureId);
    if (!lecture) return [];
    
    const allQuestions = await loadQuestions(lecture.dataFile);
    return allQuestions.filter(q => q.lectureId === lectureId || 
        (lectureId >= 1 && lectureId <= 4 && q.lectureId === lectureId) ||
        (lectureId >= 5 && lectureId <= 9 && q.lectureId === lectureId));
}

/**
 * Load all questions from all sources
 * @returns {Promise<Object>} Object with questions organized by source
 */
async function loadAllQuestions() {
    const sources = [
        'js/data/lectures/lectures-1-4.json',
        'js/data/lectures/lectures-5-9.json',
        'js/data/sectionA.json',
        'js/data/sectionB.json',
        'js/data/sectionC.json'
    ];
    
    const allQuestions = {};
    
    for (const source of sources) {
        try {
            allQuestions[source] = await loadQuestions(source);
        } catch (error) {
            console.error(`Failed to load ${source}:`, error);
            allQuestions[source] = [];
        }
    }
    
    return allQuestions;
}

// ========================================
// CORE FUNCTIONS
// ========================================

/**
 * Initialize the application
 */
function init() {
    AppState.init();
    initializeTheme();
    initializeNavigation();
    initializeEventListeners();
    renderDashboard();
    checkTimeBasedBadges();
    
    console.log('ACS-3902 Course Platform initialized');
}

/**
 * Render the main dashboard
 */
function renderDashboard() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    const completedCount = getCompletedLectureCount();
    const totalQuestions = LECTURES.reduce((sum, l) => sum + l.questionCount, 0);
    const completedQuestions = AppState.completedQuestions.size;
    
    mainContent.innerHTML = `
        <div class="dashboard">
            <header class="dashboard-header">
                <h1>Welcome back, ${AppState.user.name}! 👋</h1>
                <p class="dashboard-subtitle">Continue your database learning journey</p>
            </header>
            
            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📚</div>
                    <div class="stat-content">
                        <span class="stat-value">${completedCount}/${LECTURES.length}</span>
                        <span class="stat-label">Lectures Completed</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">❓</div>
                    <div class="stat-content">
                        <span class="stat-value">${completedQuestions}</span>
                        <span class="stat-label">Questions Answered</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-content">
                        <span class="stat-value">${AppState.user.streak}</span>
                        <span class="stat-label">Day Streak</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-content">
                        <span class="stat-value">${AppState.user.level}</span>
                        <span class="stat-label">Current Level</span>
                    </div>
                </div>
            </div>
            
            <!-- Progress Section -->
            <section class="progress-section">
                <h2>Your Progress</h2>
                <div class="overall-progress">
                    <div class="progress-ring-container">
                        <svg class="progress-ring" viewBox="0 0 120 120">
                            <circle class="progress-ring-bg" cx="60" cy="60" r="54"/>
                            <circle class="progress-ring-fill" cx="60" cy="60" r="54" 
                                stroke-dasharray="339.292" 
                                stroke-dashoffset="${339.292 - (339.292 * (completedQuestions / totalQuestions))}"/>
                        </svg>
                        <div class="progress-text">
                            <span class="progress-percent">${Math.round((completedQuestions / totalQuestions) * 100)}%</span>
                            <span class="progress-label">Complete</span>
                        </div>
                    </div>
                    <div class="xp-bar-container">
                        <div class="level-info">
                            <span>Level ${AppState.user.level}</span>
                            <span>${AppState.user.xp}/${AppState.user.xpToNext} XP</span>
                        </div>
                        <div class="xp-bar">
                            <div class="xp-fill" style="width: ${(AppState.user.xp / AppState.user.xpToNext) * 100}%"></div>
                        </div>
                        <p class="xp-next">${AppState.user.xpToNext - AppState.user.xp} XP to next level</p>
                    </div>
                </div>
            </section>
            
            <!-- Lectures Preview -->
            <section class="lectures-section">
                <div class="section-header">
                    <h2>Lectures</h2>
                    <button class="btn btn-link" onclick="renderLectureList()">View All →</button>
                </div>
                <div class="lecture-grid">
                    ${LECTURES.slice(0, 4).map(lecture => renderLectureCard(lecture)).join('')}
                </div>
            </section>
            
            <!-- Badges Preview -->
            <section class="badges-section">
                <div class="section-header">
                    <h2>Recent Badges</h2>
                    <button class="btn btn-link" onclick="renderBadgesPage()">View All →</button>
                </div>
                <div class="badges-grid">
                    ${renderRecentBadges()}
                </div>
            </section>
        </div>
    `;
    
    AppState.currentView = 'dashboard';
}

/**
 * Render a lecture card
 */
function renderLectureCard(lecture) {
    const progress = AppState.lectureProgress[lecture.id] || { completed: 0, correct: 0 };
    const percent = Math.round((progress.completed / lecture.questionCount) * 100);
    const isComplete = percent === 100;
    
    return `
        <div class="lecture-card ${isComplete ? 'complete' : ''}" onclick="renderLecture(${lecture.id})" style="--lecture-color: ${lecture.color}">
            <div class="lecture-icon">${lecture.icon}</div>
            <div class="lecture-content">
                <h3>L${lecture.id}: ${lecture.title}</h3>
                <p class="lecture-description">${lecture.description}</p>
                <div class="lecture-meta">
                    <span class="lecture-time">⏱️ ${lecture.estimatedTime}</span>
                    <span class="lecture-questions">${lecture.questionCount} questions</span>
                    <span class="lecture-difficulty difficulty-${lecture.difficulty}">${lecture.difficulty}</span>
                </div>
                <div class="lecture-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percent}%"></div>
                    </div>
                    <span class="progress-text">${progress.completed}/${lecture.questionCount}</span>
                </div>
            </div>
            ${isComplete ? '<div class="completion-badge">✓</div>' : ''}
        </div>
    `;
}

/**
 * Render recent badges
 */
function renderRecentBadges() {
    const unlocked = BADGES.filter(b => AppState.unlockedBadges.has(b.id)).slice(-4);
    
    if (unlocked.length === 0) {
        return '<p class="empty-state">No badges yet. Start studying to earn badges!</p>';
    }
    
    return unlocked.map(badge => `
        <div class="badge-card unlocked">
            <span class="badge-icon-large">${badge.icon}</span>
            <span class="badge-name">${badge.name}</span>
        </div>
    `).join('');
}

/**
 * Render the lecture list page
 */
function renderLectureList() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="lectures-page">
            <header class="page-header">
                <h1>All Lectures</h1>
                <p>Master database systems step by step</p>
            </header>
            
            <div class="lectures-grid-full">
                ${LECTURES.map(lecture => renderLectureCard(lecture)).join('')}
            </div>
        </div>
    `;
    
    AppState.currentView = 'lecture-list';
    updateActiveNav('lectures');
}

/**
 * Render a specific lecture content
 * @param {number} lectureId - Lecture ID
 */
async function renderLecture(lectureId) {
    const lecture = LECTURES.find(l => l.id === lectureId);
    if (!lecture) return;
    
    AppState.currentLecture = lecture;
    
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    // Show loading state
    mainContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading lecture content...</p>
        </div>
    `;
    
    // Load questions for this lecture
    const questions = await loadLectureQuestions(lectureId);
    
    const progress = AppState.lectureProgress[lectureId] || { completed: 0, correct: 0 };
    
    mainContent.innerHTML = `
        <div class="lecture-detail-page">
            <nav class="breadcrumb">
                <button class="btn btn-link" onclick="renderDashboard()">Dashboard</button>
                <span>/</span>
                <button class="btn btn-link" onclick="renderLectureList()">Lectures</button>
                <span>/</span>
                <span>Lecture ${lectureId}</span>
            </nav>
            
            <header class="lecture-header" style="--lecture-color: ${lecture.color}">
                <div class="lecture-header-icon">${lecture.icon}</div>
                <div class="lecture-header-content">
                    <h1>Lecture ${lectureId}: ${lecture.title}</h1>
                    <p>${lecture.description}</p>
                    <div class="lecture-header-meta">
                        <span class="badge">⏱️ ${lecture.estimatedTime}</span>
                        <span class="badge">❓ ${lecture.questionCount} questions</span>
                        <span class="badge difficulty-${lecture.difficulty}">${lecture.difficulty}</span>
                    </div>
                </div>
            </header>
            
            <div class="lecture-content-wrapper">
                <!-- Topics -->
                <section class="topics-section">
                    <h2>Topics Covered</h2>
                    <div class="topics-list">
                        ${lecture.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
                    </div>
                </section>
                
                <!-- Progress -->
                <section class="lecture-progress-section">
                    <h2>Your Progress</h2>
                    <div class="progress-card">
                        <div class="progress-stats">
                            <div class="stat">
                                <span class="stat-value">${progress.completed}</span>
                                <span class="stat-label">Completed</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${progress.correct || 0}</span>
                                <span class="stat-label">Correct</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${Math.round(((progress.correct || 0) / Math.max(progress.completed, 1)) * 100)}%</span>
                                <span class="stat-label">Accuracy</span>
                            </div>
                        </div>
                        <div class="progress-bar-large">
                            <div class="progress-fill" style="width: ${(progress.completed / lecture.questionCount) * 100}%"></div>
                        </div>
                        <p class="progress-text">${progress.completed} of ${lecture.questionCount} questions completed</p>
                    </div>
                </section>
                
                <!-- Action Buttons -->
                <section class="lecture-actions">
                    <button class="btn btn-primary btn-large" onclick="startQuiz(${lectureId})">
                        ${progress.completed === 0 ? 'Start Quiz' : progress.completed === lecture.questionCount ? 'Retake Quiz' : 'Continue Quiz'}
                    </button>
                    ${questions.length > 0 ? `
                        <button class="btn btn-secondary" onclick="showStudyMode(${lectureId})">
                            Study Mode
                        </button>
                    ` : ''}
                </section>
                
                <!-- Questions Preview -->
                <section class="questions-preview">
                    <h2>Questions (${questions.length})</h2>
                    <div class="questions-list">
                        ${questions.slice(0, 5).map((q, idx) => renderQuestionPreview(q, idx)).join('')}
                        ${questions.length > 5 ? `
                            <p class="more-questions">+ ${questions.length - 5} more questions</p>
                        ` : ''}
                    </div>
                </section>
            </div>
        </div>
    `;
    
    AppState.currentView = 'lecture-detail';
}

/**
 * Render a question preview
 */
function renderQuestionPreview(question, index) {
    const isCompleted = AppState.completedQuestions.has(question.id);
    const statusIcon = isCompleted ? '✅' : '⭕';
    
    return `
        <div class="question-preview-item ${isCompleted ? 'completed' : ''}">
            <span class="question-number">${index + 1}</span>
            <span class="question-status">${statusIcon}</span>
            <span class="question-text-preview">${truncateText(question.question, 60)}</span>
            <span class="question-difficulty difficulty-${question.difficulty}">${question.difficulty}</span>
        </div>
    `;
}

/**
 * Start a quiz for a lecture
 * @param {number} lectureId - Lecture ID
 */
async function startQuiz(lectureId) {
    const lecture = LECTURES.find(l => l.id === lectureId);
    if (!lecture) return;
    
    const questions = await loadLectureQuestions(lectureId);
    if (questions.length === 0) {
        showNotification('No questions available for this lecture', 'warning');
        return;
    }
    
    AppState.currentQuiz = {
        lectureId: lectureId,
        questions: questions,
        currentIndex: 0,
        answers: {},
        startTime: Date.now(),
        xpEarned: 0
    };
    
    renderQuizQuestion();
}

/**
 * Render the current quiz question
 */
function renderQuizQuestion() {
    const quiz = AppState.currentQuiz;
    if (!quiz) return;
    
    const question = quiz.questions[quiz.currentIndex];
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    const progress = ((quiz.currentIndex + 1) / quiz.questions.length) * 100;
    
    mainContent.innerHTML = `
        <div class="quiz-page">
            <div class="quiz-header">
                <button class="btn btn-link" onclick="endQuiz()">← Exit Quiz</button>
                <div class="quiz-progress">
                    <span>Question ${quiz.currentIndex + 1} of ${quiz.questions.length}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
            </div>
            
            <div class="quiz-content">
                <div class="question-card">
                    <div class="question-header">
                        <span class="question-difficulty difficulty-${question.difficulty}">${question.difficulty}</span>
                        <span class="question-xp">+${XP_VALUES[question.difficulty] || 10} XP</span>
                    </div>
                    
                    <h2 class="question-text">${question.question}</h2>
                    
                    ${question.code ? `
                        <pre class="code-block"><code>${Array.isArray(question.code) ? question.code.join('\n') : question.code}</code></pre>
                    ` : ''}
                    
                    <div class="options-list">
                        ${question.options.map((option, idx) => `
                            <button class="option-btn" onclick="selectAnswer(${idx})" data-index="${idx}">
                                <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
                                <span class="option-text">${option}</span>
                            </button>
                        `).join('')}
                    </div>
                    
                    <div class="quiz-actions">
                        <button class="btn btn-secondary" onclick="previousQuestion()" ${quiz.currentIndex === 0 ? 'disabled' : ''}>
                            Previous
                        </button>
                        <button class="btn btn-primary" id="submitBtn" onclick="submitAnswer()" disabled>
                            ${quiz.currentIndex === quiz.questions.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    AppState.currentView = 'quiz';
}

/**
 * Select an answer option
 * @param {number} index - Option index
 */
function selectAnswer(index) {
    const quiz = AppState.currentQuiz;
    if (!quiz) return;
    
    quiz.answers[quiz.currentIndex] = index;
    
    // Update UI
    document.querySelectorAll('.option-btn').forEach((btn, idx) => {
        btn.classList.toggle('selected', idx === index);
    });
    
    document.getElementById('submitBtn').disabled = false;
}

/**
 * Submit the current answer
 */
function submitAnswer() {
    const quiz = AppState.currentQuiz;
    if (!quiz) return;
    
    const question = quiz.questions[quiz.currentIndex];
    const selectedAnswer = quiz.answers[quiz.currentIndex];
    const correctAnswer = question.correctAnswer !== undefined ? question.correctAnswer : question.correct;
    
    const isCorrect = selectedAnswer === correctAnswer;
    
    // Update stats
    AppState.user.questionsAnswered++;
    if (isCorrect) {
        AppState.user.correctAnswers++;
    }
    
    // Track completed question
    AppState.completedQuestions.add(question.id);
    
    // Update lecture progress
    if (!AppState.lectureProgress[quiz.lectureId]) {
        AppState.lectureProgress[quiz.lectureId] = { completed: 0, correct: 0 };
    }
    AppState.lectureProgress[quiz.lectureId].completed++;
    if (isCorrect) {
        AppState.lectureProgress[quiz.lectureId].correct++;
    }
    
    // Award XP
    const xpGained = isCorrect ? (XP_VALUES[question.difficulty] || 10) : 0;
    quiz.xpEarned += xpGained;
    
    // Show result
    showQuestionResult(isCorrect, question.explanation, xpGained);
}

/**
 * Show question result
 */
function showQuestionResult(isCorrect, explanation, xpGained) {
    const quiz = AppState.currentQuiz;
    const isLastQuestion = quiz.currentIndex === quiz.questions.length - 1;
    
    // Update option buttons to show correct/incorrect
    document.querySelectorAll('.option-btn').forEach((btn, idx) => {
        const question = quiz.questions[quiz.currentIndex];
        const correctAnswer = question.correctAnswer !== undefined ? question.correctAnswer : question.correct;
        
        if (idx === correctAnswer) {
            btn.classList.add('correct');
        } else if (idx === quiz.answers[quiz.currentIndex] && !isCorrect) {
            btn.classList.add('incorrect');
        }
        btn.disabled = true;
    });
    
    // Add explanation
    const questionCard = document.querySelector('.question-card');
    const explanationDiv = document.createElement('div');
    explanationDiv.className = `explanation ${isCorrect ? 'correct' : 'incorrect'}`;
    explanationDiv.innerHTML = `
        <div class="result-header">
            <span class="result-icon">${isCorrect ? '✅' : '❌'}</span>
            <span class="result-text">${isCorrect ? 'Correct!' : 'Incorrect'}</span>
            ${xpGained > 0 ? `<span class="xp-gained">+${xpGained} XP</span>` : ''}
        </div>
        <div class="explanation-text">
            <strong>Explanation:</strong> ${explanation}
        </div>
    `;
    questionCard.appendChild(explanationDiv);
    
    // Update button
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.textContent = isLastQuestion ? 'See Results' : 'Continue';
    submitBtn.disabled = false;
    submitBtn.onclick = () => {
        if (isLastQuestion) {
            finishQuiz();
        } else {
            nextQuestion();
        }
    };
}

/**
 * Go to next question
 */
function nextQuestion() {
    const quiz = AppState.currentQuiz;
    if (!quiz || quiz.currentIndex >= quiz.questions.length - 1) return;
    
    quiz.currentIndex++;
    renderQuizQuestion();
}

/**
 * Go to previous question
 */
function previousQuestion() {
    const quiz = AppState.currentQuiz;
    if (!quiz || quiz.currentIndex <= 0) return;
    
    quiz.currentIndex--;
    renderQuizQuestion();
}

/**
 * Finish the quiz and show results
 */
function finishQuiz() {
    const quiz = AppState.currentQuiz;
    if (!quiz) return;
    
    const timeSpent = Math.floor((Date.now() - quiz.startTime) / 1000);
    const correctCount = Object.keys(quiz.answers).filter(idx => {
        const q = quiz.questions[idx];
        const correctAnswer = q.correctAnswer !== undefined ? q.correctAnswer : q.correct;
        return quiz.answers[idx] === correctAnswer;
    }).length;
    
    const totalQuestions = quiz.questions.length;
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    
    // Award XP
    updateXP(quiz.xpEarned);
    
    // Check for perfect score
    if (accuracy === 100) {
        AppState.lectureProgress[quiz.lectureId].perfectScore = true;
    }
    
    // Save progress
    AppState.saveToStorage();
    
    // Check badges
    checkBadges();
    
    // Show results
    renderQuizResults(correctCount, totalQuestions, accuracy, quiz.xpEarned, timeSpent);
}

/**
 * Render quiz results
 */
function renderQuizResults(correct, total, accuracy, xpEarned, timeSpent) {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    const grade = accuracy >= 90 ? 'A' : accuracy >= 80 ? 'B' : accuracy >= 70 ? 'C' : accuracy >= 60 ? 'D' : 'F';
    const gradeColor = accuracy >= 70 ? 'success' : accuracy >= 60 ? 'warning' : 'danger';
    
    mainContent.innerHTML = `
        <div class="quiz-results-page">
            <div class="results-card">
                <div class="results-header">
                    <h1>Quiz Complete! 🎉</h1>
                    <p>Great job completing the quiz</p>
                </div>
                
                <div class="grade-circle grade-${gradeColor}">
                    <span class="grade-letter">${grade}</span>
                    <span class="grade-percent">${accuracy}%</span>
                </div>
                
                <div class="results-stats">
                    <div class="result-stat">
                        <span class="stat-value">${correct}/${total}</span>
                        <span class="stat-label">Correct Answers</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-value">+${xpEarned}</span>
                        <span class="stat-label">XP Earned</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-value">${formatTime(timeSpent)}</span>
                        <span class="stat-label">Time Spent</span>
                    </div>
                </div>
                
                <div class="results-actions">
                    <button class="btn btn-primary" onclick="renderDashboard()">Back to Dashboard</button>
                    <button class="btn btn-secondary" onclick="startQuiz(${AppState.currentQuiz.lectureId})">Retake Quiz</button>
                </div>
            </div>
        </div>
    `;
    
    AppState.currentView = 'quiz-results';
}

/**
 * End quiz early
 */
function endQuiz() {
    if (confirm('Are you sure you want to end this quiz? Your progress will be saved.')) {
        AppState.saveToStorage();
        AppState.currentQuiz = null;
        renderDashboard();
    }
}

/**
 * Update XP and check for level up
 * @param {number} points - XP points to add
 */
function updateXP(points) {
    AppState.user.xp += points;
    
    // Check for level up
    while (AppState.user.xp >= AppState.user.xpToNext && AppState.user.level < 15) {
        AppState.user.xp -= AppState.user.xpToNext;
        AppState.user.level++;
        AppState.calculateLevelProgress();
        
        showNotification(`🎉 Level Up! You are now Level ${AppState.user.level}!`, 'success', 5000);
        
        // Check level badges
        checkBadges();
    }
    
    AppState.saveToStorage();
    updateUI();
}

/**
 * Check and award badges
 */
function checkBadges() {
    let newBadges = [];
    
    BADGES.forEach(badge => {
        if (!AppState.unlockedBadges.has(badge.id) && badge.condition()) {
            AppState.unlockedBadges.add(badge.id);
            newBadges.push(badge);
        }
    });
    
    if (newBadges.length > 0) {
        AppState.saveToStorage();
        newBadges.forEach((badge, idx) => {
            setTimeout(() => {
                showNotification(`🏆 Badge Unlocked: ${badge.name}!`, 'success', 4000);
            }, idx * 500);
        });
    }
    
    return newBadges;
}

/**
 * Check time-based badges
 */
function checkTimeBasedBadges() {
    checkBadges();
}

// ========================================
// THEME MANAGEMENT
// ========================================

/**
 * Initialize theme based on settings
 */
function initializeTheme() {
    const theme = AppState.settings.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    AppState.settings.theme = newTheme;
    AppState.saveToStorage();
    
    showNotification(`Switched to ${newTheme} mode`, 'info');
}

// ========================================
// NAVIGATION
// ========================================

/**
 * Initialize navigation
 */
function initializeNavigation() {
    // Handle nav link clicks
    document.querySelectorAll('.nav-link[data-view]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.dataset.view;
            navigateTo(view);
        });
    });
}

/**
 * Navigate to a view
 * @param {string} view - View name
 */
function navigateTo(view) {
    switch (view) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'lectures':
            renderLectureList();
            break;
        case 'profile':
            renderProfile();
            break;
        case 'badges':
            renderBadgesPage();
            break;
        default:
            renderDashboard();
    }
    
    updateActiveNav(view);
    
    // Close mobile sidebar
    if (window.innerWidth < 768) {
        toggleSidebar();
    }
}

/**
 * Update active nav item
 */
function updateActiveNav(view) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.view === view);
    });
}

// ========================================
// UI COMPONENTS
// ========================================

/**
 * Render profile page
 */
function renderProfile() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    const accuracy = getAccuracy();
    
    mainContent.innerHTML = `
        <div class="profile-page">
            <h1>Profile & Settings</h1>
            
            <div class="profile-section">
                <h2>Statistics</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-value">${AppState.user.questionsAnswered}</span>
                        <span class="stat-label">Questions Answered</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${accuracy}%</span>
                        <span class="stat-label">Accuracy</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${AppState.user.streak}</span>
                        <span class="stat-label">Day Streak</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${AppState.user.xp}</span>
                        <span class="stat-label">Total XP</span>
                    </div>
                </div>
            </div>
            
            <div class="profile-section">
                <h2>Settings</h2>
                <div class="settings-list">
                    <div class="setting-item">
                        <span>Dark Mode</span>
                        <button class="toggle ${AppState.settings.theme === 'dark' ? 'active' : ''}" onclick="toggleTheme()">
                            <span class="toggle-slider"></span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="profile-actions">
                <button class="btn btn-danger" onclick="resetProgress()">Reset All Progress</button>
                <button class="btn btn-secondary" onclick="exportProgress()">Export Progress</button>
            </div>
        </div>
    `;
    
    AppState.currentView = 'profile';
    updateActiveNav('profile');
}

/**
 * Render badges page
 */
function renderBadgesPage() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    const unlockedCount = AppState.unlockedBadges.size;
    const totalBadges = BADGES.length;
    
    mainContent.innerHTML = `
        <div class="badges-page">
            <h1>Achievement Badges</h1>
            <p class="badges-summary">${unlockedCount} of ${totalBadges} badges unlocked</p>
            
            <div class="badges-grid-full">
                ${BADGES.map(badge => {
                    const isUnlocked = AppState.unlockedBadges.has(badge.id);
                    return `
                        <div class="badge-card-large ${isUnlocked ? 'unlocked' : 'locked'}">
                            <span class="badge-icon-large">${isUnlocked ? badge.icon : '🔒'}</span>
                            <h3>${badge.name}</h3>
                            <p>${badge.description}</p>
                            ${isUnlocked ? '<span class="badge-status">✓ Unlocked</span>' : '<span class="badge-status">Locked</span>'}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    AppState.currentView = 'badges';
}

/**
 * Show study mode for a lecture
 */
async function showStudyMode(lectureId) {
    const questions = await loadLectureQuestions(lectureId);
    if (questions.length === 0) return;
    
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="study-mode-page">
            <header class="study-header">
                <button class="btn btn-link" onclick="renderLecture(${lectureId})">← Back to Lecture</button>
                <h1>Study Mode</h1>
            </header>
            
            <div class="study-content">
                ${questions.map((q, idx) => `
                    <div class="study-question-card">
                        <div class="study-question-header">
                            <span class="question-number">Question ${idx + 1}</span>
                            <span class="question-difficulty difficulty-${q.difficulty}">${q.difficulty}</span>
                        </div>
                        <h3>${q.question}</h3>
                        ${q.code ? `<pre class="code-block"><code>${Array.isArray(q.code) ? q.code.join('\n') : q.code}</code></pre>` : ''}
                        <div class="study-options">
                            ${q.options.map((opt, optIdx) => `
                                <div class="study-option ${optIdx === (q.correctAnswer !== undefined ? q.correctAnswer : q.correct) ? 'correct' : ''}">
                                    <span class="option-letter">${String.fromCharCode(65 + optIdx)}</span>
                                    <span>${opt}</span>
                                    ${optIdx === (q.correctAnswer !== undefined ? q.correctAnswer : q.correct) ? '<span class="correct-mark">✓</span>' : ''}
                                </div>
                            `).join('')}
                        </div>
                        <div class="study-explanation">
                            <strong>Explanation:</strong> ${q.explanation}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ========================================
// EVENT LISTENERS
// ========================================

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Toggle sidebar (mobile)
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
        AppState.isSidebarOpen = sidebar.classList.contains('open');
    }
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(e) {
    // Escape to close modals or go back
    if (e.key === 'Escape') {
        if (AppState.currentView === 'quiz') {
            endQuiz();
        }
    }
}

// ========================================
// NOTIFICATIONS
// ========================================

/**
 * Show a notification toast
 * @param {string} message - Message to display
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Create notification container if it doesn't exist
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Truncate text to a certain length
 */
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Format time in seconds to readable string
 */
function formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Update UI elements
 */
function updateUI() {
    // Update any dynamic UI elements
    const xpDisplay = document.getElementById('xpDisplay');
    if (xpDisplay) {
        xpDisplay.textContent = `${AppState.user.xp} XP`;
    }
}

/**
 * Reset all progress
 */
function resetProgress() {
    if (confirm('⚠️ WARNING: This will permanently delete ALL your progress, stats, and achievements.\n\nThis action cannot be undone.\n\nAre you sure you want to continue?')) {
        if (confirm('Final confirmation: Type "RESET" to confirm deletion of all data.')) {
            const input = prompt('Type "RESET" to confirm:');
            if (input === 'RESET') {
                localStorage.removeItem('acs3902_user');
                localStorage.removeItem('acs3902_lectureProgress');
                localStorage.removeItem('acs3902_completedQuestions');
                localStorage.removeItem('acs3902_badges');
                localStorage.removeItem('acs3902_settings');
                
                AppState.init();
                renderDashboard();
                showNotification('All progress has been reset.', 'success');
            } else {
                showNotification('Reset cancelled.', 'info');
            }
        }
    }
}

/**
 * Export progress to JSON file
 */
function exportProgress() {
    const data = {
        user: AppState.user,
        lectureProgress: AppState.lectureProgress,
        completedQuestions: [...AppState.completedQuestions],
        unlockedBadges: [...AppState.unlockedBadges],
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `acs3902-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Progress exported successfully!', 'success');
}

// ========================================
// INITIALIZATION
// ========================================

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Expose global API for debugging and external access
window.CoursePlatform = {
    state: AppState,
    lectures: LECTURES,
    navigate: navigateTo,
    startQuiz,
    toggleTheme,
    showNotification,
    updateXP,
    checkBadges,
    loadQuestions: loadAllQuestions
};

// Export functions for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        LECTURES,
        BADGES,
        XP_VALUES,
        init,
        renderDashboard,
        renderLectureList,
        renderLecture,
        startQuiz,
        updateXP,
        checkBadges,
        toggleTheme
    };
}
