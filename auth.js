const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function registerUser(name, email, plainPassword) {
  if (!plainPassword || plainPassword.length < 8) {
    throw new Error('A senha deve ter no mínimo 8 caracteres.');
  }

  const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    }
  });

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

async function authenticateUser(email, plainPassword) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('Credenciais inválidas.');
  }

  const isPasswordValid = await bcrypt.compare(plainPassword, user.password);

  if (!isPasswordValid) {
    throw new Error('Credenciais inválidas.');
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

module.exports = {
  registerUser,
  authenticateUser
};