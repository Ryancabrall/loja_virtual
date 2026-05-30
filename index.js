const express = require('express'); 
const fs = require('fs'); 
const path = require('path'); 
const cors = require('cors'); 

const app = express();
const port = process.env.PORT || 3000;
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// --- CONFIGURAÇÃO DE ARQUIVOS ---
const clientesFile = path.join(__dirname, 'clientes.json');
 
const produtosFile = path.join(__dirname, 'produtos.json'); // Caminho para produtos

// --- ARMAZENAMENTO EM MEMÓRIA PARA DEPLOY ---
let clientes = [];
let produtos = [];

// Inicializar dados se existirem arquivos locais
try {
    if (fs.existsSync(clientesFile)) {
        const dados = fs.readFileSync(clientesFile, 'utf8');
        clientes = JSON.parse(dados) || [];
    }
    if (fs.existsSync(produtosFile)) {
        const dados = fs.readFileSync(produtosFile, 'utf8');
        produtos = JSON.parse(dados) || [];
    }
} catch (e) {
    console.log('Inicializando com dados vazios (ambiente de deploy)');
}

// --- FUNÇÕES AUXILIARES (CLIENTES) ---
function lerClientes() {
    return clientes;
}
function salvarClientes(novosClientes) {
    clientes = novosClientes;
}   


// --- FUNÇÕES AUXILIARES (PRODUTOS) ---
function lerProdutos() {
    return produtos;
}
function salvarProdutos(novosProdutos) {
    produtos = novosProdutos;
}


/*
  PRODUTOS ENDPOINTS
*/

app.post('/produtos', (req, res) => {
    const { id, nome, preco, estoque } = req.body;

    if (!id || !nome || !preco || !estoque) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const produtos = lerProdutos();
    if (produtos.some(p => p.id === id)) {
        return res.status(400).json({ error: 'Código já cadastrado' });
    }

    const novoProduto = { id, nome, preco, estoque };
    produtos.push(novoProduto);
    salvarProdutos(produtos);
    res.status(201).json({ mensagem: 'Produto cadastrado com sucesso', produto: novoProduto });
});

app.get("/produtos", (req, res) => {
    const produtos = lerProdutos();
    res.status(200).json(produtos);
});

app.get("/produtos/ordenados", (req, res) => {
    const produtos = lerProdutos();
    // Ordenar por nome
    const produtosOrdenados = produtos.sort((a, b) => a.nome.localeCompare(b.nome));
    res.status(200).json(produtosOrdenados);
});

app.get("/produtos/:id", (req, res) => {
    const { id } = req.params;
    const produtos = lerProdutos();
    const produto = produtos.find(p => p.id === id);
    if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.status(200).json(produto);
});

/*
  CLIENTES ENDPOINTS (Mantidos)
*/

app.post('/clientes', (req, res) => {
    const { cpf, nome, idade, endereco, bairro, contato } = req.body;
    if (!cpf || !nome || !idade || !endereco || !bairro || !contato) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const clientes = lerClientes();
    if (clientes.some(c => c.cpf === cpf)) {
        return res.status(400).json({ error: 'CPF já cadastrado' });
    }

    const novoCliente = { cpf, nome, idade, endereco, bairro, contato };
    clientes.push(novoCliente);
    salvarClientes(clientes);
    res.status(201).json({ mensagem: 'Cliente cadastrado com sucesso', cliente: novoCliente });
});

app.get("/clientes", (req, res) => {
    const clientes = lerClientes();
    res.status(200).json(clientes);
});

app.get("/clientes/ordenados", (req, res) => {
    const clientes = lerClientes();
    // Ordenar por nome
    const clientesOrdenados = clientes.sort((a, b) => a.nome.localeCompare(b.nome));
    res.status(200).json(clientesOrdenados);
});

app.get("/clientes/:cpf", (req, res) => {
    const { cpf } = req.params;
    const clientes = lerClientes();
    const cliente = clientes.find(c => c.cpf === cpf);
    if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.status(200).json(cliente);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Servidor acessível externamente em http://SEU_IP:${port}`);
});