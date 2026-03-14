/**
 * Gamification Module for Midterm 2 Study Platform
 * Handles XP, levels, badges, and progress tracking
 */

const Gamification = (function() {
    // Level titles
    const levelTitles = {
        1: 'Novice',
        2: 'Beginner',
        3: 'Learner',
        4: 'Student',
        5: 'Practitioner',
        6: 'Developer',
        7: 'Analyst',
        8: 'Specialist',
        9: 'Expert',
        10: 'Professional',
        11: 'Architect',
        12: 'Master',
        13: 'Guru',
        14: 'Sage',
        15: 'Legend'
    };

    // Badge definitions
    const badges = {
        first_quiz: { name: 'First Steps', icon: '👣', description: 'Complete your first quiz' },
        ten_quizzes: { name: 'Dedicated Student', icon: '📚', description: 'Complete 10 quizzes' },
        twenty_quizzes: { name: 'Quiz Master', icon: '🎯', description: 'Complete 20 quizzes' },
        perfect_score: { name: 'Perfectionist', icon: '💯', description: 'Get 100% on a quiz' },
        streak_3: { name: 'On Fire', icon: '🔥', description: 'Study 3 days in a row' },
        streak_7: { name: 'Week Warrior', icon: '📅', description: 'Study 7 days in a row' },
        streak_30: { name: 'Monthly Master', icon: '📆', description: 'Study 30 days in a row' },
        hundred_correct: { name: 'Century Club', icon: '💯', description: 'Answer 100 questions correctly' },
        five_hundred_correct: { name: 'Knowledge Seeker', icon: '🧠', description: 'Answer 500 questions correctly' },
        thousand_correct: { name: 'Database Virtuoso', icon: '🏆', description: 'Answer 1000 questions correctly' },
        five_hundred_xp: { name: 'Rising Star', icon: '⭐', description: 'Earn 500 XP' },
        thousand_xp: { name: 'Database Master', icon: '👑', description: 'Earn 1000 XP' },
        five_thousand_xp: { name: 'SQL Sage', icon: '🔮', description: 'Earn 5000 XP' },
        all_topics: { name: 'Well Rounded', icon: '🎨', description: 'Study all topics' },
        expert_difficulty: { name: 'Challenge Accepted', icon: '🎪', description: 'Complete an expert question' },
        speed_demon: { name: 'Speed Demon', icon: '⚡', description: 'Complete a quiz in under 5 minutes' },
        comeback: { name: 'Comeback Kid', icon: '🚀', description: 'Improve your score by 20%' }
    };

    // Initialize
    function init() {
        ensureUserData();
        updateStreak();
    }

    /**
     * Ensure user data exists
     */
    function ensureUserData() {
        if (!Storage) return;
        const data = Storage.getUserData();
        if (!data) {
            Storage.saveUserData({
                xp: 0,
                level: 1,
                questionsAnswered: 0,
                correctAnswers: 0,
                topicProgress: {},
                badges: [],
                streak: 0,
                lastStudyDate: null,
                quizHistory: []
            });
        }
    }

    /**
     * Get user stats
     */
    function getStats() {
        if (!Storage) return { xp: 0, level: 1, badges: [] };
        return Storage.getStats();
    }

    /**
     * Add XP to user
     */
    function addXP(amount, reason = '') {
        if (!Storage) return { xp: 0, level: 1, leveledUp: false };
        
        const result = Storage.addXP(amount);
        
        // Show notification
        showXPNotification(amount, reason);
        
        // Check for level up
        if (result.leveledUp) {
            showLevelUpNotification(result.level);
        }
        
        // Update UI
        updateUI();
        
        return result;
    }

    /**
     * Record question attempt
     */
    function recordQuestion(topic, difficulty, correct, timeSpent) {
        if (!Storage) return;
        
        const data = Storage.getUserData();
        
        // Update counters
        data.questionsAnswered++;
        if (correct) {
            data.correctAnswers++;
        }
        
        // Update topic progress
        if (!data.topicProgress[topic]) {
            data.topicProgress[topic] = { correct: 0, total: 0 };
        }
        data.topicProgress[topic].total++;
        if (correct) {
            data.topicProgress[topic].correct++;
        }
        
        Storage.saveUserData(data);
        checkBadgeTriggers(data);
        updateUI();
    }

    /**
     * Record quiz completion
     */
    function recordQuiz(quizData) {
        if (!Storage) return;
        
        const data = Storage.getUserData();
        
        // Add to history
        data.quizHistory.unshift({
            date: Date.now(),
            ...quizData
        });
        
        // Keep only last 50
        data.quizHistory = data.quizHistory.slice(0, 50);
        
        // Update stats
        data.questionsAnswered += quizData.answered || 0;
        data.correctAnswers += quizData.correct || 0;
        
        // Update topic progress
        if (quizData.topicStats) {
            Object.entries(quizData.topicStats).forEach(([topic, stats]) => {
                if (!data.topicProgress[topic]) {
                    data.topicProgress[topic] = { correct: 0, total: 0 };
                }
                data.topicProgress[topic].correct += stats.correct || 0;
                data.topicProgress[topic].total += stats.total || 0;
            });
        }
        
        // Update streak
        updateStreak();
        
        Storage.saveUserData(data);
        checkBadgeTriggers(data);
        updateUI();
    }

    /**
     * Update study streak
     */
    function updateStreak() {
        if (!Storage) return;
        
        const data = Storage.getUserData();
        const today = new Date().toDateString();
        const lastDate = data.lastStudyDate ? new Date(data.lastStudyDate).toDateString() : null;
        
        if (lastDate === today) {
            // Already studied today
            return;
        }
        
        if (lastDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastDate === yesterday.toDateString()) {
                data.streak++;
                if (data.streak > 1) {
                    showStreakNotification(data.streak);
                }
            } else {
                if (data.streak > 0) {
                    showStreakBrokenNotification();
                }
                data.streak = 1;
            }
        } else {
            data.streak = 1;
        }
        
        data.lastStudyDate = Date.now();
        Storage.saveUserData(data);
        updateUI();
    }

    /**
     * Check and award badges
     */
    function checkBadgeTriggers(data) {
        const newBadges = [];
        
        // Count quizzes and topics
        const totalQuizzes = data.quizHistory.length;
        const uniqueTopics = Object.keys(data.topicProgress).length;
        
        // Quiz count badges
        if (totalQuizzes >= 1 && !data.badges.includes('first_quiz')) {
            newBadges.push('first_quiz');
        }
        if (totalQuizzes >= 10 && !data.badges.includes('ten_quizzes')) {
            newBadges.push('ten_quizzes');
        }
        if (totalQuizzes >= 20 && !data.badges.includes('twenty_quizzes')) {
            newBadges.push('twenty_quizzes');
        }
        
        // Correct answer badges
        if (data.correctAnswers >= 100 && !data.badges.includes('hundred_correct')) {
            newBadges.push('hundred_correct');
        }
        if (data.correctAnswers >= 500 && !data.badges.includes('five_hundred_correct')) {
            newBadges.push('five_hundred_correct');
        }
        if (data.correctAnswers >= 1000 && !data.badges.includes('thousand_correct')) {
            newBadges.push('thousand_correct');
        }
        
        // XP badges
        if (data.xp >= 500 && !data.badges.includes('five_hundred_xp')) {
            newBadges.push('five_hundred_xp');
        }
        if (data.xp >= 1000 && !data.badges.includes('thousand_xp')) {
            newBadges.push('thousand_xp');
        }
        if (data.xp >= 5000 && !data.badges.includes('five_thousand_xp')) {
            newBadges.push('five_thousand_xp');
        }
        
        // Streak badges
        if (data.streak >= 3 && !data.badges.includes('streak_3')) {
            newBadges.push('streak_3');
        }
        if (data.streak >= 7 && !data.badges.includes('streak_7')) {
            newBadges.push('streak_7');
        }
        if (data.streak >= 30 && !data.badges.includes('streak_30')) {
            newBadges.push('streak_30');
        }
        
        // All topics badge
        if (uniqueTopics >= 6 && !data.badges.includes('all_topics')) {
            newBadges.push('all_topics');
        }
        
        // Perfect score check
        if (!data.badges.includes('perfect_score')) {
            const hasPerfect = data.quizHistory.some(q => q.percentage === 100);
            if (hasPerfect) {
                newBadges.push('perfect_score');
            }
        }
        
        // Award new badges
        newBadges.forEach(badgeId => {
            data.badges.push(badgeId);
            showBadgeNotification(badgeId);
        });
        
        if (newBadges.length > 0) {
            Storage.saveUserData(data);
        }
    }

    /**
     * Get level title
     */
    function getLevelTitle(level) {
        return levelTitles[level] || 'Grandmaster';
    }

    /**
     * Get badge info
     */
    function getBadgeInfo(badgeId) {
        return badges[badgeId] || { name: 'Unknown Badge', icon: '❓', description: '' };
    }

    /**
     * Get all badges
     */
    function getAllBadges() {
        return badges;
    }

    /**
     * Show XP notification
     */
    function showXPNotification(amount, reason) {
        if (typeof Utils !== 'undefined') {
            const msg = reason ? `+${amount} XP: ${reason}` : `+${amount} XP`;
            Utils.showToast(msg, 'success', 2000);
        }
    }

    /**
     * Show level up notification
     */
    function showLevelUpNotification(level) {
        const title = getLevelTitle(level);
        const message = `🎉 Level Up! You are now a ${title} (Level ${level})`;
        
        if (typeof Utils !== 'undefined') {
            Utils.showToast(message, 'success', 5000);
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('levelup', { 
            detail: { level, title } 
        }));
    }

    /**
     * Show badge notification
     */
    function showBadgeNotification(badgeId) {
        const badge = getBadgeInfo(badgeId);
        const message = `${badge.icon} Badge Unlocked: ${badge.name}!`;
        
        if (typeof Utils !== 'undefined') {
            Utils.showToast(message, 'success', 5000);
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('badgeunlocked', { 
            detail: { id: badgeId, ...badge } 
        }));
    }

    /**
     * Show streak notification
     */
    function showStreakNotification(streak) {
        const messages = {
            3: '🔥 3 day streak! Keep it up!',
            7: '📅 Week warrior! 7 day streak!',
            14: '🌟 2 weeks strong! 14 day streak!',
            30: '📆 Monthly master! 30 day streak!',
            50: '💪 Half century! 50 day streak!',
            100: '🏆 Legendary! 100 day streak!'
        };
        
        const message = messages[streak] || `${streak} day streak! Amazing!`;
        
        if (typeof Utils !== 'undefined') {
            Utils.showToast(message, 'info', 3000);
        }
    }

    /**
     * Show streak broken notification
     */
    function showStreakBrokenNotification() {
        if (typeof Utils !== 'undefined') {
            Utils.showToast('💔 Streak broken! Start a new one today!', 'warning', 3000);
        }
    }

    /**
     * Update UI elements with current stats
     */
    function updateUI() {
        const stats = getStats();
        
        // Update XP display
        const xpDisplay = document.getElementById('xp-display');
        if (xpDisplay) {
            xpDisplay.textContent = stats.xp;
        }
        
        // Update level display
        const levelDisplay = document.getElementById('level-display');
        if (levelDisplay) {
            levelDisplay.textContent = stats.level;
        }
        
        // Update progress bar if exists
        const progressBar = document.getElementById('level-progress');
        if (progressBar && stats.xpForNextLevel) {
            const progress = (stats.xpProgress / stats.xpForNextLevel) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    /**
     * Get leaderboard data (local only)
     */
    function getLeaderboard() {
        // In a real app, this would fetch from a server
        // For now, return local stats
        const stats = getStats();
        return [{
            name: 'You',
            xp: stats.xp,
            level: stats.level,
            correctAnswers: stats.correctAnswers,
            streak: stats.streak
        }];
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return {
        init,
        getStats,
        addXP,
        recordQuestion,
        recordQuiz,
        updateStreak,
        getLevelTitle,
        getBadgeInfo,
        getAllBadges,
        getLeaderboard,
        updateUI
    };
})();

// Make available globally
window.Gamification = Gamification;
