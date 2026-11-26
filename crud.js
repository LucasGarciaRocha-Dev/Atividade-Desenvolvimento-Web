const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('MinhaSenha123', 12);

    const novoUsuario = await prisma.user.create({
        data: {
            name: 'João da Silva',
            email:('joaodasilva@gmail.com'),
            password: hashedPassword,
            tasks: {
                create: [
                    { title: 'Estudar lógica de programação', completed: true },
                    { title: 'Organizar anotações da faculdade', completed: false }
                ]
            }
        },
        include: { tasks: true }
    });

    
 const { password, ...usuarioSemSenha } = novoUsuario;
  console.log('Usuário criado com sucesso:', usuarioSemSenha);
  console.log('Senha incorreta confere?', await bcrypt.compare('senhaErrada', novoUsuario.password));
  console.log('Senha correta confere?', await bcrypt.compare('MinhaSenha123', novoUsuario.password));


    const tarefas = await prisma.task.findMany({
        where: { completed: false },
        include: { user: true }
    });

    console.log('Tarefas pendentes: ', tarefas);

    const atualizarTarefas = await prisma.task.update({
        where: { id: tarefas[0].id },
        data: { completed: true }
    });

    console.log('Tarefa atualizada com sucesso: ', atualizarTarefas);

    await prisma.user.delete({
        where: { id: novoUsuario.id }
    });
    console.log('Usuário e suas tarefas excluídos com sucesso.');

}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());