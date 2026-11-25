import { spawnSync } from 'child_process';
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { describe, it, expect } from 'vitest';

const SCRIPT = resolve(__dirname, '../../../scripts/visual-docker.sh');

/**
 * Regresión: el script interpolaba `$*` dentro de `bash -c "..."`, así que un
 * `-g "a|b"` se re-parseaba y rompía el comando. Con un `docker` falso en el PATH se
 * comprueba que los args llegan como argv intactos tras `bash`.
 */
describe.skipIf(process.platform === 'win32')('scripts/visual-docker.sh', () => {
  it('pasa los args del usuario intactos (patrones con | y espacios)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'bip-docker-'));
    try {
      const out = join(dir, 'argv');
      const fake = join(dir, 'docker');
      writeFileSync(fake, `#!/usr/bin/env bash\nprintf '%s\\0' "$@" > "${out}"\n`);
      chmodSync(fake, 0o755);

      const result = spawnSync('bash', [SCRIPT, '-g', 'a|b c', '--update-snapshots'], {
        env: { ...process.env, PATH: `${dir}:${process.env['PATH']}` },
        encoding: 'utf-8',
      });
      expect(result.status).toBe(0);

      const argv = readFileSync(out, 'utf-8').split('\0').slice(0, -1);
      expect(argv.slice(-4)).toEqual(['bash', '-g', 'a|b c', '--update-snapshots']);
      expect(argv.join(' ')).toContain('"$@"');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
