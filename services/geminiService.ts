import { GoogleGenAI } from "@google/genai";
import { CaseCategory, LegalCase } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert legal assistant. Your task is to analyze text from court cause lists (which may be messy OCR output) and extract structured case data.

You must categorize each case into one of the following categories strictly:
- Criminal (Bail, Murder, NAB, FIA, Illegal Dispossession, Narcotics, etc.)
- Service (Dismissal, Promotion, Pension, Seniority, ACR, Government employees, etc.)
- Civil (Land, Property, Contracts, Rent, etc.)
- Family (Divorce, Custody, Maintenance, etc.)
- Election (Disqualification, Election disputes)
- Tax (Revenue, Customs, Income Tax)
- Other (If it doesn't fit above)

Return the data as a clean JSON array. If the text contains no cases, return an empty array.
`;

export const analyzeCaseText = async (pageText: string, pageIndex: number): Promise<LegalCase[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Analyze the following page from a cause list. Extract all individual cases listed.
        
        Text Content:
        """
        ${pageText}
        """
        
        Output JSON format:
        [
          {
            "caseNumber": "string",
            "title": "string (Petitioner v. Respondent)",
            "category": "string (Criminal, Service, Civil, Family, Election, Tax, Other)",
            "summary": "string (brief summary of the matter, e.g., 'Bail after arrest', 'Promotion dispute')",
            "lawyers": ["string"],
            "date": "string (Extract the hearing date or case date in YYYY-MM-DD format. If no specific date is found for the case, look for the main date at the top of the list)"
          }
        ]
      `,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.1, // Low temperature for factual extraction
      },
    });

    const jsonText = response.text || "[]";
    const parsedData = JSON.parse(jsonText);

    // Map to strictly typed LegalCase objects
    return parsedData.map((item: any, index: number) => ({
      id: `p${pageIndex}_c${index}_${Math.random().toString(36).substr(2, 9)}`,
      caseNumber: item.caseNumber || "Unknown",
      title: item.title || "Unknown Parties",
      category: mapCategory(item.category),
      summary: item.summary || "No summary available",
      lawyers: Array.isArray(item.lawyers) ? item.lawyers : [],
      date: item.date || undefined,
    }));

  } catch (error) {
    console.error("Error analyzing page with Gemini:", error);
    return [];
  }
};

const mapCategory = (rawCategory: string): CaseCategory => {
  const lower = rawCategory.toLowerCase();
  if (lower.includes('crim')) return CaseCategory.CRIMINAL;
  if (lower.includes('service')) return CaseCategory.SERVICE;
  if (lower.includes('civil')) return CaseCategory.CIVIL;
  if (lower.includes('family')) return CaseCategory.FAMILY;
  if (lower.includes('election')) return CaseCategory.ELECTION;
  if (lower.includes('tax') || lower.includes('custom')) return CaseCategory.TAX;
  return CaseCategory.OTHER;
};