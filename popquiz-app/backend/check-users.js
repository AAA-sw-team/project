const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '375860',
  database: 'popquiz'
});

async function checkUsers() {
  try {
    console.log('检查用户信息...\n');
    
    // 查看所有用户
    const [users] = await connection.promise().query('SELECT id, username, name, role FROM users');
    
    console.log('数据库中的用户:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id} | 用户名: ${user.username} | 姓名: ${user.name} | 角色: ${user.role}`);
    });
    
    connection.end();
    
  } catch (error) {
    console.error('查询失败:', error.message);
    connection.end();
  }
}

checkUsers();
