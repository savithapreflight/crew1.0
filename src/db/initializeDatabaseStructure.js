import {createTable} from './createTable';
import getDBConnection from './index';
import db from './index';
import {TABLE_NAMES} from './tableNames';
import {TableValueGenerator} from './tableValueGenerator';
import {TABLE_VALUES} from './tableValues';

export const initializeDatabaseStructure = async () => {
  try {
    // console.log('Initializing database structure...');
    // -------------------------------------------------------------------------------------------------
    const personal_details = await TableValueGenerator(TABLE_VALUES.personal_details);
    await createTable(TABLE_NAMES.personal_details, personal_details);
    // console.log('Table personal_details created.');

    // -------------------------------------------------------------------------------------------------
    const roster_details = await TableValueGenerator(TABLE_VALUES.roster_details);
    await createTable(TABLE_NAMES.roster_details, roster_details);
    // console.log('Table roster_details created.');

    // -------------------------------------------------------------------------------------------------
    const navdata_details = await TableValueGenerator(TABLE_VALUES.navdata_details);
    await createTable(TABLE_NAMES.navdata_details, navdata_details);
    // console.log('Table navdata_details created.');

    // -------------------------------------------------------------------------------------------------
    const leave_request = await TableValueGenerator(TABLE_VALUES.leave_request);
    await createTable(TABLE_NAMES.leave_request, leave_request);
   

      // -------------------------------------------------------------------------------------------------
      const leave_types = await TableValueGenerator(TABLE_VALUES.leave_types);
      await createTable(TABLE_NAMES.leave_types, leave_types);

       // -------------------------------------------------------------------------------------------------
       const leave_summary = await TableValueGenerator(TABLE_VALUES.leave_summary);
       await createTable(TABLE_NAMES.leave_summary, leave_summary);

     // -------------------------------------------------------------------------------------------------
     const check_ins = await TableValueGenerator(TABLE_VALUES.check_ins);
     await createTable(TABLE_NAMES.check_ins, check_ins);

      // -------------------------------------------------------------------------------------------------
     const summary = await TableValueGenerator(TABLE_VALUES.summary);
     await createTable(TABLE_NAMES.summary, summary);
       
      

   
  } catch (error) {
    console.error('Error initializing database structure:', error);
  }
};
