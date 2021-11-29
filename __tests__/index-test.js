const { join } = require('path');
const { copy } = require('fs-extra');
const { existsSync, realpathSync, readFileSync } = require('fs');
const tmp = require('tmp');
const execa = require('execa');
const {
  writeTodoStorageFile,
  getTodoStorageFilePath,
  readTodoData,
} = require('@ember-template-lint/todo-utils');

function createTmpDir() {
  return realpathSync(tmp.dirSync({ unsafeCleanup: true }).name);
}

async function createFixture(srcDir, destDir) {
  await copy(
    join(__dirname, '__fixtures__', srcDir, '.lint-todo'),
    join(destDir, '.lint-todo'),
    { recursive: true }
  );
}

describe('migrator', () => {
  let tmp;

  beforeEach(() => {
    tmp = createTmpDir();
  });

  it('skips migrate when no .lint-todo storage directory or file is detected', async () => {
    let result = await run();

    expect(result.stdout).toMatchInlineSnapshot(
      `"⚠ Skipped migration (nothing to migrate)"`
    );
  });

  it('skips migrate when .lint-todo storage file detected', async () => {
    writeTodoStorageFile(getTodoStorageFilePath(tmp), []);

    let result = await run();

    expect(result.stdout).toMatchInlineSnapshot(
      `"⚠ Skipped migration (detected .lint-todo file)"`
    );
  });

  it('can migrate v1 format to single file', async () => {
    await createFixture('v1', tmp);

    let result = await run();

    expect(result.stdout).toMatchInlineSnapshot(
      `"✔ Successfully migrated 5 todos to single file format"`
    );
    expect(readTodoData(tmp).size).toEqual(5);
    expect(
readFileSync(getTodoStorageFilePath(tmp), { encoding: 'utf-8' })).
toMatchInlineSnapshot(`
"add|eslint|no-unused-vars|7|9|7|9||1626739200000|||app/components/foo.js
add|eslint|use-isnan|2|7|2|7||1626739200000|||app/utils/util.js
add|eslint|no-unused-vars|1|10|1|10||1626739200000|||app/utils/util.js
add|eslint|no-undef|1|1|1|1||1626739200000|||rule-config.js
add|eslint|no-undef|18|1|18|1||1626739200000|||json-formatter.js
"
`);
  });

  it('can migrate v2 format to single file', async () => {
    await createFixture('v2', tmp);
    debugger;
    let result = await run();

    expect(result.stdout).toMatchInlineSnapshot(
      `"✔ Successfully migrated 11 todos to single file format"`
    );
    expect(readTodoData(tmp).size).toEqual(11);
    expect(
readFileSync(getTodoStorageFilePath(tmp), { encoding: 'utf-8' })).
toMatchInlineSnapshot(`
"add|ember-template-lint|no-implicit-this|30|33|30|33|442958627e2982816f9069d2e7ca91a0361d4088|1629331200000|2493248400000|2493334800000|addon/templates/components/online/page-title.hbs
add|ember-template-lint|no-implicit-this|33|10|33|10|70adc2ff890d35a6823062862e561fe4a777d8d8|1629331200000|2493248400000|2493334800000|addon/templates/components/online/page-title.hbs
add|ember-template-lint|no-curly-component-invocation|33|8|33|8|83dd6f4e363ecf54ac8e333ae0627c0b19c9ccd5|1629331200000|2493248400000|2493334800000|addon/templates/components/online/page-title.hbs
add|ember-template-lint|no-implicit-this|6|44|6|44|959178bb27b91e04c55e8189938100590b3df47a|1629331200000|2493248400000|2493334800000|addon/templates/components/online/page-title.hbs
add|ember-template-lint|no-implicit-this|14|15|14|15|4ec2e9437a1a07be84c3142962251f768c3fb2de|1629331200000|2493248400000|2493334800000|addon/templates/components/enhance-page/option-wrapper.hbs
add|ember-template-lint|no-implicit-this|11|40|11|40|5b542005f60b358357eedea1ed9e5d18060c7f99|1629331200000|2493248400000|2493334800000|addon/templates/components/enhance-page/option-wrapper.hbs
add|ember-template-lint|no-curly-component-invocation|47|13|47|13|72316dcd796a930ef6d843ac042dafe0885f12cb|1629331200000|2493248400000|2493334800000|addon/templates/components/enhance-page/option-wrapper.hbs
add|ember-template-lint|no-implicit-this|31|46|31|46|e32cc9b92fdd7dda1bfef79dbb65d3d85102aeb5|1629331200000|2493248400000|2493334800000|addon/templates/components/common/input-slider.hbs
add|ember-template-lint|no-implicit-this|21|48|21|48|e32cc9b92fdd7dda1bfef79dbb65d3d85102aeb5|1629331200000|2493248400000|2493334800000|addon/templates/components/common/input-slider.hbs
add|ember-template-lint|no-implicit-this|37|6|37|6|3f2abc39f93d5bc0ea6587f9bc39ad323c1f1b46|1629331200000|2493248400000|2493334800000|addon/templates/components/common/input-slider.hbs
add|ember-template-lint|no-implicit-this|26|46|26|46|3f2abc39f93d5bc0ea6587f9bc39ad323c1f1b46|1629331200000|2493248400000|2493334800000|addon/templates/components/common/input-slider.hbs
"
`);
  });

  // it('can migrate mixed v1 and v2 format to single file', () => {});

  function run(args = [], options = {}) {
    let defaults = {
      reject: false,
      cwd: tmp,
    };

    return execa(
      process.execPath,
      [require.resolve('../bin/migrate-todos.js'), ...args],
      Object.assign({}, defaults, options)
    );
  }
});
