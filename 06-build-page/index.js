const { mkdir } = require('node:fs/promises');
const { rmdir } = require('node:fs/promises');
const { readdir } = require('node:fs/promises');
const { unlink } = require('node:fs/promises');
const { writeFile } = require('node:fs/promises');
const { copyFile } = require('node:fs/promises');

const fs = require('fs');

const path = require('path');

async function buildPage() {
  //путь к исходной папке стилей
  const sourceStyle = path.join(__dirname, 'styles');

  //путь к исходной папке компонентов
  const sourceComponents = path.join(__dirname, 'components');

  //путь к исходной папке assets
  const sourceAssets = path.join(__dirname, 'assets');

  //путь к папке project-dist
  const outputPath = path.join(__dirname, 'project-dist');

  //пробуем удалить папку дист на случай, если она была создана ранее
  //если папки нет, то ловим ошибку и продолжаем выполнение скрипта
  await removeDistFolder();

  //путь к папке assets в project-dist
  const outputAssets = path.join(__dirname, 'project-dist', 'assets');

  // создаем папку project-dist, если ее еще нет
  await mkdir(outputPath, { recursive: true });

  //получаем данные из папки project-dist
  const filesProd = await readdir(outputPath);

  //мерджим стили
  await mergeStyle(outputPath, sourceStyle, filesProd);

  //копируем как есть папку assets
  await copyDir(sourceAssets, outputAssets);

  //создаем файл index.html
  await writeFile(path.join(outputPath, 'index.html'), '', (err) => {
    if (err) throw err;
    console.log('File was created');
  });

  //получаем данные для сборки
  const html = await readHtml();
  const arrayTag = findTag(html);

  //собираем html
  const newHtml = await buildHtml(html, arrayTag, sourceComponents);

  const streamWriterHtml = fs.createWriteStream(
    path.join(__dirname, 'project-dist', 'index.html'),
  );
  streamWriterHtml.write(newHtml);
}

//ФУНКЦИИ

//Удаляем папку дист, если она была создана в предыдущей итерации
async function removeDistFolder() {
  const distPath = path.join(__dirname, 'project-dist');
  try {
    await rmdir(distPath, { recursive: true });
  } catch (err) {
    //если выпадает ошибка, значит папки не существует
    console.error('');
  }
}

//СТИЛИ
async function mergeStyle(outputPath, sourceStyle, filesProd) {
  //если в папке прода уже есть скомпелированный файл со стилями, удаляем его
  if (filesProd.indexOf('style.css') > -1) {
    unlink(path.join(outputPath, 'style.css'), (err) => {
      if (err) throw err;
    });
  }

  //создаем чистый файл для записи стилей
  await writeFile(path.join(outputPath, 'style.css'), '', (err) => {
    if (err) throw err;
    console.log('File was created');
  });

  //получаем данные из исходной папки
  const filesStyles = await readdir(sourceStyle);

  //создаем поток для записи стилей в файл
  const streamWriter = fs.createWriteStream(path.join(outputPath, 'style.css'));

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

//ASSETS
async function copyDir(sourcePath, outputPath) {
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

    //проверяем является ли объект папкой или файлом
    fs.stat(original, (err, stats) => {
      if (!err) {
        if (stats.isFile()) {
          copyFile(original, copy);
        } else if (stats.isDirectory()) {
          return copyDir(original, copy);
        }
      } else throw err;
    });
  }
}

//HTML
async function readHtml() {
  const tempPath = path.join(__dirname, 'template.html');
  const stream = fs.createReadStream(tempPath, 'utf-8');
  let str = '';
  return new Promise((resolve) => {
    stream.on('data', (chunk) => (str += chunk));
    stream.on('end', () => {
      resolve(str);
    });
  });
}

function findTag(html) {
  const arr = [];
  const start = '{{';
  const end = '}}';

  //ищем в полученном тексте все теги
  let index = 0;

  while (true) {
    let startIndex = html.indexOf(start, index);
    if (startIndex != -1) {
      const endIndex = html.indexOf(end, startIndex);
      //содержимое между {{ и }}
      const tagName = html.slice(startIndex + 2, endIndex);
      arr.push(tagName);
      index = endIndex;
    } else {
      break;
    }
  }
  return arr;
}

async function buildHtml(html, arrayTag, sourceComponents) {
  return new Promise((resolve) => {
    arrayTag.forEach((tag) => {
      let component = '';
      const streamComponent = fs.createReadStream(
        path.join(sourceComponents, `${tag}.html`),
        'utf-8',
      );
      streamComponent.on('data', (chunk) => (component += chunk));
      streamComponent.on('end', () => {
        html =
          html.slice(0, html.indexOf(`{{${tag}`)) +
          component +
          html.slice(html.indexOf(`${tag}}}`) + tag.length + 2);

        //если это последний тег в массиве, то пора записывать данные в файл
        if (arrayTag.indexOf(tag) === arrayTag.length - 1) {
          resolve(html);
        }
      });
    });
  });
}

buildPage();
