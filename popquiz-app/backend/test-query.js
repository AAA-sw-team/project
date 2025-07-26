const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '375860',
  database: 'popquiz'
});

async function testIsUserInLecture() {
  try {
    console.log('测试 isUserInLecture 查询...\n');
    
    const lectureId = 1;
    const userId = 1;
    
    console.log(`查询参数: 讲座ID=${lectureId}, 用户ID=${userId}`);
    
    // 执行与 isUserInLecture 相同的查询
    const sql = `
      SELECT * FROM lecture_participants 
      WHERE lecture_id = ? AND user_id = ? AND status = 'joined'
    `;
    
    console.log('执行SQL:', sql);
    console.log('参数:', [lectureId, userId]);
    
    const [rows] = await connection.promise().query(sql, [lectureId, userId]);
    
    console.log('\n查询结果:');
    console.log('记录数:', rows.length);
    console.log('记录详情:', rows);
    
    // 同时查询不带状态条件的结果
    const sqlAll = `
      SELECT * FROM lecture_participants 
      WHERE lecture_id = ? AND user_id = ?
    `;
    
    const [allRows] = await connection.promise().query(sqlAll, [lectureId, userId]);
    
    console.log('\n不限状态的查询结果:');
    console.log('记录数:', allRows.length);
    console.log('记录详情:', allRows);
    
    connection.end();
    
  } catch (error) {
    console.error('查询失败:', error.message);
    connection.end();
  }
}

testIsUserInLecture();
