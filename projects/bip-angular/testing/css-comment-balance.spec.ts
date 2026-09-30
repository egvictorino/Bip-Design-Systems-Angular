import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findAllCssFiles } from './find-css-files';

const SRC_DIR = resolve(__dirname, '..');

// Regression test for a real bug (bip-design-system React): a comment that reads
// (roughly) "usa --duration-* / --ease-* (ver primitives.css)" with NO space between
// the asterisk and the slash — so its own text embedded a comment-closing sequence
// (the asterisk ending "--duration-*" immediately followed by the slash opening
// "/--ease-*"). Any comment stripper reads that as the terminator, and everything
// after it lands as unescaped raw text in the published bip.css, breaking CSS parsing
// entirely in strict bundlers. Deliberately writing block comments here to describe
// the bug would risk reproducing it, hence the line comments.
//
// Counting comment delimiters catches it: a well-formed file always has an equal
// number of openers and closers; this bug produces one opener before a closer that
// shouldn't be there, so the counts diverge. No valid CSS comment or string literal
// legitimately contains a closing sequence inside a comment's intended body, so this
// has no false-positive risk on correct CSS.
describe('los comentarios CSS del paquete no se auto-cierran a medias', () => {
  const cssFiles = findAllCssFiles(SRC_DIR);
  const OPEN = '/' + '*';
  const CLOSE = '*' + '/';

  for (const filePath of cssFiles) {
    const label = filePath.slice(SRC_DIR.length + 1);
    it(`${label}: cantidad de aperturas y cierres de comentario coincide`, () => {
      const source = readFileSync(filePath, 'utf-8');
      const opens = source.split(OPEN).length - 1;
      const closes = source.split(CLOSE).length - 1;
      expect(
        opens,
        `${label} tiene ${opens} apertura(s) de comentario pero ${closes} cierre(s) — algún ` +
          `comentario probablemente contiene una secuencia de cierre en su propio texto, que ` +
          `lo termina antes de tiempo y deja el resto como CSS crudo sin comentar.`
      ).toBe(closes);
    });
  }
});
