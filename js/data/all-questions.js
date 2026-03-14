/**
 * @fileoverview All Questions Data Loader
 * 
 * This module loads and provides unified access to all course question data
 * from lectures and midterm preparation materials.
 * 
 * Data sources:
 * - Lectures 1-4: SQL fundamentals, joins, aggregates, subqueries, DDL
 * - Lectures 5-9: Transactions, CTEs, triggers, indexes, EERD, transformations
 * - Section A: Midterm 2 - Multiple choice questions (transactions, union, CTEs, triggers, indexes, RA)
 * - Section B: Midterm 2 - EERD questions (Chen/IE notation, inheritance, weak entities)
 * - Section C: Midterm 2 - Relational Algebra and CTE writing questions
 * 
 * @module data/all-questions
 * @version 1.0.0
 */

/**
 * Question data sources configuration
 * @type {Array<{path: string, type: string, id: string}>}
 */
const DATA_SOURCES = [
  { path: './lectures/lectures-1-4.json', type: 'lectures', id: 'lectures-1-4' },
  { path: './lectures/lectures-5-9.json', type: 'lectures', id: 'lectures-5-9' },
  { path: './sectionA.json', type: 'midterm2', id: 'sectionA' },
  { path: './sectionB.json', type: 'midterm2', id: 'sectionB' },
  { path: './sectionC.json', type: 'midterm2', id: 'sectionC' }
];

/**
 * Lecture metadata for categorization
 * @type {Object<string, {title: string, topics: string[], number: number}>}
 */
const LECTURE_METADATA = {
  1: { title: 'Course Introduction', topics: ['Grade components', 'Gen AI policy', 'Assignment policies', 'Common pitfalls', 'Academic integrity', 'Office hours', 'Attendance importance', 'Course expectations'], number: 1 },
  2: { title: 'SQL Select Fundamentals', topics: ['SQL command sets', 'Joins', 'Aliases', 'Wildcards', 'DISTINCT', 'Comparison operators', 'NULL handling', 'ORDER BY with LIMIT', 'Query processing sequence', 'Memory acronym'], number: 2 },
  3: { title: 'Joins, Aggregates, Subqueries', topics: ['Join types', 'Self-join', 'Multiple relationships', 'Non-equal joins', 'Aggregate functions', 'NULL handling in aggregates', 'GROUP BY and HAVING', 'Subqueries', 'Inline views', 'ANY and ALL operators', 'DML operations'], number: 3 },
  4: { title: 'DDL (Data Definition Language)', topics: ['Basic terminology', 'Database architecture', 'CREATE SCHEMA', 'SET search_path', 'Constraints', 'CREATE DOMAIN', 'Referential Integrity', 'Transactions'], number: 4 },
  5: { title: 'Transactions & UNION', topics: ['Transaction Control Language', 'ACID Properties', 'Savepoints', 'UNION and UNION ALL', 'Column Compatibility', 'PostgreSQL ORDER BY with UNION'], number: 5 },
  6: { title: 'CTEs, Triggers, and Indexes', topics: ['Common Table Expressions', 'Non-recursive CTEs', 'Recursive CTEs', 'Anchor and Recursive Members', 'BEFORE/AFTER Triggers', 'OLD and NEW Keywords', 'CREATE INDEX', 'Composite Indexes', 'Covering Indexes'], number: 6 },
  7: { title: 'More Indexes & Relational Algebra', topics: ['Clustered vs Non-clustered Indexes', 'CLUSTER Command', 'EXPLAIN and Query Plans', 'Relational Algebra Operators', 'Query Trees', 'RA to SQL Translation', 'Query Optimization'], number: 7 },
  8: { title: 'EERD - Enhanced Entity-Relationship Diagrams', topics: ['Chen Notation', 'Information Engineering Notation', 'Subtype/Supertype Structures', 'Exclusive vs Non-exclusive', 'Is A Test', 'Role Names', 'Weak Entities', 'Identifying Relationships'], number: 8 },
  9: { title: '8-Step Transformation', topics: ['Step 1: Map Regular Entities', 'Step 2: Map Weak Entities', 'Step 3: Handle 1:1 Relationships', 'Step 4: Map 1:N Relationships', 'Step 5: Map M:N Relationships', 'Step 6: Multi-valued Attributes', 'Step 7: Map N-ary Relationships', 'Step 8: Transform Superclass Structures'], number: 9 }
};

/**
 * Normalized question categories constant
 * Populated after loading data
 * @type {Object}
 */
export let QUESTION_CATEGORIES = {
  lectures: [],
  topics: [],
  difficulty: { easy: 0, medium: 0, hard: 0, expert: 0 },
  sources: [],
  totalQuestions: 0
};

/**
 * Cache for loaded questions
 * @type {Array<Object>|null}
 */
let questionsCache = null;

/**
 * Normalizes a question object from various source formats
 * @param {Object} q - Raw question object
 * @param {string} source - Source identifier
 * @param {number|string} lectureId - Lecture ID if applicable
 * @returns {Object} Normalized question object
 * @private
 */
function normalizeQuestion(q, source, lectureId = null) {
  // Handle different correct answer field names
  const correctAnswer = q.correctAnswer ?? q.correct ?? null;
  
  // Handle different ID field names
  const id = q.id ?? `${source}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Normalize difficulty
  let difficulty = (q.difficulty || 'medium').toLowerCase();
  if (difficulty === 'expert' || difficulty === 'hard') {
    // Keep as is
  } else if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    difficulty = 'medium';
  }
  
  // Extract topic - handle various formats
  const topic = q.topic || (q.topics && q.topics[0]) || 'General';
  
  // Determine question type
  const type = q.type || (q.code ? (Array.isArray(q.code) ? 'code-comparison' : 'code') : 'concept');
  
  // Build normalized question object
  return {
    id,
    question: q.question,
    options: q.options || [],
    correctAnswer,
    explanation: q.explanation || '',
    difficulty,
    topic,
    type,
    source,
    lectureId: lectureId ? parseInt(lectureId) : null,
    code: q.code || null,
    sqlExample: q.sql_example || null,
    raExpression: q.ra_expression || q.ra || null,
    sql: q.sql || null,
    schema: q.schema || null,
    points: q.points || 10,
    diagram: q.diagram || null,
    subtopic: q.subtopic || null,
    // Original data for advanced use cases
    _original: q
  };
}

/**
 * Loads and normalizes data from a single source
 * @param {Object} source - Source configuration object
 * @returns {Promise<Array<Object>>} Array of normalized questions
 * @private
 */
async function loadSource(source) {
  try {
    const response = await fetch(source.path);
    
    if (!response.ok) {
      console.warn(`[all-questions] Failed to load ${source.path}: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    const questions = [];
    
    if (source.type === 'lectures') {
      // Handle lectures format (lectures array with nested questions)
      if (data.lectures && Array.isArray(data.lectures)) {
        data.lectures.forEach(lecture => {
          const lectureId = lecture.id || lecture.number;
          if (lecture.questions && Array.isArray(lecture.questions)) {
            lecture.questions.forEach(q => {
              questions.push(normalizeQuestion(q, source.id, lectureId));
            });
          }
        });
      }
    } else if (source.type === 'midterm2') {
      // Handle midterm section format (flat questions array)
      const questionArray = data.questions || (data.metadata && data.questions);
      if (Array.isArray(questionArray)) {
        questionArray.forEach(q => {
          // Determine lecture ID based on topic for categorization
          let lectureId = null;
          const topic = (q.topic || '').toLowerCase();
          
          // Map topics to lecture numbers for midterm questions
          if (topic.includes('transaction') || topic.includes('union') || topic.includes('acid')) {
            lectureId = 5;
          } else if (topic.includes('cte') || topic.includes('trigger') || topic.includes('index')) {
            lectureId = 6;
          } else if (topic.includes('relational_algebra') || topic.includes('query_tree') || topic.includes('optimization')) {
            lectureId = 7;
          } else if (topic.includes('chen') || topic.includes('ie_notation') || topic.includes('superclass') || 
                     topic.includes('weak_entity') || topic.includes('eer') || topic.includes('role_name') ||
                     topic.includes('identifying') || topic.includes('subclass') || topic.includes('inheritance')) {
            lectureId = 8;
          } else if (topic.includes('transformation') || topic.includes('step_') || topic.includes('roll-up') || 
                     topic.includes('push-down')) {
            lectureId = 9;
          }
          
          questions.push(normalizeQuestion(q, source.id, lectureId));
        });
      }
    }
    
    console.log(`[all-questions] Loaded ${questions.length} questions from ${source.path}`);
    return questions;
  } catch (error) {
    console.warn(`[all-questions] Error loading ${source.path}:`, error.message);
    return [];
  }
}

/**
 * Updates the QUESTION_CATEGORIES constant based on loaded questions
 * @param {Array<Object>} questions - All loaded questions
 * @private
 */
function updateCategories(questions) {
  const lectures = new Set();
  const topics = new Set();
  const difficulty = { easy: 0, medium: 0, hard: 0, expert: 0 };
  const sources = new Set();
  
  // Track counts per lecture
  const lectureCounts = {};
  const topicCounts = {};
  
  questions.forEach(q => {
    // Collect unique values
    if (q.lectureId) {
      lectures.add(q.lectureId);
      lectureCounts[q.lectureId] = (lectureCounts[q.lectureId] || 0) + 1;
    }
    if (q.topic) {
      topics.add(q.topic);
      topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
    }
    if (q.difficulty) {
      difficulty[q.difficulty] = (difficulty[q.difficulty] || 0) + 1;
    }
    if (q.source) {
      sources.add(q.source);
    }
  });
  
  // Build lecture info with metadata
  const lectureInfo = Array.from(lectures).sort((a, b) => a - b).map(id => ({
    id,
    ...LECTURE_METADATA[id],
    questionCount: lectureCounts[id] || 0
  }));
  
  // Build topic info
  const topicInfo = Array.from(topics).sort().map(topic => ({
    name: topic,
    questionCount: topicCounts[topic] || 0
  }));
  
  QUESTION_CATEGORIES = {
    lectures: lectureInfo,
    topics: topicInfo,
    difficulty,
    sources: Array.from(sources),
    totalQuestions: questions.length,
    byLecture: lectureCounts,
    byTopic: topicCounts
  };
}

/**
 * Loads all questions from all data sources
 * 
 * @async
 * @returns {Promise<Array<Object>>} Promise resolving to array of all normalized questions
 * @throws {Error} If critical error occurs (returns empty array on non-critical failures)
 * 
 * @example
 * const questions = await loadAllQuestions();
 * console.log(`Loaded ${questions.length} total questions`);
 */
export async function loadAllQuestions() {
  // Return cached data if available
  if (questionsCache) {
    console.log('[all-questions] Returning cached questions');
    return questionsCache;
  }
  
  console.log('[all-questions] Loading all question data...');
  
  try {
    // Load all sources in parallel
    const results = await Promise.all(DATA_SOURCES.map(source => loadSource(source)));
    
    // Flatten results
    const allQuestions = results.flat();
    
    // Update categories
    updateCategories(allQuestions);
    
    // Cache results
    questionsCache = allQuestions;
    
    console.log(`[all-questions] Successfully loaded ${allQuestions.length} total questions`);
    console.log('[all-questions] Breakdown by source:', 
      DATA_SOURCES.map((s, i) => `${s.id}: ${results[i].length}`).join(', ')
    );
    
    return allQuestions;
  } catch (error) {
    console.error('[all-questions] Critical error loading questions:', error);
    // Return empty array on failure to allow graceful degradation
    return [];
  }
}

/**
 * Gets questions filtered by lecture ID
 * 
 * @param {number} lectureId - Lecture number (1-9)
 * @returns {Promise<Array<Object>>} Promise resolving to filtered questions
 * 
 * @example
 * // Get all questions for Lecture 5 (Transactions & UNION)
 * const lecture5Questions = await getQuestionsByLecture(5);
 * 
 * @example
 * // Get questions for multiple lectures
 * const questions = await loadAllQuestions();
 * const sqlBasics = questions.filter(q => [2, 3, 4].includes(q.lectureId));
 */
export async function getQuestionsByLecture(lectureId) {
  const questions = await loadAllQuestions();
  return questions.filter(q => q.lectureId === lectureId);
}

/**
 * Gets questions filtered by topic tag
 * 
 * @param {string} topic - Topic name to filter by
 * @param {boolean} exactMatch - If true, requires exact match; if false, allows partial match
 * @returns {Promise<Array<Object>>} Promise resolving to filtered questions
 * 
 * @example
 * // Get all questions about ACID properties
 * const acidQuestions = await getQuestionsByTopic('ACID Properties');
 * 
 * @example
 * // Get questions with partial topic match
 * const indexQuestions = await getQuestionsByTopic('Index', false);
 */
export async function getQuestionsByTopic(topic, exactMatch = true) {
  const questions = await loadAllQuestions();
  
  if (exactMatch) {
    return questions.filter(q => q.topic === topic);
  } else {
    const topicLower = topic.toLowerCase();
    return questions.filter(q => q.topic && q.topic.toLowerCase().includes(topicLower));
  }
}

/**
 * Gets questions filtered by difficulty level
 * 
 * @param {string} difficulty - Difficulty level ('easy', 'medium', 'hard', 'expert')
 * @returns {Promise<Array<Object>>} Promise resolving to filtered questions
 * 
 * @example
 * // Get all hard questions
 * const hardQuestions = await getQuestionsByDifficulty('hard');
 * 
 * @example
 * // Get mixed difficulty for a quiz
 * const easy = await getQuestionsByDifficulty('easy');
 * const medium = await getQuestionsByDifficulty('medium');
 * const quizQuestions = [...easy.slice(0, 3), ...medium.slice(0, 5)];
 */
export async function getQuestionsByDifficulty(difficulty) {
  const questions = await loadAllQuestions();
  const difficultyLower = difficulty.toLowerCase();
  return questions.filter(q => q.difficulty === difficultyLower);
}

/**
 * Gets questions by source
 * 
 * @param {string} source - Source identifier ('lectures-1-4', 'lectures-5-9', 'sectionA', 'sectionB', 'sectionC')
 * @returns {Promise<Array<Object>>} Promise resolving to filtered questions
 * 
 * @example
 * // Get all questions from Midterm 2 Section A
 * const sectionA = await getQuestionsBySource('sectionA');
 */
export async function getQuestionsBySource(source) {
  const questions = await loadAllQuestions();
  return questions.filter(q => q.source === source);
}

/**
 * Searches questions by text content
 * 
 * @param {string} searchTerm - Text to search for
 * @param {Object} options - Search options
 * @param {boolean} options.searchQuestions - Search in question text (default: true)
 * @param {boolean} options.searchExplanations - Search in explanations (default: false)
 * @param {boolean} options.caseSensitive - Case sensitive search (default: false)
 * @returns {Promise<Array<Object>>} Promise resolving to matching questions
 * 
 * @example
 * // Search for questions about JOIN operations
 * const joinQuestions = await searchQuestions('JOIN');
 * 
 * @example
 * // Search in both questions and explanations
 * const results = await searchQuestions('ACID', { 
 *   searchQuestions: true, 
 *   searchExplanations: true 
 * });
 */
export async function searchQuestions(searchTerm, options = {}) {
  const { 
    searchQuestions = true, 
    searchExplanations = false, 
    caseSensitive = false 
  } = options;
  
  const questions = await loadAllQuestions();
  
  const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();
  
  return questions.filter(q => {
    if (searchQuestions && q.question) {
      const questionText = caseSensitive ? q.question : q.question.toLowerCase();
      if (questionText.includes(term)) return true;
    }
    
    if (searchExplanations && q.explanation) {
      const explanationText = caseSensitive ? q.explanation : q.explanation.toLowerCase();
      if (explanationText.includes(term)) return true;
    }
    
    return false;
  });
}

/**
 * Creates a random quiz from all available questions
 * 
 * @param {number} count - Number of questions to include
 * @param {Object} options - Quiz generation options
 * @param {number[]} options.lectureIds - Limit to specific lectures
 * @param {string[]} options.difficulties - Limit to specific difficulties
 * @returns {Promise<Array<Object>>} Promise resolving to shuffled quiz questions
 * 
 * @example
 * // Create a 10-question quiz from lectures 5-9
 * const quiz = await createQuiz(10, { 
 *   lectureIds: [5, 6, 7, 8, 9],
 *   difficulties: ['medium', 'hard'] 
 * });
 */
export async function createQuiz(count, options = {}) {
  const { lectureIds = null, difficulties = null } = options;
  
  let questions = await loadAllQuestions();
  
  // Apply filters
  if (lectureIds && lectureIds.length > 0) {
    questions = questions.filter(q => lectureIds.includes(q.lectureId));
  }
  
  if (difficulties && difficulties.length > 0) {
    const difficultySet = difficulties.map(d => d.toLowerCase());
    questions = questions.filter(q => difficultySet.includes(q.difficulty));
  }
  
  // Shuffle and return requested count
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Clears the questions cache, forcing a reload on next access
 * Useful for testing or when data files may have changed
 */
export function clearCache() {
  questionsCache = null;
  console.log('[all-questions] Cache cleared');
}

/**
 * Gets summary statistics about the loaded questions
 * 
 * @returns {Promise<Object>} Promise resolving to statistics object
 * 
 * @example
 * const stats = await getQuestionStats();
 * console.log(`Total: ${stats.total}, By Lecture:`, stats.byLecture);
 */
export async function getQuestionStats() {
  await loadAllQuestions(); // Ensure categories are populated
  
  return {
    total: QUESTION_CATEGORIES.totalQuestions,
    byLecture: QUESTION_CATEGORIES.byLecture,
    byTopic: QUESTION_CATEGORIES.byTopic,
    byDifficulty: QUESTION_CATEGORIES.difficulty,
    bySource: QUESTION_CATEGORIES.sources.reduce((acc, source) => {
      acc[source] = questionsCache.filter(q => q.source === source).length;
      return acc;
    }, {})
  };
}

// Default export for convenience
export default {
  loadAllQuestions,
  getQuestionsByLecture,
  getQuestionsByTopic,
  getQuestionsByDifficulty,
  getQuestionsBySource,
  searchQuestions,
  createQuiz,
  clearCache,
  getQuestionStats,
  QUESTION_CATEGORIES
};
