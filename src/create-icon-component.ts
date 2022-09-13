import { createComponent, IComponent, SVG_NAMESPACE_URI_CONSTANT, VirtualCustomElementNode } from '@lirx/dom';

export type IIconComponentSize =
  | undefined
  | null
  | string
  | number
  ;

export interface IIconComponentConfig {
  element: SVGSVGElement;
  inputs: [
    ['size', number | string | undefined],
  ],
}

export function createIconComponent(
  name: string,
  svgContent: string,
  viewBox: string = '0 0 24 24',
): IComponent<IIconComponentConfig> {
  return createComponent<IIconComponentConfig>({
    name,
    extends: 'svg',
    namespaceURI: SVG_NAMESPACE_URI_CONSTANT,
    inputs: [
      ['size'],
    ],
    init: (node: VirtualCustomElementNode<IIconComponentConfig>): void => {
      const element: SVGSVGElement = node.elementNode;

      element.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      element.setAttribute('viewBox', viewBox);
      element.innerHTML = svgContent;

      const size$ = node.inputs.get$('size');

      size$((value: IIconComponentSize): void => {
        if (
          (value === undefined)
          || (value === null)
          || (value === '')
        ) {
          element.removeAttribute('width');
          element.removeAttribute('height');
        } else {
          let size: string;

          if (typeof value === 'number') {
            size = String(value);
          } else {
            size = value;
          }

          element.setAttribute('width', size);
          element.setAttribute('height', size);
        }
      });
    },
  });
}
