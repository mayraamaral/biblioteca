import {models, fields, keys, labels, states} from './model.js';

const $ = s=>document.querySelector(s);
const el = (tag,text)=>{const n=document.createElement(tag); if(text!=null)n.textContent=text; return n;};
const button = (text,fn)=>{const n=el('button',text); n.onclick=fn; return n;};
const targets={id_livro:'Livro',id_autor:'Autor',id_editora:'Editora',id_usuario:'Usuario',id_exemplar:'Exemplar'};
let data, table='Livro', editing;
function display(k,v){
  if(v==null)return k==='data_devolucao'?'Em aberto':'—';
  const t=targets[k];
  if(!t)return String(v);
  const r=data[t].find(x=>x[keys(t)[0]]===v);
  return r?`${v} · ${r.nome || r.titulo || display('id_livro',r.id_livro)}`:String(v);
}
async function refresh(msg=''){
  const res=await fetch('/api/acervo',{cache:'no-store'});
  if(!res.ok)throw Error('Não foi possível carregar o acervo.');
  data=await res.json(); render(); $('#message').textContent=msg; $('#add').disabled=false;
}
async function save(action,body){
  const res=await fetch(`/api/${table}/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!res.ok)throw Error((await res.json()).erro);
  await refresh('Operação registrada.');
}
async function quick(action,row){
  if(!confirm(action==='excluir'?'Excluir este registro?':`Confirmar devolução do exemplar ${row.id_exemplar}?`))return;
  try{await save(action,row);}catch(e){$('#message').textContent=e.message;}
}
function render(){
  $('nav').replaceChildren(...Object.entries(models).map(([t,[name]])=>{
    const b=button(name,()=>{table=t;$('#search').value='';$('#message').textContent='';render();});b.setAttribute('aria-current',String(t===table));return b;
  }));
  $('#heading').textContent=models[table][0];
  const cols=fields(table), loan=table==='Emprestimo', book=table==='Livro';
  const header=el('tr'); for(const l of [...cols.map(k=>labels[k]),...(loan?['Devolução']:book?['Autoria','Disponíveis / total']:[]),'Ações'])header.append(el('th',l));
  $('thead').replaceChildren(header);$('tbody').replaceChildren();
  for(const row of data[table]){
    const texts=cols.map(k=>display(k,row[k]));
    if(loan)texts.push(display('data_devolucao',row.data_devolucao));
    if(book){
      const copies=data.Exemplar.filter(x=>x.id_livro===row.id);
      texts.push(data.LivroAutor.filter(x=>x.id_livro===row.id).map(x=>display('id_autor',x.id_autor)).join('; ')||'—',`${copies.filter(x=>x.status==='Disponível').length} / ${copies.length}`);
    }
    if(!texts.join(' ').toLocaleLowerCase('pt-BR').includes($('#search').value.trim().toLocaleLowerCase('pt-BR')))continue;
    const tr=el('tr'), actions=el('td');texts.forEach(v=>tr.append(el('td',v)));
    if(table!=='LivroAutor' && !row.data_devolucao && !(table==='Exemplar' && row.status==='Emprestado'))actions.append(button(loan?'Alterar prazo':'Editar',()=>form(row)));
    if(!loan || !row.data_devolucao)actions.append(button(loan?'Devolver':'Excluir',()=>quick(loan?'devolver':'excluir',row)));
    tr.append(actions);$('tbody').append(tr);
  }
  if(!$('tbody').children.length){const tr=el('tr'),td=el('td','Nenhum registro encontrado.');td.colSpan=header.children.length;tr.append(td);$('tbody').append(tr);}
}
function form(row){
  editing=row;$('#form-title').textContent=`${models[table][0]} · ${row?'editar':'novo registro'}`;$('#inputs').replaceChildren();$('#error').textContent='';
  for(const k of fields(table)){
    const label=el('label',labels[k]),t=targets[k]; let n;
    if(t || k==='status'){
      n=el('select');const list=t?data[t].filter(x=>k!=='id_exemplar'||x.status==='Disponível'||row?.id_exemplar===x.numero_registro).map(x=>[x[keys(t)[0]],display(k,x[keys(t)[0]])]):states.map(s=>[s,s]);
      if(t)n.add(new Option('Selecione…','')); for(const [v,text] of list)n.add(new Option(text,v));
    }else{
      n=el('input');n.type=k.startsWith('data_')?'date':/^(id$|id_|numero|ano)/.test(k)?'number':k==='email'?'email':'text';
      if(k==='cpf'){n.pattern='[0-9]{11}';n.maxLength=11;}
      if(k==='data_emprestimo')n.valueAsDate=new Date();
    }
    n.name=k;n.required=k!=='telefone';if(row)n.value=row[k]??'';
    n.disabled=!!row && (keys(table).includes(k)||(table==='Emprestimo' && k!=='data_devolucao_prevista'));
    label.append(n);$('#inputs').append(label);
  }
  if(table==='Livro'){
    const group=el('fieldset');group.append(el('legend','Autores da obra'));
    const current=new Set(data.LivroAutor.filter(v=>v.id_livro===row?.id).map(v=>v.id_autor));
    const list=el('div');list.className='max-h-40 overflow-y-auto rounded-md border p-2';
    for(const a of data.Autor){
      const label=el('label'),box=el('input');label.className='grid-cols-[auto_1fr] items-center py-1';
      box.type='checkbox';box.name='autores';box.value=a.id;box.checked=current.has(a.id);
      label.append(box, `${a.nome} (${a.id})`);list.append(label);
    }
    group.append(list,el('small','Marque os autores e coautores. Se faltar um nome, cadastre-o na aba Autores.'));
    $('#inputs').append(group);
  }
  $('dialog').showModal();
}
$('#add').onclick=()=>form(null);$('#cancel').onclick=()=>$('dialog').close();$('#search').oninput=()=>data&&render();
$('form').onsubmit=async e=>{
  e.preventDefault(); const submit=e.submitter;if(submit)submit.disabled=true;
  try{
    const inputs=new FormData(e.target),body={...editing,...Object.fromEntries(inputs)};
    if(table==='Livro')body.autores=inputs.getAll('autores');
    await save(editing?'editar':'criar',body);$('dialog').close();
  }
  catch(err){$('#error').textContent=err.message;}finally{if(submit)submit.disabled=false;}
};
refresh().catch(e=>{$('#message').textContent=e.message+' Atualize a página para tentar novamente.';});
