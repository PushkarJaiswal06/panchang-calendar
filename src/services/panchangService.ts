import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing API key: set VITE_GEMINI_API_KEY in .env.local and restart the dev server.");
}

const ai = new GoogleGenAI({ apiKey });

export interface PanchangData {
  date: string;
  tithi: string;
  nakshatra: string;
  festival?: string;
  isHoliday?: boolean;
  hinduMonth: string;
  paksha: string;
  vikramSamvat: string;
  dayNumber: number;
}

export interface MonthSummary {
  festivals: { name: string; tithi: string }[];
  ayurvedicAdvice: { category: string; advice: string }[];
}

export async function getPanchangForHinduMonth(hinduMonthName: string, vikramSamvat: string): Promise<{ days: PanchangData[], summary: MonthSummary }> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `भारतीय पंचांग डेटा तैयार करें: हिंदू चंद्र मास: ${hinduMonthName}, विक्रम संवत: ${vikramSamvat}।
    पूर्णिमांत (Purnimanta) प्रणाली का पालन करें।
    सभी डेटा केवल हिंदी में होना चाहिए।
    प्रदान करें:
    1. दैनिक डेटा की सूची (ग्रेगोरियन तिथि YYYY-MM-DD, तिथि, नक्षत्र, पक्ष, उत्सव, दिन संख्या)।
    2. महीने का सारांश:
       - प्रमुख त्योहारों की सूची उनकी तिथियों के साथ।
       - इस महीने के लिए आयुर्वेदिक ऋतुचर्या (आहार, विहार, औषधि)।
    JSON प्रारूप में उत्तर दें। सुनिश्चित करें कि तिथियां और नक्षत्र शुद्ध हिंदी में हों।`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                tithi: { type: Type.STRING },
                nakshatra: { type: Type.STRING },
                paksha: { type: Type.STRING },
                festival: { type: Type.STRING },
                dayNumber: { type: Type.NUMBER }
              },
              required: ["date", "tithi", "nakshatra", "paksha", "dayNumber"]
            }
          },
          summary: {
            type: Type.OBJECT,
            properties: {
              festivals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    tithi: { type: Type.STRING }
                  }
                }
              },
              ayurvedicAdvice: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    advice: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  try {
    const result = JSON.parse(response.text);
    const days = result.days.map((d: any) => ({
      ...d,
      hinduMonth: hinduMonthName,
      vikramSamvat: vikramSamvat
    }));
    return { days, summary: result.summary };
  } catch (e) {
    console.error("Failed to parse Panchang data", e);
    return { days: [], summary: { festivals: [], ayurvedicAdvice: [] } };
  }
}
