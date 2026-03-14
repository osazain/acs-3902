/**
 * Utility Functions for Midterm 2 Study Platform
 */

const Utils = (function() {
    /**
     * Format a number with commas
     */
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Debounce function execution
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Generate a unique ID
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Deep clone an object
     */
    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Shuffle an array (Fisher-Yates algorithm)
     */
    function shuffleArray(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    /**
     * Format time in seconds to MM:SS
     */
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Format time in seconds to "X minutes Y seconds"
     */
    function formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins === 0) return `${secs}s`;
        if (secs === 0) return `${mins}m`;
        return `${mins}m ${secs}s`;
    }

    /**
     * Escape HTML special characters
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Sanitize a string for use as a filename
     */
    function sanitizeFilename(str) {
        return str.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

    /**
     * Get a random item from an array
     */
    function randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Calculate percentage
     */
    function percentage(part, total) {
        if (total === 0) return 0;
        return Math.round((part / total) * 100);
    }

    /**
     * Clamp a number between min and max
     */
    function clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    /**
     * Check if an element is in viewport
     */
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Animate a number counting up
     */
    function animateNumber(element, start, end, duration = 1000) {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out quart
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (end - start) * easeProgress);
            
            element.textContent = formatNumber(current);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    /**
     * Capitalize first letter
     */
    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Convert topic ID to display name
     */
    function formatTopic(topic) {
        const topicNames = {
            'transactions': 'Transactions',
            'union': 'UNION Operations',
            'cte': 'CTEs',
            'triggers': 'Triggers',
            'indexes': 'Indexes',
            'relational_algebra': 'Relational Algebra',
            'eerd': 'EERD Modeling',
            'transformation': '8-Step Transformation'
        };
        return topicNames[topic] || capitalize(topic.replace(/_/g, ' '));
    }

    /**
     * Convert difficulty to display with emoji
     */
    function formatDifficulty(difficulty) {
        const emojis = {
            'easy': '🟢',
            'medium': '🟡',
            'hard': '🔴',
            'expert': '⚫'
        };
        return `${emojis[difficulty] || '⚪'} ${capitalize(difficulty)}`;
    }

    /**
     * Copy text to clipboard
     */
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        }
    }

    /**
     * Show a temporary toast notification
     */
    function showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toast-container') || createToastContainer();
        container.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Remove after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
        return container;
    }

    /**
     * Group array items by a key
     */
    function groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(item);
            return groups;
        }, {});
    }

    /**
     * Calculate days between two dates
     */
    function daysBetween(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((date1 - date2) / oneDay));
    }

    /**
     * Check if localStorage is available
     */
    function isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Public API
    return {
        formatNumber,
        debounce,
        generateId,
        deepClone,
        shuffleArray,
        formatTime,
        formatDuration,
        escapeHtml,
        sanitizeFilename,
        randomItem,
        percentage,
        clamp,
        isInViewport,
        animateNumber,
        capitalize,
        formatTopic,
        formatDifficulty,
        copyToClipboard,
        showToast,
        groupBy,
        daysBetween,
        isStorageAvailable
    };
})();

// Make available globally
window.Utils = Utils;
