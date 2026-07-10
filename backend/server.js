import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "GrowEasy AI Importer Backend is running!" });
});

app.post("/api/import", async (req, res) => {
  const { fileName, fileData } = req.body;

  if (!fileData || !Array.isArray(fileData) || fileData.length === 0) {
    return res.status(400).json({ error: "Invalid lead data. Expected an array of records." });
  }

  console.log(`Processing ${fileData.length} records from CSV file: ${fileName}`);

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    console.warn("WARNING: GEMINI_API_KEY is not set in backend/.env. Using fallback mock mapper.");
    
    // Fallback Mock AI mapping for testing
    const mappedLeads = fileData
      .map((row) => {
        // Attempt to find fields in the raw row
        const rawKeys = Object.keys(row);
        
        const getValue = (keys) => {
          const matchedKey = rawKeys.find(k => keys.some(key => k.toLowerCase().replace(/[^a-z0-9]/g, "").includes(key)));
          return matchedKey ? row[matchedKey] : "";
        };

        const rawName = getValue(["name", "firstname", "lastname", "fullname", "contact"]);
        const rawEmail = getValue(["email", "mail", "emailaddress"]);
        const rawMobile = getValue(["phone", "mobile", "cell", "contactno", "tel"]);
        const rawCity = getValue(["city", "town", "location", "address"]);
        const rawCompany = getValue(["company", "org", "firm", "business"]);
        const rawState = getValue(["state", "province"]);
        const rawCountry = getValue(["country", "nation"]);
        const rawLeadOwner = getValue(["owner", "assigned", "agent"]);
        const rawDescription = getValue(["notes", "desc", "message", "query", "about"]);

        const isSkipped = !rawEmail && !rawMobile;

        // Clean phone number (simple mock cleaning)
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

        // Standardize Name (Capitalize initials)
        let cleanName = rawName || "Lead";
        if (cleanName.includes("@")) {
          cleanName = cleanName.split("@")[0].replace(/[^a-zA-Z]/g, " ");
        }
        cleanName = cleanName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

        // Randomly assign valid CRM status and source from the list
        const statuses = ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"];
        const sources = ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"];
        
        const crm_status = isSkipped ? "SKIPPED" : statuses[Math.floor(Math.random() * statuses.length)];
        const data_source = sources[Math.floor(Math.random() * sources.length)];

        return {
          created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
          name: cleanName,
          email: rawEmail || "no-email@example.com",
          country_code: isSkipped ? "" : countryCode,
          mobile_without_country_code: isSkipped ? "—" : (mobileWithoutCode || "0000000000"),
          company: rawCompany || "—",
          city: rawCity || "Unknown",
          state: rawState || "Unknown",
          country: rawCountry || "India",
          lead_owner: rawLeadOwner || "Arul Nandhi",
          crm_status: crm_status,
          crm_note: isSkipped ? "Skipped automatically: both email and phone number are missing." : "Mapped via Mock AI Fallback.",
          data_source: data_source,
          possession_time: "",
          description: rawDescription || "CSV upload"
        };
      });

    return res.json({
      success: true,
      message: "Mapped records successfully using Fallback mock AI mapping.",
      count: mappedLeads.length,
      leads: mappedLeads
    });
  }

  // --- Real Google Gemini AI Mapping ---
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const systemPrompt = `
      You are an expert CRM lead processing engine. Your job is to read an array of raw CSV-parsed lead objects and map them into the standardized CRM JSON schema.
      
      TARGET CRM JSON OBJECT SCHEMA:
      {
        "created_at": "YYYY-MM-DD HH:MM:SS",
        "name": "Full Name",
        "email": "Email address",
        "country_code": "Country calling code, e.g. +91",
        "mobile_without_country_code": "The phone number without country code, spaces, or dashes",
        "company": "Company or business name",
        "city": "City name",
        "state": "State/Province",
        "country": "Country name",
        "lead_owner": "Assigned owner name",
        "crm_status": "CRM Status (constrained - see rule below)",
        "crm_note": "A useful summary note detailing how you mapped this",
        "data_source": "Ad Campaign / Platform source (constrained - see rule below)",
        "possession_time": "Time string if any",
        "description": "Short bio or inquiry detail if any"
      }

      STRICT CRITICAL RULES:
      1. CRITICAL: If an input row has BOTH email AND mobile phone empty/missing, set its "crm_status" to "SKIPPED". Do not filter it out; instead, include it in the output list with the "crm_status" set to "SKIPPED".
      2. Constrain "crm_status" to ONLY one of these five values:
         - GOOD_LEAD_FOLLOW_UP
         - DID_NOT_CONNECT
         - BAD_LEAD
         - SALE_DONE
         - SKIPPED
      3. Constrain "data_source" to ONLY one of these five values:
         - leads_on_demand
         - meridian_tower
         - eden_park
         - varah_swamy
         - sarjapur_plots
         Default to "leads_on_demand" if no details are present.
      4. For the phone number: extract any country code (like 91, 1, +91) and save it in "country_code" (prefixed with +). Clean "mobile_without_country_code" so it contains ONLY numeric digits, with no symbols, letters, dashes, or country code.
      5. Standardize Names: Capitalize the first letter of each word (e.g. "arul nandhi" -> "Arul Nandhi"). If name is missing, infer it from the email (e.g. "arul.nandhi@gmail.com" -> "Arul Nandhi") or set to "Lead".

      Generate a valid JSON array of objects matching the target schema.
    `;

    const userPrompt = `
      Here is the raw input JSON parsed from the CSV file:
      ${JSON.stringify(fileData)}
      
      Map these leads to the target CRM schema based on the instructions.
    `;

    const response = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);

    const responseText = response.response.text();
    const mappedLeads = JSON.parse(responseText);

    console.log(`AI successfully processed ${mappedLeads.length} leads.`);

    return res.json({
      success: true,
      message: "Successfully mapped leads using Google Gemini AI.",
      count: mappedLeads.length,
      leads: mappedLeads
    });

  } catch (err) {
    console.error("Gemini mapping failed:", err);
    return res.status(500).json({ error: "AI Mapping failed: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running in development mode on port ${PORT}`);
});
