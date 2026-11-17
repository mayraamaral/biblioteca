# Sistema de Biblioteca

Para operar o banco pelo navegador, consulte a [documentação do frontend da biblioteca](frontend/README.md). A interface utiliza o mesmo volume e as credenciais do `.env` da raiz.

Trabalho da disciplina de Modelagem de Banco de Dados do curso de Engenharia de Software.

## Como rodar

Com Docker e Compose instalados e a porta 3306 livre, copie as variáveis do ambiente:

```sh
cp .env.example .env
```

Edite as duas senhas no `.env` antes de subir o banco. Mantenha `MYSQL_DATABASE=biblioteca`, nome usado nos scripts. Não versione o `.env` com as senhas.

```sh
docker compose up -d
docker compose logs -f db
```

Na primeira subida, o MySQL executa `sql/01-schema.sql` e depois `sql/02-seed.sql`. Aguarde o servidor indicar `ready for connections` na porta 3306. Use `Ctrl+C` para sair dos logs; o banco continua rodando.

**Terminal.** Com o usuário `aluno` do exemplo, execute o comando abaixo e digite `MYSQL_PASSWORD` quando o cliente pedir a senha:

```sh
docker exec -it biblioteca-mysql mysql --default-character-set=utf8mb4 -u aluno -p biblioteca
```

**DBeaver.** Crie uma conexão MySQL com host `127.0.0.1`, porta `3306`, banco `biblioteca` e as credenciais `MYSQL_USER` e `MYSQL_PASSWORD` do `.env`. Se o driver mostrar *Public Key Retrieval is not allowed* nessa conexão local, abra **Driver properties**, defina `allowPublicKeyRetrieval=true` e teste novamente.

**Para refazer a carga:** `docker compose down` preserva o volume. Se alguém editar os scripts e precisar testar do zero, os comandos abaixo **apagam os dados locais**, inclusive os inseridos depois da carga, e executam os dois arquivos novamente:

```sh
docker compose down -v
docker compose up -d
```

## Esquema relacional

```plaintext
Autor (codigo, nome)
Editora (codigo, nome)
Usuario (codigo, nome, cpf, telefone, email)
Livro (codigo, titulo, ano_publicacao, codigo_editora)
  codigo_editora referencia Editora (codigo)
LivroAutor (codigo_livro, codigo_autor)
  codigo_livro referencia Livro (codigo)
  codigo_autor referencia Autor (codigo)
Exemplar (numero_registro, codigo_livro, status)
  codigo_livro referencia Livro (codigo)
Emprestimo (numero_emprestimo, numero_exemplar, codigo_usuario, data_emprestimo, data_devolucao_prevista)
  numero_exemplar referencia Exemplar (numero_registro)
  codigo_usuario referencia Usuario (codigo)
```
## Decisões de arquitetura
Separamos o cadastro do livro do registro da cópia física: duas pessoas podem retirar o mesmo título se levarem exemplares diferentes. O empréstimo registra o número da cópia e o código do leitor; nome, CPF e contato ficam em `Usuario`.
## Dicionário de dados

**PRI** indica participação na chave primária; **EST**, chave estrangeira; **CAN**, chave candidata alternativa com `UNIQUE`. Os identificadores são informados nos `INSERT`s. Em `LivroAutor`, o par de códigos identifica a linha: um livro pode ter vários autores e cada autor pode aparecer em vários livros.

### Autor

| ATRIBUTO | TIPO | NULO | DESCRIÇÃO | DOMÍNIO | PRI | EST | CAN |
|---|---|---|---|---|---|---|---|
| codigo | INT | Não | Identificador do autor | Inteiro | X | | |
| nome | VARCHAR(100) | Não | Nome de autoria | Texto de até 100 caracteres | | | |

### Editora

| ATRIBUTO | TIPO | NULO | DESCRIÇÃO | DOMÍNIO | PRI | EST | CAN |
|---|---|---|---|---|---|---|---|
| codigo | INT | Não | Identificador da editora | Inteiro | X | | |
| nome | VARCHAR(100) | Não | Nome da editora | Texto de até 100 caracteres | | | |

### Usuario

| ATRIBUTO | TIPO | NULO | DESCRIÇÃO | DOMÍNIO | PRI | EST | CAN |
|---|---|---|---|---|---|---|---|
| codigo | INT | Não | Identificador do leitor | Inteiro | X | | |
| nome | VARCHAR(100) | Não | Nome do leitor | Texto de até 100 caracteres | | | |
| cpf | CHAR(11) | Não | CPF sem pontuação; preserva zeros à esquerda | 11 dígitos | | | X |
| telefone | VARCHAR(15) | Sim | Telefone de contato | Até 15 caracteres | | | |
| email | VARCHAR(100) | Não | Endereço eletrônico do leitor | Até 100 caracteres | | | X |

### Livro

| ATRIBUTO | TIPO | NULO | DESCRIÇÃO | DOMÍNIO | PRI | EST | CAN |
|---|---|---|---|---|---|---|---|
| codigo | INT | Não | Identificador do livro | Inteiro | X | | |
| titulo | VARCHAR(150) | Não | Título da obra | Texto de até 150 caracteres | | | |
| ano_publicacao | INT | Não | Ano da edição cadastrada | Ano em número inteiro | | | |
| codigo_editora | INT | Não | Editora da edição | Editora.codigo | | X | |

### LivroAutor

| ATRIBUTO | TIPO | NULO | DESCRIÇÃO | DOMÍNIO | PRI | EST | CAN |
|---|---|---|---|---|---|---|---|
| codigo_livro | INT | Não | Livro do vínculo de autoria | Livro.codigo | X | X | |
| codigo_autor | INT | Não | Autor do livro | Autor.codigo | X | X | |

### Exemplar

| ATRIBUTO | TIPO | NULO | DESCRIÇÃO | DOMÍNIO | PRI | EST | CAN |
|---|---|---|---|---|---|---|---|
| numero_registro | INT | Não | Registro da cópia física | Inteiro | X | | |
| codigo_livro | INT | Não | Livro ao qual a cópia pertence | Livro.codigo | | X | |
| status | VARCHAR(20) | Não | Situação atual da cópia | Disponível (padrão), Emprestado, Danificado ou Manutenção | | | |

### Emprestimo

| ATRIBUTO | TIPO | NULO | DESCRIÇÃO | DOMÍNIO | PRI | EST | CAN |
|---|---|---|---|---|---|---|---|
| numero_emprestimo | INT | Não | Identificador da retirada | Inteiro | X | | |
| numero_exemplar | INT | Não | Cópia retirada | Exemplar.numero_registro | | X | |
| codigo_usuario | INT | Não | Leitor responsável | Usuario.codigo | | X | |
| data_emprestimo | DATE | Não | Dia da retirada | Data | | | |
| data_devolucao_prevista | DATE | Não | Prazo para devolver a cópia | Data igual ou posterior à retirada | | | |
