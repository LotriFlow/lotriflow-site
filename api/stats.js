const jwt = require("jsonwebtoken");

// App Store Connect API configuration
const ASC_BASE_URL = "https://api.appstoreconnect.apple.com/v1";

/**
 * Generate JWT token for App Store Connect API using jsonwebtoken library
 */
function generateJWT() {
  const issuerId = process.env.ASC_ISSUER_ID;
  const keyId = process.env.ASC_KEY_ID;
  const privateKeyBase64 = process.env.ASC_PRIVATE_KEY;

  if (!issuerId || !keyId || !privateKeyBase64) {
    throw new Error("Missing App Store Connect API credentials");
  }

  // Decode the base64-encoded private key (it's a PEM file)
  const privateKey = Buffer.from(privateKeyBase64, "base64").toString("utf8");

  // JWT Payload
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: issuerId,
    iat: now,
    exp: now + 1200, // 20 minutes
    aud: "appstoreconnect-v1",
  };

  // Sign with RS256 (App Store Connect uses ES256)
  const token = jwt.sign(payload, privateKey, {
    algorithm: "ES256",
    keyid: keyId,
  });

  return token;
}

/**
 * Fetch sales report from App Store Connect
 * Tries last 7 days since Apple's data has a delay
 */
async function fetchSalesReport(token) {
  const vendorNumber = process.env.VENDOR_NUMBER;

  if (!vendorNumber) {
    throw new Error("Missing VENDOR_NUMBER environment variable");
  }

  // Try fetching reports from last 14 days (Apple has delays, especially around holidays)
  const errors = [];
  for (let daysBack = 2; daysBack <= 14; daysBack++) {
    const reportDate = new Date();
    reportDate.setDate(reportDate.getDate() - daysBack);
    const dateStr = reportDate.toISOString().split("T")[0];

    const url =
      `${ASC_BASE_URL}/salesReports?` +
      new URLSearchParams({
        "filter[frequency]": "DAILY",
        "filter[reportDate]": dateStr,
        "filter[reportSubType]": "SUMMARY",
        "filter[reportType]": "INSTALLS",
        "filter[vendorNumber]": vendorNumber,
        "filter[version]": "1_3",
      });

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/a-gzip",
        },
      });

      if (response.ok) {
        console.log(`[Sales] Found data for ${dateStr}`);
        return { response, date: dateStr };
      } else {
        const errorText = await response.text();
        errors.push(`${dateStr}: ${response.status} - ${errorText.substring(0, 100)}`);
      }
    } catch (err) {
      errors.push(`${dateStr}: ${err.message}`);
    }
  }

  throw new Error(`No install data available. Errors: ${errors.slice(0, 3).join("; ")}`);
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
    
    // Debug info for troubleshooting
    const debugInfo = {
      keyIdConfigured: process.env.ASC_KEY_ID ? process.env.ASC_KEY_ID.substring(0, 4) + "..." : "MISSING",
      issuerIdConfigured: process.env.ASC_ISSUER_ID ? process.env.ASC_ISSUER_ID.substring(0, 8) + "..." : "MISSING",
      privateKeyConfigured: process.env.ASC_PRIVATE_KEY ? `${process.env.ASC_PRIVATE_KEY.length} chars` : "MISSING",
      vendorConfigured: process.env.VENDOR_NUMBER ? "YES" : "MISSING",
      tokenGenerated: token ? token.substring(0, 50) + "..." : "FAILED",
    };

    // Prepare response object
    const stats = {
      timestamp: new Date().toISOString(),
      downloads: null,
      revenue: null,
      activeUsers: null,
      rating: null,
      reviews: null,
      raw: { debug: debugInfo },
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
      const { response: salesResponse, date: salesDate } = await fetchSalesReport(token);
      // Sales reports come as gzipped TSV, parse accordingly
      const salesData = await salesResponse.text();
      stats.raw.sales = salesData;
      stats.raw.salesDate = salesDate;

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
