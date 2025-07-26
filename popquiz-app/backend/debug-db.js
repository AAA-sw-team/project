const pool = require('./models/db');

async function checkDatabase() {
  try {
    console.log('=== 检查数据库连接 ===');
    
    // 检查数据库连接
    const connection = await pool.promise().getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();

    // 检查表结构
    console.log('\n=== 检查 lecture_participants 表结构 ===');
    const [tableInfo] = await pool.promise().query('DESCRIBE lecture_participants');
    console.log('表字段：');
    tableInfo.forEach(field => {
      console.log(`  ${field.Field}: ${field.Type} ${field.Null === 'YES' ? '(可空)' : '(不可空)'} ${field.Key ? `[${field.Key}]` : ''}`);
    });

    // 检查表数据
    console.log('\n=== 检查 lecture_participants 表数据 ===');
    const [participants] = await pool.promise().query('SELECT * FROM lecture_participants ORDER BY id DESC LIMIT 10');
    console.log(`表中共有 ${participants.length} 条记录（显示最新10条）：`);
    participants.forEach(participant => {
      console.log(`  ID: ${participant.id}, 讲座: ${participant.lecture_id}, 用户: ${participant.user_id}, 状态: ${participant.status}, 加入时间: ${participant.joined_at}, 离开时间: ${participant.left_at}`);
    });

    // 检查讲座表
    console.log('\n=== 检查 lectures 表数据 ===');
    const [lectures] = await pool.promise().query('SELECT id, title, status FROM lectures ORDER BY id DESC LIMIT 5');
    console.log(`讲座表中共有 ${lectures.length} 条记录（显示最新5条）：`);
    lectures.forEach(lecture => {
      console.log(`  ID: ${lecture.id}, 标题: ${lecture.title}, 状态: ${lecture.status}`);
    });

    console.log('\n=== 数据库检查完成 ===');
    
  } catch (error) {
    console.error('❌ 数据库检查失败:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

checkDatabase();
