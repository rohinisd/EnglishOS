import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendProgressReport(params: {
  to: string;
  studentName: string;
  weekData: {
    videosWatched: number;
    totalVideos: number;
    avgScore: number;
    streak: number;
  };
}) {
  const { to, studentName, weekData } = params;
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL ?? "noreply@englishforge.intelliforge.tech",
      to,
      subject: `Weekly Progress: ${studentName} — EnglishForge`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0f2847;">Weekly Progress Report</h1>
          <p>Hello!</p>
          <p>Here's ${studentName}'s progress this week on <strong>EnglishForge</strong>:</p>
          <ul>
            <li>Videos Watched: ${weekData.videosWatched}/${weekData.totalVideos}</li>
            <li>Average Score: ${weekData.avgScore}%</li>
            <li>Current Streak: ${weekData.streak} days</li>
          </ul>
          <p style="color: #c9973a;">Keep up the great work!</p>
          <p>— The EnglishForge Team</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Email send error:", err);
  }
}

export async function sendPaymentReceipt(params: {
  to: string;
  name: string;
  amount: number;
  plan: string;
}) {
  const { to, name, amount, plan } = params;
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL ?? "noreply@englishforge.intelliforge.tech",
      to,
      subject: "Payment Received — EnglishForge",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0f2847;">Payment Confirmed</h1>
          <p>Hi ${name},</p>
          <p>We've received your payment of <strong>₹${amount / 100}</strong> for the <strong>${plan}</strong> plan.</p>
          <p>You now have full access to the English Mastery Program. Welcome to EnglishForge!</p>
          <p>— The EnglishForge Team</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Email send error:", err);
  }
}
