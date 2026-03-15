# ACS-3902 Database Systems Course Platform

A comprehensive learning platform for Database Systems (ACS-3902) with interactive lectures, simulators, and practice tests.

## 🚀 Live Demo

Visit the live platform: https://osazain.github.io/acs-3902/

## 📚 Features

### Interactive Lectures (9 Topics)
1. Course Introduction
2. SQL Fundamentals
3. Joins, Aggregates, Subqueries
4. Views, CASE, UNION
5. Transactions
6. CTEs, Triggers, Indexes
7. Indexes & Relational Algebra
8. EERD Modeling
9. 8-Step Transformation

### Interactive Simulators (11 Tools)
- SQL Join Simulator
- Aggregate Function Simulator
- DDL Schema Builder
- RA Expression Builder
- CTE Simulator
- Query Tree Visualizer
- Notation Converter
- Subtype Validator
- Weak Entity Identifier
- Cardinality Reader
- 8-Step Transformation Wizard

### Practice Test System
- 193+ questions across all topics
- 8 question types (MCQ, SQL writing, EERD drawing, etc.)
- Topic-specific tests
- Comprehensive exam simulation
- Detailed explanations for wrong answers
- Progress tracking by topic

## 🛠️ Technologies

- HTML5
- CSS3 (with CSS Variables for theming)
- Vanilla JavaScript (no frameworks)
- SVG for diagrams
- LocalStorage for progress tracking
- GitHub Pages for hosting

## 📁 Project Structure

```
acs3902-platform/
├── index.html                 # Main entry point
├── css/                       # Stylesheets
│   ├── themes.css            # Light/dark theme variables
│   ├── styles.css            # Main styles
│   ├── components.css        # Component styles
│   └── eerd-component.css    # EERD drawing styles
├── js/                        # JavaScript files
│   ├── navigation.js         # Navigation handling
│   ├── test-question-bank.js # Practice test questions
│   ├── sql-evaluator.js      # SQL code evaluation
│   └── eerd-drawing-component.js # EERD drawing
├── pages/                     # Page files
│   ├── lectures/             # Lecture pages (1-9)
│   ├── simulator-*.html      # Simulator pages
│   ├── practice-test.html    # Practice test
│   ├── test-results.html     # Test results
│   └── ...
└── README.md                 # This file
```

## 📱 Progressive Web App (Optional)

The platform is designed as a PWA:
- Works offline after first load
- Responsive design for mobile/tablet/desktop
- Theme persistence (light/dark mode)
- Progress saved in browser storage

## 📄 License

MIT License - Free for educational use

## 🎓 Course Information

This platform supports ACS-3902 Database Systems course covering:
- SQL Programming (DDL, DML, DCL)
- Relational Algebra
- Entity-Relationship Modeling
- Database Design & Normalization
- Transaction Management
- Indexing & Query Optimization
