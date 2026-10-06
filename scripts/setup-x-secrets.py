#!/usr/bin/env python3
"""User-run secure prompt: no credential arguments, files, or echoed values."""
import getpass
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

NAMES = ('API_KEY', 'API_KEY_SECRET', 'ACCESS_TOKEN', 'ACCESS_TOKEN_SECRET')
ROOT = Path(__file__).resolve().parents[1]

def main():
    if not sys.stdin.isatty():
        raise SystemExit('Run this script yourself in an interactive Terminal.')
    wrangler = shutil.which('wrangler')
    if not wrangler:
        candidate = Path('/Users/awesamarth/Desktop/code/pi-share/node_modules/.bin/wrangler')
        if candidate.is_file():
            wrangler = str(candidate)
    if not wrangler:
        raise SystemExit('Wrangler was not found. Put the installed Wrangler on PATH.')
    print('Enter each value locally. Inputs are hidden; press Ctrl-C to cancel.')
    print('Each value will be stored as a secret for khoon-choos-le-bot.')
    for name in NAMES:
        value = getpass.getpass(name + ': ')
        if not value:
            raise SystemExit('Empty input; stopped before submitting ' + name + '.')
        # Suppress subprocess output and isolate Wrangler debug logs so credentials
        # cannot be echoed or left in the usual persistent Wrangler log directory.
        with tempfile.TemporaryDirectory(prefix='khoon-secret-setup-') as logdir:
            child_env = os.environ.copy()
            child_env['WRANGLER_LOG_PATH'] = logdir
            result = subprocess.run(
                [wrangler, 'secret', 'put', name, '--name', 'khoon-choos-le-bot'],
                input=value + '\n', text=True, cwd=ROOT, env=child_env,
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            )
        value = None
        if result.returncode:
            raise SystemExit('Setup failed for ' + name + '; details suppressed to protect credentials.')
        print('Stored ' + name + '.')
    print('Secret setup complete. No tweet was sent by this script.')

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        raise SystemExit('\nCancelled.')
