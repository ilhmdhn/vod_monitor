const fs = require('fs').promises;
const path = require('path');
const {getPreferences} = require('./configuration');

const cekFiles = () => {
    return new Promise(async (resolve, reject)=>{
        try {
            const preferences = getPreferences()
            const folderPath = `\\\\${preferences.serverIp}\\vod\\RoomInfo`;  
            const files = await fs.readdir(folderPath);
            const fileInfo = [];
        
            // Filter file yang berakhiran .ini
            const iniFiles = files.filter(file => path.extname(file) === '.ini');
        
            // Membaca isi setiap file .ini
            for (const iniFile of iniFiles) {
              const filePath = path.join(folderPath, iniFile);
              const fileProperty={
                  name: null,
                  date_modified: null,
                  detail: {
                      room_no: null,
                      outlet: null,
                      file_name: null,
                      date_modified: null,
                      room_no: null,
                      status: null,
                      service: null,
                      checkout: null,
                      extend: null,
                      ready: null,
                      delay: null,
                      service_time: null,
                      room_open_time: null,
                      room_close_time: null
                  }
                  }
              
              try {
                const detailFile = await fs.stat(filePath);
                const data = await fs.readFile(filePath, 'utf8');
                fileProperty.name= iniFile;
                fileProperty.date_modified = (detailFile.mtime).toISOString().slice(0, 19).replace('T', ' ');
                const isiFile = convertDataFile(data)
                  
                if(isiFile.RoomNo){
                  fileProperty.detail.room_no= isiFile.RoomNo;
                }
                if(isiFile.Status){
                  fileProperty.detail.status= isiFile.Status;
                }
                if(isiFile.Service){
                  fileProperty.detail.service= isiFile.Service;
                }
                if(isiFile.Checkout){
                  fileProperty.detail.checkout= isiFile.Checkout;
                }
                if(isiFile.Extend){
                  fileProperty.detail.extend= isiFile.Extend;
                }
                if(isiFile.Ready){
                  fileProperty.detail.ready= isiFile.Ready;
                }
                if(isiFile.Delay){
                  fileProperty.detail.delay= isiFile.Delay;
                }
                if(isiFile.ServiceTime){
                  fileProperty.detail.service_time= isiFile.ServiceTime;
                }
                if(isiFile.RoomOpenTime){
                  fileProperty.detail.room_open_time = dateTimeConverter(isiFile.RoomOpenTime);
                }
                if(isiFile.RoomCloseTime){
                  fileProperty.detail.room_close_time = dateTimeConverter(isiFile.RoomCloseTime);
                }
                fileProperty.detail.file_name = iniFile;
                fileProperty.detail.outlet = preferences.outletCode;
                fileProperty.detail.date_modified = (detailFile.mtime).toISOString().slice(0, 19).replace('T', ' ');
                
                fileInfo.push(fileProperty)
              } catch (readErr) {
                console.error('Error reading file:', readErr);
              }
            }
            
      
          resolve(fileInfo);
          } catch (err) {
            reject(err)
          }
    });
}

const convertDataFile = (files) => {
    try {
      const result = {};
      let currentSection = null;
  
      // Menggunakan regular expression untuk memisahkan baris
      const lines = files.match(/[^\r\n]+/g);
  
      lines.forEach(line => {
        // console.log('Processing line:', line);
  
        if (line.trim() === '' || line.trim().startsWith(';')) {
        //   console.log('Skipping empty or comment line:', line);
          return;
        }
  
        const sectionMatch = line.match(/^\[(\w+)\]$/);
        if (sectionMatch) {
          currentSection = sectionMatch[1];
        //   console.log('Entering section:', currentSection);
          return;
        }
  
        if (currentSection) {
          const parts = line.split('=');
          if (parts.length === 2) {
            const key = parts[0].trim();
            const value = parts[1].trim();
  
            // Mengatasi nilai yang tidak diisi dengan memberikan nilai default
            result[key] = value === '' ? null : value;
            // console.log(`Setting ${key}=${result[key]}`);
          } else {
            console.warn(`Invalid line in [${currentSection}] section: ${line}`);
          }
        }
      });
  
      return result;
    } catch (err) {
      throw err;
    }
  }
  
  const dateTimeConverter = (inputDate) =>{
        // Memisahkan tanggal dan waktu menggunakan karakter '/' dan ':'
        const parts = inputDate.split(/[\s\/:]/);
      
        // Mengonversi objek Date ke format MySQL dengan menggunakan metode slice
        const mysqlFormattedDate = `${parts[2]}-${parts[1]}-${parts[0]} ${parts[3]}:${parts[4]}:${parts[5]}`;
      
        return mysqlFormattedDate;
      
  }

//  cekFiles('192.168.1.11');

 module.exports = cekFiles;