const { Client } = require('pg');

// 数据库连接URL (使用提供的Supabase URL)
const connectionString = "postgresql://postgres.oyldabuxfzntyzcmqwwq:l1efeU2rbVPv9o1B@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=no-verify";

async function testConnection() {
  console.log('开始测试数据库连接...');
  console.log(`连接URL: ${connectionString.replace(/:[^:]*@/, ':****@')}`);
  
  const client = new Client({
    connectionString,
  });

  try {
    // 连接到数据库
    console.log('尝试连接到数据库...');
    const startTime = Date.now();
    await client.connect();
    const connectTime = Date.now() - startTime;
    console.log(`✅ 成功连接到数据库！(耗时: ${connectTime}ms)`);

    // 测试简单查询
    console.log('尝试执行简单查询...');
    const queryResult = await client.query('SELECT current_timestamp as time, current_database() as database, version() as version');
    console.log('查询结果:', queryResult.rows[0]);
    
    // 尝试查询一些表信息
    console.log('查询数据库表信息...');
    const tablesResult = await client.query(`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      LIMIT 10
    `);
    console.log('数据库表列表:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name} (${row.table_schema})`);
    });
    
    // 尝试查询用户表
    try {
      const userCount = await client.query('SELECT COUNT(*) FROM "User"');
      console.log(`用户表总数: ${userCount.rows[0].count}`);
    } catch (error) {
      console.error('查询用户表失败:', error.message);
    }
    
    // 尝试查询工具表
    try {
      const toolCount = await client.query('SELECT COUNT(*) FROM "Tool"');
      console.log(`工具表总数: ${toolCount.rows[0].count}`);
    } catch (error) {
      console.error('查询工具表失败:', error.message);
    }

    return '数据库连接测试成功！';
  } catch (error) {
    console.error('❌ 数据库连接测试失败!');
    console.error('错误信息:', error.message);
    console.error('错误代码:', error.code);
    console.error('错误详情:', error);
    
    return '数据库连接测试失败: ' + error.message;
  } finally {
    // 关闭连接
    try {
      await client.end();
      console.log('数据库连接已关闭');
    } catch (err) {
      console.error('关闭连接时出错:', err.message);
    }
  }
}

// 执行测试
testConnection()
  .then(result => {
    console.log('\n测试结果:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('\n测试过程中发生错误:', error);
    process.exit(1);
  }); 