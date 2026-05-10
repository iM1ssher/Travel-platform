import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

// GET /api/admin/users - 獲取所有用戶（管理員專用）
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role'); // 過濾角色
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          _count: {
            select: {
              trips: true,
              participations: true,
              reviews: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/users - 更新用戶角色（管理員專用）
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, role } = await request.json();

    if (!userId || !role || !['traveler', 'planner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // 檢查用戶是否存在
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 防止管理員降級自己
    if (user.id === session.id && role !== 'admin') {
      return NextResponse.json({ error: 'Cannot change your own admin role' }, { status: 400 });
    }

    // 更新用戶角色
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/users - 刪除用戶（管理員專用）
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const targetUserId = parseInt(userId);

    // 防止刪除自己
    if (targetUserId === session.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // 檢查用戶是否存在
    const user = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 刪除用戶（會因為外鍵約束自動刪除相關數據）
    await prisma.user.delete({
      where: { id: targetUserId }
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}