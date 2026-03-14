/**
 * Query Tree Visualizer Simulator
 * ACS-3902 Database Systems - Midterm 2 Prep
 * 
 * Features:
 * - Visual tree representation of queries
 * - Interactive node selection
 * - Execution order animation
 * - SQL/RA to tree conversion
 */

class QueryTreeSimulator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentTree = null;
    this.executionStep = 0;
    this.isAnimating = false;
    this.init();
  }

  init() {
    this.renderInterface();
    this.attachEventListeners();
  }

  renderInterface() {
    this.container.innerHTML = `
      <div class="query-tree-simulator">
        <div class="qt-input-section">
          <h4>Query Input</h4>
          <div class="qt-tabs">
            <button class="qt-tab active" data-tab="sql">SQL</button>
            <button class="qt-tab" data-tab="ra">Relational Algebra</button>
          </div>
          <div class="qt-tab-content">
            <div id="tab-sql" class="tab-panel active">
              <textarea id="sql-input" placeholder="Enter SQL query..." rows="4">SELECT fname, lname FROM Employee WHERE dno = 5</textarea>
            </div>
            <div id="tab-ra" class="tab-panel">
              <textarea id="ra-input" placeholder="Enter RA expression..." rows="4">π fname, lname (σ dno = 5 (Employee))</textarea>
            </div>
          </div>
          <div class="qt-actions">
            <button id="btn-build-tree" class="btn-primary">Build Query Tree</button>
            <button id="btn-animate" class="btn-secondary">Animate Execution</button>
            <button id="btn-reset" class="btn-tertiary">Reset</button>
          </div>
        </div>
        
        <div class="qt-visualization">
          <h4>Query Tree</h4>
          <div class="qt-tree-container" id="tree-container">
            <div class="qt-placeholder">Click "Build Query Tree" to visualize</div>
          </div>
          <div class="qt-execution-info" id="execution-info"></div>
        </div>
        
        <div class="qt-details-panel" id="details-panel">
          <h4>Node Details</h4>
          <div class="details-content">
            <p class="placeholder">Click on a tree node to see details</p>
          </div>
        </div>
        
        <div class="qt-examples">
          <h4>Example Queries</h4>
          <div class="example-buttons">
            <button class="btn-example" data-example="simple">Simple SELECT</button>
            <button class="btn-example" data-example="join">JOIN</button>
            <button class="btn-example" data-example="multi-join">Multi-table JOIN</button>
            <button class="btn-example" data-example="complex">Complex Query</button>
          </div>
        </div>
        
        <div class="qt-legend">
          <h4>Legend</h4>
          <div class="legend-items">
            <div class="legend-item">
              <span class="legend-symbol pi">π</span>
              <span>Projection (SELECT)</span>
            </div>
            <div class="legend-item">
              <span class="legend-symbol sigma">σ</span>
              <span>Selection (WHERE)</span>
            </div>
            <div class="legend-item">
              <span class="legend-symbol join">⨝</span>
              <span>Join</span>
            </div>
            <div class="legend-item">
              <span class="legend-symbol table">▭</span>
              <span>Table/Relation</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Tab switching
    this.container.querySelectorAll('.qt-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    // Build tree
    this.container.querySelector('#btn-build-tree')?.addEventListener('click', () => this.buildTree());
    
    // Animate
    this.container.querySelector('#btn-animate')?.addEventListener('click', () => this.animateExecution());
    
    // Reset
    this.container.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());
    
    // Examples
    this.container.querySelectorAll('.btn-example').forEach(btn => {
      btn.addEventListener('click', () => this.loadExample(btn.dataset.example));
    });
  }

  switchTab(tab) {
    this.container.querySelectorAll('.qt-tab').forEach(t => t.classList.remove('active'));
    this.container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    
    this.container.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
    this.container.querySelector(`#tab-${tab}`)?.classList.add('active');
  }

  buildTree() {
    const activeTab = this.container.querySelector('.qt-tab.active')?.dataset.tab;
    let tree;
    
    if (activeTab === 'sql') {
      const sql = this.container.querySelector('#sql-input').value;
      tree = this.parseSQL(sql);
    } else {
      const ra = this.container.querySelector('#ra-input').value;
      tree = this.parseRA(ra);
    }
    
    this.currentTree = tree;
    this.renderTree(tree);
    this.showExecutionOrder(tree);
  }

  parseSQL(sql) {
    // Simplified SQL parser for query tree construction
    sql = sql.toUpperCase();
    
    const tree = {
      type: 'root',
      children: []
    };
    
    // Extract SELECT columns
    const selectMatch = sql.match(/SELECT\s+(DISTINCT\s+)?(.+?)\s+FROM/i);
    const columns = selectMatch ? selectMatch[2].trim() : '*';
    const isDistinct = !!selectMatch?.[1];
    
    // Extract tables and joins
    const fromMatch = sql.match(/FROM\s+(.+?)(?:WHERE|GROUP|HAVING|ORDER|$)/i);
    const fromClause = fromMatch ? fromMatch[1].trim() : '';
    
    // Extract WHERE conditions
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:GROUP|HAVING|ORDER|$)/i);
    const whereClause = whereMatch ? whereMatch[1].trim() : null;
    
    // Build tree structure bottom-up
    let leafNodes = [];
    
    // Parse tables
    const tables = this.parseTables(fromClause);
    tables.forEach(table => {
      leafNodes.push({
        type: 'table',
        name: table.name,
        alias: table.alias,
        id: `table-${table.name}`
      });
    });
    
    // Add join nodes if multiple tables
    let currentLevel = [...leafNodes];
    if (currentLevel.length > 1) {
      // Check for explicit joins
      const joinMatches = fromClause.match(/(\w+)\s+(?:(?:INNER|LEFT|RIGHT|FULL)?\s*JOIN)\s+(\w+)\s+ON\s+(.+?)(?=(?:\s+(?:INNER|LEFT|RIGHT|FULL)?\s*JOIN|\s+WHERE|\s+GROUP|\s+ORDER|$))/gi);
      
      if (joinMatches) {
        joinMatches.forEach((join, index) => {
          const joinParts = join.match(/(\w+)\s+(?:(?:INNER|LEFT|RIGHT|FULL)?\s*JOIN)\s+(\w+)\s+ON\s+(.+)/i);
          if (joinParts) {
            currentLevel.push({
              type: 'join',
              joinType: 'inner',
              condition: joinParts[3].trim(),
              left: currentLevel.find(n => n.name === joinParts[1]) || currentLevel[0],
              right: currentLevel.find(n => n.name === joinParts[2]) || currentLevel[1],
              id: `join-${index}`
            });
          }
        });
      } else {
        // Implicit join (comma-separated)
        currentLevel = [{
          type: 'join',
          joinType: 'cross',
          condition: whereClause || 'true',
          children: currentLevel,
          id: 'join-0'
        }];
      }
    }
    
    // Add selection node if WHERE clause
    if (whereClause) {
      currentLevel = [{
        type: 'selection',
        condition: whereClause,
        child: currentLevel[currentLevel.length - 1],
        id: 'select-0'
      }];
    }
    
    // Add projection node at root
    tree.root = {
      type: 'projection',
      columns: columns,
      isDistinct: isDistinct,
      child: currentLevel[currentLevel.length - 1],
      id: 'project-0'
    };
    
    return tree;
  }

  parseTables(fromClause) {
    const tables = [];
    // Handle comma-separated and explicit JOINs
    const parts = fromClause.split(/,|\s+(?:INNER|LEFT|RIGHT|FULL)?\s*JOIN/i);
    
    parts.forEach(part => {
      part = part.trim();
      if (!part) return;
      
      // Remove ON clause if present
      part = part.replace(/\s+ON\s+.+$/i, '');
      
      const match = part.match(/^(\w+)(?:\s+(?:AS\s+)?(\w+))?$/i);
      if (match) {
        tables.push({
          name: match[1],
          alias: match[2] || null
        });
      }
    });
    
    return tables;
  }

  parseRA(ra) {
    // Parse RA expression to tree structure
    ra = ra.trim();
    
    const tree = { type: 'root' };
    
    // Check for projection
    if (ra.startsWith('π')) {
      const match = ra.match(/^π\s*([^()]+)\s*\((.*)\)$/s);
      if (match) {
        tree.root = {
          type: 'projection',
          columns: match[1].trim(),
          child: this.parseRAInner(match[2].trim()),
          id: 'project-0'
        };
      }
    } else if (ra.startsWith('σ')) {
      const match = ra.match(/^σ\s*([^()]+)\s*\((.*)\)$/s);
      if (match) {
        tree.root = {
          type: 'selection',
          condition: match[1].trim(),
          child: this.parseRAInner(match[2].trim()),
          id: 'select-0'
        };
      }
    } else {
      // Simple relation or join
      tree.root = this.parseRAInner(ra);
    }
    
    return tree;
  }

  parseRAInner(ra) {
    ra = ra.trim();
    
    // Check for join
    if (ra.includes('⨝')) {
      const parts = ra.split('⨝');
      const left = parts[0].trim();
      const rest = parts[1].trim();
      
      const conditionMatch = rest.match(/^(.+?)\s+(.+)$/);
      if (conditionMatch) {
        return {
          type: 'join',
          condition: conditionMatch[1].trim() + ' = ' + conditionMatch[2].trim(),
          left: this.parseRAInner(left),
          right: { type: 'table', name: conditionMatch[2].trim(), id: `table-${conditionMatch[2].trim()}` },
          id: 'join-0'
        };
      }
    }
    
    // Check for selection
    if (ra.startsWith('σ')) {
      const match = ra.match(/^σ\s*([^()]+)\s*\((.*)\)$/s);
      if (match) {
        return {
          type: 'selection',
          condition: match[1].trim(),
          child: this.parseRAInner(match[2].trim()),
          id: 'select-inner'
        };
      }
    }
    
    // Simple table
    return { type: 'table', name: ra, id: `table-${ra}` };
  }

  renderTree(tree) {
    const container = this.container.querySelector('#tree-container');
    if (!tree || !tree.root) {
      container.innerHTML = '<div class="error">Could not parse query</div>';
      return;
    }
    
    container.innerHTML = this.buildTreeHTML(tree.root);
    
    // Add click handlers to nodes
    container.querySelectorAll('.qt-node').forEach(node => {
      node.addEventListener('click', () => this.showNodeDetails(node.dataset.nodeId));
    });
  }

  buildTreeHTML(node) {
    if (!node) return '';
    
    const nodeClass = `qt-node qt-${node.type}`;
    const nodeContent = this.getNodeContent(node);
    
    let childrenHTML = '';
    if (node.children && node.children.length > 0) {
      childrenHTML = `
        <div class="qt-children">
          ${node.children.map(child => this.buildTreeHTML(child)).join('')}
        </div>
      `;
    } else if (node.child) {
      childrenHTML = `
        <div class="qt-children">
          ${this.buildTreeHTML(node.child)}
        </div>
      `;
    } else if (node.left && node.right) {
      childrenHTML = `
        <div class="qt-children qt-binary">
          ${this.buildTreeHTML(node.left)}
          ${this.buildTreeHTML(node.right)}
        </div>
      `;
    }
    
    return `
      <div class="${nodeClass}" data-node-id="${node.id}" data-node-type="${node.type}">
        <div class="qt-node-content">
          ${nodeContent}
        </div>
        ${childrenHTML}
      </div>
    `;
  }

  getNodeContent(node) {
    switch (node.type) {
      case 'projection':
        return `
          <div class="node-symbol pi">π</div>
          <div class="node-info">
            <span class="node-label">PROJECT</span>
            <span class="node-detail">${node.columns}</span>
            ${node.isDistinct ? '<span class="badge">DISTINCT</span>' : ''}
          </div>
        `;
      case 'selection':
        return `
          <div class="node-symbol sigma">σ</div>
          <div class="node-info">
            <span class="node-label">SELECT</span>
            <span class="node-detail">${node.condition}</span>
          </div>
        `;
      case 'join':
        return `
          <div class="node-symbol join">⨝</div>
          <div class="node-info">
            <span class="node-label">JOIN</span>
            <span class="node-detail">ON ${node.condition}</span>
          </div>
        `;
      case 'table':
        return `
          <div class="node-symbol table">▭</div>
          <div class="node-info">
            <span class="node-label">${node.name}</span>
            ${node.alias ? `<span class="node-alias">AS ${node.alias}</span>` : ''}
          </div>
        `;
      default:
        return `<div class="node-info"><span class="node-label">${node.type}</span></div>`;
    }
  }

  showNodeDetails(nodeId) {
    const node = this.findNode(this.currentTree?.root, nodeId);
    if (!node) return;
    
    const panel = this.container.querySelector('#details-panel .details-content');
    
    let detailsHTML = `
      <div class="node-details">
        <h5>${node.type.toUpperCase()} Node</h5>
        <div class="detail-row">
          <span class="detail-label">ID:</span>
          <span class="detail-value">${node.id}</span>
        </div>
    `;
    
    if (node.columns) {
      detailsHTML += `
        <div class="detail-row">
          <span class="detail-label">Columns:</span>
          <span class="detail-value">${node.columns}</span>
        </div>
      `;
    }
    
    if (node.condition) {
      detailsHTML += `
        <div class="detail-row">
          <span class="detail-label">Condition:</span>
          <span class="detail-value">${node.condition}</span>
        </div>
      `;
    }
    
    if (node.name) {
      detailsHTML += `
        <div class="detail-row">
          <span class="detail-label">Table:</span>
          <span class="detail-value">${node.name}</span>
        </div>
      `;
    }
    
    detailsHTML += `
        <div class="detail-row">
          <span class="detail-label">Execution:</span>
          <span class="detail-value">${this.getExecutionDescription(node)}</span>
        </div>
      </div>
    `;
    
    panel.innerHTML = detailsHTML;
  }

  findNode(root, nodeId) {
    if (!root) return null;
    if (root.id === nodeId) return root;
    
    if (root.child) {
      const found = this.findNode(root.child, nodeId);
      if (found) return found;
    }
    
    if (root.children) {
      for (const child of root.children) {
        const found = this.findNode(child, nodeId);
        if (found) return found;
      }
    }
    
    if (root.left) {
      const found = this.findNode(root.left, nodeId);
      if (found) return found;
    }
    
    if (root.right) {
      const found = this.findNode(root.right, nodeId);
      if (found) return found;
    }
    
    return null;
  }

  getExecutionDescription(node) {
    switch (node.type) {
      case 'table':
        return 'Scan all rows from the table';
      case 'selection':
        return 'Filter rows that satisfy the condition';
      case 'projection':
        return 'Select specified columns, eliminate duplicates if DISTINCT';
      case 'join':
        return 'Combine rows from both inputs based on join condition';
      default:
        return 'Process input and produce output';
    }
  }

  showExecutionOrder(tree) {
    const info = this.container.querySelector('#execution-info');
    const order = this.calculateExecutionOrder(tree.root);
    
    info.innerHTML = `
      <h5>Execution Order (Bottom-Up)</h5>
      <ol class="execution-steps">
        ${order.map((step, i) => `
          <li data-step="${i}">
            <span class="step-num">${i + 1}</span>
            <span class="step-type">${step.type}</span>
            <span class="step-desc">${step.description}</span>
          </li>
        `).join('')}
      </ol>
    `;
  }

  calculateExecutionOrder(node, order = []) {
    if (!node) return order;
    
    // Process children first (bottom-up)
    if (node.children) {
      node.children.forEach(child => this.calculateExecutionOrder(child, order));
    }
    if (node.child) {
      this.calculateExecutionOrder(node.child, order);
    }
    if (node.left) {
      this.calculateExecutionOrder(node.left, order);
    }
    if (node.right) {
      this.calculateExecutionOrder(node.right, order);
    }
    
    // Add current node
    order.push({
      type: node.type.toUpperCase(),
      description: this.getExecutionDescription(node),
      nodeId: node.id
    });
    
    return order;
  }

  animateExecution() {
    if (this.isAnimating) return;
    if (!this.currentTree) {
      this.buildTree();
    }
    
    this.isAnimating = true;
    this.executionStep = 0;
    
    const order = this.calculateExecutionOrder(this.currentTree.root);
    const container = this.container.querySelector('#tree-container');
    
    // Reset all nodes
    container.querySelectorAll('.qt-node').forEach(n => {
      n.classList.remove('active', 'completed');
    });
    
    const animateStep = () => {
      if (this.executionStep >= order.length) {
        this.isAnimating = false;
        return;
      }
      
      const step = order[this.executionStep];
      const node = container.querySelector(`[data-node-id="${step.nodeId}"]`);
      
      if (node) {
        // Mark previous as completed
        container.querySelectorAll('.qt-node.active').forEach(n => {
          n.classList.remove('active');
          n.classList.add('completed');
        });
        
        // Highlight current
        node.classList.add('active');
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Highlight in execution list
      const listItems = this.container.querySelectorAll('.execution-steps li');
      listItems.forEach(li => li.classList.remove('current'));
      const currentItem = this.container.querySelector(`.execution-steps li[data-step="${this.executionStep}"]`);
      if (currentItem) currentItem.classList.add('current');
      
      this.executionStep++;
      setTimeout(animateStep, 1500);
    };
    
    animateStep();
  }

  reset() {
    this.isAnimating = false;
    this.executionStep = 0;
    this.currentTree = null;
    
    this.container.querySelector('#tree-container').innerHTML = '<div class="qt-placeholder">Click "Build Query Tree" to visualize</div>';
    this.container.querySelector('#execution-info').innerHTML = '';
    this.container.querySelector('#details-panel .details-content').innerHTML = '<p class="placeholder">Click on a tree node to see details</p>';
  }

  loadExample(exampleType) {
    const examples = {
      simple: {
        sql: "SELECT fname, lname FROM Employee WHERE dno = 5",
        ra: "π fname, lname (σ dno = 5 (Employee))"
      },
      join: {
        sql: "SELECT e.fname, d.dname FROM Employee e JOIN Department d ON e.dno = d.dnumber",
        ra: "π fname, dname (Employee ⨝ dno = dnumber Department)"
      },
      'multi-join': {
        sql: "SELECT e.fname, d.dname, p.pname FROM Employee e JOIN Department d ON e.dno = d.dnumber JOIN Project p ON d.dnumber = p.dnum",
        ra: "π fname, dname, pname ((Employee ⨝ dno = dnumber Department) ⨝ dnumber = dnum Project)"
      },
      complex: {
        sql: "SELECT DISTINCT d.dname, AVG(e.salary) FROM Employee e JOIN Department d ON e.dno = d.dnumber WHERE e.salary > 30000 GROUP BY d.dname",
        ra: "π dname, AVG(salary) (σ salary > 30000 (Employee ⨝ dno = dnumber Department))"
      }
    };
    
    const example = examples[exampleType];
    if (example) {
      this.container.querySelector('#sql-input').value = example.sql;
      this.container.querySelector('#ra-input').value = example.ra;
      this.switchTab('sql');
      this.buildTree();
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-simulator="query-tree"]');
  containers.forEach(container => {
    new QueryTreeSimulator(container.id);
  });
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QueryTreeSimulator;
}
