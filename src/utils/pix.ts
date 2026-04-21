function emv(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function normalizeText(value: string, max: number): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .trim()
    .slice(0, max);
}

interface PixPayloadInput {
  key: string;
  amount: number;
  merchantName: string;
  merchantCity: string;
  txid: string;
}

export function createPixPayload(input: PixPayloadInput): string {
  const gui = emv("00", "BR.GOV.BCB.PIX");
  const key = emv("01", input.key.trim());
  const merchantAccount = emv("26", `${gui}${key}`);

  const amount = input.amount > 0 ? emv("54", input.amount.toFixed(2)) : "";
  const additionalData = emv("62", emv("05", normalizeText(input.txid, 25) || "***"));

  const payloadWithoutCrc = [
    emv("00", "01"),
    emv("01", "12"),
    merchantAccount,
    emv("52", "0000"),
    emv("53", "986"),
    amount,
    emv("58", "BR"),
    emv("59", normalizeText(input.merchantName, 25) || "MINHA VAN"),
    emv("60", normalizeText(input.merchantCity, 15) || "TERESINA"),
    additionalData,
    "6304",
  ].join("");

  return `${payloadWithoutCrc}${crc16(payloadWithoutCrc)}`;
}

