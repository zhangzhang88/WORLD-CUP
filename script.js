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
  drawBracketLinesFor(bracket);
}

function drawBracketLinesFor(targetBracket) {
  const existing = targetBracket.querySelector(".bracket-lines");
  existing?.remove();

  const rect = {
    width: targetBracket.clientWidth,
    height: targetBracket.clientHeight,
  };
  if (!rect.width || !rect.height) {
    return;
  }

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("bracket-lines");
  svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
  svg.setAttribute("preserveAspectRatio", "none");

  const columns = [...targetBracket.querySelectorAll(".round")];
  connectColumns(svg, rect, targetBracket, columns[0], columns[1], "right");
  connectColumns(svg, rect, targetBracket, columns[1], columns[2], "right");
  connectColumns(svg, rect, targetBracket, columns[2], columns[3], "right", 0);
  connectColumns(svg, rect, targetBracket, columns[6], columns[5], "left");
  connectColumns(svg, rect, targetBracket, columns[5], columns[4], "left");
  connectColumns(svg, rect, targetBracket, columns[4], columns[3], "left", 0);
  connectFinalToChampion(svg, rect, targetBracket, columns[3]);

  targetBracket.prepend(svg);
}

function connectColumns(svg, bracketRect, targetBracket, fromColumn, toColumn, direction, targetIndexOffset = null) {
  const fromMatches = [...fromColumn.querySelectorAll(".match")];
  const toMatches = [...toColumn.querySelectorAll(".match")];

  fromMatches.forEach((fromMatch, index) => {
    const targetIndex = targetIndexOffset ?? Math.floor(index / 2);
    const toMatch = toMatches[targetIndex];
    if (!toMatch) {
      return;
    }

    drawConnector(svg, bracketRect, targetBracket, fromMatch, toMatch, direction);
  });
}

function connectFinalToChampion(svg, bracketRect, targetBracket, finalColumn) {
  const finalMatch = finalColumn.querySelector(".match");
  const finalCard = finalColumn.querySelector(".final-card");
  if (!finalMatch || !finalCard) {
    return;
  }

  const start = pointFor(finalMatch, bracketRect, "bottom", targetBracket);
  const end = pointFor(finalCard, bracketRect, "top", targetBracket);
  const midY = start.y + (end.y - start.y) * 0.5;
  addPath(svg, `M ${start.x} ${start.y} V ${midY} H ${end.x} V ${end.y}`, true);
}

function drawConnector(svg, bracketRect, targetBracket, fromElement, toElement, direction) {
  const start = pointFor(fromElement, bracketRect, direction === "right" ? "right" : "left", targetBracket);
  const end = pointFor(toElement, bracketRect, direction === "right" ? "left" : "right", targetBracket);
  const midX = start.x + (end.x - start.x) * 0.5;
  addPath(svg, `M ${start.x} ${start.y} H ${midX} V ${end.y} H ${end.x}`, false);
}

function pointFor(element, bracketRect, edge, targetBracket = bracket) {
  const rect = localBox(element, targetBracket);
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
  exportPosterFromDom().catch((error) => {
    console.error("DOM export failed.", error);
    alert("导出失败：浏览器没有成功渲染当前海报，请刷新页面后再试。");
  });
}

function inlineCssText() {
  const styles = [...document.styleSheets]
    .map((sheet) => {
      try {
        return [...sheet.cssRules].map((rule) => rule.cssText).join("\n");
      } catch {
        return "";
      }
    })
    .join("\n");
  return styles.replaceAll("backdrop-filter: blur(16px);", "");
}

async function exportPosterFromDom() {
  drawBracketLines();
  const clone = poster.cloneNode(true);
  clone.style.width = "980px";
  clone.style.height = "720px";
  clone.style.maxWidth = "none";
  clone.style.transform = "none";
  clone.style.margin = "0";
  clone.querySelector(".bracket-lines")?.remove();

  const sandbox = document.createElement("div");
  sandbox.style.position = "fixed";
  sandbox.style.left = "-12000px";
  sandbox.style.top = "0";
  sandbox.style.width = "980px";
  sandbox.style.height = "720px";
  sandbox.style.pointerEvents = "none";
  sandbox.style.opacity = "0";
  sandbox.append(clone);
  document.body.append(sandbox);

  await new Promise((resolve) => requestAnimationFrame(resolve));

  const cloneBracket = clone.querySelector("#bracket");
  drawBracketLinesFor(cloneBracket);

  const markup = new XMLSerializer().serializeToString(clone);
  sandbox.remove();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="980" height="720" viewBox="0 0 980 720">
      <foreignObject width="980" height="720">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <style>${inlineCssText()}</style>
          ${markup}
        </div>
      </foreignObject>
    </svg>
  `;

  const image = new Image();
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1960;
        canvas.height = 1440;
        const context = canvas.getContext("2d");
        context.scale(2, 2);
        context.drawImage(image, 0, 0);
        URL.revokeObjectURL(url);
        downloadCanvas(canvas);
        resolve();
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("无法渲染海报 SVG"));
    };
    image.src = url;
  });
}

function downloadCanvas(canvas) {
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
