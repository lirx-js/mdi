import * as $fs from 'fs/promises';
import * as $path from 'path';
import { optimize } from 'svgo';
// const { optimize } = require('svgo');

const ROOT_PATH = $path.dirname(new URL(import.meta.url).pathname);
const SVG_TO_OPTIMIZE_PATH = $path.join(ROOT_PATH, 'mdi-svg-repo', 'svg');
const SVG_PATH = $path.join(ROOT_PATH, 'svg');

const SRC_PATH = $path.join(ROOT_PATH, '..', '..', 'src');
const SRC_ICONS_PATH = $path.join(SRC_PATH, 'icons');

// const LIMIT = 10;
const LIMIT = 1e6;

/*----------------*/

function dashCaseToPascalCase(
  input,
) {
  return input.replace(/(?:^|-)(.)/g, (_, _char) => {
    return _char.toUpperCase();
  });
}

function getComponentTagName(
  name, // dash-case
) {
  return `icon-${name}`;
}

function getComponentName(
  name, // dash-case
) {
  return `Icon${dashCaseToPascalCase(name)}Component`;
}

/*----------------*/


function optimizeSVG(
  sourcePath,
  destinationPath,
) {
  return $fs.readFile(sourcePath, 'utf8')
    .then((content) => {
      return optimize(content, {
        path: sourcePath,
        multipass: true,
      }).data;
    })
    .then((content) => {
      // fix viewBox

      // width
      const widthMatch = (/\s*width="(\d+)"\s*/g).exec(content); // RegExpMatchArray | null
      let width;

      if (widthMatch !== null) {
        content = content.slice(0, widthMatch.index)
          + content.slice(widthMatch.index + widthMatch[0].length);
        width = widthMatch[1];
      }

      // height
      const heightMatch = (/\s*height="(\d+)"\s*/g).exec(content); // RegExpMatchArray | null
      let height;

      if (heightMatch !== null) {
        content = content.slice(0, heightMatch.index)
          + content.slice(heightMatch.index + heightMatch[0].length);
        height = heightMatch[1];
      }

      // viewbox
      const viewBoxMatch = (/viewBox="([^"]+)"/g).exec(content); // RegExpMatchArray | null
      if (viewBoxMatch === null) {
        const svgStart = '<svg xmlns="http://www.w3.org/2000/svg"';
        if (!content.startsWith(svgStart)) {
          throw new Error(`Invalid svg start`);
        }
        const viewBox = `0 0 ${width} ${height}`;
        content = content.slice(0, svgStart.length)
          + ` viewBox="${viewBox}"`
          + content.slice(svgStart.length);
      }

      return content;
    })
    .then((content) => {
      return $fs.writeFile(destinationPath, content);
    });
}

function optimizeSVGFolder(
  sourcePath,
  destinationPath,
) {
  return $fs.readdir(sourcePath)
    .then((fileNames) => {
      return Promise.all(
        fileNames
          .slice(0, LIMIT)
          .map((fileName) => {
            const sourceFilePath = $path.join(sourcePath, fileName);
            const destinationFilePath = $path.join(destinationPath, fileName);
            return optimizeSVG(
              sourceFilePath,
              destinationFilePath,
            );
          }),
      );
    });
}

function importMDI_SVG_REPO(
  destinationPath,
) {
  return optimizeSVGFolder(
    SVG_TO_OPTIMIZE_PATH,
    destinationPath,
  );
}

const SVG_CONTENT_REGEXP = /^<svg([^>]*)>(.*)<\/svg>$/;
const SVG_VIEW_BOX_REGEXP = /viewBox="([^"]*)"/;

function convertSVGToLiRXDOMComponent(
  name, // dash-case
  sourcePath,
  destinationPath,
) {
  return $fs.readFile(sourcePath, 'utf8')
    .then((content) => {
      const componentTagName = getComponentTagName(name);
      const componentName = getComponentName(name);
      const svgContentMatch = SVG_CONTENT_REGEXP.exec(content);

      if (svgContentMatch === null) {
        throw new Error(`Invalid svg`);
      }

      const [, svgAttributes, svgContent] = svgContentMatch;

      const viewBoxMatch = SVG_VIEW_BOX_REGEXP.exec(svgAttributes);

      const viewBox = ((viewBoxMatch === null) || (viewBoxMatch[1] === '0 0 24 24'))
        ? ''
        : JSON.stringify(viewBoxMatch[1]);

      const ts = `
import { createIconComponent } from '../create-icon-component';

/**
 * Component: ${JSON.stringify(componentTagName)}
 */

export const ${componentName} = createIconComponent(
  ${JSON.stringify(componentTagName)},
  ${JSON.stringify(svgContent)},
  ${viewBox}
);
`;

      return $fs.writeFile(destinationPath, ts);
    });
}


function generateLiRXDOMComponentsDemoComponent(
  tsFilePaths,
  destinationPath,
) {
  const names = tsFilePaths
    .map((tsFilePath) => {
      return $path.basename(tsFilePath, '.component.ts');
    });

  const customElementsImport = names
    .map((name) => {
      const componentName = getComponentName(name);
      return `import { ${componentName} } from './${name}.component';`;
    })
    .join('\n');

  const html = names
    .map((name) => {
      const componentTagName = getComponentTagName(name);
      return `<${componentTagName}></${componentTagName}>`;
    })
    .join('\n');

  const customElements = names
    .map((name) => {
      const componentName = getComponentName(name);
      return `${componentName}`;
    })
    .join(',\n');

  const ts = `
import { createComponent, compileReactiveHTMLAsComponentTemplate } from '@lirx/dom';
${customElementsImport}

/**
 * Component: 'mat-icons-demo'
 */

interface IMatIconsDemoComponentConfig {
}

export const MatIconsDemoComponent = createComponent<IMatIconsDemoComponentConfig>({
  name:  'mat-icons-demo',
  template: compileReactiveHTMLAsComponentTemplate({
    html: ${JSON.stringify(html)},
    customElements: [
      ${customElements}
    ],
  }),
});
`;

  const destinationFilePath = $path.join(destinationPath, `mat-icons-demo.component.ts`);
  return $fs.writeFile(destinationFilePath, ts);
}

function generateLiRXDOMComponentsListFile(
  tsFilePaths,
  destinationPath,
) {
  const data = tsFilePaths
    .map((tsFilePath) => {
      const name = $path.basename(tsFilePath, '.component.ts');
      const fileName = `${name}.component`;
      const componentTagName = getComponentTagName(name);
      const componentName = getComponentName(name);

      return [
        fileName,
        componentTagName,
        componentName,
      ];
    });

  const ts = `
export type IMatIconsListItem = [
  fileName: string,
  componentTagName: string,
  componentName: string,
];

export const MAT_ICONS_LIST: IMatIconsListItem[] = ${JSON.stringify(data, null, 2)};
`;

  const destinationFilePath = $path.join(destinationPath, `mat-icons-list.constant.ts`);
  return $fs.writeFile(destinationFilePath, ts);
}

function generateLiRXDOMComponentsIndex(
  tsFilePaths,
  destinationPath,
) {
  const ts = tsFilePaths
      .map((tsFilePath) => {
        return `export * from './${$path.basename(tsFilePath, '.ts')}';`;
      })
      .join('\n') + '\n\n'
    // + `export * from './mat-icons-demo.component';` + '\n';
    + `export * from './mat-icons-list.constant';` + '\n';

  const destinationFilePath = $path.join(destinationPath, `index.ts`);
  return $fs.writeFile(destinationFilePath, ts);
}

function convertSVGFolderToLiRXDOMComponents(
  sourcePath,
  destinationPath,
) {
  return $fs.readdir(sourcePath)
    .then((fileNames) => {
      return Promise.all(
        fileNames
          .map((fileName) => {
            const name = fileName.slice(0, -4);
            const sourceFilePath = $path.join(sourcePath, fileName);
            const destinationFilePath = $path.join(destinationPath, `${name}.component.ts`);
            return convertSVGToLiRXDOMComponent(
              name,
              sourceFilePath,
              destinationFilePath,
            )
              .then(() => {
                return destinationFilePath;
              });
          }),
      )
        .then((tsFilePaths) => {
          console.log('DONE => ', tsFilePaths.length);
          return Promise.all([
            generateLiRXDOMComponentsListFile(
              tsFilePaths,
              destinationPath,
            ),
            generateLiRXDOMComponentsIndex(
              tsFilePaths,
              destinationPath,
            ),
            // generateLiRXDOMComponentsDemoComponent(
            //   tsFilePaths,
            //   destinationPath,
            // ),
          ]);
        });
    });
}

function createEmptyDirectory(
  path,
) {
  return $fs.rm(path, { recursive: true })
    .catch(() => {
    })
    .then(() => {
      return $fs.mkdir(path, { recursive: true });
    });
}

async function main() {
  await createEmptyDirectory(SVG_PATH);
  await importMDI_SVG_REPO(SVG_PATH);

  await createEmptyDirectory(SRC_ICONS_PATH);
  await convertSVGFolderToLiRXDOMComponents(
    SVG_PATH,
    SRC_ICONS_PATH,
  );
}


main();
