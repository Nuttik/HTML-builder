const fs = require('fs');
const path = require('path');

//путь к секретной папки
const folderPath = path.join(__dirname, 'secret-folder');

//промис для получения содержимого папки
fs.promises
  .readdir(folderPath, { withFileTypes: true })
  .then((files) => {
    for (let file of files) {
      //проверяем является ли объект файлом
      if (file.isFile()) {
        //получаем данные о файле
        fs.stat(
          path.join(__dirname, 'secret-folder', file.name),
          (error, stats) => {
            if (error) {
              console.log(error);
            } else {
              // выводим в консоль `<file name>-<file extension>-<file size>`
              const name = file.name.slice(0, file.name.indexOf('.'));
              const ext = path
                .extname(path.join(__dirname, 'secret-folder', file.name))
                .slice(1);
              const size = (stats.size / 1024).toFixed(3);
              console.log(name + ' - ' + ext + ' - ' + size + 'kb');
            }
          },
        );
      }
    }
  })
  // если промис завершился ошибкой
  .catch((err) => {
    console.log(err);
  });
