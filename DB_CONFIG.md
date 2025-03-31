# 数据库配置备忘录

## Supabase 数据库信息

项目数据库已更新为 Supabase 托管的 PostgreSQL 数据库，配置如下：

- **主机**: `aws-0-ap-southeast-1.pooler.supabase.com`
- **端口**: `6543`
- **数据库**: `postgres`
- **用户**: `postgres.oyldabuxfzntyzcmqwwq`
- **连接参数**: `sslmode=require` (必须)

## Vercel 部署配置

部署到 Vercel 时，请确保设置以下环境变量：

```
DATABASE_URL=postgresql://postgres.oyldabuxfzntyzcmqwwq:[数据库密码]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**重要**: 
1. 请替换 `[数据库密码]` 为实际密码
2. 如果密码中包含特殊字符，请进行 URL 编码
3. 确保 Supabase 项目设置中已允许 Vercel 的 IP 地址访问数据库

## 本地开发注意事项

由于 Supabase 数据库通常限制 IP 访问，本地开发时可能无法直接连接到远程数据库。建议：

1. 使用本地 PostgreSQL 数据库进行开发
2. 在 Supabase 控制台添加您的 IP 地址到允许列表
3. 使用 VPN 连接到允许的网络进行开发

## 数据库管理

可通过以下方式管理数据库：

1. Supabase 控制台 (推荐)
2. 使用 pgAdmin 或其他 PostgreSQL 客户端工具直接连接
3. 使用 Prisma Studio (本地开发): `npx prisma studio` 