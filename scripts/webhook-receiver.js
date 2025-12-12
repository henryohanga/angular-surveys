#!/usr/bin/env node
/**
 * Simple webhook receiver for testing webhook deliveries
 * Usage: node scripts/webhook-receiver.js
 * Listens on port 3333
 */

const http = require("http");
const crypto = require("crypto");

const PORT = 3333;

const server = http.createServer((req, res) => {
  if (req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const timestamp = new Date().toISOString();

      console.log("\n" + "=".repeat(60));
      console.log(`📥 WEBHOOK RECEIVED at ${timestamp}`);
      console.log("=".repeat(60));

      // Log headers
      console.log("\n📋 HEADERS:");
      console.log("-".repeat(40));
      const relevantHeaders = [
        "x-webhook-signature",
        "x-webhook-event",
        "x-webhook-delivery",
        "content-type",
      ];

      for (const header of relevantHeaders) {
        if (req.headers[header]) {
          console.log(`  ${header}: ${req.headers[header]}`);
        }
      }

      // Log body
      console.log("\n📦 PAYLOAD:");
      console.log("-".repeat(40));
      try {
        const parsed = JSON.parse(body);
        console.log(JSON.stringify(parsed, null, 2));
      } catch {
        console.log(body);
      }

      // Verify signature if provided
      const signature = req.headers["x-webhook-signature"];
      if (signature) {
        console.log("\n🔐 SIGNATURE INFO:");
        console.log("-".repeat(40));
        console.log(`  Raw signature: ${signature}`);

        // Parse signature (format: t=timestamp,v1=hash)
        const parts = signature.split(",");
        const sigParts = {};
        for (const part of parts) {
          const [key, value] = part.split("=");
          sigParts[key] = value;
        }
        console.log(`  Timestamp: ${sigParts.t}`);
        console.log(`  Hash: ${sigParts.v1}`);
      }

      console.log("\n✅ Responded with 200 OK");
      console.log("=".repeat(60) + "\n");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ received: true, timestamp }));
    });
  } else {
    // Health check endpoint
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ready", port: PORT }));
  }
});

server.listen(PORT, () => {
  console.log("🎯 Webhook Receiver Started");
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log("");
  console.log("Use this URL for webhook testing:");
  console.log(`  http://localhost:${PORT}/webhook`);
  console.log("");
  console.log("Waiting for webhooks...\n");
});
