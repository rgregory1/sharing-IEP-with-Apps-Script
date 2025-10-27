
/*****************************************************
 *   
 *    FUNCTION: getCurrentPSSectionEnrollments()
 *    
 *    
 *    
 * 
 ******************************************************/

function getCurrentPSSectionEnrollments(){

  const token = secretManagerLibrary.ensureFreshToken(
                    '1020400423324',
                    'gc_sync_clientID',
                    'gc_sync_clientsecret',
                    'gc_sync_token'
                    )

  console.log(token)

  let pageSize = 200;
  const url = 'https://missisquoi.powerschool.com/ws/schema/query/org.mvsdschools.services_share.students'


  // Clear the data currently on the sheet to prepare for the new incoming data
  
  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let dataSheet = ss.getSheetByName('data')
  dataSheet.clear()


  let options = {
    "method":"post",
    "headers":{
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    // "muteHttpExceptions": true
    
  }


  // Since PowerQueries are paginated, we need to begin by getting the number of total
  //   results so we can calculate the number of pages in our result.

  let responseCount = UrlFetchApp.fetch(url+"/count",options);
  responseCount = JSON.parse(responseCount).count;
  let pageCount = Math.ceil(responseCount/pageSize);

 
  let cellData = [];


  // Work through each page, querying the data, iterating over each row, and adding it to the cellData
  //   array by constructing a 1-D array, tempRow, and then pushing that onto our cellData array.
  for (let page=1; page<=pageCount; page++)
  {
    console.log(page)
    let result = UrlFetchApp.fetch(`${url}?pagesize=${pageSize}&page=${page}`, options);
    result = JSON.parse(result).record;
 
    result.forEach(d => {
      // Construct an array representing one row of the spreadsheet
      let tempRow = [
                      d.stu_number,
                      d.stu_first,
                      d.stu_last,
                      d.stu_email,
                      d.sec_id,
                      d.sec_name,
                      d.teacher_last,
                      d.teacher_number,
                      d.start_date,
                      d.end_date,
                      d.teacher_email,
                      d.school_id,
                    ]

      // Add this row to our array of rows that we're constructing
      cellData.push(tempRow);
    });
  }

  if (cellData.length > 0)
  {

    // filter for specific schools
    cellData = cellData.filter(x => x[11] == '295')

    const headers = 
      ['studentId','stu_first','stu_last','stu_email','sec_id','sec_name','teacher_last','teacher_number','sec_start','sec_end','teacher_email','school_id']
    
    cellData.unshift(headers)

    dataSheet.getRange(1,1,cellData.length,cellData[0].length).setValues(cellData);
  }

  addCoteachersToClasses()
}


function addCoteachersToClasses(){

  

  let data =  dataRangeToArray('data')
  let coteachers = dataRangeToArray('coteachers')

  if(coteachers.length == 0){
    return
  }

  data.forEach(line => {

    let thisSection = coteachers.find(x => x.sec_id == line.sec_id)

    if (thisSection){
      line.teacher_email = line.teacher_email + "," + thisSection.coteachers 
    }
  })

  // Get the keys from the first object
  const keys = Object.keys(data[0]);

  // Convert objects to arrays of values and include the keys as the first element
  const arrayOfArrays = [
    keys, // Add the keys as the first element
    ...data.map(obj => Object.values(obj)) // Add the object values
    ];

  // console.log(arrayOfArrays);
  // console.log(data)

  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let dataSheet = ss.getSheetByName('data')
  dataSheet.clear()
  dataSheet.getRange(1,1,arrayOfArrays.length,arrayOfArrays[0].length).setValues(arrayOfArrays);
}









