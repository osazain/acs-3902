# Contributing to ACS-3902 Platform

Thank you for your interest in contributing to the ACS-3902 Database Systems Course Platform! This document provides guidelines for contributing.

## 🎯 Types of Contributions

### Content Contributions
- **New practice questions** for the test bank
- **Additional lecture content** or examples
- **Simulator improvements** or new interactive tools
- **Bug fixes** for existing content

### Code Contributions
- **UI/UX improvements**
- **Performance optimizations**
- **Accessibility enhancements**
- **Bug fixes**

## 📝 Guidelines

### Adding Practice Questions

When adding new questions to the test bank:

1. **Follow the existing format** in `js/test-question-bank.js`
2. **Include all required fields**:
   - `id`: Unique identifier
   - `topic`: Topic number (1-9)
   - `type`: Question type (mcq, sql, eer-diagram, etc.)
   - `question`: Clear, concise question text
   - `options`: For MCQ questions
   - `correctAnswer`: The correct answer
   - `explanation`: Detailed explanation for wrong answers

3. **Ensure accuracy**: Questions should align with course material
4. **Test thoroughly**: Verify questions work correctly in the practice test UI

### Code Style

- Use **consistent indentation** (2 spaces for HTML/CSS/JS)
- Add **comments** for complex logic
- Follow **semantic HTML** practices
- Ensure **mobile responsiveness**
- Maintain **accessibility standards** (ARIA labels, keyboard navigation)

### Commit Messages

Use clear, descriptive commit messages:

```
feat: Add 20 new SQL practice questions for Topic 3
fix: Correct RA notation rendering in dark mode
docs: Update README with new simulator list
style: Improve EERD canvas responsiveness
```

## 🚀 Getting Started

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Test locally**: Open `index.html` in a browser
5. **Commit your changes**: `git commit -am 'Add new feature'`
6. **Push to your fork**: `git push origin feature/your-feature-name`
7. **Submit a Pull Request**

## 🧪 Testing

Before submitting:

- [ ] Test in multiple browsers (Chrome, Firefox, Safari)
- [ ] Verify mobile responsiveness
- [ ] Check both light and dark themes
- [ ] Ensure no console errors
- [ ] Test any new questions in the practice test

## 📞 Questions?

For questions or discussions:
- Open an **Issue** for bugs or feature requests
- Start a **Discussion** for general questions

## 🎓 Educational Use

This platform is designed for educational purposes. Contributions should maintain:
- Academic integrity
- Accurate database concepts
- Clear, educational explanations

---

Thank you for helping improve the ACS-3902 learning experience!
