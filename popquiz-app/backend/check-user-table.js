const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '375860',
  database: 'popquiz'
});

async function checkUserTable() {
  try {
    console.log('检查用户表结构...\n');
    
    // 查看表结构
    const [structure] = await connection.promise().query('DESCRIBE users');
    console.log('users表结构:');
    structure.forEach(field => {
      console.log(`- ${field.Field}: ${field.Type} (${field.Null === 'YES' ? '可空' : '非空'})`);
    });
    
    console.log('\n查看用户数据...');
    
    // 查看所有用户（使用正确的字段名）
    const [users] = await connection.promise().query('SELECT * FROM users');
    
    console.log('数据库中的用户:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id} | 用户名: ${user.username} | 角色: ${user.role}`);
    });
    
    connection.end();
    
  } catch (error) {
    console.error('查询失败:', error.message);
    connection.end();
  }
}

checkUserTable();
