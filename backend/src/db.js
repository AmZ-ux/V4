import fs from "node:fs";
import path from "node:path";

import bcrypt from "bcryptjs";
import Database from "better-sqlite3";

const ROOT_DIR = path.resolve(process.cwd());
const DATA_DIR = path.join(ROOT_DIR, "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export const CURRENT_MONTH = { mes: 5, ano: 2026 };

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS passengers (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      telefone TEXT NOT NULL UNIQUE,
      rota TEXT NOT NULL,
      mensalidade REAL NOT NULL,
      dia_vencimento INTEGER NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      passenger_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(passenger_id) REFERENCES passengers(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      passenger_id TEXT NOT NULL,
      mes INTEGER NOT NULL,
      ano INTEGER NOT NULL,
      valor REAL NOT NULL,
      data_pagamento TEXT,
      receipt_status TEXT NOT NULL DEFAULT 'none',
      receipt_file TEXT,
      receipt_uploaded_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(passenger_id) REFERENCES passengers(id) ON DELETE CASCADE,
      UNIQUE(passenger_id, mes, ano)
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      pix_key TEXT NOT NULL DEFAULT 'pix@minhavan.com',
      due_day_default INTEGER NOT NULL DEFAULT 10,
      default_message TEXT NOT NULL DEFAULT 'Ola! Lembrete da mensalidade.',
      late_message TEXT NOT NULL DEFAULT 'Sua mensalidade esta em atraso. Pode confirmar o pagamento?',
      confirmation_message TEXT NOT NULL DEFAULT 'Pagamento confirmado. Obrigado!',
      auto_send INTEGER NOT NULL DEFAULT 0,
      reminder_days INTEGER NOT NULL DEFAULT 3
    );
  `);
}

function rowToPassenger(row) {
  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    rota: row.rota,
    mensalidade: Number(row.mensalidade),
    diaVencimento: Number(row.dia_vencimento),
  };
}

function rowToPayment(row) {
  return {
    id: row.id,
    passengerId: row.passenger_id,
    mes: Number(row.mes),
    ano: Number(row.ano),
    valor: Number(row.valor),
    dataPagamento: row.data_pagamento,
    receiptStatus: row.receipt_status,
    receiptFile: row.receipt_file,
    receiptUploadedAt: row.receipt_uploaded_at,
  };
}

function paymentId(passengerId, month, year) {
  return `pay-${passengerId}-${year}-${String(month).padStart(2, "0")}`;
}

function ensureCurrentMonthPayments() {
  const passengers = db.prepare("SELECT * FROM passengers WHERE active = 1").all();
  const insert = db.prepare(`
    INSERT OR IGNORE INTO payments (id, passenger_id, mes, ano, valor, data_pagamento, receipt_status)
    VALUES (@id, @passengerId, @mes, @ano, @valor, NULL, 'none')
  `);

  const trx = db.transaction(() => {
    for (const passenger of passengers) {
      insert.run({
        id: paymentId(passenger.id, CURRENT_MONTH.mes, CURRENT_MONTH.ano),
        passengerId: passenger.id,
        mes: CURRENT_MONTH.mes,
        ano: CURRENT_MONTH.ano,
        valor: passenger.mensalidade,
      });
    }
  });

  trx();
}

function seed() {
  const userCount = db.prepare("SELECT COUNT(1) AS count FROM users").get().count;
  if (userCount > 0) {
    ensureCurrentMonthPayments();
    return;
  }

  const passengers = [
    { id: "p01", nome: "Ana Clara Silva", telefone: "(86) 99876-5432", rota: "IFPI", mensalidade: 280, diaVencimento: 28 },
    { id: "p02", nome: "Bruno Oliveira", telefone: "(86) 98765-4321", rota: "IFPI", mensalidade: 280, diaVencimento: 5 },
    { id: "p05", nome: "Mariana Costa", telefone: "(86) 92345-6789", rota: "IFPI", mensalidade: 280, diaVencimento: 8 },
    { id: "p07", nome: "Gabriela Rocha", telefone: "(86) 94567-8901", rota: "UESPI", mensalidade: 300, diaVencimento: 10 },
    { id: "p12", nome: "Daniel Santos", telefone: "(86) 99012-3456", rota: "UFPI", mensalidade: 320, diaVencimento: 10 },
    { id: "p18", nome: "Carlos Eduardo Pinto", telefone: "(86) 97890-0321", rota: "CONTRATOS", mensalidade: 480, diaVencimento: 5 },
  ];

  const users = [
    { id: "u-admin", email: "admin@minhavan.com", role: "admin", passengerId: null },
    { id: "u-p01", email: "ana@ifpi.com", role: "passenger", passengerId: "p01" },
    { id: "u-p02", email: "bruno@ifpi.com", role: "passenger", passengerId: "p02" },
    { id: "u-p05", email: "mariana@ifpi.com", role: "passenger", passengerId: "p05" },
    { id: "u-p07", email: "gabriela@uespi.com", role: "passenger", passengerId: "p07" },
    { id: "u-p12", email: "daniel@ufpi.com", role: "passenger", passengerId: "p12" },
    { id: "u-p18", email: "carlos@contratos.com", role: "passenger", passengerId: "p18" },
  ];

  const paidDates = new Map([
    ["p02", "2026-05-04"],
    ["p05", "2026-05-08"],
    ["p07", "2026-05-09"],
    ["p12", "2026-05-10"],
    ["p18", "2026-05-06"],
  ]);

  const insertPassenger = db.prepare(`
    INSERT INTO passengers (id, nome, telefone, rota, mensalidade, dia_vencimento, active)
    VALUES (@id, @nome, @telefone, @rota, @mensalidade, @diaVencimento, 1)
  `);
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, role, passenger_id)
    VALUES (@id, @email, @passwordHash, @role, @passengerId)
  `);
  const insertPayment = db.prepare(`
    INSERT INTO payments (id, passenger_id, mes, ano, valor, data_pagamento, receipt_status)
    VALUES (@id, @passengerId, @mes, @ano, @valor, @dataPagamento, 'none')
  `);
  const insertSettings = db.prepare(`
    INSERT OR IGNORE INTO app_settings (id) VALUES (1)
  `);

  const defaultHash = bcrypt.hashSync("123456", 10);

  const trx = db.transaction(() => {
    passengers.forEach((passenger) => insertPassenger.run(passenger));
    users.forEach((user) =>
      insertUser.run({
        ...user,
        passwordHash: defaultHash,
      }),
    );
    passengers.forEach((passenger) =>
      insertPayment.run({
        id: paymentId(passenger.id, CURRENT_MONTH.mes, CURRENT_MONTH.ano),
        passengerId: passenger.id,
        mes: CURRENT_MONTH.mes,
        ano: CURRENT_MONTH.ano,
        valor: passenger.mensalidade,
        dataPagamento: paidDates.get(passenger.id) ?? null,
      }),
    );
    insertSettings.run();
  });

  trx();
}

export function initDb() {
  createTables();
  seed();
  ensureCurrentMonthPayments();
}

export function findUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
}

export function findUserById(userId) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
}

export function createPassenger(payload) {
  const count = db.prepare("SELECT COUNT(1) AS count FROM passengers").get().count;
  const id = `p${String(count + 1).padStart(2, "0")}`;
  db.prepare(`
    INSERT INTO passengers (id, nome, telefone, rota, mensalidade, dia_vencimento, active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(id, payload.nome, payload.telefone, payload.rota, payload.mensalidade, payload.diaVencimento);

  db.prepare(`
    INSERT OR IGNORE INTO payments (id, passenger_id, mes, ano, valor, receipt_status)
    VALUES (?, ?, ?, ?, ?, 'none')
  `).run(paymentId(id, CURRENT_MONTH.mes, CURRENT_MONTH.ano), id, CURRENT_MONTH.mes, CURRENT_MONTH.ano, payload.mensalidade);

  return findPassengerById(id);
}

export function findPassengerById(id) {
  const row = db.prepare("SELECT * FROM passengers WHERE id = ? AND active = 1").get(id);
  return row ? rowToPassenger(row) : null;
}

export function listPassengers() {
  return db
    .prepare("SELECT * FROM passengers WHERE active = 1 ORDER BY rota ASC, dia_vencimento ASC, nome ASC")
    .all()
    .map(rowToPassenger);
}

export function deletePassenger(passengerId) {
  db.prepare("UPDATE passengers SET active = 0 WHERE id = ?").run(passengerId);
}

export function createUser(payload) {
  const count = db.prepare("SELECT COUNT(1) AS count FROM users").get().count;
  const id = `u-${count + 1}-${Date.now()}`;
  const passwordHash = bcrypt.hashSync(payload.password, 10);
  db.prepare(`
    INSERT INTO users (id, email, password_hash, role, passenger_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, payload.email.toLowerCase(), passwordHash, payload.role, payload.passengerId ?? null);

  return findUserById(id);
}

export function comparePassword(rawPassword, hash) {
  return bcrypt.compareSync(rawPassword, hash);
}

export function listPayments(month, year) {
  const rows = db
    .prepare(
      `
      SELECT * FROM payments
      WHERE mes = ? AND ano = ?
      ORDER BY passenger_id ASC
    `,
    )
    .all(month, year);
  return rows.map(rowToPayment);
}

export function upsertPayment(passengerId, month, year, updates) {
  const passenger = db.prepare("SELECT * FROM passengers WHERE id = ? AND active = 1").get(passengerId);
  if (!passenger) return null;

  const id = paymentId(passengerId, month, year);
  db.prepare(
    `
    INSERT OR IGNORE INTO payments (id, passenger_id, mes, ano, valor, receipt_status)
    VALUES (?, ?, ?, ?, ?, 'none')
  `,
  ).run(id, passengerId, month, year, passenger.mensalidade);

  const current = db.prepare("SELECT * FROM payments WHERE id = ?").get(id);
  const next = {
    valor: updates.valor ?? current.valor,
    dataPagamento: updates.dataPagamento ?? current.data_pagamento,
    receiptStatus: updates.receiptStatus ?? current.receipt_status,
    receiptFile: updates.receiptFile ?? current.receipt_file,
    receiptUploadedAt: updates.receiptUploadedAt ?? current.receipt_uploaded_at,
  };

  db.prepare(
    `
    UPDATE payments
    SET valor = ?, data_pagamento = ?, receipt_status = ?, receipt_file = ?, receipt_uploaded_at = ?
    WHERE id = ?
  `,
  ).run(next.valor, next.dataPagamento, next.receiptStatus, next.receiptFile, next.receiptUploadedAt, id);

  return rowToPayment(db.prepare("SELECT * FROM payments WHERE id = ?").get(id));
}

export function findPassengerByPhoneDigits(phoneDigits) {
  const rows = db.prepare("SELECT * FROM passengers WHERE active = 1").all();
  const found = rows.find((row) => row.telefone.replace(/\D/g, "") === phoneDigits);
  return found ? rowToPassenger(found) : null;
}

export function listPassengerHistory(passengerId, monthsBack = 6) {
  const history = [];
  for (let i = 0; i < monthsBack; i += 1) {
    const ref = new Date(CURRENT_MONTH.ano, CURRENT_MONTH.mes - 1 - i, 1);
    const month = ref.getMonth() + 1;
    const year = ref.getFullYear();
    const row = db
      .prepare("SELECT * FROM payments WHERE passenger_id = ? AND mes = ? AND ano = ?")
      .get(passengerId, month, year);
    if (!row) continue;
    history.push(rowToPayment(row));
  }
  return history;
}

export function getSettings() {
  const row = db.prepare("SELECT * FROM app_settings WHERE id = 1").get();
  return {
    pixKey: row.pix_key,
    dueDayDefault: Number(row.due_day_default),
    defaultMessage: row.default_message,
    lateMessage: row.late_message,
    confirmationMessage: row.confirmation_message,
    autoSend: Boolean(row.auto_send),
    reminderDays: Number(row.reminder_days),
  };
}

export function updateSettings(payload) {
  db.prepare(
    `
    UPDATE app_settings
    SET pix_key = ?, due_day_default = ?, default_message = ?, late_message = ?, confirmation_message = ?, auto_send = ?, reminder_days = ?
    WHERE id = 1
  `,
  ).run(
    payload.pixKey,
    payload.dueDayDefault,
    payload.defaultMessage,
    payload.lateMessage,
    payload.confirmationMessage,
    payload.autoSend ? 1 : 0,
    payload.reminderDays,
  );
  return getSettings();
}

export function listPendingReceipts() {
  return db
    .prepare(
      `
      SELECT p.*, pa.nome AS passenger_nome, pa.telefone AS passenger_telefone
      FROM payments p
      JOIN passengers pa ON pa.id = p.passenger_id
      WHERE p.receipt_status IN ('in_review', 'rejected')
      ORDER BY p.receipt_uploaded_at DESC
    `,
    )
    .all()
    .map((row) => ({
      ...rowToPayment(row),
      passengerNome: row.passenger_nome,
      passengerTelefone: row.passenger_telefone,
    }));
}

