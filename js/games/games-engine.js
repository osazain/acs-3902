/**
 * ACS-3902 Educational Games Engine
 * Shared game functionality for all lecture games
 */

class GamesEngine {
    constructor() {
        this.currentGame = null;
        this.score = 0;
        this.highScores = this.loadHighScores();
        this.achievements = this.loadAchievements();
        this.difficulty = 'easy';
        this.soundEnabled = true;
        this.animationsEnabled = true;
    }

    // Initialize the game engine
    init() {
        this.loadSettings();
        this.setupAudio();
    }

    // Audio context for sound effects
    setupAudio() {
        this.audioContext = null;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    // Play sound effect
    playSound(type) {
        if (!this.soundEnabled || !this.audioContext) return;

        const frequencies = {
            correct: 880,    // A5
            incorrect: 220,  // A3
            click: 440,      // A4
            win: 1320,       // E6
            lose: 165,       // E3
            tick: 600,
            achievement: 1046 // C6
        };

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequencies[type] || 440;
        oscillator.type = type === 'incorrect' || type === 'lose' ? 'sawtooth' : 'sine';

        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }

    // High score management
    loadHighScores() {
        const stored = localStorage.getItem('acs3902_highscores');
        return stored ? JSON.parse(stored) : {};
    }

    saveHighScore(gameId, score) {
        if (!this.highScores[gameId]) {
            this.highScores[gameId] = { easy: 0, medium: 0, hard: 0 };
        }
        
        if (score > this.highScores[gameId][this.difficulty]) {
            this.highScores[gameId][this.difficulty] = score;
            localStorage.setItem('acs3902_highscores', JSON.stringify(this.highScores));
            return true; // New high score
        }
        return false;
    }

    getHighScore(gameId) {
        return this.highScores[gameId]?.[this.difficulty] || 0;
    }

    // Achievement system
    loadAchievements() {
        const stored = localStorage.getItem('acs3902_achievements');
        return stored ? JSON.parse(stored) : {
            firstWin: { unlocked: false, name: "First Steps", description: "Complete your first game" },
            speedDemon: { unlocked: false, name: "Speed Demon", description: "Complete a game in under 30 seconds" },
            perfectScore: { unlocked: false, name: "Perfectionist", description: "Get a perfect score" },
            allGames: { unlocked: false, name: "Game Master", description: "Play all 9 games" },
            highScorer: { unlocked: false, name: "High Scorer", description: "Beat a high score" },
            expert: { unlocked: false, name: "Expert", description: "Win on Hard difficulty" },
            streak: { unlocked: false, name: "On Fire", description: "5 correct answers in a row" }
        };
    }

    unlockAchievement(achievementId) {
        if (this.achievements[achievementId] && !this.achievements[achievementId].unlocked) {
            this.achievements[achievementId].unlocked = true;
            localStorage.setItem('acs3902_achievements', JSON.stringify(this.achievements));
            this.showAchievementNotification(this.achievements[achievementId]);
            this.playSound('achievement');
            return true;
        }
        return false;
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-content">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }

    // Settings management
    loadSettings() {
        const settings = localStorage.getItem('acs3902_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.soundEnabled = parsed.soundEnabled ?? true;
            this.animationsEnabled = parsed.animationsEnabled ?? true;
            this.difficulty = parsed.difficulty || 'easy';
        }
    }

    saveSettings() {
        localStorage.setItem('acs3902_settings', JSON.stringify({
            soundEnabled: this.soundEnabled,
            animationsEnabled: this.animationsEnabled,
            difficulty: this.difficulty
        }));
    }

    // Utility functions
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    animate(element, animation, duration = 500) {
        if (!this.animationsEnabled) return Promise.resolve();
        
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = `${animation} ${duration}ms ease`;
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    }

    // Timer class for games
    createTimer(duration, onTick, onComplete) {
        let timeLeft = duration;
        let timerId = null;
        let isPaused = false;

        const tick = () => {
            if (!isPaused) {
                timeLeft--;
                onTick(timeLeft);
                
                if (timeLeft <= 0) {
                    stop();
                    onComplete();
                }
            }
        };

        const start = () => {
            timerId = setInterval(tick, 1000);
            onTick(timeLeft);
        };

        const stop = () => {
            if (timerId) {
                clearInterval(timerId);
                timerId = null;
            }
        };

        const pause = () => { isPaused = true; };
        const resume = () => { isPaused = false; };
        const getTimeLeft = () => timeLeft;

        return { start, stop, pause, resume, getTimeLeft };
    }

    // Base game class
    createGame(config) {
        return {
            id: config.id,
            name: config.name,
            description: config.description,
            lecture: config.lecture,
            difficulty: this.difficulty,
            score: 0,
            timer: null,
            isPlaying: false,
            
            start: config.start || (() => {}),
            stop: config.stop || (() => {}),
            reset: config.reset || (() => {}),
            render: config.render || (() => {})
        };
    }

    // Track played games for achievements
    trackGamePlayed(gameId) {
        const played = JSON.parse(localStorage.getItem('acs3902_gamesPlayed') || '[]');
        if (!played.includes(gameId)) {
            played.push(gameId);
            localStorage.setItem('acs3902_gamesPlayed', JSON.stringify(played));
            
            if (played.length >= 9) {
                this.unlockAchievement('allGames');
            }
        }
    }
}

// Global game engine instance
const gamesEngine = new GamesEngine();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    gamesEngine.init();
});

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GamesEngine, gamesEngine };
}
