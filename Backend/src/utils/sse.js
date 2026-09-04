const clientsByCompany = new Map();

export function addClient(companyId, clientId, res) {
  if (!clientsByCompany.has(companyId)) clientsByCompany.set(companyId, new Map());
  clientsByCompany.get(companyId).set(clientId, { id: clientId, res });
}

export function removeClient(companyId, clientId) {
  const map = clientsByCompany.get(companyId);
  if (!map) return;
  map.delete(clientId);
  if (map.size === 0) clientsByCompany.delete(companyId);
}

export function broadcastToCompany(companyId, event, data) {
  const map = clientsByCompany.get(companyId);
  if (!map) return;
  const payload = typeof data === "string" ? data : JSON.stringify(data);
  for (const client of map.values()) {
    try {
      client.res.write(`event: ${event}\n`);
      client.res.write(`data: ${payload}\n\n`);
    } catch (err) {
      // ignore
    }
  }
}

export function listClients() {
  const result = {};
  for (const [companyId, map] of clientsByCompany.entries()) result[companyId] = map.size;
  return result;
}
