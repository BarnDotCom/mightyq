import "server-only";
import { config } from "./config";

type Fields = Record<string, unknown>;
type AirtableRecord = { id: string; fields: Fields };

async function call(path: string, init: RequestInit = {}): Promise<unknown> {
  if (!config.airtableToken) throw new Error("AIRTABLE_TOKEN is not set");
  const res = await fetch(`https://api.airtable.com/v0/${config.airtableBase}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.airtableToken}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status}: ${text}`);
  }
  return res.json();
}

export async function createRecord(table: string, fields: Fields): Promise<AirtableRecord> {
  const data = (await call(table, {
    method: "POST",
    body: JSON.stringify({ records: [{ fields }], typecast: true }),
  })) as { records: AirtableRecord[] };
  return data.records[0];
}

export async function updateRecord(table: string, id: string, fields: Fields): Promise<AirtableRecord> {
  return (await call(`${table}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ fields, typecast: true }),
  })) as AirtableRecord;
}

/** Escape a value for use inside an Airtable formula string. */
function q(value: string): string {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

export async function findOne(table: string, field: string, value: string): Promise<AirtableRecord | null> {
  const formula = `LOWER({${field}}) = LOWER(${q(value)})`;
  const data = (await call(
    `${table}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`,
  )) as { records: AirtableRecord[] };
  return data.records[0] ?? null;
}

export async function findByToken(table: string, token: string): Promise<AirtableRecord | null> {
  const formula = `{Token} = ${q(token)}`;
  const data = (await call(
    `${table}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`,
  )) as { records: AirtableRecord[] };
  return data.records[0] ?? null;
}

/** Link to a row in the Airtable app, for the team alert email. */
export function rowUrl(table: string, id: string): string {
  return `https://airtable.com/${config.airtableBase}/${table}/${id}`;
}
