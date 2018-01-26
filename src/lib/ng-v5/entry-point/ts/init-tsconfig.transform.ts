import { ParsedConfiguration } from '@angular/compiler-cli';
import { BuildGraph } from '../../../brocc/build-graph';
import { Node } from '../../../brocc/node';
import { Transform, transformFromPromise } from '../../../brocc/transform';
import { TsConfig, initializeTsConfig } from '../../../ts/tsconfig';

export const initTsConfigTransformFactory = (defaultTsConfig: TsConfig): Transform =>
  transformFromPromise(async graph => {
    console.log('Initialize tsconfig');

    // Peek the first entry point from the graph
    const entryPoint = graph.find(node => node.type === 'application/ng-entry-point' && node.state !== 'pending');

    const tsConfig = initializeTsConfig(defaultTsConfig, entryPoint.data.entryPoint, entryPoint.data.outDir);

    return graph;
  });
