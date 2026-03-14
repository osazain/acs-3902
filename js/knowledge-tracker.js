/**
 * ACS-3902 Knowledge Tracking System
 * Comprehensive learning analytics, performance tracking, and personalized study recommendations
 * 
 * @module KnowledgeTracker
 * @version 1.0.0
 * @description Tracks user performance by topic, identifies weak areas, generates study plans,
 *              implements spaced repetition, and provides detailed learning analytics
 * 
 * @example
 * // Initialize the tracker
 * KnowledgeTracker.init();
 * 
 * // Record a question attempt
 * KnowledgeTracker.recordAttempt({
 *   questionId: 'lecture2_q15',
 *   correct: true,
 *   timeSpent: 45,
 *   lectureId: 2,
 *   topics: ['Joins', 'SQL Fundamentals'],
 *   difficulty: 'medium'
 * });
 * 
 * // Get personalized study plan
 * const plan = KnowledgeTracker.getStudyPlan();
 * 
 * // Export progress
 * const export = KnowledgeTracker.exportProgress();
 */

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

/**
 * localStorage key for knowledge data
 * @constant {string}
 */
const STORAGE_KEY = 'acs3902-knowledge-data';

/**
 * Mastery thresholds for topic classification
 * @constant {Object}
 */
const MASTERY_THRESHOLDS = {
  WEAK: { max: 60, label: 'weak', color: '#ef4444', description: 'Needs significant practice' },
  NEEDS_PRACTICE: { min: 60, max: 80, label: 'needs_practice', color: '#f59e0b', description: 'Getting there, keep practicing' },
  STRONG: { min: 80, max: 100, label: 'strong', color: '#22c55e', description: 'Well mastered' }
};

/**
 * Lecture metadata with topics for categorization
 * @constant {Object}
 */
const LECTURE_TOPICS = {
  1: {
    title: 'Course Introduction',
    topics: ['Course outline', 'Grade components', 'Academic integrity', 'Gen AI policy', 'Assignment policies', 'Common pitfalls'],
    dependencies: []
  },
  2: {
    title: 'SQL Select Fundamentals',
    topics: ['DDL/DCL/DML/TCL', 'SELECT structure', 'Joins', 'Aliases', 'Wildcards', 'NULL handling', 'Query processing'],
    dependencies: [1]
  },
  3: {
    title: 'Joins, Aggregates, Subqueries',
    topics: ['INNER/OUTER JOIN', 'Self-joins', 'Aggregate functions', 'GROUP BY', 'HAVING', 'Subqueries', 'Inline views'],
    dependencies: [2]
  },
  4: {
    title: 'DDL & Constraints',
    topics: ['CREATE TABLE', 'ALTER TABLE', 'Constraints', 'Primary Keys', 'Foreign Keys', 'Unique constraints'],
    dependencies: [2, 3]
  },
  5: {
    title: 'Transactions & UNION',
    topics: ['ACID Properties', 'BEGIN/COMMIT/ROLLBACK', 'Savepoints', 'UNION/UNION ALL', 'Transaction isolation'],
    dependencies: [2, 3, 4]
  },
  6: {
    title: 'CTEs, Triggers, and Indexes',
    topics: ['CTEs', 'Recursive CTEs', 'BEFORE/AFTER Triggers', 'OLD/NEW keywords', 'CREATE INDEX', 'Composite Indexes'],
    dependencies: [3, 4, 5]
  },
  7: {
    title: 'Indexes & Relational Algebra',
    topics: ['Clustered Indexes', 'EXPLAIN', 'Query Plans', 'Relational Algebra', 'SELECT/PROJECT/JOIN', 'Query Trees'],
    dependencies: [3, 6]
  },
  8: {
    title: 'EERD Modeling',
    topics: ['Chen Notation', 'IE Notation', 'Supertype/Subtype', 'Weak Entities', 'Identifying Relationships', 'Recursive Relationships'],
    dependencies: [4]
  },
  9: {
    title: '8-Step Transformation',
    topics: ['Step 1-2: Strong/Weak Entities', 'Step 3-4: 1:N Relationships', 'Step 5: M:N Relationships', 'Step 6: Multi-valued', 'Step 7-8: Subtypes/Recursive'],
    dependencies: [4, 8]
  }
};

/**
 * Topic to lecture mapping for reverse lookup
 * @constant {Object}
 */
const TOPIC_TO_LECTURE = {};
Object.entries(LECTURE_TOPICS).forEach(([lectureId, data]) => {
  data.topics.forEach(topic => {
    if (!TOPIC_TO_LECTURE[topic]) {
      TOPIC_TO_LECTURE[topic] = [];
    }
    TOPIC_TO_LECTURE[topic].push(parseInt(lectureId));
  });
});

/**
 * Spaced repetition intervals (in days)
 * Based on Ebbinghaus forgetting curve
 * @constant {number[]}
 */
const SR_INTERVALS = [1, 3, 7, 14, 30, 60];

/**
 * Event names for data change notifications
 * @constant {Object}
 */
const EVENTS = {
  ATTEMPT_RECORDED: 'knowledge:attempt-recorded',
  MASTERY_UPDATED: 'knowledge:mastery-updated',
  STREAK_CHANGED: 'knowledge:streak-changed',
  RECOMMENDATIONS_UPDATED: 'knowledge:recommendations-updated',
  DATA_EXPORTED: 'knowledge:data-exported',
  DATA_IMPORTED: 'knowledge:data-imported'
};

// ============================================
// DATA STRUCTURES
// ============================================

/**
 * Default knowledge data structure
 * @returns {Object} Default data object
 */
function getDefaultData() {
  return {
    // Version for data migration
    version: '1.0.0',
    
    // When data was first created
    createdAt: new Date().toISOString(),
    
    // When data was last updated
    lastUpdated: new Date().toISOString(),
    
    // All question attempts
    attempts: [],
    
    // Topic performance tracking
    topics: {},
    
    // Lecture progress tracking
    lectures: {},
    
    // Streak tracking per topic
    streaks: {},
    
    // Spaced repetition schedule
    srSchedule: {},
    
    // Study sessions
    sessions: [],
    
    // Daily activity log
    dailyActivity: {},
    
    // Question patterns (e.g., common mistakes)
    patterns: {
      wrongAnswers: {},
      slowQuestions: {}
    },
    
    // User settings
    settings: {
      dailyGoal: 10,
      reminderEnabled: true,
      difficultyPreference: 'adaptive'
    },
    
    // Summary stats
    stats: {
      totalStudyTime: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      averageTimePerQuestion: 0
    }
  };
}

// ============================================
// CORE TRACKING FUNCTIONS
// ============================================

/**
 * Knowledge Tracker Module
 * @namespace KnowledgeTracker
 */
const KnowledgeTracker = (function() {
  
  // Private data store
  let _data = null;
  
  // Current session tracking
  let _currentSession = null;
  
  /**
   * Initialize the knowledge tracker
   * Loads data from localStorage or creates default
   * @returns {Object} Initialized data
   */
  function init() {
    _data = loadData();
    _migrateDataIfNeeded();
    
    // Start a new study session if none active
    if (!_currentSession) {
      startSession();
    }
    
    console.log('[KnowledgeTracker] Initialized with', _data.attempts.length, 'attempts');
    return _data;
  }
  
  /**
   * Load data from localStorage
   * @returns {Object} Loaded or default data
   */
  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects where needed
        if (parsed.attempts) {
          parsed.attempts.forEach(attempt => {
            attempt.timestamp = new Date(attempt.timestamp);
          });
        }
        return parsed;
      }
    } catch (error) {
      console.error('[KnowledgeTracker] Error loading data:', error);
    }
    return getDefaultData();
  }
  
  /**
   * Save data to localStorage
   */
  function saveData() {
    try {
      _data.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
    } catch (error) {
      console.error('[KnowledgeTracker] Error saving data:', error);
    }
  }
  
  /**
   * Migrate data if version mismatch
   * @private
   */
  function _migrateDataIfNeeded() {
    if (!_data.version || _data.version !== '1.0.0') {
      // Perform migrations here if needed in future
      _data.version = '1.0.0';
      saveData();
    }
  }
  
  /**
   * Emit custom event for data changes
   * @param {string} eventName - Event name
   * @param {*} detail - Event detail data
   */
  function emitEvent(eventName, detail = null) {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
    
    // Also emit to AppState if available
    if (typeof AppState !== 'undefined') {
      // Update AppState with latest stats
      AppState.user.totalStudyTime = _data.stats.totalStudyTime;
      AppState.user.questionsAnswered = _data.stats.totalQuestions;
      AppState.user.correctAnswers = _data.stats.correctAnswers;
    }
  }
  
  /**
   * Record a question attempt with full tracking
   * @param {Object} attemptData - Attempt data
   * @param {string} attemptData.questionId - Unique question identifier
   * @param {boolean} attemptData.correct - Whether answer was correct
   * @param {number} attemptData.timeSpent - Time spent in seconds
   * @param {number} attemptData.lectureId - Lecture ID (1-9)
   * @param {string[]} attemptData.topics - Array of topic tags
   * @param {string} attemptData.difficulty - Difficulty level
   * @param {string} [attemptData.section] - Section identifier (A/B/C)
   * @returns {Object} Recorded attempt with calculated metrics
   * 
   * @example
   * KnowledgeTracker.recordAttempt({
   *   questionId: 'lecture3_q12',
   *   correct: false,
   *   timeSpent: 120,
   *   lectureId: 3,
   *   topics: ['Joins', 'Self-joins'],
   *   difficulty: 'hard'
   * });
   */
  function recordAttempt(attemptData) {
    if (!_data) init();
    
    const attempt = {
      id: `${attemptData.questionId}_${Date.now()}`,
      questionId: attemptData.questionId,
      correct: attemptData.correct,
      timeSpent: attemptData.timeSpent,
      lectureId: attemptData.lectureId,
      topics: attemptData.topics || [],
      difficulty: attemptData.difficulty || 'medium',
      section: attemptData.section || null,
      timestamp: new Date()
    };
    
    // Add to attempts array
    _data.attempts.push(attempt);
    
    // Update topic tracking
    _updateTopicStats(attempt);
    
    // Update lecture tracking
    _updateLectureStats(attempt);
    
    // Update streaks
    _updateStreaks(attempt);
    
    // Update spaced repetition schedule
    _updateSRSchedule(attempt);
    
    // Update patterns
    _updatePatterns(attempt);
    
    // Update daily activity
    _updateDailyActivity(attempt);
    
    // Update overall stats
    _updateStats(attempt);
    
    // Save data
    saveData();
    
    // Emit event
    emitEvent(EVENTS.ATTEMPT_RECORDED, { attempt, stats: getQuickStats() });
    
    return attempt;
  }
  
  /**
   * Update topic statistics
   * @private
   */
  function _updateTopicStats(attempt) {
    attempt.topics.forEach(topic => {
      if (!_data.topics[topic]) {
        _data.topics[topic] = {
          name: topic,
          totalAttempts: 0,
          correctCount: 0,
          incorrectCount: 0,
          totalTimeSpent: 0,
          averageTime: 0,
          accuracy: 0,
          mastery: 0,
          streak: 0,
          lastStudied: null,
          firstStudied: null,
          attemptHistory: []
        };
      }
      
      const topicData = _data.topics[topic];
      topicData.totalAttempts++;
      topicData.totalTimeSpent += attempt.timeSpent;
      
      if (attempt.correct) {
        topicData.correctCount++;
        topicData.streak = (topicData.streak || 0) + 1;
      } else {
        topicData.incorrectCount++;
        topicData.streak = 0;
      }
      
      topicData.averageTime = Math.round(topicData.totalTimeSpent / topicData.totalAttempts);
      topicData.accuracy = Math.round((topicData.correctCount / topicData.totalAttempts) * 100);
      topicData.lastStudied = attempt.timestamp.toISOString();
      
      if (!topicData.firstStudied) {
        topicData.firstStudied = attempt.timestamp.toISOString();
      }
      
      // Keep last 50 attempts for history
      topicData.attemptHistory.push({
        correct: attempt.correct,
        timeSpent: attempt.timeSpent,
        timestamp: attempt.timestamp.toISOString()
      });
      if (topicData.attemptHistory.length > 50) {
        topicData.attemptHistory.shift();
      }
      
      // Calculate mastery (weighted by accuracy and number of attempts)
      const attemptWeight = Math.min(topicData.totalAttempts / 10, 1);
      topicData.mastery = Math.round(topicData.accuracy * attemptWeight);
    });
    
    emitEvent(EVENTS.MASTERY_UPDATED, { topics: attempt.topics });
  }
  
  /**
   * Update lecture statistics
   * @private
   */
  function _updateLectureStats(attempt) {
    const lectureId = attempt.lectureId;
    if (!lectureId) return;
    
    if (!_data.lectures[lectureId]) {
      _data.lectures[lectureId] = {
        id: lectureId,
        totalAttempts: 0,
        correctCount: 0,
        totalTimeSpent: 0,
        lastStudied: null,
        topicsCovered: new Set()
      };
    }
    
    const lecture = _data.lectures[lectureId];
    lecture.totalAttempts++;
    lecture.totalTimeSpent += attempt.timeSpent;
    
    if (attempt.correct) {
      lecture.correctCount++;
    }
    
    lecture.lastStudied = attempt.timestamp.toISOString();
    attempt.topics.forEach(t => lecture.topicsCovered.add(t));
  }
  
  /**
   * Update streak tracking
   * @private
   */
  function _updateStreaks(attempt) {
    // Global streak tracking
    const today = attempt.timestamp.toDateString();
    const lastDate = _data.stats.lastStudyDate 
      ? new Date(_data.stats.lastStudyDate).toDateString() 
      : null;
    
    if (lastDate !== today) {
      if (lastDate) {
        const yesterday = new Date(attempt.timestamp);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate === yesterday.toDateString()) {
          _data.stats.currentStreak++;
        } else {
          _data.stats.currentStreak = 1;
        }
      } else {
        _data.stats.currentStreak = 1;
      }
      
      _data.stats.lastStudyDate = attempt.timestamp.toISOString();
      
      if (_data.stats.currentStreak > _data.stats.longestStreak) {
        _data.stats.longestStreak = _data.stats.currentStreak;
      }
      
      emitEvent(EVENTS.STREAK_CHANGED, { 
        current: _data.stats.currentStreak, 
        longest: _data.stats.longestStreak 
      });
    }
    
    // Topic-specific streaks
    attempt.topics.forEach(topic => {
      if (!_data.streaks[topic]) {
        _data.streaks[topic] = { current: 0, longest: 0, lastDate: null };
      }
      
      const topicStreak = _data.streaks[topic];
      const topicLastDate = topicStreak.lastDate 
        ? new Date(topicStreak.lastDate).toDateString() 
        : null;
      
      if (topicLastDate !== today) {
        if (attempt.correct) {
          topicStreak.current++;
          if (topicStreak.current > topicStreak.longest) {
            topicStreak.longest = topicStreak.current;
          }
        } else {
          topicStreak.current = 0;
        }
        topicStreak.lastDate = attempt.timestamp.toISOString();
      } else if (attempt.correct) {
        // Already studied today, just increment if correct
        // (this might double-count, so we check if we should)
      }
    });
  }
  
  /**
   * Update spaced repetition schedule
   * @private
   */
  function _updateSRSchedule(attempt) {
    attempt.topics.forEach(topic => {
      if (!_data.srSchedule[topic]) {
        _data.srSchedule[topic] = {
          level: 0,
          nextReview: null,
          lastReviewed: null,
          reviewCount: 0
        };
      }
      
      const schedule = _data.srSchedule[topic];
      schedule.lastReviewed = attempt.timestamp.toISOString();
      schedule.reviewCount++;
      
      if (attempt.correct) {
        // Move up a level if correct
        schedule.level = Math.min(schedule.level + 1, SR_INTERVALS.length - 1);
      } else {
        // Reset to level 0 if incorrect
        schedule.level = 0;
      }
      
      // Calculate next review date
      const daysUntilReview = SR_INTERVALS[schedule.level];
      const nextReview = new Date(attempt.timestamp);
      nextReview.setDate(nextReview.getDate() + daysUntilReview);
      schedule.nextReview = nextReview.toISOString();
    });
  }
  
  /**
   * Update pattern tracking (common mistakes, slow questions)
   * @private
   */
  function _updatePatterns(attempt) {
    // Track wrong answers by question pattern
    if (!attempt.correct) {
      const pattern = _extractQuestionPattern(attempt);
      if (pattern) {
        if (!_data.patterns.wrongAnswers[pattern]) {
          _data.patterns.wrongAnswers[pattern] = { count: 0, questions: [] };
        }
        _data.patterns.wrongAnswers[pattern].count++;
        _data.patterns.wrongAnswers[pattern].questions.push(attempt.questionId);
      }
    }
    
    // Track slow questions (taking > 2x average time)
    const avgTime = _data.stats.averageTimePerQuestion || 60;
    if (attempt.timeSpent > avgTime * 2) {
      if (!_data.patterns.slowQuestions[attempt.questionId]) {
        _data.patterns.slowQuestions[attempt.questionId] = {
          count: 0,
          averageTime: 0,
          topic: attempt.topics[0]
        };
      }
      const slow = _data.patterns.slowQuestions[attempt.questionId];
      slow.count++;
      slow.averageTime = (slow.averageTime * (slow.count - 1) + attempt.timeSpent) / slow.count;
    }
  }
  
  /**
   * Extract pattern from attempt for categorization
   * @private
   */
  function _extractQuestionPattern(attempt) {
    // Simple pattern extraction based on topics
    if (attempt.topics.includes('Joins')) return 'joins';
    if (attempt.topics.includes('Subqueries')) return 'subqueries';
    if (attempt.topics.includes('CTEs')) return 'ctes';
    if (attempt.topics.includes('Triggers')) return 'triggers';
    if (attempt.topics.includes('Indexes')) return 'indexes';
    if (attempt.topics.includes('Relational Algebra')) return 'relational_algebra';
    if (attempt.topics.includes('EERD') || attempt.topics.includes('Chen Notation')) return 'eerd';
    if (attempt.topics.includes('Transaction')) return 'transactions';
    return null;
  }
  
  /**
   * Update daily activity log
   * @private
   */
  function _updateDailyActivity(attempt) {
    const dateKey = attempt.timestamp.toISOString().split('T')[0];
    
    if (!_data.dailyActivity[dateKey]) {
      _data.dailyActivity[dateKey] = {
        date: dateKey,
        questionsAnswered: 0,
        correctAnswers: 0,
        totalTimeSpent: 0,
        topicsStudied: new Set(),
        lecturesStudied: new Set()
      };
    }
    
    const day = _data.dailyActivity[dateKey];
    day.questionsAnswered++;
    day.totalTimeSpent += attempt.timeSpent;
    
    if (attempt.correct) {
      day.correctAnswers++;
    }
    
    attempt.topics.forEach(t => day.topicsStudied.add(t));
    if (attempt.lectureId) {
      day.lecturesStudied.add(attempt.lectureId);
    }
  }
  
  /**
   * Update overall statistics
   * @private
   */
  function _updateStats(attempt) {
    _data.stats.totalQuestions++;
    _data.stats.totalStudyTime += attempt.timeSpent;
    
    if (attempt.correct) {
      _data.stats.correctAnswers++;
    }
    
    _data.stats.averageTimePerQuestion = Math.round(
      _data.stats.totalStudyTime / _data.stats.totalQuestions
    );
  }
  
  // ============================================
  // WEAK AREAS IDENTIFICATION
  // ============================================
  
  /**
   * Get weak areas (topics with accuracy < threshold)
   * @param {number} [threshold=60] - Accuracy threshold percentage
   * @returns {Object[]} Array of weak area objects sorted by priority
   * 
   * @example
   * const weakAreas = KnowledgeTracker.getWeakAreas(60);
   * // Returns: [{ topic: 'Joins', accuracy: 45, totalAttempts: 8, priority: 85 }, ...]
   */
  function getWeakAreas(threshold = 60) {
    if (!_data) init();
    
    const weakAreas = [];
    
    Object.values(_data.topics).forEach(topic => {
      if (topic.totalAttempts >= 3 && topic.accuracy < threshold) {
        const priority = _calculateWeakAreaPriority(topic);
        weakAreas.push({
          topic: topic.name,
          accuracy: topic.accuracy,
          totalAttempts: topic.totalAttempts,
          correctCount: topic.correctCount,
          averageTime: topic.averageTime,
          lastStudied: topic.lastStudied,
          streak: topic.streak,
          priority,
          status: 'weak',
          recommendation: _generateWeakAreaRecommendation(topic)
        });
      }
    });
    
    // Sort by priority (highest first)
    return weakAreas.sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Get topics needing practice (60-80% accuracy)
   * @returns {Object[]} Array of topics needing practice
   */
  function getNeedsPracticeAreas() {
    if (!_data) init();
    
    const areas = [];
    
    Object.values(_data.topics).forEach(topic => {
      if (topic.totalAttempts >= 3 && 
          topic.accuracy >= MASTERY_THRESHOLDS.NEEDS_PRACTICE.min &&
          topic.accuracy < MASTERY_THRESHOLDS.NEEDS_PRACTICE.max) {
        areas.push({
          topic: topic.name,
          accuracy: topic.accuracy,
          totalAttempts: topic.totalAttempts,
          correctCount: topic.correctCount,
          averageTime: topic.averageTime,
          lastStudied: topic.lastStudied,
          status: 'needs_practice',
          recommendation: _generatePracticeRecommendation(topic)
        });
      }
    });
    
    return areas.sort((a, b) => a.accuracy - b.accuracy);
  }
  
  /**
   * Get strong areas (>80% accuracy)
   * @param {number} [threshold=80] - Accuracy threshold
   * @returns {Object[]} Array of strong areas
   */
  function getStrongAreas(threshold = 80) {
    if (!_data) init();
    
    const areas = [];
    
    Object.values(_data.topics).forEach(topic => {
      if (topic.totalAttempts >= 5 && topic.accuracy >= threshold) {
        areas.push({
          topic: topic.name,
          accuracy: topic.accuracy,
          totalAttempts: topic.totalAttempts,
          mastery: topic.mastery,
          streak: topic.streak,
          status: 'strong'
        });
      }
    });
    
    return areas.sort((a, b) => b.accuracy - a.accuracy);
  }
  
  /**
   * Calculate priority score for a weak area
   * @private
   */
  function _calculateWeakAreaPriority(topic) {
    // Higher priority for:
    // - Lower accuracy
    // - More attempts (persistent struggle)
    // - Recently studied (fresh in mind)
    // - Core topics (appear in exam more)
    
    const accuracyFactor = (100 - topic.accuracy) / 100;
    const attemptFactor = Math.min(topic.totalAttempts / 10, 1);
    
    // Check if recently studied (within 3 days)
    let recencyFactor = 0;
    if (topic.lastStudied) {
      const daysSince = (Date.now() - new Date(topic.lastStudied).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince <= 3) {
        recencyFactor = (3 - daysSince) / 3;
      }
    }
    
    // Core topics weight (topics from lectures 3, 5, 6, 7 are more important)
    const coreTopics = ['Joins', 'Subqueries', 'CTEs', 'Triggers', 'Relational Algebra', 'Indexes'];
    const coreWeight = coreTopics.includes(topic.name) ? 1.2 : 1.0;
    
    return Math.round((accuracyFactor * 0.5 + attemptFactor * 0.3 + recencyFactor * 0.2) * 100 * coreWeight);
  }
  
  /**
   * Generate recommendation for weak area
   * @private
   */
  function _generateWeakAreaRecommendation(topic) {
    if (topic.accuracy < 40) {
      return `Review ${topic.name} fundamentals. Start with easy questions and study the concepts.`;
    } else if (topic.accuracy < 50) {
      return `Practice more ${topic.name} questions. Focus on understanding common patterns.`;
    } else {
      return `You're getting close! Keep practicing ${topic.name} to reach mastery.`;
    }
  }
  
  /**
   * Generate recommendation for practice area
   * @private
   */
  function _generatePracticeRecommendation(topic) {
    return `Continue practicing ${topic.name}. Try some harder questions to solidify understanding.`;
  }
  
  /**
   * Identify specific question patterns the user struggles with
   * @returns {Object} Pattern analysis
   */
  function getQuestionPatterns() {
    if (!_data) init();
    
    const patterns = {
      weakPatterns: [],
      slowPatterns: [],
      commonMistakes: []
    };
    
    // Analyze wrong answer patterns
    Object.entries(_data.patterns.wrongAnswers)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .forEach(([pattern, data]) => {
        patterns.weakPatterns.push({
          pattern,
          count: data.count,
          questions: [...new Set(data.questions)].slice(0, 3)
        });
      });
    
    // Analyze slow question patterns
    const slowEntries = Object.entries(_data.patterns.slowQuestions)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
    
    slowEntries.forEach(([questionId, data]) => {
      patterns.slowPatterns.push({
        questionId,
        topic: data.topic,
        averageTime: Math.round(data.averageTime),
        attempts: data.count
      });
    });
    
    return patterns;
  }
  
  // ============================================
  // RECOMMENDATIONS & STUDY PLANNING
  // ============================================
  
  /**
   * Get recommended lessons to focus on
   * @param {number} [limit=3] - Maximum number of lessons to recommend
   * @returns {Object[]} Array of recommended lesson objects
   * 
   * @example
   * const lessons = KnowledgeTracker.getRecommendedLessons();
   * // Returns lessons based on weak areas and dependencies
   */
  function getRecommendedLessons(limit = 3) {
    if (!_data) init();
    
    const weakAreas = getWeakAreas(70);
    const lessonScores = {};
    
    // Score lessons based on weak topics
    weakAreas.forEach(area => {
      const lectures = TOPIC_TO_LECTURE[area.topic] || [];
      lectures.forEach(lectureId => {
        if (!lessonScores[lectureId]) {
          lessonScores[lectureId] = {
            id: lectureId,
            score: 0,
            weakTopics: [],
            ...LECTURE_TOPICS[lectureId]
          };
        }
        lessonScores[lectureId].score += area.priority;
        lessonScores[lectureId].weakTopics.push(area.topic);
      });
    });
    
    // Add unscanned lectures with weak foundations
    Object.entries(_data.lectures).forEach(([lectureId, lecture]) => {
      const id = parseInt(lectureId);
      const accuracy = lecture.totalAttempts > 0 
        ? (lecture.correctCount / lecture.totalAttempts) * 100 
        : 0;
      
      if (accuracy < 60 && !lessonScores[id]) {
        lessonScores[id] = {
          id,
          score: 50,
          weakTopics: [],
          accuracy: Math.round(accuracy),
          ...LECTURE_TOPICS[id]
        };
      }
    });
    
    // Sort by score and return top recommendations
    return Object.values(lessonScores)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(lesson => ({
        lectureId: lesson.id,
        title: lesson.title,
        reason: lesson.weakTopics.length > 0 
          ? `Weak in: ${lesson.weakTopics.slice(0, 2).join(', ')}`
          : `Low accuracy (${lesson.accuracy}%)`,
        priority: lesson.score,
        topics: lesson.weakTopics.length > 0 ? lesson.weakTopics : lesson.topics.slice(0, 3)
      }));
  }
  
  /**
   * Get list of topics needing work
   * @param {Object} options - Options for filtering
   * @param {boolean} [options.includeWeak=true] - Include weak topics
   * @param {boolean} [options.includeNeedsPractice=true] - Include needs practice topics
   * @returns {Object[]} Array of topic objects
   */
  function getWeakTopics(options = {}) {
    const { includeWeak = true, includeNeedsPractice = true } = options;
    
    const topics = [];
    
    if (includeWeak) {
      topics.push(...getWeakAreas());
    }
    
    if (includeNeedsPractice) {
      topics.push(...getNeedsPracticeAreas());
    }
    
    // Sort by accuracy ascending
    return topics.sort((a, b) => a.accuracy - b.accuracy);
  }
  
  /**
   * Generate a personalized study plan
   * @param {Object} options - Study plan options
   * @param {number} [options.durationMinutes=60] - Available study time
   * @param {boolean} [options.focusOnWeak=true] - Focus on weak areas
   * @param {boolean} [options.includeReview=true] - Include spaced repetition review
   * @returns {Object} Comprehensive study plan
   * 
   * @example
   * const plan = KnowledgeTracker.getStudyPlan({ durationMinutes: 90 });
   * // Returns: {
   * //   duration: 90,
   * //   sections: [...],
   * //   estimatedQuestions: 15,
   * //   topics: [...]
   * // }
   */
  function getStudyPlan(options = {}) {
    if (!_data) init();
    
    const { 
      durationMinutes = 60, 
      focusOnWeak = true,
      includeReview = true 
    } = options;
    
    const plan = {
      generatedAt: new Date().toISOString(),
      duration: durationMinutes,
      sections: [],
      estimatedQuestions: 0,
      topics: [],
      tips: []
    };
    
    let remainingTime = durationMinutes;
    
    // Section 1: Spaced Repetition Review (20% of time)
    if (includeReview) {
      const reviewTopics = getDueForReview().slice(0, 3);
      if (reviewTopics.length > 0) {
        const reviewTime = Math.min(Math.floor(durationMinutes * 0.2), 15);
        plan.sections.push({
          name: 'Quick Review',
          type: 'review',
          duration: reviewTime,
          topics: reviewTopics.map(t => t.topic),
          description: 'Review topics due for spaced repetition'
        });
        remainingTime -= reviewTime;
        plan.topics.push(...reviewTopics.map(t => t.topic));
      }
    }
    
    // Section 2: Weak Areas Focus (50% of time)
    if (focusOnWeak) {
      const weakAreas = getWeakAreas().slice(0, 3);
      if (weakAreas.length > 0) {
        const weakTime = Math.floor(durationMinutes * 0.5);
        plan.sections.push({
          name: 'Focus Areas',
          type: 'weak_areas',
          duration: weakTime,
          topics: weakAreas.map(a => a.topic),
          description: 'Focus on your weakest topics',
          areas: weakAreas
        });
        remainingTime -= weakTime;
        plan.topics.push(...weakAreas.map(a => a.topic));
        
        // Add tips based on weak areas
        weakAreas.slice(0, 2).forEach(area => {
          plan.tips.push(area.recommendation);
        });
      }
    }
    
    // Section 3: Practice Mix (30% of time)
    const needsPractice = getNeedsPracticeAreas().slice(0, 2);
    if (needsPractice.length > 0) {
      const practiceTime = Math.max(Math.floor(durationMinutes * 0.3), remainingTime);
      plan.sections.push({
        name: 'Practice Mix',
        type: 'practice',
        duration: practiceTime,
        topics: needsPractice.map(a => a.topic),
        description: 'Practice topics close to mastery'
      });
      plan.topics.push(...needsPractice.map(a => a.topic));
    }
    
    // Calculate estimated questions
    const avgTimePerQuestion = _data.stats.averageTimePerQuestion || 60;
    plan.estimatedQuestions = Math.floor(durationMinutes * 60 / avgTimePerQuestion);
    
    // Add general tips
    if (plan.tips.length < 3) {
      plan.tips.push('Take your time to understand each question');
      plan.tips.push('Review explanations for incorrect answers');
    }
    
    return plan;
  }
  
  /**
   * Get next recommended activity based on current state
   * @returns {Object} Recommended activity
   * 
   * @example
   * const next = KnowledgeTracker.getNextRecommendedActivity();
   * // Returns: { type: 'lecture', id: 3, reason: '...' }
   */
  function getNextRecommendedActivity() {
    if (!_data) init();
    
    const today = new Date().toDateString();
    const lastStudyDate = _data.stats.lastStudyDate 
      ? new Date(_data.stats.lastStudyDate).toDateString() 
      : null;
    
    // Check if daily goal met
    const dailyActivity = _data.dailyActivity[today.split('T')[0]];
    const dailyProgress = dailyActivity ? dailyActivity.questionsAnswered : 0;
    
    if (dailyProgress < _data.settings.dailyGoal) {
      // Still need to meet daily goal
      const weakAreas = getWeakAreas();
      if (weakAreas.length > 0) {
        const area = weakAreas[0];
        const lectures = TOPIC_TO_LECTURE[area.topic];
        return {
          type: 'practice',
          target: area.topic,
          lectureId: lectures ? lectures[0] : null,
          reason: `You need ${(_data.settings.dailyGoal - dailyProgress)} more questions to meet your daily goal. Focus on ${area.topic} (${area.accuracy}% accuracy).`,
          action: 'Start Practice Quiz',
          estimatedTime: 15
        };
      }
    }
    
    // Check for due reviews
    const dueReviews = getDueForReview();
    if (dueReviews.length > 0) {
      const topic = dueReviews[0];
      return {
        type: 'review',
        target: topic.topic,
        reason: `${topic.topic} is due for review based on spaced repetition.`,
        action: 'Review Topic',
        estimatedTime: 10
      };
    }
    
    // Check for incomplete lectures
    const incompleteLectures = getIncompleteLectures();
    if (incompleteLectures.length > 0) {
      const lecture = incompleteLectures[0];
      return {
        type: 'lecture',
        target: lecture.title,
        lectureId: lecture.id,
        reason: `Continue with Lecture ${lecture.id}: ${lecture.title}`,
        action: 'Start Lecture',
        estimatedTime: parseInt(lecture.estimatedTime) || 60
      };
    }
    
    // Everything complete - suggest review or challenge
    const strongAreas = getStrongAreas();
    if (strongAreas.length > 0) {
      return {
        type: 'challenge',
        target: strongAreas[0].topic,
        reason: 'Try some expert-level questions in your strongest area!',
        action: 'Take Challenge',
        estimatedTime: 20
      };
    }
    
    return {
      type: 'explore',
      target: null,
      reason: 'Explore the course material and start learning!',
      action: 'Browse Lectures',
      estimatedTime: 30
    };
  }
  
  /**
   * Get incomplete lectures
   * @returns {Object[]} Array of incomplete lecture objects
   */
  function getIncompleteLectures() {
    const incomplete = [];
    
    Object.entries(LECTURE_TOPICS).forEach(([id, data]) => {
      const lectureId = parseInt(id);
      const progress = _data.lectures[lectureId];
      
      // Lecture is incomplete if no progress or accuracy < 80%
      const accuracy = progress && progress.totalAttempts > 0
        ? (progress.correctCount / progress.totalAttempts) * 100
        : 0;
      
      if (!progress || accuracy < 80) {
        incomplete.push({
          id: lectureId,
          accuracy: Math.round(accuracy),
          totalAttempts: progress ? progress.totalAttempts : 0,
          ...data
        });
      }
    });
    
    return incomplete.sort((a, b) => a.id - b.id);
  }
  
  /**
   * Get topics due for review (spaced repetition)
   * @returns {Object[]} Array of topics due for review
   */
  function getDueForReview() {
    const due = [];
    const now = new Date();
    
    Object.entries(_data.srSchedule).forEach(([topic, schedule]) => {
      if (schedule.nextReview) {
        const nextReview = new Date(schedule.nextReview);
        if (nextReview <= now) {
          const topicData = _data.topics[topic] || {};
          due.push({
            topic,
            nextReview: schedule.nextReview,
            daysOverdue: Math.floor((now - nextReview) / (1000 * 60 * 60 * 24)),
            currentLevel: schedule.level,
            accuracy: topicData.accuracy || 0
          });
        }
      }
    });
    
    // Sort by days overdue (most overdue first)
    return due.sort((a, b) => b.daysOverdue - a.daysOverdue);
  }
  
  // ============================================
  // LEARNING ANALYTICS
  // ============================================
  
  /**
   * Get comprehensive learning analytics
   * @returns {Object} Complete analytics object
   */
  function getAnalytics() {
    if (!_data) init();
    
    return {
      overview: getQuickStats(),
      trends: getTrends(),
      timeAnalysis: getTimeAnalysis(),
      topicBreakdown: getTopicBreakdown(),
      lectureProgress: getLectureProgress(),
      dailyActivity: getRecentActivity(30),
      velocity: getLearningVelocity(),
      patterns: getQuestionPatterns()
    };
  }
  
  /**
   * Get quick stats summary
   * @returns {Object} Quick statistics
   */
  function getQuickStats() {
    if (!_data) init();
    
    const accuracy = _data.stats.totalQuestions > 0
      ? Math.round((_data.stats.correctAnswers / _data.stats.totalQuestions) * 100)
      : 0;
    
    const totalTopics = Object.keys(_data.topics).length;
    const masteredTopics = Object.values(_data.topics).filter(t => t.mastery >= 80).length;
    
    return {
      totalQuestions: _data.stats.totalQuestions,
      correctAnswers: _data.stats.correctAnswers,
      accuracy,
      totalStudyTime: formatDuration(_data.stats.totalStudyTime),
      totalStudyTimeSeconds: _data.stats.totalStudyTime,
      averageTimePerQuestion: _data.stats.averageTimePerQuestion,
      currentStreak: _data.stats.currentStreak,
      longestStreak: _data.stats.longestStreak,
      totalTopics,
      masteredTopics,
      masteryPercentage: totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0
    };
  }
  
  /**
   * Get performance trends over time
   * @param {number} [days=30] - Number of days to analyze
   * @returns {Object[]} Daily trend data
   */
  function getTrends(days = 30) {
    if (!_data) init();
    
    const trends = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      const activity = _data.dailyActivity[dateKey];
      
      if (activity) {
        trends.push({
          date: dateKey,
          questions: activity.questionsAnswered,
          correct: activity.correctAnswers,
          accuracy: activity.questionsAnswered > 0
            ? Math.round((activity.correctAnswers / activity.questionsAnswered) * 100)
            : 0,
          timeSpent: activity.totalTimeSpent,
          topics: Array.from(activity.topicsStudied || []),
          lectures: Array.from(activity.lecturesStudied || [])
        });
      } else {
        trends.push({
          date: dateKey,
          questions: 0,
          correct: 0,
          accuracy: 0,
          timeSpent: 0,
          topics: [],
          lectures: []
        });
      }
    }
    
    return trends;
  }
  
  /**
   * Get time analysis statistics
   * @returns {Object} Time analysis
   */
  function getTimeAnalysis() {
    if (!_data) init();
    
    const timeByLecture = {};
    const timeByTopic = {};
    
    // Calculate time by lecture
    Object.entries(_data.lectures).forEach(([id, lecture]) => {
      timeByLecture[id] = {
        lectureId: parseInt(id),
        title: LECTURE_TOPICS[id]?.title || `Lecture ${id}`,
        timeSpent: lecture.totalTimeSpent || 0,
        formattedTime: formatDuration(lecture.totalTimeSpent || 0)
      };
    });
    
    // Calculate time by topic
    Object.entries(_data.topics).forEach(([name, topic]) => {
      timeByTopic[name] = {
        topic: name,
        timeSpent: topic.totalTimeSpent || 0,
        formattedTime: formatDuration(topic.totalTimeSpent || 0),
        averageTime: topic.averageTime || 0
      };
    });
    
    // Find most time-consuming topics
    const mostTimeConsuming = Object.values(timeByTopic)
      .sort((a, b) => b.timeSpent - a.timeSpent)
      .slice(0, 5);
    
    return {
      totalTime: _data.stats.totalStudyTime,
      formattedTotalTime: formatDuration(_data.stats.totalStudyTime),
      averageTimePerQuestion: _data.stats.averageTimePerQuestion,
      timeByLecture: Object.values(timeByLecture).sort((a, b) => b.timeSpent - a.timeSpent),
      timeByTopic: Object.values(timeByTopic).sort((a, b) => b.timeSpent - a.timeSpent),
      mostTimeConsuming
    };
  }
  
  /**
   * Get detailed topic breakdown
   * @returns {Object[]} Array of topic details
   */
  function getTopicBreakdown() {
    if (!_data) init();
    
    return Object.values(_data.topics)
      .map(topic => {
        const status = topic.accuracy < 60 ? 'weak' 
          : topic.accuracy < 80 ? 'needs_practice' 
          : 'strong';
        
        return {
          name: topic.name,
          totalAttempts: topic.totalAttempts,
          accuracy: topic.accuracy,
          mastery: topic.mastery,
          streak: topic.streak,
          averageTime: topic.averageTime,
          status,
          lastStudied: topic.lastStudied,
          firstStudied: topic.firstStudied,
          correctCount: topic.correctCount,
          incorrectCount: topic.incorrectCount
        };
      })
      .sort((a, b) => b.mastery - a.mastery);
  }
  
  /**
   * Get lecture progress summary
   * @returns {Object[]} Array of lecture progress
   */
  function getLectureProgress() {
    if (!_data) init();
    
    const progress = [];
    
    Object.entries(LECTURE_TOPICS).forEach(([id, data]) => {
      const lectureId = parseInt(id);
      const lecture = _data.lectures[lectureId] || { 
        totalAttempts: 0, 
        correctCount: 0,
        totalTimeSpent: 0 
      };
      
      const accuracy = lecture.totalAttempts > 0
        ? Math.round((lecture.correctCount / lecture.totalAttempts) * 100)
        : 0;
      
      progress.push({
        id: lectureId,
        title: data.title,
        totalAttempts: lecture.totalAttempts,
        correctCount: lecture.correctCount,
        accuracy,
        timeSpent: lecture.totalTimeSpent,
        formattedTime: formatDuration(lecture.totalTimeSpent),
        lastStudied: lecture.lastStudied,
        status: accuracy >= 80 ? 'completed' : lecture.totalAttempts > 0 ? 'in_progress' : 'not_started'
      });
    });
    
    return progress.sort((a, b) => a.id - b.id);
  }
  
  /**
   * Get recent daily activity
   * @param {number} [days=7] - Number of days
   * @returns {Object[]} Daily activity data
   */
  function getRecentActivity(days = 7) {
    if (!_data) init();
    
    const activity = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      const dayData = _data.dailyActivity[dateKey];
      
      activity.push({
        date: dateKey,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        questionsAnswered: dayData?.questionsAnswered || 0,
        correctAnswers: dayData?.correctAnswers || 0,
        accuracy: dayData?.questionsAnswered > 0
          ? Math.round((dayData.correctAnswers / dayData.questionsAnswered) * 100)
          : 0,
        timeSpent: dayData?.totalTimeSpent || 0,
        formattedTime: formatDuration(dayData?.totalTimeSpent || 0),
        goalMet: (dayData?.questionsAnswered || 0) >= _data.settings.dailyGoal
      });
    }
    
    return activity;
  }
  
  /**
   * Calculate learning velocity (improvement rate)
   * @returns {Object} Velocity metrics
   */
  function getLearningVelocity() {
    if (!_data) init();
    
    const trends = getTrends(14);
    const activeDays = trends.filter(t => t.questions > 0);
    
    if (activeDays.length < 3) {
      return {
        status: 'insufficient_data',
        message: 'Answer more questions to calculate your learning velocity',
        weeklyAccuracy: null,
        improvementRate: null,
        trendDirection: 'neutral'
      };
    }
    
    // Calculate weekly accuracy trends
    const week1 = activeDays.slice(0, Math.ceil(activeDays.length / 2));
    const week2 = activeDays.slice(Math.floor(activeDays.length / 2));
    
    const week1Accuracy = week1.reduce((sum, d) => sum + d.accuracy, 0) / week1.length;
    const week2Accuracy = week2.reduce((sum, d) => sum + d.accuracy, 0) / week2.length;
    
    const improvementRate = week2Accuracy - week1Accuracy;
    
    let trendDirection = 'neutral';
    let message = 'Your performance is steady';
    
    if (improvementRate > 10) {
      trendDirection = 'strongly_improving';
      message = 'Excellent progress! You\'re improving rapidly.';
    } else if (improvementRate > 5) {
      trendDirection = 'improving';
      message = 'Good progress! Keep up the momentum.';
    } else if (improvementRate < -10) {
      trendDirection = 'declining';
      message = 'Your accuracy has dropped. Consider reviewing fundamentals.';
    } else if (improvementRate < -5) {
      trendDirection = 'slightly_declining';
      message = 'Slight decline detected. Focus on weak areas.';
    }
    
    return {
      status: 'calculated',
      message,
      week1Accuracy: Math.round(week1Accuracy),
      week2Accuracy: Math.round(week2Accuracy),
      improvementRate: Math.round(improvementRate * 10) / 10,
      trendDirection,
      activeDays: activeDays.length,
      averageQuestionsPerDay: Math.round(
        activeDays.reduce((sum, d) => sum + d.questions, 0) / activeDays.length
      )
    };
  }
  
  // ============================================
  // STUDY SESSIONS
  // ============================================
  
  /**
   * Start a new study session
   * @returns {string} Session ID
   */
  function startSession() {
    if (!_data) init();
    
    _currentSession = {
      id: `session_${Date.now()}`,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      questionsAttempted: 0,
      correctAnswers: 0,
      topicsStudied: new Set(),
      lecturesStudied: new Set()
    };
    
    return _currentSession.id;
  }
  
  /**
   * End the current study session
   * @returns {Object} Session summary
   */
  function endSession() {
    if (!_currentSession) return null;
    
    _currentSession.endTime = new Date().toISOString();
    const start = new Date(_currentSession.startTime);
    const end = new Date(_currentSession.endTime);
    _currentSession.duration = Math.round((end - start) / 1000);
    
    // Add to sessions history
    _data.sessions.push({
      ..._currentSession,
      topicsStudied: Array.from(_currentSession.topicsStudied),
      lecturesStudied: Array.from(_currentSession.lecturesStudied)
    });
    
    // Keep only last 100 sessions
    if (_data.sessions.length > 100) {
      _data.sessions = _data.sessions.slice(-100);
    }
    
    saveData();
    
    const summary = { ..._currentSession };
    _currentSession = null;
    
    return summary;
  }
  
  /**
   * Get recent study sessions
   * @param {number} [limit=10] - Maximum sessions to return
   * @returns {Object[]} Recent sessions
   */
  function getRecentSessions(limit = 10) {
    if (!_data) init();
    
    return _data.sessions
      .slice(-limit)
      .reverse()
      .map(session => ({
        ...session,
        formattedDuration: formatDuration(session.duration)
      }));
  }
  
  // ============================================
  // SPACED REPETITION
  // ============================================
  
  /**
   * Get full spaced repetition schedule
   * @returns {Object} SR schedule for all topics
   */
  function getSpacedRepetitionSchedule() {
    if (!_data) init();
    
    const schedule = [];
    const now = new Date();
    
    Object.entries(_data.srSchedule).forEach(([topic, data]) => {
      const nextReview = data.nextReview ? new Date(data.nextReview) : null;
      const daysUntil = nextReview 
        ? Math.ceil((nextReview - now) / (1000 * 60 * 60 * 24))
        : null;
      
      const topicData = _data.topics[topic] || {};
      
      schedule.push({
        topic,
        level: data.level,
        nextReview: data.nextReview,
        daysUntilReview: daysUntil,
        isDue: daysUntil !== null && daysUntil <= 0,
        reviewCount: data.reviewCount,
        lastReviewed: data.lastReviewed,
        accuracy: topicData.accuracy || 0,
        totalAttempts: topicData.totalAttempts || 0
      });
    });
    
    return schedule.sort((a, b) => (a.daysUntilReview || 999) - (b.daysUntilReview || 999));
  }
  
  // ============================================
  // EXPORT & REPORT FUNCTIONS
  // ============================================
  
  /**
   * Export all progress data to JSON
   * @param {Object} options - Export options
   * @param {boolean} [options.includeAttempts=true] - Include individual attempts
   * @param {boolean} [options.pretty=true] - Pretty print JSON
   * @returns {string} JSON string
   * 
   * @example
   * const json = KnowledgeTracker.exportProgress();
   * downloadFile(json, 'my-progress.json');
   */
  function exportProgress(options = {}) {
    if (!_data) init();
    
    const { includeAttempts = true, pretty = true } = options;
    
    const exportData = {
      exportDate: new Date().toISOString(),
      version: _data.version,
      summary: getQuickStats(),
      topicBreakdown: getTopicBreakdown(),
      lectureProgress: getLectureProgress(),
      weakAreas: getWeakAreas(),
      strongAreas: getStrongAreas(),
      learningVelocity: getLearningVelocity(),
      settings: _data.settings
    };
    
    if (includeAttempts) {
      exportData.attempts = _data.attempts;
      exportData.dailyActivity = _data.dailyActivity;
      exportData.sessions = _data.sessions;
    }
    
    emitEvent(EVENTS.DATA_EXPORTED, { timestamp: exportData.exportDate });
    
    return JSON.stringify(exportData, null, pretty ? 2 : 0);
  }
  
  /**
   * Generate a text report of strengths and weaknesses
   * @returns {string} Formatted text report
   * 
   * @example
   * const report = KnowledgeTracker.generateReport();
   * console.log(report);
   */
  function generateReport() {
    if (!_data) init();
    
    const stats = getQuickStats();
    const weakAreas = getWeakAreas();
    const strongAreas = getStrongAreas();
    const velocity = getLearningVelocity();
    
    let report = `
╔══════════════════════════════════════════════════════════════╗
║           ACS-3902 KNOWLEDGE TRACKER REPORT                  ║
╠══════════════════════════════════════════════════════════════╣
  Generated: ${new Date().toLocaleString()}

📊 OVERVIEW
────────────────────────────────────────────────────────────────
  Total Questions: ${stats.totalQuestions}
  Accuracy: ${stats.accuracy}%
  Study Time: ${stats.totalStudyTime}
  Current Streak: ${stats.currentStreak} days
  Topics Mastered: ${stats.masteredTopics}/${stats.totalTopics}

`;
    
    if (velocity.status === 'calculated') {
      report += `📈 LEARNING VELOCITY
────────────────────────────────────────────────────────────────
  Trend: ${velocity.trendDirection.replace(/_/g, ' ')}
  ${velocity.message}
  Improvement Rate: ${velocity.improvementRate > 0 ? '+' : ''}${velocity.improvementRate}%
  Average Daily Questions: ${velocity.averageQuestionsPerDay}

`;
    }
    
    if (weakAreas.length > 0) {
      report += `⚠️  AREAS NEEDING ATTENTION
────────────────────────────────────────────────────────────────
`;
      weakAreas.slice(0, 5).forEach((area, i) => {
        report += `  ${i + 1}. ${area.topic}
     Accuracy: ${area.accuracy}% (${area.correctCount}/${area.totalAttempts})
     ${area.recommendation}\n`;
      });
      report += '\n';
    }
    
    if (strongAreas.length > 0) {
      report += `💪 STRENGTHS
────────────────────────────────────────────────────────────────
`;
      strongAreas.slice(0, 5).forEach((area, i) => {
        report += `  ${i + 1}. ${area.topic} - ${area.accuracy}% accuracy\n`;
      });
      report += '\n';
    }
    
    report += `📚 LECTURE PROGRESS
────────────────────────────────────────────────────────────────
`;
    getLectureProgress().forEach(lecture => {
      const status = lecture.status === 'completed' ? '✅' 
        : lecture.status === 'in_progress' ? '🔄' 
        : '⭕';
      report += `  ${status} L${lecture.id}: ${lecture.title} (${lecture.accuracy}%)\n`;
    });
    
    report += `
╚══════════════════════════════════════════════════════════════╝
`;
    
    return report;
  }
  
  /**
   * Compare performance between two date ranges
   * @param {string|Date} startDate1 - Start of first period
   * @param {string|Date} endDate1 - End of first period
   * @param {string|Date} [startDate2] - Start of second period (defaults to period after endDate1)
   * @param {string|Date} [endDate2] - End of second period (defaults to now)
   * @returns {Object} Comparison results
   * 
   * @example
   * // Compare last week vs previous week
   * const comparison = KnowledgeTracker.compareProgress(
   *   '2025-03-01', '2025-03-07',
   *   '2025-03-08', '2025-03-14'
   * );
   */
  function compareProgress(startDate1, endDate1, startDate2, endDate2) {
    if (!_data) init();
    
    const d1 = {
      start: new Date(startDate1),
      end: new Date(endDate1)
    };
    
    // Default second period to same duration after first period
    if (!startDate2 || !endDate2) {
      const duration = d1.end - d1.start;
      d2 = {
        start: new Date(d1.end.getTime() + 1),
        end: new Date(d1.end.getTime() + 1 + duration)
      };
    } else {
      d2 = {
        start: new Date(startDate2),
        end: new Date(endDate2)
      };
    }
    
    // Filter attempts by date range
    const getStatsForPeriod = (start, end) => {
      const attempts = _data.attempts.filter(a => {
        const date = new Date(a.timestamp);
        return date >= start && date <= end;
      });
      
      const total = attempts.length;
      const correct = attempts.filter(a => a.correct).length;
      
      return {
        totalQuestions: total,
        correctAnswers: correct,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        totalTime: attempts.reduce((sum, a) => sum + a.timeSpent, 0),
        averageTime: total > 0 
          ? Math.round(attempts.reduce((sum, a) => sum + a.timeSpent, 0) / total)
          : 0,
        topicsStudied: [...new Set(attempts.flatMap(a => a.topics))]
      };
    };
    
    const period1 = getStatsForPeriod(d1.start, d1.end);
    const period2 = getStatsForPeriod(d2.start, d2.end);
    
    return {
      period1: {
        label: `${d1.start.toLocaleDateString()} - ${d1.end.toLocaleDateString()}`,
        ...period1,
        formattedTime: formatDuration(period1.totalTime)
      },
      period2: {
        label: `${d2.start.toLocaleDateString()} - ${d2.end.toLocaleDateString()}`,
        ...period2,
        formattedTime: formatDuration(period2.totalTime)
      },
      comparison: {
        accuracyChange: period2.accuracy - period1.accuracy,
        questionsChange: period2.totalQuestions - period1.totalQuestions,
        timeChange: period2.totalTime - period1.totalTime,
        improvement: period2.accuracy > period1.accuracy ? 'improved'
          : period2.accuracy < period1.accuracy ? 'declined'
          : 'stable'
      }
    };
  }
  
  /**
   * Import progress data from JSON
   * @param {string} jsonString - JSON data to import
   * @param {Object} options - Import options
   * @param {boolean} [options.merge=false] - Merge with existing data
   * @returns {boolean} Success status
   */
  function importProgress(jsonString, options = {}) {
    const { merge = false } = options;
    
    try {
      const imported = JSON.parse(jsonString);
      
      if (merge && _data) {
        // Merge logic would go here
        // For now, just overwrite with some merging
        _data.attempts = [..._data.attempts, ...(imported.attempts || [])];
        // Merge other fields as needed
      } else {
        _data = imported;
      }
      
      saveData();
      emitEvent(EVENTS.DATA_IMPORTED, { timestamp: new Date().toISOString() });
      return true;
    } catch (error) {
      console.error('[KnowledgeTracker] Import error:', error);
      return false;
    }
  }
  
  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  /**
   * Format duration in seconds to readable string
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  function formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }
  
  /**
   * Get raw data (for debugging/advanced use)
   * @returns {Object} Raw data object
   */
  function getRawData() {
    return _data;
  }
  
  /**
   * Reset all data (use with caution!)
   * @param {boolean} [confirm=false] - Must be true to actually reset
   * @returns {boolean} Success status
   */
  function resetData(confirm = false) {
    if (!confirm) {
      console.warn('[KnowledgeTracker] Reset requires confirm=true');
      return false;
    }
    
    _data = getDefaultData();
    saveData();
    console.log('[KnowledgeTracker] All data reset');
    return true;
  }
  
  /**
   * Update settings
   * @param {Object} settings - Settings to update
   */
  function updateSettings(settings) {
    if (!_data) init();
    _data.settings = { ..._data.settings, ...settings };
    saveData();
  }
  
  /**
   * Get current settings
   * @returns {Object} Current settings
   */
  function getSettings() {
    if (!_data) init();
    return _data.settings;
  }
  
  // ============================================
  // PUBLIC API
  // ============================================
  
  return {
    // Core
    init,
    recordAttempt,
    
    // Weak Areas
    getWeakAreas,
    getNeedsPracticeAreas,
    getStrongAreas,
    getWeakTopics,
    getQuestionPatterns,
    
    // Recommendations
    getRecommendedLessons,
    getStudyPlan,
    getNextRecommendedActivity,
    getIncompleteLectures,
    getDueForReview,
    
    // Analytics
    getAnalytics,
    getQuickStats,
    getTrends,
    getTimeAnalysis,
    getTopicBreakdown,
    getLectureProgress,
    getRecentActivity,
    getLearningVelocity,
    
    // Sessions
    startSession,
    endSession,
    getRecentSessions,
    
    // Spaced Repetition
    getSpacedRepetitionSchedule,
    
    // Export/Import
    exportProgress,
    generateReport,
    compareProgress,
    importProgress,
    
    // Utilities
    formatDuration,
    getRawData,
    resetData,
    updateSettings,
    getSettings,
    
    // Constants
    EVENTS,
    MASTERY_THRESHOLDS,
    LECTURE_TOPICS
  };
})();

// ============================================
// AUTO-INITIALIZATION
// ============================================

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => KnowledgeTracker.init());
} else {
  KnowledgeTracker.init();
}

// Make available globally
window.KnowledgeTracker = KnowledgeTracker;

// ============================================
// EXAMPLE USAGE CODE
// ============================================

/**
 * @example
 * 
 * // 1. RECORD ATTEMPTS
 * // ------------------
 * 
 * // After user answers a question:
 * KnowledgeTracker.recordAttempt({
 *   questionId: 'lecture3_q15',
 *   correct: false,
 *   timeSpent: 120,
 *   lectureId: 3,
 *   topics: ['Joins', 'Self-joins'],
 *   difficulty: 'hard'
 * });
 * 
 * // 2. GET RECOMMENDATIONS
 * // ----------------------
 * 
 * // Get lessons to focus on:
 * const lessons = KnowledgeTracker.getRecommendedLessons(3);
 * // Returns: [
 * //   { lectureId: 3, title: 'Joins, Aggregates...', reason: 'Weak in: Joins', priority: 85 },
 * //   ...
 * // ]
 * 
 * // Get weak topics:
 * const weak = KnowledgeTracker.getWeakAreas();
 * // Returns: [
 * //   { topic: 'Joins', accuracy: 45, priority: 92, recommendation: 'Review fundamentals' },
 * //   ...
 * ]
 * 
 * // Get personalized study plan:
 * const plan = KnowledgeTracker.getStudyPlan({ durationMinutes: 60 });
 * // Returns study plan with sections, estimated questions, tips
 * 
 * // Get next activity:
 * const next = KnowledgeTracker.getNextRecommendedActivity();
 * // Returns: { type: 'practice', target: 'Joins', reason: '...', action: '...' }
 * 
 * // 3. ANALYTICS
 * // ------------
 * 
 * // Get all analytics:
 * const analytics = KnowledgeTracker.getAnalytics();
 * 
 * // Get quick stats:
 * const stats = KnowledgeTracker.getQuickStats();
 * // Returns: { totalQuestions, accuracy, totalStudyTime, currentStreak, ... }
 * 
 * // Get trends:
 * const trends = KnowledgeTracker.getTrends(30);
 * // Returns daily data for last 30 days
 * 
 * // Get learning velocity:
 * const velocity = KnowledgeTracker.getLearningVelocity();
 * // Returns: { trendDirection, improvementRate, message }
 * 
 * // 4. SPACED REPETITION
 * // --------------------
 * 
 * // Get topics due for review:
 * const due = KnowledgeTracker.getDueForReview();
 * // Returns: [{ topic: 'Joins', daysOverdue: 2, ... }, ...]
 * 
 * // Get full SR schedule:
 * const schedule = KnowledgeTracker.getSpacedRepetitionSchedule();
 * 
 * // 5. EXPORT/REPORT
 * // ----------------
 * 
 * // Export to JSON:
 * const json = KnowledgeTracker.exportProgress();
 * // Download: blob = new Blob([json], {type: 'application/json'})
 * 
 * // Generate text report:
 * const report = KnowledgeTracker.generateReport();
 * console.log(report);
 * 
 * // Compare periods:
 * const comparison = KnowledgeTracker.compareProgress(
 *   '2025-03-01', '2025-03-07',
 *   '2025-03-08', '2025-03-14'
 * );
 * 
 * // 6. EVENT LISTENING
 * // ------------------
 * 
 * // Listen for mastery updates:
 * window.addEventListener(KnowledgeTracker.EVENTS.MASTERY_UPDATED, (e) => {
 *   console.log('Mastery updated for topics:', e.detail.topics);
 * });
 * 
 * // Listen for streak changes:
 * window.addEventListener(KnowledgeTracker.EVENTS.STREAK_CHANGED, (e) => {
 *   console.log('Streak:', e.detail.current);
 * });
 * 
 * // 7. INTEGRATION WITH APPSTATE
 * // ----------------------------
 * 
 * // The tracker automatically emits events that update AppState.
 * // You can also manually sync:
 * if (typeof AppState !== 'undefined') {
 *   const stats = KnowledgeTracker.getQuickStats();
 *   AppState.user.totalStudyTime = stats.totalStudyTimeSeconds;
 *   AppState.user.questionsAnswered = stats.totalQuestions;
 *   AppState.user.correctAnswers = stats.correctAnswers;
 *   AppState.saveToStorage();
 * }
 */

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KnowledgeTracker;
}
