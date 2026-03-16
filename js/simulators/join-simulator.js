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
    if (!container) return;
    
    // Update row count
    const countEl = this.container.querySelector('#result-count');
    if (countEl) {
      countEl.textContent = `${result.length} row${result.length !== 1 ? 's' : ''}`;
    }
    
    if (result.length === 0) {
      container.innerHTML = '<div class="empty-result">No rows returned for this join type</div>';
      return;
    }
    
    // Get all columns (excluding metadata)
    const columns = Object.keys(result[0]).filter(key => !key.startsWith('_'));
    
    container.innerHTML = `
      <table class="result-table">
        <thead>
          <tr>
            ${columns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${result.map(row => {
            const rowClass = row._matchType === 'match' ? 'matched-row' : 
                            row._matchType === 'left-only' ? 'left-only-row' :
                            row._matchType === 'right-only' ? 'right-only-row' : 'cross-row';
            
            return `
              <tr class="${rowClass}">
                ${columns.map(col => {
                  const value = row[col];
                  const isNull = value === null;
                  return `<td class="${isNull ? 'null-cell' : ''}">${isNull ? 'NULL' : value}</td>`;
                }).join('')}
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }
  
  /**
   * Animate the join step by step
   */
  async animateJoin() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    const result = this.performJoin(this.currentJoinType);
    const container = this.container.querySelector('#result-container');
    const stepIndicator = this.container.querySelector('#step-indicator');
    const stepCurrent = this.container.querySelector('#step-current');
    const stepTotal = this.container.querySelector('#step-total');
    
    if (!container || result.length === 0) {
      this.isAnimating = false;
      return;
    }
    
    // Show step indicator
    if (stepIndicator) stepIndicator.style.display = 'flex';
    if (stepTotal) stepTotal.textContent = result.length;
    
    // Clear previous result
    container.innerHTML = '<div class="animation-container" id="animation-container"></div>';
    const animContainer = container.querySelector('#animation-container');
    
    // Animate each row
    for (let i = 0; i < result.length && this.isAnimating; i++) {
      const row = result[i];
      if (stepCurrent) stepCurrent.textContent = i + 1;
      
      const animRow = document.createElement('div');
      animRow.className = `anim-row ${row._matchType}`;
      
      const explanation = this.getStepExplanation(row);
      
      animRow.innerHTML = `
        <div class="anim-row-content">
          <span class="step-num">${i + 1}</span>
          <span class="row-data">${this.formatRowData(row)}</span>
        </div>
        <div class="step-explanation">${explanation}</div>
      `;
      
      animContainer.appendChild(animRow);
      
      // Scroll to show new row
      animRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Wait for animation
      await this.sleep(this.options.animationSpeed);
    }
    
    this.isAnimating = false;
    
    // Show final result table
    setTimeout(() => {
      this.displayResult(result);
      if (stepIndicator) stepIndicator.style.display = 'none';
    }, 1000);
  }
  
  /**
   * Get explanation text for an animation step
   */
  getStepExplanation(row) {
    switch (row._matchType) {
      case 'match':
        return `✓ Match found: ${row.name || 'Row'} matches with ${row.course || 'enrollment'}`;
      case 'left-only':
        return `← Left-only: ${row.name || 'Row'} has no matching enrollment (NULL values)`;
      case 'right-only':
        return `→ Right-only: Enrollment ${row.enroll_id || ''} has no matching student (NULL values)`;
      case 'cross':
        return `✕ Cross: Combining ${row.name || 'student'} with ${row.course || 'course'}`;
      default:
        return '';
    }
  }
  
  /**
   * Format row data for display
   */
  formatRowData(row) {
    const cols = Object.keys(row).filter(key => !key.startsWith('_'));
    return cols.slice(0, 3).map(col => `${col}=${row[col] ?? 'NULL'}`).join(', ');
  }
  
  /**
   * Draw connection lines between matching rows
   */
  drawConnectionLines() {
    // Implementation would draw SVG lines between matching rows
    // This is a placeholder for the visualization feature
  }
  
  /**
   * Highlight a row and its matches
   */
  highlightRow(rowId, side) {
    // Highlight source row
    const sourceRow = this.container.querySelector(`[data-row-id="${rowId}"][data-side="${side}"]`);
    if (sourceRow) {
      sourceRow.classList.add('hover-highlight');
    }
    
    // Find and highlight matching rows on other side
    const otherSide = side === 'left' ? 'right' : 'left';
    const otherTable = side === 'left' ? this.tableB : this.tableA;
    
    const hasMatch = otherTable.data.some(row => row.student_id == rowId);
    
    if (hasMatch) {
      const matchRow = this.container.querySelector(`[data-row-id="${rowId}"][data-side="${otherSide}"]`);
      if (matchRow) {
        matchRow.classList.add('hover-highlight');
      }
    }
  }
  
  /**
   * Remove all row highlighting
   */
  unhighlightRows() {
    this.container.querySelectorAll('.table-row').forEach(row => {
      row.classList.remove('hover-highlight');
    });
  }
  
  /**
   * Update the SQL code display
   */
  updateSQLDisplay() {
    const sqlCode = this.container.querySelector('#sql-code');
    if (!sqlCode) return;
    
    const joinInfo = this.joinTypes[this.currentJoinType];
    const sql = joinInfo.sqlTemplate
      .replace('{left}', this.tableA.name)
      .replace('{right}', this.tableB.name)
      .replace('{condition}', 'S.student_id = E.student_id');
    
    sqlCode.textContent = sql;
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
      typeLabel.textContent = this.currentJoinType;
    }
  }
  
  /**
   * Update the explanation text
   */
  updateExplanation() {
    const explanationEl = this.container.querySelector('#explanation-text');
    if (!explanationEl) return;
    
    const joinInfo = this.joinTypes[this.currentJoinType];
    explanationEl.innerHTML = `
      <p><strong>${joinInfo.name}:</strong> ${joinInfo.description}</p>
      <p style="margin-top: 0.5rem;">${joinInfo.shortDesc}</p>
    `;
  }
  
  /**
   * Render the Venn diagram SVG
   */
  renderVennDiagram() {
    const container = this.container.querySelector('#venn-diagram');
    if (!container) return;
    
    const isInner = this.currentJoinType === 'INNER';
    const isLeft = this.currentJoinType === 'LEFT';
    const isRight = this.currentJoinType === 'RIGHT';
    const isFull = this.currentJoinType === 'FULL';
    
    // Determine which sections to highlight
    const leftOnly = isLeft || isFull;
    const rightOnly = isRight || isFull;
    const intersection = isInner || isLeft || isRight || isFull;
    
    container.innerHTML = `
      <svg class="venn-svg" viewBox="0 0 300 200">
        <!-- Left circle -->
        <circle cx="110" cy="100" r="70" 
                fill="${leftOnly ? 'rgba(102, 126, 234, 0.3)' : 'rgba(148, 163, 184, 0.1)'}" 
                stroke="#667eea" stroke-width="2"
                class="venn-circle left-circle ${leftOnly ? '' : 'dim'}"/>
        
        <!-- Right circle -->
        <circle cx="190" cy="100" r="70" 
                fill="${rightOnly ? 'rgba(76, 175, 80, 0.3)' : 'rgba(148, 163, 184, 0.1)'}" 
                stroke="#4caf50" stroke-width="2"
                class="venn-circle right-circle ${rightOnly ? '' : 'dim'}"/>
        
        <!-- Intersection area (visual only) -->
        <path d="M 150 45 A 70 70 0 0 1 150 155 A 70 70 0 0 1 150 45" 
              fill="${intersection ? 'rgba(139, 92, 246, 0.4)' : 'transparent'}"
              class="venn-intersection"/>
        
        <!-- Labels -->
        <text x="70" y="100" text-anchor="middle" class="venn-label">${this.tableA.name}</text>
        <text x="230" y="100" text-anchor="middle" class="venn-label">${this.tableB.name}</text>
        <text x="150" y="105" text-anchor="middle" class="venn-label" style="font-size: 10px;">Match</text>
      </svg>
    `;
    
    // Update legend
    const legendEl = this.container.querySelector('#venn-legend');
    if (legendEl) {
      legendEl.innerHTML = `
        <div class="venn-legend-item">
          <span class="legend-color" style="background: rgba(102, 126, 234, 0.4)"></span>
          <span>${this.tableA.name} only</span>
        </div>
        <div class="venn-legend-item">
          <span class="legend-color" style="background: rgba(76, 175, 80, 0.4)"></span>
          <span>${this.tableB.name} only</span>
        </div>
        <div class="venn-legend-item">
          <span class="legend-color" style="background: linear-gradient(90deg, rgba(102, 126, 234, 0.4), rgba(76, 175, 80, 0.4))"></span>
          <span>Matching rows</span>
        </div>
      `;
    }
  }
  
  /**
   * Toggle compare mode
   */
  toggleCompareMode() {
    this.compareMode = !this.compareMode;
    const compareSection = this.container.querySelector('#compare-section');
    
    if (compareSection) {
      compareSection.style.display = this.compareMode ? 'block' : 'none';
    }
    
    if (this.compareMode) {
      this.renderCompareView();
    }
  }
  
  /**
   * Render the compare view with all join types
   */
  renderCompareView() {
    const grid = this.container.querySelector('#compare-grid');
    if (!grid) return;
    
    const joinTypes = ['INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS'];
    
    grid.innerHTML = joinTypes.map(type => {
      const result = this.performJoin(type);
      const info = this.joinTypes[type];
      
      // Preview first 3 rows
      const previewRows = result.slice(0, 3).map(row => this.formatRowData(row)).join('<br>');
      const moreCount = result.length > 3 ? `<div class="preview-more">+${result.length - 3} more rows</div>` : '';
      
      return `
        <div class="compare-card ${type === this.currentJoinType ? 'active' : ''}">
          <div class="compare-header-inner">
            <h5>${info.name}</h5>
            <span class="compare-count">${result.length} rows</span>
          </div>
          <div class="compare-desc">${info.shortDesc}</div>
          <div class="compare-preview">
            ${previewRows || '<em>No rows</em>'}
            ${moreCount}
          </div>
          <button class="btn-select-join" data-join="${type}">Select</button>
        </div>
      `;
    }).join('');
    
    // Add click handlers
    grid.querySelectorAll('.btn-select-join').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentJoinType = btn.dataset.join;
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
    // Update tab buttons
    this.container.querySelectorAll('.edu-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update content
    this.container.querySelectorAll('.edu-content').forEach(content => {
      content.classList.toggle('hidden', content.id !== `edu-${tabName}`);
    });
  }
  
  /**
   * Show tooltip
   */
  showTooltip(e) {
    const tooltipKey = e.target.dataset.tooltip;
    const tooltipEl = this.container.querySelector('#tooltip-overlay');
    
    if (!tooltipEl || !this.tooltips[tooltipKey]) return;
    
    tooltipEl.textContent = this.tooltips[tooltipKey];
    tooltipEl.style.display = 'block';
    tooltipEl.style.left = e.clientX + 10 + 'px';
    tooltipEl.style.top = e.clientY + 10 + 'px';
  }
  
  /**
   * Hide tooltip
   */
  hideTooltip() {
    const tooltipEl = this.container.querySelector('#tooltip-overlay');
    if (tooltipEl) {
      tooltipEl.style.display = 'none';
    }
  }
  
  /**
   * Copy SQL to clipboard
   */
  copySQL() {
    const sqlCode = this.container.querySelector('#sql-code');
    if (!sqlCode) return;
    
    navigator.clipboard.writeText(sqlCode.textContent).then(() => {
      const btn = this.container.querySelector('#btn-copy-sql');
      const originalText = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    });
  }
  
  /**
   * Reset the simulator
   */
  reset() {
    this.isAnimating = false;
    this.currentJoinType = 'INNER';
    this.container.querySelector('#join-type').value = 'INNER';
    this.updateJoinDescription();
    this.updateSQLDisplay();
    this.renderVennDiagram();
    this.clearResult();
    this.renderTables();
  }
  
  /**
   * Clear the result display
   */
  clearResult() {
    const container = this.container.querySelector('#result-container');
    if (container) {
      container.innerHTML = '<div class="placeholder">Click "Execute Join" to see results</div>';
    }
    const countEl = this.container.querySelector('#result-count');
    if (countEl) {
      countEl.textContent = '0 rows';
    }
  }
  
  /**
   * Utility: Sleep for animation
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CSS styles for the simulator - DARK MODE COMPATIBLE
const joinSimulatorStyles = `
/* SQL Join Simulator Styles - Dark Mode */
.join-simulator {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-secondary, #1e293b);
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
  color: var(--text-primary, #f8fafc);
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
  color: var(--text-secondary, #cbd5e1);
}

.join-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-light, #334155);
  border-radius: 6px;
  font-size: 0.95rem;
  background: var(--bg-primary, #0f172a);
  color: var(--text-primary, #f8fafc);
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
  background: var(--primary, #3b82f6);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark, #2563eb);
}

.btn-secondary {
  background: var(--bg-tertiary, #334155);
  color: var(--text-primary, #f8fafc);
  border: 1px solid var(--border-light, #475569) !important;
}

.btn-secondary:hover {
  background: var(--bg-secondary, #1e293b);
}

.btn-tertiary {
  background: var(--bg-tertiary, #334155);
  color: var(--text-secondary, #cbd5e1);
}

.btn-tertiary:hover {
  background: var(--bg-secondary, #1e293b);
}

/* Join Condition Bar */
.join-condition-bar {
  background: var(--bg-primary, #0f172a);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid var(--primary, #3b82f6);
}

.condition-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.condition-label {
  font-weight: 500;
  color: var(--text-secondary, #cbd5e1);
}

.condition-code {
  background: var(--bg-tertiary, #334155);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  color: var(--primary, #60a5fa);
}

.join-description {
  color: var(--text-secondary, #cbd5e1);
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
  background: var(--bg-primary, #0f172a);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.table-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--border-light, #334155);
}

.table-name {
  font-size: 1.1rem;
  margin: 0;
  color: var(--text-primary, #f8fafc);
}

.table-alias {
  color: var(--text-muted, #64748b);
  font-size: 0.9rem;
}

.row-count {
  margin-left: auto;
  font-size: 0.85rem;
  color: var(--text-secondary, #cbd5e1);
  background: var(--bg-tertiary, #334155);
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
  color: var(--primary, #3b82f6);
  font-weight: bold;
}

.join-type-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted, #64748b);
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
  background: var(--bg-tertiary, #334155);
  padding: 0.5rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary, #f8fafc);
  border-bottom: 2px solid var(--border-light, #334155);
}

.data-table td {
  padding: 0.5rem;
  border-bottom: 1px solid var(--border-light, #334155);
  color: var(--text-primary, #f8fafc);
}

.table-row {
  transition: all 0.2s;
}

.table-row:hover {
  background: var(--bg-tertiary, #334155);
}

.table-row.has-match {
  background: rgba(52, 211, 153, 0.15);
  border-left: 3px solid var(--success, #34d399);
}

.table-row.no-match {
  background: rgba(100, 116, 139, 0.15);
  border-left: 3px solid var(--text-muted, #64748b);
}

.table-row.hover-highlight {
  background: var(--primary-900, #1e3a8a) !important;
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.table-row.highlighted-source {
  background: var(--warning-900, #78350f) !important;
  animation: pulse 1s ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.null-value {
  color: var(--text-muted, #64748b);
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
  background: var(--bg-primary, #0f172a);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  overflow: hidden;
  border: 1px solid var(--border-light, #334155);
}

.sql-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary, #1e293b);
  border-bottom: 1px solid var(--border-light, #334155);
}

.sql-header h5 {
  margin: 0;
  color: var(--text-secondary, #cbd5e1);
  font-size: 0.9rem;
}

.btn-copy {
  background: transparent;
  border: 1px solid var(--border-default, #475569);
  color: var(--text-secondary, #cbd5e1);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-copy:hover {
  background: var(--bg-tertiary, #334155);
  color: var(--text-primary, #f8fafc);
}

.sql-code-block {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
}

.sql-code-block code {
  color: var(--primary-light, #a5b4fc);
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* Result Section */
.result-section {
  background: var(--bg-primary, #0f172a);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-light, #334155);
}

.result-header h4 {
  margin: 0;
  color: var(--text-primary, #f8fafc);
}

.result-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
}

.stat {
  font-weight: 600;
  color: var(--primary, #60a5fa);
}

.stat-divider {
  color: var(--border-default, #475569);
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
  color: var(--text-secondary, #cbd5e1);
}

.color-box {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.color-box.match {
  background: rgba(52, 211, 153, 0.3);
  border: 1px solid var(--success, #34d399);
}

.color-box.null {
  background: rgba(100, 116, 139, 0.3);
  border: 1px solid var(--text-muted, #64748b);
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
  color: var(--text-muted, #64748b);
  font-style: italic;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.result-table th {
  background: var(--bg-tertiary, #334155);
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary, #f8fafc);
  border-bottom: 2px solid var(--border-light, #334155);
  position: sticky;
  top: 0;
}

.result-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-light, #334155);
  color: var(--text-primary, #f8fafc);
}

.result-table tr {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-table tr.matched-row {
  background: rgba(52, 211, 153, 0.1);
}

.result-table tr.left-only-row {
  background: rgba(59, 130, 246, 0.1);
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
    rgba(100, 116, 139, 0.1) 5px,
    rgba(100, 116, 139, 0.1) 10px
  );
  color: var(--text-muted, #64748b);
}

/* Animation Container */
.animation-container {
  max-height: 300px;
  overflow-y: auto;
}

.anim-row {
  background: var(--bg-primary, #0f172a);
  border: 1px solid var(--border-light, #334155);
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
  border-left: 3px solid var(--success, #34d399);
}

.anim-row.left-only {
  border-left: 3px solid var(--primary, #3b82f6);
}

.anim-row.right-only {
  border-left: 3px solid var(--warning, #f59e0b);
}

.anim-row-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.step-num {
  background: var(--primary, #3b82f6);
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
  color: var(--text-primary, #f8fafc);
}

.step-explanation {
  font-size: 0.85rem;
  color: var(--text-secondary, #cbd5e1);
  margin-top: 0.5rem;
  padding-left: 2rem;
}

.step-indicator {
  display: none;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--bg-tertiary, #334155);
  border-radius: 6px;
  font-size: 0.9rem;
}

.step-label {
  color: var(--text-secondary, #cbd5e1);
}

.step-current {
  font-weight: 600;
  color: var(--primary, #60a5fa);
}

/* Compare Section */
.compare-section {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-primary, #0f172a);
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
  padding: 1.5rem;
  max-width: 900px;
  width: 90%;
  max-height: 80vh;
  overflow: auto;
  z-index: 1000;
  border: 1px solid var(--border-light, #334155);
}

.compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.compare-header h4 {
  margin: 0;
  color: var(--text-primary, #f8fafc);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-secondary, #cbd5e1);
  cursor: pointer;
}

.btn-close:hover {
  color: var(--text-primary, #f8fafc);
}

.compare-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.compare-card {
  background: var(--bg-secondary, #1e293b);
  border-radius: 8px;
  padding: 1rem;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.compare-card:hover {
  border-color: var(--primary, #3b82f6);
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
  color: var(--text-primary, #f8fafc);
}

.compare-count {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--primary, #60a5fa);
  background: rgba(59, 130, 246, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.compare-desc {
  font-size: 0.85rem;
  color: var(--text-secondary, #cbd5e1);
  margin-bottom: 0.75rem;
}

.compare-preview {
  background: var(--bg-primary, #0f172a);
  border-radius: 6px;
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
  color: var(--text-secondary, #cbd5e1);
}

.preview-row {
  padding: 0.25rem 0;
  border-bottom: 1px solid var(--border-light, #334155);
  color: var(--text-primary, #f8fafc);
}

.preview-row:last-child {
  border-bottom: none;
}

.preview-more {
  text-align: center;
  color: var(--text-muted, #64748b);
  font-style: italic;
  padding-top: 0.25rem;
}

.btn-select-join {
  width: 100%;
  padding: 0.5rem;
  background: var(--primary, #3b82f6);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-select-join:hover {
  background: var(--primary-dark, #2563eb);
}

/* Educational Panel */
.education-panel {
  background: var(--bg-primary, #0f172a);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.edu-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-light, #334155);
}

.edu-tab {
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary, #cbd5e1);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.edu-tab:hover {
  color: var(--primary-light, #60a5fa);
}

.edu-tab.active {
  color: var(--primary-light, #60a5fa);
  border-bottom-color: var(--primary, #3b82f6);
  font-weight: 500;
}

.edu-content {
  min-height: 150px;
}

.edu-content.hidden {
  display: none;
}

.explanation-text {
  color: var(--text-secondary, #cbd5e1);
  line-height: 1.6;
}

.explanation-text strong {
  color: var(--text-primary, #f8fafc);
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
  fill: var(--text-secondary, #cbd5e1);
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
  color: var(--text-secondary, #cbd5e1);
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
  background: var(--bg-secondary, #1e293b);
  border-radius: 6px;
}

.tip-icon {
  font-size: 1.25rem;
}

.tip-text {
  color: var(--text-secondary, #cbd5e1);
  font-size: 0.9rem;
  line-height: 1.5;
}

.tip-text strong {
  color: var(--text-primary, #f8fafc);
}

/* Tooltip */
.tooltip-trigger {
  cursor: help;
  color: var(--text-muted, #64748b);
}

.tooltip-overlay {
  position: fixed;
  display: none;
  background: var(--bg-secondary, #1e293b);
  color: var(--text-primary, #f8fafc);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  z-index: 1001;
  max-width: 250px;
  pointer-events: none;
  border: 1px solid var(--border-light, #334155);
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

/* Empty Result */
.empty-result {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: var(--text-muted, #64748b);
  font-style: italic;
  background: var(--bg-secondary, #1e293b);
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
