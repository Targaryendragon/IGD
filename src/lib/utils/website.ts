import getFavicon, { FaviconIcon } from 'get-website-favicon';

/**
 * 从URL获取网站图标
 * @param url 网站URL
 * @returns 图标URL或null
 */
export async function getWebsiteIcon(url: string): Promise<string | null> {
  try {
    const data = await getFavicon(url);
    if (data && data.icons && data.icons.length > 0) {
      // 优先选择较大尺寸的图标
      const sortedIcons = data.icons.sort((a: FaviconIcon, b: FaviconIcon) => {
        const sizeA = a.width || 0;
        const sizeB = b.width || 0;
        return sizeB - sizeA;
      });
      return sortedIcons[0].src;
    }
  } catch (error) {
    console.error('获取网站图标失败:', error);
  }
  return null;
} 