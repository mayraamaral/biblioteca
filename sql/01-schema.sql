SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS biblioteca
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE biblioteca;

CREATE TABLE Autor (
    id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE Editora (
    id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE Usuario (
    id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    cpf CHAR(11) NOT NULL,
    telefone VARCHAR(15) NULL,
    email VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_usuario_cpf UNIQUE (cpf),
    CONSTRAINT uq_usuario_email UNIQUE (email)
);

CREATE TABLE Livro (
    id INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    ano_publicacao INT NOT NULL,
    id_editora INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_livro_editora FOREIGN KEY (id_editora) REFERENCES Editora (id)
);

CREATE TABLE LivroAutor (
    id_livro INT NOT NULL,
    id_autor INT NOT NULL,
    PRIMARY KEY (id_livro, id_autor),
    CONSTRAINT fk_livroautor_livro FOREIGN KEY (id_livro) REFERENCES Livro (id),
    CONSTRAINT fk_livroautor_autor FOREIGN KEY (id_autor) REFERENCES Autor (id)
);

CREATE TABLE Exemplar (
    numero_registro INT NOT NULL,
    id_livro INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Disponível',
    PRIMARY KEY (numero_registro),
    CONSTRAINT fk_exemplar_livro FOREIGN KEY (id_livro) REFERENCES Livro (id),
    CONSTRAINT ck_exemplar_status CHECK (status IN ('Disponível', 'Emprestado', 'Danificado', 'Manutenção'))
);

CREATE TABLE Emprestimo (
    numero_emprestimo INT NOT NULL,
    id_exemplar INT NOT NULL,
    id_usuario INT NOT NULL,
    data_emprestimo DATE NOT NULL,
    data_devolucao_prevista DATE NOT NULL,
    PRIMARY KEY (numero_emprestimo),
    CONSTRAINT fk_emprestimo_exemplar FOREIGN KEY (id_exemplar) REFERENCES Exemplar (numero_registro),
    CONSTRAINT fk_emprestimo_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario (id),
    CONSTRAINT ck_emprestimo_prazo CHECK (data_devolucao_prevista >= data_emprestimo)
);
