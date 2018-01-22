import { map } from 'rxjs/operators';
import { pipe } from 'rxjs/util/pipe';
import { Transform } from '../../../brocc/transform';

export const compileNgcTransform: Transform = pipe(
  map(graph => {
    // TODO...
    console.log('compile with ngc....');

    return graph;
  })
);
