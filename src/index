// Cloudflare Worker: 节奏霓虹 · RHYTHM SNAKE
// 将原 HTML 游戏包装为 Worker 响应

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // 只处理根路径，其他路径返回 404
  if (url.pathname !== '/' && url.pathname !== '/index.html') {
    return new Response('Not Found', { status: 404 });
  }

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<title>节奏霓虹 · RHYTHM SNAKE</title>
<style>
  /* ============================================================
     基础布局：全屏画布 + DOM 覆盖层（HUD / 面板）
     所有字体使用系统字体栈，零外部依赖
     ============================================================ */
  :root {
    --font: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif;
    --mono: "SF Mono", "Cascadia Mono", Consolas, "Courier New", monospace;
    --neon: #4df3ff;
    --neon2: #ff3ea5;
    --gold: #ffd166;
    --bg: #08070f;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 100%; height: 100%;
    background: var(--bg);
    color: #eaf6ff;
    font-family: var(--font);
    overflow: hidden;
    -webkit-user-select: none; user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  #stage { position: fixed; inset: 0; }
  #game { display: block; width: 100%; height: 100%; }

  /* ---------- HUD ---------- */
  #hud {
    position: fixed; left: 0; right: 0; top: 0;
    padding: 10px 14px 8px;
    display: flex; flex-direction: column; gap: 8px;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(8,7,15,.92) 0%, rgba(8,7,15,.55) 60%, rgba(8,7,15,0) 100%);
    z-index: 5;
  }
  .hud-row {
    display: flex; align-items: center; justify-content: center;
    gap: 14px; flex-wrap: wrap;
  }
  .stat { display: flex; flex-direction: column; align-items: flex-start; min-width: 52px; }
  .stat .k { font-size: 9px; letter-spacing: .18em; color: #6f7fa8; font-family: var(--mono); }
  .stat .v {
    font-size: 17px; font-weight: 700; font-family: var(--mono);
    letter-spacing: .02em; color: #eaf6ff; line-height: 1.15;
    text-shadow: 0 0 10px rgba(77,243,255,.45);
  }
  .stat.hot .v { color: var(--gold); text-shadow: 0 0 14px rgba(255,209,102,.6); }
  .sep { width: 1px; height: 22px; background: rgba(120,150,200,.22); }

  #noise { display: flex; gap: 5px; align-items: center; height: 20px; }
  #noise i {
    font-style: normal; font-size: 19px; line-height: 1;
    color: var(--neon2); text-shadow: 0 0 12px rgba(255,62,165,.85);
    transition: color .18s, opacity .18s, transform .18s;
  }
  #noise i.brk { color: #3a3f52; text-shadow: none; opacity: .5; transform: rotate(-18deg) scale(.85); }
  #armorV { color: var(--gold); }

  #beatbar { display: flex; gap: 7px; justify-content: center; }
  #beatbar i {
    display: block; width: 44px; height: 5px; border-radius: 3px;
    background: #2a3350; opacity: .35;
    box-shadow: inset 0 0 4px rgba(0,0,0,.6);
  }

  #soloTag {
    position: fixed; left: 50%; top: 92px; transform: translateX(-50%) scale(.9);
    font-size: 13px; font-weight: 800; letter-spacing: .34em; font-family: var(--mono);
    color: #fff; opacity: 0; pointer-events: none; z-index: 6;
    text-shadow: 0 0 18px rgba(255,255,255,.9);
    transition: opacity .2s, transform .2s;
  }
  #soloTag.on { opacity: 1; transform: translateX(-50%) scale(1); }

  #muteTag {
    position: fixed; right: 12px; bottom: 10px; z-index: 6;
    font-size: 10px; letter-spacing: .2em; font-family: var(--mono);
    color: #6f7fa8; pointer-events: none;
  }

  /* ---------- 面板 ---------- */
  #overlay {
    position: fixed; inset: 0; z-index: 10;
    display: flex; align-items: center; justify-content: center;
    background: rgba(8,7,15,.78);
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
    transition: opacity .25s;
  }
  #overlay.hidden { opacity: 0; pointer-events: none; }
  .panel {
    width: min(560px, 92vw);
    max-height: 92vh; overflow: auto;
    padding: 26px 30px 24px;
    border-radius: 18px;
    background: linear-gradient(160deg, rgba(22,18,44,.96), rgba(10,9,22,.96));
    border: 1px solid rgba(120,160,255,.22);
    box-shadow: 0 0 60px rgba(77,243,255,.14), 0 0 140px rgba(255,62,165,.10), inset 0 0 40px rgba(77,243,255,.05);
    text-align: center;
    animation: pop .28s cubic-bezier(.2,.9,.3,1.2);
  }
  @keyframes pop { from { transform: scale(.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .title {
    font-size: 30px; font-weight: 900; letter-spacing: .06em;
    background: linear-gradient(92deg, #4df3ff, #b47cff 45%, #ff3ea5);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    filter: drop-shadow(0 0 16px rgba(120,200,255,.35));
  }
  .sub { margin-top: 6px; font-size: 12px; letter-spacing: .26em; color: #7b8bb5; font-family: var(--mono); }
  .rules { margin: 18px auto 4px; text-align: left; max-width: 430px; font-size: 13px; line-height: 1.85; color: #b9c8e8; }
  .rules b { color: #4df3ff; font-weight: 700; }
  .rules .g { color: var(--gold); }
  .rules .r { color: #ff5d7a; }
  .rules .p { color: #b47cff; }
  .btn {
    margin-top: 20px; cursor: pointer; border: 0;
    padding: 13px 30px; border-radius: 999px;
    font-family: var(--font); font-size: 15px; font-weight: 800; letter-spacing: .1em;
    color: #06121c;
    background: linear-gradient(92deg, #4df3ff, #7ce7ff 40%, #ff8fd0);
    box-shadow: 0 0 24px rgba(77,243,255,.5), 0 6px 18px rgba(0,0,0,.45);
    transition: transform .12s, box-shadow .2s, filter .2s;
  }
  .btn:hover { transform: translateY(-2px); filter: brightness(1.08); }
  .btn:active { transform: translateY(1px) scale(.98); }
  .hint { margin-top: 12px; font-size: 11px; color: #5f6d92; font-family: var(--mono); letter-spacing: .08em; }

  .grade {
    font-size: 74px; font-weight: 900; line-height: 1; margin: 6px 0 2px;
    font-family: var(--mono);
    text-shadow: 0 0 30px currentColor;
  }
  .grid2 {
    margin: 16px auto 0; display: grid; grid-template-columns: repeat(2, 1fr);
    gap: 8px 18px; max-width: 420px; font-size: 13px;
  }
  .grid2 div { display: flex; justify-content: space-between; padding: 5px 10px;
    background: rgba(120,160,255,.07); border-radius: 8px; }
  .grid2 span:first-child { color: #7b8bb5; font-family: var(--mono); font-size: 11px; letter-spacing: .1em; }
  .grid2 span:last-child { font-family: var(--mono); font-weight: 700; }
  .paused-title { font-size: 40px; font-weight: 900; letter-spacing: .3em; color: #4df3ff;
    text-shadow: 0 0 30px rgba(77,243,255,.6); }
</style>
</head>
<body>
<div id="stage">
  <canvas id="game"></canvas>

  <div id="hud">
    <div class="hud-row">
      <div class="stat"><span class="k">SCORE</span><span class="v" id="vScore">0</span></div>
      <div class="sep"></div>
      <div class="stat"><span class="k">COMBO</span><span class="v" id="vCombo">0</span></div>
      <div class="stat"><span class="k">MULT</span><span class="v" id="vMult">×1</span></div>
      <div class="sep"></div>
      <div class="stat"><span class="k">ACC</span><span class="v" id="vAcc">--</span></div>
      <div class="sep"></div>
      <div class="stat"><span class="k">BPM</span><span class="v" id="vBpm">96</span></div>
      <div class="stat"><span class="k">LEVEL</span><span class="v" id="vLevel">1</span></div>
      <div class="sep"></div>
      <div class="stat"><span class="k">NOISE</span><span id="noise"><i>♪</i><i>♪</i><i>♪</i></span></div>
      <div class="stat"><span class="k">ARMOR</span><span class="v" id="armorV">0</span></div>
    </div>
    <div id="beatbar"><i></i><i></i><i></i><i></i></div>
  </div>

  <div id="soloTag">★ S O L O ★</div>
  <div id="muteTag">M: MUTE</div>

  <div id="overlay">
    <!-- 封面 / 暂停 / 结算 共用容器，内容由 JS 注入 -->
    <div class="panel" id="panel"></div>
  </div>
</div>

<script>
(function () {
  'use strict';

  /* ============================================================================
   * CONFIG —— 所有可调参数集中在此，方便平衡性调整
   * ==========================================================================*/
  const CONFIG = {
    GRID: 21,                 // 棋盘边长（格）
    BASE_BPM: 96,
    MAX_BPM: 168,
    BPM_PER_LEVEL: 6,         // 每级 +6 BPM
    BPM_COMBO_STEP: 8,        // 每 8 COMBO 额外 +2 BPM（上限 +18）
    BPM_COMBO_MAX_BONUS: 18,

    // 判定窗：以基准速度下的毫秒值反推成拍长比例，随 BPM 等比缩放（原因见 doStep() 判定处注释）
    WINDOW_REF_BPM: 96,       // 判定窗基准速度：此 BPM 下的窗口就是下面两个毫秒值
    PERFECT_MS_REF: 120,      // 基准速度下的 PERFECT 半窗（96 BPM → ±120ms）
    GOOD_MS_REF: 260,         // 基准速度下的 GOOD 半窗；必须 < 基准半拍 625/2=312.5 才能留出 MISS 死区

    MAX_NOISE: 3,
    NOTE_MIN: 3,              // 场上普通音符保底数量
    SOLO_NOTE_MIN: 6,         // SOLO 期间翻倍
    DOWNBEAT_LIFE: 8,         // 强拍音符存活拍数
    CHORD_INTERVAL: 16,       // 每 16 拍生成一个和弦音符
    CHORD_LIFE: 16,
    MAX_ARMOR: 3,

    SCORE_NOTE: 10,
    SCORE_NOTE_SOLO: 20,
    SCORE_DOWNBEAT: 35,
    SCORE_CHORD: 25,
    PERFECT_BONUS: 15,
    SCORE_PER_LEVEL: 400,
    MAX_LEVEL: 10,

    SOLO_COMBO_STEP: 16,      // COMBO 为 16 的倍数且 >=16 时触发
    SOLO_BEATS: 8,            // 持续 8 拍
    SOLO_MULT: 3,             // 得分 ×3

    GLITCH_TIME: 0.42,        // MISS 时故障特效时长（秒）
  };

  const STATE = { MENU: 'MENU', PLAYING: 'PLAYING', PAUSED: 'PAUSED', GAMEOVER: 'GAMEOVER' };
  const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif';
  const MONO = '"SF Mono", "Cascadia Mono", Consolas, "Courier New", monospace';

  /* ============================================================================
   * UTILS —— 通用小工具
   * ==========================================================================*/
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const randInt = (n) => Math.floor(Math.random() * n);
  const hsl = (h, s, l, a) => 'hsla(' + ((h % 360) + 360) % 360 + ',' + s + '%,' + l + '%,' + a + ')';
  const cellKey = (x, y) => x + ',' + y;

  /** 沿折线按弧长取点；超出末端时钳制到最后一个点（尾巴 taper 依赖该行为） */
  function pointAtArc(P, d) {
    if (P.length === 0) return { x: 0, y: 0 };
    if (P.length === 1) return { x: P[0].x, y: P[0].y };
    let acc = 0;
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[i], b = P[i + 1];
      const seg = Math.hypot(b.x - a.x, b.y - a.y);
      if (seg <= 0.00001) continue;
      if (acc + seg >= d) {
        const k = clamp((d - acc) / seg, 0, 1);
        return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
      }
      acc += seg;
    }
    return { x: P[P.length - 1].x, y: P[P.length - 1].y };
  }

  /* ============================================================================
   * AUDIO —— 纯 WebAudio 程序合成鼓机 / 音效（无任何外部音频文件）
   * ==========================================================================*/
  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.noiseBuf = null;
      this.muted = false;
      this.timer = null;
      this.stepTime = 0;      // 调度游标（音频时间）
      this.stepIndex = 0;     // 调度游标（拍号）
      this.bar = 0;
    }

    /** 必须在用户手势后调用（浏览器自动播放策略） */
    init() {
      if (this.ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.85;
      this.master.connect(this.ctx.destination);
      this.noiseBuf = this._makeNoise(1.2);
      return true;
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }

    get time() { return this.ctx ? this.ctx.currentTime : 0; }

    _makeNoise(sec) {
      const sr = this.ctx.sampleRate;
      const buf = this.ctx.createBuffer(1, Math.floor(sr * sec), sr);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return buf;
    }

    _noise() {
      const s = this.ctx.createBufferSource();
      s.buffer = this.noiseBuf;
      s.loop = true;
      s.playbackRate.value = rand(0.9, 1.1);
      return s;
    }

    setMuted(m) {
      this.muted = m;
      if (this.master) {
        const t = this.time;
        this.master.gain.cancelScheduledValues(t);
        this.master.gain.setTargetAtTime(m ? 0.0001 : 0.85, t, 0.02);
      }
    }

    /* ---------------- 鼓机 ---------------- */
    kick(t, vel) {
      const c = this.ctx;
      const o = c.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(135, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.11);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.95 * vel, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0008, t + 0.30);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + 0.34);
    }

    snare(t, vel) {
      const c = this.ctx;
      const src = this._noise();
      const bp = c.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.value = 1850; bp.Q.value = 0.85;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.42 * vel, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0008, t + 0.17);
      src.connect(bp); bp.connect(g); g.connect(this.master);
      src.start(t); src.stop(t + 0.2);
      // 一点音色实体感
      const o = c.createOscillator(); o.type = 'triangle';
      o.frequency.setValueAtTime(210, t);
      o.frequency.exponentialRampToValueAtTime(140, t + 0.09);
      const g2 = c.createGain();
      g2.gain.setValueAtTime(0.0001, t);
      g2.gain.exponentialRampToValueAtTime(0.16 * vel, t + 0.004);
      g2.gain.exponentialRampToValueAtTime(0.0008, t + 0.11);
      o.connect(g2); g2.connect(this.master);
      o.start(t); o.stop(t + 0.13);
    }

    hat(t, vel) {
      const c = this.ctx;
      const src = this._noise();
      const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7600;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.14 * vel, t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0006, t + 0.045);
      src.connect(hp); hp.connect(g); g.connect(this.master);
      src.start(t); src.stop(t + 0.06);
    }

    bass(t, freq, dur, vel) {
      const c = this.ctx;
      const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = freq;
      const lp = c.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1400, t);
      lp.frequency.exponentialRampToValueAtTime(420, t + dur * 0.8);
      lp.Q.value = 4;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.30 * vel, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      o.connect(lp); lp.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + dur + 0.05);
    }

    /* ---------------- 交互音效 ---------------- */
    _blip(t, freq, dur, type, vol) {
      const c = this.ctx;
      const o = c.createOscillator(); o.type = type || 'triangle';
      o.frequency.setValueAtTime(freq, t);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + dur + 0.03);
    }

    /** 吃到普通音符：随 COMBO 阶梯升高的上行琶音（最多 8 级） */
    sfxEat(step) {
      const t = this.time + 0.001;
      const scale = [523.25, 587.33, 659.25, 783.99, 880, 987.77, 1174.66, 1318.51];
      const base = scale[clamp(step, 0, 7)];
      this._blip(t, base, 0.10, 'triangle', 0.22);
      this._blip(t + 0.045, base * 1.25, 0.10, 'triangle', 0.16);
      this._blip(t + 0.09, base * 1.5, 0.13, 'triangle', 0.13);
    }

    /** 强拍音符：厚和弦 + 低频 BOOM */
    sfxDownbeat() {
      const t = this.time + 0.001;
      const root = 130.81;
      [1, 1.5, 2, 3].forEach((m, i) => this._blip(t + i * 0.012, root * m, 0.5, 'triangle', 0.16));
      const c = this.ctx;
      const o = c.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(95, t);
      o.frequency.exponentialRampToValueAtTime(32, t + 0.5);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.9, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0008, t + 0.6);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + 0.65);
    }

    /** 和弦音符：明亮大三和弦 */
    sfxChord() {
      const t = this.time + 0.001;
      const f = [659.25, 830.61, 987.77, 1318.51];
      f.forEach((x, i) => {
        this._blip(t + i * 0.02, x, 0.7, 'sine', 0.18);
        this._blip(t + i * 0.02, x * 2, 0.45, 'triangle', 0.07);
      });
    }

    /** GOOD：比 PERFECT 更收敛的短促 ping（青色判定） */
    sfxGood() {
      const t = this.time + 0.001;
      const c = this.ctx;
      [1046.5, 1568].forEach((f, i) => {
        const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const g = c.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.11 / (i + 1), t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0006, t + 0.2);
        o.connect(g); g.connect(this.master);
        o.start(t); o.stop(t + 0.22);
      });
    }

    /** PERFECT：明亮金属泛音 ping */
    sfxPerfect() {
      const t = this.time + 0.001;
      const c = this.ctx;
      [1568, 2349, 3136].forEach((f, i) => {
        const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const g = c.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.16 / (i + 1), t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0006, t + 0.34 - i * 0.08);
        o.connect(g); g.connect(this.master);
        o.start(t); o.stop(t + 0.36);
      });
      const src = this._noise();
      const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5000;
      const g = c.createGain();
      g.gain.setValueAtTime(0.10, t);
      g.gain.exponentialRampToValueAtTime(0.0006, t + 0.05);
      src.connect(hp); hp.connect(g); g.connect(this.master);
      src.start(t); src.stop(t + 0.07);
    }

    /** MISS：噪声 + 下行滤波扫频 + 低频砸音 */
    sfxMiss() {
      const t = this.time + 0.001;
      const c = this.ctx;
      const src = this._noise();
      const lp = c.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.setValueAtTime(2400, t);
      lp.frequency.exponentialRampToValueAtTime(180, t + 0.4);
      lp.Q.value = 6;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.34, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0008, t + 0.42);
      src.connect(lp); lp.connect(g); g.connect(this.master);
      src.start(t); src.stop(t + 0.45);
      const o = c.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(120, t);
      o.frequency.exponentialRampToValueAtTime(48, t + 0.3);
      const g2 = c.createGain();
      g2.gain.setValueAtTime(0.0001, t);
      g2.gain.exponentialRampToValueAtTime(0.4, t + 0.008);
      g2.gain.exponentialRampToValueAtTime(0.0008, t + 0.35);
      o.connect(g2); g2.connect(this.master);
      o.start(t); o.stop(t + 0.38);
    }

    sfxArmorBreak() {
      const t = this.time + 0.001;
      this._blip(t, 1046, 0.25, 'square', 0.10);
      this._blip(t + 0.06, 784, 0.3, 'square', 0.09);
      const c = this.ctx;
      const src = this._noise();
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 2;
      const g = c.createGain();
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.0006, t + 0.22);
      src.connect(bp); bp.connect(g); g.connect(this.master);
      src.start(t); src.stop(t + 0.24);
    }

    sfxLevelUp() {
      const t = this.time + 0.001;
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        this._blip(t + i * 0.07, f, 0.22, 'triangle', 0.2));
    }

    sfxSolo() {
      const t = this.time + 0.001;
      [392, 523.25, 659.25, 830.61, 1046.5].forEach((f, i) =>
        this._blip(t + i * 0.055, f, 0.5, 'sawtooth', 0.10));
    }

    /** GAME OVER：下行扫频 + 多次延时制造"混响感" */
    sfxGameOver() {
      const t = this.time + 0.001;
      const c = this.ctx;
      const mk = (when, vol) => {
        const o = c.createOscillator(); o.type = 'sawtooth';
        o.frequency.setValueAtTime(420, when);
        o.frequency.exponentialRampToValueAtTime(38, when + 1.3);
        const lp = c.createBiquadFilter(); lp.type = 'lowpass';
        lp.frequency.setValueAtTime(2200, when);
        lp.frequency.exponentialRampToValueAtTime(300, when + 1.3);
        const g = c.createGain();
        g.gain.setValueAtTime(0.0001, when);
        g.gain.exponentialRampToValueAtTime(vol, when + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0006, when + 1.4);
        o.connect(lp); lp.connect(g); g.connect(this.master);
        o.start(when); o.stop(when + 1.45);
      };
      mk(t, 0.34); mk(t + 0.26, 0.18); mk(t + 0.52, 0.10); mk(t + 0.8, 0.05);
    }

    /* ---------------- 调度器：每 25ms 预调度 0.1s 内的鼓点 ----------------
     * 用 audioCtx.currentTime 做主时钟，避免 setInterval 直接驱动游戏逻辑造成的漂移。
     * 这里只负责"提前把音频事件排进音频线程"，游戏逻辑由 RAF 循环对齐同一时间轴。
     */
    startScheduler() {
      this.stopScheduler();
      this.timer = setInterval(() => this._tick(), 25);
    }
    stopScheduler() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; }
    }
    syncCursor(time, index) { this.stepTime = time; this.stepIndex = index; }

    _tick() {
      if (!this.ctx) return;
      const sd = Game.stepDur;
      const horizon = this.ctx.currentTime + 0.1;
      let guard = 0;
      while (this.stepTime < horizon && guard++ < 64) {
        const t = this.stepTime;
        const i = this.stepIndex;
        const inBar = i % 4;
        this.kick(t, inBar === 0 ? 1.0 : 0.82);
        if (inBar === 1 || inBar === 3) this.snare(t, inBar === 1 ? 1.0 : 0.85);
        this.hat(t, 0.9);
        this.hat(t + sd * 0.5, 0.5);
        if (Game.solo.active) {           // SOLO：加入十六分音符 hi-hat
          this.hat(t + sd * 0.25, 0.42);
          this.hat(t + sd * 0.75, 0.42);
        }
        const root = BASS_ROOTS[(Math.floor(i / 4)) % BASS_ROOTS.length];
        const pat = BASS_PATTERN[inBar];
        this.bass(t, root * pat.mul, sd * pat.len, pat.vel);
        if (inBar === 2) this.bass(t + sd * 0.5, root * BASS_PATTERN[1].mul * 2, sd * 0.4, 0.6);
        this.stepTime += sd;
        this.stepIndex++;
      }
    }
  }

  // 贝斯：A 小调根音走向（每小节变化）+ 拍内节奏型
  const BASS_ROOTS = [55.0, 55.0, 65.41, 73.42, 49.0, 55.0, 61.74, 82.41];
  const BASS_PATTERN = [
    { mul: 1, len: 0.9, vel: 1.0 },
    { mul: 1, len: 0.45, vel: 0.7 },
    { mul: 1.5, len: 0.8, vel: 0.95 },
    { mul: 1.25, len: 0.5, vel: 0.7 }
  ];

  const audio = new AudioEngine();

  /* ============================================================================
   * GAME STATE
   * ==========================================================================*/
  const Game = {
    state: STATE.MENU,
    snake: [],            // [0] = 头，末尾 = 尾（同时也是渲染用的有序路径）
    tailGhost: { x: 0, y: 0 }, // 上一步刚刚腾出的格子（用于尾巴平滑收缩）
    dir: { x: 1, y: 0 },
    pendingDir: null,     // 本拍内最后一次有效方向输入
    pendingTime: 0,       // 该输入的音频时间戳
    grow: 0,
    foods: [],            // {x,y,type,life,maxLife,spin}
    score: 0, combo: 0, maxCombo: 0, level: 1, bpm: CONFIG.BASE_BPM,
    armor: 0, noise: 0,
    counts: { perfect: 0, good: 0, miss: 0, hold: 0 },
    stepIndex: 0,         // 已执行的拍序号
    nextStepTime: 0,      // 下一拍的音频时间
    lastStepTime: 0,      // 上一拍的音频时间（渲染插值基准）
    stepDur: 60 / CONFIG.BASE_BPM,
    solo: { active: false, left: 0 },
    beatPulse: 0, hue: 200, hueTarget: 200,
    particles: [], rings: [], floaters: [],
    glitch: 0, shake: 0, flash: 0, ripple: 0,
    overReason: '',
    menuT: 0
  };

  function comboMult(combo) {
    if (combo >= 44) return 4;
    if (combo >= 28) return 3;
    if (combo >= 16) return 2;
    if (combo >= 8) return 1.5;
    return 1;
  }

  function updateTempo() {
    Game.level = Math.min(CONFIG.MAX_LEVEL, 1 + Math.floor(Game.score / CONFIG.SCORE_PER_LEVEL));
    const comboBonus = Math.min(CONFIG.BPM_COMBO_MAX_BONUS,
      Math.floor(Game.combo / CONFIG.BPM_COMBO_STEP) * 2);
    const bpm = Math.min(CONFIG.MAX_BPM,
      CONFIG.BASE_BPM + (Game.level - 1) * CONFIG.BPM_PER_LEVEL + comboBonus);
    Game.bpm = Math.round(bpm);
    Game.stepDur = 60 / Game.bpm;
  }

  /* ---------------- 食物生成 ---------------- */
  /** 随机取一个空格：避开蛇身、已有食物、以及蛇头正前方 1 格（避免不公平的必吃/必撞） */
  function freeCell() {
    const blocked = new Set();
    for (const s of Game.snake) blocked.add(cellKey(s.x, s.y));
    blocked.add(cellKey(Game.tailGhost.x, Game.tailGhost.y));
    for (const f of Game.foods) blocked.add(cellKey(f.x, f.y));
    const h = Game.snake[0];
    blocked.add(cellKey(h.x + Game.dir.x, h.y + Game.dir.y));
    const g = CONFIG.GRID;
    for (let i = 0; i < 400; i++) {
      const x = randInt(g), y = randInt(g);
      if (!blocked.has(cellKey(x, y))) return { x: x, y: y };
    }
    // 兜底：线性扫描（几乎不会走到）
    for (let y = 0; y < g; y++) for (let x = 0; x < g; x++) {
      if (!blocked.has(cellKey(x, y))) return { x: x, y: y };
    }
    return null;
  }

  function spawnFood(type, life) {
    const c = freeCell();
    if (!c) return null;
    const f = { x: c.x, y: c.y, type: type, life: life || 0, maxLife: life || 0, spin: Math.random() * 6.28 };
    Game.foods.push(f);
    return f;
  }

  function countFood(type) {
    let n = 0;
    for (const f of Game.foods) if (f.type === type) n++;
    return n;
  }

  function ensureFoods() {
    const min = Game.solo.active ? CONFIG.SOLO_NOTE_MIN : CONFIG.NOTE_MIN;
    const perStep = Game.solo.active ? 2 : 1;   // SOLO 生成速度翻倍
    for (let i = 0; i < perStep; i++) {
      if (countFood('note') < min) spawnFood('note', 0);
    }
  }

  /* ---------------- 一步（一个节拍） ---------------- */
  function doStep(stepTime) {
    const sd = Game.stepDur;

    /* ---- 1. 节奏判定 ----
     * 玩家在"上一拍到这一拍之间"最后一次按键的时间戳与拍点做差。
     * 差值会被折叠到 [-sd/2, sd/2)：即判定到"最近的拍点"，
     * 这样"稍微晚按一点点"会被判给刚刚过去的那一拍，而不是被算成下一拍的严重抢拍。
     */
    /* 判定窗按当前拍长等比计算（不是固定毫秒）。
     * 为什么：折叠到最近拍点后 |delta| 的理论上限就是半拍 sd/2；
     * 若窗口固定为 260ms，则当 sd/2 <= 0.26（BPM >= ~115）时整拍内任意时刻按键都至少 GOOD，
     * MISS 永不触发，"乱按才罚"这条核心规则失效。按比例缩放后：
     *   BPM 96  → 拍长 625ms：PERFECT ±120ms / GOOD ±260ms / 死区 ±52.5ms
     *   BPM 168 → 拍长 357ms：PERFECT ±68.6ms / GOOD ±148.6ms / 死区 ±30ms
     * 即提速时窗口绝对值单调收紧（更考验手），且任意 BPM 都保留 MISS 死区。
     *
     * 比例用「基准 BPM 下的毫秒值 ÷ 基准拍长」反推，避免直接写魔法系数：
     *   PERFECT：120 / 625 = 0.192
     *   GOOD   ：260 / 625 = 0.416   （必须 < 0.5，半拍处才留得出 MISS 死区）
     * 以后要调手感，只改 CONFIG.PERFECT_MS_REF / GOOD_MS_REF 的毫秒值即可。 */
    const refStepDur = 60000 / CONFIG.WINDOW_REF_BPM;   // 基准拍长：96 BPM → 625ms
    const perfectWin = sd * (CONFIG.PERFECT_MS_REF / refStepDur);
    const goodWin = sd * (CONFIG.GOOD_MS_REF / refStepDur);

    let judged = 'HOLD';
    if (Game.pendingDir) {
      let delta = Game.pendingTime - stepTime;
      if (delta < -sd / 2) delta += sd;
      const ad = Math.abs(delta);
      if (ad <= perfectWin) judged = 'PERFECT';
      else if (ad <= goodWin) judged = 'GOOD';
      else judged = 'MISS';
      Game.dir = Game.pendingDir;
    }
    Game.pendingDir = null;

    /* ---- 2. 判定结算 ---- */
    const mult = comboMult(Game.combo);
    const soloMult = Game.solo.active ? CONFIG.SOLO_MULT : 1;
    if (judged === 'PERFECT') {
      Game.counts.perfect++;
      Game.combo++;
      Game.score += Math.round(CONFIG.PERFECT_BONUS * mult * soloMult);
      addFloater('PERFECT', '#ffd166', 1.15);
      addRing(headPixel(), '#ffd166', cellOf() * 2.1);
      audio.sfxPerfect();
    } else if (judged === 'GOOD') {
      Game.counts.good++;
      Game.combo++;
      addFloater('GOOD', '#4df3ff', 0.95);
      audio.sfxGood();
    } else if (judged === 'HOLD') {
      Game.counts.hold++;
      Game.combo++;
      addFloater('·', 'rgba(180,210,255,0.35)', 0.5);
    } else { // MISS
      Game.counts.miss++;
      Game.glitch = CONFIG.GLITCH_TIME;
      Game.shake = Math.max(Game.shake, 0.32);
      if (Game.armor > 0) {
        // 护甲抵扣：这一次 MISS 被完全吃掉（不清 COMBO、不加 NOISE、不中断 SOLO）
        Game.armor--;
        addFloater('ARMOR BREAK', '#ffd166', 1.0);
        audio.sfxArmorBreak();
      } else {
        Game.combo = 0;
        addNoise();
        addFloater('MISS', '#ff4d6d', 1.25);
        audio.sfxMiss();
        if (Game.solo.active) endSolo(true);   // SOLO 期间的 MISS 会中断高潮
      }
    }
    Game.maxCombo = Math.max(Game.maxCombo, Game.combo);
    // NOISE 满 / 撞墙等可能已在本段判定中结束游戏，必须立刻停止后续逻辑
    if (Game.state !== STATE.PLAYING) return;

    /* ---- 3. 移动 ---- */
    const head = Game.snake[0];
    const nx = head.x + Game.dir.x;
    const ny = head.y + Game.dir.y;
    if (nx < 0 || ny < 0 || nx >= CONFIG.GRID || ny >= CONFIG.GRID) {
      gameOver('LOST THE GROOVE');
      return;
    }
    // 若不处于生长状态，尾巴会腾出格子，因此允许撞上"当前尾格"
    const bodyLimit = Game.grow > 0 ? Game.snake.length : Game.snake.length - 1;
    for (let i = 0; i < bodyLimit; i++) {
      if (Game.snake[i].x === nx && Game.snake[i].y === ny) { gameOver('LOST THE GROOVE'); return; }
    }

    Game.snake.unshift({ x: nx, y: ny });
    let vacated;
    if (Game.grow > 0) { Game.grow--; vacated = Game.snake[Game.snake.length - 1]; }
    else { vacated = Game.snake.pop(); }
    Game.tailGhost = vacated;

    /* ---- 4. 吃音符 ---- */
    let ate = null;
    for (let i = 0; i < Game.foods.length; i++) {
      if (Game.foods[i].x === nx && Game.foods[i].y === ny) { ate = Game.foods[i]; Game.foods.splice(i, 1); break; }
    }
    if (ate) {
      const m = comboMult(Game.combo) * soloMult;
      const hp = headPixel();
      if (ate.type === 'note') {
        const base = Game.solo.active ? CONFIG.SCORE_NOTE_SOLO : CONFIG.SCORE_NOTE;
        Game.score += Math.round(base * m);
        Game.grow += 1;
        audio.sfxEat(Math.floor(Game.combo / 4));
        burst(hp, 14, Game.hue + 30, 1.0);
      } else if (ate.type === 'downbeat') {
        Game.score += Math.round(CONFIG.SCORE_DOWNBEAT * m);
        Game.grow += 2;
        audio.sfxDownbeat();
        burst(hp, 24, 45, 1.5);
        Game.ripple = 1;
        Game.flash = 0.5;
      } else { // chord → 护甲
        Game.score += Math.round(CONFIG.SCORE_CHORD * m);
        Game.grow += 1;
        if (Game.armor < CONFIG.MAX_ARMOR) Game.armor++;
        audio.sfxChord();
        burst(hp, 20, 50, 1.3);
        addFloater('ARMOR +1', '#ffd166', 1.1);
        Game.ripple = 0.6;
      }
      Game.flash = Math.max(Game.flash, 0.35);
    }

    /* ---- 5. 每拍的食物/节拍事件 ---- */
    const idx = Game.stepIndex;
    if (idx % 4 === 0 && countFood('downbeat') < 2) {
      spawnFood('downbeat', CONFIG.DOWNBEAT_LIFE);
    }
    if (idx > 0 && idx % CONFIG.CHORD_INTERVAL === 0) {
      // 同时最多 1 个和弦音符
      for (let i = Game.foods.length - 1; i >= 0; i--) {
        if (Game.foods[i].type === 'chord') Game.foods.splice(i, 1);
      }
      spawnFood('chord', CONFIG.CHORD_LIFE);
    }
    for (let i = Game.foods.length - 1; i >= 0; i--) {
      const f = Game.foods[i];
      if (f.maxLife > 0) { f.life--; if (f.life <= 0) Game.foods.splice(i, 1); }
    }
    if (idx % 4 === 0) Game.hueTarget = (Game.hueTarget + 37) % 360;   // 每 4 拍换主色调
    ensureFoods();

    /* ---- 6. LEVEL / SOLO ---- */
    const prevLevel = Game.level;
    updateTempo();
    if (Game.level > prevLevel) {
      audio.sfxLevelUp();
      Game.flash = 0.7;
      addFloater('LEVEL UP  BPM ' + Game.bpm, '#b47cff', 1.4);
    }
    let soloStartedNow = false;
    if (!Game.solo.active && Game.combo >= CONFIG.SOLO_COMBO_STEP &&
        Game.combo % CONFIG.SOLO_COMBO_STEP === 0) {
      startSolo();
      soloStartedNow = true;
    }
    // 触发的这一拍本身不消耗额度，否则 SOLO 实际只剩 7 拍 ×3（应为 SOLO_BEATS=8 拍）
    if (Game.solo.active && !soloStartedNow) {
      Game.solo.left--;
      if (Game.solo.left <= 0) endSolo(false);
    }

    Game.beatPulse = 1;
    Game.lastStepTime = stepTime;
    Game.stepIndex++;
  }

  function startSolo() {
    Game.solo.active = true;
    Game.solo.left = CONFIG.SOLO_BEATS;
    audio.sfxSolo();
    Game.flash = 0.9;
    Game.ripple = 1;
    addFloater('★ SOLO ★', '#ffffff', 1.5);
    UI.setSolo(true);
    ensureFoods();
  }

  function endSolo(byMiss) {
    if (!Game.solo.active) return;
    Game.solo.active = false;
    Game.solo.left = 0;
    UI.setSolo(false);
    if (byMiss) {
      // 中断音效/飘字；NOISE 的 +1 已由触发这次中断的 MISS 结算，避免同一拍双重扣血
      addFloater('SOLO BREAK', '#ff4d6d', 1.2);
      Game.shake = Math.max(Game.shake, 0.4);
    } else {
      addFloater('SOLO END', '#b47cff', 1.0);
    }
  }

  function addNoise() {
    Game.noise++;
    Game.shake = Math.max(Game.shake, 0.4);
    Game.glitch = CONFIG.GLITCH_TIME;
    if (Game.noise >= CONFIG.MAX_NOISE) {
      Game.overReason = 'NOISE ♪♪♪ 已全部碎裂';
      gameOver('音浪崩塌 / NOISE OVERLOAD');
    }
  }

  /* ---------------- 局面初始化 / 结束 ---------------- */
  function resetGame() {
    const g = CONFIG.GRID;
    const cx = Math.floor(g / 2), cy = Math.floor(g / 2);
    Game.snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }, { x: cx - 3, y: cy }];
    Game.tailGhost = { x: cx - 4, y: cy };
    Game.dir = { x: 1, y: 0 };
    Game.pendingDir = null;
    Game.pendingTime = 0;
    Game.grow = 0;
    Game.foods = [];
    Game.score = 0; Game.combo = 0; Game.maxCombo = 0;
    Game.level = 1; Game.bpm = CONFIG.BASE_BPM; Game.stepDur = 60 / CONFIG.BASE_BPM;
    Game.armor = 0; Game.noise = 0;
    Game.counts = { perfect: 0, good: 0, miss: 0, hold: 0 };
    Game.stepIndex = 0;
    Game.solo = { active: false, left: 0 };
    Game.particles = []; Game.rings = []; Game.floaters = [];
    Game.glitch = 0; Game.shake = 0; Game.flash = 0; Game.ripple = 0;
    Game.overReason = '';
    Game.hue = 200; Game.hueTarget = 200;
    Game.beatPulse = 0;
    UI.setSolo(false);
    for (let i = 0; i < CONFIG.NOTE_MIN; i++) spawnFood('note', 0);
    spawnFood('downbeat', CONFIG.DOWNBEAT_LIFE);
    updateTempo();
  }

  function startGame() {
    if (!audio.init()) { /* 浏览器不支持 WebAudio：静默降级，仍可玩 */ }
    audio.resume();
    resetGame();
    const t0 = audio.time + 0.45;
    Game.nextStepTime = t0;
    Game.lastStepTime = t0 - Game.stepDur;
    audio.syncCursor(t0, 0);
    audio.startScheduler();
    Game.state = STATE.PLAYING;
    UI.hideOverlay();
    UI.syncHud(true);
  }

  function gameOver(title) {
    if (Game.state === STATE.GAMEOVER) return;
    Game.state = STATE.GAMEOVER;
    Game.overReason = Game.overReason || title;
    audio.stopScheduler();
    audio.sfxGameOver();
    Game.glitch = 0.7;
    Game.shake = 0.6;
    UI.showGameOver(title);
    UI.setSolo(false);
  }

  function togglePause() {
    if (Game.state === STATE.PLAYING) {
      Game.state = STATE.PAUSED;
      audio.stopScheduler();
      audio.ctx && audio.ctx.suspend && audio.ctx.suspend();
      UI.showPause();
    } else if (Game.state === STATE.PAUSED) {
      audio.ctx && audio.ctx.resume && audio.ctx.resume();
      // 若挂起期间时钟仍在走（个别浏览器），重新对齐拍点，避免恢复瞬间连拍
      const nowA = audio.time;
      if (Game.nextStepTime < nowA) Game.nextStepTime = nowA + 0.08;
      if (audio.stepTime < nowA) audio.syncCursor(nowA + 0.08, Game.stepIndex);
      Game.state = STATE.PLAYING;
      audio.startScheduler();
      UI.hideOverlay();
    }
  }

  /* ---------------- 特效 ---------------- */
  function burst(p, n, hue, power) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = rand(60, 320) * power;
      Game.particles.push({
        x: p.x, y: p.y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: rand(0.35, 0.85), max: 0.85,
        hue: hue + rand(-25, 25), size: rand(1.6, 4.4) * power
      });
    }
  }
  function addRing(p, color, maxR) {
    Game.rings.push({ x: p.x, y: p.y, r: cellOf() * 0.35, maxR: maxR, life: 0.5, max: 0.5, color: color, w: 3 });
  }
  function addFloater(text, color, scale) {
    const p = headPixel();
    Game.floaters.push({
      x: p.x, y: p.y - cellOf() * 0.9, text: text, color: color,
      life: 0.9, max: 0.9, scale: scale || 1
    });
  }

  function updateEffects(dt) {
    const ps = Game.particles;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.life -= dt;
      if (p.life <= 0) { ps.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= Math.pow(0.02, dt); p.vy *= Math.pow(0.02, dt);
    }
    const rs = Game.rings;
    for (let i = rs.length - 1; i >= 0; i--) {
      const r = rs[i]; r.life -= dt;
      if (r.life <= 0) { rs.splice(i, 1); continue; }
      const k = 1 - r.life / r.max;
      r.r = lerp(cellOf() * 0.35, r.maxR, k);
    }
    const fs = Game.floaters;
    for (let i = fs.length - 1; i >= 0; i--) {
      const f = fs[i]; f.life -= dt;
      if (f.life <= 0) { fs.splice(i, 1); continue; }
      f.y -= dt * 46;
    }
    Game.beatPulse = Math.max(0, Game.beatPulse - dt * 3.2);
    Game.glitch = Math.max(0, Game.glitch - dt);
    Game.shake = Math.max(0, Game.shake - dt * 1.6);
    Game.flash = Math.max(0, Game.flash - dt * 2.4);
    Game.ripple = Math.max(0, Game.ripple - dt * 1.5);
    // 主色调平滑过渡（"跟着音乐换灯"）
    let d = ((Game.hueTarget - Game.hue) % 360 + 540) % 360 - 180;
    Game.hue = (Game.hue + d * Math.min(1, dt * 6) + 360) % 360;
  }

  /* ============================================================================
   * RENDER
   * ==========================================================================*/
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  const board = { x: 0, y: 0, size: 0 };
  let glitchCanvas = null, tintCanvas = null;
  let scrollT = 0;

  function cellOf() { return board.size / CONFIG.GRID; }

  function headPixel() {
    const c = cellOf();
    const h = Game.snake[0] || { x: 0, y: 0 };
    return { x: board.x + (h.x + 0.5) * c, y: board.y + (h.y + 0.5) * c };
  }

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    glitchCanvas = document.createElement('canvas');
    glitchCanvas.width = canvas.width; glitchCanvas.height = canvas.height;
    tintCanvas = document.createElement('canvas');
    tintCanvas.width = canvas.width; tintCanvas.height = canvas.height;

    const top = 108;                       // 让出 HUD 高度
    const avail = Math.min(W - 24, H - top - 26);
    board.size = Math.max(200, avail);
    board.x = (W - board.size) / 2;
    board.y = top + (H - top - board.size) / 2 - 8;
  }
  window.addEventListener('resize', resize);

  function drawBackdrop(dt) {
    scrollT += dt * (Game.state === STATE.PLAYING ? (0.12 + Game.bpm / 900) : 0.06);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#07060e');
    g.addColorStop(0.5, '#0c0a1c');
    g.addColorStop(1, '#180b28');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    const horizon = H * 0.70;
    const vpX = W * 0.5;

    // 合成器浪潮落日
    const sunR = Math.min(120, W * 0.16);
    const sg = ctx.createLinearGradient(0, horizon - sunR * 2, 0, horizon);
    sg.addColorStop(0, 'rgba(255,180,80,0.55)');
    sg.addColorStop(0.5, 'rgba(255,62,165,0.45)');
    sg.addColorStop(1, 'rgba(120,60,220,0.25)');
    ctx.save();
    ctx.beginPath(); ctx.arc(vpX, horizon, sunR, Math.PI, Math.PI * 2); ctx.closePath();
    ctx.fillStyle = sg; ctx.fill();
    // 落日横向切割条纹（clip 保证只会擦掉太阳本身，不会在背景上开出黑洞）
    ctx.clip();
    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 7; i++) {
      const yy = horizon - sunR * (0.12 + i * 0.12);
      ctx.fillRect(vpX - sunR, yy, sunR * 2, sunR * 0.035 * (1 + i * 0.5));
    }
    ctx.restore();

    // 透视地平线网格
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = hsl(Game.hue, 80, 60, 0.16 + Game.beatPulse * 0.10);
    for (let i = -16; i <= 16; i++) {
      const spread = i * (W / 12);
      ctx.beginPath();
      ctx.moveTo(vpX, horizon);
      ctx.lineTo(vpX + spread, H + 40);
      ctx.stroke();
    }
    const depth = H - horizon;
    const nLines = 16;
    for (let i = 0; i < nLines; i++) {
      const k = ((i + (scrollT % 1)) / nLines);
      const y = horizon + depth * k * k;
      ctx.strokeStyle = hsl(Game.hue, 80, 62, 0.05 + 0.16 * k + Game.beatPulse * 0.05);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();
  }

  function drawBoard() {
    const c = cellOf();
    // 底板
    ctx.save();
    ctx.fillStyle = 'rgba(6,5,14,0.62)';
    roundRect(board.x - 10, board.y - 10, board.size + 20, board.size + 20, 16);
    ctx.fill();

    // 内部网格（亮度随 beatPulse 衰减）
    const pulse = Game.beatPulse;
    ctx.lineWidth = 1;
    ctx.strokeStyle = hsl(Game.hue, 90, 65, 0.06 + pulse * 0.22);
    ctx.beginPath();
    for (let i = 0; i <= CONFIG.GRID; i++) {
      const p = board.x + i * c;
      ctx.moveTo(p, board.y); ctx.lineTo(p, board.y + board.size);
      const q = board.y + i * c;
      ctx.moveTo(board.x, q); ctx.lineTo(board.x + board.size, q);
    }
    ctx.stroke();

    // 强拍时整块微微泛光
    if (pulse > 0.01) {
      ctx.fillStyle = hsl(Game.hue, 90, 60, 0.035 * pulse);
      ctx.fillRect(board.x, board.y, board.size, board.size);
    }
    ctx.restore();

    // 边框霓虹
    ctx.save();
    ctx.lineWidth = 2;
    ctx.shadowBlur = 18 + pulse * 26;
    ctx.shadowColor = hsl(Game.hue, 95, 60, 0.9);
    ctx.strokeStyle = hsl(Game.hue, 95, 66, 0.55 + pulse * 0.35);
    roundRect(board.x - 10, board.y - 10, board.size + 20, board.size + 20, 16);
    ctx.stroke();
    ctx.restore();

    // SOLO 彩虹边框
    if (Game.solo.active) {
      ctx.save();
      ctx.lineWidth = 5;
      for (let s = 0; s < 3; s++) {
        ctx.strokeStyle = hsl(Game.hue + s * 60 + scrollT * 120, 100, 65, 0.55);
        ctx.shadowBlur = 26; ctx.shadowColor = hsl(Game.hue + s * 60, 100, 60, 0.9);
        roundRect(board.x - 14 - s * 4, board.y - 14 - s * 4, board.size + 28 + s * 8, board.size + 28 + s * 8, 20);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawFoods(now) {
    const c = cellOf();
    for (const f of Game.foods) {
      const px = board.x + (f.x + 0.5) * c;
      const py = board.y + (f.y + 0.5) * c;
      const bob = Math.sin(now * 3 + f.spin) * c * 0.06;
      ctx.save();
      if (f.type === 'note') {
        const hue = Game.solo.active ? (Game.hue + 180 + now * 60) % 360 : Game.hue + 40;
        ctx.font = '700 ' + (c * 0.78) + 'px ' + FONT;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowBlur = 16 + Game.beatPulse * 14;
        ctx.shadowColor = hsl(hue, 100, 65, 1);
        ctx.fillStyle = hsl(hue, 100, 76, 0.95);
        ctx.fillText('♪', px, py + bob);
      } else if (f.type === 'downbeat') {
        ctx.font = '700 ' + (c * 0.9) + 'px ' + FONT;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowBlur = 22 + Game.beatPulse * 20;
        ctx.shadowColor = 'rgba(255,190,70,1)';
        ctx.fillStyle = 'rgba(255,225,150,0.98)';
        ctx.fillText('♫', px, py + bob);
        // 倒计时环
        const k = clamp(f.life / f.maxLife, 0, 1);
        ctx.shadowBlur = 12;
        ctx.lineWidth = 3;
        ctx.strokeStyle = hsl(40, 100, 60, 0.9);
        ctx.beginPath();
        ctx.arc(px, py, c * 0.46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k);
        ctx.stroke();
      } else {
        // 和弦音符：旋转金色菱形
        const r = c * 0.42;
        ctx.translate(px, py);
        ctx.rotate(now * 1.6 + f.spin);
        ctx.shadowBlur = 24 + Game.beatPulse * 18;
        ctx.shadowColor = 'rgba(255,215,120,1)';
        const grad = ctx.createLinearGradient(-r, -r, r, r);
        grad.addColorStop(0, '#fff6d8'); grad.addColorStop(1, '#ffb02e');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0);
        ctx.closePath(); ctx.fill();
        ctx.rotate(-(now * 1.6 + f.spin));
        ctx.font = '700 ' + (c * 0.34) + 'px ' + FONT;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(70,40,0,0.85)';
        ctx.fillText('✦', 0, 0);
      }
      ctx.restore();
    }
  }

  /** 蛇身：沿路径弧长采样 + 宽度/色相/透明度渐变 + additive 辉光 */
  function drawSnake(now) {
    if (!Game.snake.length) return;
    const c = cellOf();
    const pts = Game.snake.concat([Game.tailGhost]);
    const P = pts.map(p => ({ x: board.x + (p.x + 0.5) * c, y: board.y + (p.y + 0.5) * c }));

    // t: 上一拍到现在的进度（0→1），用于把"跳格"补成连续移动
    const t = clamp((now - Game.lastStepTime) / Game.stepDur, 0, 1);
    const n = Game.snake.length;
    const bodyLen = Math.max(c, (n - 1) * c);
    const offset = (1 - t) * c;         // 步与步之间整体沿路径滑动 1 格
    const spacing = Math.max(1.5, c * 0.2);
    const count = Math.max(4, Math.ceil(bodyLen / spacing));

    const solo = Game.solo.active;
    const samples = new Array(count + 1);
    for (let i = 0; i <= count; i++) {
      const s = Math.min(i * spacing, bodyLen);
      samples[i] = { p: pointAtArc(P, offset + s), u: s / bodyLen };
    }

    const headW = c * 0.86;
    const widthAt = (u) => headW * (1 - 0.62 * u) * (1 + 0.06 * Math.sin(u * 18 - now * 6));
    const hueAt = (u) => solo ? (Game.hue + u * 200 + now * 90) : (Game.hue + u * 70);

    // ---- 外发光层（additive） ----
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i <= count; i++) {
      const sm = samples[i];
      const w = widthAt(sm.u);
      ctx.fillStyle = hsl(hueAt(sm.u), 100, 55, 0.055 * (1 - sm.u * 0.55));
      ctx.beginPath(); ctx.arc(sm.p.x, sm.p.y, w * 1.5, 0, 6.2832); ctx.fill();
    }
    ctx.restore();

    // ---- 主体 ----
    ctx.save();
    for (let i = count; i >= 0; i--) {
      const sm = samples[i];
      const w = widthAt(sm.u);
      const a = 1 - sm.u * 0.45;
      ctx.fillStyle = hsl(hueAt(sm.u), 95, 58, 0.92 * a);
      ctx.beginPath(); ctx.arc(sm.p.x, sm.p.y, w * 0.5, 0, 6.2832); ctx.fill();
      ctx.fillStyle = hsl(hueAt(sm.u), 100, 82, 0.5 * a);
      ctx.beginPath(); ctx.arc(sm.p.x, sm.p.y, w * 0.26, 0, 6.2832); ctx.fill();
    }
    ctx.restore();

    // ---- 蛇头：发光核心 + 外圈光晕 + 朝向高光 ----
    const hp = samples[0].p;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const hg = ctx.createRadialGradient(hp.x, hp.y, 0, hp.x, hp.y, c * 1.5);
    hg.addColorStop(0, hsl(Game.hue, 100, 80, 0.85));
    hg.addColorStop(0.35, hsl(Game.hue, 100, 60, 0.35));
    hg.addColorStop(1, hsl(Game.hue, 100, 50, 0));
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(hp.x, hp.y, c * 1.5, 0, 6.2832); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 22; ctx.shadowColor = hsl(Game.hue, 100, 70, 1);
    ctx.beginPath(); ctx.arc(hp.x, hp.y, headW * 0.3, 0, 6.2832); ctx.fill();
    ctx.restore();

    // 吃到音符时的过冲发光
    if (Game.flash > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = hsl(Game.hue + 40, 100, 70, 0.25 * Game.flash);
      ctx.beginPath(); ctx.arc(hp.x, hp.y, c * (1.2 + Game.flash * 1.2), 0, 6.2832); ctx.fill();
      ctx.restore();
    }
  }

  function drawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of Game.particles) {
      const a = clamp(p.life / p.max, 0, 1);
      ctx.fillStyle = hsl(p.hue, 100, 68, a * 0.9);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.4 + a * 0.9), 0, 6.2832); ctx.fill();
    }
    for (const r of Game.rings) {
      const a = clamp(r.life / r.max, 0, 1);
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = a * 0.85;
      ctx.lineWidth = r.w * a + 0.5;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.2832); ctx.stroke();
    }
    // 全屏涟漪冲击波
    if (Game.ripple > 0.01) {
      const k = 1 - Game.ripple;
      ctx.globalAlpha = Game.ripple * 0.4;
      ctx.strokeStyle = hsl(Game.hue + 30, 100, 70, 1);
      ctx.lineWidth = 6 * Game.ripple + 1;
      ctx.beginPath();
      ctx.arc(board.x + board.size / 2, board.y + board.size / 2, board.size * 0.75 * k, 0, 6.2832);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawFloaters() {
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const f of Game.floaters) {
      const a = clamp(f.life / f.max, 0, 1);
      const size = 20 * f.scale * (1 + (1 - a) * 0.25);
      ctx.font = '900 ' + size.toFixed(1) + 'px ' + FONT;
      ctx.globalAlpha = Math.pow(a, 0.7);
      ctx.shadowBlur = 18; ctx.shadowColor = f.color;
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.restore();
  }

  /** MISS 故障：横向错位切片 + RGB 分离（仅在故障时执行，成本可控） */
  function applyGlitch(amount) {
    const gw = glitchCanvas, gc = gw.getContext('2d');
    gc.setTransform(1, 0, 0, 1, 0, 0);
    gc.clearRect(0, 0, gw.width, gw.height);
    gc.drawImage(canvas, 0, 0);

    const CW = canvas.width, CH = canvas.height;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, CW, CH);
    const bands = 8;
    for (let i = 0; i < bands; i++) {
      const y = Math.floor(CH * i / bands);
      const h = Math.ceil(CH / bands);
      const dx = (Math.random() * 2 - 1) * 22 * amount * DPR;
      ctx.drawImage(gw, 0, y, CW, h, dx, y + (Math.random() * 2 - 1) * 3 * amount * DPR, CW, h);
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.32 * amount;
    drawTinted(gw, '#ff0055', 7 * amount * DPR, 0);
    drawTinted(gw, '#00ffcc', -7 * amount * DPR, 0);
    ctx.restore();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function drawTinted(src, color, dx, dy) {
    const tw = tintCanvas, tc = tw.getContext('2d');
    tc.setTransform(1, 0, 0, 1, 0, 0);
    tc.globalCompositeOperation = 'source-over';
    tc.clearRect(0, 0, tw.width, tw.height);
    tc.drawImage(src, 0, 0);
    tc.globalCompositeOperation = 'multiply';
    tc.fillStyle = color;
    tc.fillRect(0, 0, tw.width, tw.height);
    // 用原图 alpha 复原（multiply 会让透明区被染色）
    tc.globalCompositeOperation = 'destination-in';
    tc.drawImage(src, 0, 0);
    tc.globalCompositeOperation = 'source-over';
    ctx.drawImage(tw, dx, dy);
  }

  function render(now, dt) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // 抖动
    let ox = 0, oy = 0;
    if (Game.shake > 0.001) {
      ox = (Math.random() * 2 - 1) * 9 * Game.shake;
      oy = (Math.random() * 2 - 1) * 9 * Game.shake;
    }
    ctx.save();
    ctx.translate(ox, oy);

    drawBackdrop(dt);
    drawBoard();
    if (Game.state !== STATE.MENU) {
      drawFoods(now);
      drawSnake(now);
      drawParticles();
      drawFloaters();
    } else {
      drawFoods(now);
    }

    // 全屏闪光
    if (Game.flash > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = hsl(Game.hue + 20, 100, 70, 0.10 * Game.flash);
      ctx.fillRect(-40, -40, W + 80, H + 80);
      ctx.restore();
    }
    ctx.restore();

    if (Game.glitch > 0.001) {
      applyGlitch(clamp(Game.glitch / CONFIG.GLITCH_TIME, 0, 1));
    }
  }

  /* ============================================================================
   * UI（DOM）
   * ==========================================================================*/
  const UI = {
    el: {
      overlay: document.getElementById('overlay'),
      panel: document.getElementById('panel'),
      score: document.getElementById('vScore'),
      combo: document.getElementById('vCombo'),
      mult: document.getElementById('vMult'),
      acc: document.getElementById('vAcc'),
      bpm: document.getElementById('vBpm'),
      level: document.getElementById('vLevel'),
      noise: document.getElementById('noise'),
      armor: document.getElementById('armorV'),
      bar: document.getElementById('beatbar').children,
      soloTag: document.getElementById('soloTag'),
      mute: document.getElementById('muteTag')
    },
    _last: {},

    setSolo(on) {
      this.el.soloTag.classList.toggle('on', !!on);
    },

    hideOverlay() { this.el.overlay.classList.add('hidden'); },
    showOverlay(html) {
      this.el.panel.innerHTML = html;
      this.el.overlay.classList.remove('hidden');
    },

    showMenu() {
      this.showOverlay(
        '<div class="title">节奏霓虹 · RHYTHM SNAKE</div>' +
        '<div class="sub">PRESS THE BEAT · NOT THE KEY</div>' +
        '<div class="rules">' +
        '· 蛇<b>每拍走一格</b>。你要做的不是在任意时刻转向，而是<b>在拍点附近按方向键</b>。<br>' +
        '· <span class="g">PERFECT</span>：拍点 <b>±120ms</b> 内按键（96 BPM 基准值）→ COMBO +1，额外 +15×倍率，金色判定。<br>' +
        '· <b>GOOD</b>：拍点 <b>±260ms</b> 内（96 BPM 基准值）→ COMBO +1。' +
        '判定窗随提速<b>按拍长比例收紧</b>：96 BPM 时 ±120/±260ms，168 BPM 时约 ±69/±149ms。<br>' +
        '<span class="p">HOLD</span>：这一拍不按 → COMBO +1，稳住节奏也算对。<br>' +
        '· <span class="r">MISS</span>：拍点之外乱按 → COMBO 归零，NOISE +1；护甲可抵扣一次。<br>' +
        '· <b>♪</b> 普通音符 +10｜<b>♫</b> 强拍音符 +35（带倒计时）<b>｜✦</b> 和弦音符 = 1 层护甲。<br>' +
        '· COMBO 达 16 的倍数触发 <b>SOLO</b>：分数 ×3、音符翻倍、彩虹灯。<br>' +
        '· NOISE 满 3 格 = 音浪崩塌；撞墙或咬到自己 = LOST THE GROOVE。' +
        '</div>' +
        '<button class="btn" id="btnStart">开始 ▶（点击启动音频）</button>' +
        '<div class="hint">方向键 / WASD 移动 · 空格 暂停 · M 静音 · R 重开 · 移动端可滑动</div>'
      );
      const b = document.getElementById('btnStart');
      if (b) b.addEventListener('click', startGame);
    },

    showPause() {
      this.showOverlay(
        '<div class="paused-title">PAUSED</div>' +
        '<div class="sub">节奏已冻结</div>' +
        '<div class="rules" style="text-align:center">' +
        '空格 = 继续<br>R = 重新开始<br>M = 静音开关' +
        '</div>' +
        '<button class="btn" id="btnResume">继续 ▶</button>'
      );
      const b = document.getElementById('btnResume');
      if (b) b.addEventListener('click', togglePause);
    },

    showGameOver(title) {
      const c = Game.counts;
      const judged = c.perfect + c.good + c.miss;
      const acc = judged > 0 ? c.perfect / judged : 0;
      const grade = rating(acc, Game.maxCombo, Game.score);
      const gcolor = { S: '#ffd166', A: '#4df3ff', B: '#7bff9e', C: '#b47cff', D: '#ff6f8b' }[grade];
      // 与标题重复的副标题不再重复展示
      const sub = (Game.overReason && Game.overReason !== title) ? Game.overReason : '';
      this.showOverlay(
        '<div class="title" style="font-size:24px">' + title + '</div>' +
        '<div class="sub">' + sub + '</div>' +
        '<div class="grade" style="color:' + gcolor + '">' + grade + '</div>' +
        '<div class="sub">RATING</div>' +
        '<div class="grid2">' +
        '<div><span>SCORE</span><span>' + Game.score + '</span></div>' +
        '<div><span>MAX COMBO</span><span>' + Game.maxCombo + '</span></div>' +
        '<div><span>PERFECT</span><span>' + c.perfect + '</span></div>' +
        '<div><span>GOOD</span><span>' + c.good + '</span></div>' +
        '<div><span>MISS</span><span>' + c.miss + '</span></div>' +
        '<div><span>HOLD</span><span>' + c.hold + '</span></div>' +
        '<div><span>ACCURACY</span><span>' + Math.round(acc * 100) + '%</span></div>' +
        '<div><span>MAX BPM</span><span>' + Game.bpm + '</span></div>' +
        '</div>' +
        '<button class="btn" id="btnAgain">再来一次 ↻</button>' +
        '<div class="hint">或按 R 键立即重开</div>'
      );
      const b = document.getElementById('btnAgain');
      if (b) b.addEventListener('click', startGame);
    },

    syncHud(force) {
      const L = this._last;
      const c = Game.counts;
      const judged = c.perfect + c.good + c.miss;
      const acc = judged > 0 ? Math.round(c.perfect / judged * 100) : null;
      if (force || L.score !== Game.score) { this.el.score.textContent = Game.score; L.score = Game.score; }
      if (force || L.combo !== Game.combo) {
        this.el.combo.textContent = Game.combo;
        this.el.combo.parentElement.classList.toggle('hot', Game.combo >= 8);
        L.combo = Game.combo;
      }
      const m = comboMult(Game.combo);
      const mstr = '×' + (m === 1 ? '1' : String(m));
      if (force || L.mult !== mstr) { this.el.mult.textContent = mstr; L.mult = mstr; }
      const astr = acc === null ? '--' : acc + '%';
      if (force || L.acc !== astr) { this.el.acc.textContent = astr; L.acc = astr; }
      if (force || L.bpm !== Game.bpm) { this.el.bpm.textContent = Game.bpm; L.bpm = Game.bpm; }
      if (force || L.level !== Game.level) { this.el.level.textContent = Game.level; L.level = Game.level; }
      if (force || L.armor !== Game.armor) { this.el.armor.textContent = Game.armor; L.armor = Game.armor; }
      if (force || L.noise !== Game.noise) {
        for (let i = 0; i < this.el.noise.children.length; i++) {
          this.el.noise.children[i].className = (i < CONFIG.MAX_NOISE - Game.noise) ? '' : 'brk';
        }
        L.noise = Game.noise;
      }
    },

    syncBeatBar(phase) {
      const active = Game.stepIndex % 4;
      for (let i = 0; i < 4; i++) {
        const el = this.el.bar[i];
        const on = (i === active);
        const a = on ? (0.35 + 0.65 * (1 - phase)) : 0.16;
        el.style.opacity = a.toFixed(3);
        el.style.background = (i === 0)
          ? 'linear-gradient(90deg,#ffd166,#ff8fd0)'
          : 'linear-gradient(90deg,#4df3ff,#7b8cff)';
        el.style.boxShadow = on ? '0 0 12px ' + (i === 0 ? 'rgba(255,209,102,.9)' : 'rgba(77,243,255,.9)') : 'none';
      }
    }
  };

  function rating(acc, maxCombo, score) {
    if (acc >= 0.88 && maxCombo >= 40 && score >= 3000) return 'S';
    if (acc >= 0.78 && maxCombo >= 24 && score >= 1600) return 'A';
    if (acc >= 0.64 && maxCombo >= 12) return 'B';
    if (acc >= 0.45 || score >= 400) return 'C';
    return 'D';
  }

  /* ============================================================================
   * INPUT
   * ==========================================================================*/
  const DIRS = {
    ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
    KeyW: { x: 0, y: -1 }, KeyS: { x: 0, y: 1 }, KeyA: { x: -1, y: 0 }, KeyD: { x: 1, y: 0 }
  };

  function submitDir(d) {
    if (Game.state !== STATE.PLAYING) return;
    // 禁止 180° 回头：直接忽略，不计 MISS
    if (Game.snake.length > 1) {
      const cur = Game.pendingDir || Game.dir;
      if ((d.x !== 0 && cur.x === -d.x && cur.y === d.y) ||
          (d.y !== 0 && cur.y === -d.y && cur.x === d.x)) return;
    }
    Game.pendingDir = d;
    // 关键：以音频时钟记录按键时刻，与拍点在同一时间轴上比较，避免 performance.now 与 audio 时钟的偏移
    Game.pendingTime = audio.ctx ? audio.ctx.currentTime : (performance.now() / 1000);
  }

  window.addEventListener('keydown', (e) => {
    const code = e.code;
    if (DIRS[code]) {
      e.preventDefault();
      submitDir(DIRS[code]);
      return;
    }
    if (code === 'Space') {
      e.preventDefault();
      if (Game.state === STATE.PLAYING || Game.state === STATE.PAUSED) togglePause();
      else if (Game.state === STATE.MENU) startGame();
      return;
    }
    if (code === 'KeyM') {
      e.preventDefault();
      audio.setMuted(!audio.muted);
      UI.el.mute.textContent = audio.muted ? 'M: MUTED' : 'M: MUTE';
      return;
    }
    if (code === 'KeyR') {
      e.preventDefault();
      if (Game.state === STATE.PAUSED || Game.state === STATE.GAMEOVER) {
        if (Game.state === STATE.PAUSED && audio.ctx) audio.ctx.resume();
        startGame();
      }
      return;
    }
    if (code === 'Enter' && Game.state === STATE.MENU) { e.preventDefault(); startGame(); }
  });

  // 触摸滑动
  let touchStart = null;
  window.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x, dy = t.clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) submitDir({ x: dx > 0 ? 1 : -1, y: 0 });
    else submitDir({ x: 0, y: dy > 0 ? 1 : -1 });
  }, { passive: true });
  window.addEventListener('touchmove', (e) => { e.preventDefault(); }, { passive: false });

  /* ============================================================================
   * MAIN LOOP
   * ==========================================================================*/
  let lastFrame = 0;
  let hudTick = 0;

  function frame() {
    requestAnimationFrame(frame);
    const nowA = audio.ctx ? audio.ctx.currentTime : performance.now() / 1000;
    let dt = lastFrame ? nowA - lastFrame : 0.016;
    lastFrame = nowA;
    dt = clamp(dt, 0, 0.1);

    if (Game.state === STATE.PLAYING) {
      // 用音频时钟推进：可能一帧内跨多拍（低帧率时补上），但单帧最多补 4 拍防止卡死后暴走
      let guard = 0;
      while (nowA >= Game.nextStepTime && Game.state === STATE.PLAYING && guard++ < 4) {
        doStep(Game.nextStepTime);
        Game.nextStepTime += Game.stepDur;
      }
      if (nowA - Game.nextStepTime > Game.stepDur * 4) {
        // 标签页切回等异常情况：重新对齐时间轴
        Game.nextStepTime = nowA + Game.stepDur;
        audio.syncCursor(nowA + Game.stepDur, Game.stepIndex);
      }
    }

    updateEffects(dt);

    if (Game.state === STATE.PLAYING) {
      const phase = clamp((nowA - Game.lastStepTime) / Game.stepDur, 0, 1);
      UI.syncBeatBar(phase);
      hudTick += dt;
      if (hudTick > 0.06) { hudTick = 0; UI.syncHud(false); }
    } else if (Game.state === STATE.MENU) {
      Game.menuT += dt;
      Game.beatPulse = Math.max(Game.beatPulse, 0.25 + 0.2 * Math.sin(Game.menuT * 3));
      UI.syncBeatBar((Game.menuT * 1.6) % 1);
    }

    render(nowA, dt);
  }

  /* ============================================================================
   * BOOT
   * ==========================================================================*/
  resize();
  resetGame();
  UI.syncHud(true);
  UI.showMenu();
  requestAnimationFrame(frame);

  // 首次任意点击/按键也可启动（浏览器要求用户手势后才能播放音频）
  window.addEventListener('pointerdown', function once() {
    if (Game.state === STATE.MENU) {
      audio.init(); audio.resume();
    }
    window.removeEventListener('pointerdown', once);
  });
})();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
