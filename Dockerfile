# 基础构建阶段
FROM node:20-alpine AS base
WORKDIR /app
# 安装依赖所需的文件
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# 如果你使用的是 npm，可以删除其他 lock 文件相关的行
RUN npm install
COPY . .

# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=base /app ./
# 构建 Next.js 应用
RUN npm run build

# 生产运行阶段
FROM node:20-alpine AS runner
WORKDIR /app

# 设置生产环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 创建非 root 用户以提高安全性
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要的文件
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size 
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 更改文件所有权
RUN chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

# 启动命令
CMD ["node", "server.js"]