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
        const rawDescription = getValue(["notes", "desc", "message", "query", "about", "description"]);
        const rawCrmStatus = getValue(["status", "crmstatus", "leadstatus"]);
        const rawDataSource = getValue(["source", "datasource", "channel"]);

        const isSkipped = !rawEmail && !rawMobile;

        // Clean phone number and parse country code
        let cleanedPhone = String(rawMobile || "").replace(/[^0-9+]/g, "");
        let countryCode = "";
        const rawCountryCode = getValue(["countrycode", "country_code", "dialcode", "dial_code"]);
        if (rawCountryCode) {
          let cleanedCC = String(rawCountryCode).trim().replace(/[^0-9+]/g, "");
          if (cleanedCC) {
            countryCode = cleanedCC.startsWith("+") ? cleanedCC : "+" + cleanedCC;
          }
        }

        let mobileWithoutCode = cleanedPhone;
        if (cleanedPhone.startsWith("+")) {
          countryCode = cleanedPhone.substring(0, 3);
          mobileWithoutCode = cleanedPhone.substring(3);
        } else if (cleanedPhone.length > 10) {
          if (!countryCode) {
            countryCode = "+" + cleanedPhone.substring(0, cleanedPhone.length - 10);
          }
          mobileWithoutCode = cleanedPhone.substring(cleanedPhone.length - 10);
        }

        if (!countryCode) {
          countryCode = "+91";
        }

        // Standardize Name (Capitalize initials)
        let cleanName = String(rawName || "").trim();
        if (!cleanName && rawEmail) {
          cleanName = rawEmail.split("@")[0].replace(/[^a-zA-Z]/g, " ");
        }
        if (cleanName) {
          cleanName = cleanName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
        } else {
          cleanName = "Lead";
        }

        // Determine CRM status
        let crm_status = "GOOD_LEAD_FOLLOW_UP";
        if (isSkipped) {
          crm_status = "SKIPPED";
        } else if (!rawName) {
          crm_status = "BAD_LEAD"; // If name is missing, it's definitely a Bad Lead
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

        // Determine Data Source
        let data_source = "";
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
          created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
          name: cleanName,
          email: rawEmail || "",
          country_code: isSkipped ? "" : countryCode,
          mobile_without_country_code: isSkipped ? "" : (mobileWithoutCode || ""),
          company: rawCompany || "—",
          city: rawCity || "",
          state: rawState || "",
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
      1. CRITICAL: If an input row has BOTH email AND mobile phone empty/missing, set its "crm_status" to "SKIPPED". Do not filter it out; instead, include it in the output list with the "crm_status" set to "SKIPPED". For any SKIPPED row, set "country_code" to empty string "" and "mobile_without_country_code" to empty string "".
      2. If "name" is missing or empty (but email or mobile is present) → set "crm_status" to "BAD_LEAD". Do not infer name to make it a good lead.
      3. Constrain "crm_status" to ONLY one of these five values:
         - GOOD_LEAD_FOLLOW_UP
         - DID_NOT_CONNECT
         - BAD_LEAD
         - SALE_DONE
         - SKIPPED
      4. Constrain "data_source" to ONLY one of these five values:
         - leads_on_demand
         - meridian_tower
         - eden_park
         - varah_swamy
         - sarjapur_plots
         If none match confidently, leave it blank (empty string "").
      5. For valid phone numbers: extract any country code (like 91, 1, +91) and save it in "country_code" (prefixed with +). Clean "mobile_without_country_code" so it contains ONLY numeric digits, with no symbols, letters, dashes, or country code.
      6. Standardize Names: Capitalize the first letter of each word (e.g. "arul nandhi" -> "Arul Nandhi"). 

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
