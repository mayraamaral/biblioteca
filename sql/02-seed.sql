SET NAMES utf8mb4;
USE biblioteca;
START TRANSACTION;

INSERT INTO Autor (id, nome) VALUES
    (1, 'Machado de Assis'), (2, 'Clarice Lispector'),
    (3, 'Carlos Alberto Heuser'), (4, 'Ramez Elmasri'),
    (5, 'Shamkant B. Navathe'), (6, 'Robert C. Martin'),
    (7, 'Graciliano Ramos'), (8, 'Carolina Maria de Jesus'),
    (9, 'Jorge Amado'), (10, 'Andrew S. Tanenbaum'),
    (11, 'David J. Wetherall');

INSERT INTO Editora (id, nome) VALUES
    (1, 'Companhia das Letras'), (2, 'Rocco'), (3, 'Bookman'),
    (4, 'Pearson'), (5, 'Alta Books'), (6, 'Record'),
    (7, 'Ática'), (8, 'Todavia'), (9, 'Novatec'), (10, 'Contexto');

-- Cadastros fictícios; os CPFs são identificadores de teste.
INSERT INTO Usuario (id, nome, cpf, telefone, email) VALUES
    (1, 'Ana Reis', '00000000001', NULL, 'ana@example.org'),
    (2, 'Bento Lima', '00000000002', '11900000002', 'bento@example.org'),
    (3, 'Célia Alves', '00000000003', NULL, 'celia@example.org'),
    (4, 'Davi Luz', '00000000004', '21900000004', 'davi@example.org'),
    (5, 'Elisa Melo', '00000000005', NULL, 'elisa@example.org'),
    (6, 'Fábio Paes', '00000000006', '31900000006', 'fabio@example.org'),
    (7, 'Graça Dias', '00000000007', NULL, 'graca@example.org'),
    (8, 'Hugo Leal', '00000000008', '51900000008', 'hugo@example.org'),
    (9, 'Iara Nunes', '00000000009', NULL, 'iara@example.org'),
    (10, 'João Prado', '00000000010', '41900000010', 'joao@example.org');

INSERT INTO Livro (id, titulo, ano_publicacao, id_editora) VALUES
    (1, 'Dom Casmurro', 2016, 1), (2, 'A hora da estrela', 1998, 2),
    (3, 'Projeto de banco de dados', 2009, 3),
    (4, 'Sistemas de banco de dados', 2019, 4),
    (5, 'Arquitetura limpa', 2019, 5), (6, 'Vidas secas', 2019, 6),
    (7, 'Quarto de despejo', 2014, 7), (8, 'Capitães da Areia', 2008, 1),
    (9, 'Redes de computadores', 2011, 4), (10, 'Laços de família', 1998, 2);

INSERT INTO LivroAutor (id_livro, id_autor) VALUES
    (1,1), (2,2), (3,3), (4,4), (4,5), (5,6),
    (6,7), (7,8), (8,9), (9,10), (9,11), (10,2);

INSERT INTO Exemplar (numero_registro, id_livro, status) VALUES
    (101,1,'Emprestado'), (102,2,'Emprestado'), (103,3,'Emprestado'),
    (104,4,'Emprestado'), (105,5,'Emprestado'), (106,6,'Emprestado'),
    (107,7,'Emprestado'), (108,8,'Emprestado'), (109,9,'Emprestado'),
    (110,10,'Emprestado'), (111,4,DEFAULT), (112,6,'Danificado'),
    (113,9,'Manutenção');

-- Os dez empréstimos estão em aberto na data da carga, com prazo de 14 dias.
SET @hoje = CURRENT_DATE();
INSERT INTO Emprestimo (numero_emprestimo, id_exemplar, id_usuario, data_emprestimo, data_devolucao_prevista) VALUES
    (201,101,1,@hoje - INTERVAL 9 DAY,@hoje + INTERVAL 5 DAY),
    (202,102,2,@hoje - INTERVAL 8 DAY,@hoje + INTERVAL 6 DAY),
    (203,103,3,@hoje - INTERVAL 7 DAY,@hoje + INTERVAL 7 DAY),
    (204,104,4,@hoje - INTERVAL 6 DAY,@hoje + INTERVAL 8 DAY),
    (205,105,5,@hoje - INTERVAL 5 DAY,@hoje + INTERVAL 9 DAY),
    (206,106,6,@hoje - INTERVAL 4 DAY,@hoje + INTERVAL 10 DAY),
    (207,107,7,@hoje - INTERVAL 3 DAY,@hoje + INTERVAL 11 DAY),
    (208,108,8,@hoje - INTERVAL 2 DAY,@hoje + INTERVAL 12 DAY),
    (209,109,9,@hoje - INTERVAL 1 DAY,@hoje + INTERVAL 13 DAY),
    (210,110,10,@hoje,@hoje + INTERVAL 14 DAY);
COMMIT;

-- 1. Quais livros têm mais de um autor?
-- SELECT l.titulo, GROUP_CONCAT(a.nome ORDER BY a.nome SEPARATOR '; ') AS autores
-- FROM Livro l JOIN LivroAutor la ON la.id_livro = l.id
-- JOIN Autor a ON a.id = la.id_autor
-- GROUP BY l.id, l.titulo HAVING COUNT(*) > 1 ORDER BY l.titulo;

-- 2. Quem retirou cada exemplar e qual é o prazo?
-- SELECT u.nome, l.titulo, e.id_exemplar, e.data_devolucao_prevista
-- FROM Emprestimo e JOIN Usuario u ON u.id = e.id_usuario
-- JOIN Exemplar x ON x.numero_registro = e.id_exemplar
-- JOIN Livro l ON l.id = x.id_livro ORDER BY e.data_devolucao_prevista;

-- 3. Quais cópias podem ser retiradas agora?
-- SELECT x.numero_registro, l.titulo, ed.nome AS editora
-- FROM Exemplar x JOIN Livro l ON l.id = x.id_livro
-- JOIN Editora ed ON ed.id = l.id_editora
-- WHERE x.status = 'Disponível' ORDER BY l.titulo, x.numero_registro;
