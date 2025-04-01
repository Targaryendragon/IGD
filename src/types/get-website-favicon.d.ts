declare module 'get-website-favicon' {
  export interface FaviconIcon {
    src: string;
    sizes?: string;
    type?: string;
    width?: number;
    height?: number;
  }

  export interface FaviconResponse {
    url: string;
    icons: FaviconIcon[];
  }

  export default function getFavicon(url: string): Promise<FaviconResponse>;
} 