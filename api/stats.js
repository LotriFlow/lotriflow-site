const crypto = require("crypto");

// App Store Connect API configuration
const ASC_BASE_URL = "https://api.appstoreconnect.apple.com/v1";

/**
 * Generate JWT token for App Store Connect API
 */
function generateJWT() {
  const issuerId = process.env.ASC_ISSUER_ID;
  const keyId = process.env.ASC_KEY_ID;
  const privateKeyBase64 = process.env.ASC_PRIVATE_KEY;

  if (!issuerId || !keyId || !privateKeyBase64) {
    throw new Error("Missing App Store Connect API credentials");
  }

  // Decode the base64-encoded private key (it's a PEM file)
  const privateKeyPEM = Buffer.from(privateKeyBase64, "base64").toString("utf8");

  // Create a proper key object from the PEM
  const privateKey = crypto.createPrivateKey({
    key: privateKeyPEM,
    format: "pem",
  });

  // JWT Header
  const header = {
    alg: "ES256",
    kid: keyId,
    typ: "JWT",
  };

  // JWT Payload (expires in 20 minutes)
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: issuerId,
    iat: now,
    exp: now + 1200, // 20 minutes
    aud: "appstoreconnect-v1",
  };

  // Encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  // Create signature using the proper key object
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const sign = crypto.createSign("SHA256");
  sign.update(signatureInput);
  sign.end();

  // Sign with DSA signature format for ES256
  const derSignature = sign.sign({ key: privateKey, dsaEncoding: "ieee-p1363" });
  const encodedSignature = base64UrlEncode(derSignature);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

function base64UrlEncode(data) {
  const buffer = typeof data === "string" ? Buffer.from(data) : data;
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Fetch sales report from App Store Connect
 */
async function fetchSalesReport(token) {
  const vendorNumber = process.env.VENDOR_NUMBER;

  if (!vendorNumber) {
    throw new Error("Missing VENDOR_NUMBER environment variable");
  }

  // Get yesterday's date for the report
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const reportDate = yesterday.toISOString().split("T")[0];

  const url =
    `${ASC_BASE_URL}/salesReports?` +
    new URLSearchParams({
      "filter[frequency]": "DAILY",
      "filter[reportDate]": reportDate,
      "filter[reportSubType]": "SUMMARY",
      "filter[reportType]": "SALES",
      "filter[vendorNumber]": vendorNumber,
    });

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/a]gzip",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Sales API error: ${response.status} - ${error}`);
  }

  return response;
}

/**
 * Fetch app analytics from App Store Connect Analytics Reports API
 */
async function fetchAnalytics(token) {
  // First, get the list of available analytics reports
  const url = `${ASC_BASE_URL}/analyticsReportRequests`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Analytics API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Fetch app metadata (ratings, version info)
 */
async function fetchAppInfo(token, appId) {
  const url = `${ASC_BASE_URL}/apps/${appId}?include=appStoreVersions`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`App info API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Main API handler
 */
module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Generate JWT token
    const token = generateJWT();

    // Prepare response object
    const stats = {
      timestamp: new Date().toISOString(),
      downloads: null,
      revenue: null,
      activeUsers: null,
      rating: null,
      reviews: null,
      raw: {},
    };

    // Try to fetch app info (for ratings)
    const appId = process.env.APP_ID;
    if (appId) {
      try {
        const appInfo = await fetchAppInfo(token, appId);
        stats.raw.appInfo = appInfo;
      } catch (err) {
        stats.raw.appInfoError = err.message;
      }
    }

    // Try to fetch sales data
    try {
      const salesResponse = await fetchSalesReport(token);
      // Sales reports come as gzipped TSV, parse accordingly
      const salesData = await salesResponse.text();
      stats.raw.sales = salesData;

      // Parse simple metrics from sales data if available
      // This is a simplified parser - actual format may vary
      const lines = salesData.split("\n");
      if (lines.length > 1) {
        // Sum up units from sales report
        let totalUnits = 0;
        let totalRevenue = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split("\t");
          if (cols.length > 7) {
            totalUnits += parseInt(cols[7]) || 0; // Units column
            totalRevenue += parseFloat(cols[8]) || 0; // Revenue column
          }
        }
        stats.downloads = totalUnits;
        stats.revenue = totalRevenue.toFixed(2);
      }
    } catch (err) {
      stats.raw.salesError = err.message;
    }

    // Try to fetch analytics
    try {
      const analytics = await fetchAnalytics(token);
      stats.raw.analytics = analytics;
    } catch (err) {
      stats.raw.analyticsError = err.message;
    }

    return res.status(200).json(stats);
  } catch (error) {
    console.error("Stats API error:", error);
    return res.status(500).json({
      error: error.message,
      hint: "Make sure ASC_ISSUER_ID, ASC_KEY_ID, ASC_PRIVATE_KEY, and VENDOR_NUMBER are set in Vercel environment variables",
    });
  }
};
