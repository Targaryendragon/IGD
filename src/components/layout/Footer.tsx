'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 关于我们 */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">关于IGD社区</h3>
            <p className="text-sm">
              IGD社区致力于为独立游戏开发者提供一个交流、学习和分享的平台。我们希望通过社区的力量，帮助更多的开发者实现他们的游戏梦想。
            </p>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tools" className="hover:text-white transition-colors">
                  开发工具
                </Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-white transition-colors">
                  技术文章
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white transition-colors">
                  学习资源
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-white transition-colors">
                  社区讨论
                </Link>
              </li>
            </ul>
          </div>

          {/* 社区准则 */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">社区准则</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/guidelines" className="hover:text-white transition-colors">
                  社区规范
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  隐私政策
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  使用条款
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  联系我们
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} IGD社区. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  );
} 