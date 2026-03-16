/**
 * Relational Algebra Simulator
 * ACS-3902 Database Systems - Interactive RA Query Builder
 * 
 * Features:
 * - Interactive operator palette with all RA operators
 * - Visual query tree builder with drag-and-drop
 * - Sample database (Employee, Department, Project, Works_On)
 * - Dual view: RA notation and SQL
 * - Step-by-step execution visualization
 * - Practice mode with verification
 * - Nested operations support
 */

class RASimulator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.queryTree = null;
    this.currentNodeId = 0;
    this.selectedNode = null;
    this.executionStep = 0;
    this.isAnimating = false;
    this.notationStyle = 'tree'; // 'tree' or 'linear'
    
    // Sample database tables
    this.tables = this.initializeSampleData();
    
    // RA Operators configuration
    this.operators = {
      sigma: {
        symbol: 'σ',
        name: 'Selection',
        type: 'unary',
        description: 'Filter rows based on condition',
        syntax: 'σ<condition>(R)',
        sql: 'WHERE',
        color: '#4CAF50',
        configFields: ['condition']
      },
      pi: {
        symbol: 'π',
        name: 'Projection',
        type: 'unary',
        description: 'Select specific columns',
        syntax: 'π<attributes>(R)',
        sql: 'SELECT',
        color: '#2196F3',
        configFields: ['attributes']
      },
      join: {
        symbol: '⨝',
        name: 'Join',
        type: 'binary',
        description: 'Combine tables based on condition',
        syntax: 'R ⨝<condition> S',
        sql: 'JOIN',
        color: '#FF9800',
        configFields: ['joinType', 'condition']
      },
      product: {
        symbol: '✕',
        name: 'Cartesian Product',
        type: 'binary',
        description: 'All combinations of rows',
        syntax: 'R ✕ S',
        sql: 'CROSS JOIN',
        color: '#9C27B0',
        configFields: []
      },
      rho: {
        symbol: 'ρ',
        name: 'Rename',
        type: 'unary',
        description: 'Rename relation or attributes',
        syntax: 'ρ<newName>(R)',
        sql: 'AS',
        color: '#607D8B',
        configFields: ['newName', 'attrRenames']
      },
      union: {
        symbol: '∪',
        name: 'Union',
        type: 'binary',
        description: 'Combine two relations (no duplicates)',
        syntax: 'R ∪ S',
        sql: 'UNION',
        color: '#E91E63',
        configFields: []
      },
      intersection: {
        symbol: '∩',
        name: 'Intersection',
        type: 'binary',
        description: 'Common rows in both relations',
        syntax: 'R ∩ S',
        sql: 'INTERSECT',
        color: '#00BCD4',
        configFields: []
      },
      difference: {
        symbol: '−',
        name: 'Difference',
        type: 'binary',
        description: 'Rows in R but not in S',
        syntax: 'R − S',
        sql: 'EXCEPT',
        color: '#F44336',
        configFields: []
      }
    };
    
    // Practice mode challenges
    this.challenges = this.initializeChallenges();
    this.currentChallenge = null;
    
    this.init();
  }
  
  init() {
    this.renderInterface();
    this.attachEventListeners();
    this.renderTablePreviews();
  }
  
  initializeSampleData() {
    return {
      Employee: {
        columns: ['Ssn', 'Fname', 'Minit', 'Lname', 'Bdate', 'Address', 'Sex', 'Salary', 'Super_ssn', 'Dno'],
        data: [
          ['123456789', 'John', 'B', 'Smith', '1965-01-09', '731 Fondren, Houston, TX', 'M', 30000, '333445555', 5],
          ['333445555', 'Franklin', 'T', 'Wong', '1955-12-08', '638 Voss, Houston, TX', 'M', 40000, '888665555', 5],
          ['999887777', 'Alicia', 'J', 'Zelaya', '1968-01-19', '3321 Castle, Spring, TX', 'F', 25000, '987654321', 4],
          ['987654321', 'Jennifer', 'S', 'Wallace', '1941-06-20', '291 Berry, Bellaire, TX', 'F', 43000, '888665555', 4],
          ['666884444', 'Ramesh', 'K', 'Narayan', '1962-09-15', '975 Fire Oak, Humble, TX', 'M', 38000, '333445555', 5],
          ['453453453', 'Joyce', 'A', 'English', '1972-07-31', '5631 Rice, Houston, TX', 'F', 25000, '333445555', 5],
          ['987987987', 'Ahmad', 'V', 'Jabbar', '1969-03-29', '980 Dallas, Houston, TX', 'M', 25000, '987654321', 4],
          ['888665555', 'James', 'E', 'Borg', '1937-11-10', '450 Stone, Houston, TX', 'M', 55000, null, 1]
        ],
        primaryKey: 'Ssn'
      },
      Department: {
        columns: ['Dname', 'Dnumber', 'Mgr_ssn', 'Mgr_start_date'],
        data: [
          ['Research', 5, '333445555', '1988-05-22'],
          ['Administration', 4, '987654321', '1995-01-01'],
          ['Headquarters', 1, '888665555', '1981-06-19']
        ],
        primaryKey: 'Dnumber'
      },
      Project: {
        columns: ['Pname', 'Pnumber', 'Plocation', 'Dnum'],
        data: [
          ['ProductX', 1, 'Bellaire', 5],
          ['ProductY', 2, 'Sugarland', 5],
          ['ProductZ', 3, 'Houston', 5],
          ['Computerization', 10, 'Stafford', 4],
          ['Reorganization', 20, 'Houston', 1],
          ['Newbenefits', 30, 'Stafford', 4]
        ],
        primaryKey: 'Pnumber'
      },
      Works_On: {
        columns: ['Essn', 'Pno', 'Hours'],
        data: [
          ['123456789', 1, 32.5],
          ['123456789', 2, 7.5],
          ['666884444', 3, 40.0],
          ['453453453', 1, 20.0],
          ['453453453', 2, 20.0],
          ['333445555', 2, 10.0],
          ['333445555', 3, 10.0],
          ['333445555', 10, 10.0],
          ['333445555', 20, 10.0],
          ['999887777', 30, 30.0],
          ['999887777', 10, 10.0],
          ['987987987', 10, 35.0],
          ['987987987', 30, 5.0],
          ['987654321', 30, 20.0],
          ['987654321', 20, 15.0],
          ['888665555', 20, null]
        ],
        primaryKey: ['Essn', 'Pno']
      }
    };
  }
  
  initializeChallenges() {
    return {
      ra_to_sql: [
        {
          id: 1,
          name: 'Simple Selection',
          ra: 'σ Dno = 5 (Employee)',
          sql: 'SELECT * FROM Employee WHERE Dno = 5',
          hint: 'Selection (σ) becomes WHERE clause'
        },
        {
          id: 2,
          name: 'Projection',
          ra: 'π Fname, Lname, Salary (Employee)',
          sql: 'SELECT Fname, Lname, Salary FROM Employee',
          hint: 'Projection (π) lists the columns in SELECT'
        },
        {
          id: 3,
          name: 'Selection + Projection',
          ra: 'π Fname, Lname (σ Salary > 30000 (Employee))',
          sql: 'SELECT Fname, Lname FROM Employee WHERE Salary > 30000',
          hint: 'Nested: inner is WHERE, outer is SELECT columns'
        },
        {
          id: 4,
          name: 'Simple Join',
          ra: 'Employee ⨝ Dno = Dnumber Department',
          sql: 'SELECT * FROM Employee JOIN Department ON Dno = Dnumber',
          hint: 'Join combines tables with ON condition'
        },
        {
          id: 5,
          name: 'Three Table Join',
          ra: 'π Fname, Lname, Pname ((Employee ⨝ Ssn = Essn Works_On) ⨝ Pno = Pnumber Project)',
          sql: 'SELECT Fname, Lname, Pname FROM Employee JOIN Works_On ON Ssn = Essn JOIN Project ON Pno = Pnumber',
          hint: 'Chain multiple JOINs for multiple tables'
        }
      ],
      sql_to_ra: [
        {
          id: 6,
          name: 'Simple WHERE',
          sql: 'SELECT * FROM Employee WHERE Salary > 40000',
          ra: 'σ Salary > 40000 (Employee)',
          hint: 'WHERE becomes σ (selection)'
        },
        {
          id: 7,
          name: 'Column Selection',
          sql: 'SELECT Fname, Lname FROM Employee',
          ra: 'π Fname, Lname (Employee)',
          hint: 'Column selection becomes π (projection)'
        },
        {
          id: 8,
          name: 'Join Query',
          sql: 'SELECT * FROM Employee JOIN Department ON Dno = Dnumber',
          ra: 'Employee ⨝ Dno = Dnumber Department',
          hint: 'JOIN becomes ⨝ with the condition'
        }
      ]
    };
  }
  
  // ==================== EXAMPLES ====================
  
  getExamples() {
    return [
      {
        id: 'simple-selection',
        name: 'Simple Selection',
        desc: 'Select employees with salary > 50000',
        ra: 'σ salary>50000 (Employee)',
        sql: 'SELECT * FROM Employee WHERE salary > 50000',
        build: () => this.buildExampleTree('sigma', { condition: 'Salary > 50000' }, 'Employee')
      },
      {
        id: 'simple-projection',
        name: 'Projection',
        desc: 'Show only first and last names',
        ra: 'π Fname,Lname (Employee)',
        sql: 'SELECT Fname, Lname FROM Employee',
        build: () => this.buildExampleTree('pi', { attributes: 'Fname, Lname' }, 'Employee')
      },
      {
        id: 'simple-join',
        name: 'Natural Join',
        desc: 'Join Employee with Department',
        ra: 'Employee ⨝ Department',
        sql: 'SELECT * FROM Employee JOIN Department ON Dno = Dnumber',
        build: () => this.buildExampleTree('join', { condition: 'Dno = Dnumber' }, ['Employee', 'Department'])
      },
      {
        id: 'complex-query',
        name: 'Selection + Join + Projection',
        desc: 'Names of employees in Research dept',
        ra: 'π Fname,Lname (σ Dname=\'Research\' (Employee ⨝ Department))',
        sql: "SELECT Fname, Lname FROM Employee JOIN Department ON Dno = Dnumber WHERE Dname = 'Research'",
        build: () => this.buildComplexExample()
      },
      {
        id: 'rename',
        name: 'Rename Operation',
        desc: 'Rename Employee to Manager',
        ra: 'ρ Manager (Employee)',
        sql: 'SELECT * FROM Employee AS Manager',
        build: () => this.buildExampleTree('rho', { newName: 'Manager' }, 'Employee')
      },
      {
        id: 'cartesian-product',
        name: 'Cartesian Product',
        desc: 'All combinations of Employees and Departments',
        ra: 'Employee × Department',
        sql: 'SELECT * FROM Employee CROSS JOIN Department',
        build: () => this.buildExampleTree('product', {}, ['Employee', 'Department'])
      }
    ];
  }
  
  buildExampleTree(opType, config, tableOrTables) {
    this.clearTree();
    
    const op = this.operators[opType];
    if (!op) return;
    
    const nodeId = ++this.currentNodeId;
    const rootNode = {
      id: nodeId,
      type: opType,
      symbol: op.symbol,
      name: op.name,
      config: config,
      children: []
    };
    
    if (op.type === 'unary') {
      // Add single table as child
      const tableName = Array.isArray(tableOrTables) ? tableOrTables[0] : tableOrTables;
      const table = this.tables[tableName];
      if (table) {
        const tableNode = {
          id: ++this.currentNodeId,
          type: 'table',
          name: tableName,
          columns: [...table.columns],
          data: table.data,
          children: []
        };
        rootNode.children.push(tableNode);
      }
    } else if (op.type === 'binary') {
      // Add two tables as children
      const tableNames = Array.isArray(tableOrTables) ? tableOrTables : [tableOrTables, tableOrTables];
      tableNames.forEach(tableName => {
        const table = this.tables[tableName];
        if (table) {
          const tableNode = {
            id: ++this.currentNodeId,
            type: 'table',
            name: tableName,
            columns: [...table.columns],
            data: table.data,
            children: []
          };
          rootNode.children.push(tableNode);
        }
      });
    }
    
    this.queryTree = rootNode;
    this.selectedNode = nodeId;
    this.renderQueryTree();
    this.renderConfiguration(rootNode);
    this.updateDualView();
  }
  
  buildComplexExample() {
    this.clearTree();
    
    // Build: π Fname,Lname (σ Dname='Research' (Employee ⨝ Department))
    
    // First, create the join
    const joinNode = {
      id: ++this.currentNodeId,
      type: 'join',
      symbol: this.operators.join.symbol,
      name: 'Join',
      config: { condition: 'Dno = Dnumber' },
      children: []
    };
    
    // Add Employee and Department tables to join
    ['Employee', 'Department'].forEach(tableName => {
      const table = this.tables[tableName];
      if (table) {
        joinNode.children.push({
          id: ++this.currentNodeId,
          type: 'table',
          name: tableName,
          columns: [...table.columns],
          data: table.data,
          children: []
        });
      }
    });
    
    // Create sigma around join
    const sigmaNode = {
      id: ++this.currentNodeId,
      type: 'sigma',
      symbol: this.operators.sigma.symbol,
      name: 'Selection',
      config: { condition: "Dname = 'Research'" },
      children: [joinNode]
    };
    
    // Create pi around sigma
    const piNode = {
      id: ++this.currentNodeId,
      type: 'pi',
      symbol: this.operators.pi.symbol,
      name: 'Projection',
      config: { attributes: 'Fname, Lname' },
      children: [sigmaNode]
    };
    
    this.queryTree = piNode;
    this.selectedNode = piNode.id;
    this.renderQueryTree();
    this.renderConfiguration(piNode);
    this.updateDualView();
  }
  
  loadExample(exampleId) {
    const examples = this.getExamples();
    const example = examples.find(e => e.id === exampleId);
    if (example && example.build) {
      example.build();
      this.showMessage(`Loaded example: ${example.name}`);
    }
  }
  
  renderInterface() {
    this.container.innerHTML = `
      <div class="ra-simulator">
        <div class="ra-header">
          <h3>Relational Algebra Simulator</h3>
          <div class="view-toggle">
            <button class="view-btn active" data-view="builder">Query Builder</button>
            <button class="view-btn" data-view="practice">Practice Mode</button>
          </div>
        </div>
        
        <!-- Instructions Banner -->
        <div class="ra-instructions">
          <div class="instruction-step">
            <span class="step-num">1</span>
            <span class="step-text">Click a <strong>Table</strong> to start</span>
          </div>
          <div class="instruction-arrow">→</div>
          <div class="instruction-step">
            <span class="step-num">2</span>
            <span class="step-text">Add <strong>Operators</strong> (σ, π, ⨝)</span>
          </div>
          <div class="instruction-arrow">→</div>
          <div class="instruction-step">
            <span class="step-num">3</span>
            <span class="step-text">Configure & <strong>Execute</strong></span>
          </div>
        </div>
        
        <!-- Builder View -->
        <div class="builder-view" id="builder-view">
          <div class="ra-workspace">
            <!-- Left Panel: Operators, Tables, and Examples -->
            <div class="ra-sidebar">
              <div class="operator-palette">
                <h4>Operators</h4>
                <div class="instruction-text">⬆️ Click operator, then click in tree to add</div>
                <div class="operators-grid">
                  ${this.renderOperatorButtons()}
                </div>
              </div>
              
              <div class="tables-panel">
                <h4>Tables</h4>
                <div class="instruction-text">⬆️ Click to add table to query</div>
                <div class="table-list">
                  ${Object.keys(this.tables).map(table => `
                    <div class="table-item" data-table="${table}">
                      <span class="table-icon">📊</span>
                      <span class="table-name">${table}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div class="examples-panel">
                <h4>📚 Load Example</h4>
                <div class="examples-list">
                  ${this.renderExampleButtons()}
                </div>
              </div>
            </div>
            
            <!-- Center Panel: Query Tree Canvas -->
            <div class="ra-canvas-area">
              <div class="canvas-header">
                <h4>Query Tree</h4>
                <div class="canvas-actions">
                  <button id="btn-clear-tree" class="btn-icon" title="Clear">🗑️</button>
                  <button id="btn-animate" class="btn-icon" title="Animate Execution">▶️</button>
                  <button id="btn-step" class="btn-icon" title="Step Forward">⏭️</button>
                </div>
              </div>
              <div class="query-canvas" id="query-canvas">
                <div class="canvas-placeholder">
                  <p>Click an operator or table to start building</p>
                  <p class="hint">Build your query tree from leaves (tables) up to root</p>
                </div>
              </div>
            </div>
            
            <!-- Right Panel: Configuration and Preview -->
            <div class="ra-config-panel">
              <div class="config-section" id="config-section">
                <h4>Configuration</h4>
                <div class="config-placeholder">
                  Select a node to configure
                </div>
              </div>
              
              <div class="preview-section">
                <h4>Table Preview</h4>
                <div class="table-preview" id="table-preview">
                  <div class="preview-placeholder">Hover over a table to preview</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- SQL Input Section -->
          <div class="sql-input-panel">
            <div class="sql-input-header">
              <h4>🔄 SQL to RA Converter</h4>
              <span class="sql-input-hint">Paste a SELECT query to convert to Relational Algebra</span>
            </div>
            <div class="sql-input-area">
              <textarea id="sql-input" class="sql-input-textarea" placeholder="SELECT * FROM Employee WHERE Salary > 50000;
-- Paste SQL here and click Convert"></textarea>
              <button id="btn-convert-sql" class="btn-primary btn-convert">🔄 Convert to RA</button>
            </div>
          </div>
          
          <!-- Bottom Panel: Dual View (RA and SQL) -->
          <div class="dual-view-panel">
            <div class="view-section ra-view">
              <div class="view-header">
                <h4>RA Notation</h4>
                <button class="btn-copy" data-target="ra-output">📋</button>
              </div>
              <div class="notation-output" id="ra-output">
                <span class="placeholder">Build a query to see RA notation</span>
              </div>
              <div class="view-toggle-inline">
                <button class="notation-btn active" data-notation="tree">Tree</button>
                <button class="notation-btn" data-notation="linear">Linear</button>
              </div>
            </div>
            
            <div class="view-section sql-view">
              <div class="view-header">
                <h4>SQL Equivalent</h4>
                <button class="btn-copy" data-target="sql-output">📋</button>
              </div>
              <pre class="sql-output" id="sql-output"><code>-- SQL will appear here</code></pre>
            </div>
          </div>
          
          <!-- Execution Panel -->
          <div class="execution-panel" id="execution-panel" style="display: none;">
            <div class="execution-header">
              <h4>Step-by-Step Execution</h4>
              <div class="execution-controls">
                <button id="btn-exec-prev" class="btn-icon">⏮️</button>
                <span class="step-indicator">Step <span id="current-step">0</span> of <span id="total-steps">0</span></span>
                <button id="btn-exec-next" class="btn-icon">⏭️</button>
              </div>
              <button id="btn-close-exec" class="btn-close">×</button>
            </div>
            <div class="execution-content" id="execution-content">
              <!-- Dynamic execution steps -->
            </div>
          </div>
        </div>
        
        <!-- Practice View -->
        <div class="practice-view" id="practice-view" style="display: none;">
          <div class="practice-container">
            <div class="practice-sidebar">
              <div class="challenge-list">
                <h4>Challenges</h4>
                <div class="challenge-tabs">
                  <button class="challenge-tab active" data-challenge-type="ra_to_sql">RA → SQL</button>
                  <button class="challenge-tab" data-challenge-type="sql_to_ra">SQL → RA</button>
                </div>
                <div class="challenges" id="challenges-list">
                  ${this.renderChallengesList('ra_to_sql')}
                </div>
              </div>
            </div>
            
            <div class="practice-main">
              <div class="challenge-area" id="challenge-area">
                <div class="challenge-placeholder">
                  <p>Select a challenge to begin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Help Panel -->
        <div class="help-panel" id="help-panel">
          <button class="help-toggle" id="help-toggle">📖 Quick Reference</button>
          <div class="help-content" id="help-content">
            <div class="help-sections">
              <div class="help-section">
                <h5>How to Use the Query Builder</h5>
                <ol class="help-steps">
                  <li><strong>Start with a Table</strong> - Click any table (Employee, Department, Project, Works_On) to add it to your query</li>
                  <li><strong>Add Operators</strong> - Click an operator (σ, π, ⨝) then click where to place it</li>
                  <li><strong>Configure</strong> - Select a node and enter conditions (e.g., "Salary > 50000")</li>
                  <li><strong>Execute</strong> - Click ▶️ to see step-by-step results</li>
                </ol>
              </div>
              
              <div class="help-section">
                <h5>Operators Reference</h5>
                <div class="help-grid">
                  ${Object.entries(this.operators).map(([key, op]) => `
                    <div class="help-item">
                      <span class="help-symbol" style="color: ${op.color}">${op.symbol}</span>
                      <span class="help-name">${op.name}</span>
                      <span class="help-syntax">${op.syntax}</span>
                      <span class="help-sql">→ ${op.sql}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div class="help-section">
                <h5>Tips</h5>
                <ul class="help-tips">
                  <li>Build your query from the <strong>bottom up</strong> - tables first, then operators</li>
                  <li>Use <strong>Selection (σ)</strong> to filter rows with conditions like "Dno = 5"</li>
                  <li>Use <strong>Projection (π)</strong> to select specific columns</li>
                  <li><strong>Join (⨝)</strong> combines tables on matching columns like "Dno = Dnumber"</li>
                  <li>Try the <strong>Load Example</strong> buttons to see common patterns</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  renderOperatorButtons() {
    return Object.entries(this.operators).map(([key, op]) => `
      <button class="op-btn" data-op="${key}" title="${op.name}: ${op.description}">
        <span class="op-symbol" style="color: ${op.color}">${op.symbol}</span>
        <span class="op-label">${op.name}</span>
      </button>
    `).join('');
  }
  
  renderExampleButtons() {
    const examples = this.getExamples();
    return examples.map(ex => `
      <button class="example-btn" data-example="${ex.id}" title="RA: ${ex.ra}\nSQL: ${ex.sql}">
        <span class="example-name">${ex.name}</span>
        <span class="example-desc">${ex.desc}</span>
      </button>
    `).join('');
  }
  
  renderChallengesList(type) {
    const challenges = this.challenges[type] || [];
    return challenges.map(c => `
      <div class="challenge-card" data-challenge-id="${c.id}">
        <div class="challenge-name">${c.name}</div>
        <div class="challenge-difficulty">${type === 'ra_to_sql' ? 'RA → SQL' : 'SQL → RA'}</div>
      </div>
    `).join('');
  }
  
  renderRASymbolToolbar() {
    const symbols = [
      { symbol: 'σ', name: 'Selection', desc: 'Sigma - Filter rows' },
      { symbol: 'π', name: 'Projection', desc: 'Pi - Select columns' },
      { symbol: '⨝', name: 'Join', desc: 'Join tables' },
      { symbol: '⨯', name: 'Cartesian Product', desc: 'Cross product' },
      { symbol: 'ρ', name: 'Rename', desc: 'Rename relation' },
      { symbol: '∪', name: 'Union', desc: 'Union of relations' },
      { symbol: '∩', name: 'Intersection', desc: 'Common rows' },
      { symbol: '−', name: 'Difference', desc: 'Set difference' }
    ];
    
    return `
      <div class="ra-symbol-toolbar">
        <span class="toolbar-label">Insert RA symbols:</span>
        <div class="ra-symbols">
          ${symbols.map(s => `
            <button type="button" class="ra-symbol-btn" data-symbol="${s.symbol}" title="${s.name}: ${s.desc}">
              ${s.symbol}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  renderTablePreviews() {
    // Table previews are rendered on hover/click
  }
  
  attachEventListeners() {
    // View toggle
    this.container.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
    });
    
    // Operator buttons
    this.container.querySelectorAll('.op-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.addOperator(e.currentTarget.dataset.op));
    });
    
    // Table items
    this.container.querySelectorAll('.table-item').forEach(item => {
      item.addEventListener('click', (e) => this.addTable(e.currentTarget.dataset.table));
      item.addEventListener('mouseenter', (e) => this.previewTable(e.currentTarget.dataset.table));
    });
    
    // Canvas actions
    this.container.querySelector('#btn-clear-tree')?.addEventListener('click', () => this.clearTree());
    this.container.querySelector('#btn-animate')?.addEventListener('click', () => this.animateExecution());
    this.container.querySelector('#btn-step')?.addEventListener('click', () => this.stepExecution());
    
    // SQL to RA conversion
    this.container.querySelector('#btn-convert-sql')?.addEventListener('click', () => this.convertSQLToRA());
    
    // Notation toggle
    this.container.querySelectorAll('.notation-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchNotation(e.target.dataset.notation));
    });
    
    // Copy buttons
    this.container.querySelectorAll('.btn-copy').forEach(btn => {
      btn.addEventListener('click', (e) => this.copyToClipboard(e.target.dataset.target));
    });
    
    // Execution controls
    this.container.querySelector('#btn-exec-prev')?.addEventListener('click', () => this.prevExecutionStep());
    this.container.querySelector('#btn-exec-next')?.addEventListener('click', () => this.nextExecutionStep());
    this.container.querySelector('#btn-close-exec')?.addEventListener('click', () => this.closeExecution());
    
    // Challenge tabs
    this.container.querySelectorAll('.challenge-tab').forEach(tab => {
      tab.addEventListener('click', (e) => this.switchChallengeType(e.target.dataset.challengeType));
    });
    
    // Challenge cards
    this.container.addEventListener('click', (e) => {
      const card = e.target.closest('.challenge-card');
      if (card) {
        this.loadChallenge(parseInt(card.dataset.challengeId));
      }
    });
    
    // Help toggle
    this.container.querySelector('#help-toggle')?.addEventListener('click', () => this.toggleHelp());
    
    // Example buttons
    this.container.querySelectorAll('.example-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.loadExample(e.currentTarget.dataset.example));
    });
  }
  
  // ==================== CORE QUERY TREE OPERATIONS ====================
  
  addOperator(opType) {
    const op = this.operators[opType];
    if (!op) return;
    
    const nodeId = ++this.currentNodeId;
    const newNode = {
      id: nodeId,
      type: opType,
      symbol: op.symbol,
      name: op.name,
      config: {},
      children: []
    };
    
    if (!this.queryTree) {
      // First node becomes root
      if (op.type === 'unary') {
        this.showMessage('Please add a table first, then apply operators');
        return;
      }
      this.queryTree = newNode;
    } else if (this.selectedNode) {
      // Add as child to selected node
      const selected = this.findNode(this.queryTree, this.selectedNode);
      if (selected) {
        // Ensure selected node has children array (tables don't have one by default)
        if (!selected.children) {
          selected.children = [];
        }
        
        if (op.type === 'unary' && selected.children.length === 0) {
          // Unary operator needs one child
          selected.children.push(newNode);
        } else if (op.type === 'binary' && selected.children.length < 2) {
          // Binary operator needs two children
          selected.children.push(newNode);
        } else {
          this.showMessage('Selected node already has maximum children');
          return;
        }
      }
    } else {
      this.showMessage('Select a node in the tree first, or start with a table');
      return;
    }
    
    this.selectedNode = nodeId;
    this.renderQueryTree();
    this.renderConfiguration(newNode);
    this.updateDualView();
  }
  
  addTable(tableName) {
    const table = this.tables[tableName];
    if (!table) return;
    
    const nodeId = ++this.currentNodeId;
    const newNode = {
      id: nodeId,
      type: 'table',
      name: tableName,
      columns: [...table.columns],
      data: table.data,
      children: []  // Tables can have operators added to them
    };
    
    if (!this.queryTree) {
      this.queryTree = newNode;
    } else if (this.selectedNode) {
      const selected = this.findNode(this.queryTree, this.selectedNode);
      if (selected) {
        // Ensure selected node has children array
        if (!selected.children) {
          selected.children = [];
        }
        if (selected.children.length < 2) {
          selected.children.push(newNode);
        } else {
          this.showMessage('Selected node cannot accept more children');
          return;
        }
      }
    } else {
      this.showMessage('Select a parent node to add this table');
      return;
    }
    
    this.selectedNode = nodeId;
    this.renderQueryTree();
    this.updateDualView();
  }
  
  findNode(node, id) {
    if (node.id === id) return node;
    if (node.children) {
      for (let child of node.children) {
        const found = this.findNode(child, id);
        if (found) return found;
      }
    }
    return null;
  }
  
  renderQueryTree() {
    const canvas = this.container.querySelector('#query-canvas');
    if (!this.queryTree) {
      canvas.innerHTML = `
        <div class="canvas-placeholder">
          <p>Click an operator or table to start building</p>
          <p class="hint">Build your query tree from leaves (tables) up to root</p>
        </div>
      `;
      return;
    }
    
    canvas.innerHTML = this.buildTreeHTML(this.queryTree);
    
    // Attach node click handlers
    canvas.querySelectorAll('.tree-node').forEach(node => {
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        const nodeId = parseInt(node.dataset.nodeId);
        this.selectNode(nodeId);
      });
    });
  }
  
  buildTreeHTML(node, isRoot = true) {
    const op = this.operators[node.type];
    const isSelected = node.id === this.selectedNode;
    
    if (node.type === 'table') {
      // Tables can have children (operators applied to them)
      const childrenHTML = node.children && node.children.length > 0 
        ? `<div class="node-children">${node.children.map(c => this.buildTreeHTML(c, false)).join('')}</div>` 
        : '';
      
      return `
        <div class="tree-node table-node ${isSelected ? 'selected' : ''}" data-node-id="${node.id}">
          <div class="node-content">
            <span class="node-icon">📊</span>
            <span class="node-name">${node.name}</span>
          </div>
          ${childrenHTML}
        </div>
      `;
    }
    
    const childrenHTML = node.children ? node.children.map(c => this.buildTreeHTML(c, false)).join('') : '';
    
    return `
      <div class="tree-node op-node ${isSelected ? 'selected' : ''} ${isRoot ? 'root' : ''}" 
           data-node-id="${node.id}" data-op-type="${node.type}">
        <div class="node-content" style="border-color: ${op?.color || '#ccc'}">
          <span class="node-symbol" style="color: ${op?.color || '#000'}">${node.symbol}</span>
          ${node.config?.condition ? `<span class="node-condition">${node.config.condition}</span>` : ''}
          ${node.config?.attributes ? `<span class="node-attrs">${node.config.attributes}</span>` : ''}
        </div>
        ${childrenHTML ? `<div class="node-children">${childrenHTML}</div>` : ''}
      </div>
    `;
  }
  
  selectNode(nodeId) {
    this.selectedNode = nodeId;
    this.renderQueryTree();
    
    const node = this.findNode(this.queryTree, nodeId);
    if (node) {
      this.renderConfiguration(node);
    }
  }
  
  renderConfiguration(node) {
    const configSection = this.container.querySelector('#config-section');
    
    if (node.type === 'table') {
      configSection.innerHTML = `
        <h4>Table: ${node.name}</h4>
        <div class="table-info">
          <p><strong>Columns:</strong> ${node.columns.join(', ')}</p>
          <p><strong>Rows:</strong> ${node.data.length}</p>
        </div>
      `;
      return;
    }
    
    const op = this.operators[node.type];
    if (!op) return;
    
    let configHTML = `
      <h4>${op.name} (${op.symbol})</h4>
      <div class="config-form">
    `;
    
    if (op.configFields.includes('condition')) {
      configHTML += `
        <div class="config-field">
          <label>Condition:</label>
          <input type="text" id="config-condition" value="${node.config?.condition || ''}" 
                 placeholder="e.g., Salary > 30000">
          <small>Use SQL-like syntax: attr op value</small>
        </div>
      `;
    }
    
    if (op.configFields.includes('attributes')) {
      configHTML += `
        <div class="config-field">
          <label>Attributes (comma-separated):</label>
          <input type="text" id="config-attrs" value="${node.config?.attributes || ''}" 
                 placeholder="e.g., Fname, Lname, Salary">
          <small>Leave empty for SELECT *</small>
        </div>
      `;
    }
    
    if (op.configFields.includes('joinType')) {
      configHTML += `
        <div class="config-field">
          <label>Join Type:</label>
          <select id="config-join-type">
            <option value="inner" ${node.config?.joinType === 'inner' ? 'selected' : ''}>Inner Join</option>
            <option value="left" ${node.config?.joinType === 'left' ? 'selected' : ''}>Left Join</option>
            <option value="right" ${node.config?.joinType === 'right' ? 'selected' : ''}>Right Join</option>
            <option value="natural" ${node.config?.joinType === 'natural' ? 'selected' : ''}>Natural Join</option>
          </select>
        </div>
      `;
    }
    
    if (op.configFields.includes('newName')) {
      configHTML += `
        <div class="config-field">
          <label>New Name:</label>
          <input type="text" id="config-newname" value="${node.config?.newName || ''}" 
                 placeholder="e.g., Emp">
        </div>
      `;
    }
    
    configHTML += `
        <button id="btn-apply-config" class="btn-primary">Apply</button>
        <button id="btn-delete-node" class="btn-danger">Delete Node</button>
      </div>
    `;
    
    configSection.innerHTML = configHTML;
    
    // Attach config handlers
    configSection.querySelector('#btn-apply-config')?.addEventListener('click', () => this.applyConfig(node.id));
    configSection.querySelector('#btn-delete-node')?.addEventListener('click', () => this.deleteNode(node.id));
  }
  
  applyConfig(nodeId) {
    const node = this.findNode(this.queryTree, nodeId);
    if (!node) return;
    
    const condition = this.container.querySelector('#config-condition')?.value;
    const attributes = this.container.querySelector('#config-attrs')?.value;
    const joinType = this.container.querySelector('#config-join-type')?.value;
    const newName = this.container.querySelector('#config-newname')?.value;
    
    if (condition !== undefined) node.config.condition = condition;
    if (attributes !== undefined) node.config.attributes = attributes;
    if (joinType !== undefined) node.config.joinType = joinType;
    if (newName !== undefined) node.config.newName = newName;
    
    this.renderQueryTree();
    this.updateDualView();
  }
  
  deleteNode(nodeId) {
    if (!this.queryTree) return;
    
    if (this.queryTree.id === nodeId) {
      this.queryTree = null;
      this.selectedNode = null;
    } else {
      this.queryTree = this.removeNode(this.queryTree, nodeId);
    }
    
    this.renderQueryTree();
    this.container.querySelector('#config-section').innerHTML = `
      <h4>Configuration</h4>
      <div class="config-placeholder">Select a node to configure</div>
    `;
    this.updateDualView();
  }
  
  removeNode(node, idToRemove) {
    if (node.children) {
      node.children = node.children.filter(c => c.id !== idToRemove);
      node.children.forEach(c => this.removeNode(c, idToRemove));
    }
    return node;
  }
  
  clearTree() {
    this.queryTree = null;
    this.selectedNode = null;
    this.currentNodeId = 0;
    this.renderQueryTree();
    this.container.querySelector('#config-section').innerHTML = `
      <h4>Configuration</h4>
      <div class="config-placeholder">Select a node to configure</div>
    `;
    this.updateDualView();
  }
  
  // ==================== DUAL VIEW (RA & SQL) ====================
  
  updateDualView() {
    if (!this.queryTree) {
      this.container.querySelector('#ra-output').innerHTML = '<span class="placeholder">Build a query to see RA notation</span>';
      this.container.querySelector('#sql-output code').textContent = '-- SQL will appear here';
      return;
    }
    
    const isLinear = this.notationStyle === 'linear';
    const raNotation = this.generateRANotation(this.queryTree, isLinear);
    const sql = this.generateSQL(this.queryTree);
    
    this.container.querySelector('#ra-output').innerHTML = raNotation;
    this.container.querySelector('#sql-output code').textContent = sql;
  }
  
  generateRANotation(node, isLinear = false) {
    if (node.type === 'table') {
      return node.name;
    }
    
    const op = this.operators[node.type];
    if (!op) return '';
    
    // For linear notation, build a full expression
    // For tree notation, show just the operator symbol at the node
    
    if (node.type === 'sigma') {
      const condition = node.config?.condition || 'true';
      const child = node.children[0] ? this.generateRANotation(node.children[0], isLinear) : '?';
      if (isLinear) {
        return `σ<sub>${condition}</sub>(${child})`;
      }
      return `σ<sub>${condition}</sub>`;
    }
    
    if (node.type === 'pi') {
      const attrs = node.config?.attributes || '*';
      const child = node.children[0] ? this.generateRANotation(node.children[0], isLinear) : '?';
      if (isLinear) {
        return `π<sub>${attrs}</sub>(${child})`;
      }
      return `π<sub>${attrs}</sub>`;
    }
    
    if (node.type === 'join') {
      const condition = node.config?.condition || 'true';
      const left = node.children[0] ? this.generateRANotation(node.children[0], isLinear) : '?';
      const right = node.children[1] ? this.generateRANotation(node.children[1], isLinear) : '?';
      if (isLinear) {
        return `(${left} ${op.symbol}<sub>${condition}</sub> ${right})`;
      }
      return `${op.symbol}<sub>${condition}</sub>`;
    }
    
    if (node.type === 'rho') {
      const newName = node.config?.newName || 'Temp';
      const child = node.children[0] ? this.generateRANotation(node.children[0], isLinear) : '?';
      if (isLinear) {
        return `ρ<sub>${newName}</sub>(${child})`;
      }
      return `ρ<sub>${newName}</sub>`;
    }
    
    // Binary operators (union, intersection, difference, product)
    if (op.type === 'binary') {
      const left = node.children[0] ? this.generateRANotation(node.children[0], isLinear) : '?';
      const right = node.children[1] ? this.generateRANotation(node.children[1], isLinear) : '?';
      return `(${left} ${op.symbol} ${right})`;
    }
    
    return '';
  }
  
  generateSQL(node) {
    if (node.type === 'table') {
      return node.name;
    }
    
    if (node.type === 'sigma') {
      const condition = node.config?.condition || '1=1';
      const child = node.children[0] ? this.generateSQL(node.children[0]) : 'Employee';
      return `SELECT * FROM (${child}) AS t${node.id} WHERE ${condition}`;
    }
    
    if (node.type === 'pi') {
      const attrs = node.config?.attributes || '*';
      const child = node.children[0] ? this.generateSQL(node.children[0]) : 'Employee';
      return `SELECT ${attrs} FROM (${child}) AS t${node.id}`;
    }
    
    if (node.type === 'join') {
      const condition = node.config?.condition || '1=1';
      const joinType = node.config?.joinType || 'inner';
      const left = node.children[0] ? this.generateSQL(node.children[0]) : 'Employee';
      const right = node.children[1] ? this.generateSQL(node.children[1]) : 'Department';
      
      let joinSQL = 'JOIN';
      if (joinType === 'left') joinSQL = 'LEFT JOIN';
      else if (joinType === 'right') joinSQL = 'RIGHT JOIN';
      else if (joinType === 'natural') joinSQL = 'NATURAL JOIN';
      
      if (joinType === 'natural') {
        return `SELECT * FROM (${left}) AS l${node.id} ${joinSQL} (${right}) AS r${node.id}`;
      }
      return `SELECT * FROM (${left}) AS l${node.id} ${joinSQL} (${right}) AS r${node.id} ON ${condition}`;
    }
    
    if (node.type === 'product') {
      const left = node.children[0] ? this.generateSQL(node.children[0]) : 'Employee';
      const right = node.children[1] ? this.generateSQL(node.children[1]) : 'Department';
      return `SELECT * FROM (${left}) AS l${node.id} CROSS JOIN (${right}) AS r${node.id}`;
    }
    
    if (node.type === 'rho') {
      const newName = node.config?.newName || 'temp';
      const child = node.children[0] ? this.generateSQL(node.children[0]) : 'Employee';
      return `SELECT * FROM (${child}) AS ${newName}`;
    }
    
    if (node.type === 'union') {
      const left = node.children[0] ? this.generateSQL(node.children[0]) : 'Employee';
      const right = node.children[1] ? this.generateSQL(node.children[1]) : 'Employee';
      return `(${left}) UNION (${right})`;
    }
    
    if (node.type === 'intersection') {
      const left = node.children[0] ? this.generateSQL(node.children[0]) : 'Employee';
      const right = node.children[1] ? this.generateSQL(node.children[1]) : 'Employee';
      return `(${left}) INTERSECT (${right})`;
    }
    
    if (node.type === 'difference') {
      const left = node.children[0] ? this.generateSQL(node.children[0]) : 'Employee';
      const right = node.children[1] ? this.generateSQL(node.children[1]) : 'Employee';
      return `(${left}) EXCEPT (${right})`;
    }
    
    return '';
  }
  
  switchNotation(notation) {
    this.notationStyle = notation;
    this.container.querySelectorAll('.notation-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.notation === notation);
    });
    // Re-render with new notation style
    this.updateDualView();
  }
  
  // ==================== EXECUTION VISUALIZATION ====================
  
  animateExecution() {
    if (!this.queryTree) {
      this.showMessage('Build a query tree first');
      return;
    }
    
    this.executionStep = 0;
    this.isAnimating = true;
    this.showExecutionPanel();
    this.runExecutionAnimation();
  }
  
  stepExecution() {
    if (!this.queryTree) {
      this.showMessage('Build a query tree first');
      return;
    }
    
    this.showExecutionPanel();
    this.nextExecutionStep();
  }
  
  showExecutionPanel() {
    const panel = this.container.querySelector('#execution-panel');
    panel.style.display = 'block';
    this.renderExecutionSteps();
  }
  
  closeExecution() {
    this.container.querySelector('#execution-panel').style.display = 'none';
    this.isAnimating = false;
  }
  
  renderExecutionSteps() {
    const steps = this.generateExecutionSteps(this.queryTree);
    const content = this.container.querySelector('#execution-content');
    const totalSteps = steps.length;
    
    this.container.querySelector('#total-steps').textContent = totalSteps;
    
    content.innerHTML = steps.map((step, i) => `
      <div class="exec-step" data-step="${i}" style="display: ${i === 0 ? 'block' : 'none'}">
        <div class="step-header">
          <span class="step-number">Step ${i + 1}</span>
          <span class="step-operation">${step.operation}</span>
        </div>
        <div class="step-ra">${step.ra}</div>
        <div class="step-sql">
          <pre><code>${step.sql}</code></pre>
        </div>
        <div class="step-result">
          <h5>Intermediate Result</h5>
          ${this.renderResultTable(step.result)}
        </div>
      </div>
    `).join('');
  }
  
  generateExecutionSteps(node, steps = []) {
    // Post-order traversal: children first, then parent
    if (node.children) {
      node.children.forEach(child => this.generateExecutionSteps(child, steps));
    }
    
    const step = {
      operation: node.type === 'table' ? 'Table Scan' : this.operators[node.type]?.name || node.type,
      ra: this.generateRANotation(node),
      sql: this.generateSQL(node),
      result: this.simulateExecution(node)
    };
    
    steps.push(step);
    return steps;
  }
  
  simulateExecution(node) {
    // Simulate result data for visualization
    if (node.type === 'table') {
      return {
        columns: node.columns,
        rows: node.data.slice(0, 5) // Show first 5 rows
      };
    }
    
    // For operators, return simulated reduced result
    return {
      columns: ['Result'],
      rows: [['(Intermediate result)']]
    };
  }
  
  renderResultTable(result) {
    if (!result || !result.columns) return '';
    
    return `
      <table class="result-table">
        <thead>
          <tr>${result.columns.map(c => `<th>${c}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${result.rows.map(row => `
            <tr>${row.map(cell => `<td>${cell ?? 'NULL'}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
  
  runExecutionAnimation() {
    if (!this.isAnimating) return;
    
    const steps = this.container.querySelectorAll('.exec-step');
    if (this.executionStep >= steps.length) {
      this.isAnimating = false;
      return;
    }
    
    steps.forEach((s, i) => {
      s.style.display = i === this.executionStep ? 'block' : 'none';
    });
    
    this.container.querySelector('#current-step').textContent = this.executionStep + 1;
    this.executionStep++;
    
    setTimeout(() => this.runExecutionAnimation(), 2000);
  }
  
  nextExecutionStep() {
    const steps = this.container.querySelectorAll('.exec-step');
    if (this.executionStep < steps.length - 1) {
      this.executionStep++;
      steps.forEach((s, i) => {
        s.style.display = i === this.executionStep ? 'block' : 'none';
      });
      this.container.querySelector('#current-step').textContent = this.executionStep + 1;
    }
  }
  
  prevExecutionStep() {
    const steps = this.container.querySelectorAll('.exec-step');
    if (this.executionStep > 0) {
      this.executionStep--;
      steps.forEach((s, i) => {
        s.style.display = i === this.executionStep ? 'block' : 'none';
      });
      this.container.querySelector('#current-step').textContent = this.executionStep + 1;
    }
  }
  
  // ==================== PRACTICE MODE ====================
  
  switchView(view) {
    this.container.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    this.container.querySelector('#builder-view').style.display = view === 'builder' ? 'block' : 'none';
    this.container.querySelector('#practice-view').style.display = view === 'practice' ? 'block' : 'none';
  }
  
  switchChallengeType(type) {
    this.container.querySelectorAll('.challenge-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.challengeType === type);
    });
    
    this.container.querySelector('#challenges-list').innerHTML = this.renderChallengesList(type);
  }
  
  loadChallenge(challengeId) {
    const allChallenges = [...this.challenges.ra_to_sql, ...this.challenges.sql_to_ra];
    this.currentChallenge = allChallenges.find(c => c.id === challengeId);
    
    if (!this.currentChallenge) return;
    
    const isRAToSQL = this.challenges.ra_to_sql.some(c => c.id === challengeId);
    
    this.container.querySelector('#challenge-area').innerHTML = `
      <div class="challenge-detail">
        <div class="challenge-header">
          <h4>${this.currentChallenge.name}</h4>
          <span class="challenge-type">${isRAToSQL ? 'RA → SQL' : 'SQL → RA'}</span>
        </div>
        
        <div class="challenge-prompt">
          <div class="prompt-section">
            <h5>Given:</h5>
            <div class="given-code">${isRAToSQL ? this.currentChallenge.ra : this.currentChallenge.sql}</div>
          </div>
          
          <div class="prompt-section">
            <h5>Your Answer:</h5>
            ${!isRAToSQL ? this.renderRASymbolToolbar() : ''}
            <textarea id="challenge-answer" rows="4" placeholder="${isRAToSQL ? 'Write the SQL equivalent...' : 'Write the RA expression...'}"></textarea>
          </div>
          
          <div class="challenge-actions">
            <button id="btn-check-challenge" class="btn-primary">Check Answer</button>
            <button id="btn-show-hint" class="btn-secondary">Show Hint</button>
            <button id="btn-give-up" class="btn-tertiary">Show Answer</button>
          </div>
        </div>
        
        <div class="challenge-feedback" id="challenge-feedback"></div>
        
        <div class="challenge-hint" id="challenge-hint" style="display: none;">
          <strong>Hint:</strong> ${this.currentChallenge.hint}
        </div>
        
        <div class="challenge-answer" id="challenge-answer-reveal" style="display: none;">
          <h5>Answer:</h5>
          <div class="answer-code">${isRAToSQL ? this.currentChallenge.sql : this.currentChallenge.ra}</div>
        </div>
      </div>
    `;
    
    // Attach handlers
    this.container.querySelector('#btn-check-challenge')?.addEventListener('click', () => this.checkChallenge());
    this.container.querySelector('#btn-show-hint')?.addEventListener('click', () => this.showHint());
    this.container.querySelector('#btn-give-up')?.addEventListener('click', () => this.showAnswer());
    
    // RA symbol toolbar handlers
    this.container.querySelectorAll('.ra-symbol-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const symbol = e.target.dataset.symbol;
        const textarea = this.container.querySelector('#challenge-answer');
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = textarea.value;
          textarea.value = text.substring(0, start) + symbol + text.substring(end);
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = start + symbol.length;
        }
      });
    });
  }
  
  checkChallenge() {
    if (!this.currentChallenge) return;
    
    const userAnswer = this.container.querySelector('#challenge-answer')?.value?.trim() || '';
    const isRAToSQL = this.challenges.ra_to_sql.some(c => c.id === this.currentChallenge.id);
    const expectedAnswer = isRAToSQL ? this.currentChallenge.sql : this.currentChallenge.ra;
    
    // Normalize answers for comparison
    const normalize = (str) => str.toLowerCase().replace(/\s+/g, ' ').trim();
    const isCorrect = normalize(userAnswer) === normalize(expectedAnswer);
    
    const feedback = this.container.querySelector('#challenge-feedback');
    if (isCorrect) {
      feedback.innerHTML = '<div class="feedback-success">✓ Correct! Well done!</div>';
    } else {
      feedback.innerHTML = '<div class="feedback-error">✗ Not quite. Check your syntax and try again.</div>';
    }
  }
  
  showHint() {
    this.container.querySelector('#challenge-hint').style.display = 'block';
  }
  
  showAnswer() {
    this.container.querySelector('#challenge-answer-reveal').style.display = 'block';
  }
  
  // ==================== UTILITY METHODS ====================
  
  previewTable(tableName) {
    const table = this.tables[tableName];
    if (!table) return;
    
    const preview = this.container.querySelector('#table-preview');
    const cardsHtml = table.data.slice(0, 3).map((row, idx) => {
      const fieldsHtml = table.columns.map((col, colIdx) => `
        <div class="preview-card-field">
          <span class="preview-card-label">${col}:</span>
          <span class="preview-card-value">${row[colIdx] ?? 'NULL'}</span>
        </div>
      `).join('');
      
      return `
        <div class="preview-card">
          <div class="preview-card-header">Row ${idx + 1}</div>
          <div class="preview-card-row">
            ${fieldsHtml}
          </div>
        </div>
      `;
    }).join('');
    
    const moreRowsHtml = table.data.length > 3 ? `
      <div class="preview-card" style="text-align: center; color: var(--text-muted); padding: 0.75rem;">
        ... and ${table.data.length - 3} more rows
      </div>
    ` : '';
    
    preview.innerHTML = `
      <div class="preview-header">
        <strong>${tableName}</strong> (${table.data.length} rows)
      </div>
      <div class="preview-table-container">
        <div class="preview-cards">
          ${cardsHtml}
          ${moreRowsHtml}
        </div>
      </div>
    `;
  }
  
  copyToClipboard(targetId) {
    const element = this.container.querySelector(`#${targetId}`);
    if (!element) return;
    
    const text = element.textContent || element.innerText;
    navigator.clipboard.writeText(text).then(() => {
      this.showMessage('Copied to clipboard!');
    });
  }
  
  toggleHelp() {
    const help = this.container.querySelector('#help-content');
    help.style.display = help.style.display === 'none' ? 'block' : 'none';
  }
  
  showMessage(msg) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'ra-toast';
    toast.textContent = msg;
    this.container.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
  }
  
  // ==================== SQL TO RA CONVERSION ====================
  
  convertSQLToRA() {
    const sqlInput = this.container.querySelector('#sql-input')?.value?.trim();
    
    if (!sqlInput) {
      this.showMessage('Please enter a SQL query first');
      return;
    }
    
    try {
      const result = this.parseSQLToRA(sqlInput);
      if (result) {
        this.queryTree = result;
        this.selectedNode = result.id;
        this.renderQueryTree();
        this.renderConfiguration(result);
        this.updateDualView();
        this.showMessage('SQL converted to RA! Check the query tree.');
      } else {
        this.showMessage('Could not parse SQL. Try a simpler query.');
      }
    } catch (e) {
      this.showMessage('Error parsing SQL: ' + e.message);
    }
  }
  
  parseSQLToRA(sql) {
    // Simple SQL parser for basic SELECT statements
    // Remove extra whitespace and normalize
    const normalized = sql.replace(/\s+/g, ' ').trim();
    
    // Check if it's a SELECT statement
    if (!/^SELECT/i.test(normalized)) {
      this.showMessage('Only SELECT statements are supported');
      return null;
    }
    
    // Extract components using regex
    const selectMatch = normalized.match(/SELECT\s+(.*?)\s+FROM/i);
    const fromMatch = normalized.match(/FROM\s+(\w+)(?:\s+AS\s+(\w+))?/i);
    const whereMatch = normalized.match(/WHERE\s+(.+?)(?:ORDER|GROUP|HAVING|$)/i);
    const joinMatch = normalized.match(/JOIN\s+(\w+)\s+ON\s+(.+?)(?:JOIN|WHERE|ORDER|GROUP|$)/i);
    
    if (!fromMatch) {
      this.showMessage('Could not find FROM clause');
      return null;
    }
    
    let currentNode = null;
    this.currentNodeId = 0;
    
    // Start with the base table
    const tableName = fromMatch[1];
    const table = this.tables[tableName];
    
    if (!table) {
      this.showMessage(`Table "${tableName}" not found in sample database`);
      return null;
    }
    
    currentNode = {
      id: ++this.currentNodeId,
      type: 'table',
      name: tableName,
      columns: [...table.columns],
      data: table.data,
      children: []
    };
    
    // Handle JOIN if present
    if (joinMatch) {
      const joinTableName = joinMatch[1];
      const joinCondition = joinMatch[2].trim();
      const joinTable = this.tables[joinTableName];
      
      if (joinTable) {
        const rightTableNode = {
          id: ++this.currentNodeId,
          type: 'table',
          name: joinTableName,
          columns: [...joinTable.columns],
          data: joinTable.data,
          children: []
        };
        
        currentNode = {
          id: ++this.currentNodeId,
          type: 'join',
          symbol: this.operators.join.symbol,
          name: 'Join',
          config: { condition: joinCondition },
          children: [currentNode, rightTableNode]
        };
      }
    }
    
    // Handle WHERE clause (Selection)
    if (whereMatch) {
      const condition = whereMatch[1].trim();
      currentNode = {
        id: ++this.currentNodeId,
        type: 'sigma',
        symbol: this.operators.sigma.symbol,
        name: 'Selection',
        config: { condition: condition },
        children: [currentNode]
      };
    }
    
    // Handle SELECT clause (Projection)
    if (selectMatch) {
      const attrs = selectMatch[1].trim();
      if (attrs !== '*') {
        currentNode = {
          id: ++this.currentNodeId,
          type: 'pi',
          symbol: this.operators.pi.symbol,
          name: 'Projection',
          config: { attributes: attrs },
          children: [currentNode]
        };
      }
    }
    
    return currentNode;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-simulator="ra-simulator"]');
  containers.forEach(container => {
    new RASimulator(container.id);
  });
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RASimulator;
}
