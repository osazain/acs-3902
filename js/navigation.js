/**
 * ACS-3902 Navigation and Theme Manager
 * Handles sidebar, mobile menu, and theme toggle functionality
 */

(function() {
    'use strict';

    // ============================================
    // THEME MANAGEMENT
    // ============================================
    const ThemeManager = {
        init() {
            this.themeToggle = document.getElementById('theme-toggle');
            this.themeSwitch = document.getElementById('theme-switch');
            this.themeIcon = document.getElementById('theme-icon');
            this.themeText = document.getElementById('theme-text');
            this.html = document.documentElement;

            if (this.themeToggle) {
                this.themeToggle.addEventListener('click', () => this.toggle());
            }

            this.loadSavedTheme();
        },

        toggle() {
            const currentTheme = this.html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        },

        setTheme(theme) {
            this.html.setAttribute('data-theme', theme);
            localStorage.setItem('acs3902-theme', theme);

            if (this.themeSwitch) {
                this.themeSwitch.classList.toggle('active', theme === 'dark');
            }

            if (this.themeIcon) {
                this.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
            }

            if (this.themeText) {
                this.themeText.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
            }
        },

        loadSavedTheme() {
            const savedTheme = localStorage.getItem('acs3902-theme') || 'light';
            this.setTheme(savedTheme);
        }
    };

    // ============================================
    // MOBILE NAVIGATION
    // ============================================
    const MobileNav = {
        init() {
            this.menuToggle = document.getElementById('menu-toggle');
            this.sidebar = document.getElementById('sidebar');
            this.sidebarOverlay = document.getElementById('sidebar-overlay');

            if (this.menuToggle) {
                this.menuToggle.addEventListener('click', () => this.toggle());
            }

            if (this.sidebarOverlay) {
                this.sidebarOverlay.addEventListener('click', () => this.close());
            }

            // Close sidebar on window resize if above mobile breakpoint
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    this.close();
                }
            });
        },

        toggle() {
            this.sidebar?.classList.toggle('active');
            this.sidebarOverlay?.classList.toggle('active');
            this.menuToggle?.classList.toggle('active');
        },

        open() {
            this.sidebar?.classList.add('active');
            this.sidebarOverlay?.classList.add('active');
            this.menuToggle?.classList.add('active');
        },

        close() {
            this.sidebar?.classList.remove('active');
            this.sidebarOverlay?.classList.remove('active');
            this.menuToggle?.classList.remove('active');
        }
    };

    // ============================================
    // ACTIVE NAVIGATION LINK
    // ============================================
    const NavHighlighter = {
        init() {
            const currentPath = window.location.pathname;
            const navLinks = document.querySelectorAll('.nav-link');

            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href) {
                    // Check if current page matches the link
                    const normalizedHref = href.replace(/^\.\.\//, '').replace(/^\.\.\/\.\.\//, '');
                    const normalizedPath = currentPath.replace(/^.*[\\/]/, '');
                    
                    if (currentPath.includes(normalizedHref) || normalizedHref.includes(normalizedPath)) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                }
            });
        }
    };

    // ============================================
    // INITIALIZE
    // ============================================
    document.addEventListener('DOMContentLoaded', () => {
        ThemeManager.init();
        MobileNav.init();
        NavHighlighter.init();
    });

    // Expose to global scope for manual access
    window.ACS3902Nav = {
        ThemeManager,
        MobileNav
    };
})();
