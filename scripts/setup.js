const { execSync } = require('child_process');
const path = require('path');

console.log('開始安裝依賴...');

try {
  // 安裝根目錄依賴
  console.log('\n安裝根目錄依賴...');
  execSync('npm install', { stdio: 'inherit' });

  // 安裝服務器依賴
  console.log('\n安裝服務器依賴...');
  process.chdir(path.join(process.cwd(), 'server'));
  execSync('npm install', { stdio: 'inherit' });

  // 安裝客戶端依賴
  console.log('\n安裝客戶端依賴...');
  process.chdir(path.join(process.cwd(), '..', 'client'));
  execSync('npm install', { stdio: 'inherit' });

  console.log('\n所有依賴安裝完成！');
} catch (error) {
  console.error('安裝過程中出錯:', error);
  process.exit(1);
} 