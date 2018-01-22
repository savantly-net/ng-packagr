import { InjectionToken, Provider, ReflectiveInjector, ValueProvider } from 'injection-js';
import { of as observableOf } from 'rxjs/observable/of';
import { take, map } from 'rxjs/operators';
import { BuildGraph } from '../brocc/build-graph';
import { Node } from '../brocc/node';
import { Transform } from '../brocc/transform';
import { TsConfig } from '../ts/tsconfig';
import { DEFAULT_TS_CONFIG_TOKEN } from './entry-point/ts/init-tsconfig.di';
import { ENTRY_POINT_TRANSFORM, ENTRY_POINT_PROVIDERS } from './entry-point.di';
import { PACKAGE_TRANSFORM } from './package.di';
import { provideProject } from './project.di';

export class NgPackagr {
  private kickOffTransform: InjectionToken<Transform> = PACKAGE_TRANSFORM.provide;

  constructor(private providers: Provider[]) {}

  /** Sets the path to the user's "ng-package" file (either `package.json`, `ng-package.json`, or `ng-package.js`) */
  public forProject(project: string): NgPackagr {
    this.providers.push(provideProject(project));

    return this;
  }

  /** Overwrites the default TypeScript configuration. */
  public withTsConfig(defaultValues: TsConfig): NgPackagr {
    this.providers.push({
      provide: DEFAULT_TS_CONFIG_TOKEN,
      useValue: defaultValues
    });

    return this;
  }

  public withProviders(providers: Provider[]): NgPackagr {
    this.providers = [...this.providers, ...providers];

    return this;
  }

  public withKickOffTransform(transform: InjectionToken<Transform>) {
    this.kickOffTransform = transform;

    return this;
  }

  public build(): Promise<void> {
    const injector = ReflectiveInjector.resolveAndCreate(this.providers);

    // TODO
    const transforms = injector.get(this.kickOffTransform);

    return observableOf(new BuildGraph())
      .pipe(transforms, take(1), map(() => {}))
      .toPromise();
  }
}

export const ngPackagr = (): NgPackagr =>
  new NgPackagr([
    // Add default providers to this list.
    PACKAGE_TRANSFORM,
    ...ENTRY_POINT_PROVIDERS
  ]);
