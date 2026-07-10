import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
  try {
    const { fileName, fileData } = await request.json();

    if (!fileData || !Array.isArray(fileData) || fileData.length === 0) {
      return Response.json(
        { error: "Invalid lead data. Expected an array of records." },
        { status: 400 }
      );
    }

    console.log(`Processing ${fileData.length} records from: ${fileName}`);

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === "") {
      console.warn("No GEMINI_API_KEY found. Using Mock AI fallback.");

      const mappedLeads = fileData.map((row) => {
        const rawKeys = Object.keys(row);

        const getValue = (keys) => {
          const matchedKey = rawKeys.find((k) =>
            keys.some((key) =>
              k.toLowerCase().replace(/[^a-z0-9]/g, "").includes(key)
            )
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

        let cleanedPhone = String(rawMobile).replace(/[^0-9+]/g, "");
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
        cleanName = cleanName
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");

        const statuses = ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"];
        const sources = ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"];

        const crm_status = isSkipped
          ? "SKIPPED"
          : statuses[Math.floor(Math.random() * statuses.length)];
        const data_source = sources[Math.floor(Math.random() * sources.length)];

        return {
          created_at:
            rawCreatedAt ||
            new Date().toISOString().replace("T", " ").substring(0, 19),
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
            : "Mapped via Mock AI Fallback.",
          data_source,
          possession_time: "",
          description: rawDescription || "CSV upload",
        };
      });

      return Response.json({
        success: true,
        message: "Mapped using Mock AI fallback.",
        count: mappedLeads.length,
        leads: mappedLeads,
      });
    }

    // --- Real Gemini AI Mapping ---
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const systemPrompt = `
      You are an expert CRM lead processing engine. Map raw CSV-parsed lead objects into the standardized GrowEasy CRM JSON schema.

      TARGET SCHEMA:
      {
        "created_at": "YYYY-MM-DD HH:MM:SS",
        "name": "Full Name (capitalized)",
        "email": "Email address",
        "country_code": "+91",
        "mobile_without_country_code": "digits only",
        "company": "Company name",
        "city": "City",
        "state": "State",
        "country": "Country",
        "lead_owner": "Owner name",
        "crm_status": "constrained value",
        "crm_note": "mapping summary or extra info",
        "data_source": "constrained value",
        "possession_time": "",
        "description": "description if any"
      }

      STRICT RULES:
      1. If a row has BOTH email AND mobile empty/missing, set crm_status to "SKIPPED". Do NOT remove the row.
      2. crm_status must be ONLY one of: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE, SKIPPED
      3. data_source must be ONLY one of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots. Default: "leads_on_demand".
      4. Extract country_code (e.g. +91) and store only digits in mobile_without_country_code.
      5. Capitalize names: "john doe" → "John Doe". Infer from email if name is missing.
      6. If multiple emails/mobiles, use the first one and store rest in crm_note.
      7. Use crm_note for remarks, extra contacts, or additional info.

      Return a valid JSON array of mapped objects.
    `;

    const response = await model.generateContent([
      { text: systemPrompt },
      { text: `Map these leads:\n${JSON.stringify(fileData)}` },
    ]);

    const mappedLeads = JSON.parse(response.response.text());
    console.log(`Gemini mapped ${mappedLeads.length} leads.`);

    return Response.json({
      success: true,
      message: "Mapped using Google Gemini AI.",
      count: mappedLeads.length,
      leads: mappedLeads,
    });
  } catch (err) {
    console.error("Import API error:", err);
    return Response.json(
      { error: "Processing failed: " + err.message },
      { status: 500 }
    );
  }
}
