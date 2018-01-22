import { map } from 'rxjs/operators';
import { pipe } from 'rxjs/util/pipe';
import { Transform } from '../../../brocc/transform';

export const transformSourcesTransform: Transform = pipe(
  map(graph => {
    // TODO...
    console.log('Transform Sources...');

    return graph;
  })
);
