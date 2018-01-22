import { readFile } from 'fs-extra';
import { map } from 'rxjs/operators';
import { pipe } from 'rxjs/util/pipe';
import { Transform, transformFromPromise } from '../../../brocc/transform';

export const templateTransform: Transform = transformFromPromise(async graph => {
  console.log('Render templates');

  const templateNodes = graph.filter(node => node.type === 'application/ng-template' && node.state !== 'done');

  await templateNodes.forEach(async templateNode => {
    const sourceFilePath: string = templateNode.data.sourceFilePath;
    const templatePath: string = templateNode.data.templatePath;
    const templateFilePath: string = templateNode.data.templateFilePath;

    templateNode.data.content = await processTemplate(templateFilePath);
  });

  return graph;
});

/**
 * Process a component's template.
 *
 * @param templateFilePath Path of the HTML templatefile, e.g. `/Users/foo/Project/bar/bar.component.html`
 * @return Resolved content of HTML template file
 */
async function processTemplate(templateFilePath: string): Promise<string> {
  return (await readFile(templateFilePath)).toString();
}
