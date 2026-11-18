export const models = {
  Livro: ['Livros', 'id titulo ano_publicacao id_editora'],
  Autor: ['Autores', 'id nome'],
  Editora: ['Editoras', 'id nome'],
  LivroAutor: ['Autorias', 'id_livro id_autor'],
  Usuario: ['Leitores', 'id nome cpf telefone email'],
  Exemplar: ['Exemplares', 'numero_registro id_livro status'],
  Emprestimo: ['Empréstimos', 'numero_emprestimo id_exemplar id_usuario data_emprestimo data_devolucao_prevista']
};
export const labels = {id:'ID',titulo:'Título',ano_publicacao:'Ano da edição',id_editora:'Editora',nome:'Nome',id_livro:'Livro',id_autor:'Autor',cpf:'CPF',telefone:'Telefone',email:'E-mail',numero_registro:'Registro',status:'Situação',numero_emprestimo:'Empréstimo',id_exemplar:'Exemplar',id_usuario:'Leitor',data_emprestimo:'Retirada',data_devolucao_prevista:'Prazo',data_devolucao:'Devolução'};
export const fields = t => models[t][1].split(' ');
export const keys = t => fields(t).slice(0, t === 'LivroAutor' ? 2 : 1);
export const states = ['Disponível','Danificado','Manutenção'];
