import { SVG_NAMESPACE_URI_CONSTANT, Component, input, Input, VirtualComponentNode } from '@lirx/dom';

export type IIconComponentSize =
  | undefined
  | null
  | string
  | number
  ;

export interface IIconComponentData {
  readonly size: Input<IIconComponentSize>;
  readonly color: Input<string>;
}

export type IIconComponent = Component<SVGSVGElement, IIconComponentData, object>;

export function createIconComponent(
  name: string,
  svgContent: string,
  viewBox: string = '0 0 24 24',
): IIconComponent {
  return new Component<SVGSVGElement, IIconComponentData, object>({
    name,
    extends: 'svg',
    namespaceURI: SVG_NAMESPACE_URI_CONSTANT,
    componentData: (): IIconComponentData => ({
      size: input<IIconComponentSize>(),
      color: input<string>(),
    }),
    templateData: (node: VirtualComponentNode<SVGSVGElement, IIconComponentData>): void => {
      const element: SVGSVGElement = node.elementNode;

      element.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      element.setAttribute('viewBox', viewBox);
      element.innerHTML = svgContent;

      const size$ = node.input$('size');

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

      const color$ = node.input$('color');

      color$((value: string): void => {
        element.setAttribute('fill', value);
      });
    },
  });
}
