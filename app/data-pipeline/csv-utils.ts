import { readFileSync } from 'fs';

export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let inQuote = false;
  let field = '';

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && i + 1 < line.length && line[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (ch === ',' && !inQuote) {
      result.push(field);
      field = '';
    } else {
      field += ch;
    }
  }
  result.push(field);
  return result;
}

export function parseCsv(content: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCsvLine(lines[0]).map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h] = (values[i] ?? '').trim();
    });
    return record;
  });

  return { headers, rows };
}

export function readCsv(filePath: string): { headers: string[]; rows: Record<string, string>[] } {
  const content = readFileSync(filePath, 'utf-8');
  return parseCsv(content);
}

export function toCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function writeCsv(headers: string[], rows: Record<string, string>[]): string {
  const headerLine = headers.map(toCsvField).join(',');
  const dataLines = rows.map(row =>
    headers.map(h => toCsvField(row[h] ?? '')).join(',')
  );
  return [headerLine, ...dataLines].join('\n') + '\n';
}
