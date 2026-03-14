/**
 * Relational Algebra Reference Data
 * Based on Lecture 7 - ACS-3902 Database Systems
 */

const raOperators = {
  sigma: {
    symbol: 'σ',
    name: 'Selection',
    sql: 'WHERE',
    description: 'Filters rows based on a condition. Equivalent to the WHERE clause in SQL.',
    example: 'σ salary > 50000 (Employee)',
    sql_equivalent: 'SELECT * FROM Employee WHERE salary > 50000;',
    properties: [
      'Unary operation (operates on one relation)',
      'Commutative (order of conditions does not matter)',
      'Exhibits selectivity (returns ≤ original rows)'
    ],
    syntax: 'σ<condition>(R)',
    note: 'The condition is a boolean expression with clauses of the form: <attribute> <op> <constant> or <attribute> <op> <attribute>'
  },
  pi: {
    symbol: 'π',
    name: 'Projection',
    sql: 'SELECT',
    description: 'Selects specific columns/attributes from a relation. Equivalent to the SELECT clause in SQL (not SELECT *).',
    example: 'π fname, lname, salary (Employee)',
    sql_equivalent: 'SELECT fname, lname, salary FROM Employee;',
    properties: [
      'Unary operation',
      'Has a degree (number of attributes in result)',
      'Can eliminate duplicates (like DISTINCT in SQL)'
    ],
    syntax: 'π<attribute_list>(R)',
    note: 'Discards columns not in the attribute list'
  },
  join: {
    symbol: '⨝',
    name: 'Join (Inner Join)',
    sql: 'JOIN',
    description: 'Combines related tuples from two relations based on a join condition.',
    example: 'Employee ⨝ ssn = mgr_ssn Department',
    sql_equivalent: 'SELECT * FROM Employee JOIN Department ON ssn = mgr_ssn;',
    properties: [
      'Binary operation (operates on two relations)',
      'Result has n + m columns (where n, m are columns in each relation)',
      'At most T1 × T2 rows theoretically, practically limited by referential integrity'
    ],
    syntax: 'R ⨝<condition> S',
    note: 'Most common type is EQUIJOIN using = operator'
  },
  theta_join: {
    symbol: '⨝θ',
    name: 'Theta Join',
    sql: 'WHERE (join condition)',
    description: 'General join where θ is any comparison operator: =, <, ≤, >, ≥, ≠',
    example: 'Employee ⨝ salary > min_salary PayScale',
    sql_equivalent: 'SELECT * FROM Employee, PayScale WHERE salary > min_salary;',
    properties: [
      'Binary operation',
      'θ can be any comparison operator',
      'Attributes being compared must have compatible domains'
    ],
    syntax: 'R ⨝θ S where θ is {=, <, ≤, >, ≥, ≠}',
    note: 'When θ is =, it becomes an EQUIJOIN'
  },
  equijoin: {
    symbol: '⨝=',
    name: 'Equijoin',
    sql: 'JOIN ON =',
    description: 'Join using only the equality (=) operator. Looks for matching values across relations.',
    example: 'Employee ⨝ dno = dnumber Department',
    sql_equivalent: 'SELECT * FROM Employee JOIN Department ON dno = dnumber;',
    properties: [
      'Most common type of join',
      'Looks for matches between attributes',
      'Common attributes appear in both relations'
    ],
    syntax: 'R ⨝ A = B S',
    note: 'This is a Theta Join where θ is ='
  },
  natural_join: {
    symbol: '⨝*',
    name: 'Natural Join',
    sql: 'NATURAL JOIN',
    description: 'Performs an equijoin on all common attributes, eliminating duplicate columns.',
    example: 'Department ⨝* Employee',
    sql_equivalent: 'SELECT * FROM Department NATURAL JOIN Employee;',
    properties: [
      'Uses all common attribute names',
      'Eliminates duplicate columns from result',
      'No explicit condition needed'
    ],
    syntax: 'R ⨝* S or simply R ⨝ S (when context implies natural join)',
    note: 'The * symbol indicates natural join in some notations'
  },
  cartesian_product: {
    symbol: '✕',
    name: 'Cartesian Product',
    sql: 'CROSS JOIN',
    description: 'Combines every row from R with every row from S. All possible combinations.',
    example: 'Employee ✕ Department',
    sql_equivalent: 'SELECT * FROM Employee CROSS JOIN Department;',
    properties: [
      'Binary set operation from mathematics',
      'Result has n + m columns',
      'Result has T1 × T2 rows',
      'Usually followed by a selection'
    ],
    syntax: 'R ✕ S',
    note: 'Rarely used directly; typically followed by σ to match values'
  },
  rename: {
    symbol: 'ρ',
    name: 'Rename',
    sql: 'AS',
    description: 'Renames relation and/or attributes. Equivalent to aliasing in SQL.',
    example: 'ρ Emp (Employee) or ρ fname→first_name (Employee)',
    sql_equivalent: 'SELECT * FROM Employee AS Emp;',
    properties: [
      'Changes relation name: ρS(R)',
      'Changes attribute names: ρ(B1,B2,...)(R)',
      'Changes both: ρS(B1,B2,...)(R)',
      'Useful for self-joins'
    ],
    syntax: 'ρ<new_name>(<attr_list>)>(R)',
    note: 'Can also use informal notation by listing attributes in sequenced operations'
  },
  union: {
    symbol: '∪',
    name: 'Union',
    sql: 'UNION',
    description: 'Combines tuples from two union-compatible relations, eliminating duplicates.',
    example: 'π ssn (Employee) ∪ π essn (Dependent)',
    sql_equivalent: 'SELECT ssn FROM Employee UNION SELECT essn FROM Dependent;',
    properties: [
      'Requires union-compatible relations (same attributes)',
      'Eliminates duplicates (use ∪ALL for duplicates)',
      'Commutative and associative'
    ],
    syntax: 'R ∪ S',
    note: 'Relations must have same number of attributes with compatible domains'
  },
  intersection: {
    symbol: '∩',
    name: 'Intersection',
    sql: 'INTERSECT',
    description: 'Returns tuples that appear in both relations.',
    example: 'π ssn (Employee) ∩ π essn (Dependent)',
    sql_equivalent: 'SELECT ssn FROM Employee INTERSECT SELECT essn FROM Dependent;',
    properties: [
      'Requires union-compatible relations',
      'Returns only common tuples',
      'Commutative and associative'
    ],
    syntax: 'R ∩ S',
    note: 'Not all DBMS support INTERSECT directly'
  },
  difference: {
    symbol: '-',
    name: 'Difference',
    sql: 'EXCEPT / MINUS',
    description: 'Returns tuples in R that are not in S.',
    example: 'π ssn (Employee) - π essn (Dependent)',
    sql_equivalent: 'SELECT ssn FROM Employee EXCEPT SELECT essn FROM Dependent;',
    properties: [
      'Requires union-compatible relations',
      'Not commutative (R - S ≠ S - R)',
      'Order matters'
    ],
    syntax: 'R - S',
    note: 'Also called set difference or minus'
  }
};

const raSequencing = {
  title: 'Sequencing Operations',
  description: 'Breaking down complex RA expressions into named intermediate steps',
  example: `DEP5_EMPS ← σ dno = 5 (Employee)
RESULT ← π fname, lname, salary (DEP5_EMPS)`,
  sql_equivalent: `WITH dep5_emps AS (
  SELECT * FROM Employee WHERE dno = 5
)
SELECT fname, lname, salary FROM dep5_emps;`,
  note: 'The ← operator assigns an intermediate result to a name for use in subsequent operations'
};

const queryTreeInfo = {
  title: 'Query Trees',
  description: 'A tree data structure used by DBMS to represent and optimize queries internally',
  properties: [
    'Leaf nodes represent input relations (tables)',
    'Internal nodes represent RA operations',
    'Execution is bottom-up',
    'Results flow up the tree as operands'
  ],
  execution_order: [
    'Start at leaf nodes (scan tables)',
    'Apply operations at parent nodes',
    'Pass results up to next level',
    'Final result at root node'
  ],
  optimization_rules: [
    'Push selections (σ) down as far as possible',
    'Push projections (π) down when possible',
    'Apply most restrictive selections first',
    'Use joins instead of cross products + selection'
  ]
};

const cteReference = {
  non_recursive: {
    title: 'Non-Recursive CTE',
    description: 'Creates temporary named result sets that exist only during query execution',
    syntax: `WITH cte_name AS (
  SELECT ...
)
SELECT * FROM cte_name;`,
    example: `WITH has_spouse AS (
  SELECT employee_id
  FROM employee
  NATURAL JOIN dependent
  WHERE Relationship IN ('Spouse', 'Partner')
)
SELECT Fname, Lname, SUM(t.Hours)
FROM employee e
NATURAL JOIN timesheet t
JOIN has_spouse s ON e.employee_id = s.employee_id
GROUP BY Fname, Lname;`,
    use_cases: [
      'Break complex queries into readable steps',
      'Avoid repeating subqueries',
      'Build intermediate results for final query'
    ]
  },
  recursive: {
    title: 'Recursive CTE',
    description: 'Uses recursion to traverse hierarchical data like org charts or bill of materials',
    syntax: `WITH RECURSIVE cte_name AS (
  -- Anchor member (starting point)
  SELECT ... FROM ... WHERE ...
  
  UNION
  
  -- Recursive member (references CTE itself)
  SELECT ... FROM ... 
  INNER JOIN cte_name ON ...
)
SELECT * FROM cte_name;`,
    example_org_chart: `WITH RECURSIVE all_subordinates(personId, firstName) AS (
  -- Anchor: Start with James
  SELECT personId, firstName
  FROM Person
  WHERE firstName = 'James'
  
  UNION
  
  -- Recursive: Find all subordinates
  SELECT p.personId, p.firstName
  FROM person p
  INNER JOIN all_subordinates sub ON p.managerId = sub.personId
)
SELECT * FROM all_subordinates;`,
    components: [
      'Anchor member: The starting point of recursion',
      'UNION: Combines results from each iteration',
      'Recursive member: References the CTE itself',
      'Termination: Recursion stops when no new rows found'
    ],
    use_cases: [
      'Organization charts (who reports to whom)',
      'Bill of materials (component hierarchies)',
      'Finding ancestors/descendants in trees',
      'Graph traversal'
    ]
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { raOperators, raSequencing, queryTreeInfo, cteReference };
}
