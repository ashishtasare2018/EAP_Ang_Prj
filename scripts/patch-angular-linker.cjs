/**
 * Patches @angular/compiler-cli's BabelAstFactory.createLiteral so that negative
 * numeric values (produced when the Angular Linker compiles animate.enter / animate.leave
 * host bindings from PrimeNG 21.1.x) are represented as a UnaryExpression instead of a
 * bare NumericLiteral.  @babel/types rejects `numericLiteral(-1)` because the AST spec
 * requires non-negative values; the correct encoding for -1 is `unaryExpression('-', numericLiteral(1))`.
 *
 * This patch should be removed once Angular 21.x ships a Linker fix upstream.
 */
const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  '@angular',
  'compiler-cli',
  'bundles',
  'linker',
  'babel',
  'index.js',
);

if (!fs.existsSync(target)) {
  console.warn('[patch-angular-linker] Target file not found, skipping:', target);
  process.exit(0);
}

const original = fs.readFileSync(target, 'utf8');
const needle = '      return t.numericLiteral(value);';
const replacement =
  '      return value < 0 ? t.unaryExpression("-", t.numericLiteral(-value)) : t.numericLiteral(value);';

if (!original.includes(needle)) {
  if (original.includes(replacement)) {
    console.log('[patch-angular-linker] Already patched, nothing to do.');
  } else {
    console.warn(
      '[patch-angular-linker] Expected line not found — the package may have changed. Inspect manually:',
      target,
    );
  }
  process.exit(0);
}

const patched = original.replace(needle, replacement);
fs.writeFileSync(target, patched, 'utf8');
console.log('[patch-angular-linker] Patched successfully:', target);
