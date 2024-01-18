const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'text.txt');

const stream = fs.createReadStream(filePath, 'utf-8');

let text = '';

stream.on('data', (chunk) => (text += chunk));
stream.on('end', () => console.log(text));
