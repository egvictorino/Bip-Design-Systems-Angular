// ng-packagr no puede leer assets fuera de projects/bip-angular ("Cannot read assets from a
// location outside of the project root"), así que el LICENSE de la raíz se copia al paquete
// publicable después del build — npm lo incluye en el tarball sin que haya un segundo LICENSE
// que mantener en el repo.
const { copyFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
copyFileSync(join(root, 'LICENSE'), join(root, 'dist', 'bip-angular', 'LICENSE'));
