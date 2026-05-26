# BarberX — Sistema de Agendamento Premium

> Projeto derivado do portfólio Menezes. Stack idêntica: React + TypeScript + Vite + Firebase.

## 🚀 Setup

```bash
npm install
cp .env.example .env
# Preencha as variáveis no .env
npm run dev
```

## ⚙️ Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `VITE_FIREBASE_*` | Credenciais do Firebase (mesmo projeto do portfólio) |
| `VITE_ADMIN_USER_ID` | ID do usuário admin no Firestore |
| `VITE_ANTHROPIC_API_KEY` | Chave da API Anthropic (para o assistente IA) |

## 🗄️ Estrutura Firestore

```
users/{ADMIN_USER_ID}/
  ├── services/        → Serviços da barbearia
  ├── barbers/         → Barbeiros disponíveis
  ├── testimonials/    → Depoimentos
  ├── appointments/    → Agendamentos dos clientes
  └── config/barberInfo → Informações da barbearia
```

## 🤖 Assistente IA

O assistente usa a API do Claude (Anthropic) para responder dúvidas dos clientes sobre serviços, preços e cuidados capilares. A chave da API deve estar configurada no `.env`.

## 📦 Build

```bash
npm run build
```

## 🎨 Design System

- Paleta: ouro (#c9a227) sobre fundo escuro profundo (#050507)
- Fontes: Bebas Neue (display) + DM Sans (corpo) + JetBrains Mono (código/mono)
- Tema: futurista industrial — grid animado, scanlines, detalhes dourados
