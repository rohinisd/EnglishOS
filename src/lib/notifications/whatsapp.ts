export async function sendWhatsApp(params: {
  phone: string;
  templateName: string;
  params: Record<string, string>;
}): Promise<boolean> {
  const apiKey = process.env.AISENSY_API_KEY;
  if (!apiKey || apiKey === "placeholder_fill_later") {
    console.log("[WhatsApp stub]", params);
    return true;
  }
  try {
    const res = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey,
        campaignName: params.templateName,
        destination: params.phone.replace("+", ""),
        userName: "EnglishForge",
        templateParams: Object.values(params.params),
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("WhatsApp error:", err);
    return false;
  }
}
