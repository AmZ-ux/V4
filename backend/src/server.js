import fs from "node:fs";
import path from "node:path";

import cors from "cors";
import express from "express";
import multer from "multer";
import { z } from "zod";

import { authRequired, roleRequired, signToken } from "./auth.js";
import {
  CURRENT_MONTH,
  comparePassword,
  createPassenger,
  createUser,
  deletePassenger,
  findPassengerById,
  findPassengerByPhoneDigits,
  findUserByEmail,
  findUserById,
  getSettings,
  initDb,
  listPassengerHistory,
  listPassengers,
  listPayments,
  listPendingReceipts,
  updateSettings,
  upsertPayment,
} from "./db.js";

const app = express();
const PORT = Number(process.env.PORT || 4000);
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const requestBuckets = new Map();
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 10 * 1024 * 1024 },
});

initDb();

function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const elapsed = Date.now() - start;
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} -> ${res.statusCode} (${elapsed}ms)`);
  });
  next();
}

function rateLimit({ keyPrefix, limit, windowMs }) {
  return (req, res, next) => {
    const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || "unknown";
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const bucket = requestBuckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      requestBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= limit) {
      return res.status(429).json({ message: "RATE_LIMITED" });
    }

    bucket.count += 1;
    requestBuckets.set(key, bucket);
    return next();
  };
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error("CORS_NOT_ALLOWED"));
    },
    credentials: false,
  }),
);
app.use(requestLogger);
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  telefone: z.string().min(10),
  rota: z.enum(["IFPI", "UESPI", "UFPI", "R.SÁ", "CONTRATOS"]),
  mensalidade: z.number().positive(),
  diaVencimento: z.number().min(1).max(28),
  password: z.string().min(6),
});

app.get("/health", (_, res) => {
  res.json({ ok: true, now: new Date().toISOString() });
});

app.post("/auth/login", rateLimit({ keyPrefix: "auth-login", limit: 12, windowMs: 60_000 }), (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "INVALID_INPUT" });
  }

  const { email, password } = parsed.data;
  const user = findUserByEmail(email.toLowerCase());
  if (!user || !comparePassword(password, user.password_hash)) {
    return res.status(401).json({ message: "INVALID_CREDENTIALS" });
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    passengerId: user.passenger_id,
  });

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      passengerId: user.passenger_id ?? undefined,
    },
  });
});

app.post("/auth/register", rateLimit({ keyPrefix: "auth-register", limit: 8, windowMs: 60_000 }), (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "INVALID_INPUT" });
  }

  const { email, password, ...passengerPayload } = parsed.data;
  const existing = findUserByEmail(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ message: "EMAIL_ALREADY_EXISTS" });
  }

  const passenger = createPassenger(passengerPayload);
  createUser({
    email: email.toLowerCase(),
    password,
    role: "passenger",
    passengerId: passenger.id,
  });

  return res.status(201).json({ passenger });
});

app.get("/auth/me", authRequired, (req, res) => {
  const user = findUserById(req.auth.sub);
  if (!user) return res.status(404).json({ message: "USER_NOT_FOUND" });
  return res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    passengerId: user.passenger_id ?? undefined,
  });
});

app.get("/bootstrap", authRequired, (req, res) => {
  const passengers = listPassengers();
  const payments = listPayments(CURRENT_MONTH.mes, CURRENT_MONTH.ano);
  const settings = getSettings();

  const filteredPassengers = req.auth.role === "admin" ? passengers : passengers.filter((p) => p.id === req.auth.passengerId);
  const filteredPayments = req.auth.role === "admin" ? payments : payments.filter((p) => p.passengerId === req.auth.passengerId);

  return res.json({
    currentMonth: CURRENT_MONTH,
    passengers: filteredPassengers,
    payments: filteredPayments,
    settings,
  });
});

app.get("/passengers", authRequired, roleRequired("admin"), (_, res) => {
  res.json(listPassengers());
});

app.post("/passengers", authRequired, roleRequired("admin"), (req, res) => {
  const schema = z.object({
    nome: z.string().min(3),
    telefone: z.string().min(10),
    rota: z.enum(["IFPI", "UESPI", "UFPI", "R.SÁ", "CONTRATOS"]),
    mensalidade: z.number().positive(),
    diaVencimento: z.number().min(1).max(28),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "INVALID_INPUT" });
  const passenger = createPassenger(parsed.data);
  return res.status(201).json(passenger);
});

app.delete("/passengers/:id", authRequired, roleRequired("admin"), (req, res) => {
  deletePassenger(req.params.id);
  res.status(204).send();
});

app.get("/payments", authRequired, (req, res) => {
  const month = Number(req.query.month || CURRENT_MONTH.mes);
  const year = Number(req.query.year || CURRENT_MONTH.ano);
  const rows = listPayments(month, year);
  if (req.auth.role === "admin") return res.json(rows);
  return res.json(rows.filter((row) => row.passengerId === req.auth.passengerId));
});

app.post("/payments/mark-paid", authRequired, roleRequired("admin"), (req, res) => {
  const schema = z.object({
    passengerId: z.string().min(2),
    month: z.number().min(1).max(12),
    year: z.number().min(2020),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "INVALID_INPUT" });
  const payment = upsertPayment(parsed.data.passengerId, parsed.data.month, parsed.data.year, {
    dataPagamento: new Date().toISOString().slice(0, 10),
  });
  return res.json(payment);
});

app.post("/payments/restore-date", authRequired, roleRequired("admin"), (req, res) => {
  const schema = z.object({
    passengerId: z.string().min(2),
    month: z.number().min(1).max(12),
    year: z.number().min(2020),
    previousDate: z.string().nullable(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "INVALID_INPUT" });
  const payment = upsertPayment(parsed.data.passengerId, parsed.data.month, parsed.data.year, {
    dataPagamento: parsed.data.previousDate,
  });
  return res.json(payment);
});

app.get("/portal/lookup", authRequired, (req, res) => {
  const phone = String(req.query.phone || "").replace(/\D/g, "");
  if (phone.length !== 11) {
    return res.status(400).json({ message: "INVALID_PHONE" });
  }
  const passenger = findPassengerByPhoneDigits(phone);
  if (!passenger) return res.status(404).json({ message: "NOT_FOUND" });
  const history = listPassengerHistory(passenger.id);
  return res.json({ passenger, history });
});

app.get("/passenger/me", authRequired, roleRequired("passenger"), (req, res) => {
  const passenger = findPassengerById(req.auth.passengerId);
  if (!passenger) return res.status(404).json({ message: "PASSENGER_NOT_FOUND" });
  const history = listPassengerHistory(passenger.id);
  return res.json({ passenger, history });
});

app.post(
  "/passenger/receipt",
  rateLimit({ keyPrefix: "receipt-upload", limit: 20, windowMs: 5 * 60_000 }),
  authRequired,
  roleRequired("passenger"),
  upload.single("file"),
  (req, res) => {
  const month = Number(req.body.month || CURRENT_MONTH.mes);
  const year = Number(req.body.year || CURRENT_MONTH.ano);
  const payment = upsertPayment(req.auth.passengerId, month, year, {
    receiptStatus: "in_review",
    receiptFile: req.file ? `/uploads/${req.file.filename}` : null,
    receiptUploadedAt: new Date().toISOString(),
  });
  return res.status(201).json(payment);
  },
);

app.get("/receipts/pending", authRequired, roleRequired("admin"), (_, res) => {
  res.json(listPendingReceipts());
});

app.patch("/receipts/:paymentId/status", authRequired, roleRequired("admin"), (req, res) => {
  const schema = z.object({
    status: z.enum(["approved", "rejected", "in_review"]),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "INVALID_INPUT" });

  const paymentId = req.params.paymentId;
  const [_, passengerId, yearRaw, monthRaw] = paymentId.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const payment = upsertPayment(passengerId, month, year, {
    receiptStatus: parsed.data.status,
  });
  return res.json(payment);
});

app.get("/settings", authRequired, roleRequired("admin"), (_, res) => {
  res.json(getSettings());
});

app.put("/settings", authRequired, roleRequired("admin"), (req, res) => {
  const schema = z.object({
    pixKey: z.string().min(4),
    dueDayDefault: z.number().min(1).max(31),
    defaultMessage: z.string().min(1),
    lateMessage: z.string().min(1),
    confirmationMessage: z.string().min(1),
    autoSend: z.boolean(),
    reminderDays: z.number().min(0).max(30),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "INVALID_INPUT" });
  res.json(updateSettings(parsed.data));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "INTERNAL_ERROR" });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
