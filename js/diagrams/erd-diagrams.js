/**
 * ERD Diagram Library for Section B - EERD Questions
 * Contains diagram definitions for Chen and IE notations
 * Uses both ASCII art and SVG representations
 */

const ERDDiagrams = {
    // ============================================
    // CHEN NOTATION DIAGRAMS
    // ============================================
    
    chen_basic_entity: {
        notation: 'chen',
        title: 'Basic Entity in Chen Notation',
        description: 'An entity is represented by a rectangle',
        ascii: `
    +-----------+
    |  CUSTOMER |
    +-----------+
        `,
        svg: `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="30" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="100" y="55" text-anchor="middle" font-family="Arial" font-size="14" fill="#1565c0">CUSTOMER</text>
        </svg>`,
        elements: ['entity']
    },
    
    chen_relationship_diamond: {
        notation: 'chen',
        title: 'Relationship in Chen Notation',
        description: 'A relationship is represented by a diamond connecting entities',
        ascii: `
    +---------+         places          +---------+
    | CUSTOMER|◄───────◆───────►|  ORDER  |
    +---------+                   +---------+
        `,
        svg: `<svg viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="55" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="80" y="80" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">CUSTOMER</text>
            <polygon points="200,40 240,75 200,110 160,75" fill="#fff3e0" stroke="#f57c00" stroke-width="2"/>
            <text x="200" y="80" text-anchor="middle" font-family="Arial" font-size="11" fill="#e65100">places</text>
            <rect x="270" y="55" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="320" y="80" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">ORDER</text>
            <line x1="130" y1="75" x2="160" y2="75" stroke="#666" stroke-width="1.5"/>
            <line x1="240" y1="75" x2="270" y2="75" stroke="#666" stroke-width="1.5"/>
        </svg>`,
        elements: ['entity', 'relationship']
    },
    
    chen_cardinality_1n: {
        notation: 'chen',
        title: 'One-to-Many Cardinality',
        description: '1:N cardinality showing one customer can place many orders',
        ascii: `
    +---------+      1      places      N      +---------+
    | CUSTOMER|◄────────────◆────────────►|  ORDER  |
    +---------+                            +---------+
        `,
        svg: `<svg viewBox="0 0 450 150" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="55" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="80" y="80" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">CUSTOMER</text>
            <text x="145" y="55" font-family="Arial" font-size="14" fill="#333" font-weight="bold">1</text>
            <polygon points="225,40 265,75 225,110 185,75" fill="#fff3e0" stroke="#f57c00" stroke-width="2"/>
            <text x="225" y="80" text-anchor="middle" font-family="Arial" font-size="11" fill="#e65100">places</text>
            <text x="305" y="55" font-family="Arial" font-size="14" fill="#333" font-weight="bold">N</text>
            <rect x="320" y="55" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="370" y="80" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">ORDER</text>
            <line x1="130" y1="75" x2="185" y2="75" stroke="#666" stroke-width="1.5"/>
            <line x1="265" y1="75" x2="320" y2="75" stroke="#666" stroke-width="1.5"/>
        </svg>`,
        elements: ['entity', 'relationship', 'cardinality']
    },
    
    chen_cardinality_mn: {
        notation: 'chen',
        title: 'Many-to-Many Cardinality',
        description: 'M:N cardinality showing students can enroll in many courses',
        ascii: `
    +---------+      M     enrolls      N      +---------+
    | STUDENT |◄────────────◆────────────►| COURSE  |
    +---------+                            +---------+
        `,
        svg: `<svg viewBox="0 0 450 150" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="55" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="80" y="80" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">STUDENT</text>
            <text x="142" y="55" font-family="Arial" font-size="14" fill="#333" font-weight="bold">M</text>
            <polygon points="225,40 265,75 225,110 185,75" fill="#fff3e0" stroke="#f57c00" stroke-width="2"/>
            <text x="225" y="80" text-anchor="middle" font-family="Arial" font-size="11" fill="#e65100">enrolls</text>
            <text x="308" y="55" font-family="Arial" font-size="14" fill="#333" font-weight="bold">N</text>
            <rect x="320" y="55" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="370" y="80" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">COURSE</text>
            <line x1="130" y1="75" x2="185" y2="75" stroke="#666" stroke-width="1.5"/>
            <line x1="265" y1="75" x2="320" y2="75" stroke="#666" stroke-width="1.5"/>
        </svg>`,
        elements: ['entity', 'relationship', 'cardinality']
    },
    
    chen_attributes: {
        notation: 'chen',
        title: 'Entity with Attributes',
        description: 'Attributes are shown as ovals connected to the entity',
        ascii: `
         ____
        / ID \_____
        \\____/     |
                    |
    +-----------+   |   +----------+
    |  CUSTOMER |◄──┴──►|  Name    |
    +-----------+       +----------+
            |
            ▼
         +---------+
         |  Email  |
         +---------+
        `,
        svg: `<svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
            <rect x="130" y="100" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="180" y="125" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">CUSTOMER</text>
            
            <ellipse cx="80" cy="60" rx="50" ry="25" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="1.5"/>
            <text x="80" y="55" text-anchor="middle" font-family="Arial" font-size="11" fill="#4a148c" text-decoration="underline">CustID</text>
            <text x="80" y="70" text-anchor="middle" font-family="Arial" font-size="9" fill="#4a148c">(PK)</text>
            
            <ellipse cx="280" cy="60" rx="45" ry="25" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="1.5"/>
            <text x="280" y="65" text-anchor="middle" font-family="Arial" font-size="11" fill="#4a148c">Name</text>
            
            <ellipse cx="180" cy="200" rx="45" ry="25" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="1.5"/>
            <text x="180" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#4a148c">Email</text>
            
            <line x1="130" y1="110" x2="110" y2="75" stroke="#666" stroke-width="1"/>
            <line x1="230" y1="110" x2="245" y2="80" stroke="#666" stroke-width="1"/>
            <line x1="180" y1="140" x2="180" y2="175" stroke="#666" stroke-width="1"/>
        </svg>`,
        elements: ['entity', 'attribute', 'key']
    },
    
    chen_multivalued_attribute: {
        notation: 'chen',
        title: 'Multi-Valued Attribute',
        description: 'Double oval indicates an attribute that can have multiple values',
        ascii: `
    +-----------+
    |  CUSTOMER |
    +-----------+
          │
          ▼
       ((Phone))  <-- Double oval = multi-valued
        `,
        svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
            <rect x="80" y="30" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="130" y="55" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">CUSTOMER</text>
            
            <ellipse cx="130" cy="130" rx="55" ry="30" fill="none" stroke="#7b1fa2" stroke-width="2"/>
            <ellipse cx="130" cy="130" rx="48" ry="25" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="1"/>
            <text x="130" y="135" text-anchor="middle" font-family="Arial" font-size="11" fill="#4a148c">Phone</text>
            
            <line x1="130" y1="70" x2="130" y2="100" stroke="#666" stroke-width="1"/>
            
            <text x="220" y="135" font-family="Arial" font-size="10" fill="#666">Multi-valued:</text>
            <text x="220" y="150" font-family="Arial" font-size="10" fill="#666">Customer can</text>
            <text x="220" y="165" font-family="Arial" font-size="10" fill="#666">have many phones</text>
        </svg>`,
        elements: ['entity', 'multivalued_attribute']
    },
    
    chen_composite_attribute: {
        notation: 'chen',
        title: 'Composite Attribute',
        description: 'Composite attributes break down into component parts',
        ascii: `
    +-----------+
    |  CUSTOMER |
    +-----------+
          │
          ▼
       +-----+
       |Name |
       +--+--+          
      /  |   \\
     ▼   ▼    ▼
 +-----+-----+------+
 |First|Last |Middle|
 +-----+-----+------+
        `,
        svg: `<svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
            <rect x="130" y="20" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="180" y="45" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">CUSTOMER</text>
            
            <ellipse cx="180" cy="110" rx="40" ry="25" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="1.5"/>
            <text x="180" y="115" text-anchor="middle" font-family="Arial" font-size="11" fill="#4a148c">Name</text>
            
            <ellipse cx="100" cy="190" rx="40" ry="25" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="1"/>
            <text x="100" y="195" text-anchor="middle" font-family="Arial" font-size="10" fill="#4a148c">First</text>
            
            <ellipse cx="180" cy="200" rx="40" ry="25" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="1"/>
            <text x="180" y="205" text-anchor="middle" font-family="Arial" font-size="10" fill="#4a148c">Last</text>
            
            <ellipse cx="260" cy="190" rx="40" ry="25" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="1"/>
            <text x="260" y="195" text-anchor="middle" font-family="Arial" font-size="10" fill="#4a148c">Middle</text>
            
            <line x1="180" y1="60" x2="180" y2="85" stroke="#666" stroke-width="1"/>
            <line x1="160" y1="130" x2="115" y2="165" stroke="#666" stroke-width="1"/>
            <line x1="180" y1="135" x2="180" y2="175" stroke="#666" stroke-width="1"/>
            <line x1="200" y1="130" x2="245" y2="165" stroke="#666" stroke-width="1"/>
        </svg>`,
        elements: ['entity', 'composite_attribute']
    },
    
    chen_key_attribute: {
        notation: 'chen',
        title: 'Primary Key Attribute',
        description: 'Underlined attribute name indicates the primary key',
        ascii: `
    +-----------+
    |  CUSTOMER |
    +-----------+
          │
          ▼
       +-----+
       |<u>ID</u> |  <-- Underlined = Primary Key
       +-----+
        `,
        svg: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
            <rect x="80" y="20" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="130" y="45" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">CUSTOMER</text>
            
            <ellipse cx="130" cy="130" rx="50" ry="30" fill="#ffebee" stroke="#c62828" stroke-width="2"/>
            <text x="130" y="135" text-anchor="middle" font-family="Arial" font-size="12" fill="#b71c1c" font-weight="bold" text-decoration="underline">CustID</text>
            
            <line x1="130" y1="60" x2="130" y2="100" stroke="#666" stroke-width="1.5"/>
            
            <text x="220" y="125" font-family="Arial" font-size="10" fill="#666">Underlined =</text>
            <text x="220" y="140" font-family="Arial" font-size="10" fill="#666">Primary Key</text>
        </svg>`,
        elements: ['entity', 'key']
    },
    
    chen_weak_entity: {
        notation: 'chen',
        title: 'Weak Entity',
        description: 'Double rectangle represents a weak entity that depends on another entity',
        ascii: `
    +=========+                +---------+
    ║  ORDER  ║◄══════◆══════►│LINE ITEM│
    +=========+                +---------+
                                   │
                                   ▼
                                +-------+
                                |LineNum|
                                +-------+
    Legend: = double rectangle (weak entity)
        `,
        svg: `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="60" width="110" height="50" fill="#e3f2fd" stroke="#1976d2" stroke-width="3"/>
            <rect x="35" y="65" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="1"/>
            <text x="85" y="90" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">ORDER</text>
            
            <polygon points="225,60 265,85 225,110 185,85" fill="#fff3e0" stroke="#f57c00" stroke-width="2"/>
            <text x="225" y="90" text-anchor="middle" font-family="Arial" font-size="10" fill="#e65100">contains</text>
            
            <rect x="320" y="55" width="110" height="50" fill="#fff8e1" stroke="#f9a825" stroke-width="3"/>
            <rect x="325" y="60" width="100" height="40" fill="#fff8e1" stroke="#f9a825" stroke-width="1"/>
            <text x="375" y="85" text-anchor="middle" font-family="Arial" font-size="11" fill="#f57f17">LINE ITEM</text>
            
            <ellipse cx="375" cy="165" rx="45" ry="25" fill="#ffebee" stroke="#c62828" stroke-width="1.5" stroke-dasharray="4,2"/>
            <text x="375" y="170" text-anchor="middle" font-family="Arial" font-size="10" fill="#b71c1c">LineNum</text>
            
            <line x1="140" y1="85" x2="185" y2="85" stroke="#666" stroke-width="2"/>
            <line x1="265" y1="85" x2="320" y2="85" stroke="#666" stroke-width="2"/>
            <line x1="375" y1="105" x2="375" y2="140" stroke="#666" stroke-width="1"/>
            
            <text x="430" y="170" font-family="Arial" font-size="9" fill="#666">Dashed =</text>
            <text x="430" y="182" font-family="Arial" font-size="9" fill="#666">Partial Key</text>
        </svg>`,
        elements: ['entity', 'weak_entity', 'identifying_relationship', 'partial_key']
    },
    
    chen_identifying_relationship: {
        notation: 'chen',
        title: 'Identifying Relationship',
        description: 'Double diamond indicates an identifying relationship',
        ascii: `
    +=========+     1       ╔═══════════╗      N      +=========+
    ║  ORDER  ║◄───────────╬  contains ╠────────────►║LINE ITEM║
    +=========+             ╚═══════════╝             +=========+
    Legend: = double, ╔═╗ = double diamond
        `,
        svg: `<svg viewBox="0 0 550 180" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="65" width="110" height="50" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="85" y="95" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">ORDER</text>
            
            <polygon points="250,45 295,85 250,125 205,85" fill="none" stroke="#e65100" stroke-width="3"/>
            <polygon points="250,52 288,85 250,118 212,85" fill="#fff3e0" stroke="#f57c00" stroke-width="1"/>
            <text x="250" y="90" text-anchor="middle" font-family="Arial" font-size="10" fill="#e65100">contains</text>
            
            <text x="160" y="55" font-family="Arial" font-size="12" fill="#333" font-weight="bold">1</text>
            <text x="340" y="55" font-family="Arial" font-size="12" fill="#333" font-weight="bold">N</text>
            
            <rect x="395" y="65" width="110" height="50" fill="#fff8e1" stroke="#f9a825" stroke-width="3"/>
            <rect x="400" y="70" width="100" height="40" fill="#fff8e1" stroke="#f9a825" stroke-width="1"/>
            <text x="450" y="95" text-anchor="middle" font-family="Arial" font-size="11" fill="#f57f17">LINE ITEM</text>
            
            <line x1="140" y1="90" x2="205" y2="90" stroke="#666" stroke-width="2"/>
            <line x1="295" y1="90" x2="395" y2="90" stroke="#666" stroke-width="2"/>
            
            <text x="480" y="150" font-family="Arial" font-size="9" fill="#666">Double diamond =</text>
            <text x="480" y="162" font-family="Arial" font-size="9" fill="#666">Identifying</text>
        </svg>`,
        elements: ['entity', 'weak_entity', 'identifying_relationship', 'cardinality']
    },
    
    chen_superclass: {
        notation: 'chen',
        title: 'Superclass/Subclass Structure',
        description: 'Circle connects superclass to subclasses',
        ascii: `
         +---------+
         │ DWELLING│
         +----+----+
              │
          ____○____        Legend: ○ = circle
         /    │    \\             /│\\ = lines to subclasses
        ▼     ▼     ▼
    +------+------+------+
    │HOUSE │CONDO │APT   │
    +------+------+------+
        `,
        svg: `<svg viewBox="0 0 450 250" xmlns="http://www.w3.org/2000/svg">
            <rect x="165" y="20" width="100" height="45" fill="#e8f5e9" stroke="#388e3c" stroke-width="2"/>
            <text x="215" y="48" text-anchor="middle" font-family="Arial" font-size="12" fill="#1b5e20">DWELLING</text>
            
            <circle cx="215" cy="115" r="25" fill="#fff" stroke="#666" stroke-width="2"/>
            <text x="215" y="120" text-anchor="middle" font-family="Arial" font-size="12" fill="#333">d</text>
            
            <rect x="40" y="180" width="80" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="80" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">HOUSE</text>
            
            <rect x="175" y="180" width="80" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="215" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">CONDO</text>
            
            <rect x="310" y="180" width="80" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="350" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">APT</text>
            
            <line x1="215" y1="65" x2="215" y2="90" stroke="#666" stroke-width="1.5"/>
            <line x1="195" y1="133" x2="95" y2="180" stroke="#666" stroke-width="1.5"/>
            <line x1="215" y1="140" x2="215" y2="180" stroke="#666" stroke-width="1.5"/>
            <line x1="235" y1="133" x2="335" y2="180" stroke="#666" stroke-width="1.5"/>
            
            <text x="330" y="100" font-family="Arial" font-size="9" fill="#666">'d' = disjoint/</text>
            <text x="330" y="112" font-family="Arial" font-size="9" fill="#666">exclusive</text>
            <text x="330" y="124" font-family="Arial" font-size="9" fill="#666">(only ONE type)</text>
        </svg>`,
        elements: ['superclass', 'subclass', 'exclusive']
    },
    
    chen_exclusive_subclass: {
        notation: 'chen',
        title: 'Exclusive (Disjoint) Subtypes',
        description: 'Circle with d indicates exclusive subtypes - entity can be only ONE subtype',
        ascii: `
         +----------+
         │  PERSON  │
         +----+-----+
              │
          ____○____   'd' = disjoint/exclusive
         /    │    \\     (one and only one)
        ▼     ▼     ▼
    +--------+--------+--------+
    │STUDENT │EMPLOYEE│RETIREE│
    +--------+--------+--------+
        `,
        svg: `<svg viewBox="0 0 500 250" xmlns="http://www.w3.org/2000/svg">
            <rect x="190" y="20" width="100" height="45" fill="#e8f5e9" stroke="#388e3c" stroke-width="2"/>
            <text x="240" y="48" text-anchor="middle" font-family="Arial" font-size="12" fill="#1b5e20">PERSON</text>
            
            <circle cx="240" cy="115" r="25" fill="#fff" stroke="#666" stroke-width="2"/>
            <text x="240" y="122" text-anchor="middle" font-family="Arial" font-size="14" fill="#d32f2f" font-weight="bold">d</text>
            
            <rect x="30" y="180" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="75" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">STUDENT</text>
            
            <rect x="195" y="180" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="240" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">EMPLOYEE</text>
            
            <rect x="360" y="180" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="405" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">RETIREE</text>
            
            <line x1="240" y1="65" x2="240" y2="90" stroke="#666" stroke-width="1.5"/>
            <line x1="222" y1="133" x2="90" y2="180" stroke="#666" stroke-width="1.5"/>
            <line x1="240" y1="140" x2="240" y2="180" stroke="#666" stroke-width="1.5"/>
            <line x1="258" y1="133" x2="390" y2="180" stroke="#666" stroke-width="1.5"/>
            
            <text x="360" y="100" font-family="Arial" font-size="10" fill="#d32f2f" font-weight="bold">EXCLUSIVE:</text>
            <text x="360" y="115" font-family="Arial" font-size="9" fill="#666">Person is exactly</text>
            <text x="360" y="128" font-family="Arial" font-size="9" fill="#666">ONE of these types</text>
        </svg>`,
        elements: ['superclass', 'subclass', 'exclusive']
    },
    
    chen_overlapping_subclass: {
        notation: 'chen',
        title: 'Overlapping Subtypes',
        description: 'Circle with o indicates overlapping subtypes - entity can be MULTIPLE subtypes',
        ascii: `
         +----------+
         │  PERSON  │
         +----+-----+
              │
          ____○____   'o' = overlapping
         /    │    \\     (can be multiple)
        ▼     ▼     ▼
    +--------+--------+--------+
    │STUDENT │EMPLOYEE│PARENT │
    +--------+--------+--------+
        `,
        svg: `<svg viewBox="0 0 500 250" xmlns="http://www.w3.org/2000/svg">
            <rect x="190" y="20" width="100" height="45" fill="#e8f5e9" stroke="#388e3c" stroke-width="2"/>
            <text x="240" y="48" text-anchor="middle" font-family="Arial" font-size="12" fill="#1b5e20">PERSON</text>
            
            <circle cx="240" cy="115" r="25" fill="#fff" stroke="#666" stroke-width="2"/>
            <text x="240" y="122" text-anchor="middle" font-family="Arial" font-size="14" fill="#1976d2" font-weight="bold">o</text>
            
            <rect x="30" y="180" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="75" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">STUDENT</text>
            
            <rect x="195" y="180" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="240" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">EMPLOYEE</text>
            
            <rect x="360" y="180" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="405" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">PARENT</text>
            
            <line x1="240" y1="65" x2="240" y2="90" stroke="#666" stroke-width="1.5"/>
            <line x1="222" y1="133" x2="90" y2="180" stroke="#666" stroke-width="1.5"/>
            <line x1="240" y1="140" x2="240" y2="180" stroke="#666" stroke-width="1.5"/>
            <line x1="258" y1="133" x2="390" y2="180" stroke="#666" stroke-width="1.5"/>
            
            <text x="360" y="100" font-family="Arial" font-size="10" fill="#1976d2" font-weight="bold">OVERLAPPING:</text>
            <text x="360" y="115" font-family="Arial" font-size="9" fill="#666">Person can be</text>
            <text x="360" y="128" font-family="Arial" font-size="9" fill="#666">MULTIPLE types</text>
            <text x="360" y="141" font-family="Arial" font-size="9" fill="#666">(e.g., Student+Employee)</text>
        </svg>`,
        elements: ['superclass', 'subclass', 'overlapping']
    },
    
    chen_partial_key: {
        notation: 'chen',
        title: 'Partial Key in Weak Entity',
        description: 'Dashed underline indicates a partial key (discriminator)',
        ascii: `
    +=========+                +=========+
    ║ EMPLOYEE║◄══════════════►║DEPENDENT║
    +=========+   depends_on   +====+====+
                                      │
                                      ▼
                               +----------+
                               │ -<u>Name</u>- │ <-- Dashed = Partial Key
                               +----------+
        `,
        svg: `<svg viewBox="0 0 500 220" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="60" width="120" height="50" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="90" y="90" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">EMPLOYEE</text>
            
            <polygon points="250,55 290,85 250,115 210,85" fill="#fff3e0" stroke="#f57c00" stroke-width="2"/>
            <text x="250" y="90" text-anchor="middle" font-family="Arial" font-size="10" fill="#e65100">depends_on</text>
            
            <rect x="350" y="60" width="120" height="50" fill="#fff8e1" stroke="#f9a825" stroke-width="3"/>
            <rect x="355" y="65" width="110" height="40" fill="#fff8e1" stroke="#f9a825" stroke-width="1"/>
            <text x="410" y="90" text-anchor="middle" font-family="Arial" font-size="11" fill="#f57f17">DEPENDENT</text>
            
            <ellipse cx="410" cy="170" rx="60" ry="30" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="1"/>
            <text x="410" y="165" text-anchor="middle" font-family="Arial" font-size="11" fill="#4a148c" text-decoration="underline" text-decoration-style="dashed">Name</text>
            <text x="410" y="180" text-anchor="middle" font-family="Arial" font-size="9" fill="#666">Partial Key</text>
            
            <line x1="150" y1="85" x2="210" y2="85" stroke="#666" stroke-width="2"/>
            <line x1="290" y1="85" x2="350" y2="85" stroke="#666" stroke-width="2"/>
            <line x1="410" y1="110" x2="410" y2="140" stroke="#666" stroke-width="1"/>
            
            <text x="30" y="210" font-family="Arial" font-size="9" fill="#666">Dashed underline = Partial Key (discriminator)</text>
            <text x="30" y="222" font-family="Arial" font-size="9" fill="#666">Need: EmpID + Name to uniquely identify a dependent</text>
        </svg>`,
        elements: ['entity', 'weak_entity', 'identifying_relationship', 'partial_key']
    },
    
    chen_total_participation: {
        notation: 'chen',
        title: 'Total Participation (Modified Chen)',
        description: 'Double line indicates mandatory (total) participation',
        ascii: `
    +---------+      ═══       +---------+
    │   A     │◄══════════════►│   B     │
    +---------+                +---------+
        
    ═══ = Double line (must participate)
        `,
        svg: `<svg viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="55" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="85" y="80" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">EMPLOYEE</text>
            
            <polygon points="200,50 235,75 200,100 165,75" fill="#fff3e0" stroke="#f57c00" stroke-width="2"/>
            <text x="200" y="80" text-anchor="middle" font-family="Arial" font-size="10" fill="#e65100">manages</text>
            
            <rect x="270" y="55" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="315" y="80" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">DEPARTMENT</text>
            
            <line x1="130" y1="72" x2="165" y2="72" stroke="#333" stroke-width="2"/>
            <line x1="130" y1="78" x2="165" y2="78" stroke="#333" stroke-width="2"/>
            
            <line x1="235" y1="75" x2="270" y2="75" stroke="#666" stroke-width="1"/>
            
            <text x="50" y="130" font-family="Arial" font-size="10" fill="#666">Double line = Total/Mandatory participation</text>
            <text x="50" y="145" font-family="Arial" font-size="9" fill="#666">Every Employee MUST manage a Department</text>
        </svg>`,
        elements: ['entity', 'relationship', 'total_participation']
    },
    
    // ============================================
    // IE NOTATION DIAGRAMS
    // ============================================
    
    ie_basic_entity: {
        notation: 'ie',
        title: 'Strong Entity in IE Notation',
        description: 'Rectangle with square corners represents a strong entity',
        ascii: `
    +-----------+
    |  CUSTOMER |
    +-----------+
        `,
        svg: `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="30" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="100" y="55" text-anchor="middle" font-family="Arial" font-size="14" fill="#1565c0">CUSTOMER</text>
            <text x="50" y="90" font-family="Arial" font-size="10" fill="#666">Square corners = Strong entity</text>
        </svg>`,
        elements: ['entity']
    },
    
    ie_weak_entity: {
        notation: 'ie',
        title: 'Weak Entity in IE Notation',
        description: 'Rounded corners indicate a weak entity',
        ascii: `
    +-----------+
    |  ORDER    |
    +-----+-----+
          │
          │1
          │
     _____○_____    <-- Rounded corners = Weak
    /   LINE    \\        Entity
    \\   ITEM    /
     +---------+
        `,
        svg: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
            <rect x="120" y="20" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="170" y="45" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">ORDER</text>
            
            <line x1="170" y1="60" x2="170" y2="85" stroke="#666" stroke-width="1.5"/>
            <text x="175" y="78" font-family="Arial" font-size="10" fill="#333">1</text>
            
            <line x1="155" y1="95" x2="170" y2="85" stroke="#666" stroke-width="1"/>
            <line x1="185" y1="95" x2="170" y2="85" stroke="#666" stroke-width="1"/>
            <circle cx="155" cy="95" r="3" fill="#fff" stroke="#666" stroke-width="1"/>
            <line x1="158" y1="92" x2="158" y2="98" stroke="#666" stroke-width="1"/>
            <line x1="180" y1="90" x2="190" y2="100" stroke="#666" stroke-width="1"/>
            <line x1="180" y1="100" x2="190" y2="90" stroke="#666" stroke-width="1"/>
            <line x1="183" y1="88" x2="193" y2="98" stroke="#666" stroke-width="1"/>
            <line x1="183" y1="98" x2="193" y2="88" stroke="#666" stroke-width="1"/>
            
            <rect x="100" y="110" width="100" height="40" rx="15" fill="#fff8e1" stroke="#f9a825" stroke-width="2"/>
            <text x="150" y="135" text-anchor="middle" font-family="Arial" font-size="11" fill="#f57f17">LINE ITEM</text>
            
            <text x="220" y="135" font-family="Arial" font-size="10" fill="#666">← Rounded corners</text>
            
            <text x="50" y="190" font-family="Arial" font-size="9" fill="#666">Crow's foot notation: | = one, O = zero, < = many</text>
            <text x="50" y="205" font-family="Arial" font-size="9" fill="#666">This shows: One Order has many Line Items</text>
        </svg>`,
        elements: ['entity', 'weak_entity', 'cardinality']
    },
    
    ie_crowsfoot_one: {
        notation: 'ie',
        title: 'Crow\'s Foot: One and Only One',
        description: 'Single vertical bar | means exactly one',
        ascii: `
    +---------+                +---------+
    │    A    │◄──────────────►│    B    │
    +---------+         |      +---------+
                          
    Legend: | = One and only one
        `,
        svg: `<svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="40" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="85" y="65" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">DEPT</text>
            
            <line x1="130" y1="60" x2="250" y2="60" stroke="#666" stroke-width="1.5"/>
            
            <line x1="250" y1="50" x2="250" y2="70" stroke="#333" stroke-width="2"/>
            <text x="255" y="55" font-family="Arial" font-size="12" fill="#333" font-weight="bold">|</text>
            
            <rect x="260" y="40" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="305" y="65" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">EMP</text>
            
            <text x="40" y="105" font-family="Arial" font-size="11" fill="#333">| = One and only one (exactly one, mandatory)</text>
        </svg>`,
        elements: ['cardinality']
    },
    
    ie_crowsfoot_many: {
        notation: 'ie',
        title: 'Crow\'s Foot: Many (Zero or More)',
        description: 'Crow\'s foot < means many (zero or more)',
        ascii: `
    +---------+                +---------+
    │    A    │◄──────────────►│    B    │
    +---------+        <<      +---------+
                          
    Legend: << = Many (zero or more)
        `,
        svg: `<svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="40" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="85" y="65" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">CUST</text>
            
            <line x1="130" y1="60" x2="240" y2="60" stroke="#666" stroke-width="1.5"/>
            
            <line x1="240" y1="50" x2="255" y2="60" stroke="#333" stroke-width="2"/>
            <line x1="240" y1="70" x2="255" y2="60" stroke="#333" stroke-width="2"/>
            <line x1="245" y1="45" x2="260" y2="60" stroke="#333" stroke-width="2"/>
            <line x1="245" y1="75" x2="260" y2="60" stroke="#333" stroke-width="2"/>
            
            <rect x="260" y="40" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="305" y="65" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">ORDER</text>
            
            <text x="40" y="105" font-family="Arial" font-size="11" fill="#333">Crow's foot < = Many (zero or more)</text>
        </svg>`,
        elements: ['cardinality']
    },
    
    ie_crowsfoot_zero: {
        notation: 'ie',
        title: 'Crow\'s Foot: Zero',
        description: 'Circle O means zero (optional)',
        ascii: `
    Combinations:
    O| = Zero or one
    O< = Zero or many
    |  = One and only one
    <  = One or many
        `,
        svg: `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg">
            <text x="30" y="30" font-family="Arial" font-size="12" fill="#333" font-weight="bold">Crow's Foot Cardinality Combinations:</text>
            
            <!-- Zero or One -->
            <circle cx="60" cy="65" r="8" fill="none" stroke="#333" stroke-width="1.5"/>
            <line x1="72" y1="57" x2="72" y2="73" stroke="#333" stroke-width="2"/>
            <text x="90" y="70" font-family="Arial" font-size="11" fill="#333">O| = Zero or one (optional, max one)</text>
            
            <!-- Zero or Many -->
            <circle cx="60" cy="105" r="8" fill="none" stroke="#333" stroke-width="1.5"/>
            <line x1="72" y1="97" x2="87" y2="105" stroke="#333" stroke-width="2"/>
            <line x1="72" y1="113" x2="87" y2="105" stroke="#333" stroke-width="2"/>
            <line x1="77" y1="92" x2="92" y2="105" stroke="#333" stroke-width="2"/>
            <line x1="77" y1="118" x2="92" y2="105" stroke="#333" stroke-width="2"/>
            <text x="100" y="110" font-family="Arial" font-size="11" fill="#333">O< = Zero or many (optional)</text>
            
            <!-- One and only one -->
            <line x1="60" y1="145" x2="60" y2="161" stroke="#333" stroke-width="2"/>
            <line x1="66" y1="145" x2="66" y2="161" stroke="#333" stroke-width="2"/>
            <text x="80" y="158" font-family="Arial" font-size="11" fill="#333">|| = One and only one (mandatory, exactly one)</text>
            
            <!-- One or many -->
            <line x1="60" y1="185" x2="60" y2="195" stroke="#333" stroke-width="2"/>
            <line x1="66" y1="180" x2="81" y2="190" stroke="#333" stroke-width="2"/>
            <line x1="66" y1="200" x2="81" y2="190" stroke="#333" stroke-width="2"/>
            <text x="90" y="195" font-family="Arial" font-size="11" fill="#333">|< = One or many (mandatory, at least one)</text>
        </svg>`,
        elements: ['cardinality']
    },
    
    ie_identifying_relationship: {
        notation: 'ie',
        title: 'Identifying Relationship (Solid Line)',
        description: 'Solid line indicates identifying relationship',
        ascii: `
    +---------+                +---------+
    │  ORDER  │───────◆───────│LINE ITEM│
    +---------+   Solid Line   +---------+
                          
    Legend: ─── = Identifying relationship
        `,
        svg: `<svg viewBox="0 0 450 150" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="50" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="90" y="75" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">ORDER</text>
            
            <line x1="140" y1="60" x2="250" y2="60" stroke="#333" stroke-width="2"/>
            <line x1="140" y1="80" x2="250" y2="80" stroke="#333" stroke-width="2"/>
            
            <!-- Crows foot for many -->
            <line x1="250" y1="55" x2="265" y2="65" stroke="#333" stroke-width="1.5"/>
            <line x1="250" y1="75" x2="265" y2="65" stroke="#333" stroke-width="1.5"/>
            
            <rect x="270" y="50" width="100" height="40" rx="10" fill="#fff8e1" stroke="#f9a825" stroke-width="2"/>
            <text x="320" y="75" text-anchor="middle" font-family="Arial" font-size="11" fill="#f57f17">LINE ITEM</text>
            
            <text x="40" y="120" font-family="Arial" font-size="11" fill="#333" font-weight="bold">Solid Line = Identifying Relationship</text>
            <text x="40" y="138" font-family="Arial" font-size="10" fill="#666">Child's PK includes parent's PK</text>
        </svg>`,
        elements: ['entity', 'weak_entity', 'identifying_relationship']
    },
    
    ie_non_identifying_relationship: {
        notation: 'ie',
        title: 'Non-Identifying Relationship (Dotted Line)',
        description: 'Dotted line indicates non-identifying relationship',
        ascii: `
    +---------+                +---------+
    │CUSTOMER │.......◆.......│RENTAL   │
    +---------+  Dotted Line   +---------+
                          
    Legend: ... = Non-identifying relationship
        `,
        svg: `<svg viewBox="0 0 450 150" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="50" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="90" y="75" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">CUSTOMER</text>
            
            <line x1="140" y1="60" x2="260" y2="60" stroke="#666" stroke-width="2" stroke-dasharray="5,3"/>
            <line x1="140" y1="80" x2="260" y2="80" stroke="#666" stroke-width="2" stroke-dasharray="5,3"/>
            
            <!-- Zero or many -->
            <circle cx="250" cy="70" r="5" fill="none" stroke="#666" stroke-width="1.5"/>
            <line x1="258" y1="62" x2="258" y2="78" stroke="#666" stroke-width="1.5"/>
            <line x1="258" y1="67" x2="273" y2="70" stroke="#666" stroke-width="1.5"/>
            <line x1="258" y1="73" x2="273" y2="70" stroke="#666" stroke-width="1.5"/>
            
            <rect x="280" y="50" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="330" y="75" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">RENTAL</text>
            
            <text x="40" y="120" font-family="Arial" font-size="11" fill="#666" font-weight="bold">Dotted Line = Non-Identifying Relationship</text>
            <text x="40" y="138" font-family="Arial" font-size="10" fill="#666">Child has its own independent PK</text>
        </svg>`,
        elements: ['entity', 'non_identifying_relationship']
    },
    
    ie_superclass_exclusive: {
        notation: 'ie',
        title: 'Exclusive Subclass in IE Notation',
        description: 'Single connection with circle-x indicates exclusive subtypes',
        ascii: `
    +-----------+
    │ DWELLING  │
    +-----+-----+
          │
          ◇────── Exclusive (circle with x)
         /|\\
        ▼ ▼ ▼
    +------+------+------+
    │HOUSE │CONDO │APT   │
    +------+------+------+
        `,
        svg: `<svg viewBox="0 0 450 250" xmlns="http://www.w3.org/2000/svg">
            <rect x="165" y="20" width="100" height="45" fill="#e8f5e9" stroke="#388e3c" stroke-width="2"/>
            <text x="215" y="48" text-anchor="middle" font-family="Arial" font-size="12" fill="#1b5e20">DWELLING</text>
            
            <line x1="215" y1="65" x2="215" y2="95" stroke="#666" stroke-width="1.5"/>
            
            <circle cx="215" cy="105" r="12" fill="#fff" stroke="#666" stroke-width="1.5"/>
            <line x1="208" y1="98" x2="222" y2="112" stroke="#666" stroke-width="1.5"/>
            <line x1="222" y1="98" x2="208" y2="112" stroke="#666" stroke-width="1.5"/>
            
            <line x1="205" y1="115" x2="95" y2="180" stroke="#666" stroke-width="1.5"/>
            <line x1="215" y1="117" x2="215" y2="180" stroke="#666" stroke-width="1.5"/>
            <line x1="225" y1="115" x2="335" y2="180" stroke="#666" stroke-width="1.5"/>
            
            <rect x="40" y="180" width="80" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="80" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">HOUSE</text>
            
            <rect x="175" y="180" width="80" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="215" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">CONDO</text>
            
            <rect x="310" y="180" width="80" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="350" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">APT</text>
            
            <text x="300" y="105" font-family="Arial" font-size="9" fill="#d32f2f" font-weight="bold">EXCLUSIVE</text>
            <text x="300" y="120" font-family="Arial" font-size="9" fill="#666">(only one type)</text>
        </svg>`,
        elements: ['superclass', 'subclass', 'exclusive']
    },
    
    ie_superclass_overlapping: {
        notation: 'ie',
        title: 'Overlapping Subclass in IE Notation',
        description: 'Circle with o indicates overlapping subtypes',
        ascii: `
    +-----------+
    │  PERSON   │
    +-----+-----+
          │
          ○      <-- 'o' = Overlapping
         /|\\
        ▼ ▼ ▼
    +--------+--------+--------+
    │STUDENT │EMPLOYEE│PARENT │
    +--------+--------+--------+
        `,
        svg: `<svg viewBox="0 0 500 250" xmlns="http://www.w3.org/2000/svg">
            <rect x="190" y="20" width="100" height="45" fill="#e8f5e9" stroke="#388e3c" stroke-width="2"/>
            <text x="240" y="48" text-anchor="middle" font-family="Arial" font-size="12" fill="#1b5e20">PERSON</text>
            
            <line x1="240" y1="65" x2="240" y2="95" stroke="#666" stroke-width="1.5"/>
            
            <circle cx="240" cy="105" r="15" fill="#fff" stroke="#666" stroke-width="1.5"/>
            <text x="240" y="110" text-anchor="middle" font-family="Arial" font-size="12" fill="#1976d2" font-weight="bold">o</text>
            
            <line x1="228" y1="115" x2="95" y2="180" stroke="#666" stroke-width="1.5"/>
            <line x1="240" y1="120" x2="240" y2="180" stroke="#666" stroke-width="1.5"/>
            <line x1="252" y1="115" x2="385" y2="180" stroke="#666" stroke-width="1.5"/>
            
            <rect x="30" y="180" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="75" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">STUDENT</text>
            
            <rect x="195" y="180" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="240" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">EMPLOYEE</text>
            
            <rect x="360" y="180" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="405" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">PARENT</text>
            
            <text x="340" y="100" font-family="Arial" font-size="10" fill="#1976d2" font-weight="bold">OVERLAPPING</text>
            <text x="340" y="115" font-family="Arial" font-size="9" fill="#666">(can be multiple)</text>
            <text x="340" y="128" font-family="Arial" font-size="9" fill="#666">e.g., Student+Employee</text>
        </svg>`,
        elements: ['superclass', 'subclass', 'overlapping']
    },
    
    ie_role_names: {
        notation: 'ie',
        title: 'Role Names in IE Notation',
        description: 'Role names appear near the relationship line',
        ascii: `
    +---------+                +---------+
    │  USER   │──────buyer────►│  ORDER  │
    │         │◄─────seller────│         │
    +---------+                +---------+
        `,
        svg: `<svg viewBox="0 0 450 180" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="65" width="90" height="50" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="85" y="85" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">USER</text>
            <text x="85" y="102" text-anchor="middle" font-family="Arial" font-size="9" fill="#666">(same entity)</text>
            
            <line x1="130" y1="75" x2="270" y2="75" stroke="#666" stroke-width="1.5"/>
            <text x="200" y="70" text-anchor="middle" font-family="Arial" font-size="10" fill="#4caf50" font-weight="bold">buyer</text>
            
            <line x1="130" y1="105" x2="270" y2="105" stroke="#666" stroke-width="1.5"/>
            <text x="200" y="125" text-anchor="middle" font-family="Arial" font-size="10" fill="#ff9800" font-weight="bold">seller</text>
            
            <rect x="280" y="65" width="90" height="50" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="325" y="95" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0">ORDER</text>
            
            <text x="40" y="150" font-family="Arial" font-size="10" fill="#666">Role names clarify which role the User plays</text>
        </svg>`,
        elements: ['entity', 'role_names']
    },
    
    // ============================================
    // COMPARISON DIAGRAMS
    // ============================================
    
    weak_entity_comparison: {
        notation: 'comparison',
        title: 'Weak Entity: Chen vs IE Notation',
        description: 'Comparison of weak entity representation in both notations',
        ascii: `
    CHEN:                    IE:
    +=========+              +---------+
    ║  ORDER  ║              │  ORDER  │
    +=========+              +----+----+
         │                        │1
    ╔═══════════╗         _______○_______
    ║  contains ║        /     LINE      \
    ╚═══════════╝        \\     ITEM      /
         │                +---------------+
    +=========+            (rounded corners)
    ║LINE ITEM║
    +=========+
    (= double rect, ╔═╗ = double diamond)
        `,
        svg: `<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
            <text x="100" y="25" font-family="Arial" font-size="12" fill="#333" font-weight="bold">Chen Notation</text>
            <text x="400" y="25" font-family="Arial" font-size="12" fill="#333" font-weight="bold">IE Notation</text>
            
            <!-- Chen Side -->
            <rect x="40" y="45" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="85" y="70" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">ORDER</text>
            
            <polygon points="130,55 155,75 130,95 105,75" fill="none" stroke="#f57c00" stroke-width="2"/>
            <polygon points="130,60 150,75 130,90 110,75" fill="#fff3e0" stroke="#f57c00" stroke-width="1"/>
            <text x="130" y="78" text-anchor="middle" font-family="Arial" font-size="8" fill="#e65100">has</text>
            
            <rect x="165" y="45" width="90" height="40" fill="#fff8e1" stroke="#f9a825" stroke-width="3"/>
            <rect x="170" y="50" width="80" height="30" fill="#fff8e1" stroke="#f9a825" stroke-width="1"/>
            <text x="210" y="70" text-anchor="middle" font-family="Arial" font-size="10" fill="#f57f17">LINE ITEM</text>
            
            <line x1="130" y1="45" x2="130" y2="30" stroke="#666" stroke-width="1"/>
            <text x="135" y="40" font-family="Arial" font-size="9" fill="#666">= double rect</text>
            
            <!-- IE Side -->
            <rect x="350" y="45" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="395" y="70" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">ORDER</text>
            
            <line x1="440" y1="65" x2="480" y2="65" stroke="#666" stroke-width="2"/>
            
            <rect x="490" y="45" width="90" height="40" rx="12" fill="#fff8e1" stroke="#f9a825" stroke-width="2"/>
            <text x="535" y="70" text-anchor="middle" font-family="Arial" font-size="10" fill="#f57f17">LINE ITEM</text>
            
            <line x1="530" y1="30" x2="530" y2="45" stroke="#666" stroke-width="1"/>
            <text x="535" y="40" font-family="Arial" font-size="9" fill="#666">= rounded corners</text>
            
            <!-- Legend -->
            <text x="40" y="130" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Chen Weak Entity:</text>
            <text x="40" y="148" font-family="Arial" font-size="9" fill="#666">• Double rectangle</text>
            <text x="40" y="163" font-family="Arial" font-size="9" fill="#666">• Double diamond for identifying relationship</text>
            <text x="40" y="178" font-family="Arial" font-size="9" fill="#666">• Dashed underline for partial key</text>
            
            <text x="320" y="130" font-family="Arial" font-size="10" fill="#333" font-weight="bold">IE Weak Entity:</text>
            <text x="320" y="148" font-family="Arial" font-size="9" fill="#666">• Rounded corners (optional)</text>
            <text x="320" y="163" font-family="Arial" font-size="9" fill="#666">• Solid line for identifying relationship</text>
            <text x="320" y="178" font-family="Arial" font-size="9" fill="#666">• (PK, FK) notation in logical model</text>
        </svg>`,
        elements: ['weak_entity', 'comparison']
    },
    
    identifying_relationship_comparison: {
        notation: 'comparison',
        title: 'Identifying Relationship: Chen vs IE',
        description: 'Comparison of identifying relationship representation',
        ascii: `
    CHEN:                    IE:
    Double Diamond           Solid Line
    
    +=========+              +---------+
    ║  ORDER  ║              │  ORDER  │═══════○───────
    +=========+              +---------+ Solid  Crow's
         ║                                          foot
    ╔═══════════╗
    ║  contains ║
    ╚═══════════╝
         ║
    +=========+
    ║LINE ITEM║
    +=========+
        `,
        svg: `<svg viewBox="0 0 550 200" xmlns="http://www.w3.org/2000/svg">
            <text x="100" y="25" font-family="Arial" font-size="12" fill="#333" font-weight="bold">Chen: Double Diamond</text>
            <text x="350" y="25" font-family="Arial" font-size="12" fill="#333" font-weight="bold">IE: Solid Line</text>
            
            <!-- Chen -->
            <rect x="40" y="50" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="85" y="75" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">ORDER</text>
            
            <polygon points="145,50 170,75 145,100 120,75" fill="none" stroke="#e65100" stroke-width="3"/>
            <polygon points="145,57 163,75 145,93 127,75" fill="#fff3e0" stroke="#f57c00" stroke-width="1"/>
            
            <rect x="195" y="50" width="90" height="40" fill="#fff8e1" stroke="#f9a825" stroke-width="3"/>
            <rect x="200" y="55" width="80" height="30" fill="#fff8e1" stroke="#f9a825" stroke-width="1"/>
            <text x="240" y="75" text-anchor="middle" font-family="Arial" font-size="10" fill="#f57f17">LINE ITEM</text>
            
            <line x1="130" y1="75" x2="120" y2="75" stroke="#666" stroke-width="2"/>
            <line x1="170" y1="75" x2="195" y2="75" stroke="#666" stroke-width="2"/>
            
            <!-- IE -->
            <rect x="350" y="50" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="395" y="75" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">ORDER</text>
            
            <line x1="440" y1="60" x2="500" y2="60" stroke="#333" stroke-width="2"/>
            <line x1="440" y1="80" x2="500" y2="80" stroke="#333" stroke-width="2"/>
            
            <rect x="510" y="50" width="90" height="40" rx="10" fill="#fff8e1" stroke="#f9a825" stroke-width="2"/>
            <text x="555" y="75" text-anchor="middle" font-family="Arial" font-size="10" fill="#f57f17">LINE ITEM</text>
            
            <!-- Legend -->
            <text x="40" y="140" font-family="Arial" font-size="10" fill="#333">Chen uses double diamond ◆◆</text>
            <text x="350" y="140" font-family="Arial" font-size="10" fill="#333">IE uses solid line ═══</text>
            <text x="40" y="160" font-family="Arial" font-size="9" fill="#666">Both indicate child's PK includes parent's PK</text>
        </svg>`,
        elements: ['identifying_relationship', 'comparison']
    },
    
    cardinality_comparison: {
        notation: 'comparison',
        title: 'Cardinality Notation Comparison',
        description: 'How cardinality is shown in both notations',
        ascii: `
    CHEN:                  IE (Crow's Foot):
    
    1:N  (one to many)     |<   (one to many)
    1:1  (one to one)      ||   (one to one)
    M:N  (many to many)    >|<  (many to many)
    `,
        svg: `<svg viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg">
            <text x="100" y="30" font-family="Arial" font-size="14" fill="#333" font-weight="bold">Chen Notation</text>
            <text x="380" y="30" font-family="Arial" font-size="14" fill="#333" font-weight="bold">IE Notation (Crow's Foot)</text>
            
            <!-- Chen 1:N -->
            <text x="40" y="65" font-family="Arial" font-size="12" fill="#1565c0">1:N</text>
            <line x1="80" y1="60" x2="180" y2="60" stroke="#666" stroke-width="1.5"/>
            <polygon points="190,50 210,60 190,70 170,60" fill="#fff3e0" stroke="#f57c00" stroke-width="1.5"/>
            <text x="215" y="50" font-family="Arial" font-size="11" fill="#333" font-weight="bold">N</text>
            <text x="40" y="80" font-family="Arial" font-size="9" fill="#666">One to Many</text>
            
            <!-- IE 1:N -->
            <text x="340" y="65" font-family="Arial" font-size="12" fill="#1565c0">One-to-Many</text>
            <line x1="450" y1="60" x2="520" y2="60" stroke="#666" stroke-width="1.5"/>
            <line x1="520" y1="50" x2="520" y2="70" stroke="#333" stroke-width="2"/>
            <text x="525" y="55" font-family="Arial" font-size="10" fill="#333">|</text>
            <line x1="520" y1="55" x2="540" y2="60" stroke="#333" stroke-width="1.5"/>
            <line x1="520" y1="65" x2="540" y2="60" stroke="#333" stroke-width="1.5"/>
            
            <!-- Chen 1:1 -->
            <text x="40" y="135" font-family="Arial" font-size="12" fill="#1565c0">1:1</text>
            <text x="70" y="120" font-family="Arial" font-size="10" fill="#333" font-weight="bold">1</text>
            <line x1="80" y1="130" x2="170" y2="130" stroke="#666" stroke-width="1.5"/>
            <polygon points="180,120 200,130 180,140 160,130" fill="#fff3e0" stroke="#f57c00" stroke-width="1.5"/>
            <text x="205" y="125" font-family="Arial" font-size="10" fill="#333" font-weight="bold">1</text>
            <text x="40" y="155" font-family="Arial" font-size="9" fill="#666">One to One</text>
            
            <!-- IE 1:1 -->
            <text x="340" y="135" font-family="Arial" font-size="12" fill="#1565c0">One-to-One</text>
            <line x1="450" y1="130" x2="520" y2="130" stroke="#666" stroke-width="1.5"/>
            <line x1="520" y1="120" x2="520" y2="140" stroke="#333" stroke-width="2"/>
            <line x1="526" y1="120" x2="526" y2="140" stroke="#333" stroke-width="2"/>
            <text x="531" y="125" font-family="Arial" font-size="10" fill="#333">||</text>
            
            <!-- Chen M:N -->
            <text x="40" y="205" font-family="Arial" font-size="12" fill="#1565c0">M:N</text>
            <text x="68" y="190" font-family="Arial" font-size="10" fill="#333" font-weight="bold">M</text>
            <line x1="80" y1="200" x2="170" y2="200" stroke="#666" stroke-width="1.5"/>
            <polygon points="180,190 200,200 180,210 160,200" fill="#fff3e0" stroke="#f57c00" stroke-width="1.5"/>
            <text x="205" y="195" font-family="Arial" font-size="10" fill="#333" font-weight="bold">N</text>
            <text x="40" y="225" font-family="Arial" font-size="9" fill="#666">Many to Many</text>
            
            <!-- IE M:N -->
            <text x="340" y="205" font-family="Arial" font-size="12" fill="#1565c0">Many-to-Many</text>
            <line x1="480" y1="200" x2="520" y2="200" stroke="#666" stroke-width="1.5"/>
            <line x1="480" y1="195" x2="465" y2="200" stroke="#333" stroke-width="1.5"/>
            <line x1="480" y1="205" x2="465" y2="200" stroke="#333" stroke-width="1.5"/>
            <text x="445" y="195" font-family="Arial" font-size="10" fill="#333"><</text>
            <line x1="520" y1="195" x2="535" y2="200" stroke="#333" stroke-width="1.5"/>
            <line x1="520" y1="205" x2="535" y2="200" stroke="#333" stroke-width="1.5"/>
            <text x="540" y="195" font-family="Arial" font-size="10" fill="#333">></text>
        </svg>`,
        elements: ['cardinality', 'comparison']
    },
    
    // ============================================
    // APPLICATION EXAMPLES
    // ============================================
    
    kijiji_item_hierarchy: {
        notation: 'both',
        title: 'Kijiji Marketplace Example',
        description: 'Item superclass with Vehicle, RealEstate, and GeneralItem subtypes',
        ascii: `
    +-----------+
    │   ITEM    │  <-- Superclass
    +-----+-----+
          │
       ___○___    'd' = Exclusive
      /   │   \\      (one item = one type)
     ▼    ▼    ▼
 +------+ +----------+ +------------+
 │VEHICLE│ │REALESTATE│ │GENERALITEM│
 +------+ +----------+ +------------+
        `,
        svg: `<svg viewBox="0 0 500 220" xmlns="http://www.w3.org/2000/svg">
            <rect x="190" y="15" width="100" height="45" fill="#e8f5e9" stroke="#388e3c" stroke-width="2"/>
            <text x="240" y="35" text-anchor="middle" font-family="Arial" font-size="12" fill="#1b5e20" font-weight="bold">ITEM</text>
            <text x="240" y="50" text-anchor="middle" font-family="Arial" font-size="9" fill="#666">(Superclass)</text>
            
            <line x1="240" y1="60" x2="240" y2="90" stroke="#666" stroke-width="1.5"/>
            
            <circle cx="240" cy="100" r="18" fill="#fff" stroke="#666" stroke-width="2"/>
            <line x1="230" y1="90" x2="250" y2="110" stroke="#666" stroke-width="1.5"/>
            <line x1="250" y1="90" x2="230" y2="110" stroke="#666" stroke-width="1.5"/>
            <text x="265" y="95" font-family="Arial" font-size="9" fill="#666">Exclusive</text>
            
            <line x1="227" y1="113" x2="80" y2="170" stroke="#666" stroke-width="1.5"/>
            <line x1="240" y1="118" x2="240" y2="170" stroke="#666" stroke-width="1.5"/>
            <line x1="253" y1="113" x2="400" y2="170" stroke="#666" stroke-width="1.5"/>
            
            <rect x="20" y="170" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="70" y="195" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">VEHICLE</text>
            
            <rect x="190" y="170" width="100" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="240" y="195" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">REAL ESTATE</text>
            
            <rect x="360" y="170" width="110" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="415" y="195" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">GENERAL ITEM</text>
        </svg>`,
        elements: ['superclass', 'subclass', 'exclusive', 'application']
    },
    
    dwelling_hierarchy: {
        notation: 'both',
        title: 'Dwelling Insurance Hierarchy',
        description: 'Dwelling superclass with House, Condo, and Apartment subtypes',
        ascii: `
    +-----------+
    │ DWELLING  │  address, value, year_built
    +-----+-----+
          │
       ___○___    'd' = Disjoint/Exclusive
      /   │   \\      (one dwelling type only)
     ▼    ▼    ▼
 +------+------+------+
 │HOUSE │CONDO │APT   │
 +------+------+------+
 yard   fees   unit#
 size
        `,
        svg: `<svg viewBox="0 0 500 260" xmlns="http://www.w3.org/2000/svg">
            <rect x="165" y="20" width="120" height="50" fill="#e8f5e9" stroke="#388e3c" stroke-width="2"/>
            <text x="225" y="42" text-anchor="middle" font-family="Arial" font-size="12" fill="#1b5e20" font-weight="bold">DWELLING</text>
            <text x="225" y="58" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">addr, value, year</text>
            
            <line x1="225" y1="70" x2="225" y2="100" stroke="#666" stroke-width="1.5"/>
            
            <circle cx="225" cy="110" r="18" fill="#fff" stroke="#666" stroke-width="2"/>
            <line x1="215" y1="100" x2="235" y2="120" stroke="#666" stroke-width="1.5"/>
            <line x1="235" y1="100" x2="215" y2="120" stroke="#666" stroke-width="1.5"/>
            <text x="250" y="105" font-family="Arial" font-size="9" fill="#d32f2f">Exclusive</text>
            
            <line x1="212" y1="123" x2="80" y2="180" stroke="#666" stroke-width="1.5"/>
            <line x1="225" y1="128" x2="225" y2="180" stroke="#666" stroke-width="1.5"/>
            <line x1="238" y1="123" x2="370" y2="180" stroke="#666" stroke-width="1.5"/>
            
            <rect x="30" y="180" width="90" height="50" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="75" y="202" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">HOUSE</text>
            <text x="75" y="218" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">yard_size</text>
            
            <rect x="180" y="180" width="90" height="50" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="225" y="202" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">CONDO</text>
            <text x="225" y="218" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">condo_fees</text>
            
            <rect x="330" y="180" width="90" height="50" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="375" y="202" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">APT</text>
            <text x="375" y="218" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">unit_number</text>
        </svg>`,
        elements: ['superclass', 'subclass', 'exclusive', 'application']
    },
    
    person_student_employee: {
        notation: 'chen',
        title: 'Person Inheritance Example',
        description: 'Person superclass with Student and Employee subtypes (overlapping)',
        ascii: `
    +-----------+
    │  PERSON   │  SIN, First, Last, DOB
    +-----+-----+
          │
       ___○___    'o' = Overlapping
      /   │   \\      (can be both!)
     ▼    ▼
 +--------+--------+
 │STUDENT │EMPLOYEE│
 +--------+--------+
 StudID   EmpID
 Major    Dept
        `,
        svg: `<svg viewBox="0 0 450 260" xmlns="http://www.w3.org/2000/svg">
            <rect x="150" y="20" width="120" height="55" fill="#e8f5e9" stroke="#388e3c" stroke-width="2"/>
            <text x="210" y="42" text-anchor="middle" font-family="Arial" font-size="12" fill="#1b5e20" font-weight="bold">PERSON</text>
            <text x="210" y="57" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">SIN, First, Last, DOB</text>
            
            <line x1="210" y1="75" x2="210" y2="105" stroke="#666" stroke-width="1.5"/>
            
            <circle cx="210" cy="115" r="18" fill="#fff" stroke="#666" stroke-width="2"/>
            <text x="210" y="122" text-anchor="middle" font-family="Arial" font-size="14" fill="#1976d2" font-weight="bold">o</text>
            <text x="235" y="110" font-family="Arial" font-size="9" fill="#1976d2">Overlapping</text>
            
            <line x1="197" y1="128" x2="100" y2="185" stroke="#666" stroke-width="1.5"/>
            <line x1="223" y1="128" x2="320" y2="185" stroke="#666" stroke-width="1.5"/>
            
            <rect x="35" y="185" width="120" height="60" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="95" y="207" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0" font-weight="bold">STUDENT</text>
            <text x="95" y="222" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">+ StudentID</text>
            <text x="95" y="235" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">+ Major</text>
            
            <rect x="265" y="185" width="120" height="60" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="325" y="207" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0" font-weight="bold">EMPLOYEE</text>
            <text x="325" y="222" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">+ EmployeeID</text>
            <text x="325" y="235" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">+ Department</text>
            
            <text x="50" y="150" font-family="Arial" font-size="9" fill="#d32f2f" font-weight="bold">Inherits:</text>
            <text x="50" y="163" font-family="Arial" font-size="8" fill="#666">SIN, First, Last, DOB</text>
            
            <text x="280" y="150" font-family="Arial" font-size="9" fill="#d32f2f" font-weight="bold">Inherits:</text>
            <text x="280" y="163" font-family="Arial" font-size="8" fill="#666">SIN, First, Last, DOB</text>
        </svg>`,
        elements: ['superclass', 'subclass', 'overlapping', 'inheritance', 'application']
    },
    
    person_identity_transit: {
        notation: 'chen',
        title: 'Relationship Inheritance Example',
        description: 'All People get Identity Card, only Students get Transit Pass',
        ascii: `
    +-----------+
    │  PERSON   │═══════════════►┌─────────────┐
    +-----+-----+   gets ID Card │ IDENTITY    │
          │                      │   CARD      │
       ___○___                   └─────────────┘
      /   │   \\
     ▼    ▼
 +--------+    
 │STUDENT │═══════════════════►┌─────────────┐
 +--------+    gets Transit    │ TRANSIT     │
               Pass             │   PASS      │
                                └─────────────┘
        `,
        svg: `<svg viewBox="0 0 550 280" xmlns="http://www.w3.org/2000/svg">
            <rect x="180" y="20" width="100" height="45" fill="#e8f5e9" stroke="#388e3c" stroke-width="2"/>
            <text x="230" y="42" text-anchor="middle" font-family="Arial" font-size="12" fill="#1b5e20" font-weight="bold">PERSON</text>
            <text x="230" y="57" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">(Superclass)</text>
            
            <line x1="280" y1="42" x2="380" y2="42" stroke="#4caf50" stroke-width="2"/>
            <polygon points="380,35 395,42 380,49" fill="#4caf50" stroke="#4caf50" stroke-width="1"/>
            
            <rect x="400" y="20" width="110" height="45" fill="#fff3e0" stroke="#ff9800" stroke-width="2"/>
            <text x="455" y="42" text-anchor="middle" font-family="Arial" font-size="11" fill="#e65100">IDENTITY</text>
            <text x="455" y="57" text-anchor="middle" font-family="Arial" font-size="11" fill="#e65100">CARD</text>
            
            <text x="320" y="35" font-family="Arial" font-size="9" fill="#4caf50">gets ID</text>
            
            <line x1="230" y1="65" x2="230" y2="100" stroke="#666" stroke-width="1.5"/>
            
            <circle cx="230" cy="110" r="15" fill="#fff" stroke="#666" stroke-width="2"/>
            <text x="230" y="116" text-anchor="middle" font-family="Arial" font-size="12" fill="#1976d2" font-weight="bold">o</text>
            
            <line x1="218" y1="121" x2="120" y2="180" stroke="#666" stroke-width="1.5"/>
            
            <rect x="30" y="180" width="100" height="45" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="80" y="202" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0" font-weight="bold">STUDENT</text>
            <text x="80" y="217" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">(Subclass)</text>
            
            <line x1="130" y1="202" x2="240" y2="202" stroke="#2196f3" stroke-width="2"/>
            <polygon points="240,195 255,202 240,209" fill="#2196f3" stroke="#2196f3" stroke-width="1"/>
            
            <rect x="270" y="180" width="110" height="45" fill="#fff3e0" stroke="#ff9800" stroke-width="2"/>
            <text x="325" y="202" text-anchor="middle" font-family="Arial" font-size="11" fill="#e65100">TRANSIT</text>
            <text x="325" y="217" text-anchor="middle" font-family="Arial" font-size="11" fill="#e65100">PASS</text>
            
            <text x="175" y="198" font-family="Arial" font-size="9" fill="#2196f3">gets Transit Pass</text>
            
            <text x="30" y="250" font-family="Arial" font-size="10" fill="#4caf50" font-weight="bold">All People get Identity Card (inherited)</text>
            <text x="30" y="268" font-family="Arial" font-size="10" fill="#2196f3" font-weight="bold">Only Students get Transit Pass (specific)</text>
        </svg>`,
        elements: ['superclass', 'subclass', 'inheritance', 'relationship_inheritance', 'application']
    },
    
    order_lineitem_example: {
        notation: 'both',
        title: 'Order/Line Item Weak Entity Example',
        description: 'Line Item is weak - identified by OrderID + LineNumber',
        ascii: `
    ORDER:
    OrderID | Date     | CustomerID
    --------+----------+-----------
    100     | 2024-01  | C001
    101     | 2024-01  | C002
    
    LINE ITEM (Weak Entity):
    OrderID | LineNum | Product | Qty
    --------+---------+---------+-----
    100     | 1       | Widget  | 5
    100     | 2       | Gadget  | 3   <-- Same LineNum,
    101     | 1       | Thing   | 2        different Order
        `,
        svg: `<svg viewBox="0 0 550 280" xmlns="http://www.w3.org/2000/svg">
            <text x="40" y="25" font-family="Arial" font-size="12" fill="#333" font-weight="bold">ORDER (Strong Entity)</text>
            
            <rect x="40" y="35" width="220" height="70" fill="#e3f2fd" stroke="#1976d2" stroke-width="1"/>
            <rect x="40" y="35" width="220" height="25" fill="#1976d2" stroke="#1976d2" stroke-width="1"/>
            <text x="150" y="52" text-anchor="middle" font-family="Arial" font-size="11" fill="#fff" font-weight="bold">ORDER</text>
            
            <text x="50" y="75" font-family="Arial" font-size="9" fill="#333">PK OrderID | Date | CustomerID</text>
            <text x="50" y="90" font-family="Arial" font-size="9" fill="#666">100 | 2024-01-15 | C001</text>
            <text x="50" y="102" font-family="Arial" font-size="9" fill="#666">101 | 2024-01-16 | C002</text>
            
            <text x="320" y="25" font-family="Arial" font-size="12" fill="#333" font-weight="bold">LINE ITEM (Weak Entity)</text>
            
            <rect x="320" y="35" width="220" height="90" fill="#fff8e1" stroke="#f9a825" stroke-width="2"/>
            <rect x="320" y="35" width="220" height="25" fill="#f9a825" stroke="#f9a825" stroke-width="1"/>
            <text x="430" y="52" text-anchor="middle" font-family="Arial" font-size="11" fill="#fff" font-weight="bold">LINE ITEM</text>
            
            <text x="330" y="75" font-family="Arial" font-size="9" fill="#333">PK,FK OrderID | PK LineNum | Product</text>
            <text x="330" y="90" font-family="Arial" font-size="9" fill="#666">100 | 1 | Widget</text>
            <text x="330" y="105" font-family="Arial" font-size="9" fill="#d32f2f" font-weight="bold">100 | 2 | Gadget</text>
            <text x="330" y="120" font-family="Arial" font-size="9" fill="#666">101 | 1 | Thing</text>
            
            <line x1="260" y1="70" x2="320" y2="80" stroke="#666" stroke-width="1.5"/>
            <text x="280" y="65" font-family="Arial" font-size="9" fill="#666">contains</text>
            
            <text x="40" y="160" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Why Line Item is WEAK:</text>
            <text x="40" y="178" font-family="Arial" font-size="9" fill="#666">• Line Number 1 exists in BOTH Order 100 and Order 101</text>
            <text x="40" y="193" font-family="Arial" font-size="9" fill="#666">• Line Number alone cannot uniquely identify a line item</text>
            <text x="40" y="208" font-family="Arial" font-size="9" fill="#666">• You need BOTH OrderID + LineNum to uniquely identify</text>
            <text x="40" y="223" font-family="Arial" font-size="9" fill="#d32f2f">• Therefore: PK = (OrderID, LineNum) - includes parent's PK!</text>
            
            <text x="40" y="250" font-family="Arial" font-size="10" fill="#1976d2" font-weight="bold">Key Characteristics:</text>
            <text x="40" y="268" font-family="Arial" font-size="9" fill="#666">LineNum = Partial Key (discriminator) - distinguishes within order</text>
        </svg>`,
        elements: ['weak_entity', 'identifying_relationship', 'partial_key', 'application']
    },
    
    employee_dependent_example: {
        notation: 'both',
        title: 'Employee/Dependent Weak Entity Example',
        description: 'Dependent is weak - identified by EmployeeID + DependentName',
        ascii: `
    EMPLOYEE:
    EmpID | Name  | Dept
    ------+-------+------
    E001  | John  | IT
    E002  | Jane  | HR
    
    DEPENDENT (Weak Entity):
    EmpID | DepName  | Relationship
    ------+----------+------------
    E001  | Mary     | Spouse
    E001  | Tommy    | Child      <-- John's dependents
    E002  | Mary     | Spouse     <-- Different Mary (Jane's spouse)
        `,
        svg: `<svg viewBox="0 0 550 300" xmlns="http://www.w3.org/2000/svg">
            <text x="40" y="25" font-family="Arial" font-size="12" fill="#333" font-weight="bold">EMPLOYEE (Strong Entity)</text>
            
            <rect x="40" y="35" width="200" height="70" fill="#e3f2fd" stroke="#1976d2" stroke-width="1"/>
            <rect x="40" y="35" width="200" height="25" fill="#1976d2" stroke="#1976d2" stroke-width="1"/>
            <text x="140" y="52" text-anchor="middle" font-family="Arial" font-size="11" fill="#fff" font-weight="bold">EMPLOYEE</text>
            
            <text x="50" y="75" font-family="Arial" font-size="9" fill="#333">PK EmpID | Name | Dept</text>
            <text x="50" y="90" font-family="Arial" font-size="9" fill="#666">E001 | John | IT</text>
            <text x="50" y="102" font-family="Arial" font-size="9" fill="#666">E002 | Jane | HR</text>
            
            <text x="320" y="25" font-family="Arial" font-size="12" fill="#333" font-weight="bold">DEPENDENT (Weak Entity)</text>
            
            <rect x="320" y="35" width="220" height="100" fill="#fff8e1" stroke="#f9a825" stroke-width="2"/>
            <rect x="320" y="35" width="220" height="25" fill="#f9a825" stroke="#f9a825" stroke-width="1"/>
            <text x="430" y="52" text-anchor="middle" font-family="Arial" font-size="11" fill="#fff" font-weight="bold">DEPENDENT</text>
            
            <text x="330" y="75" font-family="Arial" font-size="9" fill="#333">PK,FK EmpID | PK DepName | Relation</text>
            <text x="330" y="90" font-family="Arial" font-size="9" fill="#666">E001 | Mary | Spouse</text>
            <text x="330" y="105" font-family="Arial" font-size="9" fill="#d32f2f" font-weight="bold">E001 | Tommy | Child</text>
            <text x="330" y="120" font-family="Arial" font-size="9" fill="#666">E002 | Mary | Spouse</text>
            <text x="330" y="135" font-family="Arial" font-size="9" fill="#666">...</text>
            
            <line x1="240" y1="70" x2="320" y2="85" stroke="#666" stroke-width="1.5"/>
            <text x="265" y="65" font-family="Arial" font-size="9" fill="#666">has</text>
            
            <text x="40" y="160" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Why Dependent is WEAK:</text>
            <text x="40" y="178" font-family="Arial" font-size="9" fill="#666">• Two different employees can have dependents named "Mary"</text>
            <text x="40" y="193" font-family="Arial" font-size="9" fill="#666">• Dependent name alone is not unique across all dependents</text>
            <text x="40" y="208" font-family="Arial" font-size="9" fill="#666">• You need BOTH EmpID + DepName to uniquely identify</text>
            <text x="40" y="223" font-family="Arial" font-size="9" fill="#d32f2f">• PK = (EmpID, DepName) - includes parent's PK!</text>
            
            <text x="40" y="250" font-family="Arial" font-size="10" fill="#1976d2" font-weight="bold">Real-world Context:</text>
            <text x="40" y="268" font-family="Arial" font-size="9" fill="#666">• "Mary" (John's spouse) ≠ "Mary" (Jane's spouse)</text>
            <text x="40" y="283" font-family="Arial" font-size="9" fill="#666">• Same name, different people, identified by their employee</text>
        </svg>`,
        elements: ['weak_entity', 'identifying_relationship', 'partial_key', 'application']
    },
    
    employee_manages_recursive: {
        notation: 'ie',
        title: 'Recursive Relationship with Role Names',
        description: 'Employee supervises other employees using role names',
        ascii: `
    +-----------+
    │ EMPLOYEE  │
    +-----+-----+
          │
    ┌─────┴─────┐
    ▼           ▼
 manager   subordinate
    │           │
    └─────┬─────┘
          ▼
    +-----------+
    │ EMPLOYEE  │
    +-----------+
        `,
        svg: `<svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
            <rect x="130" y="20" width="120" height="50" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="190" y="40" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0" font-weight="bold">EMPLOYEE</text>
            <text x="190" y="58" text-anchor="middle" font-family="Arial" font-size="9" fill="#666">(same entity)</text>
            
            <line x1="190" y1="70" x2="190" y2="100" stroke="#666" stroke-width="1.5"/>
            
            <line x1="110" y1="100" x2="270" y2="100" stroke="#666" stroke-width="1.5"/>
            <line x1="110" y1="100" x2="110" y2="130" stroke="#666" stroke-width="1.5"/>
            <line x1="270" y1="100" x2="270" y2="130" stroke="#666" stroke-width="1.5"/>
            
            <!-- Left cardinality -->
            <circle cx="110" cy="140" r="5" fill="none" stroke="#666" stroke-width="1.5"/>
            <line x1="120" y1="130" x2="120" y2="150" stroke="#666" stroke-width="1.5"/>
            
            <!-- Right cardinality -->
            <line x1="260" y1="130" x2="275" y2="140" stroke="#666" stroke-width="1.5"/>
            <line x1="260" y1="150" x2="275" y2="140" stroke="#666" stroke-width="1.5"/>
            
            <text x="80" y="145" font-family="Arial" font-size="10" fill="#4caf50" font-weight="bold">manager</text>
            <text x="280" y="145" font-family="Arial" font-size="10" fill="#ff9800" font-weight="bold">subordinate</text>
            
            <line x1="110" y1="160" x2="110" y2="180" stroke="#666" stroke-width="1.5"/>
            <line x1="270" y1="160" x2="270" y2="180" stroke="#666" stroke-width="1.5"/>
            
            <rect x="50" y="180" width="110" height="45" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="105" y="200" text-anchor="middle" font-family="Arial" font-size="10" fill="#1565c0">EMPLOYEE</text>
            <text x="105" y="215" text-anchor="middle" font-family="Arial" font-size="9" fill="#4caf50">as Manager</text>
            
            <rect x="215" y="180" width="110" height="45" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="270" y="200" text-anchor="middle" font-family="Arial" font-size="10" fill="#1565c0">EMPLOYEE</text>
            <text x="270" y="215" text-anchor="middle" font-family="Arial" font-size="9" fill="#ff9800">as Subordinate</text>
        </svg>`,
        elements: ['entity', 'recursive_relationship', 'role_names', 'application']
    },
    
    kijiji_user_roles: {
        notation: 'ie',
        title: 'Kijiji User Roles Example',
        description: 'User plays different roles (buyer/seller) in marketplace transactions',
        ascii: `
    +-----------+               +-----------+
    │   USER    │─────buyer───►│   ORDER   │
    │           │◄────seller───│           │
    +-----+-----+               +-----------+
          │
          │◄────poster────┐
          │               │
          │         +-----------+
          └────────►│    AD     │
                    +-----------+
        `,
        svg: `<svg viewBox="0 0 500 220" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="70" width="90" height="60" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="85" y="95" text-anchor="middle" font-family="Arial" font-size="12" fill="#1565c0" font-weight="bold">USER</text>
            <text x="85" y="115" text-anchor="middle" font-family="Arial" font-size="9" fill="#666">(one entity)</text>
            
            <!-- Buyer relationship -->
            <line x1="130" y1="80" x2="260" y2="80" stroke="#4caf50" stroke-width="1.5"/>
            <text x="195" y="75" text-anchor="middle" font-family="Arial" font-size="10" fill="#4caf50" font-weight="bold">buyer</text>
            <circle cx="250" cy="80" r="5" fill="none" stroke="#4caf50" stroke-width="1.5"/>
            <line x1="255" y1="72" x2="255" y2="88" stroke="#4caf50" stroke-width="1.5"/>
            
            <!-- Seller relationship -->
            <line x1="130" y1="120" x2="260" y2="120" stroke="#ff9800" stroke-width="1.5"/>
            <text x="195" y="140" text-anchor="middle" font-family="Arial" font-size="10" fill="#ff9800" font-weight="bold">seller</text>
            
            <rect x="270" y="60" width="90" height="70" fill="#fff3e0" stroke="#ff9800" stroke-width="2"/>
            <text x="315" y="95" text-anchor="middle" font-family="Arial" font-size="11" fill="#e65100">ORDER</text>
            
            <!-- Poster relationship to Ad -->
            <line x1="130" y1="105" x2="180" y2="150" stroke="#9c27b0" stroke-width="1.5"/>
            <text x="180" y="135" font-family="Arial" font-size="10" fill="#9c27b0" font-weight="bold">poster</text>
            
            <rect x="180" y="160" width="90" height="45" fill="#f3e5f5" stroke="#9c27b0" stroke-width="2"/>
            <text x="225" y="185" text-anchor="middle" font-family="Arial" font-size="11" fill="#7b1fa2">AD</text>
            
            <text x="300" y="180" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Benefits of Role Names:</text>
            <text x="300" y="198" font-family="Arial" font-size="9" fill="#666">• One User entity (not Seller & Buyer entities)</text>
            <text x="300" y="213" font-family="Arial" font-size="9" fill="#666">• Same login for buying and selling</text>
        </svg>`,
        elements: ['entity', 'role_names', 'multiple_relationships', 'application']
    },
    
    isa_test_examples: {
        notation: 'conceptual',
        title: '"Is A" Test Examples',
        description: 'Valid vs Invalid subtype relationships',
        ascii: `
    VALID (pass "Is A" test):     INVALID (fail "Is A" test):
    
    House IS A Dwelling ✓         Active IS A Customer ✗
    Condo IS A Dwelling ✓         (status, not a type)
    
    Student IS A Person ✓         Premium IS A Customer ?
    Employee IS A Person ✓        (attribute value, not always a subtype)
    
    Car IS A Vehicle ✓            Verified IS A Customer ✗
    Truck IS A Vehicle ✓          (status, not a type)
        `,
        svg: `<svg viewBox="0 0 600 350" xmlns="http://www.w3.org/2000/svg">
            <text x="150" y="30" font-family="Arial" font-size="14" fill="#4caf50" font-weight="bold">✓ VALID (Pass "Is A" Test)</text>
            <text x="400" y="30" font-family="Arial" font-size="14" fill="#d32f2f" font-weight="bold">✗ INVALID (Fail "Is A" Test)</text>
            
            <!-- Valid examples -->
            <rect x="40" y="50" width="240" height="60" fill="#e8f5e9" stroke="#4caf50" stroke-width="1"/>
            <text x="160" y="75" text-anchor="middle" font-family="Arial" font-size="12" fill="#1b5e20">"House IS A Dwelling" ✓</text>
            <text x="160" y="95" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">A house IS A type of dwelling</text>
            
            <rect x="40" y="120" width="240" height="60" fill="#e8f5e9" stroke="#4caf50" stroke-width="1"/>
            <text x="160" y="145" text-anchor="middle" font-family="Arial" font-size="12" fill="#1b5e20">"Student IS A Person" ✓</text>
            <text x="160" y="165" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">A student IS A type of person</text>
            
            <rect x="40" y="190" width="240" height="60" fill="#e8f5e9" stroke="#4caf50" stroke-width="1"/>
            <text x="160" y="215" text-anchor="middle" font-family="Arial" font-size="12" fill="#1b5e20">"Car IS A Vehicle" ✓</text>
            <text x="160" y="235" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">A car IS A type of vehicle</text>
            
            <!-- Invalid examples -->
            <rect x="320" y="50" width="240" height="60" fill="#ffebee" stroke="#d32f2f" stroke-width="1"/>
            <text x="440" y="75" text-anchor="middle" font-family="Arial" font-size="12" fill="#b71c1c">"Active IS A Customer" ✗</text>
            <text x="440" y="95" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">Active is a status, not a type</text>
            
            <rect x="320" y="120" width="240" height="60" fill="#ffebee" stroke="#d32f2f" stroke-width="1"/>
            <text x="440" y="145" text-anchor="middle" font-family="Arial" font-size="12" fill="#b71c1c">"Premium IS A Customer" ?</text>
            <text x="440" y="165" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">Usually an attribute, not subtype</text>
            
            <rect x="320" y="190" width="240" height="60" fill="#ffebee" stroke="#d32f2f" stroke-width="1"/>
            <text x="440" y="215" text-anchor="middle" font-family="Arial" font-size="12" fill="#b71c1c">"Verified IS A User" ✗</text>
            <text x="440" y="235" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">Verified is a status/attribute</text>
            
            <!-- Guidelines -->
            <text x="40" y="280" font-family="Arial" font-size="12" fill="#333" font-weight="bold">The "Is A" Test Guidelines:</text>
            <text x="40" y="300" font-family="Arial" font-size="10" fill="#666">• If you can say "X IS A Y" and it makes semantic sense, it's likely a valid subtype</text>
            <text x="40" y="318" font-family="Arial" font-size="10" fill="#666">• Statuses (Active, Verified, Premium) are usually attributes, not subtypes</text>
            <text x="40" y="336" font-family="Arial" font-size="10" fill="#666">• Subtypes should have different attributes or relationships</text>
        </svg>`,
        elements: ['isa_test', 'conceptual']
    },
    
    mandatory_vs_weak_comparison: {
        notation: 'comparison',
        title: 'Mandatory Participation vs Weak Entity',
        description: 'Key differences between mandatory participation and weak entities',
        ascii: `
    MANDATORY (but NOT Weak):       WEAK Entity:
    
    +---------+                     +=========+
    │CUSTOMER │                     │  ORDER  ║
    +----+----+                     +====+====+
         │                               │
         │1                             ║1
         │                              ║
    _____○_____                     ╔═══════════╗
   /  RENTAL  \\                     ║  contains ║
   \\ AGREEMENT /                     ╚═══════════╝
    +---------+                           ║
    (has its own PK)                  +=========+
                                      ║LINE ITEM║
                                      +=========+
    PK: AgreementID                   PK: OrderID + LineNum
    (independent)                     (borrows from parent)
        `,
        svg: `<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg">
            <text x="120" y="25" font-family="Arial" font-size="13" fill="#1976d2" font-weight="bold">Mandatory (NOT Weak)</text>
            <text x="400" y="25" font-family="Arial" font-size="13" fill="#d32f2f" font-weight="bold">Weak Entity</text>
            
            <!-- Left: Mandatory -->
            <rect x="70" y="50" width="110" height="45" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="125" y="78" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">CUSTOMER</text>
            
            <line x1="125" y1="95" x2="125" y2="125" stroke="#666" stroke-width="1.5"/>
            <text x="130" y="115" font-family="Arial" font-size="10" fill="#333">1</text>
            
            <rect x="70" y="140" width="110" height="55" fill="#e8f5e9" stroke="#4caf50" stroke-width="2"/>
            <text x="125" y="165" text-anchor="middle" font-family="Arial" font-size="11" fill="#2e7d32">RENTAL</text>
            <text x="125" y="182" text-anchor="middle" font-family="Arial" font-size="9" fill="#666">AGREEMENT</text>
            
            <!-- Cardinality -->
            <circle cx="70" cy="167" r="4" fill="none" stroke="#666" stroke-width="1"/>
            <line x1="78" y1="160" x2="78" y2="174" stroke="#666" stroke-width="1"/>
            <line x1="78" y1="167" x2="92" y2="167" stroke="#666" stroke-width="1"/>
            <line x1="88" y1="163" x2="92" y2="167" stroke="#666" stroke-width="1"/>
            <line x1="88" y1="171" x2="92" y2="167" stroke="#666" stroke-width="1"/>
            
            <text x="40" y="220" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Characteristics:</text>
            <text x="40" y="238" font-family="Arial" font-size="9" fill="#666">• Must have a customer</text>
            <text x="40" y="253" font-family="Arial" font-size="9" fill="#4caf50" font-weight="bold">• Has its OWN PK: AgreementID</text>
            <text x="40" y="268" font-family="Arial" font-size="9" fill="#666">• Can be identified independently</text>
            
            <!-- Right: Weak -->
            <rect x="370" y="50" width="90" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
            <text x="415" y="75" text-anchor="middle" font-family="Arial" font-size="11" fill="#1565c0">ORDER</text>
            
            <polygon points="415,105 440,125 415,145 390,125" fill="#fff3e0" stroke="#f57c00" stroke-width="2"/>
            <text x="415" y="129" text-anchor="middle" font-family="Arial" font-size="9" fill="#e65100">has</text>
            
            <rect x="370" y="165" width="90" height="40" fill="#fff8e1" stroke="#f9a825" stroke-width="3"/>
            <rect x="375" y="170" width="80" height="30" fill="#fff8e1" stroke="#f9a825" stroke-width="1"/>
            <text x="415" y="190" text-anchor="middle" font-family="Arial" font-size="10" fill="#f57f17">LINE ITEM</text>
            
            <line x1="415" y1="90" x2="415" y2="105" stroke="#666" stroke-width="2"/>
            <line x1="415" y1="145" x2="415" y2="165" stroke="#666" stroke-width="2"/>
            
            <text x="340" y="220" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Characteristics:</text>
            <text x="340" y="238" font-family="Arial" font-size="9" fill="#666">• Cannot exist without an order</text>
            <text x="340" y="253" font-family="Arial" font-size="9" fill="#d32f2f" font-weight="bold">• PK includes parent's PK:</text>
            <text x="340" y="268" font-family="Arial" font-size="9" fill="#d32f2f">PK = (OrderID, LineNum)</text>
        </svg>`,
        elements: ['mandatory_participation', 'weak_entity', 'comparison']
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ERDDiagrams;
}
