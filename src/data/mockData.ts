import type { CurrentMonth, Passenger, Payment } from "@/types";

export const CURRENT_MONTH: CurrentMonth = { mes: 5, ano: 2026 };

export const passengers: Passenger[] = [
  { id: "p01", nome: "Ana Clara Silva", telefone: "(86) 99876-5432", rota: "IFPI", mensalidade: 280, diaVencimento: 28 },
  { id: "p02", nome: "Bruno Oliveira", telefone: "(86) 98765-4321", rota: "IFPI", mensalidade: 280, diaVencimento: 5 },
  { id: "p03", nome: "Carla Mendes", telefone: "(86) 97654-3210", rota: "IFPI", mensalidade: 280, diaVencimento: 25 },
  { id: "p04", nome: "Lucas Ferreira", telefone: "(86) 91234-5678", rota: "IFPI", mensalidade: 280, diaVencimento: 10 },
  { id: "p05", nome: "Mariana Costa", telefone: "(86) 92345-6789", rota: "IFPI", mensalidade: 280, diaVencimento: 8 },
  { id: "p06", nome: "Pedro Henrique Souza", telefone: "(86) 93456-7890", rota: "IFPI", mensalidade: 280, diaVencimento: 12 },
  { id: "p07", nome: "Gabriela Rocha", telefone: "(86) 94567-8901", rota: "UESPI", mensalidade: 300, diaVencimento: 10 },
  { id: "p08", nome: "Rafael Lima", telefone: "(86) 95678-9012", rota: "UESPI", mensalidade: 300, diaVencimento: 15 },
  { id: "p09", nome: "Juliana Araujo", telefone: "(86) 96789-0123", rota: "UESPI", mensalidade: 300, diaVencimento: 5 },
  { id: "p10", nome: "Thiago Nascimento", telefone: "(86) 97890-1234", rota: "UESPI", mensalidade: 300, diaVencimento: 10 },
  { id: "p11", nome: "Beatriz Moura", telefone: "(86) 98901-2345", rota: "UESPI", mensalidade: 300, diaVencimento: 8 },
  { id: "p12", nome: "Daniel Santos", telefone: "(86) 99012-3456", rota: "UFPI", mensalidade: 320, diaVencimento: 10 },
  { id: "p13", nome: "Eduarda Lima", telefone: "(86) 90123-4567", rota: "UFPI", mensalidade: 320, diaVencimento: 8 },
  { id: "p14", nome: "Felipe Almeida", telefone: "(86) 91234-0987", rota: "UFPI", mensalidade: 320, diaVencimento: 12 },
  { id: "p15", nome: "Isabela Vieira", telefone: "(86) 92345-0876", rota: "UFPI", mensalidade: 320, diaVencimento: 5 },
  { id: "p16", nome: "Mateus Cardoso", telefone: "(86) 93456-0765", rota: "UFPI", mensalidade: 320, diaVencimento: 10 },
  { id: "p17", nome: "Larissa Barbosa", telefone: "(86) 94567-0654", rota: "UFPI", mensalidade: 320, diaVencimento: 15 },
  { id: "p18", nome: "Carlos Eduardo Pinto", telefone: "(86) 97890-0321", rota: "CONTRATOS", mensalidade: 480, diaVencimento: 5 },
  { id: "p19", nome: "Patricia Soares", telefone: "(86) 98901-0210", rota: "CONTRATOS", mensalidade: 520, diaVencimento: 8 },
  { id: "p20", nome: "Marcos Vinicius Leal", telefone: "(86) 99012-0109", rota: "CONTRATOS", mensalidade: 500, diaVencimento: 12 },
  { id: "p21", nome: "Roberto Martins", telefone: "(86) 95678-0543", rota: "CONTRATOS", mensalidade: 500, diaVencimento: 10 },
  { id: "p22", nome: "Sandra Pereira", telefone: "(86) 96789-0432", rota: "CONTRATOS", mensalidade: 450, diaVencimento: 15 },
];

const paidIds = new Set(["p02", "p04", "p05", "p07", "p08", "p10", "p11", "p12", "p13", "p14", "p16", "p18", "p20", "p22"]);

const paidDates: Record<string, string> = {
  p02: "2026-04-04",
  p04: "2026-04-10",
  p05: "2026-04-08",
  p07: "2026-04-09",
  p08: "2026-04-14",
  p10: "2026-04-10",
  p11: "2026-04-08",
  p12: "2026-04-10",
  p13: "2026-04-08",
  p14: "2026-04-12",
  p16: "2026-04-10",
  p18: "2026-04-06",
  p20: "2026-04-11",
  p22: "2026-04-15",
};

export const payments: Payment[] = passengers.map((passenger) => ({
  id: `pay-${passenger.id}-2026-04`,
  passengerId: passenger.id,
  mes: 4,
  ano: 2026,
  valor: passenger.mensalidade,
  dataPagamento: paidIds.has(passenger.id) ? paidDates[passenger.id] : null,
}));
