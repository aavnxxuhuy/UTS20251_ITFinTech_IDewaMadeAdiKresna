import fetch from "node-fetch";

const WA_API = process.env.FONNTE_API_URL || "https://api.fonnte.com/send";
const WA_TOKEN = process.env.FONNTE_TOKEN;

export async function sendWhatsAppOTP(phone: string, otp: string) {
  if (!WA_API || !WA_TOKEN) {
    console.warn("WA API not configured - skipping WA OTP");
    return;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("target", phone);
    formData.append("message", `Kode OTP Anda: ${otp}. Berlaku 5 menit.`);
    formData.append("countryCode", "62");

    const res = await fetch(WA_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": WA_TOKEN, // BUKAN `Bearer`
      },
      body: formData,
    });

    const text = await res.text();
    console.log("Fonnte response:", text);

    if (!res.ok) {
      console.error("WA send error:", text);
    } else {
      console.log("WA OTP sent successfully");
    }
  } catch (err) {
    console.error("WA send error:", err);
  }
}


export async function sendWhatsAppNotification(phone: string, message: string) {
  if (!WA_API || !WA_TOKEN) {
    console.warn("WA API not configured - skipping WA notification");
    return;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("target", phone);
    formData.append("message", message);
    formData.append("countryCode", "62"); // optional

    const res = await fetch(WA_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": WA_TOKEN, // tanpa Bearer
      },
      body: formData,
    });

    const text = await res.text();
    console.log("Fonnte response:", text);

    if (!res.ok) {
      console.error("WA notify error:", text);
      console.log("Failed to send WhatsApp notification");
    } else {
      console.log("WA notification sent successfully");
    }
  } catch (err) {
    console.error("WA notify error:", err);
    console.log("Failed to send WhatsApp notification");
  }
}