export const slantedEdgeAlgorithm = {
  name: "ISO 12233 斜边法",

  description:
    "通过斜边 ROI 计算 ESF、LSF、MTF、MTF50 和 MTF10。",

  roiHint:
    "选择清晰、高对比度且略微倾斜的边缘。建议倾角为 3°～8°，ROI 至少 100 × 100 px。",

  outputs: [
    "ESF：边缘扩散函数",
    "LSF：线扩散函数",
    "MTF：调制传递函数",
    "MTF50、MTF10",
    "边缘角度与 ROI 信息"
  ],

  async analyze(input) {
    const { roi } = input;

    /*
     * 后续在这里实现：
     *
     * 1. RGB 转线性灰度；
     * 2. 边缘检测；
     * 3. 边缘直线拟合；
     * 4. 亚像素重采样并计算 ESF；
     * 5. ESF 微分得到 LSF；
     * 6. 对 LSF 进行 FFT 得到 MTF；
     * 7. 计算 MTF50、MTF10。
     */

    return {
      roi,
      message: "斜边算法文件已成功被页面调用。",
      esf: [],
      lsf: [],
      mtf: [],
      mtf50: null,
      mtf10: null
    };
  },

  renderResult(result, container) {
    container.innerHTML = `
      <div class="result-card">
        <h4>斜边法分析结果</h4>
        <p><strong>状态：</strong>${result.message}</p>
        <p>
          <strong>ROI：</strong>
          (${result.roi.x}, ${result.roi.y})，
          ${result.roi.width} × ${result.roi.height} px
        </p>
        <p>
          ESF、LSF、MTF 的真实计算逻辑可继续写入
          <code>js/algorithms/slanted-edge.js</code>。
        </p>
      </div>
    `;
  }
};
