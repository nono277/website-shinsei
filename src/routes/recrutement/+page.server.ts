import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { BREVO_API_KEY } from '$env/static/private';

const DEST   = 'shinsei.serv@gmail.com';
const SENDER = { name: 'SHINSEI Recrutement', email: DEST };

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

function buildHtmlEmail(d: Record<string, string>): string {
	return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:Arial,sans-serif;">
<div style="max-width:640px;margin:40px auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);">

  <div style="background:#0f0718;padding:32px;text-align:center;">
    <h1 style="margin:0;color:white;font-size:22px;letter-spacing:2px;">CANDIDATURE STAFF</h1>
    <p style="margin:8px 0 0;color:#a78bfa;font-size:13px;letter-spacing:1px;">SHINSEI 新世</p>
  </div>

  <div style="padding:24px 32px 0;">
    <div style="background:#7c3aed18;border:1px solid #7c3aed40;border-radius:6px;padding:12px 20px;display:inline-block;">
      <span style="color:#7c3aed;font-weight:700;font-size:14px;letter-spacing:1px;">POSTE : ${d.poste.toUpperCase()}</span>
    </div>
  </div>

  <div style="padding:24px 32px;">
    <h2 style="color:#7c3aed;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Informations personnelles</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      ${row('Pseudo Minecraft', d.pseudo_mc)}
      ${row('Pseudo Discord', d.pseudo_discord)}
      ${row('Email', d.email)}
      ${row('Âge', d.age + ' ans')}
      ${row('Pays / Fuseau', d.pays)}
      ${row('Disponibilité / semaine', d.disponibilite + 'h')}
    </table>

    <h2 style="color:#7c3aed;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Expérience</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      ${row('Déjà staff ?', d.exp_staff || 'Non')}
      ${row('Ancienneté Minecraft', d.anciennete_mc)}
      ${row('Connais les RPG ?', d.connais_rpg_full)}
    </table>

    <h2 style="color:#7c3aed;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Motivation</h2>
    ${block('Pourquoi SHINSEI ?', d.pourquoi)}
    ${block('Découverte', d.decouverte || '—')}
    ${block('Ce qu\'il apporterait', d.apport)}
    ${block('Compétences', d.competences)}

    <h2 style="color:#7c3aed;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Mises en situation</h2>
    ${block('Joueur insulte un autre', d.cas1)}
    ${block('Bug critique découvert', d.cas2)}
    ${block('Plainte contre un staff', d.cas3)}

    ${d.questions || d.autre ? `
    <h2 style="color:#7c3aed;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Divers</h2>
    ${d.questions ? block('Questions', d.questions) : ''}
    ${d.autre ? block('Autre', d.autre) : ''}
    ` : ''}
  </div>

  <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="margin:0;color:#9ca3af;font-size:12px;">SHINSEI 新世 · Candidature reçue automatiquement</p>
  </div>
</div>
</body></html>`;
}

function buildConfirmationHtml(d: Record<string, string>): string {
	return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:Arial,sans-serif;">
<div style="max-width:540px;margin:40px auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);">

  <div style="background:#0f0718;padding:32px;text-align:center;">
    <h1 style="margin:0;color:white;font-size:22px;letter-spacing:2px;">CANDIDATURE REÇUE</h1>
    <p style="margin:8px 0 0;color:#a78bfa;font-size:13px;letter-spacing:1px;">SHINSEI 新世</p>
  </div>

  <div style="padding:32px;">
    <p style="color:#111827;font-size:15px;margin:0 0 16px;">Salut <strong>${d.pseudo_mc}</strong>,</p>
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 16px;">
      Ta candidature pour le poste de <strong style="color:#7c3aed;">${d.poste}</strong> a bien été reçue.
      Notre équipe va l'examiner et te recontactera sur Discord (<strong>${d.pseudo_discord}</strong>).
    </p>
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Merci de ta confiance et de ton intérêt pour le projet SHINSEI !
    </p>
    <div style="background:#7c3aed18;border:1px solid #7c3aed40;border-radius:6px;padding:16px 20px;">
      <p style="margin:0;color:#7c3aed;font-size:13px;">
        En attendant, rejoins notre Discord pour suivre l'actualité du serveur.
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

		const fields = [
			'pseudo_mc','pseudo_discord','email','age','pays','disponibilite',
			'exp_staff','anciennete_mc','connais_rpg','connais_rpg_detail',
			'pourquoi','decouverte','apport','poste','competences',
			'cas1','cas2','cas3','questions','autre',
		];
		const d: Record<string, string> = {};
		for (const f of fields) d[f] = (data.get(f) as string) ?? '';

		const required = [
			'pseudo_mc','pseudo_discord','email','age','pays','disponibilite',
			'anciennete_mc','connais_rpg','pourquoi','apport','poste','competences',
			'cas1','cas2','cas3',
		];
		for (const f of required) {
			if (!d[f]?.trim()) return fail(400, { error: 'Merci de remplir tous les champs obligatoires.' });
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
			return fail(400, { error: 'Adresse email invalide (ex : ton@email.com).' });
		}

		d.connais_rpg_full = d.connais_rpg_detail
			? `${d.connais_rpg} — ${d.connais_rpg_detail}`
			: d.connais_rpg;

		try {
			await sendMail(
				DEST,
				`[CANDIDATURE] ${d.poste} — ${d.pseudo_mc}`,
				buildHtmlEmail(d),
			);
			await sendMail(
				d.email,
				`[SHINSEI] Ta candidature a bien été reçue !`,
				buildConfirmationHtml(d),
			);
		} catch (err) {
			console.error('[recrutement] mail error:', err);
			return fail(500, { error: 'Erreur lors de l\'envoi. Réessaie ou contacte-nous sur Discord.' });
		}

		return { success: true };
	},
};
