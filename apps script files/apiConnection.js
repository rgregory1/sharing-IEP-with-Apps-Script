/*****************************************************
 *   
 *    Globally assigned variables
 * 
 ******************************************************/


let clientID = "youwish-idpostthis-herebutyou-cantrythis";
let clientSecret = "thesecret-isgonnabe-hardtocomebyaswell";

let strAccessToken = "";
let token_type = "";
let tokenExpiresIn = "";

let pageSize = 100;
let url = 'https://missisquoi.powerschool.com/ws/schema/query/org.mvsdschools.gcsync.students'

/*****************************************************
 *   
 *    FUNCTION: getConnection()
 *    This function will make the request for a token
 *    from the PS server and store it, the type, and the
 *    expiration time in their global variables
 * 
 ******************************************************/
function getConnection() {
  let authUrl = "https://missisquoi.powerschool.com/oauth/access_token";
  let options = {
      "method": "post",
      "headers": {
          "Authorization": "Basic " + Utilities.base64Encode(clientID+":"+clientSecret)
      },
      "payload": {
        "grant_type": "client_credentials"
      },
      "muteHttpExceptions": true
  };
  let response = UrlFetchApp.fetch(authUrl, options);
  let data = JSON.parse(response.getContentText());

  strAccessToken = data.access_token;
  token_type = data.token_type;
  tokenExpiresIn = data.expires_in;

  Logger.log(strAccessToken);

}


/*****************************************************
 *   
 *    FUNCTION: getCurrentPSSectionEnrollments()
 *    
 *    
 *    
 * 
 ******************************************************/

function getCurrentPSSectionEnrollments(){

  if (strAccessToken == "")
  {
    getConnection();
  }

  // Clear the data currently on the sheet to prepare for the new incoming data
  
  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let dataSheet = ss.getSheetByName('data')
  dataSheet.clear()


  let options = {
    "method":"post",
    "headers":{
      "Authorization": token_type + " " + strAccessToken,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    
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

    const headers = 
      ['studentId','stu_first','stu_last','stu_email','sec_id','sec_name','teacher_last','teacher_number','sec_start','sec_end','teacher_email','school_id']
    
    cellData.unshift(headers)

    dataSheet.getRange(1,1,cellData.length,cellData[0].length).setValues(cellData);
  }
}
