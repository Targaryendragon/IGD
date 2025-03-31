import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">关于我们</h1>
      <p className="text-lg text-gray-600 mb-8">
        IGD社区是一个专为独立游戏开发者打造的中文社区平台，致力于连接中国独立游戏开发者，分享知识、工具和经验。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-4">我们的使命</h2>
          <p className="text-gray-600 mb-4">
            我们的使命是为中国独立游戏开发者创建一个开放、友好、互助的社区，降低游戏开发的入门门槛，促进知识共享与创新，推动中国独立游戏产业的发展。
          </p>
          <p className="text-gray-600">
            我们相信，通过提供高质量的开发资源、实用工具和专业知识，可以帮助更多有创意的开发者将他们的游戏创意变为现实。
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">我们的愿景</h2>
          <p className="text-gray-600 mb-4">
            成为中国最活跃、最具影响力的独立游戏开发社区，培养新一代独立游戏开发者，推动中国独立游戏走向全球舞台。
          </p>
          <p className="text-gray-600">
            我们期望通过社区的力量，让更多优秀的中国独立游戏获得认可和成功，同时促进开发者之间的交流与合作。
          </p>
        </div>
      </div>

      <div className="bg-primary-50 rounded-lg p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">我们提供什么</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-primary-600 text-4xl mb-4">🛠️</div>
            <h3 className="text-xl font-semibold mb-3">开发工具库</h3>
            <p className="text-gray-600">
              收集和评价各类游戏开发工具，包括引擎、设计软件、音效工具等，帮助开发者选择最适合自己项目的工具。
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-primary-600 text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-3">知识资源</h3>
            <p className="text-gray-600">
              提供高质量的教程、文章和经验分享，涵盖游戏设计、编程、美术、音效、营销等各个方面的知识。
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-primary-600 text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-3">开发者社区</h3>
            <p className="text-gray-600">
              连接志同道合的开发者，创建交流、分享和合作的平台，让独立开发不再孤单。
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">我们的团队</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4"></div>
          <h3 className="font-semibold">陈开发</h3>
          <p className="text-gray-600">创始人 & 技术负责人</p>
        </div>
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4"></div>
          <h3 className="font-semibold">林设计</h3>
          <p className="text-gray-600">设计师 & 内容策划</p>
        </div>
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4"></div>
          <h3 className="font-semibold">王社区</h3>
          <p className="text-gray-600">社区经理</p>
        </div>
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4"></div>
          <h3 className="font-semibold">张编辑</h3>
          <p className="text-gray-600">内容编辑</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">社区准则</h2>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-16">
        <ul className="space-y-4 text-gray-600">
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            <p><strong>尊重与包容：</strong>尊重每一位社区成员，不论其背景、经验水平或观点如何。</p>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            <p><strong>知识共享：</strong>鼓励分享知识和经验，帮助他人解决问题，共同成长。</p>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            <p><strong>建设性交流：</strong>提供建设性的反馈和批评，避免无意义的争论和负面评论。</p>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            <p><strong>原创与尊重版权：</strong>尊重知识产权，分享原创内容，合法使用他人作品。</p>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            <p><strong>互助互利：</strong>社区成长依靠每个成员的贡献，鼓励互相帮助和支持。</p>
          </li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold mb-6">联系我们</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">与我们取得联系</h3>
          <p className="text-gray-600 mb-4">
            无论您是有问题需要解答，还是想要合作或提供建议，我们都很乐意听取您的意见。
          </p>
          <div className="space-y-2">
            <p className="flex items-center text-gray-600">
              <span className="mr-2">📧</span>
              <a href="mailto:contact@igd-community.cn" className="text-primary-600 hover:underline">contact@igd-community.cn</a>
            </p>
            <p className="flex items-center text-gray-600">
              <span className="mr-2">🌐</span>
              <span>网站：www.igd-community.cn</span>
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">加入我们</h3>
          <p className="text-gray-600 mb-4">
            我们始终欢迎有才华和热情的开发者加入我们的团队，一起为中国独立游戏开发社区做出贡献。
          </p>
          <Link 
            href="/join-us" 
            className="btn-primary inline-block"
          >
            查看招募职位
          </Link>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">支持我们</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          如果您认可我们的理念和工作，可以通过以下方式支持我们继续为独立游戏开发者提供服务：
        </p>
        <div className="flex justify-center gap-4">
          <button className="btn-primary-outline">
            成为赞助者
          </button>
          <button className="btn-primary">
            捐赠支持
          </button>
        </div>
      </div>
    </div>
  );
} 