import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { of as observableOf } from 'rxjs/observable/of';
import { map, switchMap } from 'rxjs/operators';
import { pipe } from 'rxjs/util/pipe';
import { BuildGraph } from './build-graph';

export interface Transform {
  (source$: Observable<BuildGraph>): Observable<BuildGraph>;
}

export interface PromiseBasedTransform {
  (graph: BuildGraph): Promise<BuildGraph | void> | BuildGraph | void;
}

export const transformFromPromise = (transformFn: PromiseBasedTransform): Transform =>
  pipe(
    switchMap(graph => {
      const transformResult = transformFn(graph);

      if (transformResult instanceof Promise) {
        return fromPromise(transformResult).pipe(map(result => (result ? result : graph)));
      } else {
        return observableOf(transformResult ? transformResult : graph);
      }
    })
  );
