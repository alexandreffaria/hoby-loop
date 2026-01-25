// Brazilian Portuguese translations
export default {
  common: {
    loading: "Carregando...",
    logout: "Sair",
    settings: "Configurações",
    active: "Ativo",
    inactive: "Inativo",
    welcome: "Olá, {name}",
    copyLink: "🔗 Copiar Link",
    unknown: "Desconhecido",
    noData: "Nenhum dado disponível.",
    status: "Status:",
    save: "Salvar",
    cancel: "Cancelar",
    back: "Voltar"
  },

  unauthorized: {
    title: "Acesso Negado",
    message: "Você não tem permissão para acessar esta página. Verifique se está usando a conta correta ou entre em contato com o administrador.",
    goBack: "Voltar",
    logout: "Sair da Conta",
    helpText: "Se você acredita que deveria ter acesso a esta página, entre em contato com o suporte."
  },
  
  button: {
    submit: "Enviar",
    cancel: "Cancelar",
    save: "Salvar",
    delete: "Excluir",
    edit: "Editar",
    add: "Adicionar"
  },

  admin: {
    title: "Painel Administrativo",
    users: "Usuários",
    sellers: "Vendedores",
    consumers: "Consumidores",
    admins: "Administradores",
    subscriptions: "Assinaturas",
    baskets: "Cestas",
    tabUsers: "USUÁRIOS",
    tabSubscriptions: "ASSINATURAS",
    tabBaskets: "CESTAS",
    noActiveSubscriptions: "Nenhuma assinatura ativa.",
    noProductsAvailable: "Nenhum produto disponível.",
    sellerId: "ID do Vendedor: {id}",
    table: {
      name: "Nome",
      email: "Email",
      role: "Função",
      status: "Status"
    },
    basketInfo: "Cesta: {name}",
    createBasket: {
      title: "Criar Nova Cesta",
      sectionTitle: "Criar Nova Cesta",
      newBasket: "+ Nova Cesta",
      seller: "Vendedor",
      selectSeller: "Selecione um vendedor",
      basketName: "Nome da Cesta",
      basketNamePlaceholder: "Ex: Cesta de Frutas Orgânicas",
      description: "Descrição",
      descriptionPlaceholder: "Descreva o conteúdo da cesta...",
      price: "Preço (R$)",
      frequency: "Frequência de Entrega",
      weekly: "Semanal",
      biweekly: "Quinzenal",
      monthly: "Mensal",
      submit: "Criar Cesta"
    },
    basketsOverview: {
      title: "Visão Geral das Cestas",
      seller: "Vendedor"
    },
    success: {
      basketCreated: "Cesta criada com sucesso!"
    },
    errors: {
      fetchSellers: "Erro ao carregar vendedores",
      allFieldsRequired: "Todos os campos são obrigatórios",
      pricePositive: "O preço deve ser maior que zero",
      createBasket: "Erro ao criar cesta. Tente novamente."
    }
  },

  seller: {
    title: "Painel do Vendedor",
    tabClients: "CLIENTES",
    tabProducts: "PRODUTOS",
    noActiveSubscribers: "Nenhum assinante ativo.",
    noRegisteredProducts: "Nenhum produto cadastrado.",
    orderManagement: "Gerenciar Pedidos",
    manageOrders: "Gerencie os pedidos desta cesta",
    noOrders: "Nenhum pedido encontrado.",
    orderStatusUpdated: "Status do pedido atualizado com sucesso!",
    errorUpdatingOrder: "Erro ao atualizar o pedido."
  },

  login: {
    title: "Entrar",
    email: "Email",
    emailPlaceholder: "ex: ada-conceicao@cirino.com",
    accessAccount: "Acessar Conta",
    createAccount: "Crie sua conta",
    clickToTest: "Clique para testar:",
    administrator: "👑 Administrador",
    adminUser: "Usuário Admin",
    sellers: "🛍️ Vendedores",
    seller1: "Viana (Vendedor 1)",
    seller2: "Barros Ferreira (Vendedor 2)",
    clients: "👤 Clientes",
    client1: "Luiz Gustavo (Cliente 10)",
    client2: "Eduardo (Cliente 11)",
    userNotFound: "Usuário não encontrado! Verifique os emails de teste abaixo."
  },

  alerts: {
    linkCopied: "Link copiado! Envie para seu cliente:\n{link}",
    adminDeactivated: "Sua conta de administrador foi desativada. Entre em contato com o administrador do sistema."
  },
  
  landing: {
    sellerTitle: "Sou Vendedor",
    sellerDescription: "Gerenciar clientes e criar produtos.",
    consumerTitle: "Sou Assinante",
    consumerDescription: "Ver minhas assinaturas ativas."
  },
  
  registration: {
    seller: {
      title: "Crie sua conta",
      name: "Seu nome",
      company: "Sua empresa",
      cnpj: "CNPJ",
      phone: "Telefone",
      email: "E-mail",
      address: "Endereço",
      submit: "Cadastrar-se",
      success: "Conta criada com sucesso!",
      error: "Erro ao criar conta."
    },
    subscriber: {
      title: "Crie sua conta",
      name: "Seu nome",
      email: "E-mail",
      cpf: "CPF",
      phone: "Telefone",
      address: "Endereço",
      submit: "Cadastrar-se",
      success: "Conta criada com sucesso!",
      error: "Erro ao criar conta."
    }
  },
  
  consumer: {
    title: "Minhas Assinaturas",
    noActiveSubscriptions: "Você ainda não tem assinaturas ativas.",
    deliveryCalendar: "Calendário de Entregas",
    nextDelivery: "Próxima Entrega",
    pastDeliveries: "Entregas Anteriores",
    upcomingDeliveries: "Próximas Entregas",
    scheduledFor: "Agendado para",
    noOrders: "Nenhuma entrega agendada ainda.",
    today: "Hoje",
    tomorrow: "Amanhã",
    inDays: "Em {days} dias",
    daysAgo: "Há {days} dias"
  },
  
  checkout: {
    errorLoading: "Erro ao carregar produto",
    successMessage: "Assinatura realizada com sucesso!",
    errorMessage: "Erro ao assinar.",
    loginRequired: "Você precisa estar logado para fazer uma assinatura.",
    productImage: "Foto do produto",
    description: "Descrição",
    sixMonths: "Durante 6 meses",
    monthly: "Mensalmente",
    address: "Endereço",
    zipCode: "CEP",
    street: "Rua",
    complement: "Complemento",
    reference: "Referência",
    payment: "Pagamento",
    cardData: "Dados do Cartão",
    expiryDate: "MM/AA",
    cardName: "Nome impresso no cartão",
    documentNumber: "CPF / CNPJ",
    deliveryFrequency: "Frequência de Entrega",
    weeklyDeliveries: "Entregas Semanais",
    biweeklyDeliveries: "Entregas Quinzenais",
    monthlyDeliveries: "Entregas Mensais",
    weeklyDescription: "Você receberá sua cesta toda semana",
    biweeklyDescription: "Você receberá sua cesta a cada 2 semanas",
    monthlyDescription: "Você receberá sua cesta todo mês",
    frequencyWarning: "Frequência não definida - padrão: semanal"
  },
  
  order: {
    preparing: "Preparando",
    shipped: "Enviado",
    delivered: "Entregue",
    pending: "Pendente",
    tracking: "Rastreio",
    previousOrders: "pedidos anteriores",
    orderId: "Pedido",
    deliveryAddress: "Endereço de Entrega",
    markAsShipped: "Marcar como Enviado",
    markAsDelivered: "Marcar como Entregue",
    completed: "Concluído",
    scheduledFor: "Agendado para",
    createdAt: "Criado em",
    filter: {
      all: "Todos",
      preparing: "Preparando",
      shipped: "Enviados",
      delivered: "Entregues"
    }
  },
  
  config: {
    sellerTitle: "Dados da Empresa",
    consumerTitle: "Meus Dados",
    successMessage: "Dados salvos com sucesso!",
    errorMessage: "Erro ao salvar dados. Por favor, tente novamente.",
    fullName: "Nome Completo",
    companyName: "Nome Fantasia",
    email: "Email",
    cpf: "CPF",
    cnpj: "CNPJ",
    deliveryAddress: "Endereço de Entrega",
    zipCode: "CEP",
    city: "Cidade",
    street: "Rua",
    number: "Nº"
  }
};