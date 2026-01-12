# 🔔 Sistema de Notificações - FitTrack

## Visão Geral

Sistema completo de notificações em tempo real para atividades agendadas, com pop-ups customizados que aparecem no topo da tela.

## ✨ Funcionalidades

### 1. **Notificações Automáticas de Atividades**

O sistema verifica automaticamente a cada 5 minutos e envia notificações:

- **1 hora antes**: "⏰ Falta 1 hora para: 🏃 Corrida às 18:00"
- **30 minutos antes**: "⚡ Faltam 30 minutos para: 🏊 Natação"
- **Na hora**: "🔥 Hora da sua atividade: 💪 Musculação!"
- **Atividades de amanhã**: "📅 Você tem 3 atividades marcadas para amanhã!" (enviado entre 18h-21h)

### 2. **Pop-up Customizado**

- Aparece no topo da tela
- 4 tipos visuais: `info` (azul), `success` (verde), `warning` (amarelo), `error` (vermelho)
- Botão ❌ para fechar manualmente
- Auto-fecha após 10 segundos (configurável)
- Animação suave de entrada/saída
- Responsivo para mobile

### 3. **Campo de Hora Adicionado**

- Campo opcional `hora` nas atividades (formato HH:mm)
- Datetime picker do Ionic para fácil seleção
- Armazenado no banco de dados
- Usado para calcular timing das notificações

## 📦 Arquivos Criados

### Backend
- `api/prisma/schema.prisma` - Campo `time` adicionado ao modelo Activity

### Frontend
```
ionic/src/app/
├── components/
│   └── notification-toast/
│       ├── notification-toast.component.ts
│       ├── notification-toast.component.html
│       └── notification-toast.component.scss
├── services/
│   └── notification.service.ts
└── app.module.ts (atualizado)
    app.component.ts (atualizado)
```

## 🚀 Como Usar

### 1. Criar Atividade com Hora

```typescript
// Ao adicionar/editar tarefa, incluir campo hora
tarefa = {
  tipoAtividade: 'corrida',
  duracao: 45,
  dataAtividade: '2026-01-13',
  hora: '18:00', // ✅ Novo campo
  intensidade: 'alta',
  local: 'Parque',
  descricao: 'Treino intervalado'
};
```

### 2. Notificações Manuais

```typescript
// Injetar o serviço
constructor(private notificationService: NotificationService) {}

// Tipos de notificações
this.notificationService.showSuccess('Atividade concluída com sucesso!');
this.notificationService.showError('Erro ao salvar atividade');
this.notificationService.showWarning('Atenção: dados incompletos');
this.notificationService.showInfo('Nova atualização disponível');

// Notificação customizada
this.notificationService.showNotification({
  id: 'unique-id',
  message: '🎉 Parabéns! Você completou 10 atividades!',
  type: 'success',
  duration: 15000 // 15 segundos
});
```

### 3. Configuração

**Intervalo de Verificação** (padrão: 5 minutos)
```typescript
// Em notification.service.ts, linha 27
this.checkInterval = setInterval(() => {
  this.checkUpcomingActivities();
}, 5 * 60 * 1000); // Alterar aqui
```

**Duração do Auto-Close** (padrão: 10 segundos)
```typescript
// Ao criar notificação
duration: 10000 // Em milissegundos
```

**Horário da Notificação de Amanhã** (padrão: 18h-21h)
```typescript
// Em notification.service.ts, linha 110
if (now.getHours() >= 18 && now.getHours() <= 21) // Alterar aqui
```

## 🔄 Migração do Banco de Dados

Após adicionar o campo `time` ao schema, executar:

```bash
cd api
npx prisma migrate dev --name add_activity_time_field
```

## 🎨 Personalização Visual

### Cores por Tipo

Editar em `notification-toast.component.scss`:

```scss
.notification-info {
  background: linear-gradient(135deg, #3880ff 0%, #5260ff 100%);
}

.notification-success {
  background: linear-gradient(135deg, #2dd36f 0%, #10dc60 100%);
}

// Adicionar novos tipos...
.notification-custom {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
}
```

### Posição do Pop-up

Alterar em `notification-toast.component.scss`:

```scss
.notification-toast {
  top: 20px; // Distância do topo
  // Para bottom: usar bottom: 20px; ao invés de top
}
```

## 🧪 Exemplo Completo

```typescript
// adicionar-tarefa.page.ts
async adicionarTarefa() {
  try {
    await this.tarefasService.adicionarTarefa({
      tipoAtividade: 'corrida',
      duracao: 30,
      dataAtividade: '2026-01-13',
      hora: '07:00', // ✅ Notificações automáticas
      intensidade: 'alta',
      local: 'Parque',
      descricao: 'Corrida matinal'
    });
    
    // Feedback visual
    this.notificationService.showSuccess('✅ Atividade agendada com sucesso!');
    
  } catch (error) {
    this.notificationService.showError('❌ Erro ao agendar atividade');
  }
}
```

## 🔐 Segurança

- Notificações apenas para usuários autenticados
- Sistema iniciado/parado automaticamente no login/logout
- IDs únicos para evitar duplicatas
- Limpeza automática de notificações antigas (24h)

## 📱 Suporte Mobile

- Layout responsivo
- Touch-friendly (botão fechar grande o suficiente)
- Animações otimizadas
- Suporte a landscape e portrait

## 🐛 Troubleshooting

**Notificações não aparecem:**
1. Verificar se o usuário está autenticado
2. Confirmar que a atividade tem campo `hora` preenchido
3. Verificar console do browser para erros

**Múltiplas notificações duplicadas:**
- Sistema já possui controle de duplicatas via `notifiedActivities` Set

**Notificações não fecham:**
- Verificar se BrowserAnimationsModule está importado em app.module.ts

## 📚 Referências

- [Ionic Datetime](https://ionicframework.com/docs/api/datetime)
- [Angular Animations](https://angular.io/guide/animations)
- [RxJS BehaviorSubject](https://rxjs.dev/api/index/class/BehaviorSubject)
