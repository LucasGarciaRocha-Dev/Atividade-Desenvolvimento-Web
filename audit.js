const { PrismaClient } = require('@prisma/client');
const { registerUser, authenticateUser } = require('./auth');

const prisma = new PrismaClient();

async function runSecurityAudit() {
  await prisma.user.deleteMany({
    where: { email: 'carlos@sec.org' }
  });

  const registered = await registerUser(
    'Carlos Silveira',
    'carlos@sec.org',
    'SuperSecretPass123!'
  );
  console.log('1. Usuário registrado (payload higienizado sem senha):', registered);

  const rawRecords = await prisma.$queryRaw`
    SELECT email, password FROM User WHERE email = 'carlos@sec.org'
  `;
  const hash = rawRecords[0].password;

  console.log('\n2. Registro bruto no banco:', rawRecords[0]);
  console.log('   Prefixo Bcrypt ($2b$):', hash.startsWith('$2b$'));
  console.log('   Tamanho total do hash (esperado 60):', hash.length);

  const authSuccess = await authenticateUser('carlos@sec.org', 'SuperSecretPass123!');
  console.log('\n3. Autenticação bem-sucedida para:', authSuccess.email);

  try {
    await authenticateUser('carlos@sec.org', 'SenhaErrada999');
  } catch (error) {
    console.log('4. Falha esperada (senha errada):', error.message);
  }

  try {
    await authenticateUser('naoexiste@sec.org', 'SuperSecretPass123!');
  } catch (error) {
    console.log('5. Falha esperada (e-mail inexistente):', error.message);
  }
}

runSecurityAudit()
  .catch((err) => console.error('Erro na auditoria:', err))
  .finally(async () => await prisma.$disconnect());