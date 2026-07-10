import assert from "assert";

// Clean name initial capitalizations
function standardizeName(rawName) {
  let cleanName = rawName || "Lead";
  if (cleanName.includes("@")) {
    cleanName = cleanName.split("@")[0].replace(/[^a-zA-Z]/g, " ");
  }
  return cleanName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

// Phone parsing rule
function cleanPhone(rawMobile) {
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
  return { countryCode, mobileWithoutCode };
}

// Skip checking rule
function getCRMStatus(rawEmail, rawMobile, defaultStatus) {
  const isSkipped = !rawEmail && !rawMobile;
  return isSkipped ? "SKIPPED" : defaultStatus;
}

// Running Assertion Tests
console.log("🚀 Starting GrowEasy Importer Unit Tests...");

try {
  // Test 1: Name Standardizer
  console.log("🧪 Testing Name Standardizer Initial Caps...");
  assert.strictEqual(standardizeName("arul nandhi"), "Arul Nandhi");
  assert.strictEqual(standardizeName("john.doe@example.com"), "John Doe");
  assert.strictEqual(standardizeName("sarah johnson"), "Sarah Johnson");
  console.log("✅ Name standardizer passed.");

  // Test 2: Phone Standardizer
  console.log("🧪 Testing Phone Cleansing & Extraction...");
  const phone1 = cleanPhone("+919876543210");
  assert.strictEqual(phone1.countryCode, "+91");
  assert.strictEqual(phone1.mobileWithoutCode, "9876543210");

  const phone2 = cleanPhone("918888888888");
  assert.strictEqual(phone2.countryCode, "+91");
  assert.strictEqual(phone2.mobileWithoutCode, "8888888888");
  console.log("✅ Phone extraction passed.");

  // Test 3: Skipped Status Logic
  console.log("🧪 Testing Skip Rule Flags (No Email/Mobile)...");
  // Case A: Missing both email and mobile -> MUST BE "SKIPPED"
  const statusA = getCRMStatus("", "", "GOOD_LEAD_FOLLOW_UP");
  assert.strictEqual(statusA, "SKIPPED");

  // Case B: Has email, missing mobile -> MAPPED to default
  const statusB = getCRMStatus("sarah@example.com", "", "GOOD_LEAD_FOLLOW_UP");
  assert.strictEqual(statusB, "GOOD_LEAD_FOLLOW_UP");

  // Case C: Has mobile, missing email -> MAPPED to default
  const statusC = getCRMStatus("", "9876543210", "SALE_DONE");
  assert.strictEqual(statusC, "SALE_DONE");
  console.log("✅ Skip rule logic passed.");

  console.log("\n🎉 All 3 unit tests passed successfully!");
} catch (error) {
  console.error("❌ Test suite failed:", error.message);
  process.exit(1);
}
