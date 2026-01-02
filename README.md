# 坦克对战游戏 (Tank Battle Game)

一个基于 Three.js 的 3D 坦克对战游戏，支持玩家控制、AI 对战和多种视觉效果。

![游戏截图](https://img.shields.io/badge/Three.js-3D%20Game-green) ![状态](https://img.shields.io/badge/status-active-success)

## 🎮 游戏特性

### 核心玩法
- **玩家控制**：使用键盘 WASD 控制坦克移动，鼠标瞄准和射击
- **AI 敌方坦克**：智能敌方坦克会自动寻敌、移动和射击
- **盟友系统**：友方 AI 坦克协助玩家作战
- **碰撞检测**：完善的物理碰撞系统，防止坦克卡入建筑物

### 视觉效果
- **爆炸粒子系统**：击中目标时产生炫酷的爆炸效果
- **冒烟效果**：坦克被击中多次后会冒出烟雾
- **多视角切换**：支持上帝视角和第一人称视角切换
- **3D 渲染**：使用 Three.js 实现流畅的 3D 图形

### 游戏机制
- **生命值系统**：玩家、敌人和盟友都有独立的生命值
- **胜利/失败条件**：击败所有敌人获胜，玩家生命值归零则失败
- **边界检测**：防止坦克移出游戏区域

## 🚀 快速开始

### 环境要求
- 现代浏览器（Chrome、Firefox、Edge 等）
- 本地 HTTP 服务器（推荐使用 Python 或 Node.js）

### 运行游戏

#### 方法 1：使用 Python HTTP 服务器
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### 方法 2：使用 Node.js HTTP 服务器
```bash
# 安装 http-server（首次运行）
npm install -g http-server

# 启动服务器
http-server -p 8000
```

#### 方法 3：使用 PowerShell（Windows）
```powershell
# 在项目目录运行
python -m http.server 8000
```

启动服务器后，在浏览器中访问：
```
http://localhost:8000/game_simple.html
```

## 🎯 操作说明

### 玩家控制
- **W**：向前移动
- **S**：向后移动
- **A**：向左移动
- **D**：向右移动
- **鼠标移动**：瞄准方向
- **鼠标左键**：发射炮弹
- **V 键**：切换视角（上帝视角 / 第一人称）
- **R 键**：重新开始游戏

### 游戏目标
- 击败所有红色敌方坦克
- 保护蓝色盟友坦克
- 避免被敌方炮弹击中

## 🛠️ 技术栈

- **HTML5**：游戏结构
- **JavaScript**：游戏逻辑
- **Three.js**：3D 渲染引擎
- **Tailwind CSS**：样式框架
- **Raycaster**：射线检测（鼠标瞄准）

## 📁 项目结构

```
tank/
├── game_simple.html          # 主游戏文件
├── game.html                 # 旧版本游戏文件
├── .gitignore               # Git 忽略文件配置
├── package.json             # Node.js 依赖配置
├── next.config.js           # Next.js 配置
├── tailwind.config.js       # Tailwind CSS 配置
├── tsconfig.json            # TypeScript 配置
├── README.md                # 项目说明文档
├── GitHub上传指南.md        # Git 上传指南
└── upload_to_github.bat     # 自动上传脚本
```

## 🎨 游戏特性详解

### 炮弹发射系统
- 玩家炮弹使用 Raycaster 获取鼠标指向方向
- AI 坦克炮弹沿坦克正前方发射
- 精确的碰撞检测和爆炸效果

### 粒子系统
- **爆炸效果**：30 个随机颜色粒子 + 10 个火光粒子
- **冒烟效果**：被击中 2 次以上的坦克顶部产生上升烟雾
- 粒子物理模拟：速度、重力、透明度衰减

### AI 行为
- 自动寻找最近的敌人
- 智能移动路径规划
- 自动瞄准和射击
- 碰撞避免

## 🔧 开发说明

### 主要函数
- `createTank()`：创建坦克对象
- `shoot()`：发射炮弹
- `updateBullets()`：更新子弹状态
- `updatePlayerTank()`：更新玩家坦克
- `updateEnemyTanks()`：更新敌方坦克
- `updateAllyTanks()`：更新盟友坦克
- `checkCollision()`：碰撞检测
- `resolveCollision()`：碰撞解决
- `createExplosion()`：创建爆炸效果
- `createSmoke()`：创建冒烟效果

### 修改配置
可以在 `game_simple.html` 中调整以下参数：
- 坦克数量
- 生命值
- 移动速度
- 炮弹速度
- 粒子效果参数

## 🐛 已知问题

- [ ] 添加音效系统
- [ ] 优化 AI 寻路算法
- [ ] 添加更多地图元素
- [ ] 支持多人联机模式

## 📝 更新日志

### v1.0.0 (2024)
- ✅ 初始版本发布
- ✅ 实现基础坦克控制
- ✅ 添加 AI 敌人和盟友
- ✅ 实现炮弹发射系统
- ✅ 添加碰撞检测
- ✅ 实现爆炸和冒烟效果
- ✅ 支持多视角切换
- ✅ 修复炮弹发射方向问题
- ✅ 修复坦克卡入建筑物问题

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件

## 👨‍💻 作者

caicaivic0322

## 🙏 致谢

- [Three.js](https://threejs.org/) - 强大的 3D 渲染库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架

## 📮 联系方式

- GitHub: [@caicaivic0322](https://github.com/caicaivic0322)
- 项目地址: https://github.com/caicaivic0322/tank-fight

---

**享受游戏！🎮**
