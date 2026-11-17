import express from 'express';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'node:url';
import { models, fields, keys, states } from './public/model.js';

const env = process.env;
const pool = mysql.createPool({host: env.DB_HOST || '127.0.0.1', port: Number(env.DB_PORT || 3306),
  database: env.MYSQL_DATABASE, user: env.MYSQL_USER, password: env.MYSQL_PASSWORD, dateStrings: true});
const app = express();
const tailwind = fileURLToPath(import.meta.resolve('@tailwindcss/browser'));
app.get('/vendor/tailwind.js', (_req, res) => res.sendFile(tailwind));
app.use(express.static(fileURLToPath(new URL('./public/', import.meta.url))));
app.use(express.json({limit:'16kb'}));
const fail = (message, status = 400) => { throw Object.assign(new Error(message), {publicMessage:message, status}); };

app.get('/api/acervo', async (_req,res) => {
  const result = {};
  for (const t of Object.keys(models)) {
    const query = t === 'Emprestimo' ? 'SELECT e.*, d.data_devolucao FROM Emprestimo e LEFT JOIN DevolucaoWeb d USING(numero_emprestimo) ORDER BY e.numero_emprestimo DESC' : `SELECT * FROM ${t} ORDER BY ${keys(t)}`;
    [result[t]] = await pool.query(query);
  }
  res.json(result);
});

function values(input, names) {
  return names.map(k => {
    const v = input?.[k];
    if (k === 'telefone' && !v) return null;
    if (!['number','string'].includes(typeof v) || !String(v).trim()) fail(`Preencha o campo ${k}.`);
    if (/^(codigo|numero|ano)/.test(k) && (!/^-?\d+$/.test(v) || +v < -2147483648 || +v > 2147483647)) fail(`Inteiro inválido: ${k}.`);
    if (k === 'cpf' && !/^\d{11}$/.test(v)) fail('Informe os 11 dígitos do CPF.');
    return String(v).trim();
  });
}

app.post('/api/:table/:action', async (req,res) => {
  if (!req.is('application/json')) fail('Envie JSON.',415);
  const {table:t, action} = req.params;
  if (!Object.hasOwn(models,t) || !['criar','editar','excluir','devolver'].includes(action)) fail('Operação desconhecida.',404);
  const b = req.body, pk = keys(t), id = values(b, pk), cols = fields(t);
  const where = pk.map(k => `${k}=?`).join(' AND ');
  const db = await pool.getConnection();
  try {
    await db.beginTransaction();
    if (action === 'criar') {
      const args = values(b, cols);
      if (t === 'Emprestimo') {
        const [r] = await db.execute("UPDATE Exemplar SET status='Emprestado' WHERE numero_registro=? AND status='Disponível'",[b.numero_exemplar]);
        if (!r.affectedRows) fail('Este exemplar não está disponível.',409);
      }
      if (t === 'Exemplar' && !states.includes(b.status)) fail('Use a retirada para marcar um exemplar como emprestado.');
      await db.execute(`INSERT INTO ${t} (${cols}) VALUES (${cols.map(()=>'?')})`,args);
    } else {
      const [[row]] = await db.execute(`SELECT * FROM ${t} WHERE ${where} FOR UPDATE`,id);
      if (!row) fail('Registro não encontrado.',404);
      if (t === 'Emprestimo') {
        const [[returned]] = await db.execute('SELECT numero_emprestimo FROM DevolucaoWeb WHERE numero_emprestimo=?',id);
        if (returned || action === 'excluir') fail('O histórico de retiradas é preservado.',409);
        if (action === 'devolver') {
          await db.execute('INSERT INTO DevolucaoWeb (numero_emprestimo,data_devolucao) VALUES (?,CURRENT_DATE)', id);
          await db.execute("UPDATE Exemplar SET status='Disponível' WHERE numero_registro=?",[row.numero_exemplar]);
        } else {
          await db.execute('UPDATE Emprestimo SET data_devolucao_prevista=? WHERE numero_emprestimo=?',[...values(b,['data_devolucao_prevista']),...id]);
        }
      } else if (action === 'devolver') fail('Escolha um empréstimo.');
      else if (action === 'excluir') await db.execute(`DELETE FROM ${t} WHERE ${where}`,id);
      else {
        if (t === 'LivroAutor') fail('Remova o vínculo antes de cadastrar outro.');
        if (t === 'Exemplar' && (row.status === 'Emprestado' || !states.includes(b.status))) fail('A situação desta cópia depende da retirada e da devolução.',409);
        const editable = cols.filter(k=>!pk.includes(k));
        await db.execute(`UPDATE ${t} SET ${editable.map(k=>`${k}=?`)} WHERE ${where}`,[...values(b,editable),...id]);
      }
    }
    if (t === 'Livro' && ['criar','editar'].includes(action) && b.autores !== undefined) {
      if (!Array.isArray(b.autores)) fail('Informe uma lista de autores.');
      const autores = new Set(b.autores.map(v => Number(values({codigo_autor:v}, ['codigo_autor'])[0])));
      if (action === 'editar') await db.execute('DELETE FROM LivroAutor WHERE codigo_livro=?', id);
      for (const autor of autores) {
        await db.execute('INSERT INTO LivroAutor (codigo_livro,codigo_autor) VALUES (?,?)',[id[0],autor]);
      }
    }
    await db.commit();
    res.sendStatus(204);
  } catch (e) { await db.rollback(); throw e; } finally { db.release(); }
});

app.use((e,_req,res,_next) => {
  const errors = {1062:'Código, CPF, e-mail ou vínculo já cadastrado.',1451:'Registro em uso. Verifique os vínculos antes de excluir.',1452:'O registro referenciado não existe.',3819:'Confira o prazo e os valores permitidos.',1292:'Data inválida.',1406:'Texto maior que o limite do campo.'};
  if (!e.publicMessage && !errors[e.errno]) console.error('Falha na requisição:',e.code || e.name);
  res.status(e.status || (errors[e.errno] ? 409 : 500)).json({erro:e.publicMessage || errors[e.errno] || 'Não foi possível concluir a operação.'});
});

// O serviço do banco pode estar de pé enquanto o entrypoint ainda carrega o seed.
for (let i=0;;i++) {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS DevolucaoWeb (
      numero_emprestimo INT NOT NULL, data_devolucao DATE NOT NULL,
      PRIMARY KEY (numero_emprestimo), FOREIGN KEY (numero_emprestimo) REFERENCES Emprestimo(numero_emprestimo))`);
    break;
  } catch (e) {
    if (i === 59) throw e;
    await new Promise(r=>setTimeout(r,1500));
  }
}
app.listen(Number(env.PORT || 8080),()=>console.log('Balcão da biblioteca pronto.'));
