const { mkdir } = require('node:fs/promises');
const { readdir } = require('node:fs/promises');
const { copyFile } = require('node:fs/promises');
const { unlink } = require('node:fs/promises');
const path = require('path');

async function copyDir() {
  //путь к исходной  папки
  const sourcePath = path.join(__dirname, 'files');

  //путь к папке files-copy
  const outputPath = path.join(__dirname, 'files-copy');

  // создаем папку files-copy, если ее еще нет
  await mkdir(outputPath, { recursive: true });

  //получаем содержимое папки files-copy на случай если папка была наполнена в предыдущий раз
  const copyFiles = await readdir(outputPath);

  //удаляем все содержимое папки files-copy
  for (const file of copyFiles) {
    unlink(path.join(outputPath, file), (err) => {
      if (err) throw err;
    });
  }

  //получаем данные из исходной папки
  const files = await readdir(sourcePath);

  //копируем все файлы из исходной папки
  for (const file of files) {
    const original = path.join(sourcePath, file);
    const copy = path.join(outputPath, file);
    await copyFile(original, copy);
  }
}

copyDir();
