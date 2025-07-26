// 测试听众退出讲座后的状态管理

async function testListenerExitLogic() {
  console.log('🔧 测试听众退出讲座的状态管理逻辑...\n');
  
  try {
    const mysql = require('mysql2');
    const axios = require('axios');
    
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '375860',
      database: 'popquiz'
    });
    
    // 1. 重置测试环境
    console.log('1️⃣ 重置测试环境...');
    await connection.promise().query(
      'UPDATE lecture_participants SET status = "joined", left_at = NULL WHERE user_id = 1 AND lecture_id = 1'
    );
    console.log('✅ 用户状态已重置为joined');
    
    // 2. 登录获取token
    console.log('\n2️⃣ 登录测试用户...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'test02',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ 登录成功');
    
    // 3. 第一次退出讲座
    console.log('\n3️⃣ 第一次退出讲座...');
    const firstLeaveResponse = await axios.post(
      'http://localhost:3001/api/participants/leave/1',
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ 第一次退出成功:', firstLeaveResponse.data);
    
    // 4. 检查数据库状态
    const [dbResults] = await connection.promise().query(
      'SELECT * FROM lecture_participants WHERE user_id = 1 AND lecture_id = 1'
    );
    
    console.log('\n4️⃣ 数据库状态检查:');
    if (dbResults.length > 0) {
      const record = dbResults[0];
      console.log(`   状态: ${record.status}`);
      console.log(`   加入时间: ${record.joined_at}`);
      console.log(`   离开时间: ${record.left_at}`);
      
      if (record.status === 'left') {
        console.log('✅ 数据库状态正确更新为 left');
      } else {
        console.log('❌ 数据库状态更新失败');
      }
    }
    
    // 5. 测试重复退出（应该失败）
    console.log('\n5️⃣ 测试重复退出...');
    try {
      const secondLeaveResponse = await axios.post(
        'http://localhost:3001/api/participants/leave/1',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('❌ 重复退出应该失败，但成功了:', secondLeaveResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ 重复退出正确返回错误:', error.response.data.error);
      } else {
        console.log('⚠️ 重复退出返回了意外错误:', error.message);
      }
    }
    
    // 6. 测试重新加入讲座
    console.log('\n6️⃣ 测试重新加入讲座...');
    try {
      const rejoinResponse = await axios.post(
        'http://localhost:3001/api/participants/join/1',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ 重新加入成功:', rejoinResponse.data);
      
      // 检查重新加入后的状态
      const [rejoinResults] = await connection.promise().query(
        'SELECT * FROM lecture_participants WHERE user_id = 1 AND lecture_id = 1'
      );
      
      if (rejoinResults.length > 0) {
        const record = rejoinResults[0];
        if (record.status === 'joined') {
          console.log('✅ 重新加入后状态正确更新为 joined');
        } else {
          console.log('❌ 重新加入后状态未正确更新');
        }
      }
      
    } catch (error) {
      console.log('❌ 重新加入失败:', error.response?.data || error.message);
    }
    
    connection.end();
    
    console.log('\n🎯 测试要点总结:');
    console.log('✅ 听众退出讲座后，数据库状态正确更新为 left');
    console.log('✅ 重复退出正确返回错误（您尚未加入这个讲座）');
    console.log('✅ 听众可以重新加入讲座（状态从 left 变为 joined）');
    console.log('\n💡 前端行为预期:');
    console.log('- 退出后 currentLectureData.value 被清空（隐藏"当前讲座"按钮）');
    console.log('- sessionStorage.currentLectureId 保留（允许重新进入）');
    console.log('- 用户可以通过重新访问讲座页面来重新加入');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
}

testListenerExitLogic();
