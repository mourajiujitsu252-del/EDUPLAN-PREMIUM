
# 🎓 EduPlan Pro - Inteligência Pedagógica BNCC

![Versão](https://img.shields.io/badge/vers%C3%A3o-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini%203-orange.svg)
![PWA](https://img.shields.io/badge/PWA-Pronto-green.svg)

**EduPlan Pro** é uma plataforma de vanguarda projetada para reduzir drasticamente a carga burocrática de professores brasileiros. Utilizando a API Gemini 3 da Google, o sistema gera planejamentos completos 100% alinhados à Base Nacional Comum Curricular (BNCC).

## ✨ Funcionalidades Principais

- 📝 **Planos de Aula Individuais**: Geração de sequência didática, objetivos e materiais de apoio.
- 📅 **Planejamento Mensal**: Cronograma de 4 semanas com metodologias ativas.
- 🗓️ **Currículo Anual**: Planejamento bimestral completo com competências essenciais.
- 📥 **Exportação Multiformato**: Gere arquivos profissionais em **Word (.docx)**, **PDF** e **PowerPoint (.pptx)**.
- 🤖 **Assistente Pedagógico**: Chat em tempo real para tirar dúvidas sobre legislação e BNCC.
- 📱 **PWA (Progressive Web App)**: Instale no celular e use offline na sala de aula.

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 19 + TypeScript + Tailwind CSS.
- **IA**: Google Gemini 3 (Pro e Flash) para inteligência pedagógica.
- **Documentos**: jsPDF (PDF), Docx.js (Word) e PptxGenJS (Slides).
- **Armazenamento**: LocalStorage para biblioteca pessoal privada.

## 🛡️ Privicidade e Segurança

O EduPlan Pro foi construído com foco na privacidade do docente:
- **Zero Backend**: Não armazenamos seus planos em servidores externos.
- **LocalStorage**: Toda a sua biblioteca de planos fica salva localmente no seu navegador.
- **Segurança de API**: Recomenda-se o uso de variáveis de ambiente para a `API_KEY`.

## 🛠️ Como Executar em 3 passos

1. **Clonar e Instalar**:
   ```bash
   git clone https://github.com/seu-usuario/eduplan-pro.git
   npm install
   ```
2. **Configurar**:
   Crie um arquivo `.env` na raiz e adicione: `API_KEY=sua_chave_do_gemini`
3. **Rodar**:
   ```bash
   npm start
   ```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
Desenvolvido para transformar a educação brasileira. 🇧🇷
