const axios = require('axios');
const fs = require('fs');

const BOT_TOKEN = '6749064462:AAEhNgVgYUrtF5bMCJr5d7gSrLR3TLro87g';

async function downloadFile(FILE_ID, savePath) {
  try {
    // Шаг 2: Получите информацию о файле
    const fileInfoResponse = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${FILE_ID}`);
    const fileInfo = fileInfoResponse.data;

    if (fileInfo.ok) {
      const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.result.file_path}`;

      // Шаг 4: Загрузите файл по URL-адресу
      const fileResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const fileBuffer = Buffer.from(fileResponse.data);

      // Здесь можно сохранить файл, как вам нужно
      fs.writeFileSync(savePath, fileBuffer);
      console.log('Файл успешно загружен и сохранен.');
    } else {
      console.error('Не удалось получить информацию о файле:', fileInfo);
    }
  } catch (error) {
    console.error('Произошла ошибка при загрузке файла:', error);
  }
}

module.exports = downloadFile;
