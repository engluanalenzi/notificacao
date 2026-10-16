# Direcionamento de notificações compulsórias em saúde (demonstração)

Ferramenta de **orientação e direcionamento**. Não substitui avaliação profissional nem o protocolo oficial.

## Status do conteúdo
- A lista de agravos e os direcionamentos são **placeholders** até que a tabela oficial seja fornecida e validada.
- Nenhum órgão, link ou orientação oficial foi incluído.

## Pré-requisitos
- Git
- Conta no GitHub
- Conta no Render (plano gratuito de site estático) -> https://notificacao-sms.onrender.com/
- Navegador atualizado
- Para teste local: Python 3 (ou qualquer servidor estático)

## Execução local
```bash
git clone https://github.com/engluanalenzi/notificacao.git
cd notificacao/public
python3 -m http.server 8080
