const { join } = require('path');
const { copy } = require('fs-extra');
const { realpathSync, readFileSync } = require('fs');
const tmp = require('tmp');
const execa = require('execa');
const {
  getTodoStorageFilePath,
  readTodoData,
  todoStorageFileExists,
  writeTodoStorageFile,
} = require('@ember-template-lint/todo-utils');

function createTmpDir() {
  return realpathSync(tmp.dirSync({ unsafeCleanup: true }).name);
}

async function createFixture(srcDir, destDir) {
  await copy(join(__dirname, '__fixtures__', srcDir, '.lint-todo'), join(destDir, '.lint-todo'), {
    recursive: true,
    overwrite: false,
  });
}

describe('migrator', () => {
  let tmp;

  beforeEach(() => {
    tmp = createTmpDir();
  });

  it('skips migrate when no .lint-todo storage directory or file is found', async () => {
    let result = await run(['.']);

    expect(result.stdout).toMatchInlineSnapshot(
      `"⚠ Skipped migration (no .lint-todo directory found)"`
    );
  });

  it('skips migrate when .lint-todo storage file found', async () => {
    writeTodoStorageFile(getTodoStorageFilePath(tmp), []);

    let result = await run(['.']);

    expect(result.stdout).toMatchInlineSnapshot(`"⚠ Skipped migration (.lint-todo file found)"`);
  });

  it('errors when attempting to migrate todos in v1 format', async () => {
    await createFixture('v1', tmp);

    let result = await run(['.']);

    expect(result.stderr).toMatchInlineSnapshot(
      `"✖ Cannot migrate .lint-todo directory to single file format. Version 1 todo format found. Please rerun with the --remove-v1 option or regenerate your todos before migrating."`
    );
    expect(todoStorageFileExists(tmp)).toEqual(false);
  });

  it('can migrate v2 format to single file', async () => {
    await createFixture('v2', tmp);

    let result = await run(['.']);

    expect(result.stdout).toMatchInlineSnapshot(
      `"✔ Successfully migrated 11 todos to single file format"`
    );
    expect(readTodoData(tmp).size).toEqual(11);
    expect(readFileSync(getTodoStorageFilePath(tmp), { encoding: 'utf-8' })).toMatchInlineSnapshot(`
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

  it('can migrate mixed v1 and v2 format to single file when using --removeV1', async () => {
    await createFixture('v1', tmp);
    await createFixture('v2', tmp);

    let result = await run(['.', '--removeV1']);

    expect(result.stdout).toMatchInlineSnapshot(
      `"✔ Successfully migrated 11 todos to single file format (5 version 1 todos were removed)"`
    );
    expect(readTodoData(tmp).size).toEqual(11);
    expect(readFileSync(getTodoStorageFilePath(tmp), { encoding: 'utf-8' })).toMatchInlineSnapshot(`
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

  function run(args = [], options = {}) {
    let defaults = {
      reject: false,
      cwd: tmp,
    };

    return execa(
      process.execPath,
      [require.resolve('../bin/index.js'), ...args],
      Object.assign({}, defaults, options)
    );
  }
});
