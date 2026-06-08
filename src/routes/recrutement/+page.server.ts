import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import nodemailer from 'nodemailer';
import { BREVO_SMTP_USER, BREVO_SMTP_PASSWORD } from '$env/static/private';

const DEST = 'shinsei.serv@gmail.com';

function buildEmail(d: Record<string, string>): string {
	return `
═══════════════════════════════════
    CANDIDATURE STAFF — SHINSEI
═══════════════════════════════════

── INFORMATIONS PERSONNELLES ──
Pseudo Minecraft      : ${d.pseudo_mc}
Pseudo Discord        : ${d.pseudo_discord}
Âge                   : ${d.age}
Pays / Fuseau         : ${d.pays}
Disponibilité/semaine : ${d.disponibilite}h

── EXPÉRIENCE ──
Déjà staff ailleurs   : ${d.exp_staff || 'Non'}
Ancienneté Minecraft  : ${d.anciennete_mc}
Connais les RPG       : ${d.connais_rpg}

── MOTIVATION ──
Poste souhaité        : ${d.poste}

Pourquoi SHINSEI ?
${d.pourquoi}

Comment nous a-t-il découverts ?
${d.decouverte || '—'}

Ce qu'il apporterait :
${d.apport}

Compétences pour ce poste :
${d.competences}

── MISES EN SITUATION ──
Joueur insulte un autre :
${d.cas1}

Bug critique découvert :
${d.cas2}

Plainte contre un staff :
${d.cas3}

── DIVERS ──
Questions sur le projet :
${d.questions || '—'}

Autre chose :
${d.autre || '—'}

═══════════════════════════════════
`.trim();
}

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const fields = [
			'pseudo_mc','pseudo_discord','age','pays','disponibilite',
			'exp_staff','anciennete_mc','connais_rpg','pourquoi','decouverte',
			'apport','poste','competences','cas1','cas2','cas3','questions','autre',
		];
		const d: Record<string, string> = {};
		for (const f of fields) d[f] = (data.get(f) as string) ?? '';

		const required = ['pseudo_mc','pseudo_discord','age','pays','disponibilite','anciennete_mc','connais_rpg','pourquoi','apport','poste','competences','cas1','cas2','cas3'];
		for (const f of required) {
			if (!d[f]?.trim()) return fail(400, { error: 'Merci de remplir tous les champs obligatoires.' });
		}

		if (!BREVO_SMTP_PASSWORD) {
			return fail(500, { error: 'Serveur mail non configuré. Contacte un admin.' });
		}

		const transporter = nodemailer.createTransport({
			host: 'smtp-relay.brevo.com',
			port: 587,
			secure: false,
			auth: { user: BREVO_SMTP_USER, pass: BREVO_SMTP_PASSWORD },
		});

		try {
			await transporter.sendMail({
				from:    `"SHINSEI Recrutement" <${BREVO_SMTP_USER}>`,
				to:      DEST,
				subject: `[CANDIDATURE] ${d.poste} — ${d.pseudo_mc}`,
				text:    buildEmail(d),
			});
		} catch (err) {
			console.error('[recrutement] mail error:', err);
			return fail(500, { error: 'Erreur lors de l\'envoi. Réessaie ou contacte-nous sur Discord.' });
		}

		return { success: true };
	},
};
