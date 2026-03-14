/**
 * @fileoverview ACS-3902 Comprehensive Test Question Bank
 * 
 * Complete question bank for practice test system covering all 9 lectures
 * with various question types: MCQ, Fill in Blank, True/False, Write DDL/DML,
 * Write Query, Draw EERD, and Match Items.
 * 
 * Total: 170+ content-focused questions (no administrative questions)
 * @version 2.0.0
 * @module test-question-bank
 */

const questionBank = {
  // ==========================================
  // LECTURE 1: Database Fundamentals (10 questions)
  // ==========================================
  lecture1: [
    {
      id: 'l1q1',
      type: 'mcq',
      topic: 'DDL vs DML',
      difficulty: 'easy',
      question: 'What is the difference between DDL and DML?',
      options: [
        'DDL manipulates data, DML defines structure',
        'DDL defines database structure, DML manipulates data',
        'They are the same thing',
        'DDL is faster than DML'
      ],
      correctAnswer: 1,
      explanation: 'DDL (Data Definition Language) defines and modifies database structures (CREATE, ALTER, DROP). DML (Data Manipulation Language) manipulates data (SELECT, INSERT, UPDATE, DELETE).',
      lectureRef: 'lecture-1.html#ddl-dml'
    },
    {
      id: 'l1q2',
      type: 'mcq',
      topic: 'Primary Key',
      difficulty: 'easy',
      question: 'What is the purpose of a PRIMARY KEY constraint?',
      options: [
        'To allow duplicate values in a table',
        'To uniquely identify each row in a table',
        'To encrypt sensitive data',
        'To create a backup of the table'
      ],
      correctAnswer: 1,
      explanation: 'A PRIMARY KEY uniquely identifies each row in a table. It cannot contain NULL values and must be unique across all rows.',
      lectureRef: 'lecture-1.html#primary-key'
    },
    {
      id: 'l1q3',
      type: 'match',
      topic: 'SQL Command Categories',
      difficulty: 'easy',
      question: 'Match the SQL command category to its purpose:',
      items: [
        { left: 'DDL', right: 'Define and modify database structure' },
        { left: 'DML', right: 'Manipulate data in tables' },
        { left: 'DCL', right: 'Control access and permissions' },
        { left: 'TCL', right: 'Manage transactions' }
      ],
      explanation: 'SQL commands are categorized by function: DDL for structure, DML for data manipulation, DCL for security, TCL for transaction control.',
      lectureRef: 'lecture-1.html#sql-categories'
    },
    {
      id: 'l1q4',
      type: 'mcq',
      topic: 'Foreign Key',
      difficulty: 'medium',
      question: 'What is the purpose of a FOREIGN KEY constraint?',
      options: [
        'To create a primary key automatically',
        'To establish a relationship between tables and enforce referential integrity',
        'To index a column for faster queries',
        'To prevent NULL values in a column'
      ],
      correctAnswer: 1,
      explanation: 'A FOREIGN KEY establishes a link between two tables. It ensures referential integrity by preventing actions that would destroy links between tables.',
      lectureRef: 'lecture-1.html#foreign-key'
    },
    {
      id: 'l1q5',
      type: 'fill_blank',
      topic: 'Database Concepts',
      difficulty: 'easy',
      question: 'A ______ is a collection of related data organized in tables.',
      correctAnswer: 'database',
      acceptableAnswers: ['database', 'relational database', 'db'],
      explanation: 'A database is an organized collection of structured data stored electronically in a computer system.',
      lectureRef: 'lecture-1.html#database-definition'
    },
    {
      id: 'l1q6',
      type: 'true_false',
      topic: 'NULL Values',
      difficulty: 'medium',
      question: 'A PRIMARY KEY column can contain NULL values.',
      correctAnswer: false,
      explanation: 'PRIMARY KEY columns cannot contain NULL values. They must have a unique, non-NULL value for every row.',
      lectureRef: 'lecture-1.html#primary-key-constraints'
    },
    {
      id: 'l1q7',
      type: 'mcq',
      topic: 'Data Types',
      difficulty: 'easy',
      question: 'Which SQL data type is best for storing monetary values?',
      options: ['INT', 'VARCHAR', 'DECIMAL', 'DATE'],
      correctAnswer: 2,
      explanation: 'DECIMAL (or NUMERIC) is best for monetary values because it stores exact precision, avoiding floating-point rounding errors.',
      lectureRef: 'lecture-1.html#data-types'
    },
    {
      id: 'l1q8',
      type: 'mcq',
      topic: 'Constraints',
      difficulty: 'medium',
      question: 'What does the UNIQUE constraint do?',
      options: [
        'Ensures all values in a column are different (but allows one NULL)',
        'Prevents any NULL values',
        'Creates an automatic index',
        'Encrypts the column data'
      ],
      correctAnswer: 0,
      explanation: 'UNIQUE ensures all values in a column are different. Unlike PRIMARY KEY, it allows one NULL value (or multiple NULLs in some databases).',
      lectureRef: 'lecture-1.html#unique-constraint'
    },
    {
      id: 'l1q9',
      type: 'write_ddl',
      topic: 'CREATE TABLE',
      difficulty: 'medium',
      question: 'Write a CREATE TABLE statement for a "department" table with: dept_id (integer, primary key), dept_name (varchar(50), not null), and location (varchar(100)).',
      correctAnswer: "CREATE TABLE department (\\n  dept_id INT PRIMARY KEY,\\n  dept_name VARCHAR(50) NOT NULL,\\n  location VARCHAR(100)\\n);",
      acceptablePatterns: ['create table department', 'dept_id.*primary key', 'dept_name.*not null', 'varchar'],
      explanation: 'Use CREATE TABLE with column definitions, data types, and constraints. PRIMARY KEY uniquely identifies rows, NOT NULL prevents empty values.',
      schema: {},
      lectureRef: 'lecture-1.html#create-table'
    },
    {
      id: 'l1q10',
      type: 'mcq',
      topic: 'Referential Integrity',
      difficulty: 'hard',
      question: 'What happens when you try to delete a row that is referenced by a foreign key in another table (with default constraints)?',
      options: [
        'The deletion succeeds and the foreign key becomes NULL',
        'The deletion is prevented to maintain referential integrity',
        'The related rows are automatically deleted',
        'The database creates a backup first'
      ],
      correctAnswer: 1,
      explanation: 'By default, you cannot delete a row that is referenced by a foreign key. This prevents orphaned records and maintains referential integrity.',
      lectureRef: 'lecture-1.html#referential-integrity'
    }
  ],

  // ==========================================
  // LECTURE 2: SQL Fundamentals (20 questions)
  // ==========================================
  lecture2: [
    {
      id: 'l2q1',
      type: 'mcq',
      topic: 'SQL Categories',
      difficulty: 'easy',
      question: 'Which SQL command category includes CREATE, ALTER, and DROP?',
      options: ['DML', 'DCL', 'DDL', 'TCL'],
      correctAnswer: 2,
      explanation: 'DDL (Data Definition Language) includes CREATE, ALTER, DROP, and TRUNCATE - commands that define database structures.',
      lectureRef: 'lecture-2.html#sql-categories'
    },
    {
      id: 'l2q2',
      type: 'mcq',
      topic: 'SQL Categories',
      difficulty: 'easy',
      question: 'Which SQL category includes SELECT, INSERT, UPDATE, and DELETE?',
      options: ['DDL', 'DML', 'DCL', 'TCL'],
      correctAnswer: 1,
      explanation: 'DML (Data Manipulation Language) includes SELECT, INSERT, UPDATE, and DELETE - commands that manipulate data.',
      lectureRef: 'lecture-2.html#sql-categories'
    },
    {
      id: 'l2q3',
      type: 'match',
      topic: 'SQL Categories',
      difficulty: 'medium',
      question: 'Match the SQL command category to its commands:',
      items: [
        { left: 'DDL', right: 'CREATE, ALTER, DROP' },
        { left: 'DML', right: 'SELECT, INSERT, UPDATE' },
        { left: 'DCL', right: 'GRANT, REVOKE' },
        { left: 'TCL', right: 'COMMIT, ROLLBACK' }
      ],
      explanation: 'DDL defines structure, DML manipulates data, DCL controls access, and TCL manages transactions.',
      lectureRef: 'lecture-2.html#sql-categories'
    },
    {
      id: 'l2q4',
      type: 'fill_blank',
      topic: 'SELECT Order',
      difficulty: 'medium',
      question: 'Complete the SELECT statement order: SELECT → FROM → ______ → GROUP BY → ______ → ORDER BY',
      correctAnswer: 'WHERE, HAVING',
      acceptableAnswers: ['WHERE HAVING', 'where, having', 'WHERE, HAVING'],
      explanation: 'The correct order is: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY.',
      lectureRef: 'lecture-2.html#select-structure'
    },
    {
      id: 'l2q5',
      type: 'mcq',
      topic: 'Query Processing',
      difficulty: 'medium',
      question: 'What is the actual processing order of a SQL query (not the written order)?',
      options: [
        'SELECT → FROM → WHERE → ORDER BY',
        'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY',
        'WHERE → FROM → SELECT → ORDER BY',
        'FROM → SELECT → WHERE → ORDER BY'
      ],
      correctAnswer: 1,
      explanation: 'The DBMS processes: FROM (get tables) → WHERE (filter rows) → GROUP BY (group) → HAVING (filter groups) → SELECT (project columns) → ORDER BY (sort).',
      lectureRef: 'lecture-2.html#query-processing'
    },
    {
      id: 'l2q6',
      type: 'fill_blank',
      topic: 'Memory Aid',
      difficulty: 'easy',
      question: 'What is the mnemonic for remembering the SELECT statement order?',
      correctAnswer: 'SFOGWO',
      acceptableAnswers: ['SFOGWO', 'S F O G W O', 'sfogwo'],
      explanation: 'SFOGWO stands for: Select, From, Where, Group by, Having, Order by.',
      lectureRef: 'lecture-2.html#select-mnemonic'
    },
    {
      id: 'l2q7',
      type: 'mcq',
      topic: 'JOINs',
      difficulty: 'medium',
      question: 'What is the difference between Theta Join and ANSI JOIN syntax?',
      options: [
        'Theta Join is faster',
        'Theta Join puts join conditions in WHERE clause, ANSI uses ON clause',
        'ANSI JOIN is older syntax',
        'There is no difference'
      ],
      correctAnswer: 1,
      explanation: 'Theta Join (legacy) places join conditions in the WHERE clause. ANSI JOIN uses the ON clause to specify join conditions, separating them from filter conditions.',
      lectureRef: 'lecture-2.html#join-syntax'
    },
    {
      id: 'l2q8',
      type: 'write_query',
      topic: 'JOINs',
      difficulty: 'medium',
      question: 'Write a query to list all students and their enrolled courses using ANSI JOIN syntax. Tables: student(student_id, name), enrollment(student_id, course_id), course(course_id, title)',
      correctAnswer: "SELECT s.name, c.title\\nFROM student s\\nJOIN enrollment e ON s.student_id = e.student_id\\nJOIN course c ON e.course_id = c.course_id;",
      acceptablePatterns: ['join enrollment', 'join course', 'on s.student_id', 'on e.course_id'],
      explanation: 'Use ANSI JOIN with ON clauses. First join student to enrollment, then enrollment to course.',
      schema: {
        student: ['student_id', 'name'],
        enrollment: ['student_id', 'course_id'],
        course: ['course_id', 'title']
      },
      lectureRef: 'lecture-2.html#ansi-join'
    },
    {
      id: 'l2q9',
      type: 'mcq',
      topic: 'Table Aliasing',
      difficulty: 'easy',
      question: 'What is the purpose of table aliasing in SQL?',
      options: [
        'To rename the table permanently',
        'To create a copy of the table',
        'To provide a shorter reference name for tables in the query',
        'To improve query performance'
      ],
      correctAnswer: 2,
      explanation: 'Table aliases provide shorter names to reference tables within a query, making the SQL more readable, especially with multiple tables.',
      lectureRef: 'lecture-2.html#table-aliasing'
    },
    {
      id: 'l2q10',
      type: 'write_query',
      topic: 'Table Aliasing',
      difficulty: 'easy',
      question: 'Write a query to select first_name and last_name from the employee table using table alias "e".',
      correctAnswer: 'SELECT e.first_name, e.last_name FROM employee e;',
      acceptablePatterns: ['from employee e', 'select e.first_name', 'select e.last_name'],
      explanation: 'Use the AS keyword (optional) or space to assign an alias, then reference columns with alias.column_name.',
      schema: { employee: ['first_name', 'last_name', 'employee_id'] },
      lectureRef: 'lecture-2.html#table-aliasing'
    },
    {
      id: 'l2q11',
      type: 'mcq',
      topic: 'Wildcards',
      difficulty: 'easy',
      question: 'Which wildcard character matches any sequence of characters in a LIKE pattern?',
      options: ['_', '%', '*', '?'],
      correctAnswer: 1,
      explanation: '% matches any sequence of zero or more characters. _ matches exactly one character.',
      lectureRef: 'lecture-2.html#wildcards'
    },
    {
      id: 'l2q12',
      type: 'mcq',
      topic: 'Wildcards',
      difficulty: 'medium',
      question: 'What is the difference between LIKE and ILIKE in PostgreSQL?',
      options: [
        'LIKE is faster',
        'ILIKE is case-insensitive, LIKE is case-sensitive',
        'ILIKE works with numbers only',
        'There is no difference'
      ],
      correctAnswer: 1,
      explanation: 'ILIKE performs case-insensitive pattern matching, while LIKE is case-sensitive.',
      lectureRef: 'lecture-2.html#wildcards'
    },
    {
      id: 'l2q13',
      type: 'write_query',
      topic: 'Wildcards',
      difficulty: 'medium',
      question: 'Write a query to find all customers whose last name starts with "Sm". Table: customer(customer_id, first_name, last_name)',
      correctAnswer: "SELECT * FROM customer WHERE last_name LIKE 'Sm%';",
      acceptablePatterns: ["like 'Sm%", 'ilike', 'last_name like'],
      explanation: 'Use LIKE with % wildcard to match any characters following "Sm".',
      schema: { customer: ['customer_id', 'first_name', 'last_name'] },
      lectureRef: 'lecture-2.html#wildcards'
    },
    {
      id: 'l2q14',
      type: 'mcq',
      topic: 'NULL Handling',
      difficulty: 'medium',
      question: 'How do you check for NULL values in SQL?',
      options: [
        'column = NULL',
        'column == NULL',
        'column IS NULL',
        'column EQUALS NULL'
      ],
      correctAnswer: 2,
      explanation: 'NULL must be checked with IS NULL or IS NOT NULL. Using = NULL will not work because NULL represents unknown values.',
      lectureRef: 'lecture-2.html#null-handling'
    },
    {
      id: 'l2q15',
      type: 'true_false',
      topic: 'NULL Handling',
      difficulty: 'hard',
      question: 'In SQL, NULL = NULL evaluates to TRUE.',
      correctAnswer: false,
      explanation: 'NULL = NULL evaluates to UNKNOWN (not TRUE). NULL represents an unknown value, so we cannot determine if two unknowns are equal.',
      lectureRef: 'lecture-2.html#null-handling'
    },
    {
      id: 'l2q16',
      type: 'write_query',
      topic: 'NULL Handling',
      difficulty: 'medium',
      question: 'Write a query to find all employees who do not have a phone number. Table: employee(employee_id, name, phone)',
      correctAnswer: 'SELECT * FROM employee WHERE phone IS NULL;',
      acceptablePatterns: ['phone is null', 'where phone is null'],
      explanation: 'Use IS NULL to find rows where a column has no value.',
      schema: { employee: ['employee_id', 'name', 'phone'] },
      lectureRef: 'lecture-2.html#null-handling'
    },
    {
      id: 'l2q17',
      type: 'mcq',
      topic: 'DISTINCT',
      difficulty: 'easy',
      question: 'What does the DISTINCT keyword do in a SELECT statement?',
      options: [
        'Sorts the results',
        'Removes duplicate rows from the result set',
        'Filters NULL values',
        'Limits the number of rows returned'
      ],
      correctAnswer: 1,
      explanation: 'DISTINCT eliminates duplicate rows from the result set, returning only unique values.',
      lectureRef: 'lecture-2.html#distinct'
    },
    {
      id: 'l2q18',
      type: 'write_query',
      topic: 'DISTINCT',
      difficulty: 'easy',
      question: 'Write a query to get a list of unique department IDs from the employee table.',
      correctAnswer: 'SELECT DISTINCT department_id FROM employee;',
      acceptablePatterns: ['distinct department_id', 'select distinct'],
      explanation: 'Use SELECT DISTINCT to eliminate duplicate values.',
      schema: { employee: ['employee_id', 'name', 'department_id'] },
      lectureRef: 'lecture-2.html#distinct'
    },
    {
      id: 'l2q19',
      type: 'mcq',
      topic: 'ORDER BY',
      difficulty: 'medium',
      question: 'Which clause is processed last in a SQL query?',
      options: ['SELECT', 'HAVING', 'ORDER BY', 'WHERE'],
      correctAnswer: 2,
      explanation: 'ORDER BY is the last clause processed. It sorts the final result set after all filtering and grouping.',
      lectureRef: 'lecture-2.html#order-by'
    },
    {
      id: 'l2q20',
      type: 'write_query',
      topic: 'ORDER BY',
      difficulty: 'easy',
      question: 'Write a query to get employees ordered by last_name ascending, then first_name descending.',
      correctAnswer: 'SELECT * FROM employee ORDER BY last_name ASC, first_name DESC;',
      acceptablePatterns: ['order by last_name', 'first_name desc', 'asc'],
      explanation: 'Use ORDER BY with ASC (default) or DESC. Multiple columns can be specified with separate sort orders.',
      schema: { employee: ['employee_id', 'first_name', 'last_name'] },
      lectureRef: 'lecture-2.html#order-by'
    }
  ],

  // ==========================================
  // LECTURE 3: Joins, Aggregates, Subqueries (25 questions)
  // ==========================================
  lecture3: [
    {
      id: 'l3q1',
      type: 'mcq',
      topic: 'JOIN Types',
      difficulty: 'easy',
      question: 'Which JOIN returns only matching rows from both tables?',
      options: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN'],
      correctAnswer: 2,
      explanation: 'INNER JOIN returns only rows where there is a match in both tables.',
      lectureRef: 'lecture-3.html#join-types'
    },
    {
      id: 'l3q2',
      type: 'mcq',
      topic: 'JOIN Types',
      difficulty: 'medium',
      question: 'Which JOIN returns all rows from the left table and matching rows from the right table?',
      options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'],
      correctAnswer: 1,
      explanation: 'LEFT JOIN (or LEFT OUTER JOIN) returns all rows from the left table and matching rows from the right. Non-matching right rows have NULLs.',
      lectureRef: 'lecture-3.html#join-types'
    },
    {
      id: 'l3q3',
      type: 'mcq',
      topic: 'JOIN Types',
      difficulty: 'medium',
      question: 'What is a CROSS JOIN?',
      options: [
        'A join that finds matching rows',
        'A Cartesian product of both tables - every row in A joins with every row in B',
        'A join that excludes matching rows',
        'A join using multiple conditions'
      ],
      correctAnswer: 1,
      explanation: 'CROSS JOIN produces a Cartesian product - every row from the first table joins with every row from the second table.',
      lectureRef: 'lecture-3.html#cross-join'
    },
    {
      id: 'l3q4',
      type: 'mcq',
      topic: 'SELF JOIN',
      difficulty: 'medium',
      question: 'When would you use a SELF JOIN?',
      options: [
        'To join a table with itself',
        'To join two different tables',
        'To perform a cross join',
        'To eliminate duplicates'
      ],
      correctAnswer: 0,
      explanation: 'A SELF JOIN joins a table with itself, useful for hierarchical data like employees and managers in the same table.',
      lectureRef: 'lecture-3.html#self-join'
    },
    {
      id: 'l3q5',
      type: 'write_query',
      topic: 'SELF JOIN',
      difficulty: 'hard',
      question: 'Write a query to display employee names alongside their manager names. Table: employee(emp_id, name, manager_id)',
      correctAnswer: "SELECT e.name AS employee, m.name AS manager\\nFROM employee e\\nLEFT JOIN employee m ON e.manager_id = m.emp_id;",
      acceptablePatterns: ['from employee e', 'join employee m', 'manager_id'],
      explanation: 'Use a self-join with different aliases for the same table. Left join ensures employees without managers are still listed.',
      schema: { employee: ['emp_id', 'name', 'manager_id'] },
      lectureRef: 'lecture-3.html#self-join'
    },
    {
      id: 'l3q6',
      type: 'true_false',
      topic: 'NATURAL JOIN',
      difficulty: 'medium',
      question: 'NATURAL JOIN is always the safest choice because it automatically matches columns with the same name.',
      correctAnswer: false,
      explanation: 'NATURAL JOIN can be dangerous because it silently matches ALL columns with the same name. Unexpected columns might match, causing incorrect results.',
      lectureRef: 'lecture-3.html#natural-join'
    },
    {
      id: 'l3q7',
      type: 'mcq',
      topic: 'NATURAL JOIN',
      difficulty: 'hard',
      question: 'Why should NATURAL JOIN be avoided in production code?',
      options: [
        'It is too slow',
        'It matches columns implicitly by name, which can cause bugs if column names change',
        'It only works with numeric columns',
        'It requires specific database permissions'
      ],
      correctAnswer: 1,
      explanation: 'NATURAL JOIN matches all columns with identical names implicitly. If column names change or new columns are added, the join behavior changes without warning.',
      lectureRef: 'lecture-3.html#natural-join'
    },
    {
      id: 'l3q8',
      type: 'match',
      topic: 'JOIN Types',
      difficulty: 'medium',
      question: 'Match the JOIN type to its description:',
      items: [
        { left: 'INNER JOIN', right: 'Returns only matching rows from both tables' },
        { left: 'LEFT JOIN', right: 'Returns all left table rows, matching right rows' },
        { left: 'FULL JOIN', right: 'Returns all rows from both tables' },
        { left: 'CROSS JOIN', right: 'Returns Cartesian product of both tables' }
      ],
      explanation: 'Each join type has specific behavior regarding which rows are returned.',
      lectureRef: 'lecture-3.html#join-types'
    },
    {
      id: 'l3q9',
      type: 'mcq',
      topic: 'Aggregate Functions',
      difficulty: 'easy',
      question: 'Which aggregate function returns the number of rows?',
      options: ['SUM', 'COUNT', 'AVG', 'MAX'],
      correctAnswer: 1,
      explanation: 'COUNT(*) returns the total number of rows. COUNT(column) returns non-NULL values in that column.',
      lectureRef: 'lecture-3.html#aggregates'
    },
    {
      id: 'l3q10',
      type: 'mcq',
      topic: 'Aggregate Functions',
      difficulty: 'medium',
      question: 'What does COUNT(*) count?',
      options: [
        'Only non-NULL rows',
        'All rows including NULLs',
        'Only distinct values',
        'Only numeric columns'
      ],
      correctAnswer: 1,
      explanation: 'COUNT(*) counts all rows regardless of NULL values. COUNT(column) only counts non-NULL values in that column.',
      lectureRef: 'lecture-3.html#aggregates'
    },
    {
      id: 'l3q11',
      type: 'mcq',
      topic: 'Aggregate Functions',
      difficulty: 'hard',
      question: 'What happens when you use aggregate functions with NULL values?',
      options: [
        'The aggregate returns NULL',
        'NULL values are ignored in all aggregate functions except COUNT(*)',
        'The query fails',
        'NULL is treated as 0'
      ],
      correctAnswer: 1,
      explanation: 'NULL values are generally ignored by aggregate functions (SUM, AVG, MAX, MIN). COUNT(*) counts all rows, COUNT(column) ignores NULLs.',
      lectureRef: 'lecture-3.html#aggregates'
    },
    {
      id: 'l3q12',
      type: 'write_query',
      topic: 'Aggregates',
      difficulty: 'medium',
      question: 'Write a query to find the average salary and count of employees in each department. Tables: employee(emp_id, name, salary, dept_id), department(dept_id, dept_name)',
      correctAnswer: "SELECT d.dept_name, AVG(e.salary) AS avg_salary, COUNT(e.emp_id) AS emp_count\\nFROM department d\\nLEFT JOIN employee e ON d.dept_id = e.dept_id\\nGROUP BY d.dept_name;",
      acceptablePatterns: ['avg(e.salary', 'count(e', 'group by', 'dept_name'],
      explanation: 'Use GROUP BY with aggregate functions. Use LEFT JOIN to include departments with no employees.',
      schema: {
        employee: ['emp_id', 'name', 'salary', 'dept_id'],
        department: ['dept_id', 'dept_name']
      },
      lectureRef: 'lecture-3.html#aggregates'
    },
    {
      id: 'l3q13',
      type: 'mcq',
      topic: 'GROUP BY',
      difficulty: 'medium',
      question: 'What happens if you include a non-aggregated column in SELECT but not in GROUP BY?',
      options: [
        'The query works fine',
        'PostgreSQL will return an error (in strict mode) or arbitrary value',
        'The column is automatically aggregated',
        'The query returns all rows'
      ],
      correctAnswer: 1,
      explanation: 'Standard SQL requires all non-aggregated columns in SELECT to be in GROUP BY. PostgreSQL may return an error or arbitrary value from the group.',
      lectureRef: 'lecture-3.html#group-by'
    },
    {
      id: 'l3q14',
      type: 'mcq',
      topic: 'HAVING',
      difficulty: 'medium',
      question: 'What is the difference between WHERE and HAVING?',
      options: [
        'There is no difference',
        'WHERE filters rows before grouping, HAVING filters groups after grouping',
        'HAVING is faster than WHERE',
        'WHERE can use aggregates, HAVING cannot'
      ],
      correctAnswer: 1,
      explanation: 'WHERE filters individual rows before GROUP BY. HAVING filters groups after aggregation and can use aggregate functions.',
      lectureRef: 'lecture-3.html#having'
    },
    {
      id: 'l3q15',
      type: 'write_query',
      topic: 'HAVING',
      difficulty: 'hard',
      question: 'Write a query to find departments with more than 5 employees and average salary > 50000.',
      correctAnswer: "SELECT dept_id, COUNT(*) AS emp_count, AVG(salary) AS avg_salary\\nFROM employee\\nGROUP BY dept_id\\nHAVING COUNT(*) > 5 AND AVG(salary) > 50000;",
      acceptablePatterns: ['having count', 'having avg', 'group by dept_id'],
      explanation: 'Use HAVING to filter groups based on aggregate results. WHERE cannot be used with aggregate functions.',
      schema: { employee: ['emp_id', 'name', 'salary', 'dept_id'] },
      lectureRef: 'lecture-3.html#having'
    },
    {
      id: 'l3q16',
      type: 'mcq',
      topic: 'Subqueries',
      difficulty: 'easy',
      question: 'What is a subquery?',
      options: [
        'A query that runs after the main query',
        'A query nested inside another query',
        'A query with no results',
        'A query that deletes data'
      ],
      correctAnswer: 1,
      explanation: 'A subquery (or inner query) is a SELECT statement nested inside another SELECT, INSERT, UPDATE, or DELETE statement.',
      lectureRef: 'lecture-3.html#subqueries'
    },
    {
      id: 'l3q17',
      type: 'mcq',
      topic: 'Subqueries',
      difficulty: 'medium',
      question: 'What is the difference between a correlated and non-correlated subquery?',
      options: [
        'Non-correlated subqueries are faster',
        'Correlated subqueries reference columns from the outer query and execute once per outer row',
        'Correlated subqueries can only return one column',
        'There is no difference'
      ],
      correctAnswer: 1,
      explanation: 'Correlated subqueries reference the outer query and execute once for each row in the outer query. Non-correlated subqueries execute once independently.',
      lectureRef: 'lecture-3.html#correlated-subqueries'
    },
    {
      id: 'l3q18',
      type: 'write_query',
      topic: 'Subqueries',
      difficulty: 'medium',
      question: 'Write a query to find employees who earn more than the average salary using a subquery.',
      correctAnswer: "SELECT * FROM employee\\nWHERE salary > (SELECT AVG(salary) FROM employee);",
      acceptablePatterns: ['where salary >', 'select avg(salary', 'subquery'],
      explanation: 'Use a subquery in the WHERE clause to compare against an aggregate value.',
      schema: { employee: ['emp_id', 'name', 'salary', 'dept_id'] },
      lectureRef: 'lecture-3.html#subqueries'
    },
    {
      id: 'l3q19',
      type: 'mcq',
      topic: 'IN Operator',
      difficulty: 'easy',
      question: 'What does the IN operator do?',
      options: [
        'Checks if a value matches any value in a list or subquery result',
        'Sorts results in ascending order',
        'Joins two tables',
        'Inserts data into a table'
      ],
      correctAnswer: 0,
      explanation: 'IN checks if a value matches any value in a provided list or returned by a subquery.',
      lectureRef: 'lecture-3.html#in-operator'
    },
    {
      id: 'l3q20',
      type: 'write_query',
      topic: 'IN Operator',
      difficulty: 'medium',
      question: 'Write a query to find employees in departments located in "New York" or "Boston". Tables: employee(emp_id, name, dept_id), department(dept_id, location)',
      correctAnswer: "SELECT * FROM employee\\nWHERE dept_id IN (\\n  SELECT dept_id FROM department\\n  WHERE location IN ('New York', 'Boston')\\n);",
      acceptablePatterns: ['dept_id in', "'New York'", "'Boston'"],
      explanation: 'Use IN with a subquery to filter based on values from another table.',
      schema: {
        employee: ['emp_id', 'name', 'dept_id'],
        department: ['dept_id', 'location']
      },
      lectureRef: 'lecture-3.html#in-operator'
    },
    {
      id: 'l3q21',
      type: 'mcq',
      topic: 'EXISTS',
      difficulty: 'medium',
      question: 'When should you use EXISTS instead of IN?',
      options: [
        'When you need to return values from the subquery',
        'When checking for existence of rows, especially with large datasets',
        'When sorting results',
        'When updating data'
      ],
      correctAnswer: 1,
      explanation: 'EXISTS is often more efficient than IN for large datasets because it stops at the first match and does not need to return actual values.',
      lectureRef: 'lecture-3.html#exists'
    },
    {
      id: 'l3q22',
      type: 'mcq',
      topic: 'ANY/ALL',
      difficulty: 'hard',
      question: 'What does the ANY operator do?',
      options: [
        'Returns all rows',
        'Compares a value to ANY value in a subquery result (returns true if any match)',
        'Combines multiple tables',
        'Checks if all values match'
      ],
      correctAnswer: 1,
      explanation: 'ANY returns true if the comparison is true for any value in the subquery result. ALL requires the comparison to be true for all values.',
      lectureRef: 'lecture-3.html#any-all'
    },
    {
      id: 'l3q23',
      type: 'write_dml',
      topic: 'DML - UPDATE',
      difficulty: 'medium',
      question: 'Write an UPDATE statement to increase all employee salaries by 10%.',
      correctAnswer: 'UPDATE employee SET salary = salary * 1.10;',
      acceptablePatterns: ['update employee', 'set salary =', '* 1.10', '* 1.1'],
      explanation: 'Use UPDATE with SET to modify existing rows. You can use calculations in the SET clause.',
      schema: { employee: ['emp_id', 'name', 'salary'] },
      lectureRef: 'lecture-3.html#dml'
    },
    {
      id: 'l3q24',
      type: 'write_dml',
      topic: 'DML - DELETE',
      difficulty: 'medium',
      question: 'Write a DELETE statement to remove employees in department 5 who earn less than 30000.',
      correctAnswer: 'DELETE FROM employee WHERE dept_id = 5 AND salary < 30000;',
      acceptablePatterns: ['delete from employee', 'where dept_id = 5', 'salary < 30000'],
      explanation: 'Use DELETE FROM with WHERE clause to remove specific rows. Always be careful with DELETE - test your WHERE clause with SELECT first!',
      schema: { employee: ['emp_id', 'name', 'salary', 'dept_id'] },
      lectureRef: 'lecture-3.html#dml'
    },
    {
      id: 'l3q25',
      type: 'write_dml',
      topic: 'DML - INSERT',
      difficulty: 'easy',
      question: 'Write an INSERT statement to add a new employee with emp_id=100, name="John Smith", salary=50000.',
      correctAnswer: "INSERT INTO employee (emp_id, name, salary) VALUES (100, 'John Smith', 50000);",
      acceptablePatterns: ['insert into employee', 'values', 'John Smith'],
      explanation: 'Use INSERT INTO with column names and VALUES clause to add new rows.',
      schema: { employee: ['emp_id', 'name', 'salary'] },
      lectureRef: 'lecture-3.html#dml'
    }
  ],

  // ==========================================
  // LECTURE 4: Views, CASE, UNION (15 questions)
  // ==========================================
  lecture4: [
    {
      id: 'l4q1',
      type: 'mcq',
      topic: 'Views',
      difficulty: 'easy',
      question: 'What is a database view?',
      options: [
        'A physical copy of table data',
        'A virtual table based on the result of a SQL query',
        'A type of index',
        'A backup of a table'
      ],
      correctAnswer: 1,
      explanation: 'A view is a virtual table that stores a query definition. The data is not duplicated; the query runs each time the view is accessed.',
      lectureRef: 'lecture-4.html#views'
    },
    {
      id: 'l4q2',
      type: 'write_ddl',
      topic: 'Views',
      difficulty: 'medium',
      question: 'Create a view named "high_earners" showing employees with salary > 80000.',
      correctAnswer: 'CREATE VIEW high_earners AS\\nSELECT * FROM employee WHERE salary > 80000;',
      acceptablePatterns: ['create view high_earners', 'as select', 'salary > 80000'],
      explanation: 'Use CREATE VIEW view_name AS SELECT ... to create a virtual table based on a query.',
      schema: { employee: ['emp_id', 'name', 'salary', 'dept_id'] },
      lectureRef: 'lecture-4.html#create-view'
    },
    {
      id: 'l4q3',
      type: 'true_false',
      topic: 'Views',
      difficulty: 'medium',
      question: 'Views always store a copy of the data at the time they were created.',
      correctAnswer: false,
      explanation: 'Standard views do not store data; they execute their underlying query each time they are accessed. Materialized views do store data.',
      lectureRef: 'lecture-4.html#views'
    },
    {
      id: 'l4q4',
      type: 'mcq',
      topic: 'Materialized Views',
      difficulty: 'hard',
      question: 'What is the difference between a regular view and a materialized view?',
      options: [
        'There is no difference',
        'Materialized views store query results physically and need to be refreshed',
        'Regular views are faster',
        'Materialized views cannot use JOINs'
      ],
      correctAnswer: 1,
      explanation: 'Materialized views store the query result physically (like a cache). They must be refreshed to get updated data, but provide faster access for complex queries.',
      lectureRef: 'lecture-4.html#materialized-views'
    },
    {
      id: 'l4q5',
      type: 'write_ddl',
      topic: 'Materialized Views',
      difficulty: 'hard',
      question: 'Create a materialized view named "dept_summary" with department totals.',
      correctAnswer: 'CREATE MATERIALIZED VIEW dept_summary AS\\nSELECT dept_id, COUNT(*) AS emp_count, SUM(salary) AS total_salary\\nFROM employee\\nGROUP BY dept_id;',
      acceptablePatterns: ['create materialized view', 'dept_summary', 'group by dept_id'],
      explanation: 'Use CREATE MATERIALIZED VIEW to store query results. Use REFRESH MATERIALIZED VIEW to update the data.',
      schema: { employee: ['emp_id', 'name', 'salary', 'dept_id'] },
      lectureRef: 'lecture-4.html#materialized-views'
    },
    {
      id: 'l4q6',
      type: 'mcq',
      topic: 'CASE Statement',
      difficulty: 'easy',
      question: 'What is the purpose of the CASE statement in SQL?',
      options: [
        'To create a new table',
        'To perform conditional logic and return different values based on conditions',
        'To join tables',
        'To sort results'
      ],
      correctAnswer: 1,
      explanation: 'CASE provides if-then-else logic within SQL, allowing different values to be returned based on conditions.',
      lectureRef: 'lecture-4.html#case'
    },
    {
      id: 'l4q7',
      type: 'write_query',
      topic: 'CASE Statement',
      difficulty: 'medium',
      question: 'Write a query using CASE to categorize employees as "Junior" (salary < 40000), "Mid" (40000-70000), or "Senior" (> 70000).',
      correctAnswer: "SELECT name, salary,\\n  CASE\\n    WHEN salary < 40000 THEN 'Junior'\\n    WHEN salary BETWEEN 40000 AND 70000 THEN 'Mid'\\n    ELSE 'Senior'\\n  END AS level\\nFROM employee;",
      acceptablePatterns: ['case when', "'Junior'", "'Mid'", "'Senior'", 'end as level'],
      explanation: 'Use CASE WHEN condition THEN value ... ELSE default END to create conditional expressions.',
      schema: { employee: ['name', 'salary'] },
      lectureRef: 'lecture-4.html#case'
    },
    {
      id: 'l4q8',
      type: 'mcq',
      topic: 'CASE Statement',
      difficulty: 'medium',
      question: 'Which CASE syntax is correct for simple CASE?',
      options: [
        'CASE column = value THEN result END',
        'CASE column WHEN value THEN result END',
        'CASE WHEN column = value THEN result END',
        'Both B and C are correct'
      ],
      correctAnswer: 3,
      explanation: 'Simple CASE: CASE column WHEN value THEN result END. Searched CASE: CASE WHEN condition THEN result END. Both are valid.',
      lectureRef: 'lecture-4.html#case-syntax'
    },
    {
      id: 'l4q9',
      type: 'write_query',
      topic: 'CASE in Aggregate',
      difficulty: 'hard',
      question: 'Write a query to count employees by department, with separate columns for junior (< 40000) and senior (>= 40000) counts.',
      correctAnswer: "SELECT dept_id,\\n  COUNT(CASE WHEN salary < 40000 THEN 1 END) AS junior_count,\\n  COUNT(CASE WHEN salary >= 40000 THEN 1 END) AS senior_count\\nFROM employee\\nGROUP BY dept_id;",
      acceptablePatterns: ['count(case when', 'junior_count', 'senior_count', 'group by dept_id'],
      explanation: 'Use CASE inside aggregate functions to create conditional aggregates (pivot-style results).',
      schema: { employee: ['emp_id', 'salary', 'dept_id'] },
      lectureRef: 'lecture-4.html#case-aggregates'
    },
    {
      id: 'l4q10',
      type: 'mcq',
      topic: 'UNION',
      difficulty: 'easy',
      question: 'What does UNION do in SQL?',
      options: [
        'Joins tables horizontally',
        'Combines result sets from multiple queries vertically, removing duplicates',
        'Sorts data',
        'Creates a backup'
      ],
      correctAnswer: 1,
      explanation: 'UNION combines the results of two or more SELECT statements into a single result set, removing duplicates by default.',
      lectureRef: 'lecture-4.html#union'
    },
    {
      id: 'l4q11',
      type: 'mcq',
      topic: 'UNION vs UNION ALL',
      difficulty: 'medium',
      question: 'What is the difference between UNION and UNION ALL?',
      options: [
        'UNION ALL is faster but keeps duplicates; UNION removes duplicates',
        'UNION is faster',
        'UNION ALL only works with two queries',
        'There is no difference'
      ],
      correctAnswer: 0,
      explanation: 'UNION ALL is faster because it does not check for duplicates. UNION performs a distinct sort to remove duplicates, which is slower.',
      lectureRef: 'lecture-4.html#union-all'
    },
    {
      id: 'l4q12',
      type: 'write_query',
      topic: 'UNION',
      difficulty: 'medium',
      question: 'Write a query using UNION to get all customer names and employee names in a single list.',
      correctAnswer: "SELECT name FROM customer\\nUNION\\nSELECT name FROM employee;",
      acceptablePatterns: ['union', 'select name from customer', 'select name from employee'],
      explanation: 'UNION requires matching column names/types. Duplicate names will appear only once.',
      schema: {
        customer: ['customer_id', 'name'],
        employee: ['emp_id', 'name']
      },
      lectureRef: 'lecture-4.html#union'
    },
    {
      id: 'l4q13',
      type: 'true_false',
      topic: 'UNION',
      difficulty: 'medium',
      question: 'UNION requires that both SELECT statements return the same number of columns with compatible data types.',
      correctAnswer: true,
      explanation: 'UNION requires compatible column structures - same number of columns and compatible data types in corresponding positions.',
      lectureRef: 'lecture-4.html#union-requirements'
    },
    {
      id: 'l4q14',
      type: 'write_query',
      topic: 'UNION with ORDER BY',
      difficulty: 'hard',
      question: 'Write a query to get all products from local_products and imported_products, sorted by price descending. Use UNION ALL.',
      correctAnswer: "SELECT * FROM local_products\\nUNION ALL\\nSELECT * FROM imported_products\\nORDER BY price DESC;",
      acceptablePatterns: ['union all', 'order by price desc'],
      explanation: 'When using ORDER BY with UNION, place it at the end. It applies to the combined result.',
      schema: {
        local_products: ['product_id', 'name', 'price'],
        imported_products: ['product_id', 'name', 'price']
      },
      lectureRef: 'lecture-4.html#union-order-by'
    },
    {
      id: 'l4q15',
      type: 'match',
      topic: 'DDL Commands',
      difficulty: 'medium',
      question: 'Match the DDL command to its purpose:',
      items: [
        { left: 'CREATE TABLE', right: 'Create a new table structure' },
        { left: 'ALTER TABLE', right: 'Modify an existing table structure' },
        { left: 'DROP TABLE', right: 'Remove a table and all its data' },
        { left: 'CREATE VIEW', right: 'Create a virtual table based on a query' }
      ],
      explanation: 'DDL commands define and modify database structure without manipulating data.',
      lectureRef: 'lecture-4.html#ddl-commands'
    }
  ],

  // ==========================================
  // LECTURE 5: Transactions (12 questions)
  // ==========================================
  lecture5: [
    {
      id: 'l5q1',
      type: 'mcq',
      topic: 'ACID Properties',
      difficulty: 'easy',
      question: 'What does ACID stand for in database transactions?',
      options: [
        'Access, Control, Integrity, Data',
        'Atomicity, Consistency, Isolation, Durability',
        'Automatic, Concurrent, Indexed, Distributed',
        'Application, Connection, Interface, Database'
      ],
      correctAnswer: 1,
      explanation: 'ACID: Atomicity (all-or-nothing), Consistency (valid state transitions), Isolation (concurrent transactions do not interfere), Durability (committed changes persist).',
      lectureRef: 'lecture-5.html#acid'
    },
    {
      id: 'l5q2',
      type: 'match',
      topic: 'ACID Properties',
      difficulty: 'medium',
      question: 'Match each ACID property to its description:',
      items: [
        { left: 'Atomicity', right: 'All operations complete or none do' },
        { left: 'Consistency', right: 'Database remains in a valid state' },
        { left: 'Isolation', right: 'Concurrent transactions execute independently' },
        { left: 'Durability', right: 'Committed changes survive system failures' }
      ],
      explanation: 'ACID properties ensure reliable transaction processing even in the presence of errors or system failures.',
      lectureRef: 'lecture-5.html#acid-properties'
    },
    {
      id: 'l5q3',
      type: 'mcq',
      topic: 'Atomicity',
      difficulty: 'medium',
      question: 'A bank transfer deducts $100 from Account A and adds $100 to Account B. If the system crashes after deducting but before adding, what happens?',
      options: [
        'Account A loses $100, Account B unchanged',
        'Both operations complete when system restarts',
        'The entire transaction is rolled back; both accounts remain unchanged',
        'Only the last operation is rolled back'
      ],
      correctAnswer: 2,
      explanation: 'Atomicity ensures that either all operations complete or none do. The partial transaction is automatically rolled back on system recovery.',
      lectureRef: 'lecture-5.html#atomicity'
    },
    {
      id: 'l5q4',
      type: 'mcq',
      topic: 'COMMIT',
      difficulty: 'easy',
      question: 'What does the COMMIT statement do?',
      options: [
        'Starts a new transaction',
        'Makes all changes in the current transaction permanent',
        'Undoes all changes',
        'Deletes the transaction log'
      ],
      correctAnswer: 1,
      explanation: 'COMMIT permanently saves all changes made during the current transaction to the database.',
      lectureRef: 'lecture-5.html#commit'
    },
    {
      id: 'l5q5',
      type: 'mcq',
      topic: 'ROLLBACK',
      difficulty: 'easy',
      question: 'What does the ROLLBACK statement do?',
      options: [
        'Saves changes permanently',
        'Undoes all changes made since the last COMMIT or BEGIN TRANSACTION',
        'Creates a backup',
        'Locks the table'
      ],
      correctAnswer: 1,
      explanation: 'ROLLBACK undoes all changes made during the current transaction, returning the database to its state before the transaction began.',
      lectureRef: 'lecture-5.html#rollback'
    },
    {
      id: 'l5q6',
      type: 'write_query',
      topic: 'Transaction Control',
      difficulty: 'medium',
      question: 'Write a transaction to transfer $500 from account 101 to account 102. Include proper transaction control.',
      correctAnswer: "BEGIN TRANSACTION;\\nUPDATE accounts SET balance = balance - 500 WHERE account_id = 101;\\nUPDATE accounts SET balance = balance + 500 WHERE account_id = 102;\\nCOMMIT;",
      acceptablePatterns: ['begin transaction', 'update accounts', 'commit'],
      explanation: 'Use BEGIN TRANSACTION to start, then COMMIT to save or ROLLBACK to undo if there is an error.',
      schema: { accounts: ['account_id', 'balance', 'holder_name'] },
      lectureRef: 'lecture-5.html#transaction-control'
    },
    {
      id: 'l5q7',
      type: 'mcq',
      topic: 'SAVEPOINT',
      difficulty: 'medium',
      question: 'What is a SAVEPOINT in a transaction?',
      options: [
        'A permanent backup of the database',
        'A marker that allows partial rollback within a transaction',
        'The final state after COMMIT',
        'A lock on a specific row'
      ],
      correctAnswer: 1,
      explanation: 'SAVEPOINT creates a marker within a transaction. You can rollback to this point without undoing the entire transaction.',
      lectureRef: 'lecture-5.html#savepoint'
    },
    {
      id: 'l5q8',
      type: 'write_query',
      topic: 'SAVEPOINT',
      difficulty: 'hard',
      question: 'Write a transaction that: (1) updates inventory, (2) creates a savepoint, (3) updates orders, (4) rolls back to savepoint if order update fails.',
      correctAnswer: "BEGIN TRANSACTION;\\nUPDATE inventory SET qty = qty - 10 WHERE product_id = 1;\\nSAVEPOINT after_inventory;\\nUPDATE orders SET status = 'processed' WHERE order_id = 100;\\n-- If error occurs:\\nROLLBACK TO SAVEPOINT after_inventory;\\nCOMMIT;",
      acceptablePatterns: ['savepoint', 'rollback to savepoint', 'begin transaction', 'commit'],
      explanation: 'SAVEPOINT allows partial rollback. Changes before the savepoint are preserved.',
      schema: {
        inventory: ['product_id', 'qty'],
        orders: ['order_id', 'status']
      },
      lectureRef: 'lecture-5.html#savepoint'
    },
    {
      id: 'l5q9',
      type: 'mcq',
      topic: 'Isolation',
      difficulty: 'hard',
      question: 'What problem does transaction isolation prevent?',
      options: [
        'Slow queries',
        'Lost updates, dirty reads, and non-repeatable reads',
        'Database backups',
        'Index fragmentation'
      ],
      correctAnswer: 1,
      explanation: 'Isolation prevents concurrent transaction issues: dirty reads (reading uncommitted data), non-repeatable reads, and lost updates.',
      lectureRef: 'lecture-5.html#isolation'
    },
    {
      id: 'l5q10',
      type: 'mcq',
      topic: 'Concurrent Transactions',
      difficulty: 'hard',
      question: 'Two transactions read the same value (100), then both update it based on that read (T1: +10, T2: +20). What is the final value if there is no isolation?',
      options: ['130', '110', '120', '100'],
      correctAnswer: 1,
      explanation: 'This is the "lost update" problem. Without isolation, the last update overwrites the first. If T2 commits last, the result is 120 (100+20), losing T1\'s +10.',
      lectureRef: 'lecture-5.html#concurrent-transactions'
    },
    {
      id: 'l5q11',
      type: 'true_false',
      topic: 'Durability',
      difficulty: 'medium',
      question: 'Once a transaction is committed, its changes will survive even if the system crashes immediately after.',
      correctAnswer: true,
      explanation: 'Durability guarantees that committed transactions persist even in the event of a system failure. The database uses transaction logs to ensure this.',
      lectureRef: 'lecture-5.html#durability'
    },
    {
      id: 'l5q12',
      type: 'fill_blank',
      topic: 'Transaction Control',
      difficulty: 'easy',
      question: 'Complete the transaction control statement: BEGIN TRANSACTION; ... changes ...; ______;',
      correctAnswer: 'COMMIT',
      acceptableAnswers: ['COMMIT', 'commit', 'ROLLBACK', 'rollback'],
      explanation: 'Transactions end with either COMMIT (save changes) or ROLLBACK (undo changes).',
      lectureRef: 'lecture-5.html#transaction-control'
    }
  ]
};

// ==========================================
// LECTURE 6: CTEs, Triggers, Indexes (18 questions)
// ==========================================
questionBank.lecture6 = [
  {
    id: 'l6q1',
    type: 'mcq',
    topic: 'CTEs',
    difficulty: 'easy',
    question: 'What does CTE stand for?',
    options: [
      'Common Table Expression',
      'Compiled Table Extension',
      'Complex Transaction Element',
      'Current Table Entry'
    ],
    correctAnswer: 0,
    explanation: 'CTE = Common Table Expression. A named temporary result set that exists only for the duration of a single query.',
    lectureRef: 'lecture-6.html#cte'
  },
  {
    id: 'l6q2',
    type: 'write_query',
    topic: 'Non-recursive CTE',
    difficulty: 'medium',
    question: 'Write a query using a CTE to calculate average salary, then select employees earning above average.',
    correctAnswer: "WITH avg_sal AS (\\n  SELECT AVG(salary) AS avg_salary FROM employee\\n)\\nSELECT e.* FROM employee e, avg_sal\\nWHERE e.salary > avg_sal.avg_salary;",
    acceptablePatterns: ['with avg_sal', 'as', 'select avg(salary)', 'where e.salary >'],
    explanation: 'Use WITH clause to define a CTE. The CTE can be referenced multiple times in the main query.',
    schema: { employee: ['emp_id', 'name', 'salary', 'dept_id'] },
    lectureRef: 'lecture-6.html#non-recursive-cte'
  },
  {
    id: 'l6q3',
    type: 'mcq',
    topic: 'CTEs',
    difficulty: 'medium',
    question: 'What is an advantage of using a CTE over a subquery?',
    options: [
      'CTEs are always faster',
      'CTEs can be referenced multiple times and improve readability',
      'CTEs store data permanently',
      'CTEs do not require SELECT'
    ],
    correctAnswer: 1,
    explanation: 'CTEs improve query readability and can be referenced multiple times. They are especially useful for complex queries with repeated subqueries.',
    lectureRef: 'lecture-6.html#cte-advantages'
  },
  {
    id: 'l6q4',
    type: 'mcq',
    topic: 'Recursive CTE',
    difficulty: 'hard',
    question: 'What are the two required parts of a recursive CTE?',
    options: [
      'SELECT and FROM',
      'Anchor member (base case) and Recursive member',
      'UNION and JOIN',
      'BEGIN and END'
    ],
    correctAnswer: 1,
    explanation: 'Recursive CTEs require: (1) Anchor member - the base query, and (2) Recursive member - references the CTE itself, combined with UNION ALL.',
    lectureRef: 'lecture-6.html#recursive-cte'
  },
  {
    id: 'l6q5',
    type: 'write_query',
    topic: 'Recursive CTE',
    difficulty: 'expert',
    question: 'Write a recursive CTE to generate numbers 1 to 10.',
    correctAnswer: "WITH RECURSIVE numbers AS (\\n  SELECT 1 AS n\\n  UNION ALL\\n  SELECT n + 1 FROM numbers WHERE n < 10\\n)\\nSELECT * FROM numbers;",
    acceptablePatterns: ['with recursive', 'union all', 'select n = 1', 'where n < 10'],
    explanation: 'Recursive CTE: Anchor (n=1) UNION ALL Recursive (n+1) with termination condition (n < 10).',
    schema: {},
    lectureRef: 'lecture-6.html#recursive-cte'
  },
  {
    id: 'l6q6',
    type: 'write_query',
    topic: 'Recursive CTE',
    difficulty: 'expert',
    question: 'Write a recursive CTE to display an employee hierarchy starting from manager_id IS NULL. Table: employee(emp_id, name, manager_id)',
    correctAnswer: "WITH RECURSIVE hierarchy AS (\\n  SELECT emp_id, name, manager_id, 0 AS level\\n  FROM employee WHERE manager_id IS NULL\\n  UNION ALL\\n  SELECT e.emp_id, e.name, e.manager_id, h.level + 1\\n  FROM employee e\\n  JOIN hierarchy h ON e.manager_id = h.emp_id\\n)\\nSELECT * FROM hierarchy;",
    acceptablePatterns: ['with recursive hierarchy', 'where manager_id is null', 'join hierarchy', 'level = 0'],
    explanation: 'Start with top-level employees (no manager), then recursively join to find subordinates.',
    schema: { employee: ['emp_id', 'name', 'manager_id'] },
    lectureRef: 'lecture-6.html#hierarchy-cte'
  },
  {
    id: 'l6q7',
    type: 'mcq',
    topic: 'Triggers',
    difficulty: 'easy',
    question: 'What is a database trigger?',
    options: [
      'A manual backup process',
      'A stored procedure that automatically executes when an event occurs',
      'A type of index',
      'A database user permission'
    ],
    correctAnswer: 1,
    explanation: 'A trigger is a database object that automatically executes a specified action when an INSERT, UPDATE, or DELETE event occurs on a table.',
    lectureRef: 'lecture-6.html#triggers'
  },
  {
    id: 'l6q8',
    type: 'mcq',
    topic: 'Trigger Timing',
    difficulty: 'medium',
    question: 'What is the difference between BEFORE and AFTER triggers?',
    options: [
      'BEFORE runs before the triggering statement; AFTER runs after',
      'BEFORE is faster',
      'AFTER can modify the data being inserted/updated',
      'There is no difference'
    ],
    correctAnswer: 0,
    explanation: 'BEFORE triggers fire before the data modification and can modify the values being inserted/updated. AFTER triggers fire after the change and can see the final state.',
    lectureRef: 'lecture-6.html#trigger-timing'
  },
  {
    id: 'l6q9',
    type: 'write_ddl',
    topic: 'Triggers',
    difficulty: 'hard',
    question: 'Create an AFTER INSERT trigger that logs new employee insertions to an audit table.',
    correctAnswer: "CREATE TRIGGER log_new_employee\\nAFTER INSERT ON employee\\nFOR EACH ROW\\nBEGIN\\n  INSERT INTO audit_log (action, table_name, record_id, timestamp)\\n  VALUES ('INSERT', 'employee', NEW.emp_id, NOW());\\nEND;",
    acceptablePatterns: ['create trigger', 'after insert on employee', 'for each row', 'new.emp_id'],
    explanation: 'Use NEW to reference the inserted row. AFTER triggers cannot modify the data but can access the final values.',
    schema: {
      employee: ['emp_id', 'name', 'salary'],
      audit_log: ['action', 'table_name', 'record_id', 'timestamp']
    },
    lectureRef: 'lecture-6.html#create-trigger'
  },
  {
    id: 'l6q10',
    type: 'mcq',
    topic: 'Trigger Variables',
    difficulty: 'hard',
    question: 'In a PostgreSQL trigger, what do OLD and NEW refer to?',
    options: [
      'OLD refers to the row before modification; NEW refers to the row after modification',
      'OLD is the previous trigger; NEW is the current trigger',
      'They are synonyms',
      'OLD is for DELETE; NEW is for all other operations'
    ],
    correctAnswer: 0,
    explanation: 'OLD contains row values before UPDATE/DELETE. NEW contains values after INSERT/UPDATE. INSERT has no OLD; DELETE has no NEW.',
    lectureRef: 'lecture-6.html#trigger-variables'
  },
  {
    id: 'l6q11',
    type: 'true_false',
    topic: 'Triggers',
    difficulty: 'medium',
    question: 'Triggers can be used to enforce complex business rules that cannot be expressed with constraints.',
    correctAnswer: true,
    explanation: 'Triggers can implement complex validation and business logic that goes beyond what CHECK constraints and foreign keys can enforce.',
    lectureRef: 'lecture-6.html#trigger-use-cases'
  },
  {
    id: 'l6q12',
    type: 'mcq',
    topic: 'Indexes',
    difficulty: 'easy',
    question: 'What is the primary purpose of a database index?',
    options: [
      'To store backup copies of data',
      'To speed up data retrieval operations',
      'To encrypt sensitive data',
      'To compress the database'
    ],
    correctAnswer: 1,
    explanation: 'Indexes improve the speed of data retrieval operations by providing quick access paths to data, similar to an index in a book.',
    lectureRef: 'lecture-6.html#indexes'
  },
  {
    id: 'l6q13',
    type: 'write_ddl',
    topic: 'Indexes',
    difficulty: 'easy',
    question: 'Create an index named "idx_emp_name" on the employee table for the last_name column.',
    correctAnswer: 'CREATE INDEX idx_emp_name ON employee(last_name);',
    acceptablePatterns: ['create index idx_emp_name', 'on employee(last_name'],
    explanation: 'Use CREATE INDEX index_name ON table(column) to create a standard B-tree index.',
    schema: { employee: ['emp_id', 'first_name', 'last_name', 'salary'] },
    lectureRef: 'lecture-6.html#create-index'
  },
  {
    id: 'l6q14',
    type: 'mcq',
    topic: 'Indexes',
    difficulty: 'medium',
    question: 'What is a trade-off of creating many indexes on a table?',
    options: [
      'Queries become slower',
      'INSERT, UPDATE, and DELETE operations become slower due to index maintenance',
      'Storage requirements decrease',
      'Database backups fail'
    ],
    correctAnswer: 1,
    explanation: 'While indexes speed up SELECT queries, they slow down write operations because the indexes must be updated with each data modification.',
    lectureRef: 'lecture-6.html#index-tradeoffs'
  },
  {
    id: 'l6q15',
    type: 'mcq',
    topic: 'Index Types',
    difficulty: 'medium',
    question: 'Which index type is best for columns with high cardinality (many unique values)?',
    options: [
      'Bitmap index',
      'B-tree index',
      'Hash index',
      'Full-text index'
    ],
    correctAnswer: 1,
    explanation: 'B-tree indexes are most efficient for columns with many unique values. Bitmap indexes are better for low cardinality columns.',
    lectureRef: 'lecture-6.html#index-types'
  },
  {
    id: 'l6q16',
    type: 'write_ddl',
    topic: 'Composite Index',
    difficulty: 'medium',
    question: 'Create a composite index on employee table for department_id and hire_date columns.',
    correctAnswer: 'CREATE INDEX idx_dept_date ON employee(department_id, hire_date);',
    acceptablePatterns: ['create index', 'on employee(department_id', 'hire_date'],
    explanation: 'Composite indexes cover multiple columns. Column order matters - put most selective columns first.',
    schema: { employee: ['emp_id', 'name', 'department_id', 'hire_date'] },
    lectureRef: 'lecture-6.html#composite-index'
  },
  {
    id: 'l6q17',
    type: 'mcq',
    topic: 'Covering Index',
    difficulty: 'hard',
    question: 'What is a covering index?',
    options: [
      'An index that covers all tables in the database',
      'An index that contains all columns needed for a query, avoiding table lookups',
      'An index that is encrypted',
      'An index that automatically updates statistics'
    ],
    correctAnswer: 1,
    explanation: 'A covering index includes all columns needed to satisfy a query. The DBMS can answer the query from the index alone without accessing the table.',
    lectureRef: 'lecture-6.html#covering-index'
  },
  {
    id: 'l6q18',
    type: 'match',
    topic: 'Stored Procedures vs Functions',
    difficulty: 'medium',
    question: 'Match the characteristic to Stored Procedure or Function:',
    items: [
      { left: 'Can return multiple result sets', right: 'Stored Procedure' },
      { left: 'Must return exactly one value', right: 'Function' },
      { left: 'Can be called in SELECT', right: 'Function' },
      { left: 'Can have output parameters', right: 'Stored Procedure' }
    ],
    explanation: 'Functions return single values and can be used in expressions. Procedures are more flexible but cannot be called in SELECT.',
    lectureRef: 'lecture-6.html#procedures-functions'
  }
];

// ==========================================
// LECTURE 7: Indexes & Relational Algebra (20 questions)
// ==========================================
questionBank.lecture7 = [
  {
    id: 'l7q1',
    type: 'mcq',
    topic: 'Clustered Index',
    difficulty: 'medium',
    question: 'What is a clustered index?',
    options: [
      'An index on multiple columns',
      'An index that determines the physical order of data in the table',
      'An index stored on a separate disk',
      'An encrypted index'
    ],
    correctAnswer: 1,
    explanation: 'A clustered index determines the physical storage order of table data. There can be only one clustered index per table.',
    lectureRef: 'lecture-7.html#clustered-index'
  },
  {
    id: 'l7q2',
    type: 'mcq',
    topic: 'Non-clustered Index',
    difficulty: 'medium',
    question: 'How many non-clustered indexes can a table have?',
    options: [
      'Only one',
      'Up to 16',
      'Many (limited by database)',
      'None'
    ],
    correctAnswer: 2,
    explanation: 'A table can have many non-clustered indexes. The limit depends on the specific database system but is typically high (e.g., 999 in SQL Server).',
    lectureRef: 'lecture-7.html#non-clustered-index'
  },
  {
    id: 'l7q3',
    type: 'true_false',
    topic: 'Clustered Index',
    difficulty: 'medium',
    question: 'A table can have multiple clustered indexes.',
    correctAnswer: false,
    explanation: 'A table can have only ONE clustered index because the data can only be physically ordered in one way.',
    lectureRef: 'lecture-7.html#clustered-index'
  },
  {
    id: 'l7q4',
    type: 'write_ddl',
    topic: 'Clustered Index',
    difficulty: 'medium',
    question: 'Create a clustered index on the employee table for emp_id (PostgreSQL syntax).',
    correctAnswer: 'CREATE UNIQUE INDEX idx_emp_pk ON employee(emp_id);\\n-- Or using primary key which creates clustered index:\\nALTER TABLE employee ADD PRIMARY KEY (emp_id);',
    acceptablePatterns: ['create.*index', 'on employee(emp_id', 'primary key'],
    explanation: 'In PostgreSQL, PRIMARY KEY automatically creates a clustered index. In some DBs, use CLUSTER command.',
    schema: { employee: ['emp_id', 'name', 'salary'] },
    lectureRef: 'lecture-7.html#create-clustered-index'
  },
  {
    id: 'l7q5',
    type: 'mcq',
    topic: 'Query Plans',
    difficulty: 'medium',
    question: 'What does the EXPLAIN command show?',
    options: [
      'Table structure',
      'The execution plan the database will use for a query',
      'Index statistics only',
      'User permissions'
    ],
    correctAnswer: 1,
    explanation: 'EXPLAIN shows the query execution plan - how the database will execute the query including index usage, join methods, and estimated costs.',
    lectureRef: 'lecture-7.html#explain'
  },
  {
    id: 'l7q6',
    type: 'fill_blank',
    topic: 'Relational Algebra',
    difficulty: 'easy',
    question: 'The Greek letter sigma (sigma) represents the ______ operator in Relational Algebra.',
    correctAnswer: 'selection',
    acceptableAnswers: ['selection', 'select', 'SELECT'],
    explanation: 'Sigma is the Selection operator, which filters rows based on a condition.',
    lectureRef: 'lecture-7.html#ra-operators'
  },
  {
    id: 'l7q7',
    type: 'fill_blank',
    topic: 'Relational Algebra',
    difficulty: 'easy',
    question: 'The Greek letter pi (pi) represents the ______ operator in Relational Algebra.',
    correctAnswer: 'projection',
    acceptableAnswers: ['projection', 'project', 'PROJECT'],
    explanation: 'Pi is the Projection operator, which selects specific columns from a relation.',
    lectureRef: 'lecture-7.html#ra-operators'
  },
  {
    id: 'l7q8',
    type: 'match',
    topic: 'Relational Algebra',
    difficulty: 'medium',
    question: 'Match the Relational Algebra operator to its SQL equivalent:',
    items: [
      { left: 'Sigma (sigma)', right: 'WHERE clause' },
      { left: 'Pi (pi)', right: 'SELECT columns' },
      { left: 'Bowtie', right: 'JOIN' },
      { left: 'Times', right: 'CROSS JOIN' },
      { left: 'Rho', right: 'Table aliasing' }
    ],
    explanation: 'Relational Algebra operators map directly to SQL clauses: sigma->WHERE, pi->SELECT, bowtie->JOIN, times->CROSS JOIN, rho->aliasing.',
    lectureRef: 'lecture-7.html#ra-sql-mapping'
  },
  {
    id: 'l7q9',
    type: 'mcq',
    topic: 'Selection vs Projection',
    difficulty: 'medium',
    question: 'What is the difference between Selection (sigma) and Projection (pi)?',
    options: [
      'Selection filters rows; Projection selects columns',
      'Selection selects columns; Projection filters rows',
      'They are the same',
      'Selection is faster'
    ],
    correctAnswer: 0,
    explanation: 'Selection (sigma) filters rows horizontally based on conditions. Projection (pi) selects specific columns vertically.',
    lectureRef: 'lecture-7.html#selection-projection'
  },
  {
    id: 'l7q10',
    type: 'write_query',
    topic: 'Relational Algebra to SQL',
    difficulty: 'medium',
    question: 'Convert to SQL: sigma(salary > 50000)(employee) - Selection of employees with salary > 50000.',
    correctAnswer: 'SELECT * FROM employee WHERE salary > 50000;',
    acceptablePatterns: ['select * from employee', 'where salary > 50000'],
    explanation: 'sigma(condition)(relation) translates to SELECT * FROM relation WHERE condition.',
    schema: { employee: ['emp_id', 'name', 'salary', 'dept_id'] },
    lectureRef: 'lecture-7.html#ra-to-sql'
  },
  {
    id: 'l7q11',
    type: 'write_query',
    topic: 'Relational Algebra to SQL',
    difficulty: 'medium',
    question: 'Convert to SQL: pi(name, salary)(employee) - Projection of name and salary columns.',
    correctAnswer: 'SELECT name, salary FROM employee;',
    acceptablePatterns: ['select name, salary from employee'],
    explanation: 'pi(column_list)(relation) translates to SELECT column_list FROM relation.',
    schema: { employee: ['emp_id', 'name', 'salary', 'dept_id'] },
    lectureRef: 'lecture-7.html#ra-to-sql'
  },
  {
    id: 'l7q12',
    type: 'mcq',
    topic: 'THETA JOIN',
    difficulty: 'medium',
    question: 'What is a THETA JOIN?',
    options: [
      'A join that only uses equality',
      'A join with any comparison condition (=, <, >, <=, >=, <>)',
      'A self-join only',
      'A join without any condition'
    ],
    correctAnswer: 1,
    explanation: 'THETA JOIN is a general join that uses any comparison operator. When the operator is =, it is specifically called EQUIJOIN.',
    lectureRef: 'lecture-7.html#theta-join'
  },
  {
    id: 'l7q13',
    type: 'mcq',
    topic: 'EQUIJOIN',
    difficulty: 'easy',
    question: 'What operator is used in an EQUIJOIN?',
    options: ['<', '>', '=', '<>'],
    correctAnswer: 2,
    explanation: 'EQUIJOIN is a THETA JOIN that specifically uses the equality operator (=) to match rows.',
    lectureRef: 'lecture-7.html#equijoin'
  },
  {
    id: 'l7q14',
    type: 'write_query',
    topic: 'THETA JOIN',
    difficulty: 'hard',
    question: 'Write a THETA JOIN query to find employees who earn more than their managers. Tables: employee(emp_id, name, salary, manager_id)',
    correctAnswer: "SELECT e.name AS employee, e.salary AS emp_salary,\\n       m.name AS manager, m.salary AS mgr_salary\\nFROM employee e\\nJOIN employee m ON e.manager_id = m.emp_id\\nWHERE e.salary > m.salary;",
    acceptablePatterns: ['join employee m', 'e.salary > m.salary', 'e.manager_id = m.emp_id'],
    explanation: 'THETA JOIN uses any comparison. Here we compare e.salary > m.salary (greater than).',
    schema: { employee: ['emp_id', 'name', 'salary', 'manager_id'] },
    lectureRef: 'lecture-7.html#theta-join-example'
  },
  {
    id: 'l7q15',
    type: 'mcq',
    topic: 'Query Trees',
    difficulty: 'medium',
    question: 'What is a query tree?',
    options: [
      'A physical storage structure',
      'A graphical representation of query operations and their order',
      'A type of B-tree index',
      'A database backup tree'
    ],
    correctAnswer: 1,
    explanation: 'A query tree represents relational algebra operations as nodes, showing the order of execution from leaves (tables) to root (final result).',
    lectureRef: 'lecture-7.html#query-trees'
  },
  {
    id: 'l7q16',
    type: 'draw_eerd',
    topic: 'Query Tree',
    difficulty: 'hard',
    question: 'Draw the query tree for: pi(name, dept_name)(sigma(salary > 50000)(employee bowtie department))',
    correctAnswer: 'query-tree-1',
    diagramType: 'query-tree',
    diagramData: {
      root: { operator: 'pi', columns: ['name', 'dept_name'] },
      level1: { operator: 'sigma', condition: 'salary > 50000' },
      level2: { operator: 'bowtie', joinCondition: 'dept_id' },
      leaves: ['employee', 'department']
    },
    explanation: 'Query tree structure: Root is Projection, then Selection, then Join, with tables as leaves. Execution goes bottom-up.',
    lectureRef: 'lecture-7.html#query-tree-example'
  },
  {
    id: 'l7q17',
    type: 'mcq',
    topic: 'Query Optimization',
    difficulty: 'hard',
    question: 'Which optimization pushes selection operations as close to the leaves as possible?',
    options: [
      'Join ordering',
      'Push-down of selections',
      'Projection elimination',
      'Index selection'
    ],
    correctAnswer: 1,
    explanation: 'Push-down (or push-through) of selections moves filter conditions early in the execution plan to reduce data processed by subsequent operations.',
    lectureRef: 'lecture-7.html#query-optimization'
  },
  {
    id: 'l7q18',
    type: 'mcq',
    topic: 'Query Optimization',
    difficulty: 'hard',
    question: 'Why does join order matter for query performance?',
    options: [
      'It affects the readability of the query',
      'Different orders can produce dramatically different intermediate result sizes',
      'It changes the final result',
      'Join order is automatically optimized so it does not matter'
    ],
    correctAnswer: 1,
    explanation: 'Join order affects intermediate result sizes. Joining smaller tables first typically reduces the amount of data processed in subsequent joins.',
    lectureRef: 'lecture-7.html#join-ordering'
  },
  {
    id: 'l7q19',
    type: 'true_false',
    topic: 'Query Optimization',
    difficulty: 'medium',
    question: 'The query optimizer always chooses the best possible execution plan.',
    correctAnswer: false,
    explanation: 'Query optimizers use cost estimates and heuristics, which may not always find the absolute best plan. Hints and manual tuning are sometimes needed.',
    lectureRef: 'lecture-7.html#optimizer-limitations'
  },
  {
    id: 'l7q20',
    type: 'fill_blank',
    topic: 'Relational Algebra',
    difficulty: 'easy',
    question: 'The bowtie symbol represents the ______ operator.',
    correctAnswer: 'JOIN',
    acceptableAnswers: ['JOIN', 'join', 'natural join', 'JOIN operator'],
    explanation: 'Bowtie is the JOIN operator in Relational Algebra.',
    lectureRef: 'lecture-7.html#ra-operators'
  }
];

// ==========================================
// LECTURE 8: EERD Modeling (25 questions)
// ==========================================
questionBank.lecture8 = [
  {
    id: 'l8q1',
    type: 'mcq',
    topic: 'EERD Basics',
    difficulty: 'easy',
    question: 'What does EERD stand for?',
    options: [
      'Extended Entity Relationship Diagram',
      'Enhanced Entity Relationship Diagram',
      'Electronic Entity Relationship Database',
      'External Entity Relation Diagram'
    ],
    correctAnswer: 1,
    explanation: 'EERD = Enhanced Entity-Relationship Diagram. It extends basic ERD with features like inheritance (subtypes/supertypes).',
    lectureRef: 'lecture-8.html#eerd-intro'
  },
  {
    id: 'l8q2',
    type: 'mcq',
    topic: 'Chen Notation',
    difficulty: 'easy',
    question: 'In Chen notation, what shape represents an entity?',
    options: ['Diamond', 'Rectangle', 'Oval', 'Line'],
    correctAnswer: 1,
    explanation: 'In Chen notation: Rectangle = Entity, Diamond = Relationship, Oval = Attribute, Line = Connection.',
    lectureRef: 'lecture-8.html#chen-notation'
  },
  {
    id: 'l8q3',
    type: 'mcq',
    topic: 'Chen Notation',
    difficulty: 'easy',
    question: 'In Chen notation, what shape represents a relationship?',
    options: ['Rectangle', 'Diamond', 'Oval', 'Double rectangle'],
    correctAnswer: 1,
    explanation: 'Chen notation uses a diamond shape to represent relationships between entities.',
    lectureRef: 'lecture-8.html#chen-notation'
  },
  {
    id: 'l8q4',
    type: 'mcq',
    topic: 'IE Notation',
    difficulty: 'medium',
    question: 'How are relationships shown in Information Engineering (IE) notation?',
    options: [
      'Diamonds with verbs',
      "Lines with cardinality symbols (crow's feet)",
      'Ovals connected to entities',
      'Dashed arrows'
    ],
    correctAnswer: 1,
    explanation: "IE (Crow's Foot) notation uses lines with cardinality indicators. The 'crow's foot' indicates 'many' side of a relationship.",
    lectureRef: 'lecture-8.html#ie-notation'
  },
  {
    id: 'l8q5',
    type: 'match',
    topic: 'Notations',
    difficulty: 'medium',
    question: 'Match the notation element to Chen vs IE notation:',
    items: [
      { left: 'Entity as Rectangle', right: 'Chen' },
      { left: "Crow's feet for cardinality", right: 'IE' },
      { left: 'Diamond for Relationship', right: 'Chen' },
      { left: 'Relationship as line with symbols', right: 'IE' }
    ],
    explanation: "Chen uses shapes for all elements. IE uses crow's feet notation on lines to show cardinality.",
    lectureRef: 'lecture-8.html#notation-comparison'
  },
  {
    id: 'l8q6',
    type: 'mcq',
    topic: 'Subtypes/Supertypes',
    difficulty: 'medium',
    question: 'What is a supertype/subtype relationship?',
    options: [
      'A relationship between two independent entities',
      'An inheritance hierarchy where subtypes inherit from a supertype',
      'A many-to-many relationship',
      'A relationship with attributes only'
    ],
    correctAnswer: 1,
    explanation: 'Supertype/subtype is an inheritance relationship. The supertype contains common attributes; subtypes inherit and add specific attributes.',
    lectureRef: 'lecture-8.html#subtypes'
  },
  {
    id: 'l8q7',
    type: 'draw_eerd',
    topic: 'Supertypes',
    difficulty: 'medium',
    question: 'Draw an EERD showing Employee as supertype with subtypes Salaried_Employee and Hourly_Employee.',
    correctAnswer: 'eer-subtype-1',
    diagramType: 'eer-chen',
    diagramData: {
      supertype: { name: 'Employee', attributes: ['emp_id', 'name', 'hire_date'] },
      subtypes: [
        { name: 'Salaried_Employee', attributes: ['salary', 'bonus'] },
        { name: 'Hourly_Employee', attributes: ['hourly_rate', 'hours_worked'] }
      ],
      constraint: 'exclusive'
    },
    explanation: 'Draw Employee as supertype with a circle (subtype discriminator). Connect to Salaried_Employee and Hourly_Employee with lines.',
    lectureRef: 'lecture-8.html#supertype-diagram'
  },
  {
    id: 'l8q8',
    type: 'mcq',
    topic: 'Exclusive vs Overlapping',
    difficulty: 'medium',
    question: 'What is the difference between exclusive and overlapping subtypes?',
    options: [
      'Exclusive means one subtype; overlapping means multiple supertypes',
      'Exclusive allows an entity to be only one subtype; overlapping allows multiple subtypes',
      'Exclusive is faster to query',
      'There is no difference'
    ],
    correctAnswer: 1,
    explanation: 'Exclusive (disjoint): An entity can be in exactly ONE subtype. Overlapping: An entity can be in MULTIPLE subtypes simultaneously.',
    lectureRef: 'lecture-8.html#exclusive-overlapping'
  },
  {
    id: 'l8q9',
    type: 'true_false',
    topic: 'Exclusive Constraint',
    difficulty: 'medium',
    question: 'In an exclusive subtype relationship, an instance can belong to multiple subtypes simultaneously.',
    correctAnswer: false,
    explanation: 'Exclusive (disjoint) means an instance can belong to ONLY ONE subtype. Use the "X" or "d" symbol in the circle.',
    lectureRef: 'lecture-8.html#exclusive-constraint'
  },
  {
    id: 'l8q10',
    type: 'mcq',
    topic: 'Is A Test',
    difficulty: 'easy',
    question: 'What is the "Is A" test for subtypes?',
    options: [
      'A performance test',
      'A subtype must pass the test: "Subtype IS A Supertype"',
      'A security check',
      'A data validation test'
    ],
    correctAnswer: 1,
    explanation: 'The "Is A" test verifies the relationship: "Hourly Employee IS AN Employee" - if this makes sense, the subtype is valid.',
    lectureRef: 'lecture-8.html#is-a-test'
  },
  {
    id: 'l8q11',
    type: 'fill_blank',
    topic: 'Is A Test',
    difficulty: 'easy',
    question: 'Complete: A Manager ______ an Employee.',
    correctAnswer: 'IS A',
    acceptableAnswers: ['is a', 'IS A', 'is a type of'],
    explanation: 'The "Is A" relationship confirms proper inheritance: Manager IS A (type of) Employee.',
    lectureRef: 'lecture-8.html#is-a-test'
  },
  {
    id: 'l8q12',
    type: 'mcq',
    topic: 'Attribute Inheritance',
    difficulty: 'medium',
    question: 'Do subtypes inherit attributes from their supertype?',
    options: [
      'No, each subtype defines all its own attributes',
      'Yes, subtypes inherit all supertype attributes',
      'Only key attributes are inherited',
      'Only if specified explicitly'
    ],
    correctAnswer: 1,
    explanation: 'Subtypes inherit ALL attributes from their supertype, including the key. They can also have their own specific attributes.',
    lectureRef: 'lecture-8.html#attribute-inheritance'
  },
  {
    id: 'l8q13',
    type: 'mcq',
    topic: 'Relationship Inheritance',
    difficulty: 'medium',
    question: 'Do subtypes inherit relationships from their supertype?',
    options: [
      'No, relationships must be redrawn for each subtype',
      'Yes, subtypes inherit all relationships of the supertype',
      'Only many-to-many relationships',
      'Only in exclusive subtypes'
    ],
    correctAnswer: 1,
    explanation: 'Subtypes inherit ALL relationships of the supertype. For example, if Employee works for Department, then Manager (subtype) also works for Department.',
    lectureRef: 'lecture-8.html#relationship-inheritance'
  },
  {
    id: 'l8q14',
    type: 'mcq',
    topic: 'Role Names',
    difficulty: 'medium',
    question: 'What are role names in an ERD?',
    options: [
      'Names of database users',
      'Labels that describe how an entity participates in a relationship',
      'Job titles in the organization',
      'Names of attributes'
    ],
    correctAnswer: 1,
    explanation: 'Role names describe the function of an entity in a relationship, especially useful in recursive relationships (e.g., Employee as "manager" vs "subordinate").',
    lectureRef: 'lecture-8.html#role-names'
  },
  {
    id: 'l8q15',
    type: 'draw_eerd',
    topic: 'Role Names',
    difficulty: 'medium',
    question: 'Draw a recursive relationship on Employee showing "manages" with role names "manager" and "subordinate".',
    correctAnswer: 'eer-roles-1',
    diagramType: 'eer-chen',
    diagramData: {
      entity: 'Employee',
      relationship: 'manages',
      roles: ['manager', 'subordinate'],
      cardinality: '1:N'
    },
    explanation: 'Draw Employee entity with a diamond relationship connecting back to itself. Label the lines with role names "manager" (1 side) and "subordinate" (N side).',
    lectureRef: 'lecture-8.html#recursive-roles'
  },
  {
    id: 'l8q16',
    type: 'mcq',
    topic: 'Weak Entities',
    difficulty: 'medium',
    question: 'What is a weak entity?',
    options: [
      'An entity with no attributes',
      'An entity that cannot be uniquely identified without a relationship to another entity',
      'An entity that is being deleted',
      'An entity with only one instance'
    ],
    correctAnswer: 1,
    explanation: 'A weak entity has no primary key of its own and depends on an identifying (owner) entity for uniqueness. Example: Dependent of an Employee.',
    lectureRef: 'lecture-8.html#weak-entities'
  },
  {
    id: 'l8q17',
    type: 'mcq',
    topic: 'Weak Entities',
    difficulty: 'medium',
    question: 'How is a weak entity represented in Chen notation?',
    options: [
      'Single rectangle',
      'Double rectangle',
      'Diamond',
      'Oval'
    ],
    correctAnswer: 1,
    explanation: 'Weak entities are represented with a double rectangle (or double-lined rectangle) in Chen notation.',
    lectureRef: 'lecture-8.html#weak-entity-notation'
  },
  {
    id: 'l8q18',
    type: 'mcq',
    topic: 'Identifying Relationship',
    difficulty: 'medium',
    question: 'What is an identifying relationship?',
    options: [
      'Any relationship between two entities',
      "A relationship where the weak entity's partial key is combined with the owner's key",
      'A relationship with no attributes',
      'A one-to-one relationship only'
    ],
    correctAnswer: 1,
    explanation: "An identifying relationship connects a weak entity to its owner. The weak entity's partial key + owner's primary key = full identifier.",
    lectureRef: 'lecture-8.html#identifying-relationship'
  },
  {
    id: 'l8q19',
    type: 'draw_eerd',
    topic: 'Weak Entity',
    difficulty: 'hard',
    question: 'Draw an EERD showing Employee (owner) and Dependent (weak entity) with identifying relationship.',
    correctAnswer: 'eer-weak-1',
    diagramType: 'eer-chen',
    diagramData: {
      owner: { name: 'Employee', type: 'strong', attributes: ['emp_id', 'name'] },
      weak: { name: 'Dependent', attributes: ['dependent_name', 'relationship', 'birth_date'], partialKey: 'dependent_name' },
      relationship: 'has',
      cardinality: '1:N'
    },
    explanation: 'Draw Employee as single rectangle, Dependent as double rectangle. Connect with identifying relationship (double diamond). Partial key is underlined with dashed line.',
    lectureRef: 'lecture-8.html#weak-entity-example'
  },
  {
    id: 'l8q20',
    type: 'match',
    topic: 'Cardinality',
    difficulty: 'medium',
    question: 'Match the cardinality to its meaning:',
    items: [
      { left: '1:1', right: 'One entity instance relates to exactly one other' },
      { left: '1:N', right: 'One entity instance relates to many others' },
      { left: 'M:N', right: 'Many on both sides - needs junction table' },
      { left: '0..1', right: 'Optional participation (zero or one)' }
    ],
    explanation: 'Cardinality defines how many instances of one entity can relate to instances of another entity.',
    lectureRef: 'lecture-8.html#cardinality'
  },
  {
    id: 'l8q21',
    type: 'mcq',
    topic: 'Participation',
    difficulty: 'medium',
    question: 'What does double line (in Chen notation) or solid circle (in IE) indicate?',
    options: [
      'Optional participation',
      'Total (mandatory) participation',
      'Many cardinality',
      'Weak entity'
    ],
    correctAnswer: 1,
    explanation: 'Double line (Chen) or solid circle (IE) indicates total participation - every entity instance MUST participate in the relationship.',
    lectureRef: 'lecture-8.html#participation'
  },
  {
    id: 'l8q22',
    type: 'mcq',
    topic: 'Partial Key',
    difficulty: 'medium',
    question: 'What is a partial key in a weak entity?',
    options: [
      'A key that is not used',
      'An attribute that uniquely identifies weak entity instances within an owner entity instance',
      'A key that is NULL',
      'A foreign key only'
    ],
    correctAnswer: 1,
    explanation: "A partial key (discriminator) distinguishes weak entity instances belonging to the same owner. Combined with owner's key, it forms the full identifier.",
    lectureRef: 'lecture-8.html#partial-key'
  },
  {
    id: 'l8q23',
    type: 'draw_eerd',
    topic: 'Complete EERD',
    difficulty: 'expert',
    question: 'Draw a complete EERD for a university: Person (supertype) with Student and Professor (subtypes). Student enrolls in Courses (M:N). Professor advises Students (1:N).',
    correctAnswer: 'eer-university-1',
    diagramType: 'eer-chen',
    diagramData: {
      supertypes: [
        {
          name: 'Person',
          attributes: ['person_id', 'name', 'email'],
          subtypes: [
            { name: 'Student', attributes: ['student_id', 'major', 'gpa'] },
            { name: 'Professor', attributes: ['professor_id', 'department', 'tenure'] }
          ]
        }
      ],
      entities: [
        { name: 'Course', attributes: ['course_id', 'title', 'credits'] }
      ],
      relationships: [
        { name: 'enrolls', entities: ['Student', 'Course'], cardinality: 'M:N' },
        { name: 'advises', entities: ['Professor', 'Student'], cardinality: '1:N' }
      ]
    },
    explanation: 'Show Person as supertype with Student and Professor as subtypes. Add enrollment relationship (M:N between Student and Course) and advising relationship (1:N from Professor to Student).',
    lectureRef: 'lecture-8.html#complete-eerd'
  },
  {
    id: 'l8q24',
    type: 'true_false',
    topic: 'Subtype Completeness',
    difficulty: 'medium',
    question: 'In a complete (total) specialization, every supertype instance must be a member of at least one subtype.',
    correctAnswer: true,
    explanation: 'Total specialization (double line on supertype) means every supertype instance MUST belong to at least one subtype. Partial specialization allows instances with no subtype.',
    lectureRef: 'lecture-8.html#completeness-constraint'
  },
  {
    id: 'l8q25',
    type: 'mcq',
    topic: 'Discriminator',
    difficulty: 'hard',
    question: 'What is a discriminator attribute in supertype/subtype hierarchies?',
    options: [
      'An attribute that determines which subtype an instance belongs to',
      'An attribute used for sorting',
      'A security attribute',
      'A calculated field'
    ],
    correctAnswer: 0,
    explanation: "A discriminator attribute indicates which subtype an instance belongs to (e.g., employee_type: 'S' for Salaried, 'H' for Hourly).",
    lectureRef: 'lecture-8.html#discriminator'
  }
];

// ==========================================
// LECTURE 9: 8-Step Transformation (18 questions)
// ==========================================
questionBank.lecture9 = [
  {
    id: 'l9q1',
    type: 'mcq',
    topic: '8-Step Overview',
    difficulty: 'easy',
    question: 'What is the purpose of the 8-Step Transformation process?',
    options: [
      'To create an EERD from a database',
      'To convert an EERD into relational tables',
      'To optimize SQL queries',
      'To create database indexes'
    ],
    correctAnswer: 1,
    explanation: 'The 8-Step Transformation converts an Enhanced Entity-Relationship Diagram (EERD) into a set of relational database tables.',
    lectureRef: 'lecture-9.html#8-step-overview'
  },
  {
    id: 'l9q2',
    type: 'match',
    topic: '8-Step Overview',
    difficulty: 'medium',
    question: 'Match the 8-Step Transformation step number to its name:',
    items: [
      { left: 'Step 1', right: 'Map Regular Entities' },
      { left: 'Step 2', right: 'Map Weak Entities' },
      { left: 'Step 5', right: 'Map M:N Relationships' },
      { left: 'Step 8', right: 'Transform Superclass Structures' }
    ],
    explanation: 'The 8 steps are: (1) Regular entities, (2) Weak entities, (3) 1:1 relationships, (4) 1:N relationships, (5) M:N relationships, (6) Multi-valued attributes, (7) N-ary relationships, (8) Superclass structures.',
    lectureRef: 'lecture-9.html#8-steps'
  },
  {
    id: 'l9q3',
    type: 'write_ddl',
    topic: 'Step 1: Regular Entities',
    difficulty: 'easy',
    question: 'Apply Step 1: Create the table for Employee entity with emp_id (PK), first_name, last_name, hire_date.',
    correctAnswer: "CREATE TABLE employee (\\n  emp_id INT PRIMARY KEY,\\n  first_name VARCHAR(50),\\n  last_name VARCHAR(50),\\n  hire_date DATE\\n);",
    acceptablePatterns: ['create table employee', 'emp_id.*primary key', 'varchar', 'date'],
    explanation: 'Step 1: Each regular entity becomes a table. The entity key becomes the primary key. Simple attributes become columns.',
    schema: {},
    lectureRef: 'lecture-9.html#step1'
  },
  {
    id: 'l9q4',
    type: 'write_ddl',
    topic: 'Step 2: Weak Entities',
    difficulty: 'medium',
    question: 'Apply Step 2: Create the Dependent table (weak entity of Employee). Dependent has dependent_name (partial key), birth_date, and relationship.',
    correctAnswer: "CREATE TABLE dependent (\\n  emp_id INT,\\n  dependent_name VARCHAR(50),\\n  birth_date DATE,\\n  relationship VARCHAR(20),\\n  PRIMARY KEY (emp_id, dependent_name),\\n  FOREIGN KEY (emp_id) REFERENCES employee(emp_id)\\n);",
    acceptablePatterns: ['create table dependent', 'primary key (emp_id', 'foreign key.*employee', 'emp_id.*dependent_name'],
    explanation: 'Step 2: Weak entities become tables. PK = owner PK + partial key. Include FK to owner entity.',
    schema: {},
    lectureRef: 'lecture-9.html#step2'
  },
  {
    id: 'l9q5',
    type: 'mcq',
    topic: 'Step 3: 1:1 Relationships',
    difficulty: 'medium',
    question: 'What are the three approaches for handling 1:1 relationships?',
    options: [
      'Merge, Split, Ignore',
      'Foreign Key approach, Merged relation, Cross-reference table',
      'Left join, Right join, Inner join',
      'Primary key, Foreign key, Composite key'
    ],
    correctAnswer: 1,
    explanation: '1:1 approaches: (1) Foreign Key - add PK of one side as FK to other, (2) Merged - combine into one table, (3) Cross-reference - separate table with both PKs.',
    lectureRef: 'lecture-9.html#step3'
  },
  {
    id: 'l9q6',
    type: 'write_ddl',
    topic: 'Step 3: 1:1 FK Approach',
    difficulty: 'medium',
    question: 'Apply Step 3: Employee and Parking_Space have a 1:1 relationship. Employee has emp_id (PK). Add the FK to implement this.',
    correctAnswer: "CREATE TABLE parking_space (\\n  space_id INT PRIMARY KEY,\\n  location VARCHAR(50),\\n  emp_id INT UNIQUE,\\n  FOREIGN KEY (emp_id) REFERENCES employee(emp_id)\\n);",
    acceptablePatterns: ['create table parking_space', 'emp_id int unique', 'foreign key.*employee'],
    explanation: 'Step 3 (FK approach): Add the PK of one entity as FK to the other. Use UNIQUE constraint to enforce 1:1 (prevent multiple assignments).',
    schema: {},
    lectureRef: 'lecture-9.html#step3-fk'
  },
  {
    id: 'l9q7',
    type: 'mcq',
    topic: 'Step 4: 1:N Relationships',
    difficulty: 'easy',
    question: 'How are 1:N relationships implemented in Step 4?',
    options: [
      'Create a junction table',
      'Add the 1-side PK as FK on the N-side',
      'Merge both entities',
      'Add both PKs to a separate table'
    ],
    correctAnswer: 1,
    explanation: 'Step 4: For 1:N relationships, add the primary key of the "1" side as a foreign key on the "N" side table.',
    lectureRef: 'lecture-9.html#step4'
  },
  {
    id: 'l9q8',
    type: 'write_ddl',
    topic: 'Step 4: 1:N Relationship',
    difficulty: 'easy',
    question: 'Apply Step 4: Department (dept_id PK) has many Employees. Employee has emp_id (PK), name. Add the FK relationship.',
    correctAnswer: "CREATE TABLE employee (\\n  emp_id INT PRIMARY KEY,\\n  name VARCHAR(50),\\n  dept_id INT,\\n  FOREIGN KEY (dept_id) REFERENCES department(dept_id)\\n);",
    acceptablePatterns: ['create table employee', 'dept_id int', 'foreign key.*department'],
    explanation: 'Step 4: Add dept_id as FK to employee table (the N side). The 1 side (Department) does not need modification.',
    schema: { department: ['dept_id', 'dept_name'] },
    lectureRef: 'lecture-9.html#step4'
  },
  {
    id: 'l9q9',
    type: 'mcq',
    topic: 'Step 5: M:N Relationships',
    difficulty: 'easy',
    question: 'How are M:N relationships implemented in Step 5?',
    options: [
      'Add FK to one of the entities',
      'Create a junction (associative) table with FKs to both entities',
      'Merge both entities into one',
      'Cannot be implemented'
    ],
    correctAnswer: 1,
    explanation: 'Step 5: M:N relationships require a junction table containing FKs to both entities. The PK of the junction table is typically the combination of both FKs.',
    lectureRef: 'lecture-9.html#step5'
  },
  {
    id: 'l9q10',
    type: 'write_ddl',
    topic: 'Step 5: M:N Relationship',
    difficulty: 'medium',
    question: 'Apply Step 5: Student and Course have an M:N enrollment relationship. Create the junction table with enrollment_date attribute.',
    correctAnswer: "CREATE TABLE enrollment (\\n  student_id INT,\\n  course_id INT,\\n  enrollment_date DATE,\\n  PRIMARY KEY (student_id, course_id),\\n  FOREIGN KEY (student_id) REFERENCES student(student_id),\\n  FOREIGN KEY (course_id) REFERENCES course(course_id)\\n);",
    acceptablePatterns: ['create table enrollment', 'student_id.*course_id', 'primary key.*student_id', 'foreign key'],
    explanation: 'Step 5: Create junction table with FKs to both entities. PK is composite of both FKs. Relationship attributes become columns in the junction table.',
    schema: {
      student: ['student_id', 'name'],
      course: ['course_id', 'title']
    },
    lectureRef: 'lecture-9.html#step5'
  },
  {
    id: 'l9q11',
    type: 'mcq',
    topic: 'Step 6: Multi-valued Attributes',
    difficulty: 'medium',
    question: 'How are multi-valued attributes handled in Step 6?',
    options: [
      'Store as comma-separated values',
      'Create a separate table with the entity PK + the multi-valued attribute',
      'Add multiple columns to the entity table',
      'Ignore them'
    ],
    correctAnswer: 1,
    explanation: 'Step 6: Multi-valued attributes become a separate table with: (1) FK to the owner entity, (2) the multi-valued attribute. The PK is the combination.',
    lectureRef: 'lecture-9.html#step6'
  },
  {
    id: 'l9q12',
    type: 'write_ddl',
    topic: 'Step 6: Multi-valued Attribute',
    difficulty: 'medium',
    question: 'Apply Step 6: Employee has a multi-valued attribute phone_number. Create the table to store this.',
    correctAnswer: "CREATE TABLE employee_phone (\\n  emp_id INT,\\n  phone_number VARCHAR(15),\\n  PRIMARY KEY (emp_id, phone_number),\\n  FOREIGN KEY (emp_id) REFERENCES employee(emp_id)\\n);",
    acceptablePatterns: ['create table employee_phone', 'emp_id.*phone_number', 'primary key'],
    explanation: 'Step 6: Create a table for the multi-valued attribute. PK = entity PK + attribute value. Include FK to parent entity.',
    schema: { employee: ['emp_id', 'name'] },
    lectureRef: 'lecture-9.html#step6'
  },
  {
    id: 'l9q13',
    type: 'mcq',
    topic: 'Step 7: N-ary Relationships',
    difficulty: 'hard',
    question: 'How are N-ary relationships (3+ entities) handled in Step 7?',
    options: [
      'Create binary relationships between each pair',
      'Create a table with FKs to all participating entities',
      'Add FKs to one entity only',
      'They cannot be represented'
    ],
    correctAnswer: 1,
    explanation: 'Step 7: N-ary relationships become a table with foreign keys to ALL participating entities. The PK is the combination of all FKs.',
    lectureRef: 'lecture-9.html#step7'
  },
  {
    id: 'l9q14',
    type: 'write_ddl',
    topic: 'Step 7: Ternary Relationship',
    difficulty: 'hard',
    question: 'Apply Step 7: A ternary relationship "supplies" connects Supplier, Part, and Project. Create the table.',
    correctAnswer: "CREATE TABLE supplies (\\n  supplier_id INT,\\n  part_id INT,\\n  project_id INT,\\n  quantity INT,\\n  PRIMARY KEY (supplier_id, part_id, project_id),\\n  FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id),\\n  FOREIGN KEY (part_id) REFERENCES part(part_id),\\n  FOREIGN KEY (project_id) REFERENCES project(project_id)\\n);",
    acceptablePatterns: ['create table supplies', 'supplier_id.*part_id.*project_id', 'primary key.*supplier_id'],
    explanation: 'Step 7: N-ary relationships require a table with FKs to all N entities. The PK is the composite of all FKs.',
    schema: {
      supplier: ['supplier_id', 'name'],
      part: ['part_id', 'description'],
      project: ['project_id', 'title']
    },
    lectureRef: 'lecture-9.html#step7'
  },
  {
    id: 'l9q15',
    type: 'mcq',
    topic: 'Step 8: Superclass Transformation',
    difficulty: 'medium',
    question: 'What are the options for transforming superclass structures in Step 8?',
    options: [
      'Only one option: Create separate tables for each subtype',
      'Three options: One table for all, Separate tables for each, or One table per subtype with FK',
      'Only merge all into one table',
      'Cannot transform superclass structures'
    ],
    correctAnswer: 1,
    explanation: 'Step 8 options: (1) One table for superclass + all subtypes (with type discriminator), (2) Separate tables for each subtype only, (3) One table per subtype with FK to superclass.',
    lectureRef: 'lecture-9.html#step8'
  },
  {
    id: 'l9q16',
    type: 'write_ddl',
    topic: 'Step 8: One Table Approach',
    difficulty: 'medium',
    question: 'Apply Step 8 (One Table approach): Employee supertype with Salaried and Hourly subtypes. Create one table with all attributes and a type discriminator.',
    correctAnswer: "CREATE TABLE employee (\\n  emp_id INT PRIMARY KEY,\\n  name VARCHAR(50),\\n  hire_date DATE,\\n  emp_type CHAR(1), -- 'S' for Salaried, 'H' for Hourly\\n  salary DECIMAL(10,2),  -- NULL for hourly\\n  hourly_rate DECIMAL(8,2),  -- NULL for salaried\\n  CHECK (\\n    (emp_type = 'S' AND salary IS NOT NULL AND hourly_rate IS NULL) OR\\n    (emp_type = 'H' AND salary IS NULL AND hourly_rate IS NOT NULL)\\n  )\\n);",
    acceptablePatterns: ['create table employee', 'emp_type', 'salary', 'hourly_rate', 'check'],
    explanation: 'Step 8 (Option 1): Single table with all attributes from supertype and all subtypes. Use type discriminator and CHECK constraints to ensure data integrity.',
    schema: {},
    lectureRef: 'lecture-9.html#step8-one-table'
  },
  {
    id: 'l9q17',
    type: 'write_ddl',
    topic: 'Step 8: Separate Tables Approach',
    difficulty: 'medium',
    question: 'Apply Step 8 (Separate Tables approach): Create tables for Salaried_Employee and Hourly_Employee with no supertype table.',
    correctAnswer: "CREATE TABLE salaried_employee (\\n  emp_id INT PRIMARY KEY,\\n  name VARCHAR(50),\\n  hire_date DATE,\\n  salary DECIMAL(10,2),\\n  bonus DECIMAL(10,2)\\n);\\n\\nCREATE TABLE hourly_employee (\\n  emp_id INT PRIMARY KEY,\\n  name VARCHAR(50),\\n  hire_date DATE,\\n  hourly_rate DECIMAL(8,2),\\n  hours_worked DECIMAL(6,2)\\n);",
    acceptablePatterns: ['create table salaried_employee', 'create table hourly_employee', 'emp_id.*primary key'],
    explanation: 'Step 8 (Option 2): Create separate tables for each subtype, each containing all attributes (inherited + specific). Good for disjoint subtypes.',
    schema: {},
    lectureRef: 'lecture-9.html#step8-separate-tables'
  },
  {
    id: 'l9q18',
    type: 'match',
    topic: 'Step 8: Approach Selection',
    difficulty: 'hard',
    question: 'Match the scenario to the best Step 8 approach:',
    items: [
      { left: 'Subtypes are mutually exclusive with few differences', right: 'One table with discriminator' },
      { left: 'Subtypes have many unique attributes', right: 'Separate tables for each subtype' },
      { left: 'Need to query all employees frequently', right: 'One table with discriminator' },
      { left: 'Need subtype-specific constraints', right: 'Separate tables for each subtype' }
    ],
    explanation: 'Choose approach based on: query patterns (one table for unified queries), subtype differences (separate tables for very different subtypes), and constraint requirements.',
    lectureRef: 'lecture-9.html#step8-selection'
  }
];

// ==========================================
// COMPREHENSIVE: Mixed Questions (30 questions)
// ==========================================
questionBank.comprehensive = [
  {
    id: 'comp1',
    type: 'mcq',
    topic: 'SQL Categories',
    difficulty: 'easy',
    question: 'Which of the following is NOT a DML command?',
    options: ['SELECT', 'INSERT', 'CREATE', 'DELETE'],
    correctAnswer: 2,
    explanation: 'CREATE is a DDL (Data Definition Language) command. SELECT, INSERT, and DELETE are DML commands.',
    lectureRef: 'lecture-2.html#sql-categories'
  },
  {
    id: 'comp2',
    type: 'write_query',
    topic: 'Complex Query',
    difficulty: 'hard',
    question: 'Write a query to find the top 3 departments by average salary, excluding departments with fewer than 5 employees.',
    correctAnswer: "SELECT dept_id, AVG(salary) AS avg_salary, COUNT(*) AS emp_count\\nFROM employee\\nGROUP BY dept_id\\nHAVING COUNT(*) >= 5\\nORDER BY avg_salary DESC\\nLIMIT 3;",
    acceptablePatterns: ['group by dept_id', 'having count', 'order by.*avg_salary desc', 'limit 3'],
    explanation: 'Use GROUP BY, HAVING to filter groups, ORDER BY with aggregate, and LIMIT to get top N.',
    schema: { employee: ['emp_id', 'name', 'salary', 'dept_id'] },
    lectureRef: 'lecture-3.html#complex-aggregates'
  },
  {
    id: 'comp3',
    type: 'mcq',
    topic: 'ACID Properties',
    difficulty: 'medium',
    question: 'Which ACID property ensures that a completed transaction survives system failures?',
    options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
    correctAnswer: 3,
    explanation: 'Durability ensures that once a transaction is committed, its changes are permanent and survive any subsequent failures.',
    lectureRef: 'lecture-5.html#acid'
  },
  {
    id: 'comp4',
    type: 'write_query',
    topic: 'CTE',
    difficulty: 'hard',
    question: 'Write a query using CTE to find employees who earn above their department average.',
    correctAnswer: "WITH dept_avg AS (\\n  SELECT dept_id, AVG(salary) AS avg_sal\\n  FROM employee\\n  GROUP BY dept_id\\n)\\nSELECT e.name, e.salary, d.dept_id, d.avg_sal\\nFROM employee e\\nJOIN dept_avg d ON e.dept_id = d.dept_id\\nWHERE e.salary > d.avg_sal;",
    acceptablePatterns: ['with dept_avg', 'avg(salary)', 'join dept_avg', 'where e.salary >'],
    explanation: 'Use CTE to calculate department averages, then join back to compare individual salaries.',
    schema: { employee: ['emp_id', 'name', 'salary', 'dept_id'] },
    lectureRef: 'lecture-6.html#cte'
  },
  {
    id: 'comp5',
    type: 'mcq',
    topic: 'Relational Algebra',
    difficulty: 'medium',
    question: 'Which Relational Algebra operation corresponds to SQL JOIN?',
    options: ['Sigma', 'Pi', 'Bowtie', 'Times'],
    correctAnswer: 2,
    explanation: 'Bowtie (natural join) is the Relational Algebra operator that corresponds to SQL JOIN.',
    lectureRef: 'lecture-7.html#ra-operators'
  },
  {
    id: 'comp6',
    type: 'draw_eerd',
    topic: 'EERD Design',
    difficulty: 'hard',
    question: 'Draw an EERD for: Company has Departments. Department employs Employees (1:N). Employee has Dependents (weak entity, 1:N).',
    correctAnswer: 'comp-eerd-1',
    diagramType: 'eer-chen',
    diagramData: {
      entities: [
        { name: 'Company', attributes: ['company_id', 'name'], type: 'strong' },
        { name: 'Department', attributes: ['dept_id', 'dept_name'], type: 'strong' },
        { name: 'Employee', attributes: ['emp_id', 'name'], type: 'strong' },
        { name: 'Dependent', attributes: ['dependent_name', 'birth_date'], type: 'weak', partialKey: 'dependent_name' }
      ],
      relationships: [
        { name: 'has', entities: ['Company', 'Department'], cardinality: '1:N' },
        { name: 'employs', entities: ['Department', 'Employee'], cardinality: '1:N' },
        { name: 'has_dependent', entities: ['Employee', 'Dependent'], cardinality: '1:N', identifying: true }
      ]
    },
    explanation: 'Show Company->Department (1:N), Department->Employee (1:N), and Employee->Dependent (1:N identifying relationship with weak entity).',
    lectureRef: 'lecture-8.html#complete-eerd'
  },
  {
    id: 'comp7',
    type: 'write_ddl',
    topic: '8-Step Transformation',
    difficulty: 'expert',
    question: 'Apply the 8-Step Transformation to create all tables for: Employee(emp_id, name), Project(proj_id, title), and M:N works_on relationship with hours attribute.',
    correctAnswer: "CREATE TABLE employee (\\n  emp_id INT PRIMARY KEY,\\n  name VARCHAR(50)\\n);\\n\\nCREATE TABLE project (\\n  proj_id INT PRIMARY KEY,\\n  title VARCHAR(100)\\n);\\n\\nCREATE TABLE works_on (\\n  emp_id INT,\\n  proj_id INT,\\n  hours DECIMAL(5,2),\\n  PRIMARY KEY (emp_id, proj_id),\\n  FOREIGN KEY (emp_id) REFERENCES employee(emp_id),\\n  FOREIGN KEY (proj_id) REFERENCES project(proj_id)\\n);",
    acceptablePatterns: ['create table employee', 'create table project', 'create table works_on', 'primary key.*emp_id.*proj_id'],
    explanation: 'Step 1: Regular entities become tables. Step 5: M:N relationship becomes junction table with FKs and relationship attributes.',
    schema: {},
    lectureRef: 'lecture-9.html#8-step-complete'
  },
  {
    id: 'comp8',
    type: 'mcq',
    topic: 'Views',
    difficulty: 'medium',
    question: 'Which statement about views is TRUE?',
    options: [
      'Views store a physical copy of data',
      'Views cannot include JOINs',
      'Views can simplify complex queries and provide security',
      'Views are only available in PostgreSQL'
    ],
    correctAnswer: 2,
    explanation: 'Views are virtual tables that can simplify complex queries, provide an abstraction layer, and restrict access to specific columns/rows for security.',
    lectureRef: 'lecture-4.html#views'
  },
  {
    id: 'comp9',
    type: 'write_query',
    topic: 'Correlated Subquery',
    difficulty: 'hard',
    question: 'Write a correlated subquery to find employees who earn more than the average salary in their department.',
    correctAnswer: "SELECT e.name, e.salary, e.dept_id\\nFROM employee e\\nWHERE e.salary > (\\n  SELECT AVG(salary) \\n  FROM employee \\n  WHERE dept_id = e.dept_id\\n);",
    acceptablePatterns: ['where e.salary >', 'select avg(salary)', 'where dept_id = e.dept_id'],
    explanation: 'The subquery references e.dept_id from the outer query, making it correlated. It executes once per employee.',
    schema: { employee: ['emp_id', 'name', 'salary', 'dept_id'] },
    lectureRef: 'lecture-3.html#correlated-subquery'
  },
  {
    id: 'comp10',
    type: 'mcq',
    topic: 'Indexes',
    difficulty: 'medium',
    question: 'When would a composite index (A, B) be more efficient than separate indexes on A and B?',
    options: [
      'When querying on A alone',
      'When querying on both A and B together',
      'When inserting data frequently',
      'When columns A and B are rarely used'
    ],
    correctAnswer: 1,
    explanation: 'A composite index on (A, B) is most efficient when queries filter on both columns together. It can also be used for queries on A alone (leftmost prefix).',
    lectureRef: 'lecture-6.html#composite-index'
  },
  {
    id: 'comp11',
    type: 'true_false',
    topic: 'Transaction Isolation',
    difficulty: 'hard',
    question: 'Higher transaction isolation levels provide better data consistency but may reduce concurrency.',
    correctAnswer: true,
    explanation: 'Higher isolation levels (Serializable) prevent more anomalies but require more locking, which can reduce concurrent transaction throughput.',
    lectureRef: 'lecture-5.html#isolation-levels'
  },
  {
    id: 'comp12',
    type: 'write_dml',
    topic: 'UPDATE with JOIN',
    difficulty: 'hard',
    question: 'Write an UPDATE statement to increase salaries by 10% for employees in the "Sales" department.',
    correctAnswer: "UPDATE employee\\nSET salary = salary * 1.10\\nWHERE dept_id IN (\\n  SELECT dept_id FROM department WHERE dept_name = 'Sales'\\n);",
    acceptablePatterns: ['update employee', 'set salary = salary', 'where dept_id in', "'Sales'"],
    explanation: 'Use a subquery in the WHERE clause to identify which employees to update based on department name.',
    schema: {
      employee: ['emp_id', 'name', 'salary', 'dept_id'],
      department: ['dept_id', 'dept_name']
    },
    lectureRef: 'lecture-3.html#update-with-subquery'
  },
  {
    id: 'comp13',
    type: 'mcq',
    topic: 'Query Optimization',
    difficulty: 'hard',
    question: 'What is the "push-down" optimization in query processing?',
    options: [
      'Pushing data to the client earlier',
      'Moving selection operations closer to the data sources (leaves)',
      'Delaying joins until the end',
      'Removing indexes'
    ],
    correctAnswer: 1,
    explanation: 'Push-down optimization moves filter operations (selections) as early as possible in the query plan to reduce data processed by subsequent operations.',
    lectureRef: 'lecture-7.html#query-optimization'
  },
  {
    id: 'comp14',
    type: 'match',
    topic: 'Database Concepts',
    difficulty: 'medium',
    question: 'Match the concept to its description:',
    items: [
      { left: 'Clustered Index', right: 'Determines physical data order' },
      { left: 'Materialized View', right: 'Stores query results physically' },
      { left: 'Trigger', right: 'Auto-executes on data changes' },
      { left: 'CTE', right: 'Named temporary result set' }
    ],
    explanation: 'These are key database concepts: Clustered Index (physical order), Materialized View (cached results), Trigger (auto-execution), CTE (query organization).',
    lectureRef: 'comprehensive'
  },
  {
    id: 'comp15',
    type: 'write_query',
    topic: 'UNION with Conditions',
    difficulty: 'hard',
    question: 'Write a query to get all products from both local and imported tables, tagging each with its source, and sort by price.',
    correctAnswer: "SELECT product_id, name, price, 'Local' AS source\\nFROM local_products\\nUNION ALL\\nSELECT product_id, name, price, 'Imported' AS source\\nFROM imported_products\\nORDER BY price;",
    acceptablePatterns: ['union all', "'Local' as source", "'Imported' as source", 'order by price'],
    explanation: 'Add a constant column to identify the source. Use UNION ALL to preserve all rows. ORDER BY applies to the combined result.',
    schema: {
      local_products: ['product_id', 'name', 'price'],
      imported_products: ['product_id', 'name', 'price']
    },
    lectureRef: 'lecture-4.html#union'
  },
  {
    id: 'comp16',
    type: 'mcq',
    topic: 'EERD Constraints',
    difficulty: 'medium',
    question: 'What constraint ensures every supertype instance belongs to at least one subtype?',
    options: [
      'Disjoint constraint',
      'Total specialization constraint',
      'Partial specialization constraint',
      'Overlap constraint'
    ],
    correctAnswer: 1,
    explanation: 'Total specialization (double line on supertype) requires every supertype instance to be a member of at least one subtype.',
    lectureRef: 'lecture-8.html#total-specialization'
  },
  {
    id: 'comp17',
    type: 'write_ddl',
    topic: 'Complete Schema',
    difficulty: 'expert',
    question: 'Create a complete schema for a library system: Book(book_id, title, author), Member(member_id, name), and Loan(loan_id, book_id, member_id, loan_date, return_date). Include all PKs and FKs.',
    correctAnswer: "CREATE TABLE book (\\n  book_id INT PRIMARY KEY,\\n  title VARCHAR(200),\\n  author VARCHAR(100)\\n);\\n\\nCREATE TABLE member (\\n  member_id INT PRIMARY KEY,\\n  name VARCHAR(100)\\n);\\n\\nCREATE TABLE loan (\\n  loan_id INT PRIMARY KEY,\\n  book_id INT,\\n  member_id INT,\\n  loan_date DATE,\\n  return_date DATE,\\n  FOREIGN KEY (book_id) REFERENCES book(book_id),\\n  FOREIGN KEY (member_id) REFERENCES member(member_id)\\n);",
    acceptablePatterns: ['create table book', 'create table member', 'create table loan', 'foreign key'],
    explanation: 'Create tables with appropriate PKs. Add FK constraints to enforce referential integrity between loan and the other tables.',
    schema: {},
    lectureRef: 'lecture-9.html#complete-transformation'
  },
  {
    id: 'comp18',
    type: 'mcq',
    topic: 'Triggers vs Constraints',
    difficulty: 'medium',
    question: 'When should you use a trigger instead of a CHECK constraint?',
    options: [
      'Never - constraints are always better',
      'When the validation involves multiple rows or tables',
      'When you need faster inserts',
      'When you want to avoid writing SQL'
    ],
    correctAnswer: 1,
    explanation: 'Triggers are needed when validation logic requires checking multiple rows or tables (e.g., ensuring total order amount does not exceed credit limit).',
    lectureRef: 'lecture-6.html#triggers-vs-constraints'
  },
  {
    id: 'comp19',
    type: 'write_query',
    topic: 'Recursive CTE',
    difficulty: 'expert',
    question: 'Write a recursive CTE to find all subordinates (direct and indirect) of employee 1 in an organization chart.',
    correctAnswer: "WITH RECURSIVE subordinates AS (\\n  SELECT emp_id, name, manager_id, 1 AS level\\n  FROM employee\\n  WHERE manager_id = 1\\n  UNION ALL\\n  SELECT e.emp_id, e.name, e.manager_id, s.level + 1\\n  FROM employee e\\n  JOIN subordinates s ON e.manager_id = s.emp_id\\n)\\nSELECT * FROM subordinates;",
    acceptablePatterns: ['with recursive', 'where manager_id = 1', 'join subordinates', 'union all'],
    explanation: 'Start with direct reports of employee 1, then recursively find their subordinates. Track level for hierarchy depth.',
    schema: { employee: ['emp_id', 'name', 'manager_id'] },
    lectureRef: 'lecture-6.html#recursive-cte'
  },
  {
    id: 'comp20',
    type: 'mcq',
    topic: 'Normalization vs Performance',
    difficulty: 'hard',
    question: 'Why might you denormalize a database?',
    options: [
      'To improve data integrity',
      'To reduce storage space',
      'To improve query performance by reducing joins',
      'To simplify backup procedures'
    ],
    correctAnswer: 2,
    explanation: 'Denormalization intentionally adds redundancy to reduce the number of joins needed for queries, improving read performance at the cost of storage and update complexity.',
    lectureRef: 'comprehensive'
  },
  {
    id: 'comp21',
    type: 'true_false',
    topic: 'NATURAL JOIN',
    difficulty: 'medium',
    question: 'NATURAL JOIN should be avoided in production code because it implicitly matches all columns with the same name.',
    correctAnswer: true,
    explanation: 'NATURAL JOIN matches columns by name implicitly, which can lead to unexpected results if column names change or new matching columns are added.',
    lectureRef: 'lecture-3.html#natural-join'
  },
  {
    id: 'comp22',
    type: 'write_ddl',
    topic: 'Complete Database Design',
    difficulty: 'expert',
    question: 'Design tables for an e-commerce system: Customers place Orders containing Order_Items. Products have Categories. Include all relationships and constraints.',
    correctAnswer: "CREATE TABLE customer (\\n  customer_id INT PRIMARY KEY,\\n  name VARCHAR(100),\\n  email VARCHAR(100) UNIQUE\\n);\\n\\nCREATE TABLE category (\\n  category_id INT PRIMARY KEY,\\n  name VARCHAR(50)\\n);\\n\\nCREATE TABLE product (\\n  product_id INT PRIMARY KEY,\\n  name VARCHAR(100),\\n  price DECIMAL(10,2),\\n  category_id INT,\\n  FOREIGN KEY (category_id) REFERENCES category(category_id)\\n);\\n\\nCREATE TABLE orders (\\n  order_id INT PRIMARY KEY,\\n  customer_id INT,\\n  order_date DATE,\\n  FOREIGN KEY (customer_id) REFERENCES customer(customer_id)\\n);\\n\\nCREATE TABLE order_item (\\n  order_id INT,\\n  product_id INT,\\n  quantity INT,\\n  price DECIMAL(10,2),\\n  PRIMARY KEY (order_id, product_id),\\n  FOREIGN KEY (order_id) REFERENCES orders(order_id),\\n  FOREIGN KEY (product_id) REFERENCES product(product_id)\\n);",
    acceptablePatterns: ['create table customer', 'create table product', 'create table orders', 'create table order_item', 'primary key', 'foreign key'],
    explanation: 'Apply 8-step transformation: entities become tables, 1:N relationships use FKs (customer in orders, category in product), M:N (order-product) becomes junction table.',
    schema: {},
    lectureRef: 'lecture-9.html#complete-design'
  },
  {
    id: 'comp23',
    type: 'mcq',
    topic: 'Aggregate Functions',
    difficulty: 'hard',
    question: 'Which aggregate function ignores NULL values?',
    options: ['COUNT(*)', 'All except COUNT(*)', 'Only SUM', 'None of them'],
    correctAnswer: 1,
    explanation: 'All aggregate functions except COUNT(*) ignore NULL values. COUNT(column) also ignores NULLs, while COUNT(*) counts all rows.',
    lectureRef: 'lecture-3.html#aggregates'
  },
  {
    id: 'comp24',
    type: 'fill_blank',
    topic: 'Relational Algebra',
    difficulty: 'medium',
    question: 'The SELECT clause in SQL corresponds to the ______ operator in Relational Algebra.',
    correctAnswer: 'Projection',
    acceptableAnswers: ['Projection', 'projection', 'pi', 'Pi'],
    explanation: 'SELECT columns in SQL corresponds to the Projection (pi) operator in Relational Algebra.',
    lectureRef: 'lecture-7.html#ra-sql-mapping'
  },
  {
    id: 'comp25',
    type: 'write_query',
    topic: 'CASE Expression',
    difficulty: 'hard',
    question: 'Write a query to pivot data: show department names as columns with employee counts for each.',
    correctAnswer: "SELECT\\n  COUNT(CASE WHEN dept_name = 'Sales' THEN 1 END) AS sales_count,\\n  COUNT(CASE WHEN dept_name = 'Engineering' THEN 1 END) AS eng_count,\\n  COUNT(CASE WHEN dept_name = 'HR' THEN 1 END) AS hr_count\\nFROM employee e\\nJOIN department d ON e.dept_id = d.dept_id;",
    acceptablePatterns: ['count(case when', 'dept_name =', 'then 1 end', 'as .*_count'],
    explanation: 'Use conditional aggregation with CASE inside COUNT to pivot row data into columns.',
    schema: {
      employee: ['emp_id', 'dept_id'],
      department: ['dept_id', 'dept_name']
    },
    lectureRef: 'lecture-4.html#case-pivot'
  },
  {
    id: 'comp26',
    type: 'mcq',
    topic: 'Transaction Control',
    difficulty: 'medium',
    question: 'What happens when you execute ROLLBACK in a transaction?',
    options: [
      'All changes are saved permanently',
      'All changes since BEGIN TRANSACTION are undone',
      'Only the last statement is undone',
      'The database is restored from backup'
    ],
    correctAnswer: 1,
    explanation: 'ROLLBACK undoes all changes made since the transaction began, restoring the database to its pre-transaction state.',
    lectureRef: 'lecture-5.html#rollback'
  },
  {
    id: 'comp27',
    type: 'match',
    topic: 'SQL Joins',
    difficulty: 'medium',
    question: 'Match the JOIN type to when you would use it:',
    items: [
      { left: 'INNER JOIN', right: 'Only need matching rows from both tables' },
      { left: 'LEFT JOIN', right: 'Need all rows from main table regardless of matches' },
      { left: 'FULL JOIN', right: 'Need all rows from both tables' },
      { left: 'CROSS JOIN', right: 'Need all combinations of rows' }
    ],
    explanation: 'Each JOIN type serves different purposes based on which rows you need in your result set.',
    lectureRef: 'lecture-3.html#join-types'
  },
  {
    id: 'comp28',
    type: 'draw_eerd',
    topic: 'Subtype Hierarchy',
    difficulty: 'hard',
    question: 'Draw an EERD for a vehicle hierarchy: Vehicle (supertype) with Car, Truck, and Motorcycle as subtypes. Car has num_doors. Truck has capacity. Motorcycle has engine_cc.',
    correctAnswer: 'comp-eerd-subtype',
    diagramType: 'eer-chen',
    diagramData: {
      supertype: { name: 'Vehicle', attributes: ['vehicle_id', 'make', 'model', 'year'] },
      subtypes: [
        { name: 'Car', attributes: ['num_doors'] },
        { name: 'Truck', attributes: ['capacity'] },
        { name: 'Motorcycle', attributes: ['engine_cc'] }
      ],
      constraint: 'exclusive'
    },
    explanation: 'Show Vehicle as supertype with attributes common to all. Connect to three subtypes with discriminator circle marked for exclusive constraint.',
    lectureRef: 'lecture-8.html#subtype-example'
  },
  {
    id: 'comp29',
    type: 'mcq',
    topic: '8-Step Transformation',
    difficulty: 'hard',
    question: 'When transforming a superclass structure, which approach creates the fewest tables?',
    options: [
      'One table per subtype with FK to superclass',
      'One table for superclass, one for each subtype',
      'Single table for superclass and all subtypes',
      'They all create the same number of tables'
    ],
    correctAnswer: 2,
    explanation: 'The "one table" approach creates a single table containing all attributes from the superclass and all subtypes, using a discriminator column.',
    lectureRef: 'lecture-9.html#step8-one-table'
  },
  {
    id: 'comp30',
    type: 'true_false',
    topic: 'Indexing Strategy',
    difficulty: 'hard',
    question: 'Creating indexes on all columns is always the best strategy for optimal query performance.',
    correctAnswer: false,
    explanation: 'While indexes speed up SELECT queries, they slow down INSERT/UPDATE/DELETE operations. Indexes also consume storage. Strategic indexing based on query patterns is better.',
    lectureRef: 'lecture-6.html#index-strategy'
  }
];

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get all questions from a specific lecture
 * @param {number} lectureNumber - Lecture number (1-9)
 * @returns {Array} Array of questions
 */
function getLectureQuestions(lectureNumber) {
  const key = `lecture${lectureNumber}`;
  return questionBank[key] || [];
}

/**
 * Get all questions of a specific type
 * @param {string} type - Question type (mcq, fill_blank, true_false, write_ddl, write_dml, write_query, draw_eerd, match)
 * @returns {Array} Array of questions
 */
function getQuestionsByType(type) {
  const allQuestions = [];
  Object.values(questionBank).forEach(lectureQuestions => {
    allQuestions.push(...lectureQuestions.filter(q => q.type === type));
  });
  return allQuestions;
}

/**
 * Get questions by difficulty level
 * @param {string} difficulty - easy, medium, hard, or expert
 * @returns {Array} Array of questions
 */
function getQuestionsByDifficulty(difficulty) {
  const allQuestions = [];
  Object.values(questionBank).forEach(lectureQuestions => {
    allQuestions.push(...lectureQuestions.filter(q => q.difficulty === difficulty));
  });
  return allQuestions;
}

/**
 * Get a random selection of questions
 * @param {number} count - Number of questions to return
 * @param {Object} filters - Optional filters (lecture, type, difficulty)
 * @returns {Array} Array of random questions
 */
function getRandomQuestions(count, filters = {}) {
  let pool = [];
  
  if (filters.lecture) {
    pool = getLectureQuestions(filters.lecture);
  } else {
    Object.values(questionBank).forEach(lectureQuestions => {
      pool.push(...lectureQuestions);
    });
  }
  
  if (filters.type) {
    pool = pool.filter(q => q.type === filters.type);
  }
  
  if (filters.difficulty) {
    pool = pool.filter(q => q.difficulty === filters.difficulty);
  }
  
  // Shuffle and return requested count
  const shuffled = pool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get comprehensive test covering all lectures
 * @param {number} questionsPerLecture - Number of questions per lecture
 * @returns {Array} Array of questions
 */
function getComprehensiveTest(questionsPerLecture = 3) {
  const test = [];
  for (let i = 1; i <= 9; i++) {
    const lectureQuestions = getLectureQuestions(i);
    const shuffled = lectureQuestions.sort(() => 0.5 - Math.random());
    test.push(...shuffled.slice(0, questionsPerLecture));
  }
  // Add some comprehensive questions
  const compQuestions = questionBank.comprehensive.sort(() => 0.5 - Math.random());
  test.push(...compQuestions.slice(0, 5));
  return test;
}

/**
 * Search questions by keyword
 * @param {string} keyword - Search term
 * @returns {Array} Array of matching questions
 */
function searchQuestions(keyword) {
  const results = [];
  const lowerKeyword = keyword.toLowerCase();
  
  Object.values(questionBank).forEach(lectureQuestions => {
    lectureQuestions.forEach(q => {
      if (q.question.toLowerCase().includes(lowerKeyword) ||
          q.topic.toLowerCase().includes(lowerKeyword) ||
          (q.explanation && q.explanation.toLowerCase().includes(lowerKeyword))) {
        results.push(q);
      }
    });
  });
  
  return results;
}

/**
 * Get question statistics
 * @returns {Object} Statistics about the question bank
 */
function getStatistics() {
  const stats = {
    totalQuestions: 0,
    byLecture: {},
    byType: {},
    byDifficulty: {}
  };
  
  Object.entries(questionBank).forEach(([key, questions]) => {
    stats.totalQuestions += questions.length;
    stats.byLecture[key] = questions.length;
    
    questions.forEach(q => {
      stats.byType[q.type] = (stats.byType[q.type] || 0) + 1;
      stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
    });
  });
  
  return stats;
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    questionBank,
    getLectureQuestions,
    getQuestionsByType,
    getQuestionsByDifficulty,
    getRandomQuestions,
    getComprehensiveTest,
    searchQuestions,
    getStatistics
  };
}

// Log statistics when loaded
console.log('[Test Question Bank] Loaded successfully');
console.log('[Test Question Bank] Statistics:', getStatistics());
