const fs = require('fs');

let content = fs.readFileSync('src/components/TourWorkspace.tsx', 'utf8');

const regex = /setTours\(prev => prev\.map\(t => \{\s*if \(t\.id === activeTour\.id\) \{\s*return \{\s*\.\.\.t,\s*(.*?)\s*\};\s*\}\s*return t;\s*\}\)\);/gs;

content = content.replace(regex, (match, inner) => {
  return `updateActiveTour(t => ({ ...t, \n          ${inner.trim()} \n        }));`;
});

fs.writeFileSync('src/components/TourWorkspace.tsx', content);
