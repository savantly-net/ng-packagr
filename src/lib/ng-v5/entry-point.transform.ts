import { InjectionToken, FactoryProvider, ValueProvider } from 'injection-js';
import { Observable } from 'rxjs/Observable';
import { of as observableOf } from 'rxjs/observable/of';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { map, switchMap, tap } from 'rxjs/operators';
import { pipe } from 'rxjs/util/pipe';
import { BuildGraph } from '../brocc/build-graph';
import { Node } from '../brocc/node';
import { Transform, transformFromPromise } from '../brocc/transform';
import * as log from '../util/log';
import { rimraf } from '../util/rimraf';

export const entryPointTransformFactory = (
  initTsConfig: Transform,
  analyzeTsSources: Transform,
  renderTemplates: Transform,
  renderStylesheets: Transform,
  transformTsSources: Transform,
  compileTs: Transform,
  writeBundles: Transform,
  relocateSourceMaps: Transform,
  writePackage: Transform
): Transform =>
  pipe(
    //tap(() => log.info(`Building from sources for entry point`)),

    transformFromPromise(async graph => {
      // Peek the first entry point from the graph
      const entryPoint = graph.find(node => node.type === 'application/ng-entry-point' && node.state !== 'pending');

      // Clean build directory
      await clean(entryPoint.data.stageDir, entryPoint.data.outDir);
    }),
    // TypeScript sources compilation
    initTsConfig,
    analyzeTsSources,
    renderTemplates,
    renderStylesheets,
    transformTsSources,
    compileTs,
    // After TypeScript: bundling and write package
    pipe(writeBundles, relocateSourceMaps, writePackage)

    //tap(() => log.info(`Built.`))
  );

async function clean(...paths: string[]) {
  log.info('Cleaning build directory');
  for (let path of paths) {
    await rimraf(path);
  }
}

// TODO: transformSources() re-written
// clean
// initTsConfig
// analyzeTsSources (collectTemplateAndStylesheetFiles)
// renderTemplates
// renderStylesheets
// transformTsSources (inlineTemplatesAndStyles)
// compileTs
// writeBundles
//  |- bundleToFesm15
//  |- bundleToFesm5
//  |- bundleToUmd
//  |- bundleToUmdMin
// relocateSourceMaps
// writePackage
//  |- copyStagedFiles (bundles, esm, dts, metadata, sourcemaps)
//  |- writePackageJson
