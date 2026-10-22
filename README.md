# Direcionamento de notificações compulsórias em saúde (demonstração)

Ferramenta de **orientação e direcionamento**. Não substitui avaliação profissional nem o protocolo oficial.

## Status do conteúdo
- A lista de agravos e os direcionamentos são **placeholders** até que a tabela oficial seja fornecida e validada.
- Nenhum órgão, link ou orientação oficial foi incluído.
- Para exibir o conceito no balão de um agravo, inclua o campo opcional `"conceito"` no respectivo item ou subitem de `public/data/agravos.json`. Enquanto não houver definição, o balão indica que o conceito está pendente.
- A página inicial apresenta os alertas em um portal demonstrativo simplificado. O atalho **Acessar Notificação Compulsória** abre a aplicação em `public/notificacao.html` dentro da área principal.

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
