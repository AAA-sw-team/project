const axios = require('axios');

// 测试退出讲座API
async function testLeaveLecture() {
  try {
    console.log('开始测试退出讲座API...\n');
    
    // 首先登录获取token（尝试几种常见密码）
    console.log('1. 正在登录...');
    let loginResponse;
    const passwords = ['test02', '123456', 'password', '111111'];
    
    for (const password of passwords) {
      try {
        console.log(`尝试密码: ${password}`);
        loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
          username: 'test02',
          password: password
        });
        console.log(`密码 ${password} 登录成功！`);
        break;
      } catch (err) {
        console.log(`密码 ${password} 失败`);
        if (password === passwords[passwords.length - 1]) {
          throw new Error('所有密码都尝试失败');
        }
      }
    }
    
    if (loginResponse.data.token) {
      console.log('登录成功，获得token');
      const token = loginResponse.data.token;
      
      // 解析token获取用户信息
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      console.log('完整token payload:', payload);
      
      // 尝试不同的用户ID字段
      const userId = payload.id || payload.userId || payload.user_id || payload.sub;
      console.log('提取的用户ID:', userId);
      
      // 调用退出讲座API（假设讲座ID为1）
      console.log('\n2. 尝试退出讲座ID=1...');
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
      
      console.log('退出讲座响应:', leaveResponse.data);
      
      // 验证数据库状态 - 先检查所有相关记录
      console.log('\n3. 检查数据库状态...');
      const mysql = require('mysql2');
      const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '375860',
        database: 'popquiz'
      });
      
      // 查看用户ID为1的记录（从之前的简单检查知道有这个记录）
      const [user1Records] = await connection.promise().query(
        'SELECT * FROM lecture_participants WHERE user_id = 1'
      );
      console.log('用户ID=1的所有记录:', user1Records);
      
      // 查看所有最近的记录
      const [allRecent] = await connection.promise().query(
        'SELECT * FROM lecture_participants ORDER BY joined_at DESC LIMIT 3'
      );
      console.log('最近的3条记录:', allRecent);
      
      connection.end();
      
    } else {
      console.log('登录失败:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应头:', error.response.headers);
    }
  }
}

testLeaveLecture();
