import { DefaultNamingStrategy, NamingStrategyInterface, Table } from 'typeorm';
import { snakeCase } from 'typeorm/util/StringUtils';

// This helper used to trim string length
// Because postgres e.g: Primary Key, Foreign Key only accept 63 max length
// If you set the `name`  more than 63, will be trimmed by postgres to 63 char.
// And this will make our typeorm migrations and the postres incorrect.
// Because typeorm can have more than 63 char for the `name`.
function maxstr(str: string, max: number = 60) {
  return str.slice(0, max);
}

// ref: https://github.com/typeorm/typeorm/blob/master/src/naming-strategy/DefaultNamingStrategy.ts
export class CustomNamingStrategy extends DefaultNamingStrategy
  implements NamingStrategyInterface {
  columnName(
    propertyName: string,
    customName: string,
    embeddedPrefixes: string[],
  ): string {
    // If `name` provided, will be used.
    // Otherwise will take from propertyName and make as snakeCase
    const name = customName || snakeCase(propertyName);

    if (embeddedPrefixes.length) {
      return embeddedPrefixes.join('_') + name;
    }

    return name;
  }

  primaryKeyName(tableOrName: Table | string, columnNames: string[]) {
    const table = tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const columnsSnakeCase = columnNames.join('_');
    const name = `${table}__${columnsSnakeCase}`;
    return `pk_${maxstr(name)}`;
  }

  uniqueConstraintName(
    tableOrName: Table | string,
    columnNames: string[],
  ): string {
    // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
    const clonedColumnNames = [...columnNames];
    clonedColumnNames.sort();
    const tableName =
      tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const replacedTableName = tableName.replace('.', '_');
    const key = `${replacedTableName}__${clonedColumnNames.join('_')}`;
    return `uq_${maxstr(key, 59)}`;
  }

  relationConstraintName(
    tableOrName: Table | string,
    columnNames: string[],
    where?: string,
  ): string {
    // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
    const clonedColumnNames = [...columnNames];
    clonedColumnNames.sort();
    const tableName =
      tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const replacedTableName = tableName.replace('.', '_');
    let key = `${replacedTableName}__${clonedColumnNames.join('_')}`;
    if (where) {
      key += `_${where}`;
    }

    return `rel_${maxstr(key, 58)}`;
  }

  indexName(
    tableOrName: Table | string,
    columnNames: string[],
    where?: string,
  ): string {
    // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
    const clonedColumnNames = [...columnNames];
    clonedColumnNames.sort();
    const tableName =
      tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const replacedTableName = tableName.replace('.', '_');
    let key = `${replacedTableName}_${clonedColumnNames.join('_')}`;
    if (where) {
      key += `_${where}`;
    }

    return `idx_${maxstr(key, 59)}`;
  }

  // tslint:disable-next-line: variable-name
  foreignKeyName(
    tableOrName: Table | string,
    columnNames: string[],
    _referencedTablePath?: string,
    _referencedColumnNames?: string[],
  ): string {
    // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
    const clonedColumnNames = [...columnNames];
    clonedColumnNames.sort();
    const tableName =
      tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const replacedTableName = tableName.replace('.', '_');
    const key = `${replacedTableName}__${clonedColumnNames.join('_')}`;
    return `fk_${maxstr(key)}`;
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return snakeCase(relationName + '_' + referencedColumnName);
  }

  joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string,
  ): string {
    return snakeCase(
      tableName + '_' + (columnName ? columnName : propertyName),
    );
  }
}
