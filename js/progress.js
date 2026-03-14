/**
 * Progress Tracking System
 * ACS-3902 Database Systems - Midterm 2 Study Platform
 */

// ============================================
// CONFIGURATION
// ============================================

const PROGRESS_STORAGE_KEYS = {
  QUESTION_ATTEMPTS: 'midterm2_question_attempts',
  TOPIC_PROGRESS: 'midterm2_topic_progress',
  TIME_TRACKING: 'midterm2_time_tracking',
  STUDY_SESSIONS: 'midterm2_study_sessions',
  SECTION_PROGRESS: 'midterm2_section_progress',
  MASTERY_LEVELS: 'midterm2_mastery_levels',
  WEAK_AREAS: 'midterm2_weak_areas',
  RECOMMENDATIONS: 'midterm2_recommendations'
};

const TOPICS = {
  // Section A Topics
  TRANSACTIONS: 'transactions',
  UNION: 'union',
  CTES: 'ctes',
  TRIGGERS: 'triggers',
  INDEXES: 'indexes',
  RELATIONAL_ALGEBRA: 'relational_algebra',
  
  // Section B Topics
  EERD_CHEN: 'eerd_chen',
  EERD_IE: 'eerd_ie',
  SUPERCLASS_SUBCLASS: 'superclass_subclass',
  WEAK_ENTITIES: 'weak_entities',
  ROLE_NAMES: 'role_names',
  
  // Section C Topics
  RA_TO_SQL: 'ra_to_sql',
  SQL_TO_RA: 'sql_to_ra',
  QUERY_TREES: 'query_trees',
  QUERY_OPTIMIZATION: 'query_optimization',
  CTE_WRITING: 'cte_writing',
  
  // 8-Step Transformation Topics
  STEP1_ENTITIES: 'step1_entities',
  STEP2_WEAK_ENTITIES: 'step2_weak_entities',
  STEP3_ONE_TO_ONE: 'step3_one_to_one',
  STEP4_ONE_TO_MANY: 'step4_one_to_many',
  STEP5_MANY_TO_MANY: 'step5_many_to_many',
  STEP6_MULTIVALUED: 'step6_multivalued',
  STEP7_NARY: 'step7_nary',
  STEP8_SUPERCLASS: 'step8_superclass'
};

const MASTERY_THRESHOLDS = {
  NOVICE: { min: 0, max: 39, label: 'Novice', color: '#ef4444' },
  DEVELOPING: { min: 40, max: 59, label: 'Developing', color: '#f97316' },
  PROFICIENT: { min: 60, max: 79, label: 'Proficient', color: '#eab308' },
  ADVANCED: { min: 80, max: 89, label: 'Advanced', color: '#22c55e' },
  MASTER: { min: 90, max: 100, label: 'Master', color: '#3b82f6' }
};

// ============================================
// QUESTION ATTEMPT TRACKING
// ============================================

/**
 * Record a question attempt with detailed tracking
 * @param {string} questionId - Unique question identifier
 * @param {boolean} correct - Whether the answer was correct
 * @param {number} timeSpent - Time spent in seconds
 * @param {string} topic - Topic/category of the question
 * @param {string} difficulty - Difficulty level (easy/medium/hard/expert)
 * @param {string} section - Section (A/B/C)
 * @returns {Object} Updated progress statistics
 */
function recordQuestionAttempt(questionId, correct, timeSpent, topic, difficulty = 'medium', section = 'A') {
  const attempts = getQuestionAttempts();
  const timestamp = new Date().toISOString();
  
  if (!attempts[questionId]) {
    attempts[questionId] = {
      questionId,
      topic,
      difficulty,
      section,
      attempts: [],
      firstAttempt: timestamp,
      totalTimeSpent: 0,
      correctCount: 0,
      incorrectCount: 0,
      status: 'unattempted'
    };
  }
  
  // Record this attempt
  const attempt = {
    timestamp,
    correct,
    timeSpent,
    attemptNumber: attempts[questionId].attempts.length + 1
  };
  
  attempts[questionId].attempts.push(attempt);
  attempts[questionId].totalTimeSpent += timeSpent;
  attempts[questionId].lastAttempt = timestamp;
  
  if (correct) {
    attempts[questionId].correctCount++;
    attempts[questionId].status = 'correct';
  } else {
    attempts[questionId].incorrectCount++;
    if (attempts[questionId].status !== 'correct') {
      attempts[questionId].status = 'incorrect';
    }
  }
  
  localStorage.setItem(PROGRESS_STORAGE_KEYS.QUESTION_ATTEMPTS, JSON.stringify(attempts));
  
  // Update topic progress
  updateTopicProgress(topic, correct, difficulty);
  
  // Update section progress
  updateSectionProgress(section, correct);
  
  // Update study session time
  recordStudyTime(timeSpent);
  
  // Recalculate mastery and recommendations
  calculateMasteryLevels();
  generateStudyRecommendations();
  
  return getQuestionStats(questionId);
}

/**
 * Get all question attempts
 * @returns {Object} Object with questionId as keys
 */
function getQuestionAttempts() {
  const stored = localStorage.getItem(PROGRESS_STORAGE_KEYS.QUESTION_ATTEMPTS);
  return stored ? JSON.parse(stored) : {};
}

/**
 * Get statistics for a specific question
 * @param {string} questionId - Question identifier
 * @returns {Object} Question statistics
 */
function getQuestionStats(questionId) {
  const attempts = getQuestionAttempts();
  const question = attempts[questionId];
  
  if (!question) {
    return null;
  }
  
  const totalAttempts = question.attempts.length;
  const accuracy = totalAttempts > 0 
    ? Math.round((question.correctCount / totalAttempts) * 100) 
    : 0;
  
  const avgTime = totalAttempts > 0 
    ? Math.round(question.totalTimeSpent / totalAttempts) 
    : 0;
  
  return {
    ...question,
    totalAttempts,
    accuracy,
    avgTimeSpent: avgTime,
    isMastered: accuracy >= 80 && totalAttempts >= 3,
    needsReview: accuracy < 60 && totalAttempts >= 2
  };
}

// ============================================
// TOPIC MASTERY TRACKING
// ============================================

/**
 * Update progress for a specific topic
 * @param {string} topic - Topic identifier
 * @param {boolean} correct - Whether answer was correct
 * @param {string} difficulty - Question difficulty
 */
function updateTopicProgress(topic, correct, difficulty) {
  const progress = getTopicProgress();
  
  if (!progress[topic]) {
    progress[topic] = {
      topic,
      totalAttempts: 0,
      correctCount: 0,
      incorrectCount: 0,
      questionsAnswered: new Set(),
      difficultyBreakdown: {
        easy: { attempted: 0, correct: 0 },
        medium: { attempted: 0, correct: 0 },
        hard: { attempted: 0, correct: 0 },
        expert: { attempted: 0, correct: 0 }
      },
      lastStudied: null
    };
  }
  
  progress[topic].totalAttempts++;
  progress[topic].lastStudied = new Date().toISOString();
  
  if (correct) {
    progress[topic].correctCount++;
  } else {
    progress[topic].incorrectCount++;
  }
  
  // Track difficulty breakdown
  if (progress[topic].difficultyBreakdown[difficulty]) {
    progress[topic].difficultyBreakdown[difficulty].attempted++;
    if (correct) {
      progress[topic].difficultyBreakdown[difficulty].correct++;
    }
  }
  
  localStorage.setItem(PROGRESS_STORAGE_KEYS.TOPIC_PROGRESS, JSON.stringify(progress));
}

/**
 * Get progress for all topics
 * @returns {Object} Topic progress data
 */
function getTopicProgress() {
  const stored = localStorage.getItem(PROGRESS_STORAGE_KEYS.TOPIC_PROGRESS);
  const progress = stored ? JSON.parse(stored) : {};
  
  // Convert Sets back from arrays (JSON serialization)
  Object.values(progress).forEach(topic => {
    if (topic.questionsAnswered && Array.isArray(topic.questionsAnswered)) {
      topic.questionsAnswered = new Set(topic.questionsAnswered);
    }
  });
  
  return progress;
}

/**
 * Get mastery level for a specific topic
 * @param {string} topic - Topic identifier
 * @returns {Object} Mastery level information
 */
function getTopicMastery(topic) {
  const progress = getTopicProgress();
  const topicData = progress[topic];
  
  if (!topicData || topicData.totalAttempts === 0) {
    return {
      topic,
      masteryPercentage: 0,
      masteryLevel: MASTERY_THRESHOLDS.NOVICE,
      totalAttempts: 0,
      accuracy: 0,
      questionsAnswered: 0,
      isUnlocked: false
    };
  }
  
  const accuracy = Math.round((topicData.correctCount / topicData.totalAttempts) * 100);
  
  // Calculate mastery based on accuracy and number of attempts
  // More weight given to accuracy, but need sufficient attempts
  const attemptWeight = Math.min(topicData.totalAttempts / 10, 1); // Max weight at 10 attempts
  const masteryPercentage = Math.round(accuracy * attemptWeight);
  
  // Determine mastery level
  let masteryLevel = MASTERY_THRESHOLDS.NOVICE;
  for (const level of Object.values(MASTERY_THRESHOLDS)) {
    if (masteryPercentage >= level.min) {
      masteryLevel = level;
    }
  }
  
  return {
    topic,
    masteryPercentage,
    masteryLevel,
    totalAttempts: topicData.totalAttempts,
    accuracy,
    questionsAnswered: topicData.questionsAnswered ? topicData.questionsAnswered.size : 0,
    difficultyBreakdown: topicData.difficultyBreakdown,
    lastStudied: topicData.lastStudied,
    isUnlocked: topicData.totalAttempts >= 3
  };
}

/**
 * Calculate mastery levels for all topics
 * @returns {Object} All topic mastery levels
 */
function calculateMasteryLevels() {
  const masteryLevels = {};
  
  for (const topic of Object.values(TOPICS)) {
    masteryLevels[topic] = getTopicMastery(topic);
  }
  
  localStorage.setItem(PROGRESS_STORAGE_KEYS.MASTERY_LEVELS, JSON.stringify(masteryLevels));
  return masteryLevels;
}

/**
 * Get all mastery levels
 * @returns {Object} All topic mastery levels
 */
function getMasteryLevels() {
  const stored = localStorage.getItem(PROGRESS_STORAGE_KEYS.MASTERY_LEVELS);
  if (stored) {
    return JSON.parse(stored);
  }
  return calculateMasteryLevels();
}

// ============================================
// SECTION PROGRESS TRACKING
// ============================================

/**
 * Update progress for a section
 * @param {string} section - Section (A/B/C)
 * @param {boolean} correct - Whether answer was correct
 */
function updateSectionProgress(section, correct) {
  const progress = getSectionProgress();
  
  if (!progress[section]) {
    progress[section] = {
      section,
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      score: 0
    };
  }
  
  progress[section].totalQuestions++;
  
  if (correct) {
    progress[section].correctAnswers++;
  } else {
    progress[section].incorrectAnswers++;
  }
  
  progress[section].score = Math.round(
    (progress[section].correctAnswers / progress[section].totalQuestions) * 100
  );
  
  localStorage.setItem(PROGRESS_STORAGE_KEYS.SECTION_PROGRESS, JSON.stringify(progress));
}

/**
 * Get progress for all sections
 * @returns {Object} Section progress data
 */
function getSectionProgress() {
  const stored = localStorage.getItem(PROGRESS_STORAGE_KEYS.SECTION_PROGRESS);
  return stored ? JSON.parse(stored) : {};
}

// ============================================
// OVERALL PROGRESS
// ============================================

/**
 * Get overall progress statistics
 * @returns {Object} Overall progress data
 */
function getOverallProgress() {
  const attempts = getQuestionAttempts();
  const masteryLevels = getMasteryLevels();
  const timeTracking = getTimeTracking();
  
  const allAttempts = Object.values(attempts);
  const totalQuestions = allAttempts.length;
  const totalAttemptCount = allAttempts.reduce((sum, q) => sum + q.attempts.length, 0);
  const correctAnswers = allAttempts.reduce((sum, q) => sum + q.correctCount, 0);
  
  const accuracy = totalAttemptCount > 0 
    ? Math.round((correctAnswers / totalAttemptCount) * 100) 
    : 0;
  
  // Count by mastery level
  const masteryCounts = {};
  Object.values(MASTERY_THRESHOLDS).forEach(level => {
    masteryCounts[level.label] = 0;
  });
  
  Object.values(masteryLevels).forEach(topic => {
    if (topic.masteryLevel) {
      masteryCounts[topic.masteryLevel.label] = (masteryCounts[topic.masteryLevel.label] || 0) + 1;
    }
  });
  
  // Calculate overall mastery percentage
  const topicCount = Object.keys(TOPICS).length;
  const masteredTopics = Object.values(masteryLevels).filter(t => t.masteryPercentage >= 80).length;
  const overallMastery = Math.round((masteredTopics / topicCount) * 100);
  
  return {
    totalQuestions,
    totalAttemptCount,
    correctAnswers,
    accuracy,
    incorrectAnswers: totalAttemptCount - correctAnswers,
    overallMastery,
    masteryCounts,
    timeSpent: timeTracking.totalSeconds,
    timeSpentFormatted: formatDuration(timeTracking.totalSeconds),
    questionsByStatus: {
      correct: allAttempts.filter(q => q.status === 'correct').length,
      incorrect: allAttempts.filter(q => q.status === 'incorrect').length,
      unattempted: 0 // Would need total question count from data
    }
  };
}

// ============================================
// WEAK & STRONG AREAS
// ============================================

/**
 * Identify weak areas (topics with < 60% accuracy)
 * @param {number} threshold - Accuracy threshold (default 60)
 * @returns {Object[]} Array of weak areas sorted by priority
 */
function getWeakAreas(threshold = 60) {
  const masteryLevels = getMasteryLevels();
  const weakAreas = [];
  
  for (const [topic, data] of Object.entries(masteryLevels)) {
    if (data.totalAttempts > 0 && data.accuracy < threshold) {
      weakAreas.push({
        topic,
        accuracy: data.accuracy,
        totalAttempts: data.totalAttempts,
        priority: calculatePriority(data),
        recommendation: generateTopicRecommendation(topic, data)
      });
    }
  }
  
  // Sort by priority (higher = more urgent)
  weakAreas.sort((a, b) => b.priority - a.priority);
  
  localStorage.setItem(PROGRESS_STORAGE_KEYS.WEAK_AREAS, JSON.stringify(weakAreas));
  return weakAreas;
}

/**
 * Identify strong areas (topics with >= 80% accuracy)
 * @param {number} threshold - Accuracy threshold (default 80)
 * @returns {Object[]} Array of strong areas
 */
function getStrongAreas(threshold = 80) {
  const masteryLevels = getMasteryLevels();
  const strongAreas = [];
  
  for (const [topic, data] of Object.entries(masteryLevels)) {
    if (data.totalAttempts >= 3 && data.accuracy >= threshold) {
      strongAreas.push({
        topic,
        accuracy: data.accuracy,
        totalAttempts: data.totalAttempts,
        masteryLevel: data.masteryLevel,
        strength: data.accuracy * Math.min(data.totalAttempts / 5, 1)
      });
    }
  }
  
  // Sort by strength
  strongAreas.sort((a, b) => b.strength - a.strength);
  
  return strongAreas;
}

/**
 * Calculate priority score for a weak area
 * @param {Object} topicData - Topic mastery data
 * @returns {number} Priority score
 */
function calculatePriority(topicData) {
  // Higher priority for:
  // - Lower accuracy
  // - More attempts (persistent struggle)
  // - Topics with higher question counts in exam
  
  const accuracyFactor = (100 - topicData.accuracy) / 100;
  const attemptFactor = Math.min(topicData.totalAttempts / 5, 1);
  
  // Weight topics by importance (would be configured per topic)
  const importanceWeight = 1;
  
  return Math.round((accuracyFactor * 0.6 + attemptFactor * 0.4) * importanceWeight * 100);
}

// ============================================
// STUDY RECOMMENDATIONS
// ============================================

/**
 * Generate personalized study recommendations
 * @returns {Object[]} Array of recommendations
 */
function generateStudyRecommendations() {
  const recommendations = [];
  const weakAreas = getWeakAreas();
  const masteryLevels = getMasteryLevels();
  const overallProgress = getOverallProgress();
  
  // 1. Priority: Focus on weak areas
  if (weakAreas.length > 0) {
    const topWeak = weakAreas.slice(0, 3);
    recommendations.push({
      type: 'weak_area_priority',
      priority: 'high',
      title: 'Focus on Weak Areas',
      description: `You need more practice with: ${topWeak.map(w => formatTopicName(w.topic)).join(', ')}`,
      action: 'Practice these topics',
      topics: topWeak.map(w => w.topic),
      estimatedTime: topWeak.length * 15 // 15 min per topic
    });
  }
  
  // 2. Suggest untried topics
  const untriedTopics = Object.values(TOPICS).filter(
    topic => !masteryLevels[topic] || masteryLevels[topic].totalAttempts === 0
  );
  
  if (untriedTopics.length > 0) {
    const suggested = untriedTopics.slice(0, 2);
    recommendations.push({
      type: 'new_topic',
      priority: 'medium',
      title: 'Explore New Topics',
      description: `Try questions on: ${suggested.map(t => formatTopicName(t)).join(', ')}`,
      action: 'Start with easy questions',
      topics: suggested,
      estimatedTime: 20
    });
  }
  
  // 3. Review almost-mastered topics
  const almostMastered = Object.values(masteryLevels).filter(
    t => t.accuracy >= 70 && t.accuracy < 80 && t.totalAttempts >= 3
  );
  
  if (almostMastered.length > 0) {
    recommendations.push({
      type: 'push_to_master',
      priority: 'medium',
      title: 'Push to Mastery',
      description: `You're close to mastering: ${almostMastered.slice(0, 2).map(t => formatTopicName(t.topic)).join(', ')}`,
      action: 'Complete a few more questions',
      topics: almostMastered.slice(0, 2).map(t => t.topic),
      estimatedTime: 15
    });
  }
  
  // 4. Suggest practice test if ready
  if (overallProgress.overallMastery >= 60 && weakAreas.length <= 3) {
    recommendations.push({
      type: 'practice_test',
      priority: 'low',
      title: 'Ready for Practice Test',
      description: 'You\'ve made good progress. Test your knowledge!',
      action: 'Take a practice test',
      estimatedTime: 90
    });
  }
  
  // 5. Daily goal suggestion
  const dailyGoal = calculateDailyGoal();
  if (dailyGoal.remaining > 0) {
    recommendations.push({
      type: 'daily_goal',
      priority: 'high',
      title: 'Daily Study Goal',
      description: `Complete ${dailyGoal.remaining} more questions today`,
      action: 'Continue studying',
      progress: dailyGoal.completed,
      target: dailyGoal.target
    });
  }
  
  localStorage.setItem(PROGRESS_STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(recommendations));
  return recommendations;
}

/**
 * Get current recommendations
 * @returns {Object[]} Array of recommendations
 */
function getStudyRecommendations() {
  const stored = localStorage.getItem(PROGRESS_STORAGE_KEYS.RECOMMENDATIONS);
  if (stored) {
    return JSON.parse(stored);
  }
  return generateStudyRecommendations();
}

/**
 * Generate topic-specific recommendation
 * @param {string} topic - Topic identifier
 * @param {Object} data - Topic data
 * @returns {string} Recommendation text
 */
function generateTopicRecommendation(topic, data) {
  const accuracy = data.accuracy;
  const attempts = data.totalAttempts;
  
  if (accuracy < 40) {
    return `Start with easy ${formatTopicName(topic)} questions and review fundamentals`;
  } else if (accuracy < 60) {
    return `Practice more ${formatTopicName(topic)} questions, focusing on understanding concepts`;
  } else {
    return `Review ${formatTopicName(topic)} mistakes and try harder questions`;
  }
}

// ============================================
// TIME TRACKING
// ============================================

/**
 * Record study time
 * @param {number} seconds - Time spent studying
 */
function recordStudyTime(seconds) {
  const tracking = getTimeTracking();
  const today = new Date().toISOString().split('T')[0];
  
  tracking.totalSeconds += seconds;
  
  if (!tracking.daily[today]) {
    tracking.daily[today] = 0;
  }
  tracking.daily[today] += seconds;
  
  // Keep only last 30 days
  const dates = Object.keys(tracking.daily).sort();
  if (dates.length > 30) {
    delete tracking.daily[dates[0]];
  }
  
  localStorage.setItem(PROGRESS_STORAGE_KEYS.TIME_TRACKING, JSON.stringify(tracking));
}

/**
 * Get time tracking data
 * @returns {Object} Time tracking data
 */
function getTimeTracking() {
  const stored = localStorage.getItem(PROGRESS_STORAGE_KEYS.TIME_TRACKING);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    totalSeconds: 0,
    daily: {}
  };
}

/**
 * Get study time for a specific date range
 * @param {number} days - Number of days to look back
 * @returns {number} Total seconds studied
 */
function getStudyTimeForDays(days) {
  const tracking = getTimeTracking();
  const today = new Date();
  let totalSeconds = 0;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    if (tracking.daily[dateStr]) {
      totalSeconds += tracking.daily[dateStr];
    }
  }
  
  return totalSeconds;
}

/**
 * Get daily study data for calendar/heatmap
 * @param {number} days - Number of days to retrieve
 * @returns {Object[]} Daily study data
 */
function getDailyStudyData(days = 30) {
  const tracking = getTimeTracking();
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    data.push({
      date: dateStr,
      seconds: tracking.daily[dateStr] || 0,
      minutes: Math.round((tracking.daily[dateStr] || 0) / 60),
      hasActivity: (tracking.daily[dateStr] || 0) > 0
    });
  }
  
  return data;
}

// ============================================
// STUDY SESSIONS
// ============================================

/**
 * Start a new study session
 * @returns {string} Session ID
 */
function startStudySession() {
  const sessions = getStudySessions();
  const session = {
    id: Date.now().toString(36),
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    questionsAttempted: 0,
    correctAnswers: 0
  };
  
  sessions.push(session);
  localStorage.setItem(PROGRESS_STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(sessions));
  
  return session.id;
}

/**
 * End a study session
 * @param {string} sessionId - Session ID
 * @returns {Object} Completed session data
 */
function endStudySession(sessionId) {
  const sessions = getStudySessions();
  const session = sessions.find(s => s.id === sessionId);
  
  if (session) {
    session.endTime = new Date().toISOString();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    session.duration = Math.round((end - start) / 1000);
    
    localStorage.setItem(PROGRESS_STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(sessions));
  }
  
  return session;
}

/**
 * Get all study sessions
 * @returns {Object[]} Array of study sessions
 */
function getStudySessions() {
  const stored = localStorage.getItem(PROGRESS_STORAGE_KEYS.STUDY_SESSIONS);
  return stored ? JSON.parse(stored) : [];
}

// ============================================
// PROGRESS REPORTS
// ============================================

/**
 * Generate a comprehensive progress report
 * @returns {Object} Progress report
 */
function generateProgressReport() {
  const overall = getOverallProgress();
  const masteryLevels = getMasteryLevels();
  const weakAreas = getWeakAreas();
  const strongAreas = getStrongAreas();
  const recommendations = getStudyRecommendations();
  const dailyData = getDailyStudyData(7);
  
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalQuestions: overall.totalQuestions,
      accuracy: overall.accuracy,
      overallMastery: overall.overallMastery,
      timeSpent: overall.timeSpentFormatted,
      studyStreak: getStudyStreakFromGamification()
    },
    masteryBreakdown: {
      byLevel: overall.masteryCounts,
      byTopic: Object.values(masteryLevels).map(m => ({
        topic: formatTopicName(m.topic),
        percentage: m.masteryPercentage,
        level: m.masteryLevel.label
      }))
    },
    weakAreas: weakAreas.slice(0, 5).map(w => ({
      topic: formatTopicName(w.topic),
      accuracy: w.accuracy,
      recommendation: w.recommendation
    })),
    strongAreas: strongAreas.slice(0, 5).map(s => ({
      topic: formatTopicName(s.topic),
      accuracy: s.accuracy,
      level: s.masteryLevel.label
    })),
    recommendations: recommendations.slice(0, 3),
    weeklyActivity: dailyData,
    sectionPerformance: getSectionProgress()
  };
}

/**
 * Generate a weekly summary
 * @returns {Object} Weekly summary
 */
function generateWeeklySummary() {
  const lastWeekSeconds = getStudyTimeForDays(7);
  const sessions = getStudySessions().filter(s => {
    const sessionDate = new Date(s.startTime);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo;
  });
  
  const attempts = getQuestionAttempts();
  const thisWeekAttempts = Object.values(attempts).filter(q => {
    const lastAttempt = new Date(q.lastAttempt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastAttempt >= weekAgo;
  });
  
  return {
    weekStarting: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    studyTime: {
      seconds: lastWeekSeconds,
      formatted: formatDuration(lastWeekSeconds)
    },
    sessions: sessions.length,
    questionsAttempted: thisWeekAttempts.length,
    correctAnswers: thisWeekAttempts.reduce((sum, q) => sum + q.correctCount, 0),
    averageAccuracy: thisWeekAttempts.length > 0
      ? Math.round((thisWeekAttempts.reduce((sum, q) => sum + q.correctCount, 0) / 
          thisWeekAttempts.reduce((sum, q) => sum + q.attempts.length, 0)) * 100)
      : 0
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format topic name for display
 * @param {string} topic - Topic identifier
 * @returns {string} Formatted topic name
 */
function formatTopicName(topic) {
  const names = {
    [TOPICS.TRANSACTIONS]: 'Transactions',
    [TOPICS.UNION]: 'UNION Operations',
    [TOPICS.CTES]: 'CTEs',
    [TOPICS.TRIGGERS]: 'Triggers',
    [TOPICS.INDEXES]: 'Indexes',
    [TOPICS.RELATIONAL_ALGEBRA]: 'Relational Algebra',
    [TOPICS.EERD_CHEN]: 'EERD (Chen Notation)',
    [TOPICS.EERD_IE]: 'EERD (IE Notation)',
    [TOPICS.SUPERCLASS_SUBCLASS]: 'Superclass/Subclass',
    [TOPICS.WEAK_ENTITIES]: 'Weak Entities',
    [TOPICS.ROLE_NAMES]: 'Role Names',
    [TOPICS.RA_TO_SQL]: 'RA to SQL Translation',
    [TOPICS.SQL_TO_RA]: 'SQL to RA Translation',
    [TOPICS.QUERY_TREES]: 'Query Trees',
    [TOPICS.QUERY_OPTIMIZATION]: 'Query Optimization',
    [TOPICS.CTE_WRITING]: 'CTE Writing',
    [TOPICS.STEP1_ENTITIES]: 'Step 1: Map Entities',
    [TOPICS.STEP2_WEAK_ENTITIES]: 'Step 2: Map Weak Entities',
    [TOPICS.STEP3_ONE_TO_ONE]: 'Step 3: 1:1 Relationships',
    [TOPICS.STEP4_ONE_TO_MANY]: 'Step 4: 1:N Relationships',
    [TOPICS.STEP5_MANY_TO_MANY]: 'Step 5: M:N Relationships',
    [TOPICS.STEP6_MULTIVALUED]: 'Step 6: Multi-valued Attributes',
    [TOPICS.STEP7_NARY]: 'Step 7: N-ary Relationships',
    [TOPICS.STEP8_SUPERCLASS]: 'Step 8: Superclass Structures'
  };
  
  return names[topic] || topic.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Format duration in seconds to readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Calculate daily study goal
 * @returns {Object} Daily goal progress
 */
function calculateDailyGoal() {
  const target = 10; // Target: 10 questions per day
  const today = new Date().toISOString().split('T')[0];
  const attempts = getQuestionAttempts();
  
  const todayAttempts = Object.values(attempts).filter(q => {
    return q.attempts.some(a => a.timestamp.startsWith(today));
  }).length;
  
  return {
    target,
    completed: todayAttempts,
    remaining: Math.max(0, target - todayAttempts),
    completed: todayAttempts >= target
  };
}

/**
 * Get study streak from gamification module
 * @returns {number} Current streak
 */
function getStudyStreakFromGamification() {
  // This would call the gamification module
  // For now, return 0
  if (typeof getStudyStreak === 'function') {
    return getStudyStreak();
  }
  return 0;
}

// ============================================
// DATA MANAGEMENT
// ============================================

/**
 * Reset all progress data
 * @returns {boolean} Success status
 */
function resetProgressData() {
  Object.values(PROGRESS_STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  return true;
}

/**
 * Export progress data
 * @returns {Object} All progress data
 */
function exportProgressData() {
  return {
    questionAttempts: getQuestionAttempts(),
    topicProgress: getTopicProgress(),
    sectionProgress: getSectionProgress(),
    masteryLevels: getMasteryLevels(),
    timeTracking: getTimeTracking(),
    studySessions: getStudySessions(),
    exportDate: new Date().toISOString()
  };
}

/**
 * Import progress data
 * @param {Object} data - Data to import
 * @returns {boolean} Success status
 */
function importProgressData(data) {
  try {
    if (data.questionAttempts) {
      localStorage.setItem(PROGRESS_STORAGE_KEYS.QUESTION_ATTEMPTS, JSON.stringify(data.questionAttempts));
    }
    if (data.topicProgress) {
      localStorage.setItem(PROGRESS_STORAGE_KEYS.TOPIC_PROGRESS, JSON.stringify(data.topicProgress));
    }
    if (data.sectionProgress) {
      localStorage.setItem(PROGRESS_STORAGE_KEYS.SECTION_PROGRESS, JSON.stringify(data.sectionProgress));
    }
    if (data.masteryLevels) {
      localStorage.setItem(PROGRESS_STORAGE_KEYS.MASTERY_LEVELS, JSON.stringify(data.masteryLevels));
    }
    if (data.timeTracking) {
      localStorage.setItem(PROGRESS_STORAGE_KEYS.TIME_TRACKING, JSON.stringify(data.timeTracking));
    }
    if (data.studySessions) {
      localStorage.setItem(PROGRESS_STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(data.studySessions));
    }
    return true;
  } catch (e) {
    console.error('Failed to import progress data:', e);
    return false;
  }
}

// ============================================
// EXPORT FOR MODULE SYSTEMS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TOPICS,
    MASTERY_THRESHOLDS,
    recordQuestionAttempt,
    getQuestionAttempts,
    getQuestionStats,
    getTopicMastery,
    getMasteryLevels,
    calculateMasteryLevels,
    getOverallProgress,
    getWeakAreas,
    getStrongAreas,
    generateStudyRecommendations,
    getStudyRecommendations,
    recordStudyTime,
    getTimeTracking,
    getStudyTimeForDays,
    getDailyStudyData,
    startStudySession,
    endStudySession,
    getStudySessions,
    generateProgressReport,
    generateWeeklySummary,
    formatTopicName,
    formatDuration,
    resetProgressData,
    exportProgressData,
    importProgressData
  };
}
