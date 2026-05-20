import dns from "dns";
import dnsPromises from "dns/promises";

console.log("Initial DNS servers:", dns.getServers());

console.log("Setting DNS servers to 8.8.8.8 and 1.1.1.1...");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const host = "umesh.ngwlylq.mongodb.net";
try {
  console.log("Resolving SRV records for _mongodb._tcp." + host + "...");
  const srv = await dnsPromises.resolveSrv(`_mongodb._tcp.${host}`);
  console.log("SRV Success:", srv);
} catch (err) {
  console.error("SRV Lookup failed:", err);
}
