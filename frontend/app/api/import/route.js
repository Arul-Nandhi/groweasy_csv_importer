import { GoogleGenAI } from "@google/genai";

// Shared mock mapper — used when no API key is set OR when AI calls fail
function runMockMapper(fileData) {
  const mappedLeads = fileData.map((row) => {
    const rawKeys = Object.keys(row);
    const getValue = (keys) => {
      const matchedKey = rawKeys.find((k) =>
        keys.some((key) => k.toLowerCase().replace(/[^a-z0-9]/g, "").includes(key))
      );
      return matchedKey ? row[matchedKey] : "";
    };

    const rawName = getValue(["name", "firstname", "lastname", "fullname", "customername", "contact"]);
    const rawEmail = getValue(["email", "mail", "emailaddress"]);
    const rawMobile = getValue(["phone", "mobile", "cell", "contactno", "tel", "phonenumber"]);
    const rawCity = getValue(["city", "town", "location", "region"]);
    const rawCompany = getValue(["company", "org", "firm", "business"]);
    const rawState = getValue(["state", "province"]);
    const rawCountry = getValue(["country", "nation"]);
    const rawLeadOwner = getValue(["owner", "assigned", "agent", "leadowner"]);
    const rawDescription = getValue(["notes", "desc", "message", "query", "about", "description"]);
    const rawCreatedAt = getValue(["created", "date", "createdat", "timestamp"]);
    const rawCrmStatus = getValue(["status", "crmstatus", "leadstatus"]);
    const rawDataSource = getValue(["source", "datasource", "channel"]);
    const rawPossessionTime = getValue(["possession", "possessiontime"]);

    const isSkipped = !rawEmail && !rawMobile;

    let cleanedPhone = String(rawMobile || "").replace(/[^0-9+]/g, "");
    let countryCode = "+91";
    let mobileWithoutCode = cleanedPhone;
    if (cleanedPhone.startsWith("+")) {
      countryCode = cleanedPhone.substring(0, 3);
      mobileWithoutCode = cleanedPhone.substring(3);
    } else if (cleanedPhone.length > 10) {
      countryCode = "+" + cleanedPhone.substring(0, cleanedPhone.length - 10);
      mobileWithoutCode = cleanedPhone.substring(cleanedPhone.length - 10);
    }

    let cleanName = String(rawName || "").trim();
    if (!cleanName && rawEmail) {
      cleanName = rawEmail.split("@")[0].replace(/[^a-zA-Z]/g, " ");
    }
    if (cleanName) {
      cleanName = cleanName.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ").trim();
    }
    if (!cleanName) {
      cleanName = "Lead";
    }

    let crm_status = "DID_NOT_CONNECT";
    if (isSkipped) {
      crm_status = "SKIPPED";
    } else if (rawCrmStatus) {
      const statusUpper = String(rawCrmStatus).toUpperCase().trim().replace(/ /g, "_");
      if (["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"].includes(statusUpper)) {
        crm_status = statusUpper;
      } else {
        if (statusUpper.includes("GOOD") || statusUpper.includes("FOLLOW")) crm_status = "GOOD_LEAD_FOLLOW_UP";
        else if (statusUpper.includes("CONNECT") || statusUpper.includes("DIALED")) crm_status = "DID_NOT_CONNECT";
        else if (statusUpper.includes("BAD") || statusUpper.includes("INVALID")) crm_status = "BAD_LEAD";
        else if (statusUpper.includes("SALE") || statusUpper.includes("DONE") || statusUpper.includes("WON")) crm_status = "SALE_DONE";
      }
    }

    let data_source = "leads_on_demand";
    if (rawDataSource) {
      const sourceLower = String(rawDataSource).toLowerCase().trim().replace(/ /g, "_");
      if (["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"].includes(sourceLower)) {
        data_source = sourceLower;
      } else {
        if (sourceLower.includes("demand")) data_source = "leads_on_demand";
        else if (sourceLower.includes("meridian") || sourceLower.includes("tower")) data_source = "meridian_tower";
        else if (sourceLower.includes("eden") || sourceLower.includes("park")) data_source = "eden_park";
        else if (sourceLower.includes("varah") || sourceLower.includes("swamy")) data_source = "varah_swamy";
        else if (sourceLower.includes("sarjapur") || sourceLower.includes("plots")) data_source = "sarjapur_plots";
      }
    }

    return {
      created_at: rawCreatedAt || new Date().toISOString().replace("T", " ").substring(0, 19),
      name: cleanName,
      email: rawEmail || "",
      country_code: isSkipped ? "" : countryCode,
      mobile_without_country_code: isSkipped ? "" : mobileWithoutCode || "",
      company: rawCompany || "—",
      city: rawCity || "",
      state: rawState || "",
      country: rawCountry || "India",
      lead_owner: rawLeadOwner || "Arul Nandhi",
      crm_status,
      crm_note: isSkipped
        ? "Skipped: both email and phone number are missing."
        : (getValue(["crm_note", "note", "remarks"]) || "Mapped via AI fallback."),
      data_source,
      possession_time: rawPossessionTime || "",
      description: rawDescription || "CSV upload",
    };
  });

  return Response.json({
    success: true,
    message: "Mapped using AI fallback mapper.",
    count: mappedLeads.length,
    leads: mappedLeads,
  });
}

export async function POST(request) {
  let fileData = [];
  let fileName = "";

  try {
    const body = await request.json();
    fileData = body.fileData;
    fileName = body.fileName;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!fileData || !Array.isArray(fileData) || fileData.length === 0) {
    return Response.json({ error: "No lead data provided." }, { status: 400 });
  }

  console.log(`Processing ${fileData.length} records from: ${fileName}`);

  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  const systemPrompt = `
    You are an expert CRM lead processing engine. Map raw CSV-parsed lead objects into the standardized GrowEasy CRM JSON schema.

    TARGET SCHEMA (return a JSON array of these objects):
    {
      "created_at": "YYYY-MM-DD HH:MM:SS",
      "name": "Full Name (Initial Caps)",
      "email": "email address",
      "country_code": "+91",
      "mobile_without_country_code": "digits only, no spaces",
      "company": "company name",
      "city": "city",
      "state": "state",
      "country": "country",
      "lead_owner": "owner name",
      "crm_status": "one of the allowed values below",
      "crm_note": "remarks or extra info",
      "data_source": "one of the allowed values below",
      "possession_time": "",
      "description": "additional detail"
    }

    STRICT RULES:
    1. If a row has BOTH email AND mobile empty/missing → set crm_status to "SKIPPED". Keep the row in output.
    2. crm_status must be ONLY one of: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE, SKIPPED
    3. data_source must be ONLY one of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots. Default to "leads_on_demand".
    4. Extract country_code (e.g. +91). Store only digits in mobile_without_country_code.
    5. Capitalize names properly. Infer from email if name is missing (e.g. john.doe@x.com → "John Doe").
    6. Multiple emails/mobiles: use first, append rest to crm_note.

    Return ONLY a valid JSON array. Do not wrap in markdown blocks, no code fences.
  `;

  // --- Path A: Try Groq Llama-3 API first (Highly stable and free) ---
  if (groqApiKey && groqApiKey.trim() !== "") {
    try {
      console.log("Using Groq Llama-3 API mapping...");
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Map these leads:\n${JSON.stringify(fileData)}` }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`Groq HTTP error: ${response.status}`);
      }

      const resBody = await response.json();
      const content = resBody.choices[0].message.content;
      const parsedData = JSON.parse(content);
      const leadsArray = Array.isArray(parsedData) ? parsedData : (parsedData.leads || []);

      console.log(`Groq Llama-3 mapped ${leadsArray.length} leads.`);
      return Response.json({
        success: true,
        message: "Mapped using Groq Llama-3 AI.",
        count: leadsArray.length,
        leads: leadsArray
      });

    } catch (groqErr) {
      console.warn("Groq API failed, attempting Gemini fallback. Error:", groqErr.message);
    }
  }

  // --- Path B: Try Gemini API ---
  if (geminiApiKey && geminiApiKey.trim() !== "") {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const modelsToTry = ["gemini-1.5-flash-8b", "gemini-1.5-flash", "gemini-2.0-flash"];

      for (const modelName of modelsToTry) {
        try {
          console.log(`Trying Gemini model: ${modelName}`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              { text: systemPrompt },
              { text: `Map these leads:\n${JSON.stringify(fileData)}` }
            ],
            config: {
              responseMimeType: "application/json"
            }
          });

          const textContent = response.text;
          const mappedLeads = JSON.parse(textContent);
          console.log(`Gemini (${modelName}) mapped ${mappedLeads.length} leads.`);

          return Response.json({
            success: true,
            message: `Mapped using Google Gemini AI (${modelName}).`,
            count: mappedLeads.length,
            leads: mappedLeads,
          });

        } catch (modelErr) {
          const msg = String(modelErr.message || "");
          const isRetryable = msg.includes("429") || msg.includes("404") || msg.includes("quota") || msg.includes("not found") || msg.includes("limit");
          if (isRetryable) {
            console.warn(`Model ${modelName} unavailable, trying next...`);
            continue;
          }
          break;
        }
      }
    } catch (geminiErr) {
      console.warn("Gemini API failed:", geminiErr.message);
    }
  }

  // --- Path C: Default to Mock Fallback ---
  console.log("No working API keys found. Falling back to local Mock mapper.");
  return runMockMapper(fileData);
}
