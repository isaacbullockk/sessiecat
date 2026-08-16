import fs from 'fs';
fetch('http://localhost:3000/api/download-source')
  .then(res => {
    if(!res.ok) throw new Error(res.statusText)
    return res.arrayBuffer();
  })
  .then(buffer => {
    fs.writeFileSync('output.zip', Buffer.from(buffer));
    console.log('Zip downloaded, size:', buffer.byteLength);
  })
  .catch(console.error);
