# IGD社区 - 独立游戏开发者社区平台

IGD社区是一个为独立游戏开发者设计的专业社区平台，旨在提供开发工具分享和用户交流的集中场所。

## 项目特性

- **开发工具模块**：提供各类游戏开发工具的介绍、评分和使用教程
- **社区文章模块**：用户可发布开发日记、技术分享、经验教训等内容
- **用户系统**：支持邮箱和第三方登录，用户资料页展示发布内容和收藏
- **响应式设计**：完美适配桌面和移动设备

## 技术栈

- **前端**：Next.js、React、TypeScript、Tailwind CSS
- **后端**：Next.js API Routes、Prisma ORM
- **数据库**：PostgreSQL
- **认证**：NextAuth.js
- **内容**：Markdown/MDX支持
- **部署**：Vercel

## 本地开发

1. 克隆仓库
```bash
git clone https://github.com/yourusername/igd-community.git
cd igd-community
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建 `.env.local` 文件并添加必要的环境变量：
```
DATABASE_URL="postgresql://username:password@localhost:5432/igd"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. 初始化数据库
```bash
npx prisma migrate dev
```

5. 启动开发服务器
```bash
npm run dev
```

6. 在浏览器中访问 `http://localhost:3000`

## 项目结构

- `/src/app`: Next.js App路由目录
- `/src/components`: React组件
- `/src/lib`: 共用工具和服务
- `/src/models`: 数据模型和类型定义
- `/prisma`: 数据库模型

## 贡献指南

1. Fork项目
2. 创建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的改动 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 开源协议

[MIT](LICENSE) 