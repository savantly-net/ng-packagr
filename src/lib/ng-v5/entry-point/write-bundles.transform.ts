import { map, switchMap } from 'rxjs/operators';
import { of as observableOf } from 'rxjs/observable/of';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { pipe } from 'rxjs/util/pipe';
import { BuildGraph } from '../../brocc/build-graph';
import { Node } from '../../brocc/node';
import { Transform } from '../../brocc/transform';
import { writeFlatBundleFiles, FlattenOpts } from '../../flatten/flatten';

export const writeBundlesTransform: Transform = pipe(
  switchMap(graph => {
    const opts: FlattenOpts = {
      entryFile: 'foo/bar',
      outDir: 'dist',
      flatModuleFile: 'foo-bar',
      esmModuleId: '@foo/bar',
      umdModuleId: 'foo-bar',
      umdModuleIds: {},
      embedded: []
    };

    return fromPromise(writeFlatBundleFiles(opts)).pipe(map(() => graph));
  })
);
