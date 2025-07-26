const mysql = require('mysql2');

// 创建数据库连接
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '375860',
  database: 'popquiz'
});

console.log('正在检查数据库状态...');

// 查看当前所有参与者状态
connection.promise().query(`
  SELECT lp.*, u.username, l.title 
  FROM lecture_participants lp 
  LEFT JOIN users u ON lp.user_id = u.id 
  LEFT JOIN lectures l ON lp.lecture_id = l.id 
  ORDER BY lp.joined_at DESC LIMIT 10
`).then(([rows]) => {
  console.log('\n最近的参与者记录：');
  console.table(rows);
  
  // 查看特定用户的状态（假设用户ID为1）
  return connection.promise().query(`
    SELECT * FROM lecture_participants 
    WHERE user_id = 1 
    ORDER BY joined_at DESC LIMIT 5
  `);
}).then(([rows]) => {
  console.log('\n用户ID=1的最近记录：');
  console.table(rows);
  
  // 检查数据库表结构
  return connection.promise().query('DESCRIBE lecture_participants');
}).then(([rows]) => {
  console.log('\nlecture_participants 表结构：');
  console.table(rows);
  
  connection.end();
}).catch(err => {
  console.error('数据库查询失败:', err);
  
  // 如果连接失败，尝试其他可能的配置
  console.log('\n尝试连接其他配置...');
  const altConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // 空密码
    database: 'popquiz'
  });
  
  altConnection.promise().query('SELECT COUNT(*) as count FROM lecture_participants')
    .then(([rows]) => {
      console.log('数据库连接成功，参与者总数:', rows[0].count);
      return altConnection.promise().query(`
        SELECT * FROM lecture_participants 
        ORDER BY joined_at DESC LIMIT 5
      `);
    })
    .then(([rows]) => {
      console.log('\n最近的参与者记录：');
      console.table(rows);
      altConnection.end();
    })
    .catch(altErr => {
      console.error('备用连接也失败:', altErr);
      altConnection.end();
    });
});
