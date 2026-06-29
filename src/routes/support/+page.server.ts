import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { BREVO_API_KEY } from '$env/static/private';

const DEST   = 'shinsei.serv@gmail.com';
const SENDER = { name: 'SHINSEI Support', email: DEST };

const CATEGORY_LABELS: Record<string, string> = {
	bug:       'Bug / Erreur technique',
	question:  'Question générale',
	sanction:  'Appel de sanction (ban/mute)',
	paiement:  'Problème de paiement',
	autre:     'Autre',
};

function row(label: string, value: string): string {
	return `<tr>
		<td style="padding:6px 0;color:#6b7280;font-size:13px;width:42%;vertical-align:top;">${label}</td>
		<td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;">${value}</td>
	</tr>`;
}

function block(label: string, value: string): string {
	return `<div style="margin-bottom:16px;">
		<p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">${label}</p>
		<div style="background:#f9fafb;border-left:3px solid #7c3aed;padding:10px 14px;border-radius:0 4px 4px 0;">
			<p style="margin:0;color:#111827;font-size:13px;line-height:1.6;white-space:pre-wrap;">${value}</p>
		</div>
	</div>`;
}

function buildTicketHtml(d: Record<string, string>, ticketId: string): string {
	return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:Arial,sans-serif;">
<div style="max-width:640px;margin:40px auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);">

  <div style="background:#0f0718;padding:32px;text-align:center;">
    <h1 style="margin:0;color:white;font-size:22px;letter-spacing:2px;">NOUVEAU TICKET SUPPORT</h1>
    <p style="margin:8px 0 0;color:#a78bfa;font-size:13px;letter-spacing:1px;">SHINSEI 新世</p>
  </div>

  <div style="padding:24px 32px 0;">
    <div style="background:#7c3aed18;border:1px solid #7c3aed40;border-radius:6px;padding:12px 20px;display:flex;align-items:center;gap:16px;">
      <span style="color:#7c3aed;font-weight:700;font-size:14px;letter-spacing:1px;">TICKET #${ticketId}</span>
      <span style="color:#6b7280;font-size:13px;">·</span>
      <span style="color:#374151;font-size:13px;font-weight:600;">${CATEGORY_LABELS[d.categorie] ?? d.categorie}</span>
    </div>
  </div>

  <div style="padding:24px 32px;">
    <h2 style="color:#7c3aed;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Informations</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      ${row('Pseudo Minecraft', d.pseudo_mc)}
      ${row('Pseudo Discord', d.pseudo_discord)}
      ${row('Email', d.email)}
      ${row('Catégorie', CATEGORY_LABELS[d.categorie] ?? d.categorie)}
    </table>

    <h2 style="color:#7c3aed;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Demande</h2>
    ${block('Objet', d.objet)}
    ${block('Description', d.description)}
  </div>

  <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="margin:0;color:#9ca3af;font-size:12px;">SHINSEI 新世 · Ticket reçu automatiquement</p>
  </div>
</div>
</body></html>`;
}

function buildConfirmationHtml(d: Record<string, string>, ticketId: string): string {
	return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:Arial,sans-serif;">
<div style="max-width:540px;margin:40px auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);">

  <div style="background:#0f0718;padding:32px;text-align:center;">
    <h1 style="margin:0;color:white;font-size:22px;letter-spacing:2px;">TICKET REÇU</h1>
    <p style="margin:8px 0 0;color:#a78bfa;font-size:13px;letter-spacing:1px;">SHINSEI 新世</p>
  </div>

  <div style="padding:32px;">
    <p style="color:#111827;font-size:15px;margin:0 0 16px;">Bonjour <strong>${d.pseudo_mc}</strong>,</p>
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 16px;">
      Ton ticket <strong style="color:#7c3aed;">#${ticketId}</strong> concernant
      <strong>${CATEGORY_LABELS[d.categorie] ?? d.categorie}</strong> a bien été reçu.
    </p>
    <div style="background:#f9fafb;border-left:3px solid #7c3aed;padding:12px 16px;border-radius:0 4px 4px 0;margin-bottom:20px;">
      <p style="margin:0;color:#374151;font-size:13px;font-weight:600;">${d.objet}</p>
    </div>
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Notre équipe traitera ta demande dans les plus brefs délais.
      Tu seras recontacté sur Discord (<strong>${d.pseudo_discord}</strong>).
    </p>
    <div style="background:#7c3aed18;border:1px solid #7c3aed40;border-radius:6px;padding:16px 20px;">
      <p style="margin:0;color:#7c3aed;font-size:13px;">
        Pour toute urgence, rejoins directement notre Discord.
      </p>
    </div>
  </div>

  <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="margin:0;color:#9ca3af;font-size:12px;">SHINSEI 新世 · Ceci est un email automatique, merci de ne pas y répondre</p>
  </div>
</div>
</body></html>`;
}

async function sendMail(to: string, subject: string, html: string): Promise<void> {
	const res = await fetch('https://api.brevo.com/v3/smtp/email', {
		method: 'POST',
		headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
		body: JSON.stringify({ sender: SENDER, to: [{ email: to }], subject, htmlContent: html }),
	});
	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Brevo ${res.status}: ${body}`);
	}
}

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		// Honeypot anti-spam
		if ((data.get('website') as string)?.trim()) return { success: true };

		const fields = ['pseudo_mc', 'pseudo_discord', 'email', 'categorie', 'objet', 'description'];
		const d: Record<string, string> = {};
		for (const f of fields) d[f] = (data.get(f) as string) ?? '';

		for (const f of fields) {
			if (!d[f]?.trim()) return fail(400, { error: 'Merci de remplir tous les champs.' });
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
			return fail(400, { error: 'Adresse email invalide.' });
		}

		if (!Object.keys(CATEGORY_LABELS).includes(d.categorie)) {
			return fail(400, { error: 'Catégorie invalide.' });
		}

		const ticketId = Math.random().toString(36).slice(2, 8).toUpperCase();

		try {
			await sendMail(
				DEST,
				`[TICKET #${ticketId}] ${CATEGORY_LABELS[d.categorie]} — ${d.pseudo_mc}`,
				buildTicketHtml(d, ticketId),
			);
			await sendMail(
				d.email,
				`[SHINSEI] Ton ticket #${ticketId} a bien été reçu`,
				buildConfirmationHtml(d, ticketId),
			);
		} catch (err) {
			console.error('[support] mail error:', err);
			return fail(500, { error: 'Erreur lors de l\'envoi. Réessaie ou contacte-nous sur Discord.' });
		}

		return { success: true };
	},
};
