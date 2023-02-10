import {
  debounceFrame$$$,
  debounceTime$$,
  functionI$$,
  IObservable,
  IObserver,
  let$$,
  map$$,
  merge,
  pipe$$,
  share$$,
  share$$$,
  shareRL$$,
  single,
} from '@lirx/core';
import {
  compileReactiveHTMLAsComponentTemplate,
  compileStyleAsComponentStyle,
  createComponent,
  VirtualCustomElementNode,
  VirtualDOMNode,
} from '@lirx/dom';
import { IIconComponent } from '../create-icon-component';
import { MAT_ICONS_METADATA } from '../icons/mat-icons-metadata.constant';
import { IMatIconMetadata } from '../mat-icon-metadata.type';

// @ts-ignore
import html from './mat-icons-search.component.html?raw';
// @ts-ignore
import style from './mat-icons-search.component.scss?inline';

/**
 * COMPONENT: 'mat-icons-search'
 **/

interface IIcon extends IMatIconMetadata {
  readonly $containerRef: IObserver<VirtualDOMNode>;
}

interface IData {
  readonly $inputValue: IObserver<string>;
  readonly inputValue$: IObservable<string>;
  readonly icons$: IObservable<readonly IIcon[]>;
  readonly count$: IObservable<number>;
  readonly total$: IObservable<number>;
  readonly isLoadMoreButtonVisible$: IObservable<boolean>;
  readonly $onClickLoadMoreButton: IObserver<MouseEvent>;
}

export interface IMatIconsSearchComponentConfig {
  element: HTMLElement;
  data: IData;
}

export const MatIconsSearchComponent = createComponent<IMatIconsSearchComponentConfig>({
  name: 'mat-icons-search',
  template: compileReactiveHTMLAsComponentTemplate({
    html,
  }),
  styles: [compileStyleAsComponentStyle(style)],
  init: (node: VirtualCustomElementNode<IMatIconsSearchComponentConfig>): IData => {
    /* LIMIT */
    const limitIncrement: number = 100;
    const [$limit, limit$, getLimit] = let$$<number>(limitIncrement);

    const resetLimit = () => {
      $limit(limitIncrement);
    };

    const increaseLimit = () => {
      $limit(getLimit() + limitIncrement);
    };

    /* INPUT */
    const [$inputValue, inputValue$] = let$$<string>('');

    const inputValueDebounced$ = shareRL$$(debounceTime$$(inputValue$, 500));

    // resets the limit when the input changes
    node.onConnected$(inputValueDebounced$)(resetLimit);

    /* ICONS */
    const allIcons = Array.from(MAT_ICONS_METADATA.values())
      .map((metadata: IMatIconMetadata): IIcon => {
        const loadComponent = (): Promise<IIconComponent> => {
          // return import('@lirx/mdi')
          // return import(`@lirx/mdi/src/icons/${fileName}.mjs`)
          //   .finally(() => new Promise(_ => setTimeout(_, 1000)))
          // return import(new URL(`../icons/${metadata.name}.component`, import.meta.url).href)
          return import('../icons/index')
            .then(_ => _[metadata.componentName] as IIconComponent);
        };

        const $containerRef = (
          container: VirtualDOMNode,
        ): void => {
          loadComponent()
            .then((component: IIconComponent) => {
              requestAnimationFrame(() => {
                component.create().attach(container);
              });
            });
        };

        return {
          ...metadata,
          $containerRef,
        };
      });

    // filter icons
    const filteredIcons$ = share$$(
      map$$(inputValueDebounced$, (inputValue: string): IIcon[] => {
        const reg = new RegExp(inputValue.trim(), 'i');
        return allIcons
          .filter((icon: IIcon): boolean => {
            return reg.test(icon.name)
              || icon.aliases.some(alias => reg.test(alias))
              || icon.tags.some(tag => reg.test(tag))
              ;
          });
      }),
    );

    const count$ = share$$(merge([single(0), map$$(filteredIcons$, _ => _.length)]));
    const total$ = single(allIcons.length);

    // displayed list of icons
    const icons$ = pipe$$(
      functionI$$(
        [filteredIcons$, limit$],
        (icons: IIcon[], limit: number): IIcon[] => {
          return icons.slice(0, limit);
        },
      ),
      [
        debounceFrame$$$(),
        share$$$<IIcon[]>(),
      ],
    );

    /* BUTTON */

    const isLoadMoreButtonVisible$ = functionI$$(
      [limit$, count$],
      (limit: number, count: number): boolean => {
        return limit < count;
      },
    );

    const $onClickLoadMoreButton = increaseLimit;

    return {
      $inputValue,
      inputValue$,
      icons$,
      count$,
      total$,
      isLoadMoreButtonVisible$,
      $onClickLoadMoreButton,
    };
  },
});
