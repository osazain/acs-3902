/**
 * Storage Module for Midterm 2 Study Platform
 * Handles localStorage operations with fallback to memory storage
 */

const Storage = (function() {
    const STORAGE_KEY = 'midterm2_prep_data';
    let memoryStorage = null;
    
    // Check if localStorage is available
    const hasLocalStorage = (function() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    })();

    /**
     * Get storage mechanism
     */
    function getStorage() {
        if (hasLocalStorage) {
            return localStorage;
        }
        // Fallback to memory storage
        if (!memoryStorage) {
            memoryStorage = {};
        }
        return {
            getItem: (key) => memoryStorage[key] || null,
            setItem: (key, value) => { memoryStorage[key] = value; },
            removeItem: (key) => { delete memoryStorage[key]; }
        };
    }

    /**
     * Save data to storage
     */
    function save(key, data) {
        try {
            const storage = getStorage();
            storage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    }

    /**
     * Load data from storage
     */
    function load(key, defaultValue = null) {
        try {
            const storage = getStorage();
            const data = storage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Storage load error:', error);
            return defaultValue;
        }
    }

    /**
     * Remove data from storage
     */
    function remove(key) {
        try {
            const storage = getStorage();
            storage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    /**
     * Clear all app data
     */
    function clear() {
        try {
            const storage = getStorage();
            // Only clear our keys
            const keys = Object.keys(storage);
            keys.forEach(key => {
                if (key.startsWith('midterm2_') || key === STORAGE_KEY) {
                    storage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    /**
     * Get user progress data
     */
    function getUserData() {
        return load('midterm2_user_data', {
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

    /**
     * Save user progress data
     */
    function saveUserData(data) {
        return save('midterm2_user_data', data);
    }

    /**
     * Update specific field in user data
     */
    function updateUserData(updates) {
        const data = getUserData();
        Object.assign(data, updates);
        return saveUserData(data);
    }

    /**
     * Add XP to user
     */
    function addXP(amount) {
        const data = getUserData();
        data.xp += amount;
        
        // Check for level up
        const newLevel = calculateLevel(data.xp);
        const leveledUp = newLevel > data.level;
        data.level = newLevel;
        
        saveUserData(data);
        return { xp: data.xp, level: data.level, leveledUp };
    }

    /**
     * Calculate level based on XP
     */
    function calculateLevel(xp) {
        // Level formula: each level requires level * 100 XP
        let level = 1;
        let xpNeeded = 100;
        let remainingXP = xp;
        
        while (remainingXP >= xpNeeded) {
            remainingXP -= xpNeeded;
            level++;
            xpNeeded = level * 100;
        }
        
        return Math.min(level, 50); // Max level 50
    }

    /**
     * Get XP needed for next level
     */
    function getXPForNextLevel(currentLevel) {
        return currentLevel * 100;
    }

    /**
     * Get XP progress in current level
     */
    function getXPProgress(xp, level) {
        let accumulatedXP = 0;
        for (let i = 1; i < level; i++) {
            accumulatedXP += i * 100;
        }
        return xp - accumulatedXP;
    }

    /**
     * Record quiz attempt
     */
    function recordQuizAttempt(quizData) {
        const data = getUserData();
        
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
        
        // Add to history
        data.quizHistory.unshift({
            date: Date.now(),
            ...quizData
        });
        
        // Keep only last 50
        data.quizHistory = data.quizHistory.slice(0, 50);
        
        // Update streak
        updateStreak(data);
        
        // Check for badges
        checkBadges(data);
        
        saveUserData(data);
        return data;
    }

    /**
     * Update study streak
     */
    function updateStreak(data) {
        const today = new Date().toDateString();
        const lastDate = data.lastStudyDate ? new Date(data.lastStudyDate).toDateString() : null;
        
        if (lastDate === today) {
            // Already studied today, no change
        } else if (lastDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastDate === yesterday.toDateString()) {
                // Consecutive day
                data.streak++;
            } else {
                // Streak broken
                data.streak = 1;
            }
        } else {
            // First time studying
            data.streak = 1;
        }
        
        data.lastStudyDate = Date.now();
    }

    /**
     * Check and award badges
     */
    function checkBadges(data) {
        const badges = [
            { id: 'first_quiz', name: 'First Steps', condition: () => data.quizHistory.length >= 1 },
            { id: 'ten_quizzes', name: 'Dedicated Student', condition: () => data.quizHistory.length >= 10 },
            { id: 'perfect_score', name: 'Perfectionist', condition: () => data.quizHistory.some(q => q.percentage === 100) },
            { id: 'streak_3', name: 'On Fire', condition: () => data.streak >= 3 },
            { id: 'streak_7', name: 'Week Warrior', condition: () => data.streak >= 7 },
            { id: 'hundred_correct', name: 'Century Club', condition: () => data.correctAnswers >= 100 },
            { id: 'five_hundred_xp', name: 'Rising Star', condition: () => data.xp >= 500 },
            { id: 'thousand_xp', name: 'Database Master', condition: () => data.xp >= 1000 }
        ];
        
        badges.forEach(badge => {
            if (!data.badges.includes(badge.id) && badge.condition()) {
                data.badges.push(badge.id);
                // Trigger badge notification
                if (typeof Utils !== 'undefined') {
                    Utils.showToast(`🏅 Badge Unlocked: ${badge.name}!`, 'success');
                }
            }
        });
    }

    /**
     * Get study statistics
     */
    function getStats() {
        const data = getUserData();
        const totalQuizzes = data.quizHistory.length;
        const accuracy = data.questionsAnswered > 0 
            ? Math.round((data.correctAnswers / data.questionsAnswered) * 100) 
            : 0;
        
        return {
            xp: data.xp,
            level: data.level,
            xpForNextLevel: getXPForNextLevel(data.level),
            xpProgress: getXPProgress(data.xp, data.level),
            questionsAnswered: data.questionsAnswered,
            correctAnswers: data.correctAnswers,
            accuracy,
            streak: data.streak,
            totalQuizzes,
            badges: data.badges,
            topicProgress: data.topicProgress
        };
    }

    /**
     * Export user data
     */
    function exportData() {
        const data = {
            userData: getUserData(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import user data
     */
    function importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.userData) {
                saveUserData(data.userData);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }

    // Public API
    return {
        save,
        load,
        remove,
        clear,
        getUserData,
        saveUserData,
        updateUserData,
        addXP,
        calculateLevel,
        getXPForNextLevel,
        getXPProgress,
        recordQuizAttempt,
        getStats,
        checkBadges,
        exportData,
        importData,
        hasLocalStorage
    };
})();

// Make available globally
window.Storage = Storage;
