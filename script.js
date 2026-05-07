const officialQualifiedTeams = [
  { name: "加拿大", flag: "🇨🇦" },
  { name: "墨西哥", flag: "🇲🇽" },
  { name: "美国", flag: "🇺🇸" },
  { name: "澳大利亚", flag: "🇦🇺" },
  { name: "伊拉克", flag: "🇮🇶" },
  { name: "伊朗", flag: "🇮🇷" },
  { name: "日本", flag: "🇯🇵" },
  { name: "约旦", flag: "🇯🇴" },
  { name: "韩国", flag: "🇰🇷" },
  { name: "卡塔尔", flag: "🇶🇦" },
  { name: "沙特阿拉伯", flag: "🇸🇦" },
  { name: "乌兹别克斯坦", flag: "🇺🇿" },
  { name: "阿尔及利亚", flag: "🇩🇿" },
  { name: "佛得角", flag: "🇨🇻" },
  { name: "刚果民主共和国", flag: "🇨🇩" },
  { name: "科特迪瓦", flag: "🇨🇮" },
  { name: "埃及", flag: "🇪🇬" },
  { name: "加纳", flag: "🇬🇭" },
  { name: "摩洛哥", flag: "🇲🇦" },
  { name: "塞内加尔", flag: "🇸🇳" },
  { name: "南非", flag: "🇿🇦" },
  { name: "突尼斯", flag: "🇹🇳" },
  { name: "库拉索", flag: "🇨🇼" },
  { name: "海地", flag: "🇭🇹" },
  { name: "巴拿马", flag: "🇵🇦" },
  { name: "阿根廷", flag: "🇦🇷" },
  { name: "巴西", flag: "🇧🇷" },
  { name: "哥伦比亚", flag: "🇨🇴" },
  { name: "厄瓜多尔", flag: "🇪🇨" },
  { name: "巴拉圭", flag: "🇵🇾" },
  { name: "乌拉圭", flag: "🇺🇾" },
  { name: "新西兰", flag: "🇳🇿" },
  { name: "奥地利", flag: "🇦🇹" },
  { name: "比利时", flag: "🇧🇪" },
  { name: "波黑", flag: "🇧🇦" },
  { name: "克罗地亚", flag: "🇭🇷" },
  { name: "捷克", flag: "🇨🇿" },
  { name: "英格兰", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}" },
  { name: "法国", flag: "🇫🇷" },
  { name: "德国", flag: "🇩🇪" },
  { name: "荷兰", flag: "🇳🇱" },
  { name: "挪威", flag: "🇳🇴" },
  { name: "葡萄牙", flag: "🇵🇹" },
  { name: "苏格兰", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}" },
  { name: "西班牙", flag: "🇪🇸" },
  { name: "瑞典", flag: "🇸🇪" },
  { name: "瑞士", flag: "🇨🇭" },
  { name: "土耳其", flag: "🇹🇷" },
];

const teamFlags = Object.fromEntries(officialQualifiedTeams.map((team) => [team.name, team.flag]));

const defaultTeams = [
  "阿根廷",
  "墨西哥",
  "法国",
  "哥伦比亚",
  "巴西",
  "日本",
  "英格兰",
  "美国",
  "西班牙",
  "摩洛哥",
  "德国",
  "韩国",
  "葡萄牙",
  "乌拉圭",
  "荷兰",
  "克罗地亚",
];

const state = {
  teams: [...defaultTeams],
  picks: {},
};

const roundSizes = [16, 8, 4, 2];
const teamEditor = document.querySelector("#teamEditor");
const officialTeams = document.querySelector("#officialTeams");
const bracket = document.querySelector("#bracket");
const chartTitle = document.querySelector("#chartTitle");
const posterTitle = document.querySelector("#posterTitle");
const watermark = document.querySelector("#watermark");
const posterWatermark = document.querySelector("#posterWatermark");
const championName = document.querySelector("#championName");
const poster = document.querySelector("#poster");
const themeSelect = document.querySelector("#themeSelect");
let lineFrame = 0;

function pickKey(roundIndex, matchIndex) {
  return `${roundIndex}-${matchIndex}`;
}

function getRoundTeams(roundIndex) {
  if (roundIndex === 0) {
    return state.teams;
  }

  const previous = getRoundTeams(roundIndex - 1);
  const winners = [];
  for (let index = 0; index < previous.length; index += 2) {
    const key = pickKey(roundIndex - 1, index / 2);
    const selected = state.picks[key];
    const fallback = previous[index] || previous[index + 1] || "";
    winners.push(selected || fallback);
  }
  return winners;
}

function getChampion() {
  const finalists = getRoundTeams(3);
  return state.picks[pickKey(3, 0)] || finalists[0] || "待选择";
}

function clearInvalidPicks() {
  for (let roundIndex = 0; roundIndex < roundSizes.length; roundIndex += 1) {
    const teams = getRoundTeams(roundIndex);
    const matchCount = teams.length / 2;
    for (let matchIndex = 0; matchIndex < matchCount; matchIndex += 1) {
      const key = pickKey(roundIndex, matchIndex);
      const options = [teams[matchIndex * 2], teams[matchIndex * 2 + 1]].filter(Boolean);
      if (state.picks[key] && !options.includes(state.picks[key])) {
        delete state.picks[key];
      }
    }
  }
}

function setPick(roundIndex, matchIndex, team) {
  state.picks[pickKey(roundIndex, matchIndex)] = team;

  for (let laterRound = roundIndex + 1; laterRound < roundSizes.length; laterRound += 1) {
    const keys = Object.keys(state.picks).filter((key) => key.startsWith(`${laterRound}-`));
    keys.forEach((key) => delete state.picks[key]);
  }

  render();
}

function renderTeamEditor() {
  teamEditor.innerHTML = "";
  state.teams.forEach((team, index) => {
    const select = document.createElement("select");
    select.ariaLabel = `第 ${index + 1} 支队伍`;
    officialQualifiedTeams.forEach((qualifiedTeam) => {
      const option = document.createElement("option");
      option.value = qualifiedTeam.name;
      option.textContent = `${qualifiedTeam.flag} ${qualifiedTeam.name}`;
      option.disabled = qualifiedTeam.name !== team && state.teams.includes(qualifiedTeam.name);
      select.append(option);
    });
    select.value = team;
    select.addEventListener("change", () => {
      state.teams[index] = select.value;
      clearInvalidPicks();
      renderTeamEditor();
      renderBracket();
    });
    teamEditor.append(select);
  });
}

function renderOfficialTeams() {
  officialTeams.innerHTML = "";
  officialQualifiedTeams.forEach((team) => {
    const chip = document.createElement("span");
    chip.className = "team-chip";
    chip.textContent = `${team.flag} ${team.name}`;
    officialTeams.append(chip);
  });
}

function renderMatch(roundIndex, matchIndex, teams) {
  const match = document.createElement("div");
  match.className = "match";
  match.dataset.round = roundIndex;
  match.dataset.match = matchIndex;
  const key = pickKey(roundIndex, matchIndex);
  const selected = state.picks[key];

  teams.forEach((team) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "team";
    if (!team) {
      button.classList.add("is-empty");
      button.disabled = true;
    }
    if (selected === team) {
      button.classList.add("is-winner");
    }

    const name = document.createElement("span");
    name.textContent = team ? `${teamFlags[team] || ""} ${team}`.trim() : "待定";
    button.append(name);
    button.addEventListener("click", () => setPick(roundIndex, matchIndex, team));
    match.append(button);
  });

  return match;
}

function renderFinalCard() {
  const card = document.createElement("div");
  card.className = "final-card";
  card.dataset.finalCard = "true";
  card.innerHTML = `<small>冠军</small><strong>${escapeHtml(getChampion())}</strong>`;
  return card;
}

function renderBracket() {
  clearInvalidPicks();
  bracket.innerHTML = "";

  const round16 = getRoundTeams(0);
  const quarters = getRoundTeams(1);
  const semis = getRoundTeams(2);
  const finals = getRoundTeams(3);

  bracket.append(
    createColumn(0, round16.slice(0, 8)),
    createColumn(1, quarters.slice(0, 4)),
    createColumn(2, semis.slice(0, 2)),
    createFinalColumn(finals),
    createColumn(2, semis.slice(2, 4)),
    createColumn(1, quarters.slice(4, 8)),
    createColumn(0, round16.slice(8, 16)),
  );

  championName.textContent = getChampion();
  scheduleLineRender();
}

function createColumn(roundIndex, teams) {
  const column = document.createElement("div");
  column.className = `round round-${roundSizes[roundIndex]}`;
  column.dataset.round = roundIndex;
  for (let index = 0; index < teams.length; index += 2) {
    const globalMatchIndex = getGlobalMatchIndex(roundIndex, teams, index / 2);
    column.append(renderMatch(roundIndex, globalMatchIndex, [teams[index], teams[index + 1]]));
  }
  return column;
}

function createFinalColumn(finals) {
  const column = document.createElement("div");
  column.className = "round round-final";
  column.dataset.round = "final";
  const finalStage = document.createElement("div");
  finalStage.className = "final-stage";
  const finalMatch = renderMatch(3, 0, finals);
  finalMatch.classList.add("final-match");
  finalStage.append(finalMatch, renderFinalCard());
  column.append(finalStage);
  return column;
}

function scheduleLineRender() {
  cancelAnimationFrame(lineFrame);
  lineFrame = requestAnimationFrame(drawBracketLines);
}

function drawBracketLines() {
  const existing = bracket.querySelector(".bracket-lines");
  existing?.remove();

  const rect = {
    width: bracket.clientWidth,
    height: bracket.clientHeight,
  };
  if (!rect.width || !rect.height) {
    return;
  }

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("bracket-lines");
  svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
  svg.setAttribute("preserveAspectRatio", "none");

  const columns = [...bracket.querySelectorAll(".round")];
  connectColumns(svg, rect, columns[0], columns[1], "right");
  connectColumns(svg, rect, columns[1], columns[2], "right");
  connectColumns(svg, rect, columns[2], columns[3], "right", 0);
  connectColumns(svg, rect, columns[6], columns[5], "left");
  connectColumns(svg, rect, columns[5], columns[4], "left");
  connectColumns(svg, rect, columns[4], columns[3], "left", 0);
  connectFinalToChampion(svg, rect, columns[3]);

  bracket.prepend(svg);
}

function connectColumns(svg, bracketRect, fromColumn, toColumn, direction, targetIndexOffset = null) {
  const fromMatches = [...fromColumn.querySelectorAll(".match")];
  const toMatches = [...toColumn.querySelectorAll(".match")];

  fromMatches.forEach((fromMatch, index) => {
    const targetIndex = targetIndexOffset ?? Math.floor(index / 2);
    const toMatch = toMatches[targetIndex];
    if (!toMatch) {
      return;
    }

    drawConnector(svg, bracketRect, fromMatch, toMatch, direction);
  });
}

function connectFinalToChampion(svg, bracketRect, finalColumn) {
  const finalMatch = finalColumn.querySelector(".match");
  const finalCard = finalColumn.querySelector(".final-card");
  if (!finalMatch || !finalCard) {
    return;
  }

  const start = pointFor(finalMatch, bracketRect, "bottom");
  const end = pointFor(finalCard, bracketRect, "top");
  const midY = start.y + (end.y - start.y) * 0.5;
  addPath(svg, `M ${start.x} ${start.y} V ${midY} H ${end.x} V ${end.y}`, true);
}

function drawConnector(svg, bracketRect, fromElement, toElement, direction) {
  const start = pointFor(fromElement, bracketRect, direction === "right" ? "right" : "left");
  const end = pointFor(toElement, bracketRect, direction === "right" ? "left" : "right");
  const midX = start.x + (end.x - start.x) * 0.5;
  addPath(svg, `M ${start.x} ${start.y} H ${midX} V ${end.y} H ${end.x}`, false);
}

function pointFor(element, bracketRect, edge) {
  const rect = localBox(element, bracket);
  const xByEdge = {
    left: rect.left,
    right: rect.left + rect.width,
    top: rect.left + rect.width / 2,
    bottom: rect.left + rect.width / 2,
  };
  const yByEdge = {
    left: rect.top + rect.height / 2,
    right: rect.top + rect.height / 2,
    top: rect.top,
    bottom: rect.top + rect.height,
  };

  return {
    x: xByEdge[edge],
    y: yByEdge[edge],
  };
}

function localBox(element, ancestor) {
  let left = 0;
  let top = 0;
  let current = element;

  while (current && current !== ancestor) {
    left += current.offsetLeft;
    top += current.offsetTop;
    current = current.offsetParent;
  }

  return {
    left,
    top,
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
}

function addPath(svg, d, isChampionPath) {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.classList.add(isChampionPath ? "champion-line" : "connector-line");
  path.setAttribute("d", d);
  svg.append(path);
}

function getGlobalMatchIndex(roundIndex, teamsInColumn, localMatchIndex) {
  if (roundIndex === 0) {
    return teamsInColumn[0] === state.teams[0] ? localMatchIndex : localMatchIndex + 4;
  }
  if (roundIndex === 1) {
    const fullRound = getRoundTeams(1);
    return teamsInColumn[0] === fullRound[0] ? localMatchIndex : localMatchIndex + 2;
  }
  if (roundIndex === 2) {
    const fullRound = getRoundTeams(2);
    return teamsInColumn[0] === fullRound[0] ? localMatchIndex : localMatchIndex + 1;
  }
  return localMatchIndex;
}

function renderPosterMeta() {
  posterTitle.textContent = chartTitle.value.trim() || "世界杯冠军预测";
  posterWatermark.textContent = watermark.value.trim() || " ";
  poster.className = `poster theme-${themeSelect.value}`;
}

function render() {
  renderPosterMeta();
  renderBracket();
}

function randomizePicks() {
  state.picks = {};
  for (let roundIndex = 0; roundIndex < roundSizes.length; roundIndex += 1) {
    const teams = getRoundTeams(roundIndex);
    for (let index = 0; index < teams.length; index += 2) {
      const options = [teams[index], teams[index + 1]].filter(Boolean);
      state.picks[pickKey(roundIndex, index / 2)] = options[Math.floor(Math.random() * options.length)];
    }
  }
  render();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function exportPoster() {
  const canvas = document.createElement("canvas");
  canvas.width = 1960;
  canvas.height = 1440;
  const context = canvas.getContext("2d");
  context.scale(2, 2);
  drawExportPoster(context);

  canvas.toBlob((blob) => {
    if (!blob) {
      alert("导出失败，请再试一次。");
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${getChampion()}-世界杯预测图.png`;
    link.href = url;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}

function drawExportPoster(context) {
  const theme = exportTheme(themeSelect.value);
  const width = 980;
  const height = 720;
  const bracketTop = 158;
  const bracketHeight = 418;

  drawPosterBackground(context, theme, width, height);
  drawExportHeader(context, theme, width);
  drawExportBracket(context, theme, width, bracketTop, bracketHeight);
  drawExportChampionStrip(context, theme, width, height);
}

function exportTheme(themeName) {
  const themes = {
    midnight: { bg1: "#101513", bg2: "#17231d", text: "#f4f7f2", muted: "#a9b7af", accent: "#d8ff5f", line: "rgba(216,255,95,0.58)", card: "rgba(255,255,255,0.07)" },
    paper: { bg1: "#f4efe2", bg2: "#e8dfcb", text: "#172018", muted: "#536157", accent: "#c5142f", line: "rgba(197,20,47,0.55)", card: "rgba(23,32,24,0.05)" },
    electric: { bg1: "#08111f", bg2: "#122344", text: "#f4f7f2", muted: "#a9b7af", accent: "#67e8f9", line: "rgba(103,232,249,0.58)", card: "rgba(255,255,255,0.07)" },
    crimson: { bg1: "#8e1028", bg2: "#420817", text: "#fff6f1", muted: "#f4b7ad", accent: "#ffd15a", line: "rgba(255,209,90,0.6)", card: "rgba(255,246,241,0.08)" },
    gold: { bg1: "#090b0d", bg2: "#2c2412", text: "#fff8df", muted: "#cdbf8b", accent: "#f5c95a", line: "rgba(245,201,90,0.58)", card: "rgba(255,248,223,0.07)" },
    ice: { bg1: "#f8fbfc", bg2: "#d8e8ed", text: "#10212a", muted: "#55707b", accent: "#0a8fbb", line: "rgba(10,143,187,0.58)", card: "rgba(16,33,42,0.06)" },
  };
  return themes[themeName] || themes.crimson;
}

function drawPosterBackground(context, theme, width, height) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, theme.bg1);
  gradient.addColorStop(1, theme.bg2);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.save();
  context.globalAlpha = 0.16;
  context.strokeStyle = theme.text;
  context.lineWidth = 1;
  for (let x = 0; x <= width; x += 44) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y <= height; y += 44) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.restore();
}

function drawExportHeader(context, theme, width) {
  context.fillStyle = theme.accent;
  context.font = "900 14px sans-serif";
  context.textAlign = "left";
  context.fillText("FIFA WORLD CUP", 34, 42);

  context.fillStyle = theme.text;
  context.font = "900 43px sans-serif";
  context.textBaseline = "top";
  drawTextFit(context, chartTitle.value.trim() || "世界杯冠军预测", 34, 54, 640, 48, 43, theme.text, "left");

  context.fillStyle = theme.muted;
  context.font = "800 15px sans-serif";
  context.textAlign = "right";
  context.fillText(watermark.value.trim() || " ", width - 34, 42);
}

function drawExportBracket(context, theme, width, top, height) {
  const championRect = { x: 396, y: top + height / 2 + 82, w: 188, h: 58 };
  const columns = [
    { x: 34, w: 104, teams: getRoundTeams(0).slice(0, 8), round: 0 },
    { x: 164, w: 96, teams: getRoundTeams(1).slice(0, 4), round: 1 },
    { x: 286, w: 86, teams: getRoundTeams(2).slice(0, 2), round: 2 },
    { x: 396, w: 188, teams: getRoundTeams(3), round: 3 },
    { x: 608, w: 86, teams: getRoundTeams(2).slice(2, 4), round: 2 },
    { x: 720, w: 96, teams: getRoundTeams(1).slice(4, 8), round: 1 },
    { x: 842, w: 104, teams: getRoundTeams(0).slice(8, 16), round: 0 },
  ];

  const boxes = [];
  columns.forEach((column, columnIndex) => {
    const count = column.teams.length;
    const boxH = column.round === 3 ? 42 : 36;
    const yList = positionsFor(count / 2, top, height, boxH * 2 + 6);
    for (let i = 0; i < count; i += 2) {
      const y = yList[i / 2];
      const matchIndex = exportMatchIndex(column.round, columnIndex, i / 2);
      const matchTeams = [column.teams[i], column.teams[i + 1]];
      matchTeams.forEach((team, teamOffset) => {
        const rect = {
          x: column.x,
          y: y + teamOffset * (boxH + 6),
          w: column.w,
          h: boxH,
          team,
          round: column.round,
          match: matchIndex,
        };
        boxes.push(rect);
      });
    }
  });

  drawExportConnectors(context, theme, boxes, championRect);
  boxes.forEach((box) => drawTeamBox(context, theme, box));
  drawChampionCard(context, theme, championRect);
}

function positionsFor(matchCount, top, height, matchHeight) {
  if (matchCount === 1) {
    return [top + height / 2 - matchHeight / 2 - 34];
  }
  const available = height - matchHeight;
  return Array.from({ length: matchCount }, (_, index) => top + (available * index) / (matchCount - 1));
}

function exportMatchIndex(round, columnIndex, localIndex) {
  if (round === 0) return columnIndex === 0 ? localIndex : localIndex + 4;
  if (round === 1) return columnIndex === 1 ? localIndex : localIndex + 2;
  if (round === 2) return columnIndex === 2 ? localIndex : localIndex + 1;
  return 0;
}

function drawTeamBox(context, theme, rect) {
  const selected = state.picks[pickKey(rect.round, rect.match)] === rect.team;
  roundRect(context, rect.x, rect.y, rect.w, rect.h, 7);
  context.fillStyle = selected ? transparentize(theme.accent, 0.22) : theme.card;
  context.fill();
  context.strokeStyle = selected ? theme.accent : transparentize(theme.text, 0.22);
  context.lineWidth = selected ? 2 : 1;
  context.stroke();

  const label = `${teamFlags[rect.team] || ""} ${rect.team}`.trim();
  drawTextFit(context, label, rect.x + 8, rect.y + rect.h / 2, rect.w - 16, rect.h - 6, rect.round === 3 ? 14 : 12, theme.text, "left", true);
}

function drawExportConnectors(context, theme, boxes, championRect) {
  context.strokeStyle = theme.line;
  context.lineWidth = 2.5;
  context.lineCap = "round";
  context.lineJoin = "round";

  const grouped = new Map();
  boxes.forEach((box) => grouped.set(`${box.round}-${box.match}-${box.team}`, box));

  for (let round = 0; round < 3; round += 1) {
    const current = getRoundTeams(round);
    const next = getRoundTeams(round + 1);
    for (let i = 0; i < current.length; i += 2) {
      const matchIndex = i / 2;
      const winner = state.picks[pickKey(round, matchIndex)] || current[i];
      const from = grouped.get(`${round}-${matchIndex}-${winner}`);
      const nextMatch = Math.floor(matchIndex / 2);
      const to = grouped.get(`${round + 1}-${nextMatch}-${winner || next[nextMatch]}`);
      if (from && to) {
        connectRects(context, from, to);
      }
    }
  }

  const finalTeams = getRoundTeams(3);
  const champion = getChampion();
  const from = grouped.get(`3-0-${champion}`) || grouped.get(`3-0-${finalTeams[0]}`);
  if (from) {
    connectRects(context, from, championRect);
  }
}

function connectRects(context, from, to) {
  const fromRight = from.x < to.x;
  const sx = fromRight ? from.x + from.w : from.x;
  const sy = from.y + from.h / 2;
  const ex = fromRight ? to.x : to.x + to.w;
  const ey = to.y + to.h / 2;
  const midX = sx + (ex - sx) * 0.5;
  context.beginPath();
  context.moveTo(sx, sy);
  context.lineTo(midX, sy);
  context.lineTo(midX, ey);
  context.lineTo(ex, ey);
  context.stroke();
}

function drawChampionCard(context, theme, rect) {
  roundRect(context, rect.x, rect.y, rect.w, rect.h, 8);
  context.fillStyle = transparentize(theme.accent, 0.18);
  context.fill();
  context.strokeStyle = theme.accent;
  context.lineWidth = 2;
  context.stroke();

  context.fillStyle = theme.muted;
  context.font = "900 13px sans-serif";
  context.textAlign = "center";
  context.fillText("冠军", rect.x + rect.w / 2, rect.y + 19);
  drawTextFit(context, getChampion(), rect.x + 12, rect.y + 38, rect.w - 24, 24, 22, theme.accent, "center");
}

function drawExportChampionStrip(context, theme, width, height) {
  context.strokeStyle = transparentize(theme.text, 0.22);
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(34, height - 72);
  context.lineTo(width - 34, height - 72);
  context.moveTo(34, height - 18);
  context.lineTo(width - 34, height - 18);
  context.stroke();

  context.fillStyle = theme.accent;
  context.font = "900 13px sans-serif";
  context.textAlign = "right";
  context.fillText("冠军预测", width / 2 - 12, height - 38);
  drawTextFit(context, getChampion(), width / 2 + 10, height - 38, 320, 28, 27, theme.accent, "left");
}

function drawTextFit(context, text, x, y, maxWidth, maxHeight, startSize, color, align = "left", centerY = false) {
  let size = startSize;
  context.fillStyle = color;
  context.textAlign = align;
  context.textBaseline = centerY ? "middle" : "alphabetic";
  while (size > 8) {
    context.font = `900 ${size}px sans-serif`;
    if (context.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
  const drawX = align === "center" ? x + maxWidth / 2 : x;
  context.fillText(text, drawX, y);
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function transparentize(hex, alpha) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

document.querySelector("#resetTeams").addEventListener("click", () => {
  state.teams = [...defaultTeams];
  state.picks = {};
  renderTeamEditor();
  render();
});

document.querySelector("#randomize").addEventListener("click", randomizePicks);
document.querySelector("#exportPng").addEventListener("click", exportPoster);
chartTitle.addEventListener("input", renderPosterMeta);
watermark.addEventListener("input", renderPosterMeta);
themeSelect.addEventListener("change", renderPosterMeta);
window.addEventListener("resize", scheduleLineRender);

renderTeamEditor();
renderOfficialTeams();
randomizePicks();
