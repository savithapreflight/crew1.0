import getDBConnection from './index';

export const createTable = async(tableName, tableFields) => {
  let db =await getDBConnection();
    // return;
  // create table if not exists
  const quer = `DROP TABLE IF EXISTS ${tableName}(${tableFields})`;
  const query = `CREATE TABLE IF NOT EXISTS ${tableName}(${tableFields})`;
  
  await db.executeSql(quer);
  await db.executeSql(query);



};
