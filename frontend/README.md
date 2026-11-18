# Balcão da biblioteca

Interface local para a apresentação do banco. O navegador carrega HTML, CSS e JavaScript; o servidor Node.js faz as consultas ao MySQL usando o usuário da aplicação. As credenciais ficam no servidor.

## Executar

O HTML carrega o Tailwind pelo script local `/vendor/tailwind.js`. Para mudar o visual, edite as classes em `public/index.html`. Não há arquivo CSS nem etapa de compilação de estilos.

Na **raiz do repositório**, use o `.env` do banco. Se ele ainda não existir, copie `.env.example` para `.env` e configure as senhas. Execute:

```sh
docker compose -f docker-compose.yml -f frontend/compose.yml up -d --build
```

Abra **http://localhost:8080**. Na primeira carga, a interface espera o MySQL criar as tabelas. Para acompanhar a inicialização:

```sh
docker compose -f docker-compose.yml -f frontend/compose.yml logs -f web
```

Para parar os dois serviços mantendo os cadastros, use `docker compose -f docker-compose.yml -f frontend/compose.yml down`.

## Roteiro de teste

1. Em **Livros**, filtre por um título. A linha reúne editora, coautores e quantidade de cópias disponíveis. As abas **Autores**, **Editoras** e **Autorias** permitem cadastrar e associar esses registros. Os códigos são preenchidos manualmente.
2. Em **Leitores**, cadastre uma pessoa com CPF e e-mail únicos. Em **Exemplares**, consulte uma cópia disponível ou cadastre outra para o mesmo título.
3. Em **Empréstimos → Novo registro**, informe um número livre, selecione o leitor e a cópia e preencha retirada e prazo. A lista oferece apenas exemplares disponíveis. Ao salvar, a cópia passa para `Emprestado`.
4. Use **Alterar prazo** e depois **Devolver** na mesma linha. A retirada permanece no histórico com a data efetiva; a cópia volta à lista de disponíveis. Em **Exemplares**, também é possível colocar uma cópia em manutenção ou marcá-la como danificada.

### Registro das devoluções

O modelo da disciplina guarda apenas o prazo. Ao iniciar, o serviço cria, se necessário, a tabela auxiliar `DevolucaoWeb (id_emprestimo, data_devolucao)` no mesmo banco. `id_emprestimo` é a chave primária e referencia `Emprestimo.numero_emprestimo`. A carga inicial considera todas as retiradas em aberto. A retirada e a devolução atualizam a situação da cópia na mesma transação da operação. Nenhum script do seed precisa ser executado outra vez.

As exclusões respeitam as referências do banco. Para corrigir uma autoria, remova o vínculo e cadastre o par correto. A interface preserva empréstimos já registrados.
