
import { GoogleGenAI, Schema, Type } from "@google/genai";
import { AIAnalysisResult, Subject, SearchResult, ImageResolution } from "../types";

// Official LGS Curriculum derived from the provided document
const LGS_CURRICULUM_CONTEXT = `
ANALİZ İÇİN REFERANS MÜFREDAT (8. SINIF LGS):

1. TÜRKÇE:
- Söz Varlığı (Deyimler, Atasözleri, Özdeyişler)
- Söz Sanatları (Benzetme, Kişileştirme, Konuşturma, Tezat, Abartma)
- Fiilimsiler (İsim-Fiil, Sıfat-Fiil, Zarf-Fiil)
- Cümlenin Öğeleri
- Yazım ve Noktalama Kuralları
- Metin Türleri (Fıkra, Makale, Deneme, Roman, Destan)
- Metinde Anlam (Ana Fikir, Yardımcı Fikir, Başlık, Konu)
- Görsel Okuma ve Grafik Yorumlama
- Geçiş ve Bağlantı İfadeleri

2. MATEMATİK:
- Çarpanlar ve Katlar (EBOB, EKOK)
- Üslü İfadeler (Çözümleme, Bilimsel Gösterim)
- Kareköklü İfadeler (Tam Kare, Kök Dışına Çıkarma, İşlemler)
- Veri Analizi (Çizgi, Sütun, Daire Grafiği)
- Basit Olayların Olma Olasılığı
- Cebirsel İfadeler ve Özdeşlikler

3. FEN BİLİMLERİ:
- Mevsimlerin Oluşumu
- İklim ve Hava Hareketleri
- DNA ve Genetik Kod
- Kalıtım (Çaprazlama, Akraba Evliliği)
- Mutasyon ve Modifikasyon
- Adaptasyon (Doğal Seçilim)
- Biyoteknoloji
- Basınç (Katı, Sıvı, Gaz)
- Periyodik Sistem
- Fiziksel ve Kimyasal Değişimler
- Kimyasal Tepkimeler
- Asitler ve Bazlar

4. T.C. İNKILAP TARİHİ VE ATATÜRKÇÜLÜK:
- Bir Kahraman Doğuyor (Mustafa Kemal'in Hayatı, Kişilik Özellikleri)
- Milli Uyanış: Bağımsızlık Yolunda Atılan Adımlar (I. Dünya Savaşı, Cemiyetler, Kuvâ-yı Milliye, TBMM)
- Milli Bir Destan: Ya İstiklal Ya Ölüm (Cepheler, Maarif Kongresi, Tekalif-i Milliye)

5. DİN KÜLTÜRÜ VE AHLAK BİLGİSİ:
- Kader İnancı (Kaza ve Kader, Sünnetullah, İrade)
- Zekât ve Sadaka (İnfak, Nisap, Öşür)
- Din ve Hayat (Din, Birey ve Toplum; Dinin Temel Gayesi)

Lütfen görseldeki soruyu bu listeye göre sınıflandır.
`;

/**
 * Analyzes the uploaded question image using Gemini 3 Pro Vision.
 * It attempts to extract text, identify the subject, and guess the 'kazanım' (topic).
 */
export const analyzeQuestionImage = async (base64Image: string, mimeType: string): Promise<AIAnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const analysisSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        subject: {
          type: Type.STRING,
          enum: Object.values(Subject),
          description: "LGS Curriculum Subject"
        },
        topic: {
          type: Type.STRING,
          description: "Specific topic or learning outcome (Kazanım) exactly matching the provided list if possible (e.g., 'Üslü İfadeler', 'DNA ve Genetik Kod')"
        },
        extractedText: {
          type: Type.STRING,
          description: "The text content of the question"
        },
        explanation: {
          type: Type.STRING,
          description: "A brief hint or summary of what the question is testing"
        }
      },
      required: ["subject", "topic", "extractedText"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          {
            text: `${LGS_CURRICULUM_CONTEXT}\n\nBu bir LGS (Liselere Giriş Sınavı) hazırlık sorusu. Lütfen bu görseli analiz et. Sorunun hangi derse ait olduğunu belirle, yukarıdaki listeyi kullanarak konusunu (kazanımını) tespit et ve sorudaki metni çıkar.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    }
    throw new Error("AI did not return a valid response.");

  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

/**
 * Uses Google Search Grounding to find resources for a specific topic.
 */
export const searchStudyResources = async (topic: string): Promise<{ text: string; links: SearchResult[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `LGS sınavı müfredatına göre "${topic}" konusu hakkında bilgi ver. Öğrencinin bu kazanımı elde etmesi için bilmesi gereken kritik noktaları ve çalışma önerilerini özetle.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "Bilgi bulunamadı.";
    
    // Extract grounding chunks for links
    const links: SearchResult[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          links.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    return { text, links };

  } catch (error) {
    console.error("Error searching resources:", error);
    throw error;
  }
};

/**
 * Generates a new visual question based on a topic using Gemini 3 Pro Image Preview.
 */
export const generateTestQuestionImage = async (subject: Subject, topic: string, resolution: ImageResolution): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct a specific prompt for the image generation model
    const prompt = `
      Türkiye 8. Sınıf LGS (Liselere Giriş Sınavı) formatında, ${subject} dersi "${topic}" konusu ile ilgili, 
      okunaklı, görsel açıdan temiz, Türkçe bir deneme sınavı sorusu oluştur. 
      Soru metni ve şıklar görselin içinde net bir şekilde yer almalıdır.
      Arka plan beyaz veya açık renk olmalı, bir ders kitabı sayfası gibi görünmelidir.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3", // Standard question card format
          imageSize: resolution // 1K, 2K, 4K
        },
      },
    });

    // Iterate through parts to find the image
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64EncodeString = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }

    throw new Error("Görsel oluşturulamadı.");

  } catch (error) {
    console.error("Error generating question image:", error);
    throw error;
  }
};
