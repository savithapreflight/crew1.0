import React, { useContext, useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Alert } from 'react-native';
import Table from './table';
import SQLite from 'react-native-sqlite-storage';
import CrewList from './crewList';
import Utctable from './utc/utcTable';
import ToggleSwitch from '../home/switchMode';
import { AppContext } from '../../appContext';

const RosterScrn = () => {
  const { showMst } = useContext(AppContext);
  const [crewCodes, setCrewCode] = useState();
  const [monthText, setMonthText] = useState('');

  useEffect(() => {
    const db = SQLite.openDatabase({ name: 'CrewportDatabase.db', location: 'default' });

    const query = `
      SELECT crewCode, crewDesig, flightDate, patternNo, flightNo, deptTime, arrTime, startFrom, endsAt,
          flightFrom, flightTo, restPeriod, aircraftType, patternStTime, patternEndTime, id, isVoilated, voilationReason,
          reptIn, reptOut, createdDate, modifiedDate,
          strftime('%Y', flightDate) AS year,
          strftime('%m', flightDate) AS month
      FROM roster_details
      WHERE strftime('%Y-%m', flightDate) = strftime('%Y-%m', 'now', 'localtime')
    `;

    db.transaction((tx) => {
      tx.executeSql(query, [], (_, { rows }) => {
        for (let i = 0; i < rows.length; i++) {
          const crewCode = rows.item(i).crewCode;
          const year = rows.item(i).year;
          const month = rows.item(i).month;
          console.log(`Fetching data for ${getMonthName(month)} ${year}`);

          setCrewCode(crewCode);
          setMonthText(`${getMonthName(month)} ${year}`);
        }
      });
    });
  }, []);

  function getMonthName(month) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June',
      'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[parseInt(month, 10) - 1];
  }

  return (
    <View style={styles.container}>
      <View style={styles.modeContainer}>
        <ToggleSwitch />
        <Text style={styles.modeText}>{showMst ? "MST" : "UTC"}</Text>
      </View>
      <ScrollView>
        <View style={styles.contentContainer}>
          <View style={styles.headings}>
            <Text style={styles.texthead}>ROSTER REPORT-INDIVIDUAL AUG 2023</Text>
          </View>

          <View>
            <View style={styles.row}>
              <Text style={styles.heading}>NAME</Text>
              <Text style={styles.heading}>BASE</Text>
              <Text style={styles.heading}>ROSTER REPORT</Text>
              <Text style={styles.heading}>AUTHORITY</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.value}>{crewCodes}</Text>
              <Text style={styles.value}>SZB</Text>
              <Text style={styles.value}>{monthText}</Text>
              <Text style={styles.value}>Captian wan Muzairul Wan Mahazir HEAD OF FLIGHT OPERATIONS</Text>
            </View>
          </View>

          <View>
            {showMst ? <Table /> : <Utctable />}
          </View>

          <View>
            <CrewList />
          </View>
          <View style={styles.helloContainer}>
            <Text>* Make Sure all licenses are current.</Text>
            <Text>* Check your e-mail and clear your mailboxes.</Text>
            <Text>* Accidents and incidents must be reported in the appropriate form with the VRs.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default RosterScrn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16, 
  },
  contentContainer: {
    flex: 1,
    marginBottom: 16, 
  },
  headings: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  texthead: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  heading: {
    flex: 0.3,
    fontWeight: 'bold',
    fontSize:13
  },
  value: {
    flex: 0.3,
    alignItems: 'flex-start',
    fontSize:11
  },
 
  helloContainer: {
    marginTop: 20,
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
