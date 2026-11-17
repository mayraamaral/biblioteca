SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS biblioteca
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE biblioteca;

CREATE TABLE Autor (
    codigo INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    PRIMARY KEY (codigo)
);

CREATE TABLE Editora (
    codigo INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    PRIMARY KEY (codigo)
);

CREATE TABLE Usuario (
    codigo INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    cpf CHAR(11) NOT NULL,
    telefone VARCHAR(15) NULL,
    email VARCHAR(100) NOT NULL,
    PRIMARY KEY (codigo),
    CONSTRAINT uq_usuario_cpf UNIQUE (cpf),
    CONSTRAINT uq_usuario_email UNIQUE (email)
);

CREATE TABLE Livro (
    codigo INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    ano_publicacao INT NOT NULL,
    codigo_editora INT NOT NULL,
    PRIMARY KEY (codigo),
    CONSTRAINT fk_livro_editora FOREIGN KEY (codigo_editora) REFERENCES Editora (codigo)
);

CREATE TABLE LivroAutor (
    codigo_livro INT NOT NULL,
    codigo_autor INT NOT NULL,
    PRIMARY KEY (codigo_livro, codigo_autor),
    CONSTRAINT fk_livroautor_livro FOREIGN KEY (codigo_livro) REFERENCES Livro (codigo),
    CONSTRAINT fk_livroautor_autor FOREIGN KEY (codigo_autor) REFERENCES Autor (codigo)
);

CREATE TABLE Exemplar (
    numero_registro INT NOT NULL,
    codigo_livro INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Disponível',
    PRIMARY KEY (numero_registro),
    CONSTRAINT fk_exemplar_livro FOREIGN KEY (codigo_livro) REFERENCES Livro (codigo),
    CONSTRAINT ck_exemplar_status CHECK (status IN ('Disponível', 'Emprestado', 'Danificado', 'Manutenção'))
);

CREATE TABLE Emprestimo (
    numero_emprestimo INT NOT NULL,
    numero_exemplar INT NOT NULL,
    codigo_usuario INT NOT NULL,
    data_emprestimo DATE NOT NULL,
    data_devolucao_prevista DATE NOT NULL,
    PRIMARY KEY (numero_emprestimo),
    CONSTRAINT fk_emprestimo_exemplar FOREIGN KEY (numero_exemplar) REFERENCES Exemplar (numero_registro),
    CONSTRAINT fk_emprestimo_usuario FOREIGN KEY (codigo_usuario) REFERENCES Usuario (codigo),
    CONSTRAINT ck_emprestimo_prazo CHECK (data_devolucao_prevista >= data_emprestimo)
);
