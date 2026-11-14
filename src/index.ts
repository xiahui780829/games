import rhythmSnakeHtml from './games/rhythm-snake.html';
// 加新游戏：
// import game2Html from './games/game-2.html';

const GAMES = [
  {
    path: '/rhythm-snake',
    title: '节奏霓虹 · RHYTHM SNAKE',
    desc: '踩着节拍转向的霓虹贪吃蛇，PERFECT 判定 + SOLO 连击',
    html: rhythmSnakeHtml,
  },
  // { path: '/game-2', title: '...', desc: '...', html: game2Html },
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
