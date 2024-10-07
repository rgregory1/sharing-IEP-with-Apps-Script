# sharing-IEP-with-Apps-Script
Apps Script code to share google drive docs with current teachers


This project is a Google Apps Script program that 

1 - takes a folder of folders, crawls through those folders and lists all the files and permissions for those files
2 - connects to PowerSchool through the API and grabs every student's current sections and teacher email
3 - goes file by file and shares the files with all current teachers and removes teachers who don't have the student currently

An example Google Sheets spreadsheet can be found here:
https://docs.google.com/spreadsheets/d/1TU4FJlAj0AovTc6UOs3uZoFelIBnKCgRCnuvrPdjIKg/edit?usp=sharing

Google folder structure should look like this:

MasterFolder
-SMITH
--12345 Joey Tribiani.pdf
--12346 Chandler Bing.pdf
-JONES
--12347 Pheobe Buffay.pdf
-504
--12348 Monica Geller.pdf


