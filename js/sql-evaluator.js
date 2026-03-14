/**
 * SQL Evaluator for Practice Test System
 * Evaluates student-written SQL queries and provides feedback
 */

/**
 * SQL Query Parser - Extracts components from SQL queries
 */
class SQLParser {
    constructor() {
        this.STATEMENT_TYPES = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'];
        this.JOIN_TYPES = ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN'];
        this.AGGREGATE_FUNCTIONS = ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN'];
    }

    /**
     * Parse a SQL query and extract all components
     * @param {string} query - SQL query to parse
     * @returns {Object} Parsed query components
     */
    parse(query) {
        if (!query || typeof query !== 'string') {
            return { error: 'Empty or invalid query' };
        }

        const normalizedQuery = this.normalizeQuery(query);
        const statementType = this.extractStatementType(normalizedQuery);

        const result = {
            original: query,
            normalized: normalizedQuery,
            statementType: statementType,
            tables: [],
            columns: [],
            joins: [],
            whereConditions: [],
            groupBy: [],
            having: null,
            orderBy: [],
            aggregates: [],
            values: [],
            constraints: [],
            aliases: {}
        };

        switch (statementType) {
            case 'SELECT':
                this.parseSelect(normalizedQuery, result);
                break;
            case 'INSERT':
                this.parseInsert(normalizedQuery, result);
                break;
            case 'UPDATE':
                this.parseUpdate(normalizedQuery, result);
                break;
            case 'DELETE':
                this.parseDelete(normalizedQuery, result);
                break;
            case 'CREATE':
                this.parseCreate(normalizedQuery, result);
                break;
            case 'ALTER':
                this.parseAlter(normalizedQuery, result);
                break;
            case 'DROP':
                this.parseDrop(normalizedQuery, result);
                break;
        }

        return result;
    }

    /**
     * Normalize SQL query for parsing
     */
    normalizeQuery(query) {
        return query
            .replace(/\s+/g, ' ')
            .replace(/\s*,\s*/g, ', ')
            .trim()
            .toUpperCase();
    }

    /**
     * Extract statement type from query
     */
    extractStatementType(query) {
        for (const type of this.STATEMENT_TYPES) {
            if (query.startsWith(type)) {
                return type;
            }
        }
        return 'UNKNOWN';
    }

    /**
     * Parse SELECT statement
     */
    parseSelect(query, result) {
        // Extract columns
        const selectMatch = query.match(/SELECT\s+(.*?)\s+FROM/i);
        if (selectMatch) {
            const columnsPart = selectMatch[1].trim();
            if (columnsPart === '*') {
                result.columns.push('*');
            } else {
                const columns = this.parseColumns(columnsPart);
                result.columns = columns.map(c => c.name);
                result.aliases = columns.reduce((acc, c) => {
                    if (c.alias) acc[c.name] = c.alias;
                    return acc;
                }, {});
            }
        }

        // Extract tables and JOINs
        const fromMatch = query.match(/FROM\s+(.*?)(?:\s+WHERE|\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|$)/i);
        if (fromMatch) {
            const fromPart = fromMatch[1].trim();
            result.tables = this.parseFromClause(fromPart, result);
        }

        // Extract WHERE conditions
        const whereMatch = query.match(/WHERE\s+(.*?)(?:\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|$)/i);
        if (whereMatch) {
            result.whereConditions = this.parseWhereClause(whereMatch[1].trim());
        }

        // Extract GROUP BY
        const groupByMatch = query.match(/GROUP\s+BY\s+([^\s,]+(?:\s*,\s*[^\s,]+)*)/i);
        if (groupByMatch) {
            result.groupBy = groupByMatch[1].split(',').map(c => c.trim());
        }

        // Extract HAVING
        const havingMatch = query.match(/HAVING\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
        if (havingMatch) {
            result.having = havingMatch[1].trim();
        }

        // Extract ORDER BY
        const orderByMatch = query.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT|$)/i);
        if (orderByMatch) {
            result.orderBy = this.parseOrderBy(orderByMatch[1].trim());
        }

        // Extract aggregate functions
        result.aggregates = this.extractAggregates(query);
    }

    /**
     * Parse INSERT statement
     */
    parseInsert(query, result) {
        const tableMatch = query.match(/INSERT\s+INTO\s+(\w+)/i);
        if (tableMatch) {
            result.tables.push(tableMatch[1].toUpperCase());
        }

        const columnsMatch = query.match(/\(([^)]+)\)\s*VALUES/i);
        if (columnsMatch) {
            result.columns = columnsMatch[1].split(',').map(c => c.trim().toUpperCase());
        }

        const valuesMatch = query.match(/VALUES\s*\(([^)]+)\)/i);
        if (valuesMatch) {
            result.values = this.parseValues(valuesMatch[1]);
        }
    }

    /**
     * Parse UPDATE statement
     */
    parseUpdate(query, result) {
        const tableMatch = query.match(/UPDATE\s+(\w+)/i);
        if (tableMatch) {
            result.tables.push(tableMatch[1].toUpperCase());
        }

        const setMatch = query.match(/SET\s+(.*?)(?:\s+WHERE|$)/i);
        if (setMatch) {
            const setParts = setMatch[1].split(',');
            result.columns = setParts.map(part => {
                const colMatch = part.match(/(\w+)\s*=/);
                return colMatch ? colMatch[1].toUpperCase() : null;
            }).filter(Boolean);
            result.values = setParts.map(part => {
                const valMatch = part.match(/=\s*(.+)/);
                return valMatch ? valMatch[1].trim() : null;
            }).filter(Boolean);
        }

        const whereMatch = query.match(/WHERE\s+(.+)$/i);
        if (whereMatch) {
            result.whereConditions = this.parseWhereClause(whereMatch[1].trim());
        }
    }

    /**
     * Parse DELETE statement
     */
    parseDelete(query, result) {
        const tableMatch = query.match(/FROM\s+(\w+)/i) || query.match(/DELETE\s+(?:FROM\s+)?(\w+)/i);
        if (tableMatch) {
            result.tables.push(tableMatch[1].toUpperCase());
        }

        const whereMatch = query.match(/WHERE\s+(.+)$/i);
        if (whereMatch) {
            result.whereConditions = this.parseWhereClause(whereMatch[1].trim());
        }
    }

    /**
     * Parse CREATE statement
     */
    parseCreate(query, result) {
        const tableMatch = query.match(/CREATE\s+TABLE\s+(\w+)/i);
        if (tableMatch) {
            result.tables.push(tableMatch[1].toUpperCase());
        }

        const columnsMatch = query.match(/\((.+)\)/s);
        if (columnsMatch) {
            const colDefStr = columnsMatch[1];
            const parsed = this.parseColumnDefinitions(colDefStr);
            result.columns = parsed.columns;
            result.constraints = parsed.constraints;
        }
    }

    /**
     * Parse ALTER statement
     */
    parseAlter(query, result) {
        const tableMatch = query.match(/ALTER\s+TABLE\s+(\w+)/i);
        if (tableMatch) {
            result.tables.push(tableMatch[1].toUpperCase());
        }

        const addColMatch = query.match(/ADD\s+(?:COLUMN\s+)?(\w+)\s+(\w+)/i);
        if (addColMatch) {
            result.columns.push({
                name: addColMatch[1].toUpperCase(),
                type: addColMatch[2].toUpperCase()
            });
        }

        const dropColMatch = query.match(/DROP\s+(?:COLUMN\s+)?(\w+)/i);
        if (dropColMatch) {
            result.columns.push({
                name: dropColMatch[1].toUpperCase(),
                action: 'DROP'
            });
        }

        const constraintMatch = query.match(/ADD\s+CONSTRAINT\s+(\w+)\s+(.+)/i);
        if (constraintMatch) {
            result.constraints.push({
                name: constraintMatch[1].toUpperCase(),
                definition: constraintMatch[2].trim()
            });
        }
    }

    /**
     * Parse DROP statement
     */
    parseDrop(query, result) {
        const tableMatch = query.match(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?(\w+)/i);
        if (tableMatch) {
            result.tables.push(tableMatch[1].toUpperCase());
        }
    }

    /**
     * Parse column list with optional aliases
     */
    parseColumns(columnsPart) {
        const columns = [];
        // Handle nested functions by tracking parentheses
        let depth = 0;
        let current = '';
        
        for (let i = 0; i < columnsPart.length; i++) {
            const char = columnsPart[i];
            if (char === '(') depth++;
            else if (char === ')') depth--;
            
            if (char === ',' && depth === 0) {
                columns.push(this.parseSingleColumn(current.trim()));
                current = '';
            } else {
                current += char;
            }
        }
        if (current.trim()) {
            columns.push(this.parseSingleColumn(current.trim()));
        }
        
        return columns;
    }

    /**
     * Parse a single column with optional alias
     */
    parseSingleColumn(colStr) {
        // Check for AS alias
        const asMatch = colStr.match(/^(.+?)\s+AS\s+(\w+)$/i);
        if (asMatch) {
            return { name: asMatch[1].trim().toUpperCase(), alias: asMatch[2].toUpperCase() };
        }
        
        // Check for implicit alias (space between expression and name)
        const implicitMatch = colStr.match(/^(.+?)\s+(\w+)$/);
        if (implicitMatch && !colStr.includes('(')) {
            return { name: implicitMatch[1].trim().toUpperCase(), alias: implicitMatch[2].toUpperCase() };
        }
        
        return { name: colStr.toUpperCase(), alias: null };
    }

    /**
     * Parse FROM clause including JOINs
     */
    parseFromClause(fromPart, result) {
        const tables = [];
        const joinPattern = /(\w+)\s*(?:(LEFT|RIGHT|INNER|OUTER|FULL|CROSS)?\s*JOIN\s+(\w+)\s+ON\s+(.+?))?(?:,|$|\s+(?:WHERE|GROUP|ORDER|LIMIT))/gi;
        
        let match;
        let lastIndex = 0;
        
        // Simple approach: split by JOIN keywords
        const parts = fromPart.split(/\s+(?:LEFT\s+JOIN|RIGHT\s+JOIN|INNER\s+JOIN|FULL\s+JOIN|CROSS\s+JOIN|JOIN)\s+/i);
        
        // First table
        const firstTable = parts[0].trim().split(/\s+/)[0];
        if (firstTable) {
            tables.push(firstTable.toUpperCase());
        }
        
        // Parse JOINs
        const joinRegex = /(LEFT\s+JOIN|RIGHT\s+JOIN|INNER\s+JOIN|FULL\s+JOIN|CROSS\s+JOIN|JOIN)\s+(\w+)\s+ON\s+(.+?)(?=\s+(?:LEFT\s+JOIN|RIGHT\s+JOIN|INNER\s+JOIN|FULL\s+JOIN|CROSS\s+JOIN|JOIN|WHERE|GROUP\s+BY|ORDER\s+BY|LIMIT|$))/gi;
        
        while ((match = joinRegex.exec(fromPart)) !== null) {
            const joinType = match[1].toUpperCase().replace(/\s+JOIN$/, '');
            const table = match[2].toUpperCase();
            const condition = match[3].trim();
            
            tables.push(table);
            result.joins.push({
                type: joinType === 'JOIN' ? 'INNER' : joinType,
                table: table,
                condition: condition
            });
        }
        
        return tables;
    }

    /**
     * Parse WHERE clause conditions
     */
    parseWhereClause(wherePart) {
        const conditions = [];
        
        // Split by AND/OR, respecting parentheses
        const tokens = this.tokenizeWhereClause(wherePart);
        
        for (const token of tokens) {
            const condition = this.parseCondition(token);
            if (condition) {
                conditions.push(condition);
            }
        }
        
        return conditions;
    }

    /**
     * Tokenize WHERE clause respecting parentheses
     */
    tokenizeWhereClause(wherePart) {
        const tokens = [];
        let depth = 0;
        let current = '';
        
        const andOrPattern = /\s+(AND|OR)\s+/gi;
        let lastIndex = 0;
        let match;
        
        while ((match = andOrPattern.exec(wherePart)) !== null) {
            const before = wherePart.slice(lastIndex, match.index);
            
            // Track parentheses depth
            for (const char of before) {
                if (char === '(') depth++;
                else if (char === ')') depth--;
            }
            
            if (depth === 0) {
                if (current.trim()) {
                    tokens.push(current.trim());
                    current = '';
                }
                tokens.push({ operator: match[1].toUpperCase() });
            } else {
                current += before + match[0];
            }
            
            lastIndex = match.index + match[0].length;
        }
        
        const remaining = wherePart.slice(lastIndex);
        if (remaining.trim()) {
            current += remaining;
        }
        if (current.trim()) {
            tokens.push(current.trim());
        }
        
        return tokens;
    }

    /**
     * Parse a single condition
     */
    parseCondition(conditionStr) {
        const operators = ['>=', '<=', '<>', '!=', '=', '>', '<', 'LIKE', 'IN', 'BETWEEN', 'IS NULL', 'IS NOT NULL'];
        
        for (const op of operators) {
            const regex = new RegExp(`^(.+?)\\s*${op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(.+)?$`, 'i');
            const match = conditionStr.match(regex);
            if (match) {
                return {
                    column: match[1].trim().toUpperCase(),
                    operator: op,
                    value: match[2] ? match[2].trim().toUpperCase() : null
                };
            }
        }
        
        return { raw: conditionStr.toUpperCase() };
    }

    /**
     * Parse ORDER BY clause
     */
    parseOrderBy(orderByPart) {
        const orders = [];
        const parts = orderByPart.split(',');
        
        for (const part of parts) {
            const trimmed = part.trim();
            const descMatch = trimmed.match(/(.+?)\s+DESC$/i);
            const ascMatch = trimmed.match(/(.+?)\s+ASC$/i);
            
            if (descMatch) {
                orders.push({ column: descMatch[1].trim().toUpperCase(), direction: 'DESC' });
            } else if (ascMatch) {
                orders.push({ column: ascMatch[1].trim().toUpperCase(), direction: 'ASC' });
            } else {
                orders.push({ column: trimmed.toUpperCase(), direction: 'ASC' });
            }
        }
        
        return orders;
    }

    /**
     * Extract aggregate functions from query
     */
    extractAggregates(query) {
        const aggregates = [];
        const regex = new RegExp(`(${this.AGGREGATE_FUNCTIONS.join('|')})\\s*\\(([^)]+)\\)`, 'gi');
        
        let match;
        while ((match = regex.exec(query)) !== null) {
            aggregates.push({
                function: match[1].toUpperCase(),
                column: match[2].trim().toUpperCase()
            });
        }
        
        return aggregates;
    }

    /**
     * Parse VALUES clause
     */
    parseValues(valuesStr) {
        const values = [];
        let current = '';
        let depth = 0;
        
        for (const char of valuesStr) {
            if (char === '(') depth++;
            else if (char === ')') depth--;
            
            if (char === ',' && depth === 0) {
                values.push(this.parseValue(current.trim()));
                current = '';
            } else {
                current += char;
            }
        }
        
        if (current.trim()) {
            values.push(this.parseValue(current.trim()));
        }
        
        return values;
    }

    /**
     * Parse a single value
     */
    parseValue(valueStr) {
        const trimmed = valueStr.trim();
        if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
            return { type: 'string', value: trimmed.slice(1, -1) };
        }
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            return { type: 'string', value: trimmed.slice(1, -1) };
        }
        if (!isNaN(trimmed)) {
            return { type: 'number', value: parseFloat(trimmed) };
        }
        if (trimmed.toUpperCase() === 'NULL') {
            return { type: 'null', value: null };
        }
        return { type: 'expression', value: trimmed.toUpperCase() };
    }

    /**
     * Parse column definitions for CREATE TABLE
     */
    parseColumnDefinitions(colDefStr) {
        const columns = [];
        const constraints = [];
        
        // Split column definitions, respecting parentheses
        const defs = this.splitColumnDefinitions(colDefStr);
        
        for (const def of defs) {
            const trimmed = def.trim();
            
            // Check for table constraints
            if (trimmed.startsWith('CONSTRAINT') || 
                trimmed.startsWith('PRIMARY KEY') ||
                trimmed.startsWith('FOREIGN KEY') ||
                trimmed.startsWith('UNIQUE') ||
                trimmed.startsWith('CHECK')) {
                constraints.push(this.parseTableConstraint(trimmed));
                continue;
            }
            
            // Parse column definition
            const colMatch = trimmed.match(/^(\w+)\s+(\w+(?:\([^)]*\))?)(.*)$/i);
            if (colMatch) {
                const colName = colMatch[1].toUpperCase();
                const dataType = colMatch[2].toUpperCase();
                const constraintsStr = colMatch[3].toUpperCase();
                
                const column = {
                    name: colName,
                    type: dataType,
                    constraints: []
                };
                
                // Parse column constraints
                if (constraintsStr.includes('PRIMARY KEY')) {
                    column.constraints.push({ type: 'PRIMARY KEY' });
                }
                if (constraintsStr.includes('NOT NULL')) {
                    column.constraints.push({ type: 'NOT NULL' });
                }
                if (constraintsStr.includes('UNIQUE')) {
                    column.constraints.push({ type: 'UNIQUE' });
                }
                if (constraintsStr.includes('DEFAULT')) {
                    const defaultMatch = constraintsStr.match(/DEFAULT\s+(.+?)(?:\s+|$)/i);
                    if (defaultMatch) {
                        column.constraints.push({ type: 'DEFAULT', value: defaultMatch[1].trim() });
                    }
                }
                if (constraintsStr.includes('REFERENCES')) {
                    const fkMatch = constraintsStr.match(/REFERENCES\s+(\w+)\s*\((\w+)\)/i);
                    if (fkMatch) {
                        column.constraints.push({ 
                            type: 'FOREIGN KEY', 
                            references: { table: fkMatch[1].toUpperCase(), column: fkMatch[2].toUpperCase() }
                        });
                    }
                }
                
                columns.push(column);
            }
        }
        
        return { columns, constraints };
    }

    /**
     * Split column definitions respecting parentheses
     */
    splitColumnDefinitions(colDefStr) {
        const defs = [];
        let current = '';
        let depth = 0;
        
        for (const char of colDefStr) {
            if (char === '(') depth++;
            else if (char === ')') depth--;
            
            if (char === ',' && depth === 0) {
                defs.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        if (current.trim()) {
            defs.push(current.trim());
        }
        
        return defs;
    }

    /**
     * Parse table-level constraint
     */
    parseTableConstraint(constraintStr) {
        const trimmed = constraintStr.trim();
        
        // Named constraint
        const namedMatch = trimmed.match(/^CONSTRAINT\s+(\w+)\s+(.+)$/i);
        if (namedMatch) {
            return {
                name: namedMatch[1].toUpperCase(),
                definition: this.parseConstraintDefinition(namedMatch[2])
            };
        }
        
        return { definition: this.parseConstraintDefinition(trimmed) };
    }

    /**
     * Parse constraint definition
     */
    parseConstraintDefinition(defStr) {
        const trimmed = defStr.trim();
        
        if (trimmed.startsWith('PRIMARY KEY')) {
            const colsMatch = trimmed.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
            return {
                type: 'PRIMARY KEY',
                columns: colsMatch ? colsMatch[1].split(',').map(c => c.trim().toUpperCase()) : []
            };
        }
        
        if (trimmed.startsWith('FOREIGN KEY')) {
            const fkMatch = trimmed.match(/FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+(\w+)\s*\(([^)]+)\)/i);
            if (fkMatch) {
                return {
                    type: 'FOREIGN KEY',
                    columns: fkMatch[1].split(',').map(c => c.trim().toUpperCase()),
                    references: {
                        table: fkMatch[2].toUpperCase(),
                        columns: fkMatch[3].split(',').map(c => c.trim().toUpperCase())
                    }
                };
            }
        }
        
        if (trimmed.startsWith('UNIQUE')) {
            const colsMatch = trimmed.match(/UNIQUE\s*\(([^)]+)\)/i);
            return {
                type: 'UNIQUE',
                columns: colsMatch ? colsMatch[1].split(',').map(c => c.trim().toUpperCase()) : []
            };
        }
        
        if (trimmed.startsWith('CHECK')) {
            const exprMatch = trimmed.match(/CHECK\s*\(([^)]+)\)/i);
            return {
                type: 'CHECK',
                expression: exprMatch ? exprMatch[1] : trimmed
            };
        }
        
        return { type: 'UNKNOWN', raw: trimmed };
    }
}

/**
 * SQL Validator - Validates parsed queries against requirements
 */
class SQLValidator {
    constructor(schema) {
        this.schema = schema || {};
        this.parser = new SQLParser();
    }

    /**
     * Validate a query against the schema and requirements
     * @param {Object} parsed - Parsed query
     * @param {Object} requirements - Expected query components
     * @returns {Object} Validation results
     */
    validate(parsed, requirements) {
        const errors = [];
        const warnings = [];

        // Check statement type
        if (requirements.statementType && parsed.statementType !== requirements.statementType) {
            errors.push(`Expected ${requirements.statementType} statement, got ${parsed.statementType}`);
        }

        // Validate tables exist in schema
        if (parsed.tables.length > 0) {
            for (const table of parsed.tables) {
                if (!this.schema[table]) {
                    errors.push(`Table '${table}' does not exist in the schema`);
                }
            }
        }

        // Validate columns exist in tables
        if (parsed.columns.length > 0 && parsed.tables.length > 0) {
            for (const col of parsed.columns) {
                if (typeof col === 'string' && col !== '*') {
                    const colExists = this.checkColumnExists(col, parsed.tables);
                    if (!colExists) {
                        warnings.push(`Column '${col}' may not exist in the specified tables`);
                    }
                }
            }
        }

        // Validate required tables
        if (requirements.requiredTables) {
            for (const reqTable of requirements.requiredTables) {
                if (!parsed.tables.includes(reqTable.toUpperCase())) {
                    errors.push(`Missing required table: ${reqTable}`);
                }
            }
        }

        // Validate required columns
        if (requirements.requiredColumns) {
            for (const reqCol of requirements.requiredColumns) {
                const colFound = parsed.columns.some(c => 
                    typeof c === 'string' ? c.toUpperCase() === reqCol.toUpperCase() :
                    c.name === reqCol.toUpperCase()
                );
                if (!colFound && !parsed.columns.includes('*')) {
                    errors.push(`Missing required column: ${reqCol}`);
                }
            }
        }

        // Validate JOIN requirements
        if (requirements.requiredJoins) {
            for (const reqJoin of requirements.requiredJoins) {
                const joinFound = parsed.joins.some(j => 
                    j.table.toUpperCase() === reqJoin.table.toUpperCase() &&
                    j.type === reqJoin.type.toUpperCase()
                );
                if (!joinFound) {
                    errors.push(`Missing required ${reqJoin.type} JOIN with ${reqJoin.table}`);
                }
            }
        }

        // Validate WHERE conditions
        if (requirements.requiredWhere) {
            for (const reqWhere of requirements.requiredWhere) {
                const whereFound = parsed.whereConditions.some(w => 
                    w.column && w.column.includes(reqWhere.column.toUpperCase())
                );
                if (!whereFound) {
                    errors.push(`Missing required WHERE condition on column: ${reqWhere.column}`);
                }
            }
        }

        // Validate aggregation
        if (requirements.requiresAggregation && parsed.aggregates.length === 0) {
            errors.push('Query requires an aggregate function (COUNT, SUM, AVG, MAX, MIN)');
        }

        // Validate GROUP BY
        if (requirements.requiresGroupBy && parsed.groupBy.length === 0) {
            errors.push('Query requires GROUP BY clause');
        }

        // Validate ORDER BY
        if (requirements.requiredOrderBy) {
            for (const reqOrder of requirements.requiredOrderBy) {
                const orderFound = parsed.orderBy.some(o => 
                    o.column === reqOrder.column.toUpperCase() &&
                    o.direction === reqOrder.direction.toUpperCase()
                );
                if (!orderFound) {
                    errors.push(`Missing required ORDER BY ${reqOrder.column} ${reqOrder.direction}`);
                }
            }
        }

        // Validate constraints for DDL
        if (requirements.requiredConstraints) {
            for (const reqConstraint of requirements.requiredConstraints) {
                const constraintFound = parsed.constraints.some(c => {
                    const def = c.definition || c;
                    return def.type === reqConstraint.type.toUpperCase();
                });
                if (!constraintFound) {
                    errors.push(`Missing required constraint: ${reqConstraint.type}`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Check if a column exists in any of the specified tables
     */
    checkColumnExists(column, tables) {
        const colUpper = column.toUpperCase();
        
        for (const table of tables) {
            const tableSchema = this.schema[table];
            if (tableSchema && tableSchema.columns) {
                if (tableSchema.columns.some(c => c.toUpperCase() === colUpper || 
                    c.toUpperCase().startsWith(colUpper + ' '))) {
                    return true;
                }
            }
        }
        
        // Check for qualified column names (table.column)
        if (colUpper.includes('.')) {
            return true; // Assume valid if qualified
        }
        
        return false;
    }

    /**
     * Validate syntax (basic checks)
     */
    validateSyntax(query) {
        const errors = [];
        const normalized = query.toUpperCase().trim();

        // Check for balanced parentheses
        let depth = 0;
        for (const char of normalized) {
            if (char === '(') depth++;
            else if (char === ')') depth--;
            if (depth < 0) {
                errors.push('Unbalanced parentheses: extra closing parenthesis');
                break;
            }
        }
        if (depth > 0) {
            errors.push('Unbalanced parentheses: missing closing parenthesis');
        }

        // Check for SELECT without FROM
        if (normalized.startsWith('SELECT') && !normalized.includes('FROM')) {
            errors.push('SELECT statement missing FROM clause');
        }

        // Check for unmatched quotes
        const singleQuotes = (normalized.match(/'/g) || []).length;
        if (singleQuotes % 2 !== 0) {
            errors.push('Unmatched single quote');
        }

        // Check for common keywords
        const hasValidStart = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'WITH'].some(
            kw => normalized.startsWith(kw)
        );
        if (!hasValidStart) {
            errors.push('Query does not start with a valid SQL keyword');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

/**
 * SQL Query Comparator - Compares two queries for equivalence
 */
class SQLComparator {
    constructor() {
        this.parser = new SQLParser();
    }

    /**
     * Compare two SQL queries for equivalence
     * @param {string} query1 - First query
     * @param {string} query2 - Second query
     * @returns {Object} Comparison results
     */
    compare(query1, query2) {
        const parsed1 = this.parser.parse(query1);
        const parsed2 = this.parser.parse(query2);

        const differences = [];
        const matches = [];

        // Compare statement types
        if (parsed1.statementType !== parsed2.statementType) {
            differences.push({
                type: 'statementType',
                expected: parsed2.statementType,
                actual: parsed1.statementType
            });
        } else {
            matches.push('statementType');
        }

        // Compare tables
        const tableDiff = this.compareArrays(parsed1.tables, parsed2.tables);
        if (tableDiff.missing.length > 0 || tableDiff.extra.length > 0) {
            differences.push({
                type: 'tables',
                missing: tableDiff.missing,
                extra: tableDiff.extra
            });
        } else {
            matches.push('tables');
        }

        // Compare columns
        const cols1 = parsed1.columns.map(c => typeof c === 'string' ? c : c.name);
        const cols2 = parsed2.columns.map(c => typeof c === 'string' ? c : c.name);
        const colDiff = this.compareArrays(cols1, cols2);
        if (colDiff.missing.length > 0 || colDiff.extra.length > 0) {
            differences.push({
                type: 'columns',
                missing: colDiff.missing,
                extra: colDiff.extra
            });
        } else {
            matches.push('columns');
        }

        // Compare JOINs
        const joinDiff = this.compareJoins(parsed1.joins, parsed2.joins);
        if (joinDiff.length > 0) {
            differences.push({ type: 'joins', details: joinDiff });
        } else {
            matches.push('joins');
        }

        // Compare WHERE conditions
        const whereDiff = this.compareWhereConditions(parsed1.whereConditions, parsed2.whereConditions);
        if (whereDiff.length > 0) {
            differences.push({ type: 'whereConditions', details: whereDiff });
        } else {
            matches.push('whereConditions');
        }

        // Compare GROUP BY
        const groupByDiff = this.compareArrays(parsed1.groupBy, parsed2.groupBy);
        if (groupByDiff.missing.length > 0 || groupByDiff.extra.length > 0) {
            differences.push({
                type: 'groupBy',
                missing: groupByDiff.missing,
                extra: groupByDiff.extra
            });
        } else {
            matches.push('groupBy');
        }

        // Compare ORDER BY
        const orderByDiff = this.compareOrderBy(parsed1.orderBy, parsed2.orderBy);
        if (orderByDiff.length > 0) {
            differences.push({ type: 'orderBy', details: orderByDiff });
        } else {
            matches.push('orderBy');
        }

        // Compare aggregates
        const aggDiff = this.compareAggregates(parsed1.aggregates, parsed2.aggregates);
        if (aggDiff.length > 0) {
            differences.push({ type: 'aggregates', details: aggDiff });
        } else {
            matches.push('aggregates');
        }

        // Calculate similarity score
        const totalComponents = ['statementType', 'tables', 'columns', 'joins', 'whereConditions', 'groupBy', 'orderBy', 'aggregates'].length;
        const similarityScore = matches.length / totalComponents;

        return {
            isExactMatch: differences.length === 0 && this.normalizeQuery(query1) === this.normalizeQuery(query2),
            isSemanticallyEquivalent: differences.length === 0,
            similarityScore,
            differences,
            matches,
            parsed1,
            parsed2
        };
    }

    /**
     * Normalize query for exact comparison
     */
    normalizeQuery(query) {
        return query
            .replace(/\s+/g, ' ')
            .replace(/\s*,\s*/g, ',')
            .replace(/\s*\(\s*/g, '(')
            .replace(/\s*\)\s*/g, ')')
            .trim()
            .toUpperCase();
    }

    /**
     * Compare two arrays
     */
    compareArrays(arr1, arr2) {
        const set1 = new Set(arr1.map(s => s.toUpperCase()));
        const set2 = new Set(arr2.map(s => s.toUpperCase()));
        
        const missing = [...set2].filter(x => !set1.has(x));
        const extra = [...set1].filter(x => !set2.has(x));
        
        return { missing, extra };
    }

    /**
     * Compare JOINs
     */
    compareJoins(joins1, joins2) {
        const differences = [];
        
        for (const join2 of joins2) {
            const match = joins1.find(j => 
                j.table.toUpperCase() === join2.table.toUpperCase()
            );
            
            if (!match) {
                differences.push({
                    expected: join2,
                    actual: null,
                    issue: 'missing'
                });
            } else if (match.type !== join2.type) {
                differences.push({
                    expected: join2,
                    actual: match,
                    issue: 'wrongType'
                });
            }
        }
        
        for (const join1 of joins1) {
            const match = joins2.find(j => 
                j.table.toUpperCase() === join1.table.toUpperCase()
            );
            if (!match) {
                differences.push({
                    expected: null,
                    actual: join1,
                    issue: 'extra'
                });
            }
        }
        
        return differences;
    }

    /**
     * Compare WHERE conditions
     */
    compareWhereConditions(where1, where2) {
        const differences = [];
        
        // Simple comparison - check if required columns are present
        for (const cond2 of where2) {
            const hasColumn = where1.some(w => 
                w.column && cond2.column && 
                (w.column === cond2.column || w.column.includes(cond2.column))
            );
            
            if (!hasColumn && cond2.column) {
                differences.push({
                    expected: cond2,
                    issue: 'missingCondition'
                });
            }
        }
        
        return differences;
    }

    /**
     * Compare ORDER BY clauses
     */
    compareOrderBy(order1, order2) {
        const differences = [];
        
        for (let i = 0; i < order2.length; i++) {
            if (i >= order1.length) {
                differences.push({
                    expected: order2[i],
                    actual: null,
                    issue: 'missing'
                });
            } else if (order1[i].column !== order2[i].column || 
                       order1[i].direction !== order2[i].direction) {
                differences.push({
                    expected: order2[i],
                    actual: order1[i],
                    issue: 'different'
                });
            }
        }
        
        return differences;
    }

    /**
     * Compare aggregate functions
     */
    compareAggregates(agg1, agg2) {
        const differences = [];
        
        for (const agg of agg2) {
            const found = agg1.some(a => 
                a.function === agg.function && 
                (a.column === agg.column || agg.column === '*')
            );
            
            if (!found) {
                differences.push({
                    expected: agg,
                    issue: 'missing'
                });
            }
        }
        
        return differences;
    }
}

/**
 * Feedback Generator - Generates human-readable feedback
 */
class FeedbackGenerator {
    constructor() {
        this.feedbackMessages = {
            exactMatch: 'Correct! Your query returns the expected results.',
            semanticMatch: 'Correct! Your query is semantically equivalent to the expected solution.',
            missingTable: (table) => `Missing table: ${table}. Check your FROM clause.`,
            missingColumn: (col) => `Missing column: ${col}. Make sure to select all required columns.`,
            missingJoin: (join) => `Missing JOIN with ${join.table}. Remember to include all necessary tables.`,
            wrongJoinType: (expected, actual) => `Wrong JOIN type. Expected ${expected}, but got ${actual}.`,
            missingWhere: 'Missing WHERE clause. Remember to filter your results appropriately.',
            missingCondition: (col) => `Missing condition on column: ${col}. Check your WHERE clause.`,
            missingGroupBy: 'Missing GROUP BY clause. You need to group results when using aggregate functions.',
            missingOrderBy: 'Missing or incorrect ORDER BY clause. Check the sorting requirements.',
            missingAggregate: 'Missing aggregate function. Consider using COUNT, SUM, AVG, MAX, or MIN.',
            syntaxError: (error) => `Syntax error: ${error}`,
            wrongStatementType: (expected, actual) => `Wrong statement type. Expected ${expected}, but wrote ${actual}.`,
            missingConstraint: (type) => `Missing ${type} constraint. Check your table definition.`,
            missingPrimaryKey: 'Missing PRIMARY KEY constraint. Every table should have a primary key.',
            missingForeignKey: (col) => `Missing FOREIGN KEY constraint on ${col}. Check your references.`,
            incorrectWhere: 'Your WHERE clause filters out valid results. Review the filtering conditions.',
            wrongApproach: 'Your query approach is incorrect. Consider re-reading the question requirements.',
            generalHint: 'Keep trying! Review SQL syntax and the question requirements.'
        };
    }

    /**
     * Generate feedback based on comparison and validation results
     * @param {Object} comparison - Comparison results
     * @param {Object} validation - Validation results
     * @param {string} questionType - Type of question (SELECT, DDL, DML)
     * @returns {Object} Feedback object
     */
    generate(comparison, validation, questionType) {
        if (comparison.isExactMatch) {
            return {
                message: this.feedbackMessages.exactMatch,
                type: 'success',
                suggestions: []
            };
        }

        if (comparison.isSemanticallyEquivalent && validation.valid) {
            return {
                message: this.feedbackMessages.semanticMatch,
                type: 'success',
                suggestions: []
            };
        }

        const suggestions = [];
        const errors = [];

        // Process comparison differences
        for (const diff of comparison.differences) {
            switch (diff.type) {
                case 'statementType':
                    errors.push(this.feedbackMessages.wrongStatementType(
                        diff.expected, diff.actual
                    ));
                    break;
                case 'tables':
                    if (diff.missing) {
                        diff.missing.forEach(t => suggestions.push(this.feedbackMessages.missingTable(t)));
                    }
                    break;
                case 'columns':
                    if (diff.missing) {
                        diff.missing.forEach(c => suggestions.push(this.feedbackMessages.missingColumn(c)));
                    }
                    break;
                case 'joins':
                    if (diff.details) {
                        diff.details.forEach(j => {
                            if (j.issue === 'missing') {
                                suggestions.push(this.feedbackMessages.missingJoin(j.expected));
                            } else if (j.issue === 'wrongType') {
                                suggestions.push(this.feedbackMessages.wrongJoinType(
                                    j.expected.type, j.actual.type
                                ));
                            }
                        });
                    }
                    break;
                case 'whereConditions':
                    if (diff.details && diff.details.length > 0) {
                        diff.details.forEach(w => {
                            if (w.issue === 'missingCondition') {
                                suggestions.push(this.feedbackMessages.missingCondition(w.expected.column));
                            }
                        });
                    }
                    break;
                case 'groupBy':
                    if (diff.missing && diff.missing.length > 0) {
                        suggestions.push(this.feedbackMessages.missingGroupBy);
                    }
                    break;
                case 'orderBy':
                    if (diff.details && diff.details.length > 0) {
                        suggestions.push(this.feedbackMessages.missingOrderBy);
                    }
                    break;
                case 'aggregates':
                    if (diff.details && diff.details.length > 0) {
                        suggestions.push(this.feedbackMessages.missingAggregate);
                    }
                    break;
            }
        }

        // Process validation errors
        for (const error of validation.errors) {
            errors.push(error);
        }

        // Generate specific hints based on question type
        const hints = this.generateHints(questionType, comparison, validation);

        let message;
        if (errors.length > 0) {
            message = errors[0];
        } else if (suggestions.length > 0) {
            message = suggestions[0];
        } else {
            message = this.feedbackMessages.generalHint;
        }

        return {
            message,
            type: errors.length > 0 ? 'error' : 'warning',
            suggestions: [...suggestions.slice(1), ...hints],
            allErrors: errors,
            allSuggestions: suggestions
        };
    }

    /**
     * Generate specific hints based on question type
     */
    generateHints(questionType, comparison, validation) {
        const hints = [];

        switch (questionType) {
            case 'SELECT':
                if (comparison.parsed1.joins.length === 0 && comparison.parsed2.joins.length > 0) {
                    hints.push('You may need to JOIN multiple tables to get all required data.');
                }
                if (comparison.parsed1.whereConditions.length === 0 && comparison.parsed2.whereConditions.length > 0) {
                    hints.push('Consider adding a WHERE clause to filter the results.');
                }
                if (comparison.parsed1.aggregates.length === 0 && comparison.parsed2.aggregates.length > 0) {
                    hints.push('This question requires calculating summary statistics. Use an aggregate function.');
                }
                break;
            case 'DDL':
                if (comparison.parsed1.constraints.length === 0 && comparison.parsed2.constraints.length > 0) {
                    hints.push('Remember to define constraints like PRIMARY KEY, FOREIGN KEY, etc.');
                }
                break;
            case 'DML':
                if (comparison.parsed1.whereConditions.length === 0 && comparison.parsed2.whereConditions.length > 0) {
                    hints.push('Be careful! Without a WHERE clause, you will affect all rows.');
                }
                break;
        }

        return hints;
    }
}

/**
 * Query Execution Simulator - Simulates query execution
 */
class ExecutionSimulator {
    constructor(schema) {
        this.schema = schema || {};
    }

    /**
     * Simulate query execution
     * @param {Object} parsed - Parsed query
     * @returns {Object} Execution results
     */
    simulate(parsed) {
        switch (parsed.statementType) {
            case 'SELECT':
                return this.simulateSelect(parsed);
            case 'INSERT':
                return this.simulateInsert(parsed);
            case 'UPDATE':
                return this.simulateUpdate(parsed);
            case 'DELETE':
                return this.simulateDelete(parsed);
            case 'CREATE':
                return this.simulateCreate(parsed);
            case 'ALTER':
                return this.simulateAlter(parsed);
            case 'DROP':
                return this.simulateDrop(parsed);
            default:
                return { error: 'Cannot simulate unknown statement type' };
        }
    }

    /**
     * Simulate SELECT execution
     */
    simulateSelect(parsed) {
        const resultSet = [];
        let estimatedRows = 0;
        let columns = [];

        // Determine result columns
        if (parsed.columns.includes('*')) {
            // Get all columns from all tables
            for (const table of parsed.tables) {
                const tableSchema = this.schema[table];
                if (tableSchema) {
                    columns.push(...tableSchema.columns.map(c => {
                        const colName = c.split(' ')[0];
                        return `${table}.${colName}`;
                    }));
                }
            }
        } else {
            columns = parsed.columns;
        }

        // Estimate row count based on WHERE conditions
        estimatedRows = this.estimateRowCount(parsed.tables, parsed.whereConditions);

        // Generate sample result set (first 3 rows)
        for (let i = 0; i < Math.min(3, estimatedRows); i++) {
            const row = {};
            columns.forEach(col => {
                row[col] = this.generateSampleValue(col);
            });
            resultSet.push(row);
        }

        return {
            statementType: 'SELECT',
            columns,
            rowCount: estimatedRows,
            sampleResults: resultSet,
            hasMoreRows: estimatedRows > 3
        };
    }

    /**
     * Simulate INSERT execution
     */
    simulateInsert(parsed) {
        const table = parsed.tables[0];
        const columns = parsed.columns;
        const values = parsed.values;

        return {
            statementType: 'INSERT',
            table,
            columns,
            rowsAffected: 1,
            message: `1 row inserted into ${table}`
        };
    }

    /**
     * Simulate UPDATE execution
     */
    simulateUpdate(parsed) {
        const table = parsed.tables[0];
        const estimatedRows = this.estimateRowCount([table], parsed.whereConditions);

        return {
            statementType: 'UPDATE',
            table,
            columns: parsed.columns,
            rowsAffected: estimatedRows,
            message: `${estimatedRows} row(s) updated in ${table}`
        };
    }

    /**
     * Simulate DELETE execution
     */
    simulateDelete(parsed) {
        const table = parsed.tables[0];
        const estimatedRows = this.estimateRowCount([table], parsed.whereConditions);

        return {
            statementType: 'DELETE',
            table,
            rowsAffected: estimatedRows,
            message: `${estimatedRows} row(s) deleted from ${table}`
        };
    }

    /**
     * Simulate CREATE TABLE execution
     */
    simulateCreate(parsed) {
        const table = parsed.tables[0];
        
        return {
            statementType: 'CREATE TABLE',
            table,
            columns: parsed.columns.length,
            constraints: parsed.constraints.length,
            message: `Table ${table} created successfully with ${parsed.columns.length} column(s)`
        };
    }

    /**
     * Simulate ALTER TABLE execution
     */
    simulateAlter(parsed) {
        const table = parsed.tables[0];
        
        return {
            statementType: 'ALTER TABLE',
            table,
            message: `Table ${table} altered successfully`
        };
    }

    /**
     * Simulate DROP TABLE execution
     */
    simulateDrop(parsed) {
        const table = parsed.tables[0];
        
        return {
            statementType: 'DROP TABLE',
            table,
            message: `Table ${table} dropped successfully`
        };
    }

    /**
     * Estimate row count based on conditions
     */
    estimateRowCount(tables, whereConditions) {
        // Simplified estimation
        let baseCount = tables.length * 10;
        
        if (whereConditions.length > 0) {
            baseCount = Math.floor(baseCount / (whereConditions.length + 1));
        }
        
        return Math.max(1, baseCount);
    }

    /**
     * Generate a sample value for a column
     */
    generateSampleValue(column) {
        const colLower = column.toLowerCase();
        
        if (colLower.includes('id')) {
            return Math.floor(Math.random() * 1000) + 1;
        }
        if (colLower.includes('name')) {
            return 'SampleName';
        }
        if (colLower.includes('salary')) {
            return Math.floor(Math.random() * 80000) + 30000;
        }
        if (colLower.includes('date')) {
            return '2024-01-15';
        }
        
        return 'SampleValue';
    }
}

/**
 * Main SQL Evaluator class
 */
class SQLEvaluator {
    constructor(schema = sampleSchema) {
        this.schema = schema;
        this.parser = new SQLParser();
        this.validator = new SQLValidator(schema);
        this.comparator = new SQLComparator();
        this.feedbackGenerator = new FeedbackGenerator();
        this.simulator = new ExecutionSimulator(schema);
    }

    /**
     * Evaluate a student SQL query against an expected query
     * @param {string} studentQuery - The student's SQL query
     * @param {string} expectedQuery - The expected/correct SQL query
     * @param {string} questionType - Type of question (SELECT, DDL, DML)
     * @param {Object} options - Additional evaluation options
     * @returns {Object} Evaluation results
     */
    evaluate(studentQuery, expectedQuery, questionType = 'SELECT', options = {}) {
        // Parse both queries
        const studentParsed = this.parser.parse(studentQuery);
        const expectedParsed = this.parser.parse(expectedQuery);

        // Check for parse errors
        if (studentParsed.error) {
            return {
                score: 0,
                feedback: `Parse error: ${studentParsed.error}`,
                isCorrect: false,
                details: {
                    parseError: true,
                    error: studentParsed.error
                }
            };
        }

        // Validate syntax
        const syntaxValidation = this.validator.validateSyntax(studentQuery);
        if (!syntaxValidation.valid) {
            return {
                score: 0,
                feedback: this.feedbackGenerator.feedbackMessages.syntaxError(syntaxValidation.errors[0]),
                isCorrect: false,
                details: {
                    syntaxError: true,
                    errors: syntaxValidation.errors
                }
            };
        }

        // Compare queries
        const comparison = this.comparator.compare(studentQuery, expectedQuery);

        // Build requirements for validation
        const requirements = this.buildRequirements(expectedParsed, questionType);
        
        // Validate against schema
        const validation = this.validator.validate(studentParsed, requirements);

        // Generate feedback
        const feedback = this.feedbackGenerator.generate(comparison, validation, questionType);

        // Calculate score
        const score = this.calculateScore(comparison, validation, options);

        // Simulate execution
        const execution = this.simulator.simulate(studentParsed);
        const expectedExecution = this.simulator.simulate(expectedParsed);

        return {
            score,
            feedback: feedback.message,
            fullFeedback: feedback,
            isCorrect: score >= (options.passThreshold || 1.0),
            details: {
                comparison,
                validation,
                execution,
                expectedExecution,
                parsed: {
                    student: studentParsed,
                    expected: expectedParsed
                }
            }
        };
    }

    /**
     * Build requirements object from expected query
     */
    buildRequirements(expectedParsed, questionType) {
        const requirements = {
            statementType: expectedParsed.statementType,
            requiredTables: expectedParsed.tables,
            requiredColumns: expectedParsed.columns.map(c => 
                typeof c === 'string' ? c : c.name
            ).filter(c => c !== '*'),
            requiredJoins: expectedParsed.joins,
            requiredWhere: expectedParsed.whereConditions,
            requiresGroupBy: expectedParsed.groupBy.length > 0,
            requiredOrderBy: expectedParsed.orderBy,
            requiresAggregation: expectedParsed.aggregates.length > 0,
            requiredConstraints: expectedParsed.constraints
        };

        return requirements;
    }

    /**
     * Calculate score based on comparison and validation
     */
    calculateScore(comparison, validation, options) {
        const { partialCredit = true } = options;

        // Exact match = full points
        if (comparison.isExactMatch) {
            return 1.0;
        }

        // Semantic match = full points
        if (comparison.isSemanticallyEquivalent && validation.valid) {
            return 1.0;
        }

        if (!partialCredit) {
            return 0.0;
        }

        // Calculate partial credit
        let points = comparison.similarityScore * 0.7;

        // Deduct for validation errors
        const errorPenalty = validation.errors.length * 0.1;
        points -= errorPenalty;

        // Ensure score is between 0 and 1
        return Math.max(0, Math.min(1, points));
    }

    /**
     * Set or update the schema
     * @param {Object} schema - Database schema
     */
    setSchema(schema) {
        this.schema = schema;
        this.validator = new SQLValidator(schema);
        this.simulator = new ExecutionSimulator(schema);
    }

    /**
     * Quick check if a query is syntactically valid
     * @param {string} query - SQL query to check
     * @returns {boolean} True if valid
     */
    isValidSyntax(query) {
        const result = this.validator.validateSyntax(query);
        return result.valid;
    }

    /**
     * Get a summary of query components
     * @param {string} query - SQL query
     * @returns {Object} Query components summary
     */
    analyze(query) {
        const parsed = this.parser.parse(query);
        const validation = this.validator.validateSyntax(query);
        const execution = this.simulator.simulate(parsed);

        return {
            components: parsed,
            syntax: validation,
            estimatedExecution: execution
        };
    }
}

// ============================================================================
// Sample Database Schema
// ============================================================================

const sampleSchema = {
    Employee: {
        columns: ['EmployeeID INT', 'FirstName VARCHAR(50)', 'LastName VARCHAR(50)', 
                  'Salary DECIMAL(10,2)', 'DeptID INT', 'HireDate DATE'],
        primaryKey: 'EmployeeID',
        foreignKeys: { DeptID: 'Department.DeptID' }
    },
    Department: {
        columns: ['DeptID INT', 'DeptName VARCHAR(50)', 'Location VARCHAR(50)', 
                  'ManagerID INT'],
        primaryKey: 'DeptID'
    },
    Project: {
        columns: ['ProjectID INT', 'ProjectName VARCHAR(100)', 'Budget DECIMAL(12,2)', 
                  'StartDate DATE', 'EndDate DATE'],
        primaryKey: 'ProjectID'
    },
    WorksOn: {
        columns: ['EmployeeID INT', 'ProjectID INT', 'Hours DECIMAL(5,2)'],
        primaryKey: ['EmployeeID', 'ProjectID'],
        foreignKeys: { 
            EmployeeID: 'Employee.EmployeeID',
            ProjectID: 'Project.ProjectID'
        }
    },
    Customer: {
        columns: ['CustomerID INT', 'CustomerName VARCHAR(100)', 'Email VARCHAR(100)', 
                  'Phone VARCHAR(20)', 'City VARCHAR(50)'],
        primaryKey: 'CustomerID'
    },
    Orders: {
        columns: ['OrderID INT', 'CustomerID INT', 'OrderDate DATE', 
                  'TotalAmount DECIMAL(10,2)'],
        primaryKey: 'OrderID',
        foreignKeys: { CustomerID: 'Customer.CustomerID' }
    },
    OrderItem: {
        columns: ['OrderItemID INT', 'OrderID INT', 'ProductID INT', 
                  'Quantity INT', 'UnitPrice DECIMAL(10,2)'],
        primaryKey: 'OrderItemID',
        foreignKeys: { OrderID: 'Orders.OrderID' }
    },
    Product: {
        columns: ['ProductID INT', 'ProductName VARCHAR(100)', 'Category VARCHAR(50)', 
                  'Price DECIMAL(10,2)', 'StockQuantity INT'],
        primaryKey: 'ProductID'
    }
};

// ============================================================================
// Export for different environments
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        SQLEvaluator,
        SQLParser,
        SQLValidator,
        SQLComparator,
        FeedbackGenerator,
        ExecutionSimulator,
        sampleSchema
    };
} else if (typeof window !== 'undefined') {
    // Browser environment
    window.SQLEvaluator = SQLEvaluator;
    window.SQLParser = SQLParser;
    window.SQLValidator = SQLValidator;
    window.SQLComparator = SQLComparator;
    window.FeedbackGenerator = FeedbackGenerator;
    window.ExecutionSimulator = ExecutionSimulator;
    window.sampleSchema = sampleSchema;
}
