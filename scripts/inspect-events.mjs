import fs from "fs";

if (fs.existsSync(".env")) {
  fs.readFileSync(".env", "utf-8").split("\n").forEach(line => {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (m) {
      let v = m[2] || "";
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  });
}

const { adminDb } = await import("../src/lib/firebase/admin.ts");

console.log("--- Testing approvalHistory collectionGroup ---");
try {
  const snap1 = await adminDb.collectionGroup("approvalHistory").get();
  console.log("approvalHistory count without order:", snap1.size);
} catch (e) {
  console.error("approvalHistory without order error:", e.message);
}

try {
  const snap2 = await adminDb.collectionGroup("approvalHistory").orderBy("timestamp", "desc").get();
  console.log("approvalHistory count with orderBy:", snap2.size);
} catch (e) {
  console.error("approvalHistory with orderBy error:", e.message);
}

console.log("--- Testing approved events query ---");
try {
  const approvedSnap = await adminDb.collection("events").where("status", "==", "APPROVED").get();
  console.log("Approved events count:", approvedSnap.size);
  approvedSnap.forEach(d => {
    console.log("Approved Event:", d.id, d.data().title, "verifiedBy:", d.data().verifiedBy, "verifiedAt:", d.data().verifiedAt);
  });
} catch (e) {
  console.error("Approved events error:", e.message);
}

process.exit(0);
