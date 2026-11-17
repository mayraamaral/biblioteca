export const models = {
  Livro: ['Livros', 'codigo titulo ano_publicacao codigo_editora'],
  Autor: ['Autores', 'codigo nome'],
  Editora: ['Editoras', 'codigo nome'],
  LivroAutor: ['Autorias', 'codigo_livro codigo_autor'],
  Usuario: ['Leitores', 'codigo nome cpf telefone email'],
  Exemplar: ['Exemplares', 'numero_registro codigo_livro status'],
  Emprestimo: ['Empréstimos', 'numero_emprestimo numero_exemplar codigo_usuario data_emprestimo data_devolucao_prevista']
};
export const labels = {codigo:'Código',titulo:'Título',ano_publicacao:'Ano da edição',codigo_editora:'Editora',nome:'Nome',codigo_livro:'Livro',codigo_autor:'Autor',cpf:'CPF',telefone:'Telefone',email:'E-mail',numero_registro:'Registro',status:'Situação',numero_emprestimo:'Empréstimo',numero_exemplar:'Exemplar',codigo_usuario:'Leitor',data_emprestimo:'Retirada',data_devolucao_prevista:'Prazo',data_devolucao:'Devolução'};
export const fields = t => models[t][1].split(' ');
export const keys = t => fields(t).slice(0, t === 'LivroAutor' ? 2 : 1);
export const states = ['Disponível','Danificado','Manutenção'];
