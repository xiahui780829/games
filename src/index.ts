import rhythmSnakeHtml from './games/rhythm-snake.html';
import fishFishingYouHtml from './games/fish-fishing-you.html';
import demolitionMasterHtml from './games/demolition-master.html';
// 加新游戏：
// import game3Html from './games/game-3.html';

const GAMES = [
  {
    path: '/rhythm-snake',
    title: '节奏霓虹 · RHYTHM SNAKE',
    desc: '踩着节拍转向的霓虹贪吃蛇，PERFECT 判定 + SOLO 连击',
    html: rhythmSnakeHtml,
  },
  {
    path: '/fish-fishing-you',
    title: '鱼也在钓你 · THE FISH ARE FISHING YOU',
    desc: '你以为你在钓鱼，其实鱼在钓你。假口、耐心，与一个记得你的鱼塘',
    html: fishFishingYouHtml,
  },
  {
    path: '/demolition-master',
    title: '拆楼大师 · DEMOLITION MASTER',
    desc: '炸药有限，邻居就在隔壁。放好炸药，把楼压到红线以下',
    html: demolitionMasterHtml,
  },
  // { path: '/game-3', title: '...', desc: '...', html: game3Html },
];

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/' || path === '/index.html') {
      return htmlResponse(renderHome());
    }

    const game = GAMES.find(g => g.path === path);
    if (game) return htmlResponse(game.html);

    return new Response(render404(), { status: 404, headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
  },
};

function htmlResponse(body) {
  return new Response(body, { headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
}

function renderHome() {
  const cards = GAMES.map(
    g =>
      '<a class="card" href="' + g.path + '">' +
      '<h2>' + g.title + '</h2>' +
      '<p>' + g.desc + '</p>' +
      '<span class="go">进入 →</span>' +
      '</a>'
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>游戲 · 小游戏合集</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #101817; color: #e8efe9;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif;
    padding: 32px 16px;
  }
  main { width: min(720px, 100%); }
  h1 { font-size: 26px; font-weight: 500; letter-spacing: .04em; margin-bottom: 6px; }
  .sub { font-size: 13px; color: #7d8f88; margin-bottom: 28px; }
  .card {
    display: block; text-decoration: none; color: inherit;
    background: #18211f; border: 1px solid rgba(232,239,233,.10);
    border-radius: 14px; padding: 20px 24px; margin-bottom: 14px;
    transition: transform .15s, border-color .15s;
  }
  .card:hover { transform: translateY(-2px); border-color: rgba(232,239,233,.28); }
  .card h2 { font-size: 17px; font-weight: 600; margin-bottom: 8px; }
  .card p { font-size: 13px; line-height: 1.7; color: #a5b5ad; }
  .card .go { display: inline-block; margin-top: 10px; font-size: 12px; color: #6fc2a8; }
</style>
</head>
<body>
<main>
  <h1>games</h1>
  <p class="sub">神秘小游戲</p>
  ${cards}
</main>
</body>
</html>`;
}

function render404() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>404</title>
<style>
  body {
    min-height: 100vh; display: flex; flex-direction: column; gap: 14px;
    align-items: center; justify-content: center;
    background: #101817; color: #e8efe9;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
  }
  a { color: #6fc2a8; font-size: 14px; }
</style>
</head>
<body>
<h1>404</h1>
<p>这片水面下什么都没有。</p>
<a href="/">回到首页</a>
</body>
</html>`;
}
