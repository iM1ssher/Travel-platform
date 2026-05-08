// 檔案位置：app/api/seed/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // 1. 確保有「莎拉」這位行程規劃者 (使用 upsert 避免重複建立報錯)
    const hashedPassword = await bcrypt.hash('123456', 10);
    const planner = await prisma.user.upsert({
      where: { email: 'sarah@test.com' },
      update: {}, // 如果帳號已存在，就不做任何修改
      create: {
        email: 'sarah@test.com',
        name: 'Sarah',
        password: hashedPassword,
        role: 'planner',
      },
    });

    // 2. 準備 5 筆包含真實圖片的精美行程
    const fakeTrips = [
      {
        title: '京都楓葉季：5天4夜深度遊',
        summary: '走訪清水寺、嵐山，體驗最道地的京都秋日風情，並品嚐傳統懷石料理。',
        coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop',
        isPublished: true, // 已發布，會出現在首頁
        authorId: planner.id,
      },
      {
        title: '冰島極光環島探索',
        summary: '10天自駕環島，追尋夢幻北極光與壯麗冰川，解鎖人生清單。',
        coverImage: 'https://images.unsplash.com/photo-1521127264627-72ce893e32b4?q=80&w=1000&auto=format&fit=crop',
        isPublished: true, 
        authorId: planner.id,
      },
      {
        title: '峇里島耍廢度假指南',
        summary: '精選頂級海景 Villa 與無邊際泳池，享受純粹的放鬆時光與 SPA 按摩。',
        coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop',
        isPublished: true,
        authorId: planner.id,
      },
      {
        title: '紐約曼哈頓城市漫步',
        summary: '從中央公園到時代廣場，感受不夜城的繁華魅力與百老匯音樂劇。',
        coverImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1000&auto=format&fit=crop',
        isPublished: false, // 這篇是草稿，只會出現在莎拉的後台草稿箱
        authorId: planner.id,
      },
      {
        title: '瑞士絕美小鎮巡禮',
        summary: '搭乘冰河列車，漫步在如童話般的阿爾卑斯山小鎮，體驗極致自然之美。',
        coverImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1000&auto=format&fit=crop',
        isPublished: true,
        authorId: planner.id,
      }
    ];

    // 3. 寫入前，先清空莎拉以前的舊行程，避免你重複整理網頁導致資料無限增加
    await prisma.trip.deleteMany({
      where: { authorId: planner.id }
    });

    // 4. 批次將 5 筆資料寫入資料庫！
    await prisma.trip.createMany({
      data: fakeTrips,
    });

    // 5. 抓出剛才建好的資料展示給你看
    const createdTrips = await prisma.trip.findMany({ 
      where: { authorId: planner.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      message: '成功植入 5 筆精美旅遊行程！', 
      trips: createdTrips 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '資料建立失敗' }, { status: 500 });
  }
}