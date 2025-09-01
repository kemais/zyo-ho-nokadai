// ================== ゲーム基本値 ==================
let day = 1;
let turn = -1;
const maxTurnsPerDay = 4;
const maxDays = 7;

const params = {
  体力: 100,
  幸せ: 50,
  スマホ依存度: 30,
  勉強度: 0,
  眠気: 0,
  _勉強中毒: false,
  _勉強依存エンディング: false,
  _勉強中毒イベント済み: false
};

// ================== 行動効果 ==================
const actionEffects = {
  "散歩する": { 体力:-10, 幸せ:10, 眠気:-5 },
  "ゲームをする": { スマホ依存度:30, 幸せ:5 },
  "昼寝する": { 眠気:-20, 体力:5 },
  "音楽を聴く": { 幸せ:10, 眠気:-5 },
  "電話する": { 幸せ:8, スマホ依存度:10 },
  "掃除する": { 体力:-5, 幸せ:5 },
  "図書館で勉強する": { 勉強度:15, 眠気:10 },
  "カフェに行く": { 幸せ:15, 体力:-5, スマホ依存度:-5 },
  "映画を見る": { 幸せ:20, 眠気:5, スマホ依存度:5 },
  "友達と遊ぶ": { 幸せ:25, 体力:-10 },
  "ランニングする": { 体力:-20, 幸せ:5, 眠気:-10 },
  "料理する": { 幸せ:10, 体力:-5 },
  "買い物する": { 幸せ:15, 体力:-5, スマホ依存度:-5 },
  "温泉に行く": { 体力:20, 幸せ:15, 眠気:-10 },
  "SNSをチェック": { スマホ依存度:20, 幸せ:2 },
  "漫画を読む": { 幸せ:12, 眠気:-5 },
  "昼ごはんを食べる": { 体力:10, 幸せ:5 },
  "夜更かしする": { 幸せ:5, 眠気:20, 体力:-10 },
  "早起きする": { 体力:-5, 幸せ:5, 勉強度:5 },
  "ジョギングする": { 体力:-15, 幸せ:8, 眠気:-5 },
  "ペットと遊ぶ": { 幸せ:20, 体力:-5 }
};

const allActions = Object.keys(actionEffects);
const timeLabels = ["朝","昼","夕方","夜"];

// ================== メッセージ ==================
const actionMessages = {
  "散歩する":["外に出た。","風が気持ちいい。","リフレッシュできた。"],
  "ゲームをする":["ゲームを起動。","夢中でプレイ。","気分がちょっと上向き！"],
  "昼寝する":["横になった。","うとうと……","少しスッキリ。"],
  "音楽を聴く":["イヤホンを装着。","お気に入りの曲が流れる。","気分が上がった！"],
  "電話する":["スマホを手に取った。","会話がはずむ。","気持ちが軽くなった。"],
  "掃除する":["片付け開始。","だいぶキレイに。","気持ちもスッキリ！"],
  "図書館で勉強する":["図書館へ向かった。","ノートを開く。","集中して勉強した！"],
  "カフェに行く":["カフェに到着。","コーヒーの香りが心地よい。","落ち着いた時間を過ごした。"],
  "映画を見る":["映画館の大スクリーン！","笑ったり泣いたり…。","大満足だった。"],
  "友達と遊ぶ":["友達と集合！","笑い声が響く。","楽しい時間を過ごせた。"],
  "ランニングする":["シューズを履いて出発。","汗をかいた。","健康的な気分になった。"],
  "料理する":["材料を準備。","おいしい匂いが広がる。","満足できる料理ができた！"],
  "買い物する":["街へ出かけた。","欲しい物を探す。","いい買い物ができた！"],
  "温泉に行く":["温泉に到着。","湯に浸かる。","心も体もポカポカ！"],
  "SNSをチェック":["スマホを開いた。","色んな投稿を見ている。","時間が溶けていった…。"],
  "漫画を読む":["漫画を開いた。","面白くて止まらない！","気分が晴れた。"],
  "ごはんを食べる":["お腹が空いた。","美味しく食べる。","満足した！"],
  "夜更かしする":["夜が更けていく。","スマホを触ってる。","気づけば深夜…。"],
  "早起きする":["まだ暗い。","少し眠い。","1日を有効に使えそう！"],
  "ジョギングする":["外に出た。","リズムよく走る。","汗をかいて爽快！"],
  "ペットと遊ぶ":["ペットと戯れる。","癒される。","最高の時間！"]
};

// ================== ユーティリティ ==================
function clampParams(){
  for(const k in params){
    if(k.startsWith("_")) continue;
    params[k] = Math.max(0,Math.min(100,params[k]));
  }
}

// ================== プレビュー管理 ==================
let previewedAction = null;
let previewValues = {};

function buildMeter(label,value){
  const wrap = document.createElement("div");
  wrap.className = "param-bar-container";

  const title = document.createElement("div");
  title.className = "param-label";
  title.textContent = `${label}: ${value}`;

  if(previewedAction && previewValues[label]!==undefined){
    const span = document.createElement("span");
    const delta = previewValues[label];
    span.className = delta>=0 ? "preview positive" : "preview negative";
    span.textContent = ` (${delta>=0?"+":""}${delta})`;
    title.appendChild(span);
  }

  const bar = document.createElement("div");
  bar.className = "param-bar";

  const fill = document.createElement("div");
  fill.className = `param-bar-fill bar-${label}`;
  fill.style.width = value + "%";

  bar.appendChild(fill);
  wrap.appendChild(title);
  wrap.appendChild(bar);

  return wrap;
}

function updateMeters(){
  clampParams();
  const box = document.getElementById("statusBox");
  box.innerHTML = "";
  ["体力","幸せ","スマホ依存度","勉強度","眠気"].forEach(k=>{
    box.appendChild(buildMeter(k,params[k]));
  });
  document.getElementById("addictionLabel").style.display = params._勉強中毒?"block":"none";
}

// ================== 選択肢 ==================
function addButton(text,onClick){
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.style.margin = "6px";
  btn.onclick = onClick;
  document.getElementById("choices").appendChild(btn);
}

function getAllowedActions(){
  const currentTime=timeLabels[turn]||"朝";
  return allActions.filter(a=>{
    if(a==="昼寝する"&&!["昼","夕方"].includes(currentTime)) return false;
    if(a==="映画を見る" && currentTime!=="夜") return false;
    if(a==="夜更かしする" && currentTime!=="夜") return false;
    if(a==="早起きする" && currentTime!=="朝") return false;
    return true;
  });
}

function pickRandom(arr,n){
  const copy=[...arr];
  for(let i=copy.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy.slice(0,Math.min(n,copy.length));
}

// ================== 特別イベント ==================
function checkSpecialEvents(){
  const currentTime=timeLabels[turn];
  if(day===1 && currentTime==="朝"){
    const c=document.getElementById("choices");
    c.innerHTML="";
    addButton("ノートを買う",()=>{ params.勉強度+=10; params.スマホ依存度-=5; nextTurn(); });
    addButton("買わない",()=>{ nextTurn(); });
    return true;
  }
  if(day===3 && currentTime==="夜"){
    const c=document.getElementById("choices");
    c.innerHTML="";
    addButton("スマホを見る",()=>{ params.スマホ依存度+=15; params.眠気+=10; nextTurn(); });
    addButton("羊を数える",()=>{ params.幸せ+=5; params.眠気-=10; nextTurn(); });
    return true;
  }
  if(day===5 && currentTime==="昼"){
    const c=document.getElementById("choices");
    c.innerHTML="";
    addButton("遊ぶ",()=>{ params.幸せ+=20; params.勉強度-=10; nextTurn(); });
    addButton("断る",()=>{ params.勉強度+=15; params.幸せ-=5; nextTurn(); });
    return true;
  }
  return false;
}

// ================== 選択肢表示 ==================
function showChoices(){
  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML="";
  previewedAction=null;

  if(checkSpecialEvents()){ updateMeters(); return; }

  const allowed=getAllowedActions();
  const picks=pickRandom(allowed,3);
  picks.forEach(a=>addButton(a,()=>onActionClick(a)));
  updateMeters();
}

// ================== プレビュー + 決定 ==================
function onActionClick(action){
  if(previewedAction!==action){
    previewedAction=action;
    previewAction(action);
  }else{
    applyAction(action);
    previewedAction=null;
    previewValues={};
  }
}

function previewAction(action){
  const eff = actionEffects[action];
  previewValues = {...eff};
  previewValues.眠気=(previewValues.眠気||0)+5;
  updateMeters();
}

function applyAction(action){
  const eff = actionEffects[action];
  for(const k in eff) params[k] += eff[k];
  params.眠気 += 5;

  const msgs = [...(actionMessages[action]||[action+"をした。"])];
  clampParams();
  updateMeters();

  if(params.体力<=0){ triggerAmbulanceEvent(); return; }

  showMessagesSequentially(msgs,()=>{
    if(turn>=maxTurnsPerDay-1){
      day++;
      turn=-1;
      params.眠気=Math.max(0,params.眠気-10);
    }
    nextTurn();
  });
}

// ================== メッセージアニメ ==================
function showMessagesSequentially(messages,done){
  const anim=document.getElementById("animationScreen");
  const text=document.getElementById("animationText");
  document.getElementById("game").style.display="none";
  anim.style.display="block";

  let i=0;
  function step(){
    if(i<messages.length){
      text.textContent=messages[i++];
      setTimeout(step,900);
    }else{
      anim.style.display="none";
      document.getElementById("game").style.display="block";
      done && done();
    }
  }
  step();
}

// ================== ターン進行 ==================
function nextTurn(){
  if(day>maxDays){ showEnding(); return; }
  turn++;
  if(turn>=maxTurnsPerDay){ turn=0; day++; }
  if(day>maxDays){ showEnding(); return; }

  document.getElementById("dayText").textContent=`${day}日目（${timeLabels[turn]}）`;
  showChoices();
}

// ================== アニメーション制御フラグ ==================
let isAnimating = false;

// ================== 救急車イベント ==================
function triggerAmbulanceEvent(){
  if (isAnimating) return;
  isAnimating = true;

  const animArea = document.getElementById("animationScreen");
  const text = document.getElementById("animationText");
  document.getElementById("game").style.display="none";
  animArea.style.display="block";

  // 画面揺れ
  animArea.classList.add("shake");
  setTimeout(()=>animArea.classList.remove("shake"),600);

  text.textContent = "体力が尽きて倒れてしまった！救急車が呼ばれた…";

  // 救急車の絵文字を生成（右→左に走る）
  const ambulance = document.createElement("div");
  ambulance.className = "ambulance";
  ambulance.style.fontSize="96px";
  ambulance.style.position="absolute";
  ambulance.style.top="50%";
  ambulance.style.transform="translateY(-50%)";
  ambulance.textContent = "🚑";
  ambulance.style.left = (window.innerWidth+100)+"px";

  animArea.appendChild(ambulance);

  let pos = window.innerWidth+100;
  const interval = setInterval(()=>{
    pos -= 15; // スピード
    ambulance.style.left = pos + "px";
    if(pos<-200){
      clearInterval(interval);
      animArea.style.display="none";
      animArea.removeChild(ambulance);
      isAnimating = false;
      showEnding("病院送りエンド","無理をしすぎて体力が尽き、救急車で病院に運ばれた。");
    }
  },30);
}
// ================== エンディング ==================
function showEnding(title,desc){
  document.getElementById("game").style.display="none";
  document.getElementById("animationScreen").style.display="none";
  document.getElementById("endingScreen").style.display="block";

  const ending = document.getElementById("endingText");
  if(title && desc){
    ending.textContent = desc;
    unlockEndingByTitle(title);
  } else if(params._勉強依存エンディング){
    ending.textContent="勉強しすぎて人生が勉強一色に… 勉強依存エンド";
    unlockEndingByTitle("勉強廃人");
  } else if(params.スマホ依存度>90){
    ending.textContent="スマホにとりつかれ、現実を見失った…";
    unlockEndingByTitle("スマホ依存エンド");
  } else if(params.幸せ>=90){
    ending.textContent="とても幸せな一週間だった！最高の思い出！";
    unlockEndingByTitle("幸福エンド");
  } else if(params.幸せ<20){
    ending.textContent="全然楽しくなかった一週間だった… 悲しみエンド";
    unlockEndingByTitle("悲しみエンド");
  } else if(params.勉強度>=100){
    ending.textContent="圧倒的勉強量！合格間違いなし！天才エンド！";
    unlockEndingByTitle("天才エンド");
  } else {
    ending.textContent="無事に一週間を終えた… ふつうのエンド";
    unlockEndingByTitle("ふつうのエンド");
  }
}

// ================== エンディングコレクション ==================
let endings = [
  { id: 1, title: "病院送りエンド", description: "体力を削りすぎた末の悲劇。", condition: "体力が0になる", unlocked: false },
  { id: 2, title: "勉強廃人", description: "勉強に取り憑かれた末路…。", condition: "勉強度80以上で勉強を選び続ける", unlocked: false },
  { id: 3, title: "スマホ依存エンド", description: "スマホに囚われた未来。", condition: "スマホ依存度90以上", unlocked: false },
  { id: 4, title: "幸福エンド", description: "幸せいっぱいでハッピー！", condition: "幸せ90以上で最終日", unlocked: false },
  { id: 5, title: "悲しみエンド", description: "楽しくない一週間…。", condition: "幸せ20未満で最終日", unlocked: false },
  { id: 6, title: "天才エンド", description: "努力の結晶！", condition: "勉強度100以上で最終日", unlocked: false },
  { id: 7, title: "ふつうのエンド", description: "波乱なく終わった日々。", condition: "他の条件に当てはまらない", unlocked: false }
];

if(localStorage.getItem("endings")) endings = JSON.parse(localStorage.getItem("endings"));
else localStorage.setItem("endings",JSON.stringify(endings));

function unlockEndingByTitle(title){
  let data = JSON.parse(localStorage.getItem("endings"));
  let target = data.find(e=>e.title===title);
  if(target && !target.unlocked){
    target.unlocked = true;
    localStorage.setItem("endings",JSON.stringify(data));
    alert(`エンディング解放！「${title}」`);
  }
}

function openEndingCollection(){
  let data = JSON.parse(localStorage.getItem("endings"));
  let html = "";
  data.forEach(e=>{
    if(e.unlocked) html += `<p>✅ <b>${e.title}</b><br><i>${e.description}</i></p>`;
    else html += `<p>❓ ???<br><span style="color:gray;">条件ヒント: ${e.condition}</span></p>`;
  });
  document.getElementById("endingList").innerHTML = html;
  document.getElementById("endingModal").style.display="block";
}

function closeEndingCollection(){
  document.getElementById("endingModal").style.display="none";
}

// ================== スタート/リスタート ==================
function resetParams(){
  params.体力=100; params.幸せ=50; params.スマホ依存度=30;
  params.勉強度=0; params.眠気=0;
  params._勉強中毒=false;
  params._勉強依存エンディング=false;
  params._勉強中毒イベント済み=false;
  document.body.style.backgroundColor="";
  updateMeters();
}

function startGame(){
  day=1; turn=-1;
  resetParams();
  document.getElementById("startButton").style.display="none";
  document.getElementById("endingScreen").style.display="none";
  document.getElementById("animationScreen").style.display="none";
  document.getElementById("game").style.display="block";
  nextTurn();
}

function restartGame(){
  day=1; turn=-1;
  resetParams();
  document.getElementById("endingScreen").style.display="none";
  document.getElementById("animationScreen").style.display="none";
  document.getElementById("game").style.display="block";
  nextTurn();
}

// ================== ウィンドウロード ==================
window.onload = () => {
  document.getElementById("game").style.display = "none";
  document.getElementById("animationScreen").style.display = "none";
  document.getElementById("endingScreen").style.display = "none";
  document.getElementById("storyScreen").style.display = "none";

  document.getElementById("startButton").style.display="inline-block";
  document.getElementById("startButton").onclick = showStoryScreen;

  document.getElementById("storyNextButton").onclick = startFromStory;
  document.getElementById("restartButton").onclick = restartGame;

  updateMeters();
};



function showStoryScreen(){
  document.getElementById("startButton").style.display="none";
  document.getElementById("storyScreen").style.display="block";
}

function startFromStory(){
  document.getElementById("storyScreen").style.display="none";
  startGame();
}