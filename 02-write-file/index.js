const fs = require('fs');
const path = require('path');

const { stdin, stdout } = process;

//создаем текстовый файл
const filePath = path.join(__dirname, 'notebook.txt');

fs.writeFile(filePath, '', (err) => {
  if (err) throw err;
});

//задаем вопрос
stdout.write('Привет! Какой у вас список дел на сегодня?\n');

//записываем ответ в файл

const writer = fs.createWriteStream(filePath);

stdin.on('data', (data) => {
  const str = data.toString();
  if (str.includes('exit') && str.length == 6) {
    //если пользователь ввел команду 'exit', то завершаем запись
    process.exit();
  } else {
    //записываем ответ в файл
    writer.write(str);
  }
});
//если пользователь нажал `ctrl + c`, то завершаем запись
process.on('SIGINT', () => {
  process.exit();
});

//прощаемся
process.on('exit', () => stdout.write('Я все записал. Удачи!'));
