const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {

    const novoUsuario = await prisma.user.create({
        data: {
            name: 'João da Silva',
            email: 'joaodasilva@gmail.com',
            tasks: {
                create: [
                    { title: 'Estudar lógica de programação', completed: true },
                    { title: 'Organizar anotações da faculdade', completed: false }
                ]
            }
        },
        include: { tasks: true }
    });

    console.log('Usuário criado com sucesso:', novoUsuario);


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