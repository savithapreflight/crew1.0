export const TABLE_VALUES = {
  roster_details: {
    
    crewCode: 'string',
    crewDesig: 'string',
    flightDate: '2022-12-28T05:15:41.353Z',
    patternNo: 'string',
    flightNo: 'string',
    deptTime: '2022-12-28T05:15:41.353Z',
    arrTime: '2022-12-28T05:15:41.353Z',
    startFrom: 'string',
    endsAt: 'string',
    flightFrom: 'string',
    flightTo: 'string',
    restPeriod: '2022-12-28T05:15:41.353Z',
    aircraftType: 'string',
    patternStTime: '2022-12-28T05:15:41.353Z',
    patternEndTime: '2022-12-28T05:15:41.353Z',
    id: 0,
    isVoilated: 'string',
    voilationReason: 'string',
    reptIn: 0,
    reptOut: 0,
    checkinTime:'string',
    repInTime:'string',
    repOutTime:'string',
    repInLat:'string',
    repInLog:'string',
    repOutLat:'string',
    repOutLog:'string',
    createdDate: '2022-12-28T05:15:41.353Z',
    modifiedDate: '2022-12-28T05:15:41.353Z',
    
  },
  personal_details: {
    id: 0,
    empCode: 'string',
    empName: 'string',
    empDesig: 'string',
    emailId: 'string',
    base: 'string',
    empNo: 'string',
    createdDate: '2022-12-28T05:46:52.601Z',
    modifiedDate: '2022-12-28T05:46:52.601Z',
  },
  navdata_details:{
    fixId: 'string',
    iataCode:'string',
    latRad: 'number',
    lonRad: 'number',
    modifiedDate: "2006-01-01T00:00:00"
  },
  leave_request:{ 
    ids:'number',
    startDate: "string",
    endDate: "string",
    id:'number',
    type: 'string',
    dateRequested: "string",
    requestComments: 'string',
    isApproved:  'number',
    adminComments: "string",
    employeeName: 'string',
    uploaded:false
    
   },
   leave_types:{ 
    id:"number",
    type: "string",
    description: "string",
    noOfDays: 'number',
    maxSlot: 'number',
    gender: "string",
    startValidityDays: 'number',
    carryForwardDays: 'number',
    designation: "string"
   },

   leave_summary: {
    empCode: 'string',
    leaveData: [
      {
        type: 'string',
        noOfDays: 'number', 
        leaveDays: 'number'
      }
    ]
  },
  check_ins:{ 
    crewCode:'string',
    flightDate:'string',
    patternno:'string',
    Dep:'string',
    Arrival:'string',
    checkinTime:'string',
    repInLat:'number',
    repInLng:'number',
    repOutLat:'number',
    repOutLng:'number',
    repInTime:'string',
    repOutTime:'string'
   },
   summary: {
    empCode: 'string',
    leaveData: [
      {
        type: 'string',
        noOfDays: 'number', 
        leaveDays: 'number'
      }
    ]
  },
}






