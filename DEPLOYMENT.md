# Deployment Notes

## 当前推荐方案

当前版本推荐直接部署到 **GitHub Pages**。

原因：

- 项目是纯前端静态站点
- 不依赖 Node 服务
- 不依赖数据库
- 不依赖后端 API
- 最适合公开试玩与作品集展示

## 当前架构

- `index.html` 负责页面结构
- `styles.css` 负责界面样式
- `game.js` 负责游戏逻辑和渲染

## 是否需要后端

当前版本不需要后端。

只有在以下需求出现时才需要：

- 登录 / 用户系统
- 云存档
- 联机对战
- 排行榜
- 战绩
- 实时房间
- 数据统计
- 内容运营后台

## GitHub Pages 方式

仓库可以通过 GitHub Actions 自动发布。

默认 Pages 地址通常为：

`https://yuyangjungle.github.io/three-kingdoms-moba-prototype/`

## 如果首次推送后没有自动上线

请到仓库设置中确认：

1. 打开 `Settings`
2. 进入 `Pages`
3. 在 `Build and deployment` 中选择 `GitHub Actions`

之后再次推送即可自动发布。

如果 Actions 日志里出现 `Resource not accessible by integration`，通常表示：

- 工作流已经可以尝试配置 Pages
- 但仓库当前还没有完成首次 Pages 启用
- 这时需要由仓库所有者在 GitHub 网页端手动开启一次

这属于 GitHub 仓库设置问题，不是前端代码或静态资源本身的问题。
