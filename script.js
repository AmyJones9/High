const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spin");
const chancesDiv = document.getElementById("chances");

let chances = 0; // 初始次数为 0
let isSpinning = false;

const prizes = [
  { text: "   98", weight: 0  },
  { text: "   198", weight: 0  },
  { text: "   398", weight: 70 },
  { text: "  598", weight: 30  },
  { text: " 798", weight: 10  },
  { text: " 1066", weight:0 },
  { text: " 3666", weight: 0  },
  { text: " 18666", weight: 0  },
];

const arc = Math.PI * 2 / prizes.length;

// 获取 URL 中的 token 参数
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < prizes.length; i++) {
    const angle = i * arc;
    ctx.fillStyle = i % 2 === 0 ? "#f8b400" : "#ff6f61";
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.arc(150, 150, 150, angle, angle + arc);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(150, 150);
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#202040";
    ctx.font = "16px Noto Sans Bengali";
    ctx.fillText(prizes[i].text, 140, 10);
    ctx.restore();
  }
}

function weightedRandom(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    if (rand < items[i].weight) return i;
    rand -= items[i].weight;
  }
  return 0; // fallback
}

function updateChances() {
  chancesDiv.innerText = "বাকি স্পিন সংখ্যা: " + chances;
}

let currentRotation = 0;

// 初始化
drawWheel();
updateChances();

// 从 localStorage 获取 token 的状态
function checkTokenUsage(token) {
  const usedTokens = JSON.parse(localStorage.getItem("usedTokens")) || [];
  return usedTokens.includes(token);
}

// 设置抽奖次数
function setChancesBasedOnToken(token) {
  const lastChar = token.slice(-1); // 获取最后一位数字
  const times = parseInt(lastChar); // 解析成整数
  chances = times;
  updateChances();
}

// 保存 token 使用记录
function saveTokenUsage(token) {
  let usedTokens = JSON.parse(localStorage.getItem("usedTokens")) || [];
  if (!usedTokens.includes(token)) {
    usedTokens.push(token);
    localStorage.setItem("usedTokens", JSON.stringify(usedTokens));
  }
}

if (token) {
  if (checkTokenUsage(token)) {
    // Token 已使用，设置次数为 0
    chances = 0;
    Swal.fire("দুঃখিত", "আপনি এই টোকেনটি ব্যবহার করেছেন, আর কোন স্পিন নেই!", "warning");
  } else {
    // Token 未使用，设置次数
    setChancesBasedOnToken(token);
    saveTokenUsage(token); // 保存 token 使用记录
  }
}

spinButton.addEventListener("click", () => {
  if (isSpinning || chances <= 0) {
    if (chances <= 0) {
      Swal.fire("দুঃখিত", "আপনার স্পিন সংখ্যা শেষ!", "warning");
    }
    return;
  }

  isSpinning = true;
  chances--;
  updateChances();

  const selected = weightedRandom(prizes);
  const sliceDeg = 360 / prizes.length;
  const randomOffset = Math.random() * sliceDeg - sliceDeg / 2;

  const targetDeg = 360 * 5 - (selected * sliceDeg + sliceDeg / 2) + randomOffset;
  currentRotation = targetDeg % 360;

  canvas.style.transition = "transform 4s ease-out";
  canvas.style.transform = `rotate(${targetDeg}deg)`;

  setTimeout(() => {
    canvas.style.transition = "none";
    canvas.style.transform = `rotate(${currentRotation}deg)`;

    Swal.fire({
      title: "অভিনন্দন!",
      text: "আপনি জিতেছেন: " + prizes[selected].text,
      icon: "success",
      confirmButtonText: "ঠিক আছে"
    });

    isSpinning = false;
  }, 4000);
});
