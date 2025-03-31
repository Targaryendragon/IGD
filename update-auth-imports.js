const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 查找需要更新的所有文件
const files = execSync('grep -l "import.*authOptions.*from.*@/app/api/auth/\\[...nextauth\\]/route" $(find src -name "*.ts" -o -name "*.tsx")')
  .toString()
  .split('\n')
  .filter(Boolean);

console.log(`找到 ${files.length} 个文件需要更新：`);

// 对每个文件进行处理
let errors = 0;
for (const file of files) {
  try {
    console.log(`处理文件: ${file}`);
    const content = fs.readFileSync(file, 'utf8');
    
    // 替换导入语句
    const updatedContent = content.replace(
      /import\s+?{([^}]*)authOptions([^}]*)}(\s+?)from(\s+?)['"]@\/app\/api\/auth\/\[\.\.\.nextauth\]\/route['"]/g,
      'import {$1authOptions$2}$3from$4\'@/app/api/auth/[...nextauth]/auth\''
    );
    
    if (content !== updatedContent) {
      fs.writeFileSync(file, updatedContent);
      console.log(`✅ 已更新: ${file}`);
    } else {
      console.log(`⚠️ 未找到匹配内容: ${file}`);
    }
  } catch (error) {
    console.error(`❌ 处理文件时出错 ${file}:`, error);
    errors++;
  }
}

console.log(`\n处理完成! ${files.length - errors} 个文件已更新, ${errors} 个文件出错`); 