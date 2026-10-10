const fs = require('fs');

let layoutCode = fs.readFileSync('app/layout.tsx', 'utf-8');
layoutCode = layoutCode.replaceAll(' & Hadiah Online Gratis', ' & Hadiah Online');
layoutCode = layoutCode.replaceAll('virtual gratis.', 'virtual interaktif.');
layoutCode = layoutCode.replaceAll("'bikin buket bunga online gratis',", "'bikin buket bunga online mudah',");
layoutCode = layoutCode.replaceAll("'ide kado dadakan aesthetic gratis',", "'ide kado dadakan aesthetic praktis',");
layoutCode = layoutCode.replaceAll('Online Gratis untuk', 'Online untuk');
layoutCode = layoutCode.replaceAll('(PNG/JPG) Gratis Siap', '(PNG/JPG) Siap');
layoutCode = layoutCode.replaceAll('secara gratis.', 'secara langsung.');
layoutCode = layoutCode.replaceAll('secara gratis untuk', 'untuk');
layoutCode = layoutCode.replaceAll('di sini gratis?', 'di sini praktis?');
layoutCode = layoutCode.replaceAll('Ya, 100% gratis tanpa dipungut biaya apapun.', 'Dapat langsung dibuat secara bebas tanpa biaya.');
fs.writeFileSync('app/layout.tsx', layoutCode, 'utf-8');

console.log('Cleaned layout.tsx successfully!');
