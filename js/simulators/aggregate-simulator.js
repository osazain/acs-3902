/**
 * Aggregate Function Simulator
 * ACS-3902 Database Systems - Midterm 2 Prep
 * 
 * Features:
 * - Interactive demonstrations of SQL aggregate functions (COUNT, SUM, AVG, MAX, MIN)
 * - GROUP BY visualization with step-by-step breakdown
 * - NULL handling demonstrations
 * - WHERE vs HAVING comparisons
 * - Animated calculation visualization
 * - SQL query generation from selections
 */

// Sample Product Sales Data with some NULL values for demonstration
const SAMPLE_DATA = [
  { id: 1, product: 'Laptop Pro', category: 'Electronics', price: 1299.99, quantity: 5, date: '2024-01-15' },
  { id: 2, product: 'Wireless Mouse', category: 'Electronics', price: 29.99, quantity: 25, date: '2024-01-16' },
  { id: 3, product: 'USB Cable', category: 'Electronics', price: null, quantity: 50, date: '2024-01-17' },
  { id: 4, product: 'Coffee Maker', category: 'Appliances', price: 89.99, quantity: 12, date: '2024-01-15' },
  { id: 5, product: 'Blender', category: 'Appliances', price: 49.99, quantity: null, date: '2024-01-18' },
  { id: 6, product: 'Toaster', category: 'Appliances', price: 34.99, quantity: 18, date: '2024-01-16' },
  { id: 7, product: 'Running Shoes', category: 'Sports', price: 119.99, quantity: 8, date: '2024-01-15' },
  { id: 8, product: 'Yoga Mat', category: 'Sports', price: null, quantity: 20, date: '2024-01-19' },
  { id: 9, product: 'Dumbbells Set', category: 'Sports', price: 79.99, quantity: 6, date: '2024-01-17' },
  { id: 10, product: 'T-Shirt', category: 'Clothing', price: 24.99, quantity: 45, date: '2024-01-15' },
  { id: 11, product: 'Jeans', category: 'Clothing', price: 59.99, quantity: 30, date: '2024-01-16' },
  { id: 12, product: 'Jacket', category: 'Clothing', price: null, quantity: 15, date: '2024-01-20' },
  { id: 13, product: 'Headphones', category: 'Electronics', price: 199.99, quantity: 10, date: '2024-01-18' },
  { id: 14, product: 'Desk Lamp', category: 'Appliances', price: 39.99, quantity: 22, date: '2024-01-19' },
  { id: 15, product: 'Water Bottle', category: 'Sports', price: 19.99, quantity: null, date: '2024-01-17' },
  { id: 16, product: 'Socks (3-pack)', category: 'Clothing', price: 14.99, quantity: 60, date: '2024-01-18' },
  { id: 17, product: 'Monitor 27"', category: 'Electronics', price: 349.99, quantity: 7, date: '2024-01-20' },
  { id: 18, product: 'Vacuum Cleaner', category: 'Appliances', price: 149.99, quantity: 4, date: '2024-01-19' }
];

class AggregateSimulator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.data = [...SAMPLE_DATA];
    this.filteredData = [...this.data];
    this.selectedAggregates = [];
    this.groupByColumn = null;
    this.whereCondition = null;
    this.havingCondition = null;
    this.showWorkDetails = false;
    this.animationStep = 0;
    this.isAnimating = false;
    this.calculationBreakdown = [];
    
    // Column metadata
    this.columns = [
      { name: 'product', label: 'Product', type: 'string' },
      { name: 'category', label: 'Category', type: 'string' },
      { name: 'price', label: 'Price', type: 'number' },
      { name: 'quantity', label: 'Quantity', type: 'number' },
      { name: 'date', label: 'Date', type: 'string' }
    ];
    
    // Aggregate function definitions
    this.aggregateFunctions = {
      'count_star': { label: 'COUNT(*)', func: this.countStar.bind(this), type: 'count', description: 'Count all rows' },
      'count_col': { label: 'COUNT(Price)', func: this.countColumn.bind(this, 'price'), type: 'count', description: 'Count non-NULL prices' },
      'sum_price': { label: 'SUM(Price)', func: this.sumColumn.bind(this, 'price'), type: 'sum', description: 'Sum of all prices' },
      'sum_revenue': { label: 'SUM(Price×Qty)', func: this.sumRevenue.bind(this), type: 'sum', description: 'Sum of Price × Quantity' },
      'avg_price': { label: 'AVG(Price)', func: this.avgColumn.bind(this, 'price'), type: 'avg', description: 'Average of non-NULL prices' },
      'max_price': { label: 'MAX(Price)', func: this.maxColumn.bind(this, 'price'), type: 'max', description: 'Maximum price' },
      'min_price': { label: 'MIN(Price)', func: this.minColumn.bind(this, 'price'), type: 'min', description: 'Minimum price' },
      'count_qty': { label: 'COUNT(Quantity)', func: this.countColumn.bind(this, 'quantity'), type: 'count', description: 'Count non-NULL quantities' }
    };
    
    this.init();
  }

  init() {
    this.renderInterface();
    this.attachEventListeners();
    this.renderSampleData();
    this.updateResults();
  }

  renderInterface() {
    this.container.innerHTML = `
      <div class="aggregate-simulator">
        <style>
          .aggregate-simulator {
            font-family: inherit;
            max-width: 1400px;
            margin: 0 auto;
          }
          
          .agg-section {
            background: var(--bg-secondary, #f8fafc);
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 12px;
            margin-bottom: 1.5rem;
            overflow: hidden;
          }
          
          .agg-section-header {
            background: linear-gradient(135deg, rgba(var(--accent-rgb, 99, 102, 241), 0.1) 0%, transparent 100%);
            padding: 1rem 1.5rem;
            border-bottom: 1px solid var(--border-color, #e2e8f0);
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          
          .agg-section-header h4 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
          }
          
          .agg-section-icon {
            font-size: 1.25rem;
          }
          
          .agg-section-body {
            padding: 1.5rem;
          }
          
          /* Sample Data Table */
          .data-table-container {
            overflow-x: auto;
          }
          
          .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
          }
          
          .data-table th,
          .data-table td {
            padding: 0.75rem 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color, #e2e8f0);
          }
          
          .data-table th {
            background: var(--bg-primary, #ffffff);
            font-weight: 600;
            color: var(--text-secondary, #64748b);
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .data-table tbody tr:hover {
            background: rgba(var(--accent-rgb, 99, 102, 241), 0.05);
          }
          
          .data-table tbody tr.filtered-out {
            opacity: 0.4;
            background: #fee2e2;
          }
          
          .data-table tbody tr.group-highlight {
            background: rgba(16, 185, 129, 0.1);
          }
          
          .null-value {
            color: #ef4444;
            font-style: italic;
            background: #fee2e2;
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
            font-size: 0.8rem;
          }
          
          /* Controls Grid */
          .controls-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
          }
          
          .control-group {
            background: var(--bg-primary, #ffffff);
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 8px;
            padding: 1rem;
          }
          
          .control-group-title {
            font-weight: 600;
            margin-bottom: 0.75rem;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          /* Aggregate Checkboxes */
          .agg-checkboxes {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .agg-checkbox-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s;
          }
          
          .agg-checkbox-item:hover {
            background: rgba(var(--accent-rgb, 99, 102, 241), 0.05);
          }
          
          .agg-checkbox-item input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
          }
          
          .agg-checkbox-label {
            flex: 1;
            font-size: 0.9rem;
            cursor: pointer;
          }
          
          .agg-checkbox-desc {
            font-size: 0.75rem;
            color: var(--text-secondary, #64748b);
          }
          
          /* Select Dropdowns */
          .agg-select {
            width: 100%;
            padding: 0.625rem 0.875rem;
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 6px;
            background: var(--bg-primary, #ffffff);
            font-size: 0.9rem;
            cursor: pointer;
          }
          
          .agg-select:focus {
            outline: none;
            border-color: var(--accent-color, #6366f1);
            box-shadow: 0 0 0 3px rgba(var(--accent-rgb, 99, 102, 241), 0.1);
          }
          
          /* Condition Builder */
          .condition-builder {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .condition-row {
            display: flex;
            gap: 0.5rem;
            align-items: center;
          }
          
          .condition-row select,
          .condition-row input {
            padding: 0.5rem 0.75rem;
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 6px;
            font-size: 0.85rem;
          }
          
          .condition-row select {
            min-width: 100px;
          }
          
          .condition-row input {
            flex: 1;
            min-width: 80px;
          }
          
          /* Action Buttons */
          .agg-actions {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color, #e2e8f0);
          }
          
          .btn {
            padding: 0.625rem 1.25rem;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .btn-primary {
            background: var(--accent-color, #6366f1);
            color: white;
          }
          
          .btn-primary:hover {
            background: var(--accent-hover, #4f46e5);
          }
          
          .btn-secondary {
            background: var(--bg-primary, #ffffff);
            border: 1px solid var(--border-color, #e2e8f0);
            color: var(--text-primary, #1e293b);
          }
          
          .btn-secondary:hover {
            background: var(--bg-secondary, #f8fafc);
          }
          
          .btn-tertiary {
            background: transparent;
            border: 1px dashed var(--border-color, #e2e8f0);
            color: var(--text-secondary, #64748b);
          }
          
          .btn-tertiary:hover {
            border-style: solid;
            color: var(--text-primary, #1e293b);
          }
          
          /* SQL Output */
          .sql-output {
            background: #1e293b;
            border-radius: 8px;
            padding: 1rem 1.5rem;
            overflow-x: auto;
          }
          
          .sql-output pre {
            margin: 0;
            color: #e2e8f0;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.9rem;
            line-height: 1.6;
          }
          
          .sql-keyword {
            color: #c084fc;
            font-weight: 600;
          }
          
          .sql-function {
            color: #60a5fa;
          }
          
          .sql-string {
            color: #4ade80;
          }
          
          .sql-number {
            color: #fbbf24;
          }
          
          /* Results Section */
          .results-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          @media (min-width: 1024px) {
            .results-container {
              grid-template-columns: 2fr 1fr;
            }
          }
          
          .results-table-container {
            overflow-x: auto;
          }
          
          .results-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .results-table th,
          .results-table td {
            padding: 0.875rem 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color, #e2e8f0);
          }
          
          .results-table th {
            background: linear-gradient(135deg, rgba(var(--accent-rgb, 99, 102, 241), 0.1) 0%, transparent 100%);
            font-weight: 600;
            color: var(--text-primary, #1e293b);
          }
          
          .results-table tbody tr:nth-child(even) {
            background: var(--bg-primary, #ffffff);
          }
          
          .results-table tbody tr:hover {
            background: rgba(var(--accent-rgb, 99, 102, 241), 0.05);
          }
          
          .result-value {
            font-family: 'Consolas', 'Monaco', monospace;
            font-weight: 600;
            color: var(--accent-color, #6366f1);
          }
          
          /* Calculation Breakdown */
          .calculation-breakdown {
            background: var(--bg-primary, #ffffff);
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 8px;
            padding: 1rem;
          }
          
          .calc-step {
            padding: 0.75rem;
            border-left: 3px solid var(--border-color, #e2e8f0);
            margin-bottom: 0.5rem;
            background: var(--bg-secondary, #f8fafc);
            border-radius: 0 6px 6px 0;
            font-size: 0.9rem;
          }
          
          .calc-step.active {
            border-left-color: var(--accent-color, #6366f1);
            background: rgba(var(--accent-rgb, 99, 102, 241), 0.05);
          }
          
          .calc-step.completed {
            border-left-color: #10b981;
          }
          
          .calc-step-header {
            font-weight: 600;
            margin-bottom: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .calc-step-detail {
            color: var(--text-secondary, #64748b);
            font-size: 0.85rem;
          }
          
          .calc-values {
            display: flex;
            flex-wrap: wrap;
            gap: 0.375rem;
            margin-top: 0.5rem;
          }
          
          .calc-value {
            background: white;
            border: 1px solid var(--border-color, #e2e8f0);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.8rem;
          }
          
          .calc-value.null {
            background: #fee2e2;
            border-color: #fecaca;
            color: #ef4444;
          }
          
          .calc-value.included {
            background: #d1fae5;
            border-color: #a7f3d0;
            color: #059669;
          }
          
          /* Group Visualization */
          .group-viz {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .group-item {
            background: var(--bg-primary, #ffffff);
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 8px;
            overflow: hidden;
          }
          
          .group-header {
            background: linear-gradient(135deg, rgba(var(--accent-rgb, 99, 102, 241), 0.1) 0%, transparent 100%);
            padding: 0.75rem 1rem;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .group-count {
            background: var(--accent-color, #6366f1);
            color: white;
            padding: 0.125rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
          }
          
          .group-rows {
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
            color: var(--text-secondary, #64748b);
          }
          
          /* Educational Panels */
          .edu-panels {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
          }
          
          .edu-panel {
            background: var(--bg-primary, #ffffff);
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 8px;
            padding: 1rem;
          }
          
          .edu-panel-title {
            font-weight: 600;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.95rem;
          }
          
          .edu-panel-content {
            font-size: 0.9rem;
            color: var(--text-secondary, #64748b);
            line-height: 1.6;
          }
          
          .edu-panel-content ul {
            margin: 0;
            padding-left: 1.25rem;
          }
          
          .edu-panel-content li {
            margin-bottom: 0.5rem;
          }
          
          .edu-highlight {
            background: #fef3c7;
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
            color: #92400e;
            font-weight: 500;
          }
          
          .edu-error {
            background: #fee2e2;
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
            color: #991b1b;
            font-weight: 500;
          }
          
          /* Comparison Section */
          .comparison-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          
          .comparison-item {
            background: var(--bg-primary, #ffffff);
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 8px;
            padding: 1rem;
          }
          
          .comparison-item h5 {
            margin: 0 0 0.5rem 0;
            color: var(--text-primary, #1e293b);
          }
          
          .comparison-item pre {
            background: #f1f5f9;
            padding: 0.75rem;
            border-radius: 6px;
            font-size: 0.8rem;
            overflow-x: auto;
            margin: 0.5rem 0;
          }
          
          /* Animation Controls */
          .anim-controls {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-top: 1rem;
            padding: 1rem;
            background: var(--bg-primary, #ffffff);
            border-radius: 8px;
          }
          
          .anim-progress {
            flex: 1;
            height: 8px;
            background: var(--border-color, #e2e8f0);
            border-radius: 4px;
            overflow: hidden;
          }
          
          .anim-progress-bar {
            height: 100%;
            background: var(--accent-color, #6366f1);
            border-radius: 4px;
            transition: width 0.3s;
          }
          
          /* Tabs */
          .agg-tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--border-color, #e2e8f0);
            padding-bottom: 0.5rem;
          }
          
          .agg-tab {
            padding: 0.5rem 1rem;
            border: none;
            background: transparent;
            color: var(--text-secondary, #64748b);
            cursor: pointer;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s;
          }
          
          .agg-tab:hover {
            background: var(--bg-secondary, #f8fafc);
            color: var(--text-primary, #1e293b);
          }
          
          .agg-tab.active {
            background: var(--accent-color, #6366f1);
            color: white;
          }
          
          .agg-tab-content {
            display: none;
          }
          
          .agg-tab-content.active {
            display: block;
          }
          
          /* Stats Badge */
          .stats-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.625rem;
            background: rgba(var(--accent-rgb, 99, 102, 241), 0.1);
            color: var(--accent-color, #6366f1);
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
          }
          
          /* Responsive */
          @media (max-width: 768px) {
            .controls-grid {
              grid-template-columns: 1fr;
            }
            
            .comparison-grid {
              grid-template-columns: 1fr;
            }
            
            .results-container {
              grid-template-columns: 1fr;
            }
          }
        </style>
        
        <!-- Sample Data Section -->
        <div class="agg-section">
          <div class="agg-section-header">
            <span class="agg-section-icon">📊</span>
            <h4>Sample Product Sales Data</h4>
            <span class="stats-badge" id="row-count-badge">18 rows</span>
          </div>
          <div class="agg-section-body">
            <div class="data-table-container" id="sample-data-table">
              <!-- Table rendered by JS -->
            </div>
            <div style="margin-top: 0.75rem; font-size: 0.85rem; color: var(--text-secondary, #64748b);">
              <span class="null-value">NULL</span> values shown in red. Notice how different aggregate functions handle NULLs differently.
            </div>
          </div>
        </div>
        
        <!-- Controls Section -->
        <div class="agg-section">
          <div class="agg-section-header">
            <span class="agg-section-icon">🎛️</span>
            <h4>Query Configuration</h4>
          </div>
          <div class="agg-section-body">
            <div class="controls-grid">
              <!-- Aggregate Functions -->
              <div class="control-group">
                <div class="control-group-title">📐 Aggregate Functions</div>
                <div class="agg-checkboxes" id="aggregate-checkboxes">
                  <!-- Checkboxes rendered by JS -->
                </div>
              </div>
              
              <!-- GROUP BY -->
              <div class="control-group">
                <div class="control-group-title">📂 GROUP BY</div>
                <select id="groupby-select" class="agg-select">
                  <option value="">No GROUP BY (aggregate all rows)</option>
                  <option value="category">Category</option>
                  <option value="date">Date</option>
                </select>
                <div style="margin-top: 0.75rem; font-size: 0.85rem; color: var(--text-secondary, #64748b);">
                  Groups rows with same values into summary rows
                </div>
              </div>
              
              <!-- WHERE Clause -->
              <div class="control-group">
                <div class="control-group-title">🔍 WHERE Clause</div>
                <div class="condition-builder">
                  <div class="condition-row">
                    <select id="where-column">
                      <option value="">No filter</option>
                      <option value="price">Price</option>
                      <option value="quantity">Quantity</option>
                      <option value="category">Category</option>
                    </select>
                    <select id="where-operator">
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                      <option value="=">=</option>
                      <option value=">=">&gt;=</option>
                      <option value="<=">&lt;=</option>
                      <option value="!=">!=</option>
                    </select>
                    <input type="text" id="where-value" placeholder="Value">
                  </div>
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-secondary, #64748b);">
                  Filters rows <strong>before</strong> aggregation
                </div>
              </div>
              
              <!-- HAVING Clause -->
              <div class="control-group">
                <div class="control-group-title">✓ HAVING Clause</div>
                <div class="condition-builder">
                  <div class="condition-row">
                    <select id="having-agg">
                      <option value="">No filter</option>
                      <option value="count">COUNT(*)</option>
                      <option value="sum">SUM(Price)</option>
                      <option value="avg">AVG(Price)</option>
                    </select>
                    <select id="having-operator">
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                      <option value="=">=</option>
                      <option value=">=">&gt;=</option>
                    </select>
                    <input type="text" id="having-value" placeholder="Value">
                  </div>
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-secondary, #64748b);">
                  Filters groups <strong>after</strong> aggregation
                </div>
              </div>
            </div>
            
            <div class="agg-actions">
              <button id="btn-run-query" class="btn btn-primary">▶️ Run Query</button>
              <button id="btn-animate" class="btn btn-secondary">🎬 Animate Execution</button>
              <button id="btn-show-work" class="btn btn-tertiary">📖 Show Work</button>
              <button id="btn-reset" class="btn btn-tertiary">🔄 Reset</button>
            </div>
          </div>
        </div>
        
        <!-- Generated SQL -->
        <div class="agg-section">
          <div class="agg-section-header">
            <span class="agg-section-icon">📝</span>
            <h4>Generated SQL Query</h4>
          </div>
          <div class="agg-section-body">
            <div class="sql-output">
              <pre id="generated-sql">-- Select aggregate functions and options to generate SQL</pre>
            </div>
          </div>
        </div>
        
        <!-- Results Section -->
        <div class="agg-section">
          <div class="agg-section-header">
            <span class="agg-section-icon">📈</span>
            <h4>Query Results</h4>
            <span class="stats-badge" id="results-count-badge">0 rows</span>
          </div>
          <div class="agg-section-body">
            <div class="results-container">
              <div class="results-table-container" id="results-table">
                <!-- Results rendered by JS -->
              </div>
              <div class="calculation-breakdown" id="calc-breakdown">
                <div style="text-align: center; color: var(--text-secondary, #64748b); padding: 2rem;">
                  Click "Show Work" to see calculation breakdown
                </div>
              </div>
            </div>
            
            <!-- Animation Controls -->
            <div class="anim-controls" id="anim-controls" style="display: none;">
              <button id="btn-anim-prev" class="btn btn-secondary">⏮️</button>
              <div class="anim-progress">
                <div class="anim-progress-bar" id="anim-progress-bar" style="width: 0%"></div>
              </div>
              <button id="btn-anim-next" class="btn btn-secondary">⏭️</button>
              <span id="anim-step-label">Step 1 of 5</span>
            </div>
          </div>
        </div>
        
        <!-- Educational Content Tabs -->
        <div class="agg-section">
          <div class="agg-section-header">
            <span class="agg-section-icon">📚</span>
            <h4>Learning Center</h4>
          </div>
          <div class="agg-section-body">
            <div class="agg-tabs">
              <button class="agg-tab active" data-tab="null-handling">NULL Handling</button>
              <button class="agg-tab" data-tab="where-vs-having">WHERE vs HAVING</button>
              <button class="agg-tab" data-tab="groupby-rules">GROUP BY Rules</button>
              <button class="agg-tab" data-tab="common-mistakes">Common Mistakes</button>
            </div>
            
            <div id="tab-null-handling" class="agg-tab-content active">
              <div class="edu-panels">
                <div class="edu-panel">
                  <div class="edu-panel-title">🔢 COUNT(*) vs COUNT(column)</div>
                  <div class="edu-panel-content">
                    <ul>
                      <li><strong>COUNT(*)</strong>: Counts ALL rows, including those with NULL values</li>
                      <li><strong>COUNT(column)</strong>: Counts only rows where column is <strong>NOT NULL</strong></li>
                    </ul>
                    <p>In this dataset, <span class="edu-highlight">COUNT(*) = 18</span> but <span class="edu-highlight">COUNT(price) = 15</span> (3 NULL prices)</p>
                  </div>
                </div>
                <div class="edu-panel">
                  <div class="edu-panel-title">📊 Other Aggregates & NULLs</div>
                  <div class="edu-panel-content">
                    <ul>
                      <li><strong>SUM, AVG, MAX, MIN</strong>: Ignore NULL values completely</li>
                      <li><strong>AVG</strong>: Calculates average of non-NULL values only</li>
                      <li>If all values are NULL, result is NULL</li>
                    </ul>
                    <p>AVG(price) = SUM(price) / COUNT(price), not COUNT(*)</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div id="tab-where-vs-having" class="agg-tab-content">
              <div class="comparison-grid">
                <div class="comparison-item">
                  <h5>WHERE Clause</h5>
                  <pre>SELECT category, AVG(price)
FROM products
WHERE price > 50
GROUP BY category</pre>
                  <p>Filters <strong>individual rows</strong> before aggregation</p>
                  <p>✅ Can reference any column</p>
                  <p>❌ Cannot use aggregate functions</p>
                </div>
                <div class="comparison-item">
                  <h5>HAVING Clause</h5>
                  <pre>SELECT category, AVG(price)
FROM products
GROUP BY category
HAVING COUNT(*) > 3</pre>
                  <p>Filters <strong>groups</strong> after aggregation</p>
                  <p>✅ Can use aggregate functions</p>
                  <p>✅ Can reference GROUP BY columns</p>
                </div>
              </div>
            </div>
            
            <div id="tab-groupby-rules" class="agg-tab-content">
              <div class="edu-panels">
                <div class="edu-panel">
                  <div class="edu-panel-title">📋 SELECT Column Rules</div>
                  <div class="edu-panel-content">
                    <p>When using GROUP BY, SELECT can only contain:</p>
                    <ul>
                      <li>Columns listed in the <strong>GROUP BY</strong> clause</li>
                      <li><strong>Aggregate functions</strong> (SUM, COUNT, AVG, etc.)</li>
                      <li>Constants or expressions not referencing non-grouped columns</li>
                    </ul>
                    <p><span class="edu-error">Error:</span> SELECT product, COUNT(*) GROUP BY category</p>
                    <p><span class="edu-highlight">Valid:</span> SELECT category, COUNT(*) GROUP BY category</p>
                  </div>
                </div>
                <div class="edu-panel">
                  <div class="edu-panel-title">🔄 Execution Order</div>
                  <div class="edu-panel-content">
                    <ol>
                      <li><strong>FROM</strong> - Get data from table</li>
                      <li><strong>WHERE</strong> - Filter rows</li>
                      <li><strong>GROUP BY</strong> - Group rows</li>
                      <li><strong>HAVING</strong> - Filter groups</li>
                      <li><strong>SELECT</strong> - Calculate aggregates</li>
                      <li><strong>ORDER BY</strong> - Sort results</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
            
            <div id="tab-common-mistakes" class="agg-tab-content">
              <div class="edu-panels">
                <div class="edu-panel">
                  <div class="edu-panel-title">❌ Common Mistakes</div>
                  <div class="edu-panel-content">
                    <ul>
                      <li><span class="edu-error">Wrong:</span> Using WHERE with aggregate functions<br>
                        <code>WHERE COUNT(*) > 5</code> ❌</li>
                      <li><span class="edu-error">Wrong:</span> Selecting non-grouped columns<br>
                        <code>SELECT name, COUNT(*) GROUP BY dept</code> ❌</li>
                      <li><span class="edu-error">Wrong:</span> Forgetting GROUP BY with aggregates<br>
                        <code>SELECT dept, AVG(sal) FROM emp</code> ❌ (usually)</li>
                      <li><span class="edu-error">Wrong:</span> Thinking AVG includes NULL as 0</li>
                    </ul>
                  </div>
                </div>
                <div class="edu-panel">
                  <div class="edu-panel-title">✅ Best Practices</div>
                  <div class="edu-panel-content">
                    <ul>
                      <li>Use <strong>WHERE</strong> to filter rows before aggregation</li>
                      <li>Use <strong>HAVING</strong> to filter based on aggregate results</li>
                      <li>Be explicit about NULL handling with COALESCE when needed</li>
                      <li>Use COUNT(*) for row counts, COUNT(col) for non-NULL counts</li>
                      <li>Always include GROUP BY columns in SELECT</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Aggregate checkboxes
    const checkboxContainer = this.container.querySelector('#aggregate-checkboxes');
    Object.entries(this.aggregateFunctions).forEach(([key, config]) => {
      const item = document.createElement('div');
      item.className = 'agg-checkbox-item';
      item.innerHTML = `
        <input type="checkbox" id="agg-${key}" value="${key}">
        <label for="agg-${key}" class="agg-checkbox-label">
          ${config.label}
          <div class="agg-checkbox-desc">${config.description}</div>
        </label>
      `;
      checkboxContainer.appendChild(item);
      
      item.querySelector('input').addEventListener('change', () => this.updateResults());
    });

    // GROUP BY select
    this.container.querySelector('#groupby-select')?.addEventListener('change', (e) => {
      this.groupByColumn = e.target.value || null;
      this.updateResults();
    });

    // WHERE clause
    ['where-column', 'where-operator', 'where-value'].forEach(id => {
      this.container.querySelector(`#${id}`)?.addEventListener('change', () => this.updateResults());
      this.container.querySelector(`#${id}`)?.addEventListener('input', () => this.updateResults());
    });

    // HAVING clause
    ['having-agg', 'having-operator', 'having-value'].forEach(id => {
      this.container.querySelector(`#${id}`)?.addEventListener('change', () => this.updateResults());
      this.container.querySelector(`#${id}`)?.addEventListener('input', () => this.updateResults());
    });

    // Action buttons
    this.container.querySelector('#btn-run-query')?.addEventListener('click', () => this.updateResults());
    this.container.querySelector('#btn-animate')?.addEventListener('click', () => this.animateExecution());
    this.container.querySelector('#btn-show-work')?.addEventListener('click', () => this.toggleShowWork());
    this.container.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // Animation controls
    this.container.querySelector('#btn-anim-prev')?.addEventListener('click', () => this.prevAnimStep());
    this.container.querySelector('#btn-anim-next')?.addEventListener('click', () => this.nextAnimStep());

    // Tabs
    this.container.querySelectorAll('.agg-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });
  }

  switchTab(tabId) {
    this.container.querySelectorAll('.agg-tab').forEach(t => t.classList.remove('active'));
    this.container.querySelectorAll('.agg-tab-content').forEach(c => c.classList.remove('active'));
    
    this.container.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
    this.container.querySelector(`#tab-${tabId}`)?.classList.add('active');
  }

  renderSampleData() {
    const tableContainer = this.container.querySelector('#sample-data-table');
    
    const filteredIds = new Set(this.filteredData.map(r => r.id));
    
    tableContainer.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${this.data.map(row => {
            const isFiltered = !filteredIds.has(row.id);
            return `
              <tr class="${isFiltered ? 'filtered-out' : ''}" data-row-id="${row.id}">
                <td>${row.product}</td>
                <td>${row.category}</td>
                <td>${row.price === null ? '<span class="null-value">NULL</span>' : '$' + row.price.toFixed(2)}</td>
                <td>${row.quantity === null ? '<span class="null-value">NULL</span>' : row.quantity}</td>
                <td>${row.date}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    
    this.container.querySelector('#row-count-badge').textContent = `${this.data.length} rows (${this.filteredData.length} match filters)`;
  }

  getWhereCondition() {
    const column = this.container.querySelector('#where-column')?.value;
    const operator = this.container.querySelector('#where-operator')?.value;
    const value = this.container.querySelector('#where-value')?.value;
    
    if (!column || !value) return null;
    return { column, operator, value };
  }

  getHavingCondition() {
    const agg = this.container.querySelector('#having-agg')?.value;
    const operator = this.container.querySelector('#having-operator')?.value;
    const value = this.container.querySelector('#having-value')?.value;
    
    if (!agg || !value) return null;
    return { agg, operator, value: parseFloat(value) };
  }

  applyWhere(data) {
    const condition = this.getWhereCondition();
    if (!condition) return data;
    
    return data.filter(row => {
      const val = row[condition.column];
      if (val === null) return false;
      
      const compareVal = isNaN(condition.value) ? condition.value : parseFloat(condition.value);
      
      switch (condition.operator) {
        case '>': return val > compareVal;
        case '<': return val < compareVal;
        case '=': return val == compareVal;
        case '>=': return val >= compareVal;
        case '<=': return val <= compareVal;
        case '!=': return val != compareVal;
        default: return true;
      }
    });
  }

  groupData(data) {
    if (!this.groupByColumn) {
      return [{ key: null, rows: data }];
    }
    
    const groups = {};
    data.forEach(row => {
      const key = row[this.groupByColumn];
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });
    
    return Object.entries(groups).map(([key, rows]) => ({ key, rows }));
  }

  applyHaving(groups) {
    const condition = this.getHavingCondition();
    if (!condition) return groups;
    
    return groups.filter(group => {
      let aggValue;
      switch (condition.agg) {
        case 'count': aggValue = group.rows.length; break;
        case 'sum': aggValue = this.sumColumn('price', group.rows); break;
        case 'avg': aggValue = this.avgColumn('price', group.rows); break;
        default: return true;
      }
      
      switch (condition.operator) {
        case '>': return aggValue > condition.value;
        case '<': return aggValue < condition.value;
        case '=': return aggValue === condition.value;
        case '>=': return aggValue >= condition.value;
        default: return true;
      }
    });
  }

  // Aggregate function implementations
  countStar(rows) {
    return rows.length;
  }

  countColumn(column, rows) {
    return rows.filter(r => r[column] !== null).length;
  }

  sumColumn(column, rows) {
    return rows.reduce((sum, r) => sum + (r[column] || 0), 0);
  }

  sumRevenue(rows) {
    return rows.reduce((sum, r) => {
      if (r.price !== null && r.quantity !== null) {
        return sum + (r.price * r.quantity);
      }
      return sum;
    }, 0);
  }

  avgColumn(column, rows) {
    const nonNullRows = rows.filter(r => r[column] !== null);
    if (nonNullRows.length === 0) return null;
    return nonNullRows.reduce((sum, r) => sum + r[column], 0) / nonNullRows.length;
  }

  maxColumn(column, rows) {
    const nonNullRows = rows.filter(r => r[column] !== null);
    if (nonNullRows.length === 0) return null;
    return Math.max(...nonNullRows.map(r => r[column]));
  }

  minColumn(column, rows) {
    const nonNullRows = rows.filter(r => r[column] !== null);
    if (nonNullRows.length === 0) return null;
    return Math.min(...nonNullRows.map(r => r[column]));
  }

  getSelectedAggregates() {
    const checkboxes = this.container.querySelectorAll('#aggregate-checkboxes input:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  }

  updateResults() {
    this.selectedAggregates = this.getSelectedAggregates();
    
    // Apply WHERE filter
    this.filteredData = this.applyWhere(this.data);
    
    // Group data
    let groups = this.groupData(this.filteredData);
    
    // Apply HAVING filter
    groups = this.applyHaving(groups);
    
    // Generate SQL
    this.generateSQL();
    
    // Render results
    this.renderResults(groups);
    
    // Update sample data highlighting
    this.renderSampleData();
    
    // Clear calculation breakdown if not showing work
    if (!this.showWorkDetails) {
      this.container.querySelector('#calc-breakdown').innerHTML = `
        <div style="text-align: center; color: var(--text-secondary, #64748b); padding: 2rem;">
          Click "Show Work" to see calculation breakdown
        </div>
      `;
    } else {
      this.renderCalculationBreakdown(groups);
    }
  }

  generateSQL() {
    const sqlOutput = this.container.querySelector('#generated-sql');
    
    if (this.selectedAggregates.length === 0) {
      sqlOutput.innerHTML = '<span class="sql-comment">-- Select at least one aggregate function to generate SQL</span>';
      return;
    }
    
    const aggList = this.selectedAggregates.map(agg => {
      const config = this.aggregateFunctions[agg];
      return `  <span class="sql-function">${config.label}</span>`;
    }).join(',\n');
    
    let sql = `<span class="sql-keyword">SELECT</span>\n${aggList}`;
    
    if (this.groupByColumn) {
      sql = `<span class="sql-keyword">SELECT</span>\n  <span class="sql-keyword">${this.groupByColumn}</span>,\n${aggList}`;
    }
    
    sql += `\n<span class="sql-keyword">FROM</span> <span class="sql-string">products</span>`;
    
    const whereCondition = this.getWhereCondition();
    if (whereCondition) {
      sql += `\n<span class="sql-keyword">WHERE</span> <span class="sql-keyword">${whereCondition.column}</span> ${whereCondition.operator} <span class="sql-number">${whereCondition.value}</span>`;
    }
    
    if (this.groupByColumn) {
      sql += `\n<span class="sql-keyword">GROUP BY</span> <span class="sql-keyword">${this.groupByColumn}</span>`;
    }
    
    const havingCondition = this.getHavingCondition();
    if (havingCondition) {
      const aggName = havingCondition.agg === 'count' ? 'COUNT(*)' : 
                     havingCondition.agg === 'sum' ? 'SUM(price)' : 'AVG(price)';
      sql += `\n<span class="sql-keyword">HAVING</span> <span class="sql-function">${aggName}</span> ${havingCondition.operator} <span class="sql-number">${havingCondition.value}</span>`;
    }
    
    sqlOutput.innerHTML = sql;
  }

  renderResults(groups) {
    const resultsContainer = this.container.querySelector('#results-table');
    
    if (this.selectedAggregates.length === 0) {
      resultsContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary, #64748b);">Select aggregate functions to see results</div>';
      this.container.querySelector('#results-count-badge').textContent = '0 rows';
      return;
    }
    
    const headers = [];
    if (this.groupByColumn) {
      headers.push({ key: this.groupByColumn, label: this.groupByColumn.charAt(0).toUpperCase() + this.groupByColumn.slice(1) });
    }
    this.selectedAggregates.forEach(agg => {
      headers.push({ key: agg, label: this.aggregateFunctions[agg].label });
    });
    
    const rows = groups.map(group => {
      const row = {};
      if (this.groupByColumn) {
        row[this.groupByColumn] = group.key;
      }
      this.selectedAggregates.forEach(agg => {
        const func = this.aggregateFunctions[agg].func;
        row[agg] = func(group.rows);
      });
      return row;
    });
    
    resultsContainer.innerHTML = `
      <table class="results-table">
        <thead>
          <tr>
            ${headers.map(h => `<th>${h.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${headers.map(h => {
                const val = row[h.key];
                let display;
                if (val === null) {
                  display = '<span class="null-value">NULL</span>';
                } else if (typeof val === 'number' && !Number.isInteger(val)) {
                  display = `<span class="result-value">$${val.toFixed(2)}</span>`;
                } else if (typeof val === 'number') {
                  display = `<span class="result-value">${val}</span>`;
                } else {
                  display = val;
                }
                return `<td>${display}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    this.container.querySelector('#results-count-badge').textContent = `${rows.length} row${rows.length !== 1 ? 's' : ''}`;
  }

  toggleShowWork() {
    this.showWorkDetails = !this.showWorkDetails;
    const btn = this.container.querySelector('#btn-show-work');
    btn.textContent = this.showWorkDetails ? '📖 Hide Work' : '📖 Show Work';
    
    // Apply WHERE filter
    this.filteredData = this.applyWhere(this.data);
    let groups = this.groupData(this.filteredData);
    groups = this.applyHaving(groups);
    
    if (this.showWorkDetails) {
      this.renderCalculationBreakdown(groups);
    } else {
      this.container.querySelector('#calc-breakdown').innerHTML = `
        <div style="text-align: center; color: var(--text-secondary, #64748b); padding: 2rem;">
          Click "Show Work" to see calculation breakdown
        </div>
      `;
    }
  }

  renderCalculationBreakdown(groups) {
    const container = this.container.querySelector('#calc-breakdown');
    
    if (this.selectedAggregates.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 1rem;">Select aggregates to see work</div>';
      return;
    }
    
    let html = '<div class="group-viz">';
    
    // Show WHERE filter effect
    const whereCondition = this.getWhereCondition();
    if (whereCondition) {
      const filteredCount = this.filteredData.length;
      const totalCount = this.data.length;
      html += `
        <div class="calc-step completed">
          <div class="calc-step-header">🔍 WHERE Filter Applied</div>
          <div class="calc-step-detail">${whereCondition.column} ${whereCondition.operator} ${whereCondition.value}: ${filteredCount} of ${totalCount} rows remain</div>
        </div>
      `;
    }
    
    // Show groups
    groups.forEach((group, idx) => {
      const groupLabel = this.groupByColumn ? `${this.groupByColumn} = "${group.key}"` : 'All Rows';
      html += `
        <div class="group-item">
          <div class="group-header">
            <span>${groupLabel}</span>
            <span class="group-count">${group.rows.length} rows</span>
          </div>
          <div style="padding: 0.75rem;">
      `;
      
      this.selectedAggregates.forEach(agg => {
        const config = this.aggregateFunctions[agg];
        const result = config.func(group.rows);
        
        html += `<div style="margin-bottom: 0.75rem;">`;
        html += `<div style="font-weight: 600; margin-bottom: 0.25rem; color: var(--accent-color, #6366f1);">${config.label}</div>`;
        
        // Show calculation based on aggregate type
        if (agg === 'count_star') {
          html += `<div class="calc-step-detail">Count all ${group.rows.length} rows = <strong>${result}</strong></div>`;
        } else if (agg === 'count_col') {
          const nonNull = group.rows.filter(r => r.price !== null);
          const nulls = group.rows.filter(r => r.price === null);
          html += `<div class="calc-step-detail">Non-NULL prices: ${nonNull.length}, NULLs: ${nulls.length}</div>`;
          html += `<div class="calc-values">`;
          group.rows.forEach(r => {
            html += `<span class="calc-value ${r.price === null ? 'null' : 'included'}">${r.price === null ? 'NULL' : r.price}</span>`;
          });
          html += `</div>`;
          html += `<div class="calc-step-detail" style="margin-top: 0.25rem;">= <strong>${result}</strong></div>`;
        } else if (agg === 'sum_price') {
          const values = group.rows.filter(r => r.price !== null).map(r => r.price);
          html += `<div class="calc-values">`;
          values.forEach((v, i) => {
            html += `<span class="calc-value">${i > 0 ? '+' : ''}${v}</span>`;
          });
          html += `</div>`;
          html += `<div class="calc-step-detail" style="margin-top: 0.25rem;">= <strong>$${result.toFixed(2)}</strong></div>`;
        } else if (agg === 'avg_price') {
          const nonNull = group.rows.filter(r => r.price !== null);
          const sum = nonNull.reduce((s, r) => s + r.price, 0);
          html += `<div class="calc-step-detail">Sum: $${sum.toFixed(2)} / Count: ${nonNull.length}</div>`;
          html += `<div class="calc-step-detail">= <strong>$${result?.toFixed(2) || 'NULL'}</strong> (NULLs excluded)</div>`;
        } else if (agg === 'sum_revenue') {
          const revenues = group.rows
            .filter(r => r.price !== null && r.quantity !== null)
            .map(r => ({ price: r.price, qty: r.quantity, rev: r.price * r.quantity }));
          html += `<div class="calc-values" style="font-size: 0.75rem;">`;
          revenues.forEach((r, i) => {
            html += `<span class="calc-value">${i > 0 ? '+' : ''}${r.price}×${r.qty}</span>`;
          });
          html += `</div>`;
          html += `<div class="calc-step-detail" style="margin-top: 0.25rem;">= <strong>$${result.toFixed(2)}</strong></div>`;
        } else {
          html += `<div class="calc-step-detail">= <strong>${result !== null ? (typeof result === 'number' ? '$' + result.toFixed(2) : result) : 'NULL'}</strong></div>`;
        }
        
        html += `</div>`;
      });
      
      html += `</div></div>`;
    });
    
    // Show HAVING filter effect
    const havingCondition = this.getHavingCondition();
    if (havingCondition) {
      html += `
        <div class="calc-step completed">
          <div class="calc-step-header">✓ HAVING Filter Applied</div>
          <div class="calc-step-detail">${havingCondition.agg} ${havingCondition.operator} ${havingCondition.value}: ${groups.length} groups remain</div>
        </div>
      `;
    }
    
    html += '</div>';
    container.innerHTML = html;
  }

  animateExecution() {
    if (this.isAnimating) return;
    
    this.showWorkDetails = true;
    this.container.querySelector('#btn-show-work').textContent = '📖 Hide Work';
    this.container.querySelector('#anim-controls').style.display = 'flex';
    
    this.isAnimating = true;
    this.animationStep = 0;
    
    // Calculate steps
    this.calculationBreakdown = this.buildAnimationSteps();
    this.showAnimationStep(0);
  }

  buildAnimationSteps() {
    const steps = [];
    
    // Step 1: Original data
    steps.push({
      title: 'Original Data',
      description: `${this.data.length} rows in the table`,
      highlight: 'all'
    });
    
    // Step 2: Apply WHERE
    const whereCondition = this.getWhereCondition();
    if (whereCondition) {
      steps.push({
        title: 'Apply WHERE Filter',
        description: `Filter: ${whereCondition.column} ${whereCondition.operator} ${whereCondition.value}`,
        highlight: 'filtered'
      });
    }
    
    // Step 3: Group BY
    if (this.groupByColumn) {
      steps.push({
        title: 'GROUP BY',
        description: `Grouping by ${this.groupByColumn}`,
        highlight: 'groups'
      });
    }
    
    // Step 4: Calculate aggregates
    if (this.selectedAggregates.length > 0) {
      steps.push({
        title: 'Calculate Aggregates',
        description: this.selectedAggregates.map(a => this.aggregateFunctions[a].label).join(', '),
        highlight: 'calculation'
      });
    }
    
    // Step 5: Apply HAVING
    const havingCondition = this.getHavingCondition();
    if (havingCondition) {
      steps.push({
        title: 'Apply HAVING Filter',
        description: `Filter groups where ${havingCondition.agg} ${havingCondition.operator} ${havingCondition.value}`,
        highlight: 'having'
      });
    }
    
    // Step 6: Final result
    steps.push({
      title: 'Final Result',
      description: 'Query complete',
      highlight: 'result'
    });
    
    return steps;
  }

  showAnimationStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.calculationBreakdown.length) return;
    
    this.animationStep = stepIndex;
    const step = this.calculationBreakdown[stepIndex];
    
    // Update progress
    const progress = ((stepIndex + 1) / this.calculationBreakdown.length) * 100;
    this.container.querySelector('#anim-progress-bar').style.width = `${progress}%`;
    this.container.querySelector('#anim-step-label').textContent = `Step ${stepIndex + 1} of ${this.calculationBreakdown.length}`;
    
    // Render current step in breakdown
    const container = this.container.querySelector('#calc-breakdown');
    container.innerHTML = `
      <div class="calc-step active">
        <div class="calc-step-header">${step.title}</div>
        <div class="calc-step-detail">${step.description}</div>
      </div>
    `;
    
    // Highlight table rows based on step
    this.highlightTableRows(step.highlight);
  }

  highlightTableRows(highlightType) {
    const rows = this.container.querySelectorAll('.data-table tbody tr');
    rows.forEach(row => row.classList.remove('group-highlight'));
    
    if (highlightType === 'filtered') {
      const filteredIds = new Set(this.filteredData.map(r => r.id));
      rows.forEach(row => {
        const rowId = parseInt(row.dataset.rowId);
        if (filteredIds.has(rowId)) {
          row.classList.add('group-highlight');
        }
      });
    }
  }

  nextAnimStep() {
    if (this.animationStep < this.calculationBreakdown.length - 1) {
      this.showAnimationStep(this.animationStep + 1);
    }
  }

  prevAnimStep() {
    if (this.animationStep > 0) {
      this.showAnimationStep(this.animationStep - 1);
    }
  }

  reset() {
    // Reset all controls
    this.container.querySelectorAll('#aggregate-checkboxes input').forEach(cb => cb.checked = false);
    this.container.querySelector('#groupby-select').value = '';
    this.container.querySelector('#where-column').value = '';
    this.container.querySelector('#where-value').value = '';
    this.container.querySelector('#having-agg').value = '';
    this.container.querySelector('#having-value').value = '';
    
    this.selectedAggregates = [];
    this.groupByColumn = null;
    this.whereCondition = null;
    this.havingCondition = null;
    this.showWorkDetails = false;
    this.isAnimating = false;
    this.animationStep = 0;
    
    this.container.querySelector('#btn-show-work').textContent = '📖 Show Work';
    this.container.querySelector('#anim-controls').style.display = 'none';
    
    this.updateResults();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-simulator="aggregate"]');
  containers.forEach(container => {
    new AggregateSimulator(container.id);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AggregateSimulator, SAMPLE_DATA };
}
