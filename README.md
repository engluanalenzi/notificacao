# Direcionamento de notificações compulsórias em saúde (demonstração)

Ferramenta de **orientação e direcionamento**. Não substitui avaliação profissional nem o protocolo oficial.

## Status do conteúdo
- A lista de agravos e os direcionamentos são **placeholders** até que a tabela oficial seja fornecida e validada.
- Para qualquer agravo, o perfil **Profissional de saúde da rede municipal de Florianópolis** recebe o link do Celk Saúde: `https://florianopolis.celk.com.br/vigilancia/registroagravo/consultaRegistroAgravo?4&cdPrg=545`. O perfil **Pessoa sem vínculo profissional com a área da saúde** recebe o direcionamento ao CIEVS Florianópolis pelo telefone +55 (48) 93300-9983.
- Para o perfil **Profissional de saúde externo à rede municipal**, somente o subitem **1.a - Acidente de trabalho** abre o formulário demonstrativo integrado à própria página e exibe as orientações para hospitais com Núcleo de Vigilância Hospitalar. Os subitens 1.b em diante aguardam direcionamentos próprios. Para agravos fora do item 1, é exibido o link da Vigilância Epidemiológica.
- O formulário de acidente de trabalho é um protótipo: os dados ficam salvos somente no navegador e não são enviados à Vigilância. Não use dados pessoais reais. A impressão/PDF inclui as seis etapas, todas as opções e os valores preenchidos.
- Para exibir o conceito no balão de um agravo, inclua o campo opcional `"conceito"` no respectivo item ou subitem de `public/data/agravos.json`. Enquanto não houver definição, o balão indica que o conceito está pendente.
- A página inicial abre diretamente a aplicação de notificações compulsórias em `public/notificacao.html`.

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
