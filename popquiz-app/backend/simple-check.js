const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '375860',
  database: 'popquiz'
});

async function checkDatabase() {
  try {
    console.log('检查数据库状态...\n');
    
    // 1. 检查参与者总数
    const [countResult] = await connection.promise().query('SELECT COUNT(*) as total FROM lecture_participants');
    console.log('参与者总数:', countResult[0].total);
    
    // 2. 检查最近的参与者记录
    const [recentResults] = await connection.promise().query(`
      SELECT 
        lp.id,
        lp.lecture_id,
        lp.user_id,
        lp.status,
        lp.joined_at,
        lp.left_at,
        u.username,
        l.title as lecture_title
      FROM lecture_participants lp 
      LEFT JOIN users u ON lp.user_id = u.id 
      LEFT JOIN lectures l ON lp.lecture_id = l.id 
      ORDER BY lp.joined_at DESC 
      LIMIT 5
    `);
    
    console.log('\n最近的5条参与者记录:');
    recentResults.forEach((record, index) => {
      console.log(`${index + 1}. 用户: ${record.username || record.user_id} | 讲座: ${record.lecture_title || record.lecture_id} | 状态: ${record.status} | 加入时间: ${record.joined_at} | 离开时间: ${record.left_at || '未离开'}`);
    });
    
    // 3. 检查各状态的统计
    const [statusStats] = await connection.promise().query(`
      SELECT status, COUNT(*) as count 
      FROM lecture_participants 
      GROUP BY status
    `);
    
    console.log('\n状态统计:');
    statusStats.forEach(stat => {
      console.log(`${stat.status}: ${stat.count} 条记录`);
    });
    
    // 4. 检查用户ID=1的记录（如果存在）
    const [user1Records] = await connection.promise().query(`
      SELECT * FROM lecture_participants 
      WHERE user_id = 1 
      ORDER BY joined_at DESC 
      LIMIT 3
    `);
    
    if (user1Records.length > 0) {
      console.log('\n用户ID=1的记录:');
      user1Records.forEach((record, index) => {
        console.log(`${index + 1}. 讲座ID: ${record.lecture_id} | 状态: ${record.status} | 加入: ${record.joined_at} | 离开: ${record.left_at || '未离开'}`);
      });
    } else {
      console.log('\n用户ID=1没有参与记录');
    }
    
    connection.end();
    
  } catch (error) {
    console.error('数据库查询失败:', error.message);
    connection.end();
  }
}

checkDatabase();
