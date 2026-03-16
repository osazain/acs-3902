/**
 * DDL Schema Builder Simulator
 * ACS-3902 Database Systems - Midterm 2 Prep
 * 
 * Features:
 * - Visual Schema Designer with drag-drop tables
 * - Table and column builder interface
 * - Constraint builder (PK, FK, UNIQUE, CHECK, DEFAULT)
 * - Real-time SQL generation with syntax highlighting
 * - Sample scenarios (Student-Course, Employee-Department, Product-Order)
 * - Educational tooltips and best practices hints
 */

class SchemaBuilder {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.tables = [];
    this.currentTable = null;
    this.selectedScenario = null;
    this.dataTypes = [
      { value: 'INTEGER', label: 'INTEGER', hasLength: false },
      { value: 'SERIAL', label: 'SERIAL (Auto-increment)', hasLength: false },
      { value: 'VARCHAR', label: 'VARCHAR', hasLength: true, defaultLength: 50 },
      { value: 'CHAR', label: 'CHAR', hasLength: true, defaultLength: 10 },
      { value: 'TEXT', label: 'TEXT', hasLength: false },
      { value: 'DATE', label: 'DATE', hasLength: false },
      { value: 'TIMESTAMP', label: 'TIMESTAMP', hasLength: false },
      { value: 'BOOLEAN', label: 'BOOLEAN', hasLength: false },
      { value: 'DECIMAL', label: 'DECIMAL', hasLength: true, hasPrecision: true, defaultLength: 10, defaultPrecision: 2 },
      { value: 'NUMERIC', label: 'NUMERIC', hasLength: true, hasPrecision: true, defaultLength: 10, defaultPrecision: 2 },
      { value: 'FLOAT', label: 'FLOAT', hasLength: false },
      { value: 'DOUBLE', label: 'DOUBLE PRECISION', hasLength: false }
    ];
    this.onDeleteActions = ['NO ACTION', 'CASCADE', 'SET NULL', 'SET DEFAULT', 'RESTRICT'];
    this.onUpdateActions = ['NO ACTION', 'CASCADE', 'SET NULL', 'SET DEFAULT', 'RESTRICT'];
    this.init();
  }

  init() {
    this.renderInterface();
    this.attachEventListeners();
    this.updateSQLPreview();
  }

  renderInterface() {
    this.container.innerHTML = `
      <div class="schema-builder">
        <!-- Header -->
        <div class="builder-header">
          <h3>🗄️ DDL Schema Builder</h3>
          <p class="builder-subtitle">Design database schemas with CREATE TABLE statements and constraints</p>
        </div>

        <!-- DDL Import Section -->
        <div class="ddl-import-section">
          <div class="import-header">
            <h4>📤 Import DDL SQL</h4>
            <button id="btn-import-ddl" class="btn-import">📁 Import</button>
          </div>
          <div class="import-container">
            <textarea id="ddl-import-input" class="ddl-textarea" placeholder="Paste your CREATE TABLE statements here...

Example:
CREATE TABLE Student (
    student_id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE
);"></textarea>
            <div class="import-actions">
              <button id="btn-parse-ddl" class="btn-action btn-parse">🔍 Parse & Validate</button>
              <button id="btn-autofix-ddl" class="btn-action btn-autofix">🔧 Auto-Fix Issues</button>
              <button id="btn-clear-ddl" class="btn-action btn-clear">❌ Clear</button>
            </div>
          </div>
          <!-- Validation Results Panel -->
          <div class="validation-panel" id="validation-panel" style="display: none;">
            <div class="validation-header">
              <h5>Validation Results</h5>
              <span class="validation-summary" id="validation-summary"></span>
            </div>
            <div class="validation-issues" id="validation-issues"></div>
          </div>
        </div>

        <!-- Scenario Selector -->
        <div class="scenario-section">
          <h4>📋 Sample Scenarios</h4>
          <div class="scenario-cards">
            <div class="scenario-card" data-scenario="student-course">
              <div class="scenario-icon">🎓</div>
              <div class="scenario-info">
                <div class="scenario-name">Student-Course Enrollment</div>
                <div class="scenario-desc">Students, Courses, and Enrollment tables</div>
              </div>
            </div>
            <div class="scenario-card" data-scenario="employee-dept">
              <div class="scenario-icon">👔</div>
              <div class="scenario-info">
                <div class="scenario-name">Employee-Department</div>
                <div class="scenario-desc">Company organization with departments</div>
              </div>
            </div>
            <div class="scenario-card" data-scenario="product-order">
              <div class="scenario-icon">📦</div>
              <div class="scenario-info">
                <div class="scenario-name">Product-Order System</div>
                <div class="scenario-desc">E-commerce with orders and products</div>
              </div>
            </div>
            <div class="scenario-card" data-scenario="blank">
              <div class="scenario-icon">📝</div>
              <div class="scenario-info">
                <div class="scenario-name">Blank Schema</div>
                <div class="scenario-desc">Start from scratch</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Workspace -->
        <div class="builder-workspace">
          <!-- Left Panel: Table List -->
          <div class="tables-panel">
            <div class="panel-header">
              <h4>Tables</h4>
              <button id="btn-add-table" class="btn-icon" title="Add Table">+</button>
            </div>
            <div class="tables-list" id="tables-list">
              <div class="empty-state">No tables yet. Click + to add one.</div>
            </div>
          </div>

          <!-- Center Panel: Table Designer -->
          <div class="designer-panel">
            <div id="table-designer">
              <div class="empty-designer">
                <div class="empty-icon">🗃️</div>
                <p>Select a table or create a new one to start designing</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Section: SQL Preview + Schema Diagram -->
        <div class="builder-bottom-section">
          <!-- SQL Preview Panel -->
          <div class="sql-panel">
            <div class="panel-header">
              <h4>Generated SQL</h4>
              <button id="btn-copy-sql" class="btn-small" title="Copy to Clipboard">📋 Copy</button>
            </div>
            <div class="sql-preview-container">
              <pre class="sql-code-block" id="sql-preview"><code>-- Your CREATE TABLE statements will appear here</code></pre>
            </div>
            <div class="validation-status" id="validation-status">
              <span class="status-icon">✓</span>
              <span class="status-text">Schema is valid</span>
            </div>
          </div>

          <!-- Visual Schema Diagram -->
          <div class="schema-diagram-section">
            <h4>📐 Schema Diagram</h4>
            <div class="schema-diagram" id="schema-diagram">
              <div class="diagram-placeholder">Tables will appear here as you create them</div>
            </div>
          </div>
        </div>

        <!-- Educational Panel -->
        <div class="education-panel">
          <h4>📚 Constraint Reference</h4>
          <div class="constraint-reference">
            <div class="ref-card" data-constraint="pk">
              <div class="ref-icon">🔑</div>
              <div class="ref-title">PRIMARY KEY</div>
              <div class="ref-desc">Uniquely identifies each row. Cannot be NULL.</div>
            </div>
            <div class="ref-card" data-constraint="fk">
              <div class="ref-icon">🔗</div>
              <div class="ref-title">FOREIGN KEY</div>
              <div class="ref-desc">Links to PRIMARY KEY in another table.</div>
            </div>
            <div class="ref-card" data-constraint="unique">
              <div class="ref-icon">✨</div>
              <div class="ref-title">UNIQUE</div>
              <div class="ref-desc">Ensures all values in a column are different.</div>
            </div>
            <div class="ref-card" data-constraint="notnull">
              <div class="ref-icon">⚠️</div>
              <div class="ref-title">NOT NULL</div>
              <div class="ref-desc">Column must have a value.</div>
            </div>
            <div class="ref-card" data-constraint="check">
              <div class="ref-icon">✓</div>
              <div class="ref-title">CHECK</div>
              <div class="ref-desc">Ensures values satisfy a condition.</div>
            </div>
            <div class="ref-card" data-constraint="default">
              <div class="ref-icon">🔄</div>
              <div class="ref-title">DEFAULT</div>
              <div class="ref-desc">Sets a default value if none provided.</div>
            </div>
          </div>
        </div>

        <!-- Tips Section -->
        <div class="tips-section">
          <h4>💡 Best Practices</h4>
          <div class="tips-grid" id="tips-grid">
            <div class="tip-item">
              <span class="tip-check">✓</span>
              <span>Always define a PRIMARY KEY for every table</span>
            </div>
            <div class="tip-item">
              <span class="tip-check">✓</span>
              <span>Use meaningful table and column names</span>
            </div>
            <div class="tip-item">
              <span class="tip-check">✓</span>
              <span>Choose appropriate data types for efficiency</span>
            </div>
            <div class="tip-item">
              <span class="tip-check">✓</span>
              <span>Use FOREIGN KEYs to maintain referential integrity</span>
            </div>
            <div class="tip-item">
              <span class="tip-check">✓</span>
              <span>Add CHECK constraints to validate data</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Scenario selection
    this.container.querySelectorAll('.scenario-card').forEach(card => {
      card.addEventListener('click', () => this.loadScenario(card.dataset.scenario));
    });

    // Add table button
    this.container.querySelector('#btn-add-table')?.addEventListener('click', () => this.addTable());

    // Copy SQL button
    this.container.querySelector('#btn-copy-sql')?.addEventListener('click', () => this.copySQL());

    // Constraint reference cards
    this.container.querySelectorAll('.ref-card').forEach(card => {
      card.addEventListener('click', () => this.showConstraintDetails(card.dataset.constraint));
    });

    // DDL Import buttons
    this.container.querySelector('#btn-parse-ddl')?.addEventListener('click', () => this.parseDDL());
    this.container.querySelector('#btn-autofix-ddl')?.addEventListener('click', () => this.autoFixDDL());
    this.container.querySelector('#btn-clear-ddl')?.addEventListener('click', () => this.clearDDL());
    this.container.querySelector('#btn-import-ddl')?.addEventListener('click', () => {
      const input = this.container.querySelector('#ddl-import-input');
      input?.focus();
      input?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  loadScenario(scenarioId) {
    this.selectedScenario = scenarioId;
    
    // Update UI selection
    this.container.querySelectorAll('.scenario-card').forEach(card => {
      card.classList.toggle('active', card.dataset.scenario === scenarioId);
    });

    if (scenarioId === 'blank') {
      this.tables = [];
      this.currentTable = null;
    } else if (scenarioId === 'student-course') {
      this.loadStudentCourseScenario();
    } else if (scenarioId === 'employee-dept') {
      this.loadEmployeeDeptScenario();
    } else if (scenarioId === 'product-order') {
      this.loadProductOrderScenario();
    }

    this.renderTablesList();
    this.renderTableDesigner();
    this.updateSQLPreview();
    this.renderSchemaDiagram();
  }

  loadStudentCourseScenario() {
    this.tables = [
      {
        id: 'student',
        name: 'Student',
        columns: [
          { name: 'student_id', dataType: 'INTEGER', length: '', precision: '', constraints: { pk: true, notNull: true, unique: false }, default: '', check: '' },
          { name: 'first_name', dataType: 'VARCHAR', length: '50', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: '', check: '' },
          { name: 'last_name', dataType: 'VARCHAR', length: '50', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: '', check: '' },
          { name: 'email', dataType: 'VARCHAR', length: '100', precision: '', constraints: { pk: false, notNull: true, unique: true }, default: '', check: '' },
          { name: 'enrollment_date', dataType: 'DATE', length: '', precision: '', constraints: { pk: false, notNull: false, unique: false }, default: 'CURRENT_DATE', check: '' },
          { name: 'gpa', dataType: 'DECIMAL', length: '3', precision: '2', constraints: { pk: false, notNull: false, unique: false }, default: '', check: 'gpa >= 0 AND gpa <= 4.0' }
        ],
        foreignKeys: []
      },
      {
        id: 'course',
        name: 'Course',
        columns: [
          { name: 'course_id', dataType: 'INTEGER', length: '', precision: '', constraints: { pk: true, notNull: true, unique: false }, default: '', check: '' },
          { name: 'course_code', dataType: 'VARCHAR', length: '10', precision: '', constraints: { pk: false, notNull: true, unique: true }, default: '', check: '' },
          { name: 'course_name', dataType: 'VARCHAR', length: '100', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: '', check: '' },
          { name: 'credits', dataType: 'INTEGER', length: '', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: '3', check: 'credits > 0' },
          { name: 'department', dataType: 'VARCHAR', length: '50', precision: '', constraints: { pk: false, notNull: false, unique: false }, default: '', check: '' }
        ],
        foreignKeys: []
      },
      {
        id: 'enrollment',
        name: 'Enrollment',
        columns: [
          { name: 'enrollment_id', dataType: 'SERIAL', length: '', precision: '', constraints: { pk: true, notNull: true, unique: false }, default: '', check: '' },
          { name: 'student_id', dataType: 'INTEGER', length: '', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: '', check: '' },
          { name: 'course_id', dataType: 'INTEGER', length: '', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: '', check: '' },
          { name: 'semester', dataType: 'VARCHAR', length: '20', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: '', check: '' },
          { name: 'grade', dataType: 'VARCHAR', length: '2', precision: '', constraints: { pk: false, notNull: false, unique: false }, default: '', check: "grade IN ('A', 'B', 'C', 'D', 'F', 'IP')" }
        ],
        foreignKeys: [
          { column: 'student_id', refTable: 'Student', refColumn: 'student_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' },
          { column: 'course_id', refTable: 'Course', refColumn: 'course_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' }
        ]
      }
    ];
    this.currentTable = this.tables[0];
  }

  loadEmployeeDeptScenario() {
    this.tables = [
      {
        id: 'department',
        name: 'Department',
        columns: [
          { name: 'dept_id', dataType: 'INTEGER', length: '', precision: '', constraints: { pk: true, notNull: true, unique: false }, default: '', check: '' },
          { name: 'dept_name', dataType: 'VARCHAR', length: '50', precision: '', constraints: { pk: false, notNull: true, unique: true }, default: '', check: '' },
          { name: 'location', dataType: 'VARCHAR', length: '100', precision: '', constraints: { pk: false, notNull: false, unique: false }, default: '', check: '' },
          { name: 'budget', dataType: 'DECIMAL', length: '12', precision: '2', constraints: { pk: false, notNull: false, unique: false }, default: '0', check: 'budget >= 0' }
        ],
        foreignKeys: []
      },
      {
        id: 'employee',
        name: 'Employee',
        columns: [
          { name: 'emp_id', dataType: 'INTEGER', length: '', precision: '', constraints: { pk: true, notNull: true, unique: false }, default: '', check: '' },
          { name: 'first_name', dataType: 'VARCHAR', length: '50', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: '', check: '' },
          { name: 'last_name', dataType: 'VARCHAR', length: '50', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: '', check: '' },
          { name: 'email', dataType: 'VARCHAR', length: '100', precision: '', constraints: { pk: false, notNull: true, unique: true }, default: '', check: '' },
          { name: 'salary', dataType: 'DECIMAL', length: '10', precision: '2', constraints: { pk: false, notNull: true, unique: false }, default: '', check: 'salary > 0' },
          { name: 'hire_date', dataType: 'DATE', length: '', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: '', check: '' },
          { name: 'dept_id', dataType: 'INTEGER', length: '', precision: '', constraints: { pk: false, notNull: false, unique: false }, default: '', check: '' },
          { name: 'manager_id', dataType: 'INTEGER', length: '', precision: '', constraints: { pk: false, notNull: false, unique: false }, default: '', check: '' }
        ],
        foreignKeys: [
          { column: 'dept_id', refTable: 'Department', refColumn: 'dept_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' },
          { column: 'manager_id', refTable: 'Employee', refColumn: 'emp_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' }
        ]
      }
    ];
    this.currentTable = this.tables[0];
  }

  loadProductOrderScenario() {
    this.tables = [
      {
        id: 'customer',
        name: 'Customer',
        columns: [
          { name: 'customer_id', dataType: 'SERIAL', length: '', precision: '', constraints: { pk: true, notNull: true, unique: false }, default: '', check: '' },
          { name: 'customer_name', dataType: 'VARCHAR', length: '100', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: '', check: '' },
          { name: 'email', dataType: 'VARCHAR', length: '100', precision: '', constraints: { pk: false, notNull: true, unique: true }, default: '', check: '' },
          { name: 'phone', dataType: 'VARCHAR', length: '20', precision: '', constraints: { pk: false, notNull: false, unique: false }, default: '', check: '' },
          { name: 'address', dataType: 'TEXT', length: '', precision: '', constraints: { pk: false, notNull: false, unique: false }, default: '', check: '' }
        ],
        foreignKeys: []
      },
      {
        id: 'product',
        name: 'Product',
        columns: [
          { name: 'product_id', dataType: 'INTEGER', length: '', precision: '', constraints: { pk: true, notNull: true, unique: false }, default: '', check: '' },
          { name: 'product_name', dataType: 'VARCHAR', length: '100', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: '', check: '' },
          { name: 'description', dataType: 'TEXT', length: '', precision: '', constraints: { pk: false, notNull: false, unique: false }, default: '', check: '' },
          { name: 'price', dataType: 'DECIMAL', length: '10', precision: '2', constraints: { pk: false, notNull: true, unique: false }, default: '', check: 'price >= 0' },
          { name: 'stock_quantity', dataType: 'INTEGER', length: '', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: '0', check: 'stock_quantity >= 0' },
          { name: 'category', dataType: 'VARCHAR', length: '50', precision: '', constraints: { pk: false, notNull: false, unique: false }, default: '', check: '' }
        ],
        foreignKeys: []
      },
      {
        id: 'order',
        name: 'Order',
        columns: [
          { name: 'order_id', dataType: 'INTEGER', length: '', precision: '', constraints: { pk: true, notNull: true, unique: false }, default: '', check: '' },
          { name: 'customer_id', dataType: 'INTEGER', length: '', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: '', check: '' },
          { name: 'order_date', dataType: 'TIMESTAMP', length: '', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: 'CURRENT_TIMESTAMP', check: '' },
          { name: 'status', dataType: 'VARCHAR', length: '20', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: 'Pending', check: "status IN ('Pending', 'Shipped', 'Delivered', 'Cancelled')" },
          { name: 'total_amount', dataType: 'DECIMAL', length: '10', precision: '2', constraints: { pk: false, notNull: true, unique: false }, default: '0', check: 'total_amount >= 0' }
        ],
        foreignKeys: [
          { column: 'customer_id', refTable: 'Customer', refColumn: 'customer_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
        ]
      },
      {
        id: 'orderitem',
        name: 'OrderItem',
        columns: [
          { name: 'item_id', dataType: 'SERIAL', length: '', precision: '', constraints: { pk: true, notNull: true, unique: false }, default: '', check: '' },
          { name: 'order_id', dataType: 'INTEGER', length: '', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: '', check: '' },
          { name: 'product_id', dataType: 'INTEGER', length: '', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: '', check: '' },
          { name: 'quantity', dataType: 'INTEGER', length: '', precision: '', constraints: { pk: false, notNull: true, unique: false }, default: '1', check: 'quantity > 0' },
          { name: 'unit_price', dataType: 'DECIMAL', length: '10', precision: '2', constraints: { pk: false, notNull: true, unique: false }, default: '', check: 'unit_price >= 0' }
        ],
        foreignKeys: [
          { column: 'order_id', refTable: 'Order', refColumn: 'order_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' },
          { column: 'product_id', refTable: 'Product', refColumn: 'product_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
        ]
      }
    ];
    this.currentTable = this.tables[0];
  }

  addTable() {
    const tableName = prompt('Enter table name:');
    if (!tableName || !tableName.trim()) return;

    // Check for duplicates
    if (this.tables.find(t => t.name.toLowerCase() === tableName.toLowerCase())) {
      alert('A table with this name already exists!');
      return;
    }

    const newTable = {
      id: 'table_' + Date.now(),
      name: tableName.trim(),
      columns: [],
      foreignKeys: []
    };

    this.tables.push(newTable);
    this.currentTable = newTable;
    this.renderTablesList();
    this.renderTableDesigner();
    this.updateSQLPreview();
    this.renderSchemaDiagram();
  }

  deleteTable(tableId) {
    if (!confirm('Are you sure you want to delete this table?')) return;
    
    this.tables = this.tables.filter(t => t.id !== tableId);
    
    // Remove FKs referencing this table
    this.tables.forEach(t => {
      t.foreignKeys = t.foreignKeys.filter(fk => fk.refTable !== this.getTableName(tableId));
    });
    
    if (this.currentTable?.id === tableId) {
      this.currentTable = this.tables[0] || null;
    }
    
    this.renderTablesList();
    this.renderTableDesigner();
    this.updateSQLPreview();
    this.renderSchemaDiagram();
  }

  getTableName(tableId) {
    const table = this.tables.find(t => t.id === tableId);
    return table?.name || '';
  }

  selectTable(tableId) {
    this.currentTable = this.tables.find(t => t.id === tableId) || null;
    this.renderTablesList();
    this.renderTableDesigner();
  }

  renderTablesList() {
    const listContainer = this.container.querySelector('#tables-list');
    
    if (this.tables.length === 0) {
      listContainer.innerHTML = '<div class="empty-state">No tables yet. Click + to add one.</div>';
      return;
    }

    listContainer.innerHTML = this.tables.map(table => `
      <div class="table-item ${this.currentTable?.id === table.id ? 'active' : ''}" data-table-id="${table.id}">
        <div class="table-item-info" onclick="window.schemaBuilder.selectTable('${table.id}')">
          <span class="table-icon">🗃️</span>
          <span class="table-name">${this.escapeHtml(table.name)}</span>
          <span class="table-count">${table.columns.length} cols</span>
        </div>
        <button class="btn-delete-table" onclick="event.stopPropagation(); window.schemaBuilder.deleteTable('${table.id}')" title="Delete Table">×</button>
      </div>
    `).join('');
  }

  renderTableDesigner() {
    const designer = this.container.querySelector('#table-designer');
    
    if (!this.currentTable) {
      designer.innerHTML = `
        <div class="empty-designer">
          <div class="empty-icon">🗃️</div>
          <p>Select a table or create a new one to start designing</p>
        </div>
      `;
      return;
    }

    const table = this.currentTable;
    
    designer.innerHTML = `
      <div class="table-designer-content">
        <div class="designer-header">
          <div class="table-name-input">
            <label>Table Name:</label>
            <input type="text" id="table-name" value="${this.escapeHtml(table.name)}" 
                   onchange="window.schemaBuilder.updateTableName(this.value)">
          </div>
        </div>

        <div class="columns-section">
          <div class="section-header">
            <h5>Columns</h5>
            <button id="btn-add-column" class="btn-small" onclick="window.schemaBuilder.addColumn()">+ Add Column</button>
          </div>
          
          <div class="columns-table-container">
            <table class="columns-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Data Type</th>
                  <th>Length/ Precision</th>
                  <th>Constraints</th>
                  <th>Default</th>
                  <th>Check</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${table.columns.map((col, index) => this.renderColumnRow(col, index)).join('')}
              </tbody>
            </table>
          </div>
          
          ${table.columns.length === 0 ? '<div class="empty-columns">No columns yet. Click "Add Column" to start.</div>' : ''}
        </div>

        <div class="foreign-keys-section">
          <div class="section-header">
            <h5>Foreign Keys</h5>
            <button id="btn-add-fk" class="btn-small" onclick="window.schemaBuilder.addForeignKey()">+ Add Foreign Key</button>
          </div>
          
          <div class="foreign-keys-list">
            ${table.foreignKeys.map((fk, index) => this.renderForeignKeyRow(fk, index)).join('')}
          </div>
          
          ${table.foreignKeys.length === 0 ? '<div class="empty-fks">No foreign keys defined yet.</div>' : ''}
        </div>
      </div>
    `;
  }

  renderColumnRow(col, index) {
    const dataType = this.dataTypes.find(dt => dt.value === col.dataType) || this.dataTypes[0];
    
    return `
      <tr class="column-row" data-column-index="${index}">
        <td>
          <input type="text" class="col-name-input" value="${this.escapeHtml(col.name)}"
                 onchange="window.schemaBuilder.updateColumn(${index}, 'name', this.value)">
        </td>
        <td>
          <select class="col-type-select" onchange="window.schemaBuilder.updateColumn(${index}, 'dataType', this.value)">
            ${this.dataTypes.map(dt => `
              <option value="${dt.value}" ${col.dataType === dt.value ? 'selected' : ''}>${dt.label}</option>
            `).join('')}
          </select>
        </td>
        <td>
          ${dataType.hasLength ? `
            <input type="number" class="col-length-input" value="${col.length || dataType.defaultLength || ''}"
                   placeholder="Length" onchange="window.schemaBuilder.updateColumn(${index}, 'length', this.value)">
          ` : ''}
          ${dataType.hasPrecision ? `
            <input type="number" class="col-precision-input" value="${col.precision || dataType.defaultPrecision || ''}"
                   placeholder="Dec" onchange="window.schemaBuilder.updateColumn(${index}, 'precision', this.value)">
          ` : ''}
        </td>
        <td>
          <div class="constraint-checkboxes">
            <label class="constraint-label ${col.constraints.pk ? 'active' : ''}" title="Primary Key">
              <input type="checkbox" ${col.constraints.pk ? 'checked' : ''}
                     onchange="window.schemaBuilder.updateColumnConstraint(${index}, 'pk', this.checked)"> 🔑
            </label>
            <label class="constraint-label ${col.constraints.notNull ? 'active' : ''}" title="NOT NULL">
              <input type="checkbox" ${col.constraints.notNull ? 'checked' : ''}
                     onchange="window.schemaBuilder.updateColumnConstraint(${index}, 'notNull', this.checked)"> ⚠️
            </label>
            <label class="constraint-label ${col.constraints.unique ? 'active' : ''}" title="UNIQUE">
              <input type="checkbox" ${col.constraints.unique ? 'checked' : ''}
                     onchange="window.schemaBuilder.updateColumnConstraint(${index}, 'unique', this.checked)"> ✨
            </label>
          </div>
        </td>
        <td>
          <input type="text" class="col-default-input" value="${this.escapeHtml(col.default)}"
                 placeholder="e.g., 0, CURRENT_DATE"
                 onchange="window.schemaBuilder.updateColumn(${index}, 'default', this.value)">
        </td>
        <td>
          <input type="text" class="col-check-input" value="${this.escapeHtml(col.check)}"
                 placeholder="e.g., price > 0"
                 onchange="window.schemaBuilder.updateColumn(${index}, 'check', this.value)">
        </td>
        <td>
          <button class="btn-delete-col" onclick="window.schemaBuilder.deleteColumn(${index})" title="Remove Column">×</button>
        </td>
      </tr>
    `;
  }

  renderForeignKeyRow(fk, index) {
    const availableColumns = this.currentTable.columns.map(c => 
      `<option value="${c.name}" ${fk.column === c.name ? 'selected' : ''}>${this.escapeHtml(c.name)}</option>`
    ).join('');

    const availableTables = this.tables
      .filter(t => t.id !== this.currentTable.id)
      .map(t => `<option value="${t.name}" ${fk.refTable === t.name ? 'selected' : ''}>${this.escapeHtml(t.name)}</option>`)
      .join('');

    const refTable = this.tables.find(t => t.name === fk.refTable);
    const availableRefColumns = refTable 
      ? refTable.columns.filter(c => c.constraints.pk).map(c =>
          `<option value="${c.name}" ${fk.refColumn === c.name ? 'selected' : ''}>${this.escapeHtml(c.name)}</option>`
        ).join('')
      : '<option value="">Select a table first</option>';

    return `
      <div class="foreign-key-row" data-fk-index="${index}">
        <div class="fk-field">
          <label>Column:</label>
          <select onchange="window.schemaBuilder.updateForeignKey(${index}, 'column', this.value)">
            <option value="">Select column...</option>
            ${availableColumns}
          </select>
        </div>
        <div class="fk-arrow">→</div>
        <div class="fk-field">
          <label>References:</label>
          <select onchange="window.schemaBuilder.updateForeignKey(${index}, 'refTable', this.value)">
            <option value="">Select table...</option>
            ${availableTables}
          </select>
        </div>
        <div class="fk-field">
          <select onchange="window.schemaBuilder.updateForeignKey(${index}, 'refColumn', this.value)">
            <option value="">Select PK column...</option>
            ${availableRefColumns}
          </select>
        </div>
        <div class="fk-actions">
          <div class="fk-action-selects">
            <select onchange="window.schemaBuilder.updateForeignKey(${index}, 'onDelete', this.value)" title="ON DELETE">
              ${this.onDeleteActions.map(a => `<option value="${a}" ${fk.onDelete === a ? 'selected' : ''}>ON DELETE ${a}</option>`).join('')}
            </select>
            <select onchange="window.schemaBuilder.updateForeignKey(${index}, 'onUpdate', this.value)" title="ON UPDATE">
              ${this.onUpdateActions.map(a => `<option value="${a}" ${fk.onUpdate === a ? 'selected' : ''}>ON UPDATE ${a}</option>`).join('')}
            </select>
          </div>
          <button class="btn-delete-fk" onclick="window.schemaBuilder.deleteForeignKey(${index})" title="Remove FK">×</button>
        </div>
      </div>
    `;
  }

  addColumn() {
    if (!this.currentTable) return;
    
    const colName = prompt('Enter column name:');
    if (!colName || !colName.trim()) return;

    this.currentTable.columns.push({
      name: colName.trim(),
      dataType: 'VARCHAR',
      length: '50',
      precision: '',
      constraints: { pk: false, notNull: false, unique: false },
      default: '',
      check: ''
    });

    this.renderTableDesigner();
    this.updateSQLPreview();
    this.renderSchemaDiagram();
  }

  deleteColumn(index) {
    if (!this.currentTable) return;
    this.currentTable.columns.splice(index, 1);
    this.renderTableDesigner();
    this.updateSQLPreview();
    this.renderSchemaDiagram();
  }

  updateColumn(index, field, value) {
    if (!this.currentTable) return;
    this.currentTable.columns[index][field] = value;
    
    // If data type changed, update length/precision fields
    if (field === 'dataType') {
      const dataType = this.dataTypes.find(dt => dt.value === value);
      if (dataType) {
        if (!dataType.hasLength) this.currentTable.columns[index].length = '';
        if (!dataType.hasPrecision) this.currentTable.columns[index].precision = '';
      }
    }
    
    this.renderTableDesigner();
    this.updateSQLPreview();
    this.renderSchemaDiagram();
  }

  updateColumnConstraint(index, constraint, value) {
    if (!this.currentTable) return;
    this.currentTable.columns[index].constraints[constraint] = value;
    
    // PK implies NOT NULL and UNIQUE
    if (constraint === 'pk' && value) {
      this.currentTable.columns[index].constraints.notNull = true;
    }
    
    this.renderTableDesigner();
    this.updateSQLPreview();
    this.renderSchemaDiagram();
  }

  updateTableName(newName) {
    if (!this.currentTable || !newName.trim()) return;
    
    const oldName = this.currentTable.name;
    this.currentTable.name = newName.trim();
    
    // Update FK references to this table
    this.tables.forEach(t => {
      t.foreignKeys.forEach(fk => {
        if (fk.refTable === oldName) {
          fk.refTable = newName.trim();
        }
      });
    });
    
    this.renderTablesList();
    this.updateSQLPreview();
    this.renderSchemaDiagram();
  }

  addForeignKey() {
    if (!this.currentTable) return;
    
    // Check if there are other tables to reference
    const otherTables = this.tables.filter(t => t.id !== this.currentTable.id);
    if (otherTables.length === 0) {
      alert('Create another table with a PRIMARY KEY first!');
      return;
    }
    
    // Check if current table has columns
    if (this.currentTable.columns.length === 0) {
      alert('Add columns to this table first!');
      return;
    }

    this.currentTable.foreignKeys.push({
      column: this.currentTable.columns[0]?.name || '',
      refTable: otherTables[0]?.name || '',
      refColumn: '',
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION'
    });

    this.renderTableDesigner();
    this.updateSQLPreview();
    this.renderSchemaDiagram();
  }

  deleteForeignKey(index) {
    if (!this.currentTable) return;
    this.currentTable.foreignKeys.splice(index, 1);
    this.renderTableDesigner();
    this.updateSQLPreview();
    this.renderSchemaDiagram();
  }

  updateForeignKey(index, field, value) {
    if (!this.currentTable) return;
    this.currentTable.foreignKeys[index][field] = value;
    
    // If reference table changed, reset ref column
    if (field === 'refTable') {
      this.currentTable.foreignKeys[index].refColumn = '';
    }
    
    this.renderTableDesigner();
    this.updateSQLPreview();
    this.renderSchemaDiagram();
  }

  updateSQLPreview() {
    const preview = this.container.querySelector('#sql-preview');
    const validation = this.container.querySelector('#validation-status');
    
    if (this.tables.length === 0) {
      preview.innerHTML = '<code>-- Your CREATE TABLE statements will appear here</code>';
      validation.className = 'validation-status';
      validation.innerHTML = '<span class="status-icon">○</span><span class="status-text">No tables defined</span>';
      return;
    }

    let sql = '';
    const errors = [];

    this.tables.forEach(table => {
      sql += this.generateTableSQL(table, errors);
      sql += '\n\n';
    });

    // Syntax highlighting
    const highlighted = this.syntaxHighlight(sql.trim());
    preview.innerHTML = highlighted;

    // Update validation status
    if (errors.length === 0) {
      validation.className = 'validation-status valid';
      validation.innerHTML = '<span class="status-icon">✓</span><span class="status-text">Schema is valid</span>';
    } else {
      validation.className = 'validation-status invalid';
      validation.innerHTML = `<span class="status-icon">✗</span><span class="status-text">${errors.length} issue(s) found</span>`;
    }
  }

  generateTableSQL(table, errors) {
    if (!table.columns.length) {
      errors.push(`Table "${table.name}" has no columns`);
      return `-- Table "${table.name}" has no columns`;
    }

    // Check for primary key
    const hasPK = table.columns.some(c => c.constraints.pk);
    if (!hasPK) {
      errors.push(`Table "${table.name}" has no PRIMARY KEY`);
    }

    let sql = `CREATE TABLE ${table.name} (\n`;
    const columnDefs = [];

    table.columns.forEach(col => {
      let def = `    ${col.name} ${col.dataType}`;
      
      // Add length/precision
      if (col.length && col.precision) {
        def += `(${col.length}, ${col.precision})`;
      } else if (col.length) {
        def += `(${col.length})`;
      }

      // Add constraints
      if (col.constraints.pk) def += ' PRIMARY KEY';
      if (col.constraints.notNull && !col.constraints.pk) def += ' NOT NULL';
      if (col.constraints.unique && !col.constraints.pk) def += ' UNIQUE';
      if (col.default) def += ` DEFAULT ${col.default}`;
      if (col.check) def += ` CHECK (${col.check})`;

      columnDefs.push(def);
    });

    // Add foreign key constraints
    table.foreignKeys.forEach(fk => {
      if (fk.column && fk.refTable && fk.refColumn) {
        let fkDef = `    FOREIGN KEY (${fk.column}) REFERENCES ${fk.refTable}(${fk.refColumn})`;
        if (fk.onDelete && fk.onDelete !== 'NO ACTION') {
          fkDef += ` ON DELETE ${fk.onDelete}`;
        }
        if (fk.onUpdate && fk.onUpdate !== 'NO ACTION') {
          fkDef += ` ON UPDATE ${fk.onUpdate}`;
        }
        columnDefs.push(fkDef);
      } else {
        errors.push(`Table "${table.name}" has incomplete foreign key`);
      }
    });

    sql += columnDefs.join(',\n');
    sql += '\n);';

    return sql;
  }

  syntaxHighlight(sql) {
    return sql
      .replace(/(CREATE TABLE|PRIMARY KEY|FOREIGN KEY|REFERENCES|NOT NULL|UNIQUE|CHECK|DEFAULT|ON DELETE|ON UPDATE)/g, '<span class="sql-keyword">$1</span>')
      .replace(/(INTEGER|VARCHAR|CHAR|TEXT|DATE|TIMESTAMP|BOOLEAN|DECIMAL|NUMERIC|FLOAT|DOUBLE|SERIAL)/g, '<span class="sql-type">$1</span>')
      .replace(/(CASCADE|SET NULL|SET DEFAULT|RESTRICT|NO ACTION|CURRENT_DATE|CURRENT_TIMESTAMP)/g, '<span class="sql-constant">$1</span>')
      .replace(/(--.*$)/gm, '<span class="sql-comment">$1</span>');
  }

  copySQL() {
    const sql = this.generateFullSQL();
    navigator.clipboard.writeText(sql).then(() => {
      const btn = this.container.querySelector('#btn-copy-sql');
      const originalText = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    });
  }

  generateFullSQL() {
    let sql = '';
    this.tables.forEach(table => {
      sql += this.generateTableSQL(table, []) + '\n\n';
    });
    return sql.trim();
  }

  renderSchemaDiagram() {
    const diagram = this.container.querySelector('#schema-diagram');
    
    if (this.tables.length === 0) {
      diagram.innerHTML = '<div class="diagram-placeholder">Tables will appear here as you create them</div>';
      return;
    }

    // Calculate positions for tables in a grid layout
    const cols = Math.ceil(Math.sqrt(this.tables.length));
    
    diagram.innerHTML = `
      <div class="diagram-tables">
        ${this.tables.map((table, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          return this.renderTableBox(table, row, col);
        }).join('')}
      </div>
      <svg class="fk-lines" id="fk-lines"></svg>
    `;

    // Draw FK lines after DOM update
    setTimeout(() => this.drawFKLines(), 0);
  }

  renderTableBox(table, row, col) {
    const pkColumns = table.columns.filter(c => c.constraints.pk);
    const fkColumns = table.foreignKeys.map(fk => fk.column);
    
    return `
      <div class="diagram-table" id="table-box-${table.id}" data-table-id="${table.id}"
           style="grid-row: ${row + 1}; grid-column: ${col + 1};"
           onclick="window.schemaBuilder.selectTable('${table.id}')">
        <div class="diagram-table-header">
          <span class="table-icon">🗃️</span>
          <span class="table-name">${this.escapeHtml(table.name)}</span>
        </div>
        <div class="diagram-table-body">
          ${table.columns.map(col => {
            let icon = '';
            let badge = '';
            if (col.constraints.pk) {
              icon = '🔑';
              badge = 'PK';
            } else if (fkColumns.includes(col.name)) {
              icon = '🔗';
              badge = 'FK';
            } else if (col.constraints.unique) {
              icon = '✨';
              badge = 'UQ';
            } else if (col.constraints.notNull) {
              icon = '⚠️';
            }
            
            return `
              <div class="diagram-column ${col.constraints.pk ? 'pk' : ''} ${fkColumns.includes(col.name) ? 'fk' : ''}">
                <span class="col-icon">${icon}</span>
                <span class="col-name">${this.escapeHtml(col.name)}</span>
                <span class="col-type">${col.dataType}${col.length ? `(${col.length})` : ''}</span>
                ${badge ? `<span class="col-badge">${badge}</span>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  drawFKLines() {
    const svg = this.container.querySelector('#fk-lines');
    if (!svg) return;

    const diagramRect = svg.getBoundingClientRect();
    let linesHTML = '';

    this.tables.forEach(table => {
      const sourceBox = this.container.querySelector(`#table-box-${table.id}`);
      if (!sourceBox) return;

      table.foreignKeys.forEach(fk => {
        const targetTable = this.tables.find(t => t.name === fk.refTable);
        if (!targetTable) return;

        const targetBox = this.container.querySelector(`#table-box-${targetTable.id}`);
        if (!targetBox) return;

        const sourceRect = sourceBox.getBoundingClientRect();
        const targetRect = targetBox.getBoundingClientRect();

        // Calculate connection points
        const x1 = sourceRect.left + sourceRect.width / 2 - diagramRect.left;
        const y1 = sourceRect.top + sourceRect.height / 2 - diagramRect.top;
        const x2 = targetRect.left + targetRect.width / 2 - diagramRect.left;
        const y2 = targetRect.top + targetRect.height / 2 - diagramRect.top;

        linesHTML += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="fk-line" marker-end="url(#arrowhead)" />`;
      });
    });

    svg.innerHTML = `
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#818cf8" />
        </marker>
      </defs>
      ${linesHTML}
    `;
  }

  showConstraintDetails(constraint) {
    const details = {
      pk: {
        title: 'PRIMARY KEY Constraint',
        description: 'A PRIMARY KEY uniquely identifies each record in a table.',
        rules: [
          'Must contain UNIQUE values',
          'Cannot contain NULL values',
          'A table can have only ONE primary key',
          'May consist of single or multiple columns (composite key)'
        ],
        example: `CREATE TABLE Student (
    student_id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);`
      },
      fk: {
        title: 'FOREIGN KEY Constraint',
        description: 'A FOREIGN KEY establishes a link between two tables.',
        rules: [
          'References the PRIMARY KEY of another table',
          'Ensures referential integrity',
          'Can contain NULL values (optional relationship)',
          'ON DELETE/UPDATE actions define behavior on parent changes'
        ],
        example: `CREATE TABLE Enrollment (
    student_id INTEGER,
    FOREIGN KEY (student_id) 
        REFERENCES Student(student_id)
        ON DELETE CASCADE
);`
      },
      unique: {
        title: 'UNIQUE Constraint',
        description: 'Ensures all values in a column are different.',
        rules: [
          'All values must be unique',
          'Can contain NULL values (one NULL allowed)',
          'A table can have multiple UNIQUE constraints',
          'Useful for candidate keys (alternate identifiers)'
        ],
        example: `CREATE TABLE Employee (
    emp_id INTEGER PRIMARY KEY,
    email VARCHAR(100) UNIQUE
);`
      },
      notnull: {
        title: 'NOT NULL Constraint',
        description: 'Ensures a column cannot have NULL values.',
        rules: [
          'Column must have a value for every row',
          'Applied at the column level',
          'Should be used for required fields',
          'PRIMARY KEY columns are automatically NOT NULL'
        ],
        example: `CREATE TABLE Product (
    product_id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);`
      },
      check: {
        title: 'CHECK Constraint',
        description: 'Ensures values satisfy a specific condition.',
        rules: [
          'Defines a Boolean expression that must be TRUE',
          'Used for data validation',
          'Can reference multiple columns',
          'Evaluated on INSERT and UPDATE'
        ],
        example: `CREATE TABLE Employee (
    emp_id INTEGER PRIMARY KEY,
    salary DECIMAL(10,2) CHECK (salary > 0),
    age INTEGER CHECK (age >= 18 AND age <= 65)
);`
      },
      default: {
        title: 'DEFAULT Constraint',
        description: 'Sets a default value if none is provided.',
        rules: [
          'Used when INSERT omits the column value',
          'Can be a literal value or expression',
          'Common values: 0, CURRENT_DATE, \'Unknown\'',
          'Applies only on INSERT (not UPDATE)'
        ],
        example: `CREATE TABLE Order (
    order_id INTEGER PRIMARY KEY,
    order_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Pending'
);`
      }
    };

    const info = details[constraint];
    if (!info) return;

    // Show modal with details
    const modal = document.createElement('div');
    modal.className = 'constraint-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
      <div class="modal-content">
        <button class="modal-close" onclick="this.closest('.constraint-modal').remove()">×</button>
        <h3>${info.title}</h3>
        <p class="modal-desc">${info.description}</p>
        <h4>Rules:</h4>
        <ul class="modal-rules">
          ${info.rules.map(r => `<li>${r}</li>`).join('')}
        </ul>
        <h4>Example:</h4>
        <pre class="modal-example"><code>${this.syntaxHighlight(info.example)}</code></pre>
      </div>
    `;
    document.body.appendChild(modal);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  validateSchema() {
    const errors = [];
    
    this.tables.forEach(table => {
      if (!table.columns.length) {
        errors.push(`Table "${table.name}" has no columns`);
      }
      
      const hasPK = table.columns.some(c => c.constraints.pk);
      if (!hasPK) {
        errors.push(`Table "${table.name}" is missing a PRIMARY KEY`);
      }
      
      table.columns.forEach(col => {
        if (!col.name.trim()) {
          errors.push(`Table "${table.name}" has a column with no name`);
        }
      });
      
      table.foreignKeys.forEach(fk => {
        if (!fk.column || !fk.refTable || !fk.refColumn) {
          errors.push(`Table "${table.name}" has an incomplete foreign key`);
        }
      });
    });
    
    return errors;
  }

  // =====================================================
  // DDL IMPORT & PARSING METHODS
  // =====================================================

  parseDDL() {
    const input = this.container.querySelector('#ddl-import-input');
    const sql = input?.value?.trim();

    if (!sql) {
      this.showValidationResult([{
        type: 'EMPTY_INPUT',
        message: 'Please enter some DDL SQL to parse',
        severity: 'error',
        autoFixable: false
      }]);
      return;
    }

    // Use the DDLParser
    const parser = new DDLParser();
    const result = parser.parse(sql);

    // Only import if NO errors (warnings are ok)
    if (result.errors.length === 0 && result.tables.length > 0) {
      // Success - import the tables
      this.tables = result.tables;
      this.currentTable = this.tables[0] || null;
      
      this.renderTablesList();
      this.renderTableDesigner();
      this.updateSQLPreview();
      this.renderSchemaDiagram();
      
      this.showValidationResult([{
        type: 'SUCCESS',
        message: `Successfully imported ${result.tables.length} table(s)`,
        severity: 'success',
        autoFixable: false
      }]);
    } else if (result.errors.length === 0 && result.tables.length === 0) {
      // No errors but also no tables parsed
      this.showValidationResult([{
        type: 'NO_TABLES',
        message: 'No CREATE TABLE statements found in the provided SQL',
        severity: 'error',
        autoFixable: false
      }]);
    } else {
      // Show errors - DO NOT import anything
      this.showValidationResult([
        ...result.errors,
        ...result.warnings,
        ...result.suggestions
      ], parser);
    }
  }

  autoFixDDL() {
    const input = this.container.querySelector('#ddl-import-input');
    const sql = input?.value?.trim();

    if (!sql) {
      this.showValidationResult([{
        type: 'EMPTY_INPUT',
        message: 'Please enter some DDL SQL to fix',
        severity: 'error',
        autoFixable: false
      }]);
      return;
    }

    const parser = new DDLParser();
    const result = parser.parse(sql);

    if (result.errors.length === 0 && result.warnings.length === 0 && result.suggestions.length === 0) {
      this.showValidationResult([{
        type: 'INFO',
        message: 'No issues found! DDL is valid.',
        severity: 'success',
        autoFixable: false
      }]);
      return;
    }

    // Apply auto-fixes
    const fixResult = parser.autoFix();
    
    if (fixResult.fixedCount === 0 && result.errors.length > 0) {
      // Couldn't fix anything and there are errors
      this.showValidationResult([
        ...result.errors,
        ...result.warnings
      ], parser);
      return;
    }

    // Generate fixed SQL and update textarea
    const fixedSQL = parser.generateSQL(parser.parsedTables);
    if (input) input.value = fixedSQL;

    // Import fixed tables (only if no remaining errors)
    if (parser.errors.length === 0) {
      this.tables = parser.parsedTables;
      this.currentTable = this.tables[0] || null;
      
      this.renderTablesList();
      this.renderTableDesigner();
      this.updateSQLPreview();
      this.renderSchemaDiagram();
    }

    // Show what was fixed and any remaining issues
    const fixedIssues = result.warnings.filter(w => w.autoFixable).concat(
      result.suggestions.filter(s => s.autoFixable)
    );

    const displayIssues = [
      {
        type: 'SUCCESS',
        message: `Auto-fixed ${fixResult.fixedCount} issue(s). Fixed SQL has been updated in the textarea.`,
        severity: 'success',
        autoFixable: false
      }
    ];

    if (fixedIssues.length > 0) {
      displayIssues.push(...fixedIssues.map(issue => ({
        ...issue,
        severity: 'fixed'
      })));
    }

    if (parser.errors.length > 0) {
      displayIssues.push(...parser.errors.map(e => ({ ...e, severity: 'error' })));
    }
    if (parser.warnings.length > 0) {
      displayIssues.push(...parser.warnings);
    }

    this.showValidationResult(displayIssues, parser);
  }

  clearDDL() {
    const input = this.container.querySelector('#ddl-import-input');
    const validationPanel = this.container.querySelector('#validation-panel');
    
    if (input) input.value = '';
    if (validationPanel) validationPanel.style.display = 'none';
  }

  showValidationResult(issues, parser = null) {
    const panel = this.container.querySelector('#validation-panel');
    const issuesContainer = this.container.querySelector('#validation-issues');
    const summary = this.container.querySelector('#validation-summary');

    if (!panel || !issuesContainer) return;

    panel.style.display = 'block';

    // Calculate summary
    const errors = issues.filter(i => i.severity === 'error').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;
    const suggestions = issues.filter(i => i.severity === 'suggestion').length;
    const fixed = issues.filter(i => i.severity === 'fixed').length;
    const success = issues.some(i => i.severity === 'success');

    if (summary) {
      if (success) {
        summary.innerHTML = '<span class="summary-success">✓ Success</span>';
      } else if (errors === 0 && warnings === 0 && suggestions === 0 && fixed > 0) {
        summary.innerHTML = `<span class="summary-fixed">✓ Fixed ${fixed} issue(s)</span>`;
      } else {
        summary.innerHTML = [
          errors > 0 ? `<span class="summary-error">${errors} Error(s)</span>` : '',
          warnings > 0 ? `<span class="summary-warning">${warnings} Warning(s)</span>` : '',
          suggestions > 0 ? `<span class="summary-suggestion">${suggestions} Suggestion(s)</span>` : '',
          fixed > 0 ? `<span class="summary-fixed">${fixed} Fixed</span>` : ''
        ].filter(Boolean).join(' ');
      }
    }

    // Render issues
    issuesContainer.innerHTML = issues.map(issue => this.renderIssueCard(issue, parser)).join('');

    // Scroll to panel
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  renderIssueCard(issue, parser) {
    const icons = {
      error: '❌',
      warning: '⚠️',
      suggestion: '💡',
      success: '✓',
      fixed: '✅',
      info: 'ℹ️'
    };

    const severityClass = `issue-${issue.severity || 'error'}`;
    const icon = icons[issue.severity] || icons.error;
    
    let fixButton = '';
    if (issue.autoFixable && !issue.fixed && issue.severity !== 'fixed') {
      fixButton = `<button class="btn-fix-issue" data-issue-type="${issue.type}">Fix This</button>`;
    }

    let context = '';
    if (issue.context) {
      context = `<div class="issue-context">${this.escapeHtml(issue.context)}</div>`;
    }

    let fixDescription = '';
    if (issue.fixDescription) {
      fixDescription = `<div class="issue-fix-desc">Suggested fix: ${this.escapeHtml(issue.fixDescription)}</div>`;
    }

    return `
      <div class="issue-card ${severityClass}">
        <div class="issue-header">
          <span class="issue-icon">${icon}</span>
          <span class="issue-type">${issue.type}</span>
          ${issue.line ? `<span class="issue-location">Line ${issue.line}</span>` : ''}
        </div>
        <div class="issue-message">${this.escapeHtml(issue.message)}</div>
        ${context}
        ${fixDescription}
        ${fixButton}
      </div>
    `;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-simulator="ddl-schema-builder"]');
  containers.forEach(container => {
    window.schemaBuilder = new SchemaBuilder(container.id);
  });
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SchemaBuilder;
}
