const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace variables, types, and strings
  content = content.replace(/MusicianCard/g, 'ArtistCard');
  content = content.replace(/AddMusicianForm/g, 'AddArtistForm');
  
  // Plural
  content = content.replace(/Musicians/g, 'Artists');
  content = content.replace(/musicians/g, 'artists');
  content = content.replace(/MUSICIANS/g, 'ARTISTS');
  
  // Singular
  content = content.replace(/Musician/g, 'Artist');
  content = content.replace(/musician/g, 'artist');
  content = content.replace(/MUSICIAN/g, 'ARTIST');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      replaceInFile(fullPath);
    }
  }
}

traverse(path.join(__dirname, 'src'));
console.log('Replacement complete.');
