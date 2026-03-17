/**
 * EERD Drawing Component for ACS-3902 Practice Test System
 * Allows students to draw Enhanced Entity-Relationship Diagrams
 * 
 * @author ACS-3902 Platform
 * @version 1.0.0
 */

/**
 * EERDiagramComponent - Interactive EERD drawing canvas
 * Supports Chen and IE (Crow's Foot) notations
 */
class EERDiagramComponent {
  /**
   * Create a new EERD component
   * @param {HTMLElement} container - The container element
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      notation: 'chen', // 'chen' or 'ie'
      width: 800,
      height: 600,
      gridSize: 20,
      snapToGrid: true,
      showGrid: true,
      zoomEnabled: true,
      panEnabled: true,
      onChange: null,
      onValidate: null,
      ...options
    };

    // State
    this.elements = [];
    this.connections = [];
    this.selectedElement = null;
    this.selectedConnection = null;
    this.mode = 'select'; // 'select', 'entity', 'attribute', 'relationship', 'subtype', 'connect'
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.isPanning = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.connectStart = null;
    this.undoStack = [];
    this.redoStack = [];
    this.elementIdCounter = 0;
    this.connectionIdCounter = 0;

    // Initialize
    this.init();
  }

  /**
   * Initialize the component
   */
  init() {
    this.createDOM();
    this.createSVG();
    this.createPalette();
    this.createToolbar();
    this.createPropertyPanel();
    this.attachEventListeners();
    this.render();
  }

  /**
   * Create the DOM structure
   */
  createDOM() {
    this.container.className = 'eerd-component';
    this.container.innerHTML = `
      <div class="eerd-container">
        <div class="eerd-toolbar"></div>
        <div class="eerd-workspace">
          <div class="eerd-palette"></div>
          <div class="eerd-canvas-wrapper">
            <div class="eerd-canvas"></div>
            <div class="eerd-zoom-controls">
              <button class="eerd-btn-zoom-in" title="Zoom In">+</button>
              <span class="eerd-zoom-level">100%</span>
              <button class="eerd-btn-zoom-out" title="Zoom Out">−</button>
              <button class="eerd-btn-fit" title="Fit to Screen">⟲</button>
            </div>
          </div>
          <div class="eerd-properties"></div>
        </div>
        <div class="eerd-status-bar">
          <span class="eerd-status-text">Ready</span>
          <span class="eerd-element-count">0 elements</span>
        </div>
      </div>
    `;

    this.toolbarEl = this.container.querySelector('.eerd-toolbar');
    this.paletteEl = this.container.querySelector('.eerd-palette');
    this.canvasWrapperEl = this.container.querySelector('.eerd-canvas-wrapper');
    this.canvasEl = this.container.querySelector('.eerd-canvas');
    this.propertiesEl = this.container.querySelector('.eerd-properties');
    this.statusTextEl = this.container.querySelector('.eerd-status-text');
    this.elementCountEl = this.container.querySelector('.eerd-element-count');
    this.zoomLevelEl = this.container.querySelector('.eerd-zoom-level');
  }

  /**
   * Create the SVG canvas
   */
  createSVG() {
    const svgNS = 'http://www.w3.org/2000/svg';
    this.svg = document.createElementNS(svgNS, 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.setAttribute('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
    this.svg.classList.add('eerd-svg');

    // Define markers and patterns
    const defs = document.createElementNS(svgNS, 'defs');
    defs.innerHTML = this.getSVGDefinitions();
    this.svg.appendChild(defs);

    // Grid pattern
    if (this.options.showGrid) {
      this.gridGroup = document.createElementNS(svgNS, 'g');
      this.gridGroup.classList.add('eerd-grid');
      this.drawGrid();
      this.svg.appendChild(this.gridGroup);
    }

    // Connections layer
    this.connectionsGroup = document.createElementNS(svgNS, 'g');
    this.connectionsGroup.classList.add('eerd-connections');
    this.svg.appendChild(this.connectionsGroup);

    // Elements layer
    this.elementsGroup = document.createElementNS(svgNS, 'g');
    this.elementsGroup.classList.add('eerd-elements');
    this.svg.appendChild(this.elementsGroup);

    // Selection highlight layer
    this.selectionGroup = document.createElementNS(svgNS, 'g');
    this.selectionGroup.classList.add('eerd-selection');
    this.svg.appendChild(this.selectionGroup);

    this.canvasEl.appendChild(this.svg);
  }

  /**
   * Get SVG definitions (markers, patterns)
   */
  getSVGDefinitions() {
    return `
      <!-- Arrow markers for relationships -->
      <marker id="arrow-one" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
        <line x1="9" y1="5" x2="1" y2="5" stroke="currentColor" stroke-width="2"/>
      </marker>
      <marker id="arrow-many" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
        <path d="M1,1 L9,5 L1,9" fill="none" stroke="currentColor" stroke-width="2"/>
      </marker>
      <marker id="crow-foot" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
        <path d="M2,2 L10,6 L2,10 M2,6 L10,6" fill="none" stroke="currentColor" stroke-width="2"/>
      </marker>
      
      <!-- Selection pattern -->
      <pattern id="selection-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
        <path d="M0,8 L8,0 M-2,2 L2,-2 M6,10 L10,6" stroke="#3b82f6" stroke-width="1"/>
      </pattern>
      
      <!-- Dashed line pattern -->
      <pattern id="dash-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
        <line x1="0" y1="4" x2="4" y2="4" stroke="currentColor" stroke-width="1"/>
      </pattern>
    `;
  }

  /**
   * Draw the grid
   */
  drawGrid() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const gridSize = this.options.gridSize;
    
    // Clear existing grid
    this.gridGroup.innerHTML = '';

    // Create grid lines
    for (let x = 0; x <= this.options.width; x += gridSize) {
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', 0);
      line.setAttribute('x2', x);
      line.setAttribute('y2', this.options.height);
      line.classList.add('eerd-grid-line');
      this.gridGroup.appendChild(line);
    }

    for (let y = 0; y <= this.options.height; y += gridSize) {
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', 0);
      line.setAttribute('y1', y);
      line.setAttribute('x2', this.options.width);
      line.setAttribute('y2', y);
      line.classList.add('eerd-grid-line');
      this.gridGroup.appendChild(line);
    }
  }

  /**
   * Create the element palette
   */
  createPalette() {
    const sections = [
      {
        title: 'Entities',
        items: [
          { type: 'entity-strong', label: 'Strong Entity', icon: '▭' },
          { type: 'entity-weak', label: 'Weak Entity', icon: '▯' },
          { type: 'entity-ie', label: 'IE Entity', icon: '▢' }
        ]
      },
      {
        title: 'Attributes',
        items: [
          { type: 'attribute-simple', label: 'Simple', icon: '⬭' },
          { type: 'attribute-multi', label: 'Multi-valued', icon: '⬭⬭' },
          { type: 'attribute-derived', label: 'Derived', icon: '⦲' },
          { type: 'attribute-key', label: 'Key', icon: '⍟' }
        ]
      },
      {
        title: 'Relationships',
        items: [
          { type: 'relationship-regular', label: 'Regular', icon: '◊' },
          { type: 'relationship-identifying', label: 'Identifying', icon: '◈' }
        ]
      },
      {
        title: 'Cardinality',
        items: [
          { type: 'card-one', label: 'One (1)', icon: '1' },
          { type: 'card-many', label: 'Many (N)', icon: 'N' },
          { type: 'card-zero-one', label: 'Zero-One', icon: '|○' },
          { type: 'card-one-many', label: 'One-Many', icon: '|◡' }
        ]
      },
      {
        title: 'Subtypes',
        items: [
          { type: 'subtype-triangle', label: 'Subtype', icon: '△' },
          { type: 'subtype-exclusive', label: 'Exclusive', icon: 'ⓧ' },
          { type: 'subtype-overlapping', label: 'Overlapping', icon: 'ⓞ' }
        ]
      }
    ];

    this.paletteEl.innerHTML = sections.map(section => `
      <div class="eerd-palette-section">
        <h4 class="eerd-palette-title">${section.title}</h4>
        <div class="eerd-palette-items">
          ${section.items.map(item => `
            <button class="eerd-palette-item" data-type="${item.type}" title="${item.label}">
              <span class="eerd-palette-icon">${item.icon}</span>
              <span class="eerd-palette-label">${item.label}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Add connector tool
    this.paletteEl.insertAdjacentHTML('beforeend', `
      <div class="eerd-palette-section">
        <h4 class="eerd-palette-title">Tools</h4>
        <div class="eerd-palette-items">
          <button class="eerd-palette-item" data-type="tool-connect" title="Connect Elements">
            <span class="eerd-palette-icon">─</span>
            <span class="eerd-palette-label">Connect</span>
          </button>
          <button class="eerd-palette-item" data-type="tool-select" title="Select/Move">
            <span class="eerd-palette-icon">↖</span>
            <span class="eerd-palette-label">Select</span>
          </button>
        </div>
      </div>
    `);
  }

  /**
   * Create the toolbar
   */
  createToolbar() {
    this.toolbarEl.innerHTML = `
      <div class="eerd-toolbar-group">
        <button class="eerd-btn eerd-btn-icon" data-action="undo" title="Undo (Ctrl+Z)">
          ↶
        </button>
        <button class="eerd-btn eerd-btn-icon" data-action="redo" title="Redo (Ctrl+Y)">
          ↷
        </button>
      </div>
      <div class="eerd-toolbar-divider"></div>
      <div class="eerd-toolbar-group">
        <button class="eerd-btn eerd-btn-icon" data-action="clear" title="Clear Canvas">
          🗑️
        </button>
        <button class="eerd-btn eerd-btn-icon" data-action="delete" title="Delete Selected (Delete)">
          ✕
        </button>
      </div>
      <div class="eerd-toolbar-divider"></div>
      <div class="eerd-toolbar-group">
        <button class="eerd-btn eerd-btn-icon" data-action="grid" title="Toggle Grid">
          ⊞
        </button>
        <button class="eerd-btn eerd-btn-icon" data-action="snap" title="Toggle Snap to Grid">
          ✧
        </button>
      </div>
      <div class="eerd-toolbar-divider"></div>
      <div class="eerd-toolbar-group">
        <label class="eerd-notation-toggle">
          <span>Notation:</span>
          <select class="eerd-notation-select">
            <option value="chen">Chen</option>
            <option value="ie">IE (Crow's Foot)</option>
          </select>
        </label>
      </div>
      <div class="eerd-toolbar-spacer"></div>
      <div class="eerd-toolbar-group">
        <button class="eerd-btn eerd-btn-primary" data-action="validate">
          ✓ Validate
        </button>
        <button class="eerd-btn eerd-btn-secondary" data-action="save">
          💾 Save
        </button>
        <button class="eerd-btn eerd-btn-secondary" data-action="load">
          📂 Load
        </button>
      </div>
    `;
  }

  /**
   * Create the property panel
   */
  createPropertyPanel() {
    this.propertiesEl.innerHTML = `
      <div class="eerd-properties-header">
        <h4>Properties</h4>
      </div>
      <div class="eerd-properties-content">
        <p class="eerd-properties-empty">Select an element to edit properties</p>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Toolbar actions
    this.toolbarEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (btn) {
        this.handleToolbarAction(btn.dataset.action);
      }
    });

    // Notation selector
    const notationSelect = this.toolbarEl.querySelector('.eerd-notation-select');
    notationSelect?.addEventListener('change', (e) => {
      this.options.notation = e.target.value;
      this.render();
      this.saveState();
    });

    // Palette items
    this.paletteEl.addEventListener('click', (e) => {
      const item = e.target.closest('[data-type]');
      if (item) {
        this.handlePaletteClick(item.dataset.type);
      }
    });

    // Canvas interactions - store bound references for cleanup
    this.boundHandleMouseDown = this.handleMouseDown.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    this.boundHandleDoubleClick = this.handleDoubleClick.bind(this);
    this.boundHandleWheel = this.handleWheel.bind(this);
    
    this.canvasEl.addEventListener('mousedown', this.boundHandleMouseDown);
    this.canvasEl.addEventListener('mousemove', this.boundHandleMouseMove);
    this.canvasEl.addEventListener('mouseup', this.boundHandleMouseUp);
    this.canvasEl.addEventListener('dblclick', this.boundHandleDoubleClick);
    this.canvasEl.addEventListener('wheel', this.boundHandleWheel);

    // Zoom controls
    this.canvasWrapperEl.querySelector('.eerd-btn-zoom-in')?.addEventListener('click', () => {
      this.setZoom(this.zoom * 1.2);
    });
    this.canvasWrapperEl.querySelector('.eerd-btn-zoom-out')?.addEventListener('click', () => {
      this.setZoom(this.zoom / 1.2);
    });
    this.canvasWrapperEl.querySelector('.eerd-btn-fit')?.addEventListener('click', () => {
      this.fitToScreen();
    });

    // Keyboard shortcuts - store bound reference for cleanup
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    document.addEventListener('keydown', this.boundHandleKeyDown);

    // Prevent context menu on canvas
    this.boundContextMenu = (e) => e.preventDefault();
    this.canvasEl.addEventListener('contextmenu', this.boundContextMenu);
  }

  /**
   * Handle toolbar actions
   */
  handleToolbarAction(action) {
    switch (action) {
      case 'undo':
        this.undo();
        break;
      case 'redo':
        this.redo();
        break;
      case 'clear':
        this.clearCanvas();
        break;
      case 'delete':
        this.deleteSelected();
        break;
      case 'grid':
        this.toggleGrid();
        break;
      case 'snap':
        this.toggleSnap();
        break;
      case 'validate':
        this.validate();
        break;
      case 'save':
        this.saveDiagram();
        break;
      case 'load':
        this.loadDiagram();
        break;
    }
  }

  /**
   * Handle palette item click
   */
  handlePaletteClick(type) {
    // Update visual selection state
    this.paletteEl.querySelectorAll('.eerd-palette-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });
    
    if (type.startsWith('tool-')) {
      this.mode = type.replace('tool-', '');
      this.placementType = null;
      this.updateCursor();
      return;
    }

    this.mode = 'place';
    this.placementType = type;
    this.updateCursor();
  }

  /**
   * Update cursor based on mode
   */
  updateCursor() {
    const cursors = {
      select: 'default',
      place: 'crosshair',
      connect: 'crosshair'
    };
    this.canvasEl.style.cursor = cursors[this.mode] || 'default';
    this.updateStatusText();
  }

  /**
   * Update status bar text
   */
  updateStatusText() {
    const modeTexts = {
      select: 'Select mode: Click to select, drag to move',
      place: `Place mode: Click on canvas to place ${this.placementType}`,
      connect: 'Connect mode: Click and drag between elements'
    };
    this.statusTextEl.textContent = modeTexts[this.mode] || 'Ready';
  }

  /**
   * Handle mouse down
   */
  handleMouseDown(e) {
    if (e.button !== 0) return; // Only left click

    const pos = this.getMousePosition(e);
    this.dragStartX = pos.x;
    this.dragStartY = pos.y;

    if (this.mode === 'place') {
      this.placeElement(pos.x, pos.y);
      return;
    }

    if (this.mode === 'connect') {
      const element = this.getElementAt(pos.x, pos.y);
      if (element) {
        this.connectStart = element;
        this.isDragging = true;
      }
      return;
    }

    // Select mode
    const element = this.getElementAt(pos.x, pos.y);
    if (element) {
      this.selectElement(element);
      this.isDragging = true;
      this.dragOffsetX = pos.x - element.x;
      this.dragOffsetY = pos.y - element.y;
    } else {
      // Check for connection selection
      const connection = this.getConnectionAt(pos.x, pos.y);
      if (connection) {
        this.selectConnection(connection);
      } else {
        this.deselectAll();
        // Start panning
        if (this.options.panEnabled) {
          this.isPanning = true;
          this.canvasEl.style.cursor = 'grabbing';
        }
      }
    }
  }

  /**
   * Handle mouse move
   */
  handleMouseMove(e) {
    const pos = this.getMousePosition(e);

    if (this.isDragging) {
      if (this.mode === 'connect' && this.connectStart) {
        // Draw temporary connection line
        this.drawTempConnection(this.connectStart, pos);
      } else if (this.selectedElement) {
        // Move element
        let newX = pos.x - this.dragOffsetX;
        let newY = pos.y - this.dragOffsetY;

        if (this.options.snapToGrid) {
          newX = Math.round(newX / this.options.gridSize) * this.options.gridSize;
          newY = Math.round(newY / this.options.gridSize) * this.options.gridSize;
        }

        this.selectedElement.x = newX;
        this.selectedElement.y = newY;
        this.render();
      }
    } else if (this.isPanning) {
      const dx = (pos.x - this.dragStartX) * this.zoom;
      const dy = (pos.y - this.dragStartY) * this.zoom;
      this.panX += dx;
      this.panY += dy;
      this.dragStartX = pos.x;
      this.dragStartY = pos.y;
      this.updateTransform();
    }
  }

  /**
   * Handle mouse up
   */
  handleMouseUp(e) {
    if (this.isDragging && this.mode === 'connect' && this.connectStart) {
      const pos = this.getMousePosition(e);
      const targetElement = this.getElementAt(pos.x, pos.y);
      if (targetElement && targetElement !== this.connectStart) {
        this.createConnection(this.connectStart, targetElement);
      }
      this.removeTempConnection();
      this.connectStart = null;
    }

    if (this.isDragging && this.selectedElement) {
      this.saveState();
    }

    this.isDragging = false;
    this.isPanning = false;
    this.canvasEl.style.cursor = this.mode === 'select' ? 'default' : 'crosshair';
  }

  /**
   * Handle double click
   */
  handleDoubleClick(e) {
    const pos = this.getMousePosition(e);
    const element = this.getElementAt(pos.x, pos.y);
    if (element) {
      this.editElementText(element);
    }
  }

  /**
   * Handle wheel for zoom
   */
  handleWheel(e) {
    if (!this.options.zoomEnabled) return;
    e.preventDefault();

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.25, Math.min(3, this.zoom * delta));
    this.setZoom(newZoom);
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyDown(e) {
    // Only process if canvas is focused or no input is focused
    if (document.activeElement?.tagName === 'INPUT') return;

    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        if (!document.activeElement?.tagName === 'INPUT') {
          this.deleteSelected();
        }
        break;
      case 'Escape':
        this.deselectAll();
        this.mode = 'select';
        this.updateCursor();
        break;
      case 'z':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (e.shiftKey) {
            this.redo();
          } else {
            this.undo();
          }
        }
        break;
      case 'y':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.redo();
        }
        break;
    }
  }

  /**
   * Get mouse position relative to SVG
   */
  getMousePosition(e) {
    const rect = this.svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - this.panX) / this.zoom,
      y: (e.clientY - rect.top - this.panY) / this.zoom
    };
  }

  /**
   * Place a new element
   */
  placeElement(x, y) {
    if (this.options.snapToGrid) {
      x = Math.round(x / this.options.gridSize) * this.options.gridSize;
      y = Math.round(y / this.options.gridSize) * this.options.gridSize;
    }

    const element = this.createElement(this.placementType, x, y);
    this.elements.push(element);
    this.selectElement(element);
    this.saveState();
    this.render();
    
    // Reset to select mode after placing
    this.mode = 'select';
    this.placementType = null;
    this.updateCursor();
    
    // Clear palette selection
    this.paletteEl.querySelectorAll('.eerd-palette-item').forEach(btn => {
      btn.classList.remove('active');
    });
  }

  /**
   * Create a new element
   */
  createElement(type, x, y) {
    this.elementIdCounter++;
    const defaults = this.getElementDefaults(type);
    
    return {
      id: `el_${this.elementIdCounter}`,
      type: type,
      x: x,
      y: y,
      width: defaults.width,
      height: defaults.height,
      text: defaults.text,
      color: defaults.color,
      fontSize: defaults.fontSize,
      ...defaults.extra
    };
  }

  /**
   * Get default properties for element types
   */
  getElementDefaults(type) {
    const defaults = {
      'entity-strong': { width: 120, height: 60, text: 'Entity', color: '#3b82f6', fontSize: 14 },
      'entity-weak': { width: 120, height: 60, text: 'Weak Entity', color: '#64748b', fontSize: 14 },
      'entity-ie': { width: 120, height: 60, text: 'Entity', color: '#3b82f6', fontSize: 14, extra: { rounded: true } },
      'attribute-simple': { width: 100, height: 40, text: 'attribute', color: '#10b981', fontSize: 12 },
      'attribute-multi': { width: 100, height: 40, text: 'attribute', color: '#10b981', fontSize: 12, extra: { multiValued: true } },
      'attribute-derived': { width: 100, height: 40, text: 'attribute', color: '#8b5cf6', fontSize: 12, extra: { derived: true } },
      'attribute-key': { width: 100, height: 40, text: 'key', color: '#ef4444', fontSize: 12, extra: { isKey: true } },
      'relationship-regular': { width: 100, height: 60, text: 'Rel', color: '#f59e0b', fontSize: 12 },
      'relationship-identifying': { width: 100, height: 60, text: 'Rel', color: '#f59e0b', fontSize: 12, extra: { identifying: true } },
      'card-one': { width: 30, height: 30, text: '1', color: '#374151', fontSize: 14 },
      'card-many': { width: 30, height: 30, text: 'N', color: '#374151', fontSize: 14 },
      'card-zero-one': { width: 40, height: 30, text: '|○', color: '#374151', fontSize: 12 },
      'card-one-many': { width: 40, height: 30, text: '|◡', color: '#374151', fontSize: 12 },
      'subtype-triangle': { width: 60, height: 50, text: '', color: '#06b6d4', fontSize: 12 },
      'subtype-exclusive': { width: 40, height: 40, text: 'd', color: '#06b6d4', fontSize: 14, extra: { exclusive: true } },
      'subtype-overlapping': { width: 40, height: 40, text: 'o', color: '#06b6d4', fontSize: 14, extra: { overlapping: true } }
    };

    return defaults[type] || { width: 80, height: 40, text: 'New', color: '#6b7280', fontSize: 12 };
  }

  /**
   * Create a connection between elements
   */
  createConnection(from, to) {
    this.connectionIdCounter++;
    const connection = {
      id: `conn_${this.connectionIdCounter}`,
      from: from.id,
      to: to.id,
      type: 'solid',
      cardinalityFrom: '',
      cardinalityTo: '',
      identifying: false
    };
    this.connections.push(connection);
    this.selectConnection(connection);
    this.saveState();
    this.render();
  }

  /**
   * Get element at position
   */
  getElementAt(x, y) {
    // Search from last to first (top to bottom)
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const el = this.elements[i];
      if (x >= el.x - el.width / 2 && x <= el.x + el.width / 2 &&
          y >= el.y - el.height / 2 && y <= el.y + el.height / 2) {
        return el;
      }
    }
    return null;
  }

  /**
   * Get connection at position (approximate)
   */
  getConnectionAt(x, y) {
    const threshold = 10;
    for (const conn of this.connections) {
      const fromEl = this.elements.find(e => e.id === conn.from);
      const toEl = this.elements.find(e => e.id === conn.to);
      if (!fromEl || !toEl) continue;

      // Simple distance check to line segment
      const dist = this.pointToLineDistance(x, y, fromEl.x, fromEl.y, toEl.x, toEl.y);
      if (dist < threshold) {
        return conn;
      }
    }
    return null;
  }

  /**
   * Calculate distance from point to line segment
   */
  pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Select an element
   */
  selectElement(element) {
    this.selectedElement = element;
    this.selectedConnection = null;
    this.updatePropertyPanel();
    this.render();
  }

  /**
   * Select a connection
   */
  selectConnection(connection) {
    this.selectedConnection = connection;
    this.selectedElement = null;
    this.updatePropertyPanel();
    this.render();
  }

  /**
   * Deselect all
   */
  deselectAll() {
    this.selectedElement = null;
    this.selectedConnection = null;
    this.updatePropertyPanel();
    this.render();
  }

  /**
   * Delete selected element or connection
   */
  deleteSelected() {
    if (this.selectedElement) {
      // Remove connections to/from this element
      this.connections = this.connections.filter(c => 
        c.from !== this.selectedElement.id && c.to !== this.selectedElement.id
      );
      // Remove element
      this.elements = this.elements.filter(e => e.id !== this.selectedElement.id);
      this.selectedElement = null;
      this.saveState();
      this.render();
    } else if (this.selectedConnection) {
      this.connections = this.connections.filter(c => c.id !== this.selectedConnection.id);
      this.selectedConnection = null;
      this.saveState();
      this.render();
    }
  }

  /**
   * Edit element text
   */
  editElementText(element) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = element.text;
    input.className = 'eerd-text-input';
    
    const rect = this.canvasEl.getBoundingClientRect();
    const screenX = rect.left + (element.x * this.zoom) + this.panX;
    const screenY = rect.top + (element.y * this.zoom) + this.panY;
    
    input.style.left = `${screenX - 60}px`;
    input.style.top = `${screenY - 12}px`;
    input.style.width = '120px';
    
    document.body.appendChild(input);
    input.focus();
    input.select();

    const saveText = () => {
      if (input.value.trim()) {
        element.text = input.value.trim();
        this.saveState();
        this.render();
        this.updatePropertyPanel();
      }
      input.remove();
    };

    input.addEventListener('blur', saveText);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveText();
      } else if (e.key === 'Escape') {
        input.remove();
      }
    });
  }

  /**
   * Update the property panel
   */
  updatePropertyPanel() {
    const content = this.propertiesEl.querySelector('.eerd-properties-content');
    
    if (!this.selectedElement && !this.selectedConnection) {
      content.innerHTML = '<p class="eerd-properties-empty">Select an element to edit properties</p>';
      return;
    }

    if (this.selectedElement) {
      content.innerHTML = `
        <div class="eerd-property-group">
          <label>Text</label>
          <input type="text" class="eerd-prop-text" value="${this.selectedElement.text}">
        </div>
        <div class="eerd-property-group">
          <label>Color</label>
          <input type="color" class="eerd-prop-color" value="${this.selectedElement.color}">
        </div>
        <div class="eerd-property-group">
          <label>Font Size</label>
          <input type="range" class="eerd-prop-fontsize" min="8" max="24" value="${this.selectedElement.fontSize}">
          <span>${this.selectedElement.fontSize}px</span>
        </div>
        <div class="eerd-property-group">
          <label>Width</label>
          <input type="range" class="eerd-prop-width" min="40" max="200" value="${this.selectedElement.width}">
          <span>${this.selectedElement.width}px</span>
        </div>
        <div class="eerd-property-group">
          <label>Height</label>
          <input type="range" class="eerd-prop-height" min="30" max="120" value="${this.selectedElement.height}">
          <span>${this.selectedElement.height}px</span>
        </div>
      `;

      // Bind property changes
      content.querySelector('.eerd-prop-text')?.addEventListener('input', (e) => {
        this.selectedElement.text = e.target.value;
        this.render();
      });
      content.querySelector('.eerd-prop-color')?.addEventListener('input', (e) => {
        this.selectedElement.color = e.target.value;
        this.render();
      });
      content.querySelector('.eerd-prop-fontsize')?.addEventListener('input', (e) => {
        this.selectedElement.fontSize = parseInt(e.target.value);
        e.target.nextElementSibling.textContent = `${e.target.value}px`;
        this.render();
      });
      content.querySelector('.eerd-prop-width')?.addEventListener('input', (e) => {
        this.selectedElement.width = parseInt(e.target.value);
        e.target.nextElementSibling.textContent = `${e.target.value}px`;
        this.render();
      });
      content.querySelector('.eerd-prop-height')?.addEventListener('input', (e) => {
        this.selectedElement.height = parseInt(e.target.value);
        e.target.nextElementSibling.textContent = `${e.target.value}px`;
        this.render();
      });
    } else if (this.selectedConnection) {
      content.innerHTML = `
        <div class="eerd-property-group">
          <label>Line Type</label>
          <select class="eerd-prop-linetype">
            <option value="solid" ${this.selectedConnection.type === 'solid' ? 'selected' : ''}>Solid</option>
            <option value="dashed" ${this.selectedConnection.type === 'dashed' ? 'selected' : ''}>Dashed</option>
          </select>
        </div>
        <div class="eerd-property-group">
          <label>From Cardinality</label>
          <input type="text" class="eerd-prop-card-from" value="${this.selectedConnection.cardinalityFrom}" placeholder="1, N, M...">
        </div>
        <div class="eerd-property-group">
          <label>To Cardinality</label>
          <input type="text" class="eerd-prop-card-to" value="${this.selectedConnection.cardinalityTo}" placeholder="1, N, M...">
        </div>
        <div class="eerd-property-group">
          <label>
            <input type="checkbox" class="eerd-prop-identifying" ${this.selectedConnection.identifying ? 'checked' : ''}>
            Identifying Relationship
          </label>
        </div>
      `;

      content.querySelector('.eerd-prop-linetype')?.addEventListener('change', (e) => {
        this.selectedConnection.type = e.target.value;
        this.render();
      });
      content.querySelector('.eerd-prop-card-from')?.addEventListener('input', (e) => {
        this.selectedConnection.cardinalityFrom = e.target.value;
        this.render();
      });
      content.querySelector('.eerd-prop-card-to')?.addEventListener('input', (e) => {
        this.selectedConnection.cardinalityTo = e.target.value;
        this.render();
      });
      content.querySelector('.eerd-prop-identifying')?.addEventListener('change', (e) => {
        this.selectedConnection.identifying = e.target.checked;
        this.render();
      });
    }

    // Save state on property change
    content.addEventListener('change', () => this.saveState());
  }

  /**
   * Render the diagram
   */
  render() {
    // Render elements
    this.elementsGroup.innerHTML = '';
    this.elements.forEach(element => {
      const el = this.renderElement(element);
      this.elementsGroup.appendChild(el);
    });

    // Render connections
    this.connectionsGroup.innerHTML = '';
    this.connections.forEach(connection => {
      const conn = this.renderConnection(connection);
      if (conn) this.connectionsGroup.appendChild(conn);
    });

    // Render selection highlight
    this.selectionGroup.innerHTML = '';
    if (this.selectedElement) {
      const highlight = this.renderSelection(this.selectedElement);
      this.selectionGroup.appendChild(highlight);
    }

    // Update element count
    this.elementCountEl.textContent = `${this.elements.length} elements, ${this.connections.length} connections`;
  }

  /**
   * Render a single element
   */
  renderElement(element) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('transform', `translate(${element.x}, ${element.y})`);
    g.classList.add('eerd-element');
    g.dataset.id = element.id;

    let shape;
    const type = element.type;

    // Entity (Rectangle)
    if (type.startsWith('entity')) {
      // Check notation setting for rendering style
      const isIE = this.options.notation === 'ie';
      
      if (type === 'entity-weak') {
        // Double rectangle for weak entity (Chen) or Rounded with double border (IE)
        if (isIE) {
          // IE: Single rounded rectangle with thicker border for weak
          shape = document.createElementNS(svgNS, 'rect');
          shape.setAttribute('x', -element.width / 2);
          shape.setAttribute('y', -element.height / 2);
          shape.setAttribute('width', element.width);
          shape.setAttribute('height', element.height);
          shape.setAttribute('rx', '12');
          shape.setAttribute('ry', '12');
          shape.setAttribute('fill', 'var(--bg-card, #ffffff)');
          shape.setAttribute('stroke', element.color);
          shape.setAttribute('stroke-width', '3');
          g.appendChild(shape);
        } else {
          // Chen: Double rectangle
          const outer = document.createElementNS(svgNS, 'rect');
          outer.setAttribute('x', -element.width / 2 - 3);
          outer.setAttribute('y', -element.height / 2 - 3);
          outer.setAttribute('width', element.width + 6);
          outer.setAttribute('height', element.height + 6);
          outer.setAttribute('fill', 'none');
          outer.setAttribute('stroke', element.color);
          outer.setAttribute('stroke-width', '2');
          g.appendChild(outer);
        }
      }
      
      if (type !== 'entity-weak' || !isIE) {
        shape = document.createElementNS(svgNS, 'rect');
        shape.setAttribute('x', -element.width / 2);
        shape.setAttribute('y', -element.height / 2);
        shape.setAttribute('width', element.width);
        shape.setAttribute('height', element.height);
        shape.setAttribute('fill', 'var(--bg-card, #ffffff)');
        shape.setAttribute('stroke', element.color);
        shape.setAttribute('stroke-width', type === 'entity-weak' ? '2' : '2');
        
        // IE notation uses rounded rectangles for all entities
        if (isIE || element.rounded) {
          shape.setAttribute('rx', '8');
          shape.setAttribute('ry', '8');
        }
      }
    }
    // Attribute (Oval)
    else if (type.startsWith('attribute')) {
      if (element.multiValued) {
        // Double oval
        const outer = document.createElementNS(svgNS, 'ellipse');
        outer.setAttribute('rx', element.width / 2 + 3);
        outer.setAttribute('ry', element.height / 2 + 3);
        outer.setAttribute('fill', 'none');
        outer.setAttribute('stroke', element.color);
        outer.setAttribute('stroke-width', '2');
        g.appendChild(outer);
      }

      shape = document.createElementNS(svgNS, 'ellipse');
      shape.setAttribute('rx', element.width / 2);
      shape.setAttribute('ry', element.height / 2);
      shape.setAttribute('fill', 'var(--bg-card, #ffffff)');
      shape.setAttribute('stroke', element.color);
      
      if (element.derived) {
        shape.setAttribute('stroke-dasharray', '5,5');
      }
      shape.setAttribute('stroke-width', '2');
    }
    // Relationship (Diamond in Chen, Rectangle/Line in IE)
    else if (type.startsWith('relationship')) {
      const isIE = this.options.notation === 'ie';
      
      if (isIE) {
        // IE: Relationships shown as rectangles or direct connections
        if (element.identifying) {
          // Identifying relationship - solid border
          shape = document.createElementNS(svgNS, 'rect');
          shape.setAttribute('x', -element.width / 2);
          shape.setAttribute('y', -element.height / 3);
          shape.setAttribute('width', element.width);
          shape.setAttribute('height', element.height / 1.5);
          shape.setAttribute('rx', '4');
          shape.setAttribute('ry', '4');
          shape.setAttribute('fill', 'var(--bg-card, #ffffff)');
          shape.setAttribute('stroke', element.color);
          shape.setAttribute('stroke-width', '3');
        } else {
          // Non-identifying - normal border
          shape = document.createElementNS(svgNS, 'rect');
          shape.setAttribute('x', -element.width / 2);
          shape.setAttribute('y', -element.height / 3);
          shape.setAttribute('width', element.width);
          shape.setAttribute('height', element.height / 1.5);
          shape.setAttribute('rx', '4');
          shape.setAttribute('ry', '4');
          shape.setAttribute('fill', 'var(--bg-card, #ffffff)');
          shape.setAttribute('stroke', element.color);
          shape.setAttribute('stroke-width', '2');
        }
      } else {
        // Chen: Diamond shape
        if (element.identifying) {
          // Double diamond for identifying
          const outer = document.createElementNS(svgNS, 'polygon');
          const w = element.width / 2 + 4;
          const h = element.height / 2 + 4;
          outer.setAttribute('points', `0,-${h} ${w},0 0,${h} -${w},0`);
          outer.setAttribute('fill', 'none');
          outer.setAttribute('stroke', element.color);
          outer.setAttribute('stroke-width', '2');
          g.appendChild(outer);
        }

        shape = document.createElementNS(svgNS, 'polygon');
        const w = element.width / 2;
        const h = element.height / 2;
        shape.setAttribute('points', `0,-${h} ${w},0 0,${h} -${w},0`);
        shape.setAttribute('fill', 'var(--bg-card, #ffffff)');
        shape.setAttribute('stroke', element.color);
        shape.setAttribute('stroke-width', '2');
      }
    }
    // Cardinality
    else if (type.startsWith('card')) {
      shape = document.createElementNS(svgNS, 'text');
      shape.setAttribute('text-anchor', 'middle');
      shape.setAttribute('dominant-baseline', 'middle');
      shape.setAttribute('fill', element.color);
      shape.setAttribute('font-size', element.fontSize);
      shape.setAttribute('font-weight', 'bold');
      shape.textContent = element.text;
    }
    // Subtype (Triangle)
    else if (type === 'subtype-triangle') {
      shape = document.createElementNS(svgNS, 'polygon');
      const h = element.height / 2;
      const w = element.width / 2;
      shape.setAttribute('points', `0,${h} -${w},-${h} ${w},-${h}`);
      shape.setAttribute('fill', 'var(--bg-card, #ffffff)');
      shape.setAttribute('stroke', element.color);
      shape.setAttribute('stroke-width', '2');
    }
    // Subtype indicator (Circle)
    else if (type.startsWith('subtype-')) {
      if (element.exclusive) {
        shape = document.createElementNS(svgNS, 'circle');
        shape.setAttribute('r', element.width / 2);
        shape.setAttribute('fill', 'var(--bg-card, #ffffff)');
        shape.setAttribute('stroke', element.color);
        shape.setAttribute('stroke-width', '2');
        
        const cross = document.createElementNS(svgNS, 'path');
        const r = element.width / 4;
        cross.setAttribute('d', `M-${r},-${r} L${r},${r} M-${r},${r} L${r},-${r}`);
        cross.setAttribute('stroke', element.color);
        cross.setAttribute('stroke-width', '2');
        g.appendChild(shape);
        shape = cross;
      } else if (element.overlapping) {
        shape = document.createElementNS(svgNS, 'circle');
        shape.setAttribute('r', element.width / 2);
        shape.setAttribute('fill', 'var(--bg-card, #ffffff)');
        shape.setAttribute('stroke', element.color);
        shape.setAttribute('stroke-width', '2');
        
        const inner = document.createElementNS(svgNS, 'circle');
        inner.setAttribute('r', element.width / 4);
        inner.setAttribute('fill', 'none');
        inner.setAttribute('stroke', element.color);
        inner.setAttribute('stroke-width', '2');
        g.appendChild(shape);
        shape = inner;
      }
    }

    if (shape && !type.startsWith('card')) {
      g.appendChild(shape);
    }

    // Add text label
    if (element.text && !type.startsWith('card')) {
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', 'var(--text-primary, #333)');
      text.setAttribute('font-size', element.fontSize);
      text.setAttribute('font-family', 'var(--font-sans, sans-serif)');
      
      if (element.isKey) {
        text.setAttribute('text-decoration', 'underline');
      }
      
      text.textContent = element.text;
      g.appendChild(text);
    }

    return g;
  }

  /**
   * Render a connection
   */
  renderConnection(connection) {
    const fromEl = this.elements.find(e => e.id === connection.from);
    const toEl = this.elements.find(e => e.id === connection.to);
    if (!fromEl || !toEl) return null;

    const svgNS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(svgNS, 'g');
    g.classList.add('eerd-connection');
    g.dataset.id = connection.id;

    // Calculate line endpoints
    const start = this.getConnectionPoint(fromEl, toEl.x, toEl.y);
    const end = this.getConnectionPoint(toEl, fromEl.x, fromEl.y);

    // Draw line
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', start.x);
    line.setAttribute('y1', start.y);
    line.setAttribute('x2', end.x);
    line.setAttribute('y2', end.y);
    line.setAttribute('stroke', 'var(--text-tertiary, #64748b)');
    line.setAttribute('stroke-width', connection.identifying ? '3' : '2');
    
    if (connection.type === 'dashed') {
      line.setAttribute('stroke-dasharray', '5,5');
    }

    g.appendChild(line);

    // Add cardinality labels
    if (connection.cardinalityFrom) {
      const label = this.createCardinalityLabel(connection.cardinalityFrom, start.x, start.y, end.x, end.y);
      g.appendChild(label);
    }
    if (connection.cardinalityTo) {
      const label = this.createCardinalityLabel(connection.cardinalityTo, end.x, end.y, start.x, start.y);
      g.appendChild(label);
    }

    // Highlight if selected
    if (this.selectedConnection === connection) {
      line.setAttribute('stroke', '#3b82f6');
    }

    return g;
  }

  /**
   * Get connection point on element
   */
  getConnectionPoint(element, targetX, targetY) {
    const dx = targetX - element.x;
    const dy = targetY - element.y;
    const angle = Math.atan2(dy, dx);
    
    // Approximate as ellipse
    const rx = element.width / 2 + 5;
    const ry = element.height / 2 + 5;
    
    // Parametric equation for ellipse
    const x = element.x + rx * Math.cos(angle);
    const y = element.y + ry * Math.sin(angle);
    
    return { x, y };
  }

  /**
   * Create cardinality label
   */
  createCardinalityLabel(text, x, y, otherX, otherY) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(svgNS, 'g');
    
    // Position slightly offset from endpoint
    const angle = Math.atan2(otherY - y, otherX - x);
    const offset = 15;
    const labelX = x + Math.cos(angle) * offset;
    const labelY = y + Math.sin(angle) * offset;
    
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', labelX - 10);
    rect.setAttribute('y', labelY - 10);
    rect.setAttribute('width', 20);
    rect.setAttribute('height', 20);
    rect.setAttribute('fill', 'var(--bg-card, #ffffff)');
    rect.setAttribute('rx', '3');
    
    const label = document.createElementNS(svgNS, 'text');
    label.setAttribute('x', labelX);
    label.setAttribute('y', labelY);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dominant-baseline', 'central');
    label.setAttribute('fill', 'var(--text-primary, #333)');
    label.setAttribute('font-size', '12');
    label.setAttribute('font-weight', 'bold');
    label.textContent = text;
    
    g.appendChild(rect);
    g.appendChild(label);
    return g;
  }

  /**
   * Render selection highlight
   */
  renderSelection(element) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('transform', `translate(${element.x}, ${element.y})`);

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', -element.width / 2 - 6);
    rect.setAttribute('y', -element.height / 2 - 6);
    rect.setAttribute('width', element.width + 12);
    rect.setAttribute('height', element.height + 12);
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', '#3b82f6');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('stroke-dasharray', '4,4');
    rect.setAttribute('rx', '4');

    g.appendChild(rect);
    return g;
  }

  /**
   * Draw temporary connection while dragging
   */
  drawTempConnection(from, to) {
    this.removeTempConnection();
    
    const svgNS = 'http://www.w3.org/2000/svg';
    const start = this.getConnectionPoint(from, to.x, to.y);
    
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', start.x);
    line.setAttribute('y1', start.y);
    line.setAttribute('x2', to.x);
    line.setAttribute('y2', to.y);
    line.setAttribute('stroke', '#3b82f6');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '5,5');
    line.classList.add('eerd-temp-connection');
    
    this.connectionsGroup.appendChild(line);
  }

  /**
   * Remove temporary connection
   */
  removeTempConnection() {
    const temp = this.connectionsGroup.querySelector('.eerd-temp-connection');
    if (temp) temp.remove();
  }

  /**
   * Set zoom level
   */
  setZoom(zoom) {
    this.zoom = Math.max(0.25, Math.min(3, zoom));
    this.zoomLevelEl.textContent = `${Math.round(this.zoom * 100)}%`;
    this.updateTransform();
  }

  /**
   * Update SVG transform
   */
  updateTransform() {
    this.svg.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }

  /**
   * Fit diagram to screen
   */
  fitToScreen() {
    if (this.elements.length === 0) {
      this.setZoom(1);
      this.panX = 0;
      this.panY = 0;
      this.updateTransform();
      return;
    }

    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    this.elements.forEach(el => {
      minX = Math.min(minX, el.x - el.width / 2);
      minY = Math.min(minY, el.y - el.height / 2);
      maxX = Math.max(maxX, el.x + el.width / 2);
      maxY = Math.max(maxY, el.y + el.height / 2);
    });

    const padding = 40;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;
    
    const rect = this.canvasEl.getBoundingClientRect();
    const scaleX = rect.width / contentWidth;
    const scaleY = rect.height / contentHeight;
    
    this.zoom = Math.min(scaleX, scaleY, 1);
    this.panX = -minX * this.zoom + padding * this.zoom + (rect.width - contentWidth * this.zoom) / 2;
    this.panY = -minY * this.zoom + padding * this.zoom;
    
    this.zoomLevelEl.textContent = `${Math.round(this.zoom * 100)}%`;
    this.updateTransform();
  }

  /**
   * Toggle grid visibility
   */
  toggleGrid() {
    this.options.showGrid = !this.options.showGrid;
    if (this.gridGroup) {
      this.gridGroup.style.display = this.options.showGrid ? 'block' : 'none';
    }
  }

  /**
   * Toggle snap to grid
   */
  toggleSnap() {
    this.options.snapToGrid = !this.options.snapToGrid;
    this.statusTextEl.textContent = `Snap to grid: ${this.options.snapToGrid ? 'ON' : 'OFF'}`;
  }

  /**
   * Clear canvas
   */
  clearCanvas() {
    if (this.elements.length === 0 && this.connections.length === 0) return;
    
    if (confirm('Are you sure you want to clear the canvas?')) {
      this.saveState();
      this.elements = [];
      this.connections = [];
      this.selectedElement = null;
      this.selectedConnection = null;
      this.render();
      this.updatePropertyPanel();
    }
  }

  /**
   * Save current state for undo
   */
  saveState() {
    const state = {
      elements: JSON.parse(JSON.stringify(this.elements)),
      connections: JSON.parse(JSON.stringify(this.connections)),
      elementIdCounter: this.elementIdCounter,
      connectionIdCounter: this.connectionIdCounter
    };
    this.undoStack.push(state);
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    
    if (this.options.onChange) {
      this.options.onChange(this.getDiagramData());
    }
  }

  /**
   * Undo last action
   */
  undo() {
    if (this.undoStack.length === 0) return;
    
    const currentState = {
      elements: JSON.parse(JSON.stringify(this.elements)),
      connections: JSON.parse(JSON.stringify(this.connections)),
      elementIdCounter: this.elementIdCounter,
      connectionIdCounter: this.connectionIdCounter
    };
    this.redoStack.push(currentState);
    
    const state = this.undoStack.pop();
    this.elements = state.elements;
    this.connections = state.connections;
    this.elementIdCounter = state.elementIdCounter;
    this.connectionIdCounter = state.connectionIdCounter;
    
    this.selectedElement = null;
    this.selectedConnection = null;
    this.render();
    this.updatePropertyPanel();
  }

  /**
   * Redo last undone action
   */
  redo() {
    if (this.redoStack.length === 0) return;
    
    const currentState = {
      elements: JSON.parse(JSON.stringify(this.elements)),
      connections: JSON.parse(JSON.stringify(this.connections)),
      elementIdCounter: this.elementIdCounter,
      connectionIdCounter: this.connectionIdCounter
    };
    this.undoStack.push(currentState);
    
    const state = this.redoStack.pop();
    this.elements = state.elements;
    this.connections = state.connections;
    this.elementIdCounter = state.elementIdCounter;
    this.connectionIdCounter = state.connectionIdCounter;
    
    this.selectedElement = null;
    this.selectedConnection = null;
    this.render();
    this.updatePropertyPanel();
  }

  /**
   * Validate the diagram
   */
  validate() {
    const issues = [];
    
    // Check for empty entities
    this.elements.filter(e => e.type.startsWith('entity')).forEach(entity => {
      if (!entity.text || entity.text === 'Entity' || entity.text === 'Weak Entity') {
        issues.push(`Entity at (${Math.round(entity.x)}, ${Math.round(entity.y)}) has no name`);
      }
    });

    // Check for orphaned attributes
    const connectedAttrs = new Set();
    this.connections.forEach(conn => {
      const fromEl = this.elements.find(e => e.id === conn.from);
      const toEl = this.elements.find(e => e.id === conn.to);
      if (fromEl?.type.startsWith('attribute')) connectedAttrs.add(fromEl.id);
      if (toEl?.type.startsWith('attribute')) connectedAttrs.add(toEl.id);
    });
    
    this.elements.filter(e => e.type.startsWith('attribute')).forEach(attr => {
      if (!connectedAttrs.has(attr.id)) {
        issues.push(`Attribute "${attr.text}" is not connected to any entity`);
      }
    });

    // Check for relationships without proper connections
    this.elements.filter(e => e.type.startsWith('relationship')).forEach(rel => {
      const relConns = this.connections.filter(c => c.from === rel.id || c.to === rel.id);
      if (relConns.length < 2) {
        issues.push(`Relationship "${rel.text}" should connect at least 2 entities`);
      }
    });

    // Show validation results
    if (issues.length === 0) {
      alert('✓ Diagram looks good! No issues found.');
    } else {
      alert(`Validation Issues:\n\n${issues.join('\n')}`);
    }

    if (this.options.onValidate) {
      this.options.onValidate(issues);
    }

    return issues;
  }

  /**
   * Get diagram data for saving
   */
  getDiagramData() {
    return {
      notation: this.options.notation,
      elements: this.elements,
      connections: this.connections,
      version: '1.0'
    };
  }

  /**
   * Alias for getDiagramData() - used by practice test integration
   */
  getData() {
    return this.getDiagramData();
  }

  /**
   * Load diagram data - used by practice test integration
   */
  loadData(data) {
    if (!data) return;
    
    if (data.elements) {
      this.elements = data.elements;
    }
    if (data.connections) {
      this.connections = data.connections;
    }
    if (data.notation) {
      this.options.notation = data.notation;
    }
    
    // Find highest ID to continue from there
    let maxId = 0;
    this.elements.forEach(el => {
      const idNum = parseInt(el.id?.replace(/[^0-9]/g, ''));
      if (idNum > maxId) maxId = idNum;
    });
    this.elementIdCounter = maxId;
    
    this.render();
    this.updatePropertyPanel();
  }

  /**
   * Save diagram to localStorage
   */
  saveDiagram() {
    const data = this.getDiagramData();
    const key = `eerd_diagram_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(data));
    
    // Also save to list
    const listKey = 'eerd_diagrams';
    const list = JSON.parse(localStorage.getItem(listKey) || '[]');
    list.push({ key, date: new Date().toISOString() });
    localStorage.setItem(listKey, JSON.stringify(list));
    
    alert('Diagram saved!');
  }

  /**
   * Load diagram from localStorage
   */
  loadDiagram() {
    const listKey = 'eerd_diagrams';
    const list = JSON.parse(localStorage.getItem(listKey) || '[]');
    
    if (list.length === 0) {
      alert('No saved diagrams found');
      return;
    }

    const key = prompt('Enter diagram key to load:', list[list.length - 1]?.key);
    if (!key) return;

    const data = localStorage.getItem(key);
    if (!data) {
      alert('Diagram not found');
      return;
    }

    try {
      const diagram = JSON.parse(data);
      this.loadDiagramData(diagram);
    } catch (e) {
      alert('Failed to load diagram');
    }
  }

  /**
   * Load diagram data
   */
  loadDiagramData(data) {
    this.saveState();
    
    this.options.notation = data.notation || 'chen';
    this.elements = data.elements || [];
    this.connections = data.connections || [];
    
    // Update counters
    const maxElId = this.elements.reduce((max, e) => {
      const num = parseInt(e.id?.split('_')[1]) || 0;
      return Math.max(max, num);
    }, 0);
    const maxConnId = this.connections.reduce((max, c) => {
      const num = parseInt(c.id?.split('_')[1]) || 0;
      return Math.max(max, num);
    }, 0);
    
    this.elementIdCounter = maxElId;
    this.connectionIdCounter = maxConnId;
    
    this.selectedElement = null;
    this.selectedConnection = null;
    this.render();
    this.updatePropertyPanel();
  }

  /**
   * Destroy the component
   */
  destroy() {
    // Remove all event listeners properly using stored references
    if (this.boundHandleMouseDown) {
      this.canvasEl.removeEventListener('mousedown', this.boundHandleMouseDown);
    }
    if (this.boundHandleMouseMove) {
      this.canvasEl.removeEventListener('mousemove', this.boundHandleMouseMove);
    }
    if (this.boundHandleMouseUp) {
      this.canvasEl.removeEventListener('mouseup', this.boundHandleMouseUp);
    }
    if (this.boundHandleDoubleClick) {
      this.canvasEl.removeEventListener('dblclick', this.boundHandleDoubleClick);
    }
    if (this.boundHandleWheel) {
      this.canvasEl.removeEventListener('wheel', this.boundHandleWheel);
    }
    if (this.boundHandleKeyDown) {
      document.removeEventListener('keydown', this.boundHandleKeyDown);
    }
    if (this.boundContextMenu) {
      this.canvasEl.removeEventListener('contextmenu', this.boundContextMenu);
    }
    
    this.container.innerHTML = '';
  }
}

/**
 * EERD Question Component - Wrapper for test integration
 */
class EERDQuestionComponent {
  /**
   * Create a new EERD question component
   * @param {HTMLElement} container - Container element with data-question-id
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.questionId = container.dataset.questionId;
    this.options = {
      validationRules: null,
      ...options
    };

    this.init();
  }

  init() {
    // Find or create canvas container
    let canvasContainer = this.container.querySelector('.drawing-canvas');
    if (!canvasContainer) {
      canvasContainer = document.createElement('div');
      canvasContainer.className = 'drawing-canvas';
      this.container.appendChild(canvasContainer);
    }

    // Initialize the drawing component
    this.diagram = new EERDiagramComponent(canvasContainer, {
      width: 900,
      height: 500,
      onChange: (data) => this.handleChange(data),
      onValidate: (issues) => this.handleValidate(issues),
      ...this.options
    });

    // Load any saved answer
    this.loadAnswer();
  }

  handleChange(data) {
    // Auto-save to localStorage
    localStorage.setItem(`eerd_answer_${this.questionId}`, JSON.stringify(data));
    
    // Dispatch event for test engine
    const event = new CustomEvent('eerdAnswerChanged', {
      detail: { questionId: this.questionId, data }
    });
    this.container.dispatchEvent(event);
  }

  handleValidate(issues) {
    const event = new CustomEvent('eerdValidated', {
      detail: { questionId: this.questionId, issues, isValid: issues.length === 0 }
    });
    this.container.dispatchEvent(event);
  }

  loadAnswer() {
    const saved = localStorage.getItem(`eerd_answer_${this.questionId}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.diagram.loadDiagramData(data);
      } catch (e) {
        console.error('Failed to load saved diagram:', e);
      }
    }
  }

  getAnswer() {
    return this.diagram.getDiagramData();
  }

  validate() {
    return this.diagram.validate();
  }

  clear() {
    this.diagram.clearCanvas();
    localStorage.removeItem(`eerd_answer_${this.questionId}`);
  }

  destroy() {
    this.diagram.destroy();
  }
}

/**
 * Auto-initialize EERD questions on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-question-id]');
  containers.forEach(container => {
    if (container.querySelector('.drawing-canvas')) {
      container.eerdComponent = new EERDQuestionComponent(container);
    }
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EERDiagramComponent, EERDQuestionComponent };
}

// Make available globally
window.EERDiagramComponent = EERDiagramComponent;
window.EERDQuestionComponent = EERDQuestionComponent;
