/**
 * Shares google drive files with teachers based on a student's schedule.
 */
function shareFiles() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  // const fileSheet = ss.getSheetByName('files')
  const logSheet = ss.getSheetByName('log')

  // gather all file data as an array of objects
  let currentFileData = dataRangeToArray('files')
  // gather all teachers that need access from PS API call
  let allTeachers = gatherStudentTeachers()
  //empty array to collect results for log file
  const allResults = []
  let todaysDate = new Date()

  currentFileData.forEach(line => {

    let thisStudent = allTeachers.find(x => x.studentId == line.studentId) 

    if (thisStudent){
      let teachers = thisStudent.teachers
      let schoolId = thisStudent.schoolId
      
      // add in additional viewers for all school access and editors to avoid extra sharing
      if (schoolId == '200'){
        // console.log('high')
        teachers = [...teachers, ...settings.high, ...line.editors.split(',')]
      } else if (schoolId == '100'){
        // console.log('middle')
        teachers = [...teachers, ...settings.middle, ...line.editors.split(',')]
      }

      let currentViewers = []
      if (line.viewers !== ''){
        currentViewers = [...line.viewers.split(','),...line.editors.split(',')]
      }
      
      // clean up teachers list to avoid issues
      teachers = teachers.map(teacher => teacher.toLowerCase())
      // remove duplicate teachers that may have cropped up
      teachers = [...new Set(teachers)]
      // console.log(teachers)
      
      currentViewers = currentViewers.map(staff => staff.toLowerCase())
      // console.log(currentViewers)

      // compare viewers and add those missing from list
      let emailsToAdd = teachers.filter(x => !currentViewers.includes(x))

      
      emailsToAdd.forEach(teacher => {
        let feedback = addViewerToFile(line.fileId,teacher)
        allResults.push([todaysDate,line.studentId, feedback])
      })
      
    
      // compare viewers and remove those not needed  
      let emailsToRemove = currentViewers.filter(x => !teachers.includes(x))
      
      emailsToRemove.forEach(teacher => {
        let feedback = removeViewerFromFile(line.fileId, teacher)
        allResults.push([todaysDate, line.studentId, feedback])
      })
      
      // console.log('finished')
    }
    
   

    console.log('fin ' + line.studentId)
  })

  // add no chance so I know the function ran even if there is no data
  if (allResults.length == 0){
    allResults.push([todaysDate,'**------------------ no changes this time ------------------**'])
  }

  let lastLogRow = logSheet.getLastRow()
  logSheet.getRange(lastLogRow + 1, 1, allResults.length,allResults[0].length).setValues(allResults)


}

/**
 * Takes the enrollment data for a student and returns an array of current teachers
 * 
 * @return {array} allTeachers - array of objects containing students' teacher data
 */
function gatherStudentTeachers() {

  const todaysDate = getTodayDate()
  // empty array to fill with student - teacher data
  const allTeachers = []


  let sectionData = dataRangeToArray('data')
  let fileNumbers = dataRangeToArray('files').map(x => x.studentId)

  fileNumbers.forEach((line,x) => {
    // get all teachers of students enrolled sections
    let teacherList = sectionData.filter(x => x.studentId == line)

    // filter out if not current teacher
    let currentTeachers = filterByDate(teacherList, todaysDate).map(x => x.teacher_email)

    // add data if student has current enrollments
    if(currentTeachers.length > 0){

      let schoolId = teacherList[0].school_id
    
      allTeachers.push({
            studentId: line, 
            teachers: currentTeachers, 
            schoolId: schoolId})
    }
    
  })

  // console.log(allTeachers)
  return allTeachers
}




function addViewerToFile(fileId='1QY33UkeMCxf23qsHsolJK1IQK-1LfPJL', email='nhs10mvu2024@mvsdschools.org'){
  let file = DriveApp.getFileById(fileId)
  let results 
  try {
    let info = file.addViewer(email)
    results = 'A - ' + email
    
  } catch(e) {
    console.log('Error: ' + e.toString())
    results = 'A - ' + email + ' - Error: ' + e.toString()
  }

  return results
}

function removeViewerFromFile(fileId,email){
  let file = DriveApp.getFileById(fileId)
  let results 
  try {
    file.removeViewer(email)
    results = 'R - ' + email
    
  } catch(e) {
    console.log('Error: ' + e.toString())
    results = 'R - ' + email + ' - Error: ' + e.toString()
  }

  return results
}


function filterByDate(arr, date) {
    return arr.filter(item => {
        const start = new Date(item.sec_start);
        const end = new Date(item.sec_end);
        const checkDate = new Date(date);
        return checkDate >= start && checkDate <= end;
    });
}

function getTodayDate() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    
    return `${month}/${day}/${year}`;
}
