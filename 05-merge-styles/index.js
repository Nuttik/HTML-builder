const { readdir } = require('node:fs/promises');
const { unlink } = require('node:fs/promises');
const { writeFile } = require('node:fs/promises');
const fs = require('fs');
const path = require('path');

async function createBoundleStyle() {
  //путь к папке с исходными стилями
  const sourcePath = path.join(__dirname, 'styles');

  //путь к папке прода
  const outputPath = path.join(__dirname, 'project-dist');

  //получаем данные из папки прода
  const filesProd = await readdir(outputPath);

  //если в папке прода уже есть скомпелированный файл со стилями, удаляем его
  if (filesProd.indexOf('bundle.css') > -1) {
    unlink(path.join(outputPath, 'bundle.css'), (err) => {
      if (err) throw err;
    });
  }

  //создаем чистый файл для записи стилей
  await writeFile(path.join(outputPath, 'bundle.css'), '', (err) => {
    if (err) throw err;
    console.log('File was created');
  });

  //получаем данные из исходной папки
  const filesStyles = await readdir(sourcePath);

  //создаем поток для записи стилей в файл
  const streamWriter = fs.createWriteStream(
    path.join(outputPath, 'bundle.css'),
  );

  //записываем содержимое всех файлов с разрешением .css
  for (const file of filesStyles) {
    if (file.slice(-4) === '.css') {
      //создаем поток для чтения стилей из файлов
      const streamReaer = fs.createReadStream(
        path.join(__dirname, 'styles', file),
        'utf-8',
      );
      streamReaer.on('data', function (chunk) {
        const styleFromFile = chunk.toString();
        streamWriter.write(styleFromFile);
      });
    }
  }
}

createBoundleStyle();
