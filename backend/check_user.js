const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
  const email = 'yadavarpan03@gmail.com';
  const newPassword = '@Apy18748';
  
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log(`User ${email} NOT FOUND in database.`);
      
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true }
      });
      console.log('Users in DB:', allUsers);
      return;
    }
    
    console.log(`User found: ${user.name} (${user.email})`);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    
    console.log(`Successfully reset password for ${email} to ${newPassword}`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
