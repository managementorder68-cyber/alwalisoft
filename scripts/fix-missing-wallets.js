/**
 * إنشاء Wallet و UserStatistics لجميع المستخدمين الذين لا يملكونها
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMissingWalletsAndStats() {
  console.log('🔧 بدء إصلاح Wallets و Statistics المفقودة...\n');
  
  try {
    // 1. جلب جميع المستخدمين
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        username: true, 
        balance: true,
        telegramId: true
      }
    });
    
    console.log(`👥 إجمالي المستخدمين: ${users.length}\n`);
    
    let walletsCreated = 0;
    let statsCreated = 0;
    let errors = 0;
    
    // 2. فحص وإنشاء Wallet و Statistics لكل مستخدم
    for (const user of users) {
      console.log(`📊 فحص المستخدم: ${user.username} (${user.telegramId})`);
      
      try {
        // فحص Wallet
        const existingWallet = await prisma.wallet.findUnique({
          where: { userId: user.id }
        });
        
        if (!existingWallet) {
          console.log('  💰 Wallet مفقود - سيتم إنشاؤه...');
          await prisma.wallet.create({
            data: {
              userId: user.id,
              balance: user.balance || 0,
              totalEarned: user.balance || 0,
              totalWithdrawn: 0
            }
          });
          walletsCreated++;
          console.log('  ✅ تم إنشاء Wallet');
        } else {
          console.log('  ✅ Wallet موجود');
        }
        
        // فحص UserStatistics
        const existingStats = await prisma.userStatistics.findUnique({
          where: { userId: user.id }
        });
        
        if (!existingStats) {
          console.log('  📊 Statistics مفقودة - سيتم إنشاؤها...');
          await prisma.userStatistics.create({
            data: {
              userId: user.id,
              dailyEarnings: 0,
              weeklyEarnings: 0,
              monthlyEarnings: 0,
              totalEarnings: 0,
              currentStreak: 0,
              longestStreak: 0
            }
          });
          statsCreated++;
          console.log('  ✅ تم إنشاء Statistics');
        } else {
          console.log('  ✅ Statistics موجودة');
        }
        
        console.log('');
        
      } catch (error) {
        console.error(`  ❌ خطأ مع المستخدم ${user.username}:`, error.message);
        errors++;
        console.log('');
      }
    }
    
    console.log('\n📊 النتائج النهائية:');
    console.log('✅ Wallets تم إنشاؤها:', walletsCreated);
    console.log('✅ Statistics تم إنشاؤها:', statsCreated);
    console.log('❌ أخطاء:', errors);
    console.log('\n✅ اكتمل الإصلاح!');
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingWalletsAndStats();
"