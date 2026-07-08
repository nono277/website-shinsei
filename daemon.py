#!/usr/bin/env python3
"""
Shinsei Control Daemon — écoute sur 0.0.0.0:4242
Gère le démarrage/arrêt/commandes du serveur Minecraft via screen.
Protégé par token X-Token. Assure-toi que le port 4242 est bloqué
depuis l'extérieur par le pare-feu VPS (ufw/iptables).
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import subprocess, json, os, traceback

TOKEN      = os.environ.get('CONTROL_TOKEN', '')
SCREEN     = 'shinsei-mc'
WORK_DIR   = '/home/shinsei-serv'
START_CMD  = 'bash start.sh'
LOG_FILE   = '/home/shinsei-serv/logs/latest.log'
PORT       = 4242


def is_running() -> bool:
    r = subprocess.run(['screen', '-list'], capture_output=True, text=True)
    return SCREEN in r.stdout


class Handler(BaseHTTPRequestHandler):

    def auth(self) -> bool:
        return self.headers.get('X-Token', '') == TOKEN

    def read_body(self) -> dict:
        length = int(self.headers.get('Content-Length', 0))
        return json.loads(self.rfile.read(length) or b'{}')

    def do_POST(self):
        if not self.auth():
            self.reply(403, {'ok': False, 'message': 'Token invalide'})
            return

        if self.path == '/start':
            if is_running():
                self.reply(200, {'ok': False, 'message': 'Serveur déjà en cours'})
                return
            subprocess.Popen(
                ['screen', '-dmS', SCREEN] + START_CMD.split(),
                cwd=WORK_DIR,
            )
            self.reply(200, {'ok': True, 'message': 'Démarrage lancé...'})

        elif self.path == '/stop':
            if not is_running():
                self.reply(200, {'ok': False, 'message': 'Serveur déjà arrêté'})
                return
            subprocess.run(['screen', '-S', SCREEN, '-p', '0', '-X', 'stuff', 'stop\r'])
            self.reply(200, {'ok': True, 'message': 'Arrêt en cours...'})

        elif self.path == '/cmd':
            body = self.read_body()
            cmd = body.get('cmd', '').strip()
            if not cmd:
                self.reply(400, {'ok': False, 'message': 'Commande vide'})
                return
            if not is_running():
                self.reply(200, {'ok': False, 'message': 'Serveur arrêté'})
                return
            subprocess.run(['screen', '-S', SCREEN, '-p', '0', '-X', 'stuff', f'{cmd}\r'])
            self.reply(200, {'ok': True, 'message': f'✓ {cmd}'})

        else:
            self.reply(404, {'ok': False, 'message': 'Route inconnue'})

    def do_GET(self):
        if not self.auth():
            self.reply(403, {'ok': False, 'message': 'Token invalide'})
            return

        if self.path == '/status':
            self.reply(200, {'running': is_running()})

        elif self.path == '/logs':
            try:
                with open(LOG_FILE, 'r', errors='replace') as f:
                    lines = f.readlines()
                self.reply(200, {'lines': [l.rstrip() for l in lines[-100:]]})
            except Exception:
                self.reply(200, {'lines': [f'[Erreur: {traceback.format_exc().splitlines()[-1]}]']})

        else:
            self.reply(404, {'ok': False, 'message': 'Route inconnue'})

    def reply(self, code: int, data: dict):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *_): pass  # silence les logs HTTP


if __name__ == '__main__':
    if not TOKEN:
        print('ERREUR: variable CONTROL_TOKEN non définie')
        exit(1)
    print(f'[shinsei-control] Daemon sur 0.0.0.0:{PORT}')
    HTTPServer(('0.0.0.0', PORT), Handler).serve_forever()
