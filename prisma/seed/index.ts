import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 清理数据库
  await prisma.user.deleteMany({});

  // 创建管理员用户
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: '管理员',
      email: 'admin@example.com',
      password: adminPassword,
      isAdmin: true,
    },
  });
  console.log(`创建管理员用户: ${admin.email}`);

  // 创建普通用户
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      name: '测试用户',
      email: 'user@example.com',
      password: userPassword,
    },
  });
  console.log(`创建普通用户: ${user.email}`);

  console.log('数据库初始化完成!');
}

main()
  .catch((e) => {
    console.error('数据库初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 