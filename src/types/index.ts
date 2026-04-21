export type Route = "IFPI" | "UESPI" | "UFPI" | "CONTRATOS";
export type PaymentStatus = "pago" | "pendente" | "atrasado";

export interface Passenger {
  id: string;
  nome: string;
  telefone: string;
  rota: Route;
  mensalidade: number;
  diaVencimento: number;
}

export interface Payment {
  id: string;
  passengerId: string;
  mes: number;
  ano: number;
  valor: number;
  dataPagamento: string | null;
}

export interface CurrentMonth {
  mes: number;
  ano: number;
}
