const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestEvent() {
  try {
    // テスト用のイベントを作成
    const testEvent = await prisma.event.create({
      data: {
        title: 'テストイベント',
        description: 'これはテスト用のイベントです。',
        startDate: new Date('2024-12-25T10:00:00Z'),
        endDate: new Date('2024-12-25T12:00:00Z'),
        location: '東京都新宿区',
        maxParticipants: 50,
        registrationStart: new Date('2024-12-01T00:00:00Z'),
        registrationEnd: new Date('2024-12-24T23:59:59Z'),
        isPublic: true,
        accessToken: 'test-token-123',
        organizationId: 1,
        groupId: null,
      },
    });

    console.log('テストイベントが作成されました:', testEvent);
    console.log('アクセストークン:', testEvent.accessToken);
    console.log('テストURL:', `http://localhost:3000/events/${testEvent.id}/register?token=${testEvent.accessToken}`);
    
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestEvent(); 