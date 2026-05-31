const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-username', 'x-password']
}));
app.use(express.json());

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// --- CONFIGURAÇÃO DE ARQUIVOS ---
const clientesFile = path.join(__dirname, 'clientes.json');
 
const produtosFile = path.join(__dirname, 'produtos.json'); // Caminho para produtos
const usuariosFile = path.join(__dirname, 'usuarios.json'); // Caminho para usuários

// --- ARMAZENAMENTO EM MEMÓRIA PARA DEPLOY ---
let clientes = [];
let produtos = [];
let usuarios = [];

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
    if (fs.existsSync(usuariosFile)) {
        const dados = fs.readFileSync(usuariosFile, 'utf8');
        usuarios = JSON.parse(dados) || [];
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
    console.log('Tentando salvar produtos no arquivo:', produtosFile);
    console.log('Produtos a salvar:', JSON.stringify(produtos, null, 2));
    // Salvar no arquivo produtos.json
    try {
        fs.writeFileSync(produtosFile, JSON.stringify(produtos, null, 2), 'utf8');
        console.log('Produtos salvos com sucesso no arquivo!');
    } catch (error) {
        console.error('Erro ao salvar produtos no arquivo:', error);
    }
}

// --- FUNÇÕES AUXILIARES (USUÁRIOS) ---
function lerUsuarios() {
    return usuarios;
}

// --- MIDDLEWARE DE VERIFICAÇÃO DE ADMIN ---
function verificarAdmin(req, res, next) {
    const username = req.headers['x-username'];
    const password = req.headers['x-password'];

    if (!username || !password) {
        return res.status(401).json({ error: 'Username e password são obrigatórios nos headers' });
    }

    const usuario = usuarios.find(u => u.username === username && u.password === password);

    if (!usuario || !usuario.isAdmin) {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }

    req.usuario = usuario;
    next();
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

// --- API PARA GERENCIAR ARQUIVO produtos.json DIRETAMENTE ---

// GET - Ler arquivo produtos.json
app.get('/api/produtos/file', (req, res) => {
    try {
        if (fs.existsSync(produtosFile)) {
            const dados = fs.readFileSync(produtosFile, 'utf8');
            res.status(200).json(JSON.parse(dados));
        } else {
            res.status(200).json([]);
        }
    } catch (error) {
        console.error('Erro ao ler arquivo produtos.json:', error);
        res.status(500).json({ error: 'Erro ao ler arquivo produtos.json' });
    }
});

// POST - Escrever no arquivo produtos.json
app.post('/api/produtos/file', (req, res) => {
    try {
        const produtos = req.body;
        fs.writeFileSync(produtosFile, JSON.stringify(produtos, null, 2), 'utf8');
        res.status(200).json({ mensagem: 'Arquivo produtos.json atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao escrever arquivo produtos.json:', error);
        res.status(500).json({ error: 'Erro ao escrever arquivo produtos.json' });
    }
});

// PUT - Atualizar arquivo produtos.json (apenas admin)
app.put('/api/produtos/file', verificarAdmin, (req, res) => {
    try {
        const produtos = req.body;
        fs.writeFileSync(produtosFile, JSON.stringify(produtos, null, 2), 'utf8');

        // Sincronizar com variável em memória
        salvarProdutos(produtos);

        res.status(200).json({ mensagem: 'Arquivo produtos.json atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar arquivo produtos.json:', error);
        res.status(500).json({ error: 'Erro ao atualizar arquivo produtos.json' });
    }
});

// DELETE - Deletar produto do arquivo produtos.json (apenas admin)
app.delete('/api/produtos/file/:id', verificarAdmin, (req, res) => {
    try {
        const { id } = req.params;
        let produtosArquivo = [];

        if (fs.existsSync(produtosFile)) {
            const dados = fs.readFileSync(produtosFile, 'utf8');
            produtosArquivo = JSON.parse(dados) || [];
        }

        const produtoIndex = produtosArquivo.findIndex(p => p.id === id);
        if (produtoIndex === -1) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        produtosArquivo.splice(produtoIndex, 1);

        // Sincronizar com variável em memória e salvar no arquivo
        salvarProdutos(produtosArquivo);

        res.status(200).json({ mensagem: 'Produto deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar produto do arquivo produtos.json:', error);
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Servidor acessível externamente em http://SEU_IP:${port}`);
});