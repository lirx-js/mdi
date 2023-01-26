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
    ['size', IIconComponentSize],
    ['color', string],
  ],
}

export type IIconComponent = IComponent<IIconComponentConfig>;

export function createIconComponent(
  name: string,
  svgContent: string,
  viewBox: string = '0 0 24 24',
): IIconComponent {
  return createComponent<IIconComponentConfig>({
    name,
    extends: 'svg',
    namespaceURI: SVG_NAMESPACE_URI_CONSTANT,
    inputs: [
      ['size'],
      ['color'],
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

      const color$ = node.inputs.get$('color');

      color$((value: string): void => {
        element.setAttribute('fill', value);
      });
    },
  });
}
