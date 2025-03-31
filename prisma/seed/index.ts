import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 检查管理员用户是否已存在
  const adminExists = await prisma.user.findFirst({
    where: {
      email: 'admin@igd-community.com',
    },
  });

  // 如果管理员不存在，创建一个管理员用户
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123456', 10);
    
    await prisma.user.create({
      data: {
        name: '管理员',
        email: 'admin@igd-community.com',
        password: hashedPassword,
        isAdmin: true,
        isVerified: true,
      },
    });
    
    console.log('✅ 管理员用户创建成功');
  } else {
    console.log('✅ 管理员用户已存在');
  }
}

main()
  .catch((e) => {
    console.error('❌ 种子脚本执行错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 