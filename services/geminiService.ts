import { GoogleGenAI } from "@google/genai";

// Fix: Aligned with Gemini API coding guidelines.
// The API key must be sourced directly from the environment variable `process.env.API_KEY`.
// The '!' non-null assertion is used because the guidelines state to assume the key is always available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface NotificationDetails {
  customerName: string;
  productName: string;
  status: string;
  trackingNumber?: string;
}

export const generateNotificationMessage = async ({
  customerName,
  productName,
  status,
  trackingNumber,
}: NotificationDetails): Promise<string> => {
  const model = 'gemini-2.5-flash';

  const prompt = `את מרינה, בעלת עסק ששולחת מוצרים ללקוחות.
המשימה שלך היא לכתוב הודעת עדכון קצרה, ידידותית וחיובית ללקוח/ה.
ההודעה צריכה להיות בעברית.

פרטי ההזמנה:
- שם הלקוח/ה: ${customerName}
- שם המוצר: ${productName}
- סטטוס חדש: ${status}
- מספר מעקב (אם קיים): ${trackingNumber || 'אין עדיין'}

נא לנסח הודעה קצרה (2-3 משפטים) שתכלול את הפרטים האלה. התחילי בפנייה אישית ללקוח/ה.
לדוגמה, אם הסטטוס הוא 'נשלחה', תוכלי לכלול את מספר המעקב ולציין שהחבילה בדרך.
אם הסטטוס הוא 'נמסרה', ודאי שהלקוח/ה קיבל/ה את החבילה ותאחלי שיהנו מהמוצר.
הקפידי על טון חם ואישי.`;

  try {
    // Fix: Removed conditional logic for API key existence to adhere to guidelines.
    // The API call will now proceed directly, with the expectation that the key is configured.
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    // Fallback message in case of API error
    return `היי ${customerName}, עדכון לגבי ההזמנה שלך (${productName}). הסטטוס שונה ל: ${status}.`;
  }
};