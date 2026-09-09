import { algorithmRegistry } from "./algorithms/index.js";

const algorithmCards = document.querySelectorAll(".algorithm-card");

const workspace = document.getElementById("workspace");
const algorithmTitle = document.getElementById("algorithmTitle");
const algorithmDescription = document.getElementById("algorithmDescription");
const roiHint = document.getElementById("roiHint");
const expectedOutputs = document.getElementById("expectedOutputs");

const imageInput = document.getElementById("imageInput");
const imageCanvas = document.getElementById("imageCanvas");
const ctx = imageCanvas.getContext("2d", {
  willReadFrequently: true
});

const statusBox = document.getElementById("statusBox");
const resultContainer = document.getElementById("resultContainer");

const analyzeButton = document.getElementById("analyzeButton");
const clearRoiButton = document.getElementById("clearRoiButton");
const backButton = document.getElementById("backButton");

let currentAlgorithm = null;
let loadedImage = null;
let sourceImageData = null;

let isDrawing = false;
let hasROI = false;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;

function setStatus(message) {
  statusBox.innerHTML = message;
}

function resetResult() {
  resultContainer.innerHTML = `
    <p class="empty-text">
      选择模型、上传图像并框选 ROI 后，分析结果将在此显示。
    </p>
  `;
}

function renderExpectedOutputs(outputs) {
  expectedOutputs.innerHTML = outputs
    .map((item) => `<div class="output-item">${item}</div>`)
    .join("");
}

function selectAlgorithm(algorithmId) {
  const algorithm = algorithmRegistry[algorithmId];

  if (!algorithm) {
    return;
  }

  currentAlgorithm = algorithm;

  algorithmCards.forEach((card) => {
    card.classList.toggle(
      "active",
      card.dataset.algorithm === algorithmId
    );
  });

  algorithmTitle.textContent = `${algorithm.name}分析工作区`;
  algorithmDescription.textContent = algorithm.description;
  roiHint.textContent = algorithm.roiHint;

  renderExpectedOutputs(algorithm.outputs);

  workspace.classList.remove("hidden");

  setStatus(`
    <strong>当前模型：</strong>${algorithm.name}<br />
    请上传图片，然后按要求框选 ROI。
  `);

  resetResult();

  workspace.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function redrawImage() {
  if (!loadedImage) {
    return;
  }

  ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
  ctx.drawImage(loadedImage, 0, 0);
}

function getCanvasPoint(event) {
  const rect = imageCanvas.getBoundingClientRect();

  return {
    x: Math.floor(
      (event.clientX - rect.left) * imageCanvas.width / rect.width
    ),
    y: Math.floor(
      (event.clientY - rect.top) * imageCanvas.height / rect.height
    )
  };
}

function getROI() {
  const x = Math.max(0, Math.min(startX, currentX));
  const y = Math.max(0, Math.min(startY, currentY));

  const width = Math.min(
    imageCanvas.width - x,
    Math.abs(currentX - startX)
  );

  const height = Math.min(
    imageCanvas.height - y,
    Math.abs(currentY - startY)
  );

  return {
    x: Math.floor(x),
    y: Math.floor(y),
    width: Math.floor(width),
    height: Math.floor(height)
  };
}

function drawROI() {
  redrawImage();

  if (!hasROI && !isDrawing) {
    return;
  }

  const roi = getROI();

  if (roi.width < 1 || roi.height < 1) {
    return;
  }

  ctx.save();

  ctx.fillStyle = "rgba(37, 99, 235, 0.16)";
  ctx.fillRect(roi.x, roi.y, roi.width, roi.height);

  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);
  ctx.strokeRect(roi.x, roi.y, roi.width, roi.height);

  ctx.restore();
}

function clearROI() {
  hasROI = false;
  isDrawing = false;

  redrawImage();

  analyzeButton.disabled = true;

  setStatus(`
    <strong>当前状态：</strong>ROI 已清除，请重新选择测试区域。
  `);

  resetResult();
}

function getAnalysisInput() {
  const roi = getROI();

  const roiImageData = ctx.getImageData(
    roi.x,
    roi.y,
    roi.width,
    roi.height
  );

  return {
    roi,
    roiImageData,
    fullImageData: sourceImageData,
    imageWidth: imageCanvas.width,
    imageHeight: imageCanvas.height
  };
}

algorithmCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectAlgorithm(card.dataset.algorithm);
  });
});

imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = (loadEvent) => {
    loadedImage = new Image();

    loadedImage.onload = () => {
      imageCanvas.width = loadedImage.naturalWidth;
      imageCanvas.height = loadedImage.naturalHeight;

      redrawImage();

      sourceImageData = ctx.getImageData(
        0,
        0,
        imageCanvas.width,
        imageCanvas.height
      );

      hasROI = false;

      clearRoiButton.disabled = false;
      analyzeButton.disabled = true;

      setStatus(`
        <strong>图片已加载：</strong>
        ${imageCanvas.width} × ${imageCanvas.height} px。<br />
        请按当前模型要求拖动鼠标框选 ROI。
      `);

      resetResult();
    };

    loadedImage.src = loadEvent.target.result;
  };

  reader.readAsDataURL(file);
});

imageCanvas.addEventListener("mousedown", (event) => {
  if (!loadedImage) {
    return;
  }

  const point = getCanvasPoint(event);

  isDrawing = true;
  hasROI = false;

  startX = point.x;
  startY = point.y;
  currentX = point.x;
  currentY = point.y;
});

imageCanvas.addEventListener("mousemove", (event) => {
  if (!isDrawing || !loadedImage) {
    return;
  }

  const point = getCanvasPoint(event);

  currentX = point.x;
  currentY = point.y;

  drawROI();
});

window.addEventListener("mouseup", (event) => {
  if (!isDrawing || !loadedImage) {
    return;
  }

  isDrawing = false;

  const point = getCanvasPoint(event);

  currentX = Math.max(
    0,
    Math.min(imageCanvas.width, point.x)
  );

  currentY = Math.max(
    0,
    Math.min(imageCanvas.height, point.y)
  );

  const roi = getROI();

  if (roi.width >= 10 && roi.height >= 10) {
    hasROI = true;
    analyzeButton.disabled = false;

    setStatus(`
      <strong>ROI 已选择：</strong>
      坐标 (${roi.x}, ${roi.y})，
      尺寸 ${roi.width} × ${roi.height} px。<br />
      点击“开始分析”运行 ${currentAlgorithm.name} 模块。
    `);
  } else {
    hasROI = false;
    analyzeButton.disabled = true;

    setStatus(`
      <strong>当前状态：</strong>ROI 太小，请重新框选更大的区域。
    `);
  }

  drawROI();
});

clearRoiButton.addEventListener("click", clearROI);

analyzeButton.addEventListener("click", async () => {
  if (!currentAlgorithm || !loadedImage || !hasROI) {
    return;
  }

  try {
    setStatus(`
      <strong>正在分析：</strong>${currentAlgorithm.name}……
    `);

    const analysisInput = getAnalysisInput();

    const result = await currentAlgorithm.analyze(analysisInput);

    currentAlgorithm.renderResult(result, resultContainer);

    setStatus(`
      <strong>分析完成：</strong>${currentAlgorithm.name}。
    `);
  } catch (error) {
    console.error(error);

    setStatus(`
      <strong>分析失败：</strong>${error.message}
    `);

    resultContainer.innerHTML = `
      <div class="result-card">
        <h4>错误信息</h4>
        <p>${error.message}</p>
      </div>
    `;
  }
});

backButton.addEventListener("click", () => {
  workspace.classList.add("hidden");

  document.querySelector(".algorithm-section").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});
