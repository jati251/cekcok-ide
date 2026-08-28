declare module 'mammoth' {
  export interface ConversionResult {
    value: string
    messages: Array<{
      type: string
      message: string
    }>
  }

  export interface Options {
    arrayBuffer?: ArrayBuffer
    buffer?: any
    path?: string
    styleMap?: string | string[]
    includeDefaultStyleMap?: boolean
    convertImage?: any
  }

  export namespace images {
    export function imgElement(func: (image: any) => Promise<{ src: string }>): any
  }

  export function convertToHtml(input: Options, options?: any): Promise<ConversionResult>
  export function convertToMarkdown(input: Options, options?: any): Promise<ConversionResult>
  export function extractRawText(input: Options): Promise<ConversionResult>

  const mammoth: {
    convertToHtml: typeof convertToHtml
    convertToMarkdown: typeof convertToMarkdown
    extractRawText: typeof extractRawText
    images: typeof images
  }
  export default mammoth
}

