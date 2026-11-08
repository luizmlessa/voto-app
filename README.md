# 🎮 Voto Vinculativo (8-bit RPG Habit Tracker)

Um rastreador de hábitos diários gamificado com estética 8-bit e mecânicas de RPG. O objetivo é transformar tarefas rotineiras em uma jornada épica, utilizando o conceito de "voto vinculativo" (commitment device) para manter a consistência.

![Status](https://img.shields.io/badge/Status-Conclu%C3%ADdo-success)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)

## 📖 Sobre o Projeto
A ideia surgiu da necessidade de manter uma rotina consistente de estudos, treinos e cuidados pessoais. Para tornar o processo menos maçante, o app aplica mecânicas clássicas de RPG:
- Você ganha XP e Moedas ao cumprir suas metas.
- Perde HP se falhar (e o seu herói congela!).
- Pode evoluir de nível para desbloquear novas armaduras.
- Tem uma Taverna para comprar Poções e Amuletos de Gelo (Streak Freezes).

Sendo um **PWA (Progressive Web App)**, ele pode ser instalado no celular e funciona offline, ideal para usar na academia ou na rua sem depender de internet.

## ✨ Funcionalidades
- **Sistema de Classes:** Escolha entre Guerreiro, Mago, Ladino, Clérigo ou Druida. Cada um tem bônus passivos únicos (ex: Mago ganha o dobro de XP em tarefas de carreira).
- **Metas Dinâmicas:** Crie, edite e exclua suas próprias tarefas diárias e defina quanto XP cada uma vale.
- **Herói Animado:** O avatar central muda de expressão e se move. Se o seu HP estiver baixo, ele congela e treme de frio.
- **Streak & Freeze:** Mantenha a ofensiva de dias consecutivos. Compre o Amuleto de Gelo na Taverna para não perder a sequência se falhar um dia.
- **Modo Solo/Coop:** Adapte a rotina para dias em que você está sozinho ou cuidando do seu filho (Heitor).
- **Modo Fim de Semana:** O checklist muda automaticamente aos sábados e domingos.

## 🛠️ Tecnologias Utilizadas
- **React 19 + TypeScript** (Interface e tipagem forte)
- **Vite** (Build e bundler rápido)
- **Tailwind CSS v4** (Estilização com design system 8-bit)
- **Zustand** (Gerenciamento de estado global e persistência no Local Storage)
- **Zod** (Validação de schemas para garantir que o save do jogo não corrompa)
- **Vitest** (Testes unitários da lógica de XP, HP e rollover diário)
- **Vite PWA Plugin** (Service Worker e configuração de app instalável)

## 🚀 Como rodar o projeto localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/SEU-USUARIO/voto-app.git