/**
 * CTE (Common Table Expression) Builder Simulator
 * ACS-3902 Database Systems - Midterm 2 Prep
 * 
 * Features:
 * - Non-recursive CTE builder
 * - Recursive CTE builder with visualization
 * - Step-by-step recursion animation
 * - Org chart examples
 */

class CTESimulator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentMode = 'non-recursive';
    this.animationStep = 0;
    this.isAnimating = false;
    this.init();
  }

  init() {
    this.renderInterface();
    this.attachEventListeners();
    this.loadSampleData();
  }

  renderInterface() {
    this.container.innerHTML = `
      <div class="cte-simulator">
        <div class="cte-mode-selector">
          <h4>CTE Type</h4>
          <div class="mode-buttons">
            <button class="mode-btn active" data-mode="non-recursive">Non-Recursive</button>
            <button class="mode-btn" data-mode="recursive">Recursive</button>
          </div>
        </div>
        
        <div class="cte-workspace">
          <div class="cte-builder">
            <h4>CTE Builder</h4>
            
            <div class="cte-template-section">
              <div class="template-label">Template:</div>
              <div class="cte-template" id="cte-template"></div>
            </div>
            
            <div class="cte-inputs" id="cte-inputs">
              <!-- Dynamic inputs based on mode -->
            </div>
            
            <div class="cte-preview">
              <h5>Generated SQL</h5>
              <div class="sql-preview" id="sql-preview">
                <pre><code>-- CTE will appear here...</code></pre>
              </div>
            </div>
            
            <div class="cte-actions">
              <button id="btn-run-cte" class="btn-primary">Run Query</button>
              <button id="btn-animate-recursion" class="btn-secondary" style="display:none;">Animate Recursion</button>
              <button id="btn-clear-cte" class="btn-tertiary">Clear</button>
            </div>
          </div>
          
          <div class="cte-visualization" id="cte-viz">
            <h4>Results</h4>
            <div class="viz-container" id="viz-container">
              <div class="placeholder">Run the query to see results</div>
            </div>
          </div>
        </div>
        
        <div class="cte-examples">
          <h4>Example Scenarios</h4>
          <div class="example-cards">
            <div class="example-card" data-example="org-chart">
              <div class="card-title">Organization Chart</div>
              <div class="card-desc">Find all subordinates of a manager</div>
            </div>
            <div class="example-card" data-example="high-earners">
              <div class="card-title">High Earners Report</div>
              <div class="card-desc">Non-recursive CTE with aggregation</div>
            </div>
            <div class="example-card" data-example="bill-of-materials">
              <div class="card-title">Bill of Materials</div>
              <div class="card-desc">Recursive product component tree</div>
            </div>
            <div class="example-card" data-example="ancestors">
              <div class="card-title">Find Ancestors</div>
              <div class="card-desc">Traverse up the hierarchy</div>
            </div>
          </div>
        </div>
        
        <div class="cte-education">
          <h4>CTE Structure Reference</h4>
          <div class="structure-tabs">
            <button class="struct-tab active" data-struct="non-recursive">Non-Recursive CTE</button>
            <button class="struct-tab" data-struct="recursive">Recursive CTE</button>
          </div>
          <div class="structure-content" id="structure-content">
            <!-- Dynamic content -->
          </div>
        </div>
      </div>
    `;
    
    this.updateTemplate();
    this.updateStructureContent();
  }

  attachEventListeners() {
    // Mode switching
    this.container.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchMode(btn.dataset.mode));
    });
    
    // Structure tabs
    this.container.querySelectorAll('.struct-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchStructureTab(tab.dataset.struct));
    });
    
    // Actions
    this.container.querySelector('#btn-run-cte')?.addEventListener('click', () => this.runQuery());
    this.container.querySelector('#btn-animate-recursion')?.addEventListener('click', () => this.animateRecursion());
    this.container.querySelector('#btn-clear-cte')?.addEventListener('click', () => this.clearCTE());
    
    // Example cards
    this.container.querySelectorAll('.example-card').forEach(card => {
      card.addEventListener('click', () => this.loadExample(card.dataset.example));
    });
  }

  switchMode(mode) {
    this.currentMode = mode;
    
    this.container.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    this.updateTemplate();
    this.container.querySelector('#btn-animate-recursion').style.display = 
      mode === 'recursive' ? 'inline-block' : 'none';
    
    this.clearCTE();
  }

  updateTemplate() {
    const templateDiv = this.container.querySelector('#cte-template');
    const inputsDiv = this.container.querySelector('#cte-inputs');
    
    if (this.currentMode === 'non-recursive') {
      templateDiv.innerHTML = `
        <pre><code>WITH cte_name AS (
  -- CTE query definition
  SELECT ...
)
SELECT * FROM cte_name;</code></pre>
      `;
      
      inputsDiv.innerHTML = `
        <div class="input-group">
          <label>CTE Name:</label>
          <input type="text" id="cte-name" placeholder="e.g., high_earners" value="cte_result">
        </div>
        <div class="input-group">
          <label>CTE Query (SELECT ... FROM ... WHERE ...):</label>
          <textarea id="cte-query" rows="3" placeholder="SELECT employee_id, fname, lname, salary FROM Employee WHERE salary > 50000"></textarea>
        </div>
        <div class="input-group">
          <label>Final Query:</label>
          <textarea id="final-query" rows="2" placeholder="SELECT * FROM cte_result ORDER BY salary DESC">SELECT * FROM cte_result</textarea>
        </div>
      `;
    } else {
      templateDiv.innerHTML = `
        <pre><code>WITH RECURSIVE cte_name AS (
  -- Anchor member (starting point)
  SELECT ... FROM ... WHERE ...
  
  UNION [ALL]
  
  -- Recursive member
  SELECT ... FROM ... 
  INNER JOIN cte_name ON ...
)
SELECT * FROM cte_name;</code></pre>
      `;
      
      inputsDiv.innerHTML = `
        <div class="input-group">
          <label>CTE Name:</label>
          <input type="text" id="cte-name" placeholder="e.g., subordinates" value="org_hierarchy">
        </div>
        <div class="input-group">
          <label>Anchor Member (starting row(s)):</label>
          <textarea id="anchor-query" rows="2" placeholder="SELECT emp_id, name, manager_id, 0 as level FROM Employee WHERE name = 'James'">SELECT emp_id, name, manager_id, 0 as level FROM Employee WHERE name = 'James'</textarea>
        </div>
        <div class="input-group">
          <label>Union Type:</label>
          <select id="union-type">
            <option value="UNION">UNION (eliminate duplicates)</option>
            <option value="UNION ALL">UNION ALL (keep duplicates)</option>
          </select>
        </div>
        <div class="input-group">
          <label>Recursive Member:</label>
          <textarea id="recursive-query" rows="3" placeholder="SELECT e.emp_id, e.name, e.manager_id, level + 1 FROM Employee e INNER JOIN org_hierarchy oh ON e.manager_id = oh.emp_id">SELECT e.emp_id, e.name, e.manager_id, oh.level + 1 
FROM Employee e 
INNER JOIN org_hierarchy oh ON e.manager_id = oh.emp_id</textarea>
        </div>
        <div class="input-group">
          <label>Final Query:</label>
          <textarea id="final-query" rows="2">SELECT * FROM org_hierarchy</textarea>
        </div>
      `;
    }
    
    // Add input listeners for live preview
    inputsDiv.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('input', () => this.updatePreview());
    });
    
    this.updatePreview();
  }

  updatePreview() {
    const previewDiv = this.container.querySelector('#sql-preview pre code');
    
    const cteName = this.container.querySelector('#cte-name')?.value || 'cte_result';
    
    if (this.currentMode === 'non-recursive') {
      const cteQuery = this.container.querySelector('#cte-query')?.value || '-- CTE query';
      const finalQuery = this.container.querySelector('#final-query')?.value || 'SELECT * FROM cte_result';
      
      previewDiv.textContent = `WITH ${cteName} AS (
  ${cteQuery}
)
${finalQuery};`;
    } else {
      const anchorQuery = this.container.querySelector('#anchor-query')?.value || '-- Anchor';
      const unionType = this.container.querySelector('#union-type')?.value || 'UNION';
      const recursiveQuery = this.container.querySelector('#recursive-query')?.value || '-- Recursive';
      const finalQuery = this.container.querySelector('#final-query')?.value || 'SELECT * FROM cte_result';
      
      previewDiv.textContent = `WITH RECURSIVE ${cteName} AS (
  ${anchorQuery}
  
  ${unionType}
  
  ${recursiveQuery}
)
${finalQuery};`;
    }
  }

  runQuery() {
    if (this.currentMode === 'non-recursive') {
      this.simulateNonRecursiveResult();
    } else {
      this.simulateRecursiveResult();
    }
  }

  simulateNonRecursiveResult() {
    const cteName = this.container.querySelector('#cte-name')?.value || 'cte_result';
    const cteQuery = this.container.querySelector('#cte-query')?.value || '';
    
    // Parse the query to determine what data to show
    const vizContainer = this.container.querySelector('#viz-container');
    
    // Simulate result based on query content
    let resultData = [];
    
    if (cteQuery.toLowerCase().includes('salary')) {
      resultData = [
        { id: 1, name: 'John Smith', dept: 'Engineering', salary: 85000 },
        { id: 2, name: 'Sarah Jones', dept: 'Marketing', salary: 92000 },
        { id: 3, name: 'Mike Brown', dept: 'Engineering', salary: 78000 },
        { id: 4, name: 'Lisa Davis', dept: 'Sales', salary: 88000 }
      ];
    } else if (cteQuery.toLowerCase().includes('department') || cteQuery.toLowerCase().includes('dno')) {
      resultData = [
        { dnumber: 1, dname: 'Headquarters', mgr_ssn: '888665555', locations: ['Houston'] },
        { dnumber: 4, dname: 'Administration', mgr_ssn: '987654321', locations: ['Stafford'] },
        { dnumber: 5, dname: 'Research', mgr_ssn: '333445555', locations: ['Bellaire', 'Sugarland', 'Houston'] }
      ];
    } else {
      resultData = [
        { fname: 'John', lname: 'Smith', ssn: '123456789', salary: 30000 },
        { fname: 'Franklin', lname: 'Wong', ssn: '333445555', salary: 40000 },
        { fname: 'Alicia', lname: 'Zelaya', ssn: '999887777', salary: 25000 }
      ];
    }
    
    vizContainer.innerHTML = `
      <div class="cte-result">
        <div class="result-header">
          <h5>CTE: ${cteName}</h5>
          <span class="row-count">${resultData.length} rows</span>
        </div>
        <div class="result-table-container">
          <table class="result-table">
            <thead>
              <tr>${Object.keys(resultData[0]).map(k => `<th>${k}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${resultData.map(row => `
                <tr>${Object.values(row).map(v => `<td>${v}</td>`).join('')}</tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="execution-note">
          <p><strong>Execution:</strong> The CTE creates a temporary result set that exists only during this query execution.</p>
        </div>
      </div>
    `;
  }

  simulateRecursiveResult() {
    const cteName = this.container.querySelector('#cte-name')?.value || 'org_hierarchy';
    const anchorQuery = this.container.querySelector('#anchor-query')?.value || '';
    
    // Parse anchor to find starting point
    let startName = 'James';
    const nameMatch = anchorQuery.match(/name\s*=\s*['"](\w+)['"]/i);
    if (nameMatch) startName = nameMatch[1];
    
    // Simulate org hierarchy data
    const orgData = {
      'James': { id: 1, children: ['Peter', 'Andrew'] },
      'Peter': { id: 4, children: ['Judy', 'Tyler'] },
      'Andrew': { id: 3, children: ['Linda', 'Mary', 'Lee'] },
      'Judy': { id: 21, children: ['Joe'] },
      'Tyler': { id: 24, children: [] },
      'Linda': { id: 12, children: [] },
      'Mary': { id: 5, children: [] },
      'Lee': { id: 9, children: [] },
      'Joe': { id: 22, children: [] }
    };
    
    // Build recursive result
    const iterations = [];
    let currentLevel = [{ name: startName, level: 0, parent: null }];
    
    while (currentLevel.length > 0) {
      iterations.push([...currentLevel]);
      const nextLevel = [];
      currentLevel.forEach(person => {
        const children = orgData[person.name]?.children || [];
        children.forEach(child => {
          nextLevel.push({ name: child, level: person.level + 1, parent: person.name });
        });
      });
      currentLevel = nextLevel;
    }
    
    const vizContainer = this.container.querySelector('#viz-container');
    
    vizContainer.innerHTML = `
      <div class="recursive-result">
        <div class="result-header">
          <h5>Recursive CTE: ${cteName}</h5>
          <span class="row-count">${iterations.flat().length} total rows</span>
        </div>
        
        <div class="recursion-iterations">
          ${iterations.map((iteration, i) => `
            <div class="iteration" data-iteration="${i}">
              <div class="iteration-header">Iteration ${i} ${i === 0 ? '(Anchor)' : '(Recursive)'}</div>
              <div class="iteration-rows">
                ${iteration.map(row => `
                  <div class="hierarchy-row" style="padding-left: ${row.level * 20}px">
                    <span class="level-indicator">L${row.level}</span>
                    <span class="person-name">${row.name}</span>
                    ${row.parent ? `<span class="parent-ref">(reports to ${row.parent})</span>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="final-result">
          <h6>Final Result (UNION of all iterations)</h6>
          <div class="hierarchy-tree">
            ${this.renderHierarchyTree(orgData, startName)}
          </div>
        </div>
        
        <div class="execution-note">
          <p><strong>Recursion:</strong> Starts with the anchor (${startName}), then repeatedly finds subordinates until no more are found.</p>
        </div>
      </div>
    `;
  }

  renderHierarchyTree(orgData, rootName, level = 0) {
    const node = orgData[rootName];
    if (!node) return '';
    
    const children = node.children || [];
    
    return `
      <div class="tree-node" style="margin-left: ${level * 20}px">
        <div class="node-content">
          <span class="node-name">${rootName}</span>
          <span class="node-id">(ID: ${node.id})</span>
        </div>
        ${children.map(child => this.renderHierarchyTree(orgData, child, level + 1)).join('')}
      </div>
    `;
  }

  animateRecursion() {
    if (this.isAnimating || this.currentMode !== 'recursive') return;
    
    this.isAnimating = true;
    this.animationStep = 0;
    
    const iterations = this.container.querySelectorAll('.iteration');
    iterations.forEach(iter => iter.classList.remove('active', 'highlighted'));
    
    const animateNext = () => {
      if (this.animationStep >= iterations.length) {
        this.isAnimating = false;
        // Highlight final result
        this.container.querySelector('.final-result')?.classList.add('highlighted');
        return;
      }
      
      // Remove previous highlight
      iterations.forEach(iter => iter.classList.remove('active'));
      
      // Highlight current iteration
      const current = iterations[this.animationStep];
      if (current) {
        current.classList.add('active');
        current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      this.animationStep++;
      setTimeout(animateNext, 2000);
    };
    
    animateNext();
  }

  clearCTE() {
    this.container.querySelector('#viz-container').innerHTML = '<div class="placeholder">Run the query to see results</div>';
    this.isAnimating = false;
    this.animationStep = 0;
  }

  switchStructureTab(struct) {
    this.container.querySelectorAll('.struct-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.struct === struct);
    });
    this.updateStructureContent(struct);
  }

  updateStructureContent(activeStruct = 'non-recursive') {
    const contentDiv = this.container.querySelector('#structure-content');
    
    if (activeStruct === 'non-recursive') {
      contentDiv.innerHTML = `
        <div class="structure-diagram">
          <div class="structure-step">
            <div class="step-num">1</div>
            <div class="step-content">
              <strong>WITH clause</strong>
              <p>Introduces the CTE and gives it a name</p>
              <code>WITH cte_name AS</code>
            </div>
          </div>
          <div class="structure-step">
            <div class="step-num">2</div>
            <div class="step-content">
              <strong>CTE Query</strong>
              <p>Defines the temporary result set</p>
              <code>(SELECT ... FROM ... WHERE ...)</code>
            </div>
          </div>
          <div class="structure-step">
            <div class="step-num">3</div>
            <div class="step-content">
              <strong>Final Query</strong>
              <p>Uses the CTE like a regular table</p>
              <code>SELECT * FROM cte_name;</code>
            </div>
          </div>
        </div>
        <div class="structure-notes">
          <h6>Use Cases:</h6>
          <ul>
            <li>Break complex queries into readable parts</li>
            <li>Avoid repeating subqueries</li>
            <li>Create intermediate calculations</li>
          </ul>
        </div>
      `;
    } else {
      contentDiv.innerHTML = `
        <div class="structure-diagram">
          <div class="structure-step">
            <div class="step-num">1</div>
            <div class="step-content">
              <strong>Anchor Member</strong>
              <p>Non-recursive starting point</p>
              <code>SELECT ... FROM ... WHERE condition</code>
            </div>
          </div>
          <div class="structure-step">
            <div class="step-num">2</div>
            <div class="step-content">
              <strong>UNION [ALL]</strong>
              <p>Combines anchor with recursive results</p>
              <code>UNION or UNION ALL</code>
            </div>
          </div>
          <div class="structure-step">
            <div class="step-num">3</div>
            <div class="step-content">
              <strong>Recursive Member</strong>
              <p>References the CTE itself to find next level</p>
              <code>SELECT ... FROM table JOIN cte ON ...</code>
            </div>
          </div>
        </div>
        <div class="structure-notes">
          <h6>Important Rules:</h6>
          <ul>
            <li>Anchor must come first</li>
            <li>Recursive member must reference the CTE</li>
            <li>Must use UNION or UNION ALL</li>
            <li>Recursion stops when no new rows found</li>
          </ul>
        </div>
      `;
    }
  }

  loadExample(exampleType) {
    const examples = {
      'org-chart': {
        mode: 'recursive',
        name: 'subordinates',
        anchor: "SELECT emp_id, name, manager_id, 0 as level\nFROM Employee\nWHERE name = 'James'",
        union: 'UNION',
        recursive: "SELECT e.emp_id, e.name, e.manager_id, oh.level + 1\nFROM Employee e\nINNER JOIN subordinates oh ON e.manager_id = oh.emp_id",
        final: 'SELECT * FROM subordinates ORDER BY level, name'
      },
      'high-earners': {
        mode: 'non-recursive',
        name: 'high_earners',
        cte: "SELECT employee_id, fname, lname, salary, dno\nFROM Employee\nWHERE salary > 60000",
        final: "SELECT h.*, d.dname\nFROM high_earners h\nJOIN Department d ON h.dno = d.dnumber\nORDER BY salary DESC"
      },
      'bill-of-materials': {
        mode: 'recursive',
        name: 'component_tree',
        anchor: "SELECT component_id, name, parent_id, quantity, 1 as level\nFROM Components\nWHERE name = 'Widget'",
        union: 'UNION ALL',
        recursive: "SELECT c.component_id, c.name, c.parent_id, c.quantity, ct.level + 1\nFROM Components c\nINNER JOIN component_tree ct ON c.parent_id = ct.component_id",
        final: 'SELECT * FROM component_tree ORDER BY level, name'
      },
      'ancestors': {
        mode: 'recursive',
        name: 'management_chain',
        anchor: "SELECT emp_id, name, manager_id, 0 as level\nFROM Employee\nWHERE emp_id = 10",
        union: 'UNION ALL',
        recursive: "SELECT e.emp_id, e.name, e.manager_id, mc.level + 1\nFROM Employee e\nINNER JOIN management_chain mc ON e.emp_id = mc.manager_id",
        final: 'SELECT * FROM management_chain ORDER BY level'
      }
    };
    
    const ex = examples[exampleType];
    if (ex) {
      this.switchMode(ex.mode);
      
      setTimeout(() => {
        const nameInput = this.container.querySelector('#cte-name');
        if (nameInput) nameInput.value = ex.name;
        
        if (ex.mode === 'recursive') {
          this.container.querySelector('#anchor-query').value = ex.anchor;
          this.container.querySelector('#union-type').value = ex.union;
          this.container.querySelector('#recursive-query').value = ex.recursive;
        } else {
          this.container.querySelector('#cte-query').value = ex.cte;
        }
        
        this.container.querySelector('#final-query').value = ex.final;
        this.updatePreview();
        this.runQuery();
      }, 100);
    }
  }

  loadSampleData() {
    // Initialize with default state
    this.updatePreview();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-simulator="cte"]');
  containers.forEach(container => {
    new CTESimulator(container.id);
  });
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CTESimulator;
}
