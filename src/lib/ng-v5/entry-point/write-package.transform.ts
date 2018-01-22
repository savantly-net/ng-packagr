import * as fs from 'fs-extra';
import * as path from 'path';
import { Transform, transformFromPromise } from '../../brocc/transform';
import { writeFlatBundleFiles, FlattenOpts } from '../../flatten/flatten';
import { NgArtefacts } from '../../ng-package-format/artefacts';
import { NgEntryPoint } from '../../ng-package-format/entry-point';
import { NgPackage } from '../../ng-package-format/package';
import { relocateSourceMaps } from '../../sourcemaps/relocate';
import { ensureUnixPath } from '../../util/path';
import { copyFiles } from '../../util/copy';
import * as log from '../../util/log';

export const writePackageTransform: Transform = transformFromPromise(async graph => {
  const artefacts: any = 123;
  const entryPoint: any = 'foo';
  const pkg: any = 'bar';

  // 5. COPY SOURCE FILES TO DESTINATION
  log.info('Copying staged files');
  // TODO: doesn't work any more
  await copyStagedFiles({ artefacts, entryPoint, pkg });

  // 6. WRITE PACKAGE.JSON
  log.info('Writing package metadata');
  const relativeDestPath: string = path.relative(entryPoint.destinationPath, pkg.primary.destinationPath);
  await writePackageJson(entryPoint, {
    main: ensureUnixPath(path.join(relativeDestPath, 'bundles', entryPoint.flatModuleFile + '.umd.js')),
    module: ensureUnixPath(path.join(relativeDestPath, 'esm5', entryPoint.flatModuleFile + '.js')),
    es2015: ensureUnixPath(path.join(relativeDestPath, 'esm2015', entryPoint.flatModuleFile + '.js')),
    typings: ensureUnixPath(`${entryPoint.flatModuleFile}.d.ts`),
    // XX 'metadata' property in 'package.json' is non-standard. Keep it anyway?
    metadata: ensureUnixPath(`${entryPoint.flatModuleFile}.metadata.json`)
  });

  log.success(`Built ${entryPoint.moduleId}`);

  return graph;
});

/**
 * Creates and writes a `package.json` file of the entry point used by the `node_module`
 * resolution strategies.
 *
 * #### Example
 *
 * A consumer of the enty point depends on it by `import {..} from '@my/module/id';`.
 * The module id `@my/module/id` will be resolved to the `package.json` file that is written by
 * this build step.
 * The proprties `main`, `module`, `typings` (and so on) in the `package.json` point to the
 * flattened JavaScript bundles, type definitions, (...).
 *
 * @param entryPoint An entry point of an Angular package / library
 * @param binaries Binary artefacts (bundle files) to merge into `package.json`
 */
export async function writePackageJson(entryPoint: NgEntryPoint, binaries: { [key: string]: string }): Promise<void> {
  log.debug('writePackage');
  const packageJson: any = entryPoint.packageJson;
  // set additional properties
  for (const fieldName in binaries) {
    packageJson[fieldName] = binaries[fieldName];
  }

  packageJson.name = entryPoint.moduleId;

  // keep the dist package.json clean
  // this will not throw if ngPackage field does not exist
  delete packageJson.ngPackage;

  // `outputJson()` creates intermediate directories, if they do not exist
  // -- https://github.com/jprichardson/node-fs-extra/blob/master/docs/outputJson.md
  await fs.outputJson(path.resolve(entryPoint.destinationPath, 'package.json'), packageJson, { spaces: 2 });
}

/**
 * Copies compiled source files from the intermediate working directory to the final locations
 * in the npm package's destination directory.
 */
export async function copyStagedFiles({
  artefacts,
  entryPoint,
  pkg
}: {
  artefacts: NgArtefacts;
  entryPoint: NgEntryPoint;
  pkg: NgPackage;
}): Promise<void> {
  await copyFiles(`${artefacts.stageDir}/bundles/**/*.{js,js.map}`, path.resolve(pkg.dest, 'bundles'));
  await copyFiles(`${artefacts.stageDir}/esm5/**/*.{js,js.map}`, path.resolve(pkg.dest, 'esm5'));
  await copyFiles(`${artefacts.stageDir}/esm2015/**/*.{js,js.map}`, path.resolve(pkg.dest, 'esm2015'));
  await copyFiles(`${artefacts.outDir}/**/*.{d.ts,metadata.json}`, entryPoint.destinationPath);
}
