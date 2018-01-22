import { map } from 'rxjs/operators';
import { pipe } from 'rxjs/util/pipe';
import { Transform } from '../../../brocc/transform';

export const analyseSourcesTransform: Transform = pipe(
  map(graph => {
    // TODO...
    console.log('Analyse sources....');

    return graph;
  })
);
