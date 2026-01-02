
function doGet(e) {
    const cache = CacheService.getScriptCache();
    const cacheKey = 'wedding_gallery_data';
    const cacheTime = 60; // 60 วินาที (1 นาที) - สมดุลระหว่าง quota usage และความสดใหม่ของข้อมูล
    
    // ลองดึงจาก cache ก่อน
    const cached = cache.get(cacheKey);
    if (cached) {
      Logger.log('✅ Returning cached data (fast response)');
      return ContentService
        .createTextOutput(cached)
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ถ้าไม่มี cache ให้ดึงจาก Sheets
    Logger.log('📊 Fetching fresh data from Google Sheets');
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    // ข้าม header row (แถวแรก)
    const headers = data[0];
    const rows = data.slice(1);
    
    // แปลงเป็น JSON
    const result = rows.map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    
    // เรียงจากใหม่ไปเก่า
    result.reverse();
    
    const output = JSON.stringify({ data: result });
    
    // เก็บใน cache
    try {
      cache.put(cacheKey, output, cacheTime);
      Logger.log('✅ Data cached for ' + cacheTime + ' seconds');
    } catch (error) {
      Logger.log('⚠️ Cache error: ' + error);
    }
    
    return ContentService
      .createTextOutput(output)
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  function setSharingForAllFilesInFolder() {
    // ⚠️ แก้ไข FOLDER_ID ตรงนี้เป็น ID ของ folder ที่เก็บรูปภาพ
    // หาได้จาก URL: https://drive.google.com/drive/folders/FOLDER_ID
    const FOLDER_ID = '175HYE2FIFkr4YMsbQqIXlaK5g84jMwb5WArEfYDuBlqxqL-voZxqIEZttCyTdAPRdU7aZJQ5';
    
    try {
      const folder = DriveApp.getFolderById(FOLDER_ID);
      const files = folder.getFiles();
      let count = 0;
      let errorCount = 0;
      
      while (files.hasNext()) {
        const file = files.next();
        try {
          // ตั้งค่า sharing permissions เป็น "Anyone with the link"
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          count++;
          Logger.log('✅ Set sharing for: ' + file.getName());
        } catch (error) {
          errorCount++;
          Logger.log('❌ Error for ' + file.getName() + ': ' + error);
        }
      }
      
      const message = '✅ Completed! Success: ' + count + ', Errors: ' + errorCount;
      Logger.log(message);
      return message;
    } catch (error) {
      const errorMessage = '❌ Error: ' + error;
      Logger.log(errorMessage);
      return errorMessage;
    }
  }
  
  function onFormSubmit(e) {
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      const lastRow = sheet.getLastRow();
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      // หา column index ของ "อัพโหลดรูปภาพ (File upload)"
      const imageColumnIndex = headers.findIndex(header => 
        header.includes('อัพโหลดรูปภาพ') || header.includes('รูปภาพ')
      );
      
      if (imageColumnIndex === -1) {
        Logger.log('⚠️ Image column not found');
        return;
      }
      
      // ดึง URL รูปภาพจากแถวล่าสุด
      const imageUrl = sheet.getRange(lastRow, imageColumnIndex + 1).getValue();
      
      if (!imageUrl || imageUrl === '') {
        Logger.log('⚠️ No image URL found');
        return;
      }
      
      // แปลง Google Drive URL เป็น File ID
      const fileIdMatch = imageUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                         imageUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                         imageUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        
        try {
          // ตั้งค่า sharing permissions เป็น "Anyone with the link"
          const file = DriveApp.getFileById(fileId);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          
          Logger.log('✅ Set sharing permissions for new file: ' + fileId);
        } catch (error) {
          Logger.log('❌ Error setting sharing permissions: ' + error);
        }
      } else {
        Logger.log('⚠️ Could not extract file ID from URL: ' + imageUrl);
      }
    } catch (error) {
      Logger.log('❌ Error in onFormSubmit: ' + error);
    }
  }
  
  