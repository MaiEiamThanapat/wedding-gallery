# Google Sheets & Forms Setup Guide

เพื่อเชื่อมต่อ Website ของคุณกับ Google Forms ให้ทำตามขั้นตอนต่อไปนี้:

## 1. สร้าง Google Form และ Sheets
1. ไปที่ [Google Forms](https://forms.google.com)
2. สร้าง Form ใหม่ โดยเพิ่มฟิลด์ตามนี้ (ชื่อต้องตรงเป๊ะสำหรับโค้ดตัวอย่าง แต่ถ้าเปลี่ยนต้องแก้ในโค้ด)
   - **ชื่อ-นามสกุล** (Short answer)
   - **ข้อความอวยพร** (Paragraph)
   - **อัพโหลดรูปภาพ** (File upload) (จำเป็นต้อง Login Google เพื่ออัพโหลดไฟล์)
3. คลิกแถบ **Responses** → คลิกไอคอน **Create Spreadsheet** (สีเขียว)
4. ตั้งชื่อและกด Create จะเปิดหน้า Google Sheets ขึ้นมา

## 2. สร้าง Google Apps Script API
1. ในหน้า Google Sheets ไปที่เมนู **Extensions** → **Apps Script**
2. จะเปิดหน้าต่างใหม่ ลบโค้ดเดิม (`function myFunction() {...}`) ทิ้งทั้งหมด
3. คัดลอกโค้ดด้านล่างไปวาง:

```javascript
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // ข้าม header row (แถวแรก)
  const headers = data[0];
  const rows = data.slice(1);
  
  // แปลงเป็น JSON
  const result = rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      // แปลงชื่อ header ให้ตรงกับที่ React เรียกใช้ได้ง่ายขึ้น (ถ้าต้องการ)
      // แต่ในตัวอย่างนี้เราใช้ชื่อภาษาไทยจาก Form โดยตรง
      obj[header] = row[index];
    });
    return obj;
  });
  
  // เรียงจากใหม่ไปเก่า
  result.reverse();
  
  return ContentService
    .createTextOutput(JSON.stringify({ data: result }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. ตั้งชื่อ Project (มุมซ้ายบน) เช่น "Wedding Gallery API"
5. คลิกปุ่ม **Deploy** (มุมขวาบน) → **New deployment**
6. เลือก type: **Web app** (รูปฟันเฟืองด้านซ้าย)
   - Description: API (หรืออะไรก็ได้)
   - Execute as: **Me** (อีเมลของคุณ)
   - Who has access: **Anyone** (สำคัญมาก! เพื่อให้เว็บดึงข้อมูลได้โดยไม่ต้อง Login)
7. คลิก **Deploy**
   - ครั้งแรกจะมีการขอสิทธิ์ (Authorize access) ให้กด Review permissions
   - เลือกบัญชี Google
   - ถ้าขึ้นหน้าจอเตือน "Google hasn't verified this app" ให้กด **Advanced** → **Go to ... (unsafe)**
   - กด **Allow**
8. เมื่อเสร็จแล้ว จะได้ **Web app URL** (ยาวๆ ขึ้นต้นด้วย `https://script.google.com/macros/s/.../exec`)
9. **คัดลอก URL นี้เก็บไว้**

## 3. เชื่อมต่อกับ Next.js Project
1. เปิดไฟล์ `app/page.js` ในโปรเจค
2. ค้นหาบรรทัด:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE';
   ```
3. แทนที่ `'YOUR_WEB_APP_URL_HERE'` ด้วย URL ที่คัดลอกมา
4. บันทึกไฟล์

## ทดสอบการใช้งาน
1. ลองกรอก Google Form ของคุณ
2. รอประมาณ 10 วินาที หรือรีเฟรชหน้าเว็บ
3. ข้อมูลใหม่ควรจะปรากฏขึ้นมา!
