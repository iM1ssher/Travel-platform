import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// 建立一個函式來初始化帶有 Adapter 的 Prisma Client
const createPrismaClient = () => {
  // 1. 讀取 .env 裡的網址建立連線池 (Pool)
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  // 2. 將連線池包裝成 Prisma 聽得懂的 Adapter
  const adapter = new PrismaPg(pool);
  
  // 3. 實立化 PrismaClient，並把 adapter 餵給它
  return new PrismaClient({ adapter });
};

// 避免 Next.js 在開發模式 (npm run dev) 熱重載時，重複建立多條連線導致資料庫塞車
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
