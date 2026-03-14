/**
 * SQL Join Simulator
 * ACS-3902 Database Systems - Midterm 2 Prep
 * 
 * Features:
 * - Visual representation of SQL JOIN operations
 * - Interactive animations showing row matching
 * - Support for INNER, LEFT, RIGHT, FULL, and CROSS JOINs
 * - SQL code generation with explanations
 * - Compare mode for side-by-side join comparison
 * - Step-by-step animation of join execution
 */

class SQLJoinSimulator {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      enableAnimations: true,
      animationSpeed: 800,
      showCompareMode: true,
      ...options
    };
    
    // Current state
    this.currentJoinType = 'INNER';
    this.isAnimating = false;
    this.animationStep = 0;
    this.compareMode = false;
    
    // Sample data - Students and Enrollments tables
    this.tableA = {
      name: 'Students',
      alias: 'S',
      columns: ['student_id', 'name', 'major'],
      data: [
        { student_id: 1, name: 'Alice Johnson', major: 'CS' },
        { student_id: 2, name: 'Bob Smith', major: 'Math' },
        { student_id: 3, name: 'Carol White', major: 'CS' },
        { student_id: 4, name: 'David Brown', major: 'Physics' },
        { student_id: 5, name: 'Eve Davis', major: 'Math' },
        { student_id: 6, name: 'Frank Miller', major: 'Biology' }
      ]
    };
    
    this.tableB = {
      name: 'Enrollments',
      alias: 'E',
      columns: ['enroll_id', 'student_id', 'course', 'grade'],
      data: [
        { enroll_id: 101, student_id: 1, course: 'DBMS', grade: 'A' },
        { enroll_id: 102, student_id: 1, course: 'Algorithms', grade: 'B+' },
        { enroll_id: 103, student_id: 2, course: 'DBMS', grade: 'A-' },
        { enroll_id: 104, student_id: 3, course: 'Networks', grade: 'B' },
        { enroll_id: 105, student_id: 7, course: 'DBMS', grade: 'C+' },
        { enroll_id: 106, student_id: 8, course: 'AI', grade: 'A' }
      ]
    };
    
    // Join type definitions with descriptions and SQL templates
    this.joinTypes = {
      'INNER': {
        name: 'INNER JOIN',
        description: 'Returns only rows that have matching values in both tables.',
        sqlTemplate: 'SELECT * FROM {left} INNER JOIN {right} ON {condition};',
        shortDesc: 'Only matching rows from both tables'
      },
      'LEFT': {
        name: 'LEFT OUTER JOIN',
        description: 'Returns all rows from the left table, and matching rows from the right table. Non-matching right side rows have NULL values.',
        sqlTemplate: 'SELECT * FROM {left} LEFT OUTER JOIN {right} ON {condition};',
        shortDesc: 'All left table rows + matches from right'
      },
      'RIGHT': {
        name: 'RIGHT OUTER JOIN',
        description: 'Returns all rows from the right table, and matching rows from the left table. Non-matching left side rows have NULL values.',
        sqlTemplate: 'SELECT * FROM {left} RIGHT OUTER JOIN {right} ON {condition};',
        shortDesc: 'All right table rows + matches from left'
      },
      'FULL': {
        name: 'FULL OUTER JOIN',
        description: 'Returns all rows from both tables. Matching rows are combined, non-matching rows have NULLs for the other table.',
        sqlTemplate: 'SELECT * FROM {left} FULL OUTER JOIN {right} ON {condition};',
        shortDesc: 'All rows from both tables'
      },
      'CROSS': {
        name: 'CROSS JOIN',
        description: 'Returns the Cartesian product - all possible combinations of rows from both tables. No join condition needed.',
        sqlTemplate: 'SELECT * FROM {left} CROSS JOIN {right};',
        shortDesc: 'Cartesian product (all combinations)'
      }
    };
    
    // Tooltip content for educational purposes
    this.tooltips = {
      'INNER': 'Think of INNER JOIN as the intersection of two sets - only what they have in common.',
      'LEFT': 'LEFT JOIN keeps everything from the left table. Use when you need all records from the primary table.',
      'RIGHT': 'RIGHT JOIN is the reverse of LEFT JOIN. Less commonly used - you can usually swap table order instead.',
      'FULL': 'FULL JOIN combines both LEFT and RIGHT joins. Useful when you need all data from both tables.',
      'CROSS': 'CROSS JOIN creates every possible combination. Be careful - it can generate huge result sets!',
      'match': 'This row has a matching value in the join condition',
      'no-match-left': 'No matching row exists in the left table',
      'no-match-right': 'No matching row exists in the right table',
      'null': 'NULL represents missing or unknown data'
    };
    
    this.init();
  }
  
  init() {
    this.renderInterface();
    this.attachEventListeners();
    this.renderTables();
    this.updateResult();
  }
  
  /**
   * Render the main simulator interface
   */
  renderInterface() {
    this.container.innerHTML = `
      <div class="join-simulator">
        <!-- Header with Controls -->
        <div class="join-header">
          <h3 class="join-title">🔀 SQL Join Simulator</h3>
          <div class="join-controls">
            <div class="control-group">
              <label for="join-type">Join Type:</label>
              <select id="join-type" class="join-select">
                <option value="INNER">INNER JOIN</option>
                <option value="LEFT">LEFT OUTER JOIN</option>
                <option value="RIGHT">RIGHT OUTER JOIN</option>
                <option value="FULL">FULL OUTER JOIN</option>
                <option value="CROSS">CROSS JOIN</option>
              </select>
              <span class="tooltip-trigger" data-tooltip="join-type-help">❓</span>
            </div>
            
            <div class="control-buttons">
              <button id="btn-execute" class="btn-primary">
                <span class="btn-icon">▶️</span> Execute Join
              </button>
              <button id="btn-animate" class="btn-secondary">
                <span class="btn-icon">🎬</span> Step Animation
              </button>
              <button id="btn-compare" class="btn-secondary" style="display: ${this.options.showCompareMode ? 'inline-block' : 'none'}">
                <span class="btn-icon">⚖️</span> Compare
              </button>
              <button id="btn-reset" class="btn-tertiary">
                <span class="btn-icon">🔄</span> Reset
              </button>
            </div>
          </div>
        </div>
        
        <!-- Join Condition Display -->
        <div class="join-condition-bar">
          <div class="condition-display">
            <span class="condition-label">Join Condition:</span>
            <code class="condition-code">S.student_id = E.student_id</code>
          </div>
          <div class="join-description" id="join-description">
            ${this.joinTypes['INNER'].description}
          </div>
        </div>
        
        <!-- Main Visualization Area -->
        <div class="join-visualization" id="join-viz">
          <!-- Left Table -->
          <div class="table-container table-left">
            <div class="table-header">
              <h4 class="table-name">${this.tableA.name}</h4>
              <span class="table-alias">(${this.tableA.alias})</span>
              <span class="row-count">${this.tableA.data.length} rows</span>
            </div>
            <div class="table-wrapper" id="table-a"></div>
          </div>
          
          <!-- Join Visualization -->
          <div class="join-operator">
            <div class="join-symbol" id="join-symbol">⨝</div>
            <div class="join-type-label" id="join-type-label">INNER</div>
          </div>
          
          <!-- Right Table -->
          <div class="table-container table-right">
            <div class="table-header">
              <h4 class="table-name">${this.tableB.name}</h4>
              <span class="table-alias">(${this.tableB.alias})</span>
              <span class="row-count">${this.tableB.data.length} rows</span>
            </div>
            <div class="table-wrapper" id="table-b"></div>
          </div>
        </div>
        
        <!-- Connection Lines Canvas -->
        <div class="connections-container" id="connections-container">
          <canvas id="join-canvas"></canvas>
        </div>
        
        <!-- SQL Code Display -->
        <div class="sql-display">
          <div class="sql-header">
            <h5>Generated SQL</h5>
            <button id="btn-copy-sql" class="btn-copy" title="Copy SQL">📋 Copy</button>
          </div>
          <pre class="sql-code-block"><code id="sql-code"></code></pre>
        </div>
        
        <!-- Result Section -->
        <div class="result-section">
          <div class="result-header">
            <h4>Join Result</h4>
            <div class="result-stats">
              <span class="stat" id="result-count">0 rows</span>
              <span class="stat-divider">|</span>
              <span class="legend">
                <span class="legend-item"><span class="color-box match"></span> Matched</span>
                <span class="legend-item"><span class="color-box null"></span> NULL</span>
              </span>
            </div>
          </div>
          <div class="result-table-container" id="result-container">
            <div class="placeholder">Click "Execute Join" to see results</div>
          </div>
        </div>
        
        <!-- Compare Mode (Hidden by default) -->
        <div class="compare-section" id="compare-section" style="display: none;">
          <div class="compare-header">
            <h4>Compare Join Types</h4>
            <button id="btn-close-compare" class="btn-close">✕</button>
          </div>
          <div class="compare-grid" id="compare-grid">
            <!-- Generated dynamically -->
          </div>
        </div>
        
        <!-- Educational Panel -->
        <div class="education-panel">
          <div class="edu-tabs">
            <button class="edu-tab active" data-tab="explanation">How it Works</button>
            <button class="edu-tab" data-tab="venn">Venn Diagram</button>
            <button class="edu-tab" data-tab="tips">Tips & Tricks</button>
          </div>
          
          <div class="edu-content" id="edu-explanation">
            <div class="explanation-text" id="explanation-text">
              <!-- Dynamic content -->
            </div>
            <div class="step-indicator" id="step-indicator" style="display: none;">
              <span class="step-label">Step:</span>
              <span class="step-current" id="step-current">0</span>
              <span class="step-total">/ <span id="step-total">0</span></span>
            </div>
          </div>
          
          <div class="edu-content hidden" id="edu-venn">
            <div class="venn-diagram" id="venn-diagram">
              <!-- SVG Venn diagram rendered here -->
            </div>
            <div class="venn-legend" id="venn-legend">
              <!-- Legend for Venn diagram -->
            </div>
          </div>
          
          <div class="edu-content hidden" id="edu-tips">
            <div class="tips-list">
              <div class="tip-item">
                <span class="tip-icon">💡</span>
                <div class="tip-text">
                  <strong>Use INNER JOIN when:</strong> You only want data that exists in both tables.
                </div>
              </div>
              <div class="tip-item">
                <span class="tip-icon">💡</span>
                <div class="tip-text">
                  <strong>Use LEFT JOIN when:</strong> You need all records from the main table, with optional related data.
                </div>
              </div>
              <div class="tip-item">
                <span class="tip-icon">⚠️</span>
                <div class="tip-text">
                  <strong>Avoid CROSS JOIN on large tables:</strong> It creates m×n rows and can crash your query!
                </div>
              </div>
              <div class="tip-item">
                <span class="tip-icon">🎯</span>
                <div class="tip-text">
                  <strong>Remember:</strong> RIGHT JOIN is just LEFT JOIN with tables swapped. Pick whichever feels more natural.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tooltip Overlay -->
      <div class="tooltip-overlay" id="tooltip-overlay"></div>
    `;
    
    // Initialize the SQL code display
    this.updateSQLDisplay();
    this.renderVennDiagram();
  }
  
  /**
   * Attach event listeners to interactive elements
   */
  attachEventListeners() {
    // Join type selector
    const joinSelect = this.container.querySelector('#join-type');
    joinSelect?.addEventListener('change', (e) => {
      this.currentJoinType = e.target.value;
      this.updateJoinDescription();
      this.updateSQLDisplay();
      this.renderVennDiagram();
      this.clearResult();
    });
    
    // Action buttons
    this.container.querySelector('#btn-execute')?.addEventListener('click', () => this.executeJoin());
    this.container.querySelector('#btn-animate')?.addEventListener('click', () => this.animateJoin());
    this.container.querySelector('#btn-compare')?.addEventListener('click', () => this.toggleCompareMode());
    this.container.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());
    this.container.querySelector('#btn-copy-sql')?.addEventListener('click', () => this.copySQL());
    this.container.querySelector('#btn-close-compare')?.addEventListener('click', () => this.toggleCompareMode());
    
    // Educational tabs
    this.container.querySelectorAll('.edu-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchEduTab(tab.dataset.tab));
    });
    
    // Tooltip triggers
    this.container.querySelectorAll('.tooltip-trigger').forEach(trigger => {
      trigger.addEventListener('mouseenter', (e) => this.showTooltip(e));
      trigger.addEventListener('mouseleave', () => this.hideTooltip());
    });
    
    // Handle window resize for canvas
    window.addEventListener('resize', () => this.drawConnectionLines());
  }
  
  /**
   * Render the source tables with color-coded rows
   */
  renderTables() {
    this.renderTable('table-a', this.tableA, 'left');
    this.renderTable('table-b', this.tableB, 'right');
  }
  
  /**
   * Render a single table
   */
  renderTable(containerId, table, side) {
    const container = this.container.querySelector(`#${containerId}`);
    if (!container) return;
    
    // Mark rows that have matches
    const matchedIds = this.getMatchedIds();
    
    container.innerHTML = `
      <table class="data-table ${side}-table">
        <thead>
          <tr>
            ${table.columns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${table.data.map((row, index) => {
            const keyValue = row[side === 'left' ? 'student_id' : 'student_id'];
            const hasMatch = side === 'left' 
              ? matchedIds.left.has(keyValue)
              : matchedIds.right.has(keyValue);
            const matchClass = hasMatch ? 'has-match' : 'no-match';
            
            return `
              <tr class="table-row ${matchClass}" 
                  data-row-id="${keyValue}" 
                  data-side="${side}"
                  data-index="${index}">
                ${table.columns.map(col => `<td>${row[col] !== null ? row[col] : '<span class="null-value">NULL</span>'}</td>`).join('')}
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    
    // Add hover listeners for row highlighting
    container.querySelectorAll('.table-row').forEach(row => {
      row.addEventListener('mouseenter', () => this.highlightRow(row.dataset.rowId, row.dataset.side));
      row.addEventListener('mouseleave', () => this.unhighlightRows());
    });
  }
  
  /**
   * Get sets of matched IDs from both tables
   */
  getMatchedIds() {
    const leftIds = new Set(this.tableA.data.map(r => r.student_id));
    const rightIds = new Set(this.tableB.data.map(r => r.student_id));
    
    return {
      left: new Set([...leftIds].filter(id => rightIds.has(id))),
      right: new Set([...rightIds].filter(id => leftIds.has(id)))
    };
  }
  
  /**
   * Execute the join and display results
   */
  executeJoin() {
    this.isAnimating = false;
    const result = this.performJoin(this.currentJoinType);
    this.displayResult(result);
    this.drawConnectionLines();
    this.updateExplanation();
  }
  
  /**
   * Perform the actual join operation
   */
  performJoin(joinType) {
    const result = [];
    
    switch (joinType) {
      case 'INNER':
        for (const leftRow of this.tableA.data) {
          for (const rightRow of this.tableB.data) {
            if (leftRow.student_id === rightRow.student_id) {
              result.push({ ...leftRow, ...rightRow, _matchType: 'match', _source: 'both' });
            }
          }
        }
        break;
        
      case 'LEFT':
        for (const leftRow of this.tableA.data) {
          let hasMatch = false;
          for (const rightRow of this.tableB.data) {
            if (leftRow.student_id === rightRow.student_id) {
              result.push({ ...leftRow, ...rightRow, _matchType: 'match', _source: 'both' });
              hasMatch = true;
            }
          }
          if (!hasMatch) {
            const nullRow = {};
            this.tableB.columns.forEach(col => nullRow[col] = null);
            result.push({ ...leftRow, ...nullRow, _matchType: 'left-only', _source: 'left' });
          }
        }
        break;
        
      case 'RIGHT':
        for (const rightRow of this.tableB.data) {
          let hasMatch = false;
          for (const leftRow of this.tableA.data) {
            if (leftRow.student_id === rightRow.student_id) {
              result.push({ ...leftRow, ...rightRow, _matchType: 'match', _source: 'both' });
              hasMatch = true;
            }
          }
          if (!hasMatch) {
            const nullRow = {};
            this.tableA.columns.forEach(col => nullRow[col] = null);
            result.push({ ...nullRow, ...rightRow, _matchType: 'right-only', _source: 'right' });
          }
        }
        break;
        
      case 'FULL':
        // First do a LEFT join
        const leftResults = this.performJoin('LEFT');
        result.push(...leftResults);
        
        // Then add RIGHT-only rows that weren't in LEFT
        for (const rightRow of this.tableB.data) {
          const hasMatch = this.tableA.data.some(leftRow => leftRow.student_id === rightRow.student_id);
          if (!hasMatch) {
            const nullRow = {};
            this.tableA.columns.forEach(col => nullRow[col] = null);
            result.push({ ...nullRow, ...rightRow, _matchType: 'right-only', _source: 'right' });
          }
        }
        break;
        
      case 'CROSS':
        for (const leftRow of this.tableA.data) {
          for (const rightRow of this.tableB.data) {
            result.push({ ...leftRow, ...rightRow, _matchType: 'cross', _source: 'cross' });
          }
        }
        break;
    }
    
    return result;
  }
  
  /**
   * Display the join result in a table
   */
  displayResult(result) {
    const container = this.container.querySelector('#result-container');
    const countDisplay = this.container.querySelector('#result-count');
    
    countDisplay.textContent = `${result.length} row${result.length !== 1 ? 's' : ''}`;
    
    if (result.length === 0) {
      container.innerHTML = '<div class="empty-result">No rows returned for this join type</div>';
      return;
    }
    
    // Get all columns for result (avoid duplicates)
    const allColumns = [...this.tableA.columns, ...this.tableB.columns.filter(c => !this.tableA.columns.includes(c))];
    
    container.innerHTML = `
      <table class="result-table">
        <thead>
          <tr>
            ${allColumns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${result.map((row, index) => {
            let rowClass = '';
            if (row._matchType === 'match') rowClass = 'matched-row';
            else if (row._matchType === 'left-only') rowClass = 'left-only-row';
            else if (row._matchType === 'right-only') rowClass = 'right-only-row';
            else if (row._matchType === 'cross') rowClass = 'cross-row';
            
            return `
              <tr class="${rowClass}" style="animation-delay: ${index * 50}ms">
                ${allColumns.map(col => {
                  const value = row[col];
                  const isNull = value === null || value === undefined;
                  return `<td class="${isNull ? 'null-cell' : ''}">${isNull ? '<span class="null-value">NULL</span>' : value}</td>`;
                }).join('')}
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    
    // Add animation class
    container.classList.add('animate-in');
    setTimeout(() => container.classList.remove('animate-in'), 500);
  }
  
  /**
   * Animate the join step by step
   */
  async animateJoin() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.animationStep = 0;
    
    const result = this.performJoin(this.currentJoinType);
    const container = this.container.querySelector('#result-container');
    const stepIndicator = this.container.querySelector('#step-indicator');
    const stepCurrent = this.container.querySelector('#step-current');
    const stepTotal = this.container.querySelector('#step-total');
    
    // Show step indicator
    stepIndicator.style.display = 'flex';
    stepTotal.textContent = result.length;
    
    // Clear and prepare container
    container.innerHTML = '<div class="animation-container"></div>';
    const animContainer = container.querySelector('.animation-container');
    
    // Animate each row being added
    for (let i = 0; i < result.length; i++) {
      this.animationStep = i + 1;
      stepCurrent.textContent = i + 1;
      
      const row = result[i];
      const explanation = this.getStepExplanation(row, i + 1, result.length);
      
      // Highlight source rows
      this.highlightSourceRows(row);
      
      // Add row to result with animation
      const rowDiv = document.createElement('div');
      rowDiv.className = `anim-row ${row._matchType}`;
      rowDiv.innerHTML = `
        <div class="anim-row-content">
          <span class="step-num">${i + 1}</span>
          <span class="row-data">${this.formatRowData(row)}</span>
        </div>
        <div class="step-explanation">${explanation}</div>
      `;
      
      animContainer.appendChild(rowDiv);
      
      // Scroll to show new row
      rowDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
      
      // Wait for animation
      await this.delay(this.options.animationSpeed);
      
      // Clear highlight
      this.unhighlightRows();
    }
    
    // Final display
    this.displayResult(result);
    this.isAnimating = false;
    stepIndicator.style.display = 'none';
  }
  
  /**
   * Get explanation text for a step in the animation
   */
  getStepExplanation(row, stepNum, totalSteps) {
    if (this.currentJoinType === 'INNER') {
      return `Match found: Student ID ${row.student_id} exists in both tables`;
    } else if (this.currentJoinType === 'LEFT') {
      if (row._matchType === 'match') {
        return `Match found: Student ID ${row.student_id} has enrollments`;
      } else {
        return `No match: Student ID ${row.student_id} has no enrollments (NULLs added)`;
      }
    } else if (this.currentJoinType === 'RIGHT') {
      if (row._matchType === 'match') {
        return `Match found: Enrollment ${row.enroll_id} matches a student`;
      } else {
        return `No match: Enrollment ${row.enroll_id} has no matching student (NULLs added)`;
      }
    } else if (this.currentJoinType === 'FULL') {
      if (row._matchType === 'match') {
        return `Match found: Combining matching rows`;
      } else if (row._source === 'left') {
        return `Left-only row: Student with no enrollments`;
      } else {
        return `Right-only row: Enrollment with no matching student`;
      }
    } else if (this.currentJoinType === 'CROSS') {
      return `Cross join: Combining all possible pairs (${stepNum} of ${this.tableA.data.length * this.tableB.data.length})`;
    }
    return '';
  }
  
  /**
   * Format row data for animation display
   */
  formatRowData(row) {
    const parts = [];
    if (row.name) parts.push(row.name);
    if (row.course) parts.push(row.course);
    return parts.join(' - ') || `ID: ${row.student_id || row.enroll_id}`;
  }
  
  /**
   * Highlight source rows for a result row
   */
  highlightSourceRows(row) {
    // This would highlight the source rows in the input tables
    // Implementation depends on the specific join type
    const leftRows = this.container.querySelectorAll(`[data-side="left"]`);
    const rightRows = this.container.querySelectorAll(`[data-side="right"]`);
    
    leftRows.forEach(r => {
      if (r.dataset.rowId == row.student_id) {
        r.classList.add('highlighted-source');
      }
    });
    
    rightRows.forEach(r => {
      if (r.dataset.rowId == row.student_id) {
        r.classList.add('highlighted-source');
      }
    });
  }
  
  /**
   * Highlight a row by ID
   */
  highlightRow(rowId, side) {
    const matchingRows = this.container.querySelectorAll(`[data-row-id="${rowId}"]`);
    matchingRows.forEach(row => row.classList.add('hover-highlight'));
    
    if (this.currentJoinType !== 'CROSS') {
      this.drawConnectionLines(rowId);
    }
  }
  
  /**
   * Remove all row highlights
   */
  unhighlightRows() {
    this.container.querySelectorAll('.hover-highlight').forEach(row => {
      row.classList.remove('hover-highlight');
    });
    this.container.querySelectorAll('.highlighted-source').forEach(row => {
      row.classList.remove('highlighted-source');
    });
    this.clearCanvas();
  }
  
  /**
   * Draw connection lines between matching rows on canvas
   */
  drawConnectionLines(highlightId = null) {
    const canvas = this.container.querySelector('#join-canvas');
    const container = this.container.querySelector('#connections-container');
    
    if (!canvas || !container) return;
    
    // Set canvas size to match container
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (this.currentJoinType === 'CROSS') return; // No lines for cross join
    
    const leftRows = this.container.querySelectorAll('[data-side="left"]');
    const rightRows = this.container.querySelectorAll('[data-side="right"]');
    
    const containerRect = container.getBoundingClientRect();
    
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    leftRows.forEach(leftRow => {
      const leftId = leftRow.dataset.rowId;
      if (highlightId && leftId !== highlightId) return;
      
      const leftRect = leftRow.getBoundingClientRect();
      const leftX = leftRect.right - containerRect.left;
      const leftY = leftRect.top + leftRect.height / 2 - containerRect.top;
      
      rightRows.forEach(rightRow => {
        if (rightRow.dataset.rowId === leftId) {
          const rightRect = rightRow.getBoundingClientRect();
          const rightX = rightRect.left - containerRect.left;
          const rightY = rightRect.top + rightRect.height / 2 - containerRect.top;
          
          // Draw curved line
          ctx.beginPath();
          ctx.moveTo(leftX, leftY);
          ctx.bezierCurveTo(
            leftX + 50, leftY,
            rightX - 50, rightY,
            rightX, rightY
          );
          ctx.stroke();
        }
      });
    });
    
    ctx.setLineDash([]);
  }
  
  /**
   * Clear the canvas
   */
  clearCanvas() {
    const canvas = this.container.querySelector('#join-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  
  /**
   * Toggle compare mode
   */
  toggleCompareMode() {
    this.compareMode = !this.compareMode;
    const compareSection = this.container.querySelector('#compare-section');
    const vizSection = this.container.querySelector('#join-viz');
    
    if (this.compareMode) {
      compareSection.style.display = 'block';
      vizSection.style.opacity = '0.3';
      this.renderCompareGrid();
    } else {
      compareSection.style.display = 'none';
      vizSection.style.opacity = '1';
    }
  }
  
  /**
   * Render the compare mode grid
   */
  renderCompareGrid() {
    const grid = this.container.querySelector('#compare-grid');
    const joinTypes = ['INNER', 'LEFT', 'RIGHT', 'FULL'];
    
    grid.innerHTML = joinTypes.map(type => {
      const result = this.performJoin(type);
      return `
        <div class="compare-card">
          <div class="compare-header-${type.toLowerCase()}">
            <h5>${this.joinTypes[type].name}</h5>
            <span class="compare-count">${result.length} rows</span>
          </div>
          <div class="compare-desc">${this.joinTypes[type].shortDesc}</div>
          <div class="compare-preview">
            ${result.slice(0, 3).map(r => `
              <div class="preview-row ${r._matchType}">
                ${r.name || 'NULL'} - ${r.course || 'NULL'}
              </div>
            `).join('')}
            ${result.length > 3 ? `<div class="preview-more">+${result.length - 3} more...</div>` : ''}
          </div>
          <button class="btn-select-join" data-type="${type}">Select This Join</button>
        </div>
      `;
    }).join('');
    
    // Add click handlers for select buttons
    grid.querySelectorAll('.btn-select-join').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentJoinType = btn.dataset.type;
        this.container.querySelector('#join-type').value = this.currentJoinType;
        this.updateJoinDescription();
        this.updateSQLDisplay();
        this.renderVennDiagram();
        this.toggleCompareMode();
        this.executeJoin();
      });
    });
  }
  
  /**
   * Switch educational tab
   */
  switchEduTab(tabName) {
    this.container.querySelectorAll('.edu-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    this.container.querySelectorAll('.edu-content').forEach(content => {
      content.classList.toggle('hidden', content.id !== `edu-${tabName}`);
    });
  }
  
  /**
   * Render Venn diagram based on current join type
   */
  renderVennDiagram() {
    const container = this.container.querySelector('#venn-diagram');
    const legend = this.container.querySelector('#venn-legend');
    
    // Create SVG Venn diagram
    const svg = `
      <svg viewBox="0 0 300 200" class="venn-svg">
        <!-- Left circle (Table A) -->
        <circle cx="110" cy="100" r="70" 
                class="venn-circle left ${this.getVennHighlightClass('left')}"
                fill="rgba(102, 126, 234, 0.2)" 
                stroke="#667eea" 
                stroke-width="2"/>
        
        <!-- Right circle (Table B) -->
        <circle cx="190" cy="100" r="70" 
                class="venn-circle right ${this.getVennHighlightClass('right')}"
                fill="rgba(76, 175, 80, 0.2)" 
                stroke="#4caf50" 
                stroke-width="2"/>
        
        <!-- Labels -->
        <text x="70" y="100" text-anchor="middle" class="venn-label">${this.tableA.name}</text>
        <text x="230" y="100" text-anchor="middle" class="venn-label">${this.tableB.name}</text>
        <text x="150" y="100" text-anchor="middle" class="venn-label intersection">Match</text>
        
        <!-- Selection indicator -->
        ${this.getVennSelection()}
      </svg>
    `;
    
    container.innerHTML = svg;
    
    // Update legend
    legend.innerHTML = `
      <div class="venn-legend-item">
        <span class="legend-color" style="background: rgba(102, 126, 234, 0.4)"></span>
        <span>${this.tableA.name} only (LEFT)</span>
      </div>
      <div class="venn-legend-item">
        <span class="legend-color" style="background: rgba(76, 175, 80, 0.4)"></span>
        <span>${this.tableB.name} only (RIGHT)</span>
      </div>
      <div class="venn-legend-item">
        <span class="legend-color" style="background: linear-gradient(90deg, rgba(102, 126, 234, 0.4), rgba(76, 175, 80, 0.4))"></span>
        <span>Matching rows (INNER)</span>
      </div>
    `;
  }
  
  /**
   * Get Venn diagram highlight class based on join type
   */
  getVennHighlightClass(side) {
    switch (this.currentJoinType) {
      case 'INNER': return 'dim';
      case 'LEFT': return side === 'right' ? 'dim' : '';
      case 'RIGHT': return side === 'left' ? 'dim' : '';
      case 'FULL': return '';
      default: return '';
    }
  }
  
  /**
   * Get Venn diagram selection overlay
   */
  getVennSelection() {
    // This would add an overlay showing which area is selected
    return '';
  }
  
  /**
   * Update the join description text
   */
  updateJoinDescription() {
    const descEl = this.container.querySelector('#join-description');
    const typeLabel = this.container.querySelector('#join-type-label');
    
    if (descEl) {
      descEl.textContent = this.joinTypes[this.currentJoinType].description;
    }
    if (typeLabel) {
      typeLabel.textContent = this.currentJoinType === 'INNER' ? 'INNER' : 
                               this.currentJoinType === 'FULL' ? 'FULL' :
                               this.currentJoinType + ' OUTER';
    }
  }
  
  /**
   * Update the SQL code display
   */
  updateSQLDisplay() {
    const sqlEl = this.container.querySelector('#sql-code');
    const template = this.joinTypes[this.currentJoinType].sqlTemplate;
    
    let sql = template
      .replace('{left}', `${this.tableA.name} ${this.tableA.alias}`)
      .replace('{right}', `${this.tableB.name} ${this.tableB.alias}`)
      .replace('{condition}', `${this.tableA.alias}.student_id = ${this.tableB.alias}.student_id`);
    
    if (sqlEl) {
      sqlEl.textContent = sql;
    }
  }
  
  /**
   * Update the explanation text
   */
  updateExplanation() {
    const expEl = this.container.querySelector('#explanation-text');
    const matchedIds = this.getMatchedIds();
    const matchingCount = matchedIds.left.size;
    const leftOnly = this.tableA.data.length - matchingCount;
    const rightOnly = this.tableB.data.filter(r => !matchedIds.right.has(r.student_id)).length;
    
    let explanation = '';
    
    switch (this.currentJoinType) {
      case 'INNER':
        explanation = `This INNER JOIN found ${matchingCount} students who have enrollments. 
          ${leftOnly} students without enrollments were excluded.`;
        break;
      case 'LEFT':
        explanation = `This LEFT JOIN returned all ${this.tableA.data.length} students. 
          ${matchingCount} have matching enrollments, ${leftOnly} have NULL values for enrollment data.`;
        break;
      case 'RIGHT':
        explanation = `This RIGHT JOIN returned all ${this.tableB.data.length} enrollments. 
          ${matchingCount} match students in the database, ${rightOnly} have NULL student info.`;
        break;
      case 'FULL':
        explanation = `This FULL JOIN combined all data: ${matchingCount} matching pairs, 
          ${leftOnly} students without enrollments, and ${rightOnly} orphan enrollments.`;
        break;
      case 'CROSS':
        explanation = `This CROSS JOIN created ${this.tableA.data.length * this.tableB.data.length} 
          rows - every possible combination of students and enrollments.`;
        break;
    }
    
    if (expEl) {
      expEl.textContent = explanation;
    }
  }
  
  /**
   * Show tooltip
   */
  showTooltip(event) {
    const tooltipId = event.target.dataset.tooltip;
    const overlay = this.container.querySelector('#tooltip-overlay');
    
    let content = '';
    if (tooltipId === 'join-type-help') {
      content = 'Select different join types to see how they affect the result set.';
    }
    
    overlay.textContent = content;
    overlay.style.display = 'block';
    overlay.style.left = event.pageX + 10 + 'px';
    overlay.style.top = event.pageY + 10 + 'px';
  }
  
  /**
   * Hide tooltip
   */
  hideTooltip() {
    const overlay = this.container.querySelector('#tooltip-overlay');
    if (overlay) overlay.style.display = 'none';
  }
  
  /**
   * Copy SQL to clipboard
   */
  copySQL() {
    const sqlEl = this.container.querySelector('#sql-code');
    if (sqlEl) {
      navigator.clipboard.writeText(sqlEl.textContent).then(() => {
        const btn = this.container.querySelector('#btn-copy-sql');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => btn.textContent = originalText, 2000);
      });
    }
  }
  
  /**
   * Clear the result display
   */
  clearResult() {
    const container = this.container.querySelector('#result-container');
    if (container) {
      container.innerHTML = '<div class="placeholder">Click "Execute Join" to see results</div>';
    }
    const countDisplay = this.container.querySelector('#result-count');
    if (countDisplay) countDisplay.textContent = '0 rows';
    this.clearCanvas();
  }
  
  /**
   * Reset the simulator
   */
  reset() {
    this.currentJoinType = 'INNER';
    this.container.querySelector('#join-type').value = 'INNER';
    this.isAnimating = false;
    this.animationStep = 0;
    this.updateJoinDescription();
    this.updateSQLDisplay();
    this.renderVennDiagram();
    this.clearResult();
    this.renderTables();
    
    if (this.compareMode) {
      this.toggleCompareMode();
    }
  }
  
  /**
   * Utility: delay function for animations
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CSS styles for the simulator (can be included in a separate CSS file or added dynamically)
const joinSimulatorStyles = `
/* SQL Join Simulator Styles */
.join-simulator {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.join-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.join-title {
  font-size: 1.5rem;
  margin: 0;
  color: var(--text-primary, #1e293b);
}

.join-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 500;
  color: var(--text-secondary, #64748b);
}

.join-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 6px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
}

.control-buttons {
  display: flex;
  gap: 0.5rem;
}

.control-buttons button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd6;
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 1px solid #667eea !important;
}

.btn-secondary:hover {
  background: #f8f9ff;
}

.btn-tertiary {
  background: #f1f5f9;
  color: #64748b;
}

.btn-tertiary:hover {
  background: #e2e8f0;
}

/* Join Condition Bar */
.join-condition-bar {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid #667eea;
}

.condition-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.condition-label {
  font-weight: 500;
  color: #64748b;
}

.condition-code {
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  color: #667eea;
}

.join-description {
  color: #475569;
  font-size: 0.95rem;
}

/* Visualization Area */
.join-visualization {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  position: relative;
}

.table-container {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.table-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
}

.table-name {
  font-size: 1.1rem;
  margin: 0;
  color: #1e293b;
}

.table-alias {
  color: #94a3b8;
  font-size: 0.9rem;
}

.row-count {
  margin-left: auto;
  font-size: 0.85rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

/* Join Operator */
.join-operator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.join-symbol {
  font-size: 2.5rem;
  color: #667eea;
  font-weight: bold;
}

.join-type-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Data Tables */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.data-table th {
  background: #f8fafc;
  padding: 0.5rem;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
}

.data-table td {
  padding: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.table-row {
  transition: all 0.2s;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row.has-match {
  background: rgba(76, 175, 80, 0.1);
  border-left: 3px solid #4caf50;
}

.table-row.no-match {
  background: rgba(148, 163, 184, 0.1);
  border-left: 3px solid #94a3b8;
}

.table-row.hover-highlight {
  background: #dbeafe !important;
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.table-row.highlighted-source {
  background: #fef3c7 !important;
  animation: pulse 1s ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.null-value {
  color: #94a3b8;
  font-style: italic;
}

/* Connections Canvas */
.connections-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

#join-canvas {
  width: 100%;
  height: 100%;
}

/* SQL Display */
.sql-display {
  background: #1e293b;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.sql-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #0f172a;
  border-bottom: 1px solid #334155;
}

.sql-header h5 {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.btn-copy {
  background: transparent;
  border: 1px solid #475569;
  color: #94a3b8;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-copy:hover {
  background: #334155;
  color: white;
}

.sql-code-block {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
}

.sql-code-block code {
  color: #a5b4fc;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* Result Section */
.result-section {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.result-header h4 {
  margin: 0;
  color: #1e293b;
}

.result-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
}

.stat {
  font-weight: 600;
  color: #667eea;
}

.stat-divider {
  color: #cbd5e1;
}

.legend {
  display: flex;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #64748b;
}

.color-box {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.color-box.match {
  background: rgba(76, 175, 80, 0.3);
  border: 1px solid #4caf50;
}

.color-box.null {
  background: rgba(148, 163, 184, 0.3);
  border: 1px solid #94a3b8;
}

.result-table-container {
  min-height: 100px;
  max-height: 300px;
  overflow: auto;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #94a3b8;
  font-style: italic;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.result-table th {
  background: #f8fafc;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  top: 0;
}

.result-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.result-table tr {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-table tr.matched-row {
  background: rgba(76, 175, 80, 0.1);
}

.result-table tr.left-only-row {
  background: rgba(102, 126, 234, 0.1);
}

.result-table tr.right-only-row {
  background: rgba(245, 158, 11, 0.1);
}

.result-table tr.cross-row {
  background: rgba(139, 92, 246, 0.05);
}

.null-cell {
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 5px,
    rgba(148, 163, 184, 0.1) 5px,
    rgba(148, 163, 184, 0.1) 10px
  );
}

/* Animation Container */
.animation-container {
  max-height: 300px;
  overflow-y: auto;
}

.anim-row {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.anim-row.match {
  border-left: 3px solid #4caf50;
}

.anim-row.left-only {
  border-left: 3px solid #667eea;
}

.anim-row.right-only {
  border-left: 3px solid #f59e0b;
}

.anim-row-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.step-num {
  background: #667eea;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.row-data {
  flex: 1;
  font-weight: 500;
}

.step-explanation {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.5rem;
  padding-left: 2rem;
}

.step-indicator {
  display: none;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 0.9rem;
}

.step-label {
  color: #64748b;
}

.step-current {
  font-weight: 600;
  color: #667eea;
}

/* Compare Section */
.compare-section {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  padding: 1.5rem;
  max-width: 900px;
  width: 90%;
  max-height: 80vh;
  overflow: auto;
  z-index: 1000;
}

.compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.compare-header h4 {
  margin: 0;
  color: #1e293b;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #64748b;
  cursor: pointer;
}

.compare-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.compare-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.compare-card:hover {
  border-color: #667eea;
}

.compare-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.compare-header-inner h5 {
  margin: 0;
  font-size: 0.95rem;
  color: #1e293b;
}

.compare-count {
  font-size: 0.85rem;
  font-weight: 600;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.compare-desc {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 0.75rem;
}

.compare-preview {
  background: white;
  border-radius: 6px;
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
}

.preview-row {
  padding: 0.25rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.preview-row:last-child {
  border-bottom: none;
}

.preview-more {
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  padding-top: 0.25rem;
}

.btn-select-join {
  width: 100%;
  padding: 0.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-select-join:hover {
  background: #5a6fd6;
}

/* Educational Panel */
.education-panel {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.edu-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.edu-tab {
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #64748b;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.edu-tab:hover {
  color: #667eea;
}

.edu-tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 500;
}

.edu-content {
  min-height: 150px;
}

.edu-content.hidden {
  display: none;
}

.explanation-text {
  color: #475569;
  line-height: 1.6;
}

/* Venn Diagram */
.venn-diagram {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.venn-svg {
  max-width: 300px;
}

.venn-circle {
  transition: all 0.3s;
}

.venn-circle.dim {
  opacity: 0.3;
}

.venn-label {
  font-size: 12px;
  font-weight: 500;
  fill: #475569;
}

.venn-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.venn-legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #64748b;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

/* Tips */
.tips-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tip-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
}

.tip-icon {
  font-size: 1.25rem;
}

.tip-text {
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Tooltip */
.tooltip-trigger {
  cursor: help;
  color: #94a3b8;
}

.tooltip-overlay {
  position: fixed;
  display: none;
  background: #1e293b;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  z-index: 1001;
  max-width: 250px;
  pointer-events: none;
}

/* Empty Result */
.empty-result {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #94a3b8;
  font-style: italic;
  background: #f8fafc;
  border-radius: 6px;
}

/* Responsive */
@media (max-width: 768px) {
  .join-visualization {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .join-operator {
    flex-direction: row;
    gap: 0.5rem;
  }
  
  .control-buttons {
    flex-wrap: wrap;
  }
  
  .compare-grid {
    grid-template-columns: 1fr;
  }
}
`;

// Add styles to document if not already present
if (!document.getElementById('join-simulator-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'join-simulator-styles';
  styleEl.textContent = joinSimulatorStyles;
  document.head.appendChild(styleEl);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-simulator="join"]');
  containers.forEach(container => {
    new SQLJoinSimulator(container.id);
  });
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SQLJoinSimulator;
}
