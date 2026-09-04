/**
 * Send an outgoing text message to a customer's phone number using Meta's WhatsApp Cloud API.
 * 
 * @param phoneNumberId The WhatsApp Business Phone Number ID from Meta
 * @param accessToken The System User Access Token or Permanent token from Meta
 * @param to The recipient's phone number (with country code, e.g. "919438099999")
 * @param text The message text to send
 */
export async function sendMetaWhatsappMessage(
  phoneNumberId,
  accessToken,
  to,
  text
) {
  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
  
  // Format phone number for Meta Cloud API:
  const cleanTo = to.replace(/\D/g, "");
  console.log(`[WhatsApp] Sending to formatted number: "${cleanTo}" (original: "${to}")`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanTo,
        type: "text",
        text: {
          body: text
        }
      })
    });

    const responseData = await response.json();
    if (!response.ok) {
      console.error("Meta WhatsApp Cloud API Error Response:", responseData);
      throw new Error(responseData?.error?.message || "Failed to deliver WhatsApp message via Meta Cloud API");
    }

    return responseData;
  } catch (error) {
    console.error("Error sending WhatsApp message via Meta:", error);
    throw error;
  }
}
