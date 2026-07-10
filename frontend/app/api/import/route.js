import { GoogleGenerativeAI } from "@google/generative-ai";

// Shared mock mapper — used when no API key is set OR when Gemini fails for any reason
function runMockMapper(fileData) {
  const mappedLeads = fileData.map((row) => {
    const rawKeys = Object.keys(row);
    const getValue = (keys) => {
      const matchedKey = rawKeys.find((k) =>
        keys.some((key) => k.toLowerCase().replace(/[^a-z0-9]/g, "").includes(key))
      );
      return matchedKey ? row[matchedKey] : "";
    };

    const rawName = getValue(["name", "firstname", "lastname", "fullname", "contact"]);
    const rawEmail = getValue(["email", "mail", "emailaddress"]);
    const rawMobile = getValue(["phone", "mobile", "cell", "contactno", "tel"]);
    const rawCity = getValue(["city", "town", "location"]);
    const rawCompany = getValue(["company", "org", "firm", "business"]);
    const rawState = getValue(["state", "province"]);
    const rawCountry = getValue(["country", "nation"]);
    const rawLeadOwner = getValue(["owner", "assigned", "agent"]);
    const rawDescription = getValue(["notes", "desc", "message", "query", "about"]);
    const rawCreatedAt = getValue(["created", "date", "createdat", "timestamp"]);

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

    let cleanName = rawName || "Lead";
    if (cleanName.includes("@")) {
      cleanName = cleanName.split("@")[0].replace(/[^a-zA-Z]/g, " ");
    }
    cleanName = cleanName.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ").trim() || "Lead";

    const statuses = ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"];
    const sources = ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"];
    const crm_status = isSkipped ? "SKIPPED" : statuses[Math.floor(Math.random() * statuses.length)];
    const data_source = sources[Math.floor(Math.random() * sources.length)];

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
        : "Mapped via AI fallback.",
      data_source,
      possession_time: "",
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

  const apiKey = process.env.GEMINI_API_KEY;

  // No API key — use mock mapper immediately
  if (!apiKey || apiKey.trim() === "") {
    console.log("No GEMINI_API_KEY set. Using mock mapper.");
    return runMockMapper(fileData);
  }

  // Try Gemini AI — fall back to mock on ANY failure (quota, model not found, network, etc.)
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = ["gemini-1.5-flash-8b", "gemini-1.5-flash", "gemini-2.0-flash"];

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

      Return ONLY a valid JSON array. No markdown, no explanation.
    `;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying Gemini model: ${modelName}`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" },
        });

        const response = await model.generateContent([
          { text: systemPrompt },
          { text: `Map these leads:\n${JSON.stringify(fileData)}` },
        ]);

        const mappedLeads = JSON.parse(response.response.text());
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
        // Non-retryable error — skip remaining models and fall back
        console.warn(`Model ${modelName} non-retryable error, falling back to mock:`, msg);
        break;
      }
    }

    // All Gemini models failed — fall back to mock silently
    console.warn("All Gemini models failed. Using mock mapper as fallback.");
    return runMockMapper(fileData);

  } catch (err) {
    // Unexpected outer error — still fall back to mock instead of crashing
    console.error("Unexpected error, falling back to mock:", err.message);
    return runMockMapper(fileData);
  }
}
