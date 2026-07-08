#!/usr/bin/env python3
"""
Shinsei Control Daemon — écoute sur 127.0.0.1:4242
Gère le démarrage/arrêt du serveur Minecraft via screen.
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
    print(f'[shinsei-control] Daemon sur 127.0.0.1:{PORT}')
    HTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
