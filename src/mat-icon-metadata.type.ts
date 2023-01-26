
export interface IMatIconMetadata {
  id: string;
  baseIconId: string;
  name: string;
  codepoint: string;
  aliases: string[];
  styles: string[];
  version: string;
  deprecated: boolean;
  tags: string[];
  author: string;
  // extra
  componentName: string;
}


export type IMatIconMetadataMap = Map<string, IMatIconMetadata>;
