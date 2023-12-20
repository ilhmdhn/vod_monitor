const fs = require('fs').promises;
const path = require('path');
const {getPreferences} = require('./configuration');
const smb2 = require('smb2');

const cekFiles = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const preferences = getPreferences();
      const smbOptions = {
        share: `\\\\${preferences.serverIp}\\vod\\RoomInfo`,
        username: 'your_username',
        password: 'your_password',
      };

      const smbClient = new smb2(smbOptions);
      const files = await smbClient.readdir(smbOptions.share);

      const fileInfo = [];

      // Filter file yang berakhiran .ini
      const iniFiles = files.filter((file) => path.extname(file.filename) === '.ini');

      // Membaca isi setiap file .ini
      for (const iniFile of iniFiles) {
        const filePath = path.join(smbOptions.share, iniFile.filename);
        const fileProperty = {
          name: iniFile.filename,
          date_modified: null,
          detail: {
            room_no: null,
            outlet: preferences.outletCode,
            file_name: iniFile.filename,
            date_modified: null,
            status: null,
            service: null,
            checkout: null,
            extend: null,
            ready: null,
            delay: null,
            service_time: null,
            room_open_time: null,
            room_close_time: null,
          },
        };

        try {
          const detailFile = await smbClient.stat(filePath);
          fileProperty.date_modified = detailFile.mtime.toISOString().slice(0, 19).replace('T', ' ');

          const isiFile = convertDataFile(await smbClient.readFile(filePath, 'utf8'));

          // Fungsi untuk mengonversi tanggal dan waktu
          const dateTimeConverter = (dateTimeString) => {
            // Tambahkan logika konversi sesuai kebutuhan
            return dateTimeString; // Contoh: kembalikan string datetime tanpa perubahan
          };

          fileProperty.detail = {
            ...fileProperty.detail,
            room_no: isiFile.RoomNo || null,
            status: isiFile.Status || null,
            service: isiFile.Service || null,
            checkout: isiFile.Checkout || null,
            extend: isiFile.Extend || null,
            ready: isiFile.Ready || null,
            delay: isiFile.Delay || null,
            service_time: isiFile.ServiceTime || null,
            room_open_time: dateTimeConverter(isiFile.RoomOpenTime) || null,
            room_close_time: dateTimeConverter(isiFile.RoomCloseTime) || null,
          };

          fileInfo.push(fileProperty);
        } catch (readErr) {
          console.error('Error reading file:', readErr);
        }
      }

      smbClient.close(); // Tutup koneksi setelah selesai

      resolve(fileInfo);
    } catch (err) {
      reject(err);
    }
  });
};

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