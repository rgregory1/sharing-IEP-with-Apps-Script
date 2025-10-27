function getCoteacherDataFromPS() {
  
  const token = secretManagerLibrary.ensureFreshToken(
                    '1020400423324',
                    'coteachers_clientID',
                    'coteachers_clientsecret',
                    'coteachers_token'
                    )

  console.log(token)

  const url = 'https://missisquoi.powerschool.com/ws/schema/query/com.powerschool.missisquoi.coteacherswWithEmailAddresses?pagesize=0'
  
  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let dataSheet = ss.getSheetByName('coteachers')
  dataSheet.clearContents()


  let options = {
    "method":"post",
    "headers":{
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    // "muteHttpExceptions": true
    
  }


 
  let cellData = [];


  
  let response = UrlFetchApp.fetch(url, options);
  let records = JSON.parse(response).record;

  records.forEach(line => {
    if(line.teacher_2_id){

      let coteachers = [line.teacher_2_id,
                      line.teacher_3_id,
                      line.teacher_4_id,
                      line.teacher_5_id,
                      ]
                      
      coteachers = coteachers.filter(x => x !== undefined).join(",")

      cellData.push( [
                      line.course_name,
                      line.sectionid,
                      line.schoolid,
                      coteachers
                      
                    ])
    }
  });


  if (cellData.length > 0)
  {

    const headers = 
      ['sec_name','sec_id','school_id','coteachers']
    
    cellData.unshift(headers)

    dataSheet.getRange(1,1,cellData.length,cellData[0].length).setValues(cellData);
  }
}
