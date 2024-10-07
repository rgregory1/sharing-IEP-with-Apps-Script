// const rootIepFolderId = '1tX3TT3-g1PZapPGhkug6zKgtXWoyOk60' // trial folder

/**
 *  Main settings for the program, grab settings to be used during later functions
 *  This allows changing data sharing without having to alter code
 */
const settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('settings')
const settings = {
  middle : settingsSheet.getRange('B11:B30').getValues().flat().filter(x => x !== ''),
  high : settingsSheet.getRange('C11:C30').getValues().flat().filter(x => x !== ''),
  masterFolder : settingsSheet.getRange('B1').getValue(),
  isOn : settingsSheet.getRange('B2').getValue()
}



/**
 *  Master function that completes the sharing process
 *  use this function when setting automation triggers
 */
function shareIEPwithTeachers(){

  if(settings.isOn == 'On'){
  
    getAllChildFolders()

    getCurrentPSSectionEnrollments()

    shareFiles()
  }
}

/**
 *  Combs through specific Google folder and retrieves all folders, files, and permissions on those files
 *  Once data is retrieved, writes the data to the tabes titled 'folders' and 'files'
 * 
 */
function getAllChildFolders(){

  const rootFolder = DriveApp.getFolderById(settings.masterFolder);
  const folders = rootFolder.getFolders();
  
  // create array that will be filled with the folders to be written to the tab
  const folderData =  [];

  // create array to be filled with all of the files inside the folders
  const list = [['folderName','fileName','fileId','studentId', 'editors','viewers']]

  // grab all subfolders for each special educator or case manager
  while (folders.hasNext()) {
    let folder = folders.next();
    let folderName = folder.getName();
    let folderID = folder.getId(); 
    folderData.push([folderID,folderName])

    // with each folder, get a list of each file and permissions
    getFilesInFolder(folder, list)
  }

  updateFoldersSheet(folderData)
  
  // update list of all files to be shared with current data
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const filesSheet = ss.getSheetByName('files')
  let lastRow = filesSheet.getLastRow()
  filesSheet.clearContents()
  filesSheet.getRange(1,1,list.length,list[0].length).setValues(list)
}

/**
 * Takes a folder ID and returns a list of files in it.
 * 
 * @param {string} folder - google id for a folder
 * @param {array} list - array containing all file information to write to sheet
 */
function getFilesInFolder(folder, list){
  let files = folder.getFiles();
  
  while (files.hasNext()){
    file = files.next();
    let fileId = file.getId()
    let studentId = file.getName().split(' ')[0]
    let permisions = getPermisionsForFile(fileId)
    list.push([folder.getName(), file.getName(), fileId, studentId, permisions[0].join(),permisions[1].join() ])
  }
}

/**
 *  returns editors and viewers for a single google drive file
 * 
 * @param {string} fileId - the file id of google drive file
 * @return {array} results - array containg to lists, one of editors and one of viewers
 */
function getPermisionsForFile(fileId='1uX3QwCgDDhN6etcrWD7TxV9c0LUjaxFR'){
  let file = DriveApp.getFileById(fileId)
  let results
  try {
    // let owner = file.getOwner().getEmail();
    let editors = file.getEditors().map(e => e.getEmail())
    let viewers = file.getViewers().map(v => v.getEmail())
    results = [editors, viewers];
  } catch(e) {
    results = [[], []];
  }

  // console.log(results)
  return results
}

/**
 * Updates the folders sheet as a record of subfolders discoverd during update.
 * This process preserves all the other information previously on the sheet and only adds new 
 * folders or removes folders no longer there.
 * 
 * @param {array} folderData - List of folder ids and folder names
 */
function updateFoldersSheet(folderData){

  // console.log(folderData)
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const foldersSheet = ss.getSheetByName('folders')
  const finalFolders = []
  // grab current folders
  let currentFolders = foldersSheet.getRange(2,1,24,6).getValues()
  currentFolders = currentFolders.filter(x => x[0] != '')
  
  // keep all current folders
  currentFolders.forEach(line => {
    let found = folderData.find(folderData => folderData[0] == line[0])
    console.log(found)
    if(found){
      finalFolders.push(line)
    }
  })

  // add new folders
  folderData.forEach(line => {
    let found = currentFolders.find(currentFolders => currentFolders[0] == line[0])
    if(!found){
      finalFolders.push([line[0],line[1],'','','',''])
    }
  })

  // update list on folders sheet
  foldersSheet.getRange(2,1,24,6).clear()
  foldersSheet.getRange(2,1,finalFolders.length,finalFolders[0].length).setValues(finalFolders)
}




