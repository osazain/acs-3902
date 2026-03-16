/**
 * DDL SQL Parser, Validator & Auto-Fixer
 * ACS-3902 Database Systems - Midterm 2 Prep
 * 
 * Features:
 * - Parse CREATE TABLE statements with STRICT validation
 * - Smart validation with detailed error reporting
 * - Auto-fix suggestions with explanations
 */

class DDLParser {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];
    this.parsedTables = [];
    this.originalSql = '';
  }

  parse(sql) {
    this.reset();
    this.originalSql = sql;
    
    if (!sql || !sql.trim()) {
      this.errors.push({
        type: 'EMPTY_INPUT',
        message: 'No SQL provided',
        severity: 'error',
        autoFixable: false
      });
      return { success: false, tables: [], errors: this.errors };
    }

    // Check for obvious garbage input
    if (this.isGarbageInput(sql)) {
      this.errors.push({
        type: 'INVALID_INPUT',
        message: 'Input does not appear to be valid SQL DDL',
        severity: 'error',
        autoFixable: false,
        context: sql.substring(0, 100)
      });
      return { success: false, tables: [], errors: this.errors };
    }

    const cleanedSql = this.cleanSql(sql);
    const statements = this.splitStatements(cleanedSql);
    
    if (statements.length === 0 || (statements.length === 1 && !statements[0].trim())) {
      this.errors.push({
        type: 'NO_STATEMENTS',
        message: 'No valid SQL statements found',
        severity: 'error',
        autoFixable: false
      });
      return { success: false, tables: [], errors: this.errors };
    }

    let foundCreateTable = false;
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt) continue;
      
      if (this.isCreateTable(stmt)) {
        foundCreateTable = true;
        const result = this.parseCreateTable(stmt, i);
        if (result && result.columns.length > 0) {
          this.parsedTables.push(result);
        }
      } else if (!this.isValidNonCreateStatement(stmt)) {
        // Warn about non-CREATE statements we don't handle
        this.warnings.push({
          type: 'UNSUPPORTED_STATEMENT',
          message: `Statement ${i+1} is not a CREATE TABLE statement and was ignored`,
          severity: 'warning',
          autoFixable: false,
          context: stmt.substring(0, 50)
        });
      }
    }

    if (!foundCreateTable) {
      this.errors.push({
        type: 'NO_CREATE_TABLE',
        message: 'No CREATE TABLE statements found. Expected: CREATE TABLE table_name (...)',
        severity: 'error',
        autoFixable: false
      });
      return { success: false, tables: [], errors: this.errors };
    }

    if (this.parsedTables.length === 0) {
      this.errors.push({
        type: 'PARSE_FAILED',
        message: 'Could not parse any valid tables from the provided SQL',
        severity: 'error',
        autoFixable: false
      });
      return { success: false, tables: [], errors: this.errors };
    }

    // Run validations
    this.validateForeignKeys();
    this.runSemanticValidation();

    return {
      success: this.errors.length === 0,
      tables: this.parsedTables,
      errors: this.errors,
      warnings: this.warnings,
      suggestions: this.suggestions
    };
  }

  isGarbageInput(sql) {
    // Check if input is obviously not SQL
    const sqlPattern = /\b(CREATE|TABLE|SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|INTO|VALUES)\b/i;
    if (!sqlPattern.test(sql)) {
      // Check for common non-SQL patterns
      const nonSqlPatterns = [
        /^\d+$/,  // Just numbers
        /^[a-zA-Z]+\s*[a-zA-Z]+\s*$/,  // Just words without SQL structure
        /^(hello|test|foo|bar|abc|xyz)/i  // Common test words
      ];
      return nonSqlPatterns.some(p => p.test(sql.trim()));
    }
    return false;
  }

  reset() {
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];
    this.parsedTables = [];
    this.originalSql = '';
  }

  cleanSql(sql) {
    let cleaned = sql;
    cleaned = cleaned.replace(/--.*$/gm, '');
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    return cleaned;
  }

  splitStatements(sql) {
    const statements = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    let depth = 0;
    
    for (let i = 0; i < sql.length; i++) {
      const char = sql[i];
      const prevChar = i > 0 ? sql[i - 1] : '';
      
      if (!inString && (char === "'" || char === '"')) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && prevChar !== '\\') {
        inString = false;
      }
      
      if (!inString) {
        if (char === '(') depth++;
        if (char === ')') depth--;
      }
      
      if (char === ';' && !inString && depth === 0) {
        statements.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      statements.push(current.trim());
    }
    
    return statements;
  }

  isCreateTable(sql) {
    return /^\s*CREATE\s+TABLE\b/i.test(sql);
  }

  isValidNonCreateStatement(sql) {
    return /^\s*(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE\s+(?:INDEX|VIEW|TRIGGER|PROCEDURE|FUNCTION))\b/i.test(sql);
  }

  parseCreateTable(sql, stmtIndex) {
    const result = {
      id: `table_${Date.now()}_${stmtIndex}`,
      name: '',
      columns: [],
      foreignKeys: [],
      raw: sql
    };

    // STRICT pattern for CREATE TABLE
    // Must match: CREATE TABLE [IF NOT EXISTS] [schema.]table_name (
    const createTablePattern = /^\s*CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`?"?(\w+)"?`?\.)?`?"?(\w+)"?`?\s*\(/i;
    
    const tableNameMatch = sql.match(createTablePattern);
    
    if (!tableNameMatch) {
      // More specific error checking
      if (!/^\s*CREATE\s+TABLE\s+/i.test(sql)) {
        this.errors.push({
          type: 'MISSING_CREATE_TABLE',
          message: 'Statement must start with CREATE TABLE',
          severity: 'error',
          autoFixable: false,
          context: sql.substring(0, 80)
        });
      } else if (!/\w+\s*\(/i.test(sql)) {
        this.errors.push({
          type: 'MISSING_TABLE_NAME',
          message: 'CREATE TABLE is missing a table name and opening parenthesis',
          severity: 'error',
          autoFixable: false,
          context: sql.substring(0, 80)
        });
      } else if (!/\(/i.test(sql)) {
        this.errors.push({
          type: 'MISSING_OPEN_PAREN',
          message: 'Missing opening parenthesis after table name',
          severity: 'error',
          autoFixable: true,
          fixDescription: 'Add opening parenthesis',
          context: sql.substring(0, 80)
        });
      } else {
        this.errors.push({
          type: 'INVALID_SYNTAX',
          message: 'Invalid CREATE TABLE syntax. Expected: CREATE TABLE table_name (...)',
          severity: 'error',
          autoFixable: false,
          context: sql.substring(0, 80)
        });
      }
      return null;
    }

    result.name = tableNameMatch[2] || tableNameMatch[1];
    
    if (!result.name) {
      this.errors.push({
        type: 'MISSING_TABLE_NAME',
        message: 'Could not extract table name from CREATE TABLE statement',
        severity: 'error',
        autoFixable: false
      });
      return null;
    }

    // Extract content between first ( and last )
    const firstParen = sql.indexOf('(');
    const lastParen = sql.lastIndexOf(')');
    
    if (firstParen === -1) {
      this.errors.push({
        type: 'MISSING_OPEN_PAREN',
        message: 'Missing opening parenthesis for column definitions',
        severity: 'error',
        autoFixable: false
      });
      return null;
    }
    
    if (lastParen === -1 || lastParen <= firstParen) {
      this.errors.push({
        type: 'MISSING_CLOSE_PAREN',
        message: 'Missing closing parenthesis for CREATE TABLE',
        severity: 'error',
        autoFixable: true,
        fixDescription: 'Add closing parenthesis',
        context: sql.substring(sql.length - 30)
      });
      return null;
    }

    const columnDefsText = sql.substring(firstParen + 1, lastParen).trim();
    
    if (!columnDefsText) {
      this.errors.push({
        type: 'EMPTY_TABLE',
        message: `Table "${result.name}" has no column definitions`,
        severity: 'error',
        autoFixable: false
      });
      return null;
    }

    // Validate the column definitions text has valid structure
    if (!this.hasValidColumnStructure(columnDefsText)) {
      this.errors.push({
        type: 'INVALID_COLUMN_DEFS',
        message: 'Column definitions appear to be malformed',
        severity: 'error',
        autoFixable: false,
        context: columnDefsText.substring(0, 100)
      });
      return null;
    }

    const columnDefs = this.splitColumnDefs(columnDefsText);
    
    if (columnDefs.length === 0 || (columnDefs.length === 1 && !columnDefs[0].trim())) {
      this.errors.push({
        type: 'NO_COLUMNS',
        message: `Table "${result.name}" has no columns defined`,
        severity: 'error',
        autoFixable: false
      });
      return null;
    }
    
    for (let i = 0; i < columnDefs.length; i++) {
      const colDef = columnDefs[i].trim();
      if (!colDef) continue;

      if (this.isTableConstraint(colDef)) {
        this.parseTableConstraint(colDef, result);
      } else {
        const column = this.parseColumnDefinition(colDef, result.name);
        if (column) {
          result.columns.push(column);
        }
      }
    }

    // Check if we actually parsed any columns
    if (result.columns.length === 0) {
      this.errors.push({
        type: 'NO_VALID_COLUMNS',
        message: `Table "${result.name}" has no valid column definitions`,
        severity: 'error',
        autoFixable: false
      });
      return null;
    }

    this.validateTable(result);
    
    // Return null if there are critical errors (like no columns)
    const criticalErrors = this.errors.filter(e => 
      e.type === 'NO_COLUMNS' || 
      e.type === 'NO_VALID_COLUMNS' ||
      e.type === 'DUPLICATE_COLUMN'
    );
    
    if (criticalErrors.length > 0) {
      return null;
    }
    
    return result;
  }

  hasValidColumnStructure(text) {
    // Check for obviously wrong patterns
    // Multiple consecutive words without data type indicator
    const invalidPatterns = [
      /^\s*\w+\s+\w+\s+\w+\s*$/m,  // Just words like "col1 col2 col3"
      /^\s*[^a-zA-Z_]/,  // Doesn't start with a letter or underscore
    ];
    
    // Allow it through if it looks like valid column defs
    // Should have: identifier + (datatype | CONSTRAINT)
    const hasValidPattern = /\w+\s+\w+/i.test(text) || /CONSTRAINT/i.test(text);
    return hasValidPattern;
  }

  splitColumnDefs(defs) {
    const columns = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < defs.length; i++) {
      const char = defs[i];
      const prevChar = i > 0 ? defs[i - 1] : '';
      
      if (!inString && (char === "'" || char === '"')) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && prevChar !== '\\') {
        inString = false;
      }
      
      if (!inString) {
        if (char === '(') depth++;
        if (char === ')') depth--;
      }
      
      if (char === ',' && !inString && depth === 0) {
        columns.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      columns.push(current.trim());
    }
    
    return columns;
  }

  isTableConstraint(def) {
    return /^\s*(CONSTRAINT|PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK)\b/i.test(def);
  }

  parseColumnDefinition(def, tableName) {
    const column = {
      name: '',
      dataType: '',
      length: '',
      precision: '',
      constraints: { pk: false, notNull: false, unique: false },
      default: '',
      check: ''
    };

    // STRICT column name pattern: must start with letter or underscore, followed by alphanumeric or underscore
    const nameMatch = def.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s+/);
    
    if (!nameMatch) {
      // Check for specific error cases
      if (/^\d/.test(def)) {
        this.errors.push({
          type: 'INVALID_COLUMN_NAME',
          message: `Column name cannot start with a number: "${def.substring(0, 20)}"`,
          severity: 'error',
          autoFixable: true,
          fixDescription: 'Prefix with underscore: _' + def.match(/^\d+/)?.[0]
        });
      } else if (/^\s*$/.test(def)) {
        return null; // Empty, skip
      } else {
        this.errors.push({
          type: 'INVALID_COLUMN_DEF',
          message: `Invalid column definition. Expected: column_name DATA_TYPE [constraints], got: "${def.substring(0, 50)}"`,
          severity: 'error',
          autoFixable: false
        });
      }
      return null;
    }

    column.name = nameMatch[1];
    let remaining = def.substring(nameMatch[0].length).trim();

    if (!remaining) {
      this.errors.push({
        type: 'MISSING_DATATYPE',
        message: `Column "${column.name}" is missing a data type`,
        severity: 'error',
        autoFixable: true,
        fixDescription: 'Add VARCHAR(255) as default'
      });
      return null;
    }

    // STRICT data type pattern
    const typeMatch = remaining.match(/^([a-zA-Z][a-zA-Z0-9_]*)(?:\s*\(\s*(\d+)\s*(?:,\s*(\d+))?\s*\))?/i);
    
    if (!typeMatch) {
      // Check what's after the column name
      const nextWord = remaining.match(/^(\S+)/)?.[1];
      this.errors.push({
        type: 'INVALID_DATATYPE',
        message: `Invalid data type "${nextWord || remaining.substring(0, 20)}" for column "${column.name}"`,
        severity: 'error',
        autoFixable: true,
        fixDescription: 'Replace with VARCHAR(255)'
      });
      return null;
    }

    column.dataType = typeMatch[1].toUpperCase();
    if (typeMatch[2]) column.length = typeMatch[2];
    if (typeMatch[3]) column.precision = typeMatch[3];
    remaining = remaining.substring(typeMatch[0].length).trim();

    // Validate data type is known
    const validTypes = ['INTEGER', 'SERIAL', 'VARCHAR', 'CHAR', 'TEXT', 'DATE', 'TIMESTAMP', 
                        'BOOLEAN', 'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'BIGINT', 'SMALLINT',
                        'REAL', 'TIME', 'DATETIME', 'BLOB', 'CLOB', 'JSON', 'UUID', 'INT', 'NVARCHAR'];
    
    if (!validTypes.includes(column.dataType)) {
      this.warnings.push({
        type: 'UNKNOWN_DATATYPE',
        message: `Unknown data type "${column.dataType}" for column "${column.name}"`,
        severity: 'warning',
        autoFixable: true,
        fixDescription: 'Replace with VARCHAR(255)'
      });
    }

    // Parse constraints
    this.parseColumnConstraints(remaining, column);

    return column;
  }

  parseColumnConstraints(remaining, column) {
    if (!remaining) return;
    
    const upperRemaining = remaining.toUpperCase();
    
    // PRIMARY KEY
    if (/\bPRIMARY\s+KEY\b/i.test(remaining)) {
      column.constraints.pk = true;
      column.constraints.notNull = true;
    }
    
    // NOT NULL
    if (/\bNOT\s+NULL\b/i.test(remaining)) {
      column.constraints.notNull = true;
    }
    
    // UNIQUE
    if (/\bUNIQUE\b/i.test(remaining)) {
      column.constraints.unique = true;
    }
    
    // DEFAULT
    const defaultMatch = remaining.match(/\bDEFAULT\s+([^,\s]+|(?:'[^']*')|(?:"[^"]*"))/i);
    if (defaultMatch) {
      column.default = defaultMatch[1];
    }
    
    // CHECK constraint
    const checkMatch = remaining.match(/\bCHECK\s*\(([^)]+)\)/i);
    if (checkMatch) {
      column.check = checkMatch[1];
    }
    
    // AUTO_INCREMENT / IDENTITY
    if (/\b(AUTO_INCREMENT|AUTOINCREMENT|IDENTITY)\b/i.test(remaining)) {
      if (column.dataType === 'INTEGER' || column.dataType === 'INT') {
        column.dataType = 'SERIAL';
      }
    }
  }

  parseTableConstraint(def, table) {
    // PRIMARY KEY constraint
    const pkMatch = def.match(/PRIMARY\s+KEY\s*\(\s*([^)]+)\s*\)/i);
    if (pkMatch) {
      const columns = pkMatch[1].split(',').map(c => c.trim().replace(/[`"]/g, ''));
      columns.forEach(colName => {
        const col = table.columns.find(c => c.name === colName);
        if (col) {
          col.constraints.pk = true;
          col.constraints.notNull = true;
        }
      });
      return;
    }
    
    // FOREIGN KEY constraint
    const fkMatch = def.match(/(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(\s*(\w+)\s*\)\s*REFERENCES\s+(\w+)(?:\s*\(\s*(\w+)\s*\))?/i);
    if (fkMatch) {
      table.foreignKeys.push({
        column: fkMatch[1],
        refTable: fkMatch[2],
        refColumn: fkMatch[3] || null,
        onDelete: this.extractOnAction(def, 'DELETE'),
        onUpdate: this.extractOnAction(def, 'UPDATE')
      });
    }
    
    // UNIQUE constraint
    const uniqueMatch = def.match(/UNIQUE\s*\(\s*([^)]+)\s*\)/i);
    if (uniqueMatch) {
      const columns = uniqueMatch[1].split(',').map(c => c.trim().replace(/[`"]/g, ''));
      columns.forEach(colName => {
        const col = table.columns.find(c => c.name === colName);
        if (col) {
          col.constraints.unique = true;
        }
      });
    }
  }

  extractOnAction(def, action) {
    const match = def.match(new RegExp(`ON\\s+${action}\\s+(\\w+(?:\\s+\\w+)?)`, 'i'));
    return match ? match[1].toUpperCase() : 'NO ACTION';
  }

  validateTable(table) {
    // Check for columns
    if (table.columns.length === 0) {
      this.errors.push({
        type: 'NO_COLUMNS',
        message: `Table "${table.name}" has no valid columns`,
        severity: 'error',
        autoFixable: false
      });
      return;
    }
    
    // Check for primary key
    const hasPK = table.columns.some(c => c.constraints.pk);
    if (!hasPK) {
      this.warnings.push({
        type: 'NO_PRIMARY_KEY',
        message: `Table "${table.name}" has no PRIMARY KEY`,
        severity: 'warning',
        autoFixable: true,
        fixDescription: `Make "${table.columns[0]?.name}" the PRIMARY KEY`
      });
    }
    
    // Check for duplicate column names
    const nameCounts = {};
    table.columns.forEach(col => {
      nameCounts[col.name] = (nameCounts[col.name] || 0) + 1;
    });
    
    Object.entries(nameCounts).forEach(([name, count]) => {
      if (count > 1) {
        this.errors.push({
          type: 'DUPLICATE_COLUMN',
          message: `Duplicate column name "${name}" in table "${table.name}"`,
          severity: 'error',
          autoFixable: true,
          fixDescription: `Rename to ${name}_1, ${name}_2, etc.`
        });
      }
    });
    
    // Check VARCHAR/CHAR without length
    table.columns.forEach(col => {
      if ((col.dataType === 'VARCHAR' || col.dataType === 'CHAR' || col.dataType === 'NVARCHAR') && !col.length) {
        this.suggestions.push({
          type: 'MISSING_LENGTH',
          message: `Column "${col.name}" is ${col.dataType} without length specifier`,
          severity: 'suggestion',
          autoFixable: true,
          fixDescription: 'Add default length of 255'
        });
      }
    });
  }

  validateForeignKeys() {
    const tableNames = new Set(this.parsedTables.map(t => t.name));
    
    this.parsedTables.forEach(table => {
      table.foreignKeys.forEach(fk => {
        // Check if referenced table exists
        if (!tableNames.has(fk.refTable)) {
          this.errors.push({
            type: 'FK_TABLE_NOT_FOUND',
            message: `Foreign key references non-existent table "${fk.refTable}"`,
            severity: 'error',
            autoFixable: false
          });
        } else {
          const refTable = this.parsedTables.find(t => t.name === fk.refTable);
          if (refTable && fk.refColumn) {
            const refCol = refTable.columns.find(c => c.name === fk.refColumn);
            if (!refCol) {
              const pkCol = refTable.columns.find(c => c.constraints.pk);
              this.errors.push({
                type: 'FK_COLUMN_NOT_FOUND',
                message: `Foreign key references non-existent column "${fk.refColumn}" in table "${fk.refTable}"`,
                severity: 'error',
                autoFixable: true,
                fixDescription: `Change reference to "${pkCol?.name || refTable.columns[0]?.name}"`
              });
            }
          }
        }
        
        // Check if local column exists
        const localCol = table.columns.find(c => c.name === fk.column);
        if (!localCol) {
          this.errors.push({
            type: 'FK_LOCAL_COLUMN_NOT_FOUND',
            message: `Foreign key references non-existent local column "${fk.column}" in table "${table.name}"`,
            severity: 'error',
            autoFixable: false
          });
        }
      });
    });
  }

  runSemanticValidation() {
    const reservedWords = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 
                          'TABLE', 'INDEX', 'VIEW', 'USER', 'ORDER', 'GROUP', 'CREATE'];
    
    this.parsedTables.forEach(table => {
      if (reservedWords.includes(table.name.toUpperCase())) {
        this.warnings.push({
          type: 'RESERVED_NAME',
          message: `Table name "${table.name}" is a reserved SQL keyword`,
          severity: 'warning',
          autoFixable: true,
          fixDescription: `Rename to "${table.name}_tbl"`
        });
      }
      
      table.columns.forEach(col => {
        if (reservedWords.includes(col.name.toUpperCase())) {
          this.warnings.push({
            type: 'RESERVED_NAME',
            message: `Column name "${col.name}" is a reserved SQL keyword`,
            severity: 'warning',
            autoFixable: true,
            fixDescription: `Rename to "${col.name}_col"`
          });
        }
      });
    });
  }

  autoFix() {
    let fixCount = 0;
    
    // Fix missing PRIMARY KEY
    this.parsedTables.forEach(table => {
      const hasPK = table.columns.some(c => c.constraints.pk);
      if (!hasPK && table.columns.length > 0) {
        table.columns[0].constraints.pk = true;
        table.columns[0].constraints.notNull = true;
        fixCount++;
      }
      
      // Fix VARCHAR without length
      table.columns.forEach(col => {
        if ((col.dataType === 'VARCHAR' || col.dataType === 'CHAR') && !col.length) {
          col.length = '255';
          fixCount++;
        }
        
        // Fix unknown data types
        const validTypes = ['INTEGER', 'SERIAL', 'VARCHAR', 'CHAR', 'TEXT', 'DATE', 'TIMESTAMP', 
                           'BOOLEAN', 'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'BIGINT', 'SMALLINT',
                           'REAL', 'TIME', 'DATETIME', 'BLOB', 'CLOB', 'JSON', 'UUID'];
        if (!validTypes.includes(col.dataType)) {
          col.dataType = 'VARCHAR';
          col.length = '255';
          fixCount++;
        }
      });
    });
    
    // Clear fixed issues
    this.warnings = this.warnings.filter(w => !w.autoFixable);
    this.suggestions = this.suggestions.filter(s => !s.autoFixable);
    
    return {
      fixedCount: fixCount,
      remainingErrors: this.errors.length,
      remainingWarnings: this.warnings.length
    };
  }

  generateSQL(tables) {
    return tables.map(table => {
      let sql = `CREATE TABLE ${table.name} (`;
      const defs = [];
      
      table.columns.forEach(col => {
        let def = `    ${col.name} ${col.dataType}`;
        if (col.length) {
          def += `(${col.length}${col.precision ? `, ${col.precision}` : ''})`;
        }
        if (col.constraints.pk) def += ' PRIMARY KEY';
        if (col.constraints.notNull && !col.constraints.pk) def += ' NOT NULL';
        if (col.constraints.unique && !col.constraints.pk) def += ' UNIQUE';
        if (col.default) def += ` DEFAULT ${col.default}`;
        if (col.check) def += ` CHECK (${col.check})`;
        defs.push(def);
      });
      
      table.foreignKeys.forEach(fk => {
        let fkDef = `    FOREIGN KEY (${fk.column}) REFERENCES ${fk.refTable}(${fk.refColumn || 'id'})`;
        if (fk.onDelete && fk.onDelete !== 'NO ACTION') {
          fkDef += ` ON DELETE ${fk.onDelete}`;
        }
        if (fk.onUpdate && fk.onUpdate !== 'NO ACTION') {
          fkDef += ` ON UPDATE ${fk.onUpdate}`;
        }
        defs.push(fkDef);
      });
      
      sql += '\n' + defs.join(',\n') + '\n);';
      return sql;
    }).join('\n\n');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DDLParser;
}
