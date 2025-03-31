import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('开始添加测试数据...');

    // 清除旧数据
    await prisma.comment.deleteMany();
    await prisma.toolRating.deleteMany();
    await prisma.tool.deleteMany();
    await prisma.article.deleteMany();
    await prisma.user.deleteMany();
    console.log('旧数据已清除');

    // 创建用户
    const passwordHash = await hash('password123', 10);
    
    const admin = await prisma.user.create({
      data: {
        name: '管理员',
        email: 'admin@example.com',
        password: passwordHash,
        isAdmin: true,
      },
    });

    const developer = await prisma.user.create({
      data: {
        name: '开发者小王',
        email: 'dev@example.com',
        password: passwordHash,
      },
    });

    const articleAuthor = await prisma.user.create({
      data: {
        name: '技术博主',
        email: 'writer@example.com',
        password: passwordHash,
      },
    });

    console.log('用户数据已创建');

    // 创建工具
    const unityTool = await prisma.tool.create({
      data: {
        name: 'Unity游戏引擎',
        description: '广泛使用的跨平台游戏开发工具，适合2D和3D游戏',
        content: 'Unity是一个跨平台的游戏引擎，由Unity Technologies开发。\n\n它被广泛用于开发视频游戏、模拟和其他交互式内容，如建筑可视化或动画。\n\nUnity支持2D和3D图形，并提供了一个强大的物理引擎和脚本系统。',
        difficulty: 'INTERMEDIATE',
        officialLink: 'https://unity.com',
        downloadLink: 'https://unity.com/download',
        authorId: admin.id,
        tags: {
          create: [
            { name: '游戏引擎' },
            { name: 'C#' },
            { name: '2D' },
            { name: '3D' }
          ]
        }
      }
    });

    const godotTool = await prisma.tool.create({
      data: {
        name: 'Godot引擎',
        description: '开源的游戏开发平台，非常适合独立开发者',
        content: 'Godot是一个功能丰富的开源游戏引擎。\n\n它提供了一套全面的通用工具，因此用户可以专注于制作游戏，而无需重新发明轮子。\n\nGodot的节点和场景系统非常灵活，允许开发者创建复杂的游戏机制。',
        difficulty: 'BEGINNER',
        officialLink: 'https://godotengine.org',
        downloadLink: 'https://godotengine.org/download',
        authorId: developer.id,
        tags: {
          create: [
            { name: '游戏引擎' },
            { name: 'GDScript' },
            { name: '开源' }
          ]
        }
      }
    });

    const blenderTool = await prisma.tool.create({
      data: {
        name: 'Blender',
        description: '专业的3D创作套件，完全免费且开源',
        content: 'Blender是一款开源的3D创作套件。\n\n它支持整个3D管线——建模、绑定、动画、模拟、渲染、合成和动作捕捉，甚至还包括视频编辑和游戏创建。\n\n尽管功能丰富，但它的学习曲线较陡。',
        difficulty: 'ADVANCED',
        officialLink: 'https://www.blender.org',
        downloadLink: 'https://www.blender.org/download',
        authorId: admin.id,
        tags: {
          create: [
            { name: '3D建模' },
            { name: '动画' },
            { name: '开源' }
          ]
        }
      }
    });

    console.log('工具数据已创建');

    // 创建工具评分
    await prisma.toolRating.createMany({
      data: [
        { userId: developer.id, toolId: unityTool.id, rating: 4 },
        { userId: articleAuthor.id, toolId: unityTool.id, rating: 5 },
        { userId: developer.id, toolId: godotTool.id, rating: 5 },
        { userId: admin.id, toolId: godotTool.id, rating: 4 },
        { userId: articleAuthor.id, toolId: blenderTool.id, rating: 4 },
        { userId: admin.id, toolId: blenderTool.id, rating: 5 }
      ]
    });

    // 创建工具评论
    await prisma.comment.create({
      data: {
        content: 'Unity是一个很棒的引擎，但对于初学者来说可能有点复杂。文档非常详细，社区也很活跃。',
        authorId: developer.id,
        toolId: unityTool.id
      }
    });

    await prisma.comment.create({
      data: {
        content: 'Godot非常适合独立开发者，它的节点系统很直观，值得一试！',
        authorId: articleAuthor.id,
        toolId: godotTool.id
      }
    });

    await prisma.comment.create({
      data: {
        content: 'Blender的学习曲线比较陡，但一旦掌握了基础，它的效率非常高。完全免费且开源是它最大的优势。',
        authorId: admin.id,
        toolId: blenderTool.id
      }
    });

    console.log('工具评分和评论已创建');

    // 创建文章
    const article1 = await prisma.article.create({
      data: {
        title: '如何制作一个小型独立游戏 - 从创意到发布',
        slug: 'how-to-make-a-small-indie-game',
        content: '独立游戏开发是一个既有挑战性又有回报的旅程。作为一名独立开发者，你将负责游戏开发的各个方面，从最初的创意构思到最终的发布和推广。\n\n## 1. 创意构思与规划\n\n### 找到你的创意\n\n每个成功的游戏都始于一个引人入胜的创意。这可能来自你的一次灵感、一个你喜欢的游戏机制、一种独特的美术风格，或者是一个你想要讲述的故事。关键是要找到能够激发你热情的创意，因为独立游戏开发是一个长期的过程。\n\n### 确定游戏范围\n\n作为独立开发者，尤其是第一次开发游戏时，控制好游戏范围是至关重要的。许多项目失败是因为开发者野心太大，最终无法完成。为你的第一个游戏设定一个小的、可实现的目标。\n\n## 2. 原型设计\n\n原型是验证你的游戏创意是否有趣的最快方式。这个阶段的目标是创建一个简单的、可玩的版本，专注于核心游戏机制。\n\n## 3. 制作资源\n\n游戏需要各种资源，包括视觉、音频等。如果你不是专业艺术家，可以考虑使用简约风格或从资源商店购买现成资源。\n\n## 4. 开发与测试\n\n开发过程中，不断进行测试和迭代是关键。让其他人试玩你的游戏，收集反馈并据此改进。\n\n## 5. 发布与营销\n\n最终，将你的游戏发布到各种平台，如Steam、itch.io或应用商店。别忘了做好营销工作，让更多人知道你的游戏。\n\n独立游戏开发是一段充满挑战但也非常有价值的旅程。通过设定现实的目标、关注核心游戏机制、不断迭代改进并建立社区，你可以大大提高项目成功的机会。',
        published: true,
        authorId: articleAuthor.id,
        tags: {
          create: [
            { name: '游戏设计' },
            { name: '开发经验' },
            { name: '项目管理' }
          ]
        }
      }
    });

    const article2 = await prisma.article.create({
      data: {
        title: 'Unity vs Godot: 独立开发者的选择',
        slug: 'unity-vs-godot-indie-developer-choice',
        content: '对于独立游戏开发者来说，选择一个合适的游戏引擎是项目成功的关键因素之一。Unity和Godot是目前最受欢迎的两个选择，但它们各有优缺点。本文将对这两个引擎进行全面比较，帮助你做出最适合自己的选择。\n\n## Unity\n\nUnity已经成为游戏开发行业的标准之一，拥有庞大的用户群体和资源库。\n\n### 优点\n\n- 丰富的学习资源和社区支持\n- 强大的跨平台能力\n- 资产商店提供大量现成资源\n- 行业认可度高，就业机会多\n\n### 缺点\n\n- 免费版本有一些限制\n- 对于小型项目可能过于复杂\n- 较高的硬件要求\n\n## Godot\n\nGodot是一个完全开源的游戏引擎，近年来受到越来越多独立开发者的青睐。\n\n### 优点\n\n- 完全免费和开源\n- 轻量级，对硬件要求低\n- 内置的GDScript语言简单易学\n- 节点系统非常直观\n\n### 缺点\n\n- 社区和资源相对较少（但正在快速增长）\n- 3D功能不如Unity成熟\n- 行业认可度暂时不如Unity\n\n## 如何选择？\n\n选择游戏引擎应该基于以下几个因素：\n\n1. **项目类型**：2D游戏两者都很好，3D游戏Unity更成熟\n2. **团队规模**：小团队或个人开发者可能会喜欢Godot的简单性\n3. **预算**：如果预算有限，Godot是完全免费的选择\n4. **长期目标**：如果考虑就业，Unity可能是更好的选择\n\n无论选择哪个引擎，最重要的是适合你的工作流程和项目需求。两者都是优秀的工具，能够帮助你实现游戏开发的梦想。最好的方法是亲自尝试两个引擎，看看哪一个更符合你的风格。',
        published: true,
        authorId: developer.id,
        tags: {
          create: [
            { name: '游戏引擎' },
            { name: '技术比较' },
            { name: 'Unity' },
            { name: 'Godot' }
          ]
        }
      }
    });

    const article3 = await prisma.article.create({
      data: {
        title: '游戏美术入门：像素艺术指南',
        slug: 'game-art-basics-pixel-art-guide',
        content: '像素艺术是独立游戏中常见的视觉风格，不仅因为其独特的复古美学，还因为它相对容易上手，非常适合艺术资源有限的小型团队。本指南将帮助你了解像素艺术的基础知识，并提供一些入门技巧。\n\n## 什么是像素艺术？\n\n像素艺术是一种数字艺术形式，在这种艺术中，图像在像素级别精确编辑。这种艺术形式源于早期的电子游戏，当时由于硬件限制，艺术家必须在极其有限的像素网格中工作。\n\n## 基本工具\n\n要开始创作像素艺术，你需要以下工具：\n\n- **图像编辑软件**：Aseprite、PyxelEdit或免费的GIMP、Piskel等\n- **绘图板**：可选但推荐，特别是对于更复杂的作品\n- **参考资料**：收集喜欢的像素艺术作品作为灵感来源\n\n## 核心概念\n\n### 1. 有限的调色板\n\n像素艺术通常使用有限的颜色调色板。限制自己使用8-16种颜色可以创造出更具凝聚力的视觉风格，并使你的工作流程更加高效。\n\n### 2. 像素精确放置\n\n在像素艺术中，每个像素都很重要。精确放置每个像素是创造清晰、可读图像的关键。\n\n### 3. 避免混叠\n\n混叠是像素艺术中常见的错误，指的是使用交错像素来创造渐变效果。这通常会使图像看起来杂乱无章。\n\n## 入门技巧\n\n1. **从简单形状开始**：首先尝试创建简单的物体，如树木、武器或工具\n2. **研究光影**：了解如何通过几种深浅色调来表现光源和阴影\n3. **动画基础**：掌握基本的帧动画技术，如走路循环\n4. **参考现实**：即使是风格化的像素艺术，参考现实世界的对象也能提高质量\n\n## 练习项目\n\n以下是一些练习项目，帮助你提高技能：\n\n- 创建一个16x16的角色精灵及其简单动画\n- 设计一组游戏UI元素（按钮、图标等）\n- 制作一个小型游戏场景，如森林或城市街道\n\n像素艺术是一项需要时间和耐心的技能，但也是最容易上手的游戏艺术形式之一。通过不断练习和学习其他艺术家的作品，你将逐渐提高自己的能力，创造出令人印象深刻的游戏视觉效果。',
        published: true,
        authorId: admin.id,
        tags: {
          create: [
            { name: '美术资源' },
            { name: '像素艺术' },
            { name: '教程' }
          ]
        }
      }
    });

    console.log('文章数据已创建');

    // 创建文章评论
    await prisma.comment.create({
      data: {
        content: '非常感谢分享这些宝贵的经验！我正在开发我的第一个游戏，这篇文章给了我很多启发。特别是关于控制游戏范围的建议非常实用。',
        authorId: developer.id,
        articleId: article1.id
      }
    });

    await prisma.comment.create({
      data: {
        content: '我最近从Unity转到了Godot，确实感觉Godot对小项目更友好。节点系统很直观，GDScript也容易上手。不过还是怀念Unity丰富的资源。',
        authorId: admin.id,
        articleId: article2.id
      }
    });

    await prisma.comment.create({
      data: {
        content: '像素艺术一直是我的最爱！这篇指南对初学者非常友好。我想补充一点，使用参考网格可以帮助保持角色比例一致。',
        authorId: articleAuthor.id,
        articleId: article3.id
      }
    });

    console.log('文章评论已创建');

    console.log('所有测试数据添加完成！');
  } catch (error) {
    console.error('添加测试数据时出错:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 