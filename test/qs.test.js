import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const expressRequire = createRequire(require.resolve('express'));
const bodyParserRequire = createRequire(expressRequire.resolve('body-parser'));

for (const [name, dependencyRequire] of [['express', expressRequire], ['body-parser', bodyParserRequire]]) {
  test(`${name} uses patched qs and handles the CVE-2026-82417 input`, () => {
    const qs = dependencyRequire('qs');
    assert.equal(dependencyRequire('qs/package.json').version, '6.16.0');
    for (const options of [{ plainObjects: true }, { allowPrototypes: true }]) {
      assert.doesNotThrow(() => qs.stringify(qs.parse('x%5Bconstructor%5D%5BisBuffer%5D=y', options)));
    }
    assert.deepEqual(qs.parse('secret=test&nested[value]=ok'), { secret: 'test', nested: { value: 'ok' } });
  });
}
