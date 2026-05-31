# Sistema de Pagamento PIX Manual

Este sistema usa geração manual de código PIX com sua chave de celular, funcionando com todos os bancos brasileiros sem necessidade de gateway de pagamento.

## Configuração

### Chave PIX Configurada

O sistema já está configurado com uma chave de celular placeholder:
- **Chave PIX:** 11999999999 (substitua pelo seu número)
- **Nome do beneficiário:** Bryan Andre Ferreira Machado
- **Cidade:** Brasil

### Como Alterar a Chave PIX

Para alterar sua chave PIX, edite o arquivo `public/index.html` e procure pela função `generatePixCode()`:

```javascript
function generatePixCode(amount) {
    const phoneKey = '11999999999'; // Substitua pelo seu número de celular (11 dígitos com DDD)
    const merchantName = 'Bryan Andre Ferreira Machado'; // Altere seu nome
    const merchantCity = 'Brasil'; // Altere sua cidade
    // ...
}
```

### Iniciar o Servidor

```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

## Como Funciona

1. **Criação de Pagamento PIX:**
   - Quando o usuário clica em "Finalizar Compra", o sistema gera um código PIX localmente
   - O código PIX é gerado no padrão BR Code com sua chave CPF
   - O QR Code é gerado a partir do código PIX
   - O QR Code e código são exibidos para o usuário

2. **Processamento do Pagamento:**
   - O usuário escaneia o QR Code ou copia o código PIX
   - O pagamento é processado pelo banco do usuário (qualquer banco)
   - O dinheiro vai direto para sua conta bancária vinculada à chave CPF

3. **Confirmação do Pagamento:**
   - Quando o usuário clica em "Confirmar Pagamento", o sistema assume que o pagamento foi feito
   - O pedido é finalizado
   - O carrinho é limpo e o usuário recebe confirmação

## Vantagens do Sistema Manual

- **Sem taxas de gateway** - Você não paga taxas de intermediários
- **Dinheiro direto na conta** - O pagamento vai direto para sua conta bancária
- **Sem restrição de idade** - Não precisa ser maior de idade para usar
- **Funciona com todos os bancos** - Qualquer banco que suporta PIX
- **Simples e direto** - Sem necessidade de cadastro em gateways

## Bancos Suportados

O sistema funciona com todos os bancos brasileiros que suportam PIX:
- Banco do Brasil
- Itaú
- Bradesco
- Caixa
- Santander
- Nubank
- Inter
- PicPay
- Neon
- E todos os outros bancos que suportam PIX

## Notas Importantes

- O sistema não verifica automaticamente se o pagamento foi realizado
- Você deve verificar manualmente seu extrato bancário para confirmar pagamentos
- Para verificação automática, seria necessário integrar com um gateway de pagamento
- A chave CPF deve estar ativa no seu banco para receber pagamentos PIX
