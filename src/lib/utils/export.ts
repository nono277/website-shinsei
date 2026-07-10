// Export CSV / JSON / Excel côté client, sans dépendance externe.
// L'export "Excel" est une table HTML servie avec le type MIME Excel :
// Excel et LibreOffice l'ouvrent nativement, sans générer de vrai binaire .xlsx.

export type ExportRow = Record<string, string | number>;

function triggerDownload(content: string, filename: string, mime: string) {
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

function csvEscape(value: string | number): string {
	const str = String(value);
	if (/[",\n;]/.test(str)) {
		return '"' + str.replace(/"/g, '""') + '"';
	}
	return str;
}

export function exportCSV(rows: ExportRow[], filename: string) {
	if (rows.length === 0) return;
	const headers = Object.keys(rows[0]);
	const lines = [
		headers.join(';'),
		...rows.map((row) => headers.map((h) => csvEscape(row[h] ?? '')).join(';')),
	];
	const BOM = '﻿';
	triggerDownload(BOM + lines.join('\r\n'), filename, 'text/csv;charset=utf-8');
}

export function exportJSON(data: unknown, filename: string) {
	triggerDownload(JSON.stringify(data, null, 2), filename, 'application/json;charset=utf-8');
}

export function exportExcel(rows: ExportRow[], filename: string) {
	if (rows.length === 0) return;
	const headers = Object.keys(rows[0]);
	const escapeHtml = (v: string | number) =>
		String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

	const table = `
		<table border="1">
			<thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
			<tbody>
				${rows.map((row) => `<tr>${headers.map((h) => `<td>${escapeHtml(row[h] ?? '')}</td>`).join('')}</tr>`).join('')}
			</tbody>
		</table>
	`;
	const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body>${table}</body></html>`;

	triggerDownload(html, filename, 'application/vnd.ms-excel;charset=utf-8');
}
