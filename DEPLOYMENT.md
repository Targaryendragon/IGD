# 独立游戏开发社区 - 部署指南

## Vercel 部署步骤

### 1. 数据库准备

该项目使用 Supabase PostgreSQL 数据库。已配置数据库连接：
- 数据库主机：`aws-0-ap-southeast-1.pooler.supabase.com`
- 端口：`6543`
- 数据库：`postgres`
- 用户：`postgres.oyldabuxfzntyzcmqwwq`
- 额外参数：`sslmode=require`（Supabase 需要 SSL 连接）

需要在 Vercel 环境变量中设置：
- `DATABASE_URL`：完整的数据库连接字符串

### 2. Vercel 部署步骤

1. 登录 Vercel 账户并导入 GitHub 仓库
2. 配置必要的环境变量：
   - `DATABASE_URL`：数据库连接字符串（确保包含 `sslmode=require` 参数）
   - `NEXTAUTH_SECRET`：NextAuth 认证密钥
   - `NEXTAUTH_URL`：生产环境的完整 URL
   - GitHub 或 Google 认证相关的环境变量（如使用）

3. 在构建命令中添加 Prisma 迁移步骤：
   ```
   npx prisma migrate deploy && npx prisma generate && npx prisma db seed && next build
   ```

### 3. 管理员帐号信息

默认管理员账号（首次部署时自动创建）：
- 邮箱：`admin@igd-community.com`
- 密码：`admin123456`

首次部署后，请立即登录并修改默认管理员密码。

### 4. 数据库管理

可通过以下方式管理数据库：
1. Supabase 控制台
2. 使用 pgAdmin 或其他 PostgreSQL 客户端工具直接连接数据库
3. 使用 Prisma Studio（本地开发时）：`npx prisma studio`

### 5. 常见问题

1. **数据库迁移失败**：
   - 检查数据库连接字符串和权限设置
   - 确认 Supabase 项目设置中已允许 Vercel 的 IP 访问数据库
   - 密码中的特殊字符已正确编码

2. **登录问题**：确保 NextAuth 环境变量正确配置

3. **图片上传问题**：调整 next.config.js 中的图片域名配置

### 6. 本地测试部署配置

在本地测试部署配置：
```
npm run build
npm run start
```

**注意**：在本地开发环境中，您可能无法直接连接到 Supabase 数据库，除非您的 IP 已在 Supabase 项目设置中允许。建议在本地开发时使用本地数据库。

### 7. 联系支持

如有任何部署问题，请联系技术支持团队。 