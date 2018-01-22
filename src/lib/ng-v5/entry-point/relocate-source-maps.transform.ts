import { map, switchMap } from 'rxjs/operators';
import { of as observableOf } from 'rxjs/observable/of';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { pipe } from 'rxjs/util/pipe';
import { BuildGraph } from '../../brocc/build-graph';
import { Node } from '../../brocc/node';
import { Transform } from '../../brocc/transform';
import { writeFlatBundleFiles, FlattenOpts } from '../../flatten/flatten';
import { relocateSourceMaps } from '../../sourcemaps/relocate';
import * as log from '../../util/log';

export const relocateSourceMapsTransform: Transform = pipe(
  switchMap(graph => {
    const stageDir = '...';
    const moduleId = '...';

    // 4. SOURCEMAPS: RELOCATE ROOT PATHS
    log.info('Remapping source maps');
    const relocate = relocateSourceMaps(`${stageDir}/+(bundles|esm2015|esm5)/**/*.js.map`, path => {
      let trimmedPath = path;
      // Trim leading '../' path separators
      while (trimmedPath.startsWith('../')) {
        trimmedPath = trimmedPath.substring(3);
      }

      return `ng://${moduleId}/${trimmedPath}`;
    });

    return fromPromise(relocate).pipe(map(() => graph));
  })
);
