
export interface IMatIconMetadata {
  readonly id: string;
  readonly baseIconId: string;
  readonly name: string;
  readonly codepoint: string;
  readonly aliases: string[];
  readonly styles: string[];
  readonly version: string;
  readonly deprecated: boolean;
  readonly tags: string[];
  readonly author: string;
  // extra
  readonly componentName: string;
}


export type IMatIconMetadataMap = ReadonlyMap<string, IMatIconMetadata>;
