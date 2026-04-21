import { db } from "./db";

const OTP_TTL_MINUTES = 10;

export function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function createOtp(phone: string): Promise<string> {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  // Invalidate old codes for this phone
  await db.otpCode.updateMany({
    where: { phone, used: false },
    data: { used: true },
  });

  await db.otpCode.create({ data: { phone, code, expiresAt } });

  // Send via Twilio if configured, else log to console
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (sid && token && sid !== "" && from) {
    try {
      const twilio = (await import("twilio")).default;
      const client = twilio(sid, token);
      await client.messages.create({
        from,
        to: `whatsapp:${phone}`,
        body: `Your EnglishForge OTP is: ${code}. Valid for ${OTP_TTL_MINUTES} minutes.`,
      });
    } catch (err) {
      console.error("[OTP] WhatsApp send failed:", err);
    }
  } else {
    // Dev mode — log to console
    console.log(`\n========================================`);
    console.log(`[OTP] Phone: ${phone}  Code: ${code}`);
    console.log(`========================================\n`);
  }

  return code;
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const record = await db.otpCode.findFirst({
    where: {
      phone,
      code,
      used: false,
      expiresAt: { gte: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return false;

  await db.otpCode.update({ where: { id: record.id }, data: { used: true } });
  return true;
}
