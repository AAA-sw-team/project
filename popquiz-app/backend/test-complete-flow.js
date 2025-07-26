// 测试退出讲座功能的完整流程

async function testLeaveLectureFlow() {
  console.log('🔧 开始测试退出讲座完整流程...\n');
  
  try {
    // 1. 检查当前数据库状态
    console.log('1️⃣ 检查当前数据库状态...');
    
    const mysql = require('mysql2');
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '375860',
      database: 'popquiz'
    });
    
    // 查看用户1的当前状态
    const [beforeResults] = await connection.promise().query(
      'SELECT * FROM lecture_participants WHERE user_id = 1 ORDER BY joined_at DESC LIMIT 1'
    );
    
    console.log('退出前的状态:', beforeResults);
    
    // 2. 如果用户状态是left，先重置为joined以便测试
    if (beforeResults.length > 0 && beforeResults[0].status === 'left') {
      console.log('🔄 重置用户状态为joined以便测试...');
      await connection.promise().query(
        'UPDATE lecture_participants SET status = "joined", left_at = NULL WHERE user_id = 1 AND lecture_id = 1'
      );
      console.log('✅ 状态已重置为joined');
    }
    
    // 3. 测试API调用
    console.log('\n2️⃣ 测试退出讲座API...');
    
    // 首先登录获取token
    const axios = require('axios');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'test02',
      password: '123456'
    });
    
    if (!loginResponse.data.token) {
      throw new Error('登录失败');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ 登录成功');
    
    // 调用退出讲座API
    const leaveResponse = await axios.post(
      'http://localhost:3001/api/participants/leave/1',
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ API调用成功:', leaveResponse.data);
    
    // 4. 验证数据库状态
    console.log('\n3️⃣ 验证数据库状态变化...');
    
    const [afterResults] = await connection.promise().query(
      'SELECT * FROM lecture_participants WHERE user_id = 1 AND lecture_id = 1'
    );
    
    console.log('退出后的状态:', afterResults);
    
    if (afterResults.length > 0) {
      const record = afterResults[0];
      if (record.status === 'left' && record.left_at) {
        console.log('✅ 数据库状态更新成功！');
        console.log(`   状态: ${record.status}`);
        console.log(`   离开时间: ${record.left_at}`);
      } else {
        console.log('❌ 数据库状态未正确更新');
        console.log(`   当前状态: ${record.status}`);
        console.log(`   离开时间: ${record.left_at}`);
      }
    }
    
    // 5. 测试再次调用API的情况
    console.log('\n4️⃣ 测试重复退出情况...');
    
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
      console.log('❌ 重复退出应该失败，但是成功了:', secondLeaveResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ 重复退出正确返回错误:', error.response.data);
      } else {
        console.log('⚠️ 重复退出返回了意外错误:', error.message);
      }
    }
    
    connection.end();
    console.log('\n🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
}

testLeaveLectureFlow();
