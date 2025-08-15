class SVGSliceNoiseFixed {
  getInfo () {
    return {
      id: 'svgslicenoisefixed',
      name: 'SVG Slice Noise (Fixed)',
      blocks: [
        {
          opcode: 'sliceNoise',
          blockType: 'reporter',
          text: 'スライスノイズSVG [SVG] 本数[COUNT] 最大ズレ[AMP]px',
          arguments: {
            SVG: { type: 'string', defaultValue: '<svg>...</svg>' },
            COUNT: { type: 'number', defaultValue: 6 },
            AMP: { type: 'number', defaultValue: 5 }
          }
        }
      ]
    };
  }

  // --- viewBox補正 ---
  _fixViewBox(doc) {
    const svgEl = doc.documentElement;
    let vb = svgEl.getAttribute('viewBox');
    if (!vb) return; // ない場合はそのまま
    let [x, y, w, h] = vb.split(/[ ,]+/).map(parseFloat);
    if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) return;

    if (x !== 0 || y !== 0) {
      // 全要素を -x, -y 移動
      doc.querySelectorAll('*').forEach(el => {
        // x属性
        if (el.hasAttribute('x')) {
          el.setAttribute('x', parseFloat(el.getAttribute('x')) - x);
        }
        // y属性
        if (el.hasAttribute('y')) {
          el.setAttribute('y', parseFloat(el.getAttribute('y')) - y);
        }
        // transform属性
        if (el.hasAttribute('transform')) {
          el.setAttribute('transform', `translate(${-x},${-y}) ${el.getAttribute('transform')}`);
        }
      });
      // viewBoxを0,0に置き換え
      svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
    }
  }

  sliceNoise (args) {
    const count = parseInt(args.COUNT) || 1;
    const amp = parseFloat(args.AMP) || 0;
    let svg = args.SVG;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, 'image/svg+xml');

      // viewBox補正
      this._fixViewBox(doc);

      const root = doc.documentElement;
      const width = parseFloat(root.getAttribute('width')) || (root.viewBox && root.viewBox.baseVal.width) || 100;
      const height = parseFloat(root.getAttribute('height')) || (root.viewBox && root.viewBox.baseVal.height) || 100;

      // 元コンテンツを保存
      const original = root.cloneNode(true);
      const children = Array.from(original.childNodes).filter(n => n.nodeType === 1);

      // 元の中身消去
      while (root.firstChild) root.removeChild(root.firstChild);

      const sliceHeight = height / count;
      for (let i = 0; i < count; i++) {
        const dy = i * sliceHeight;
        const tx = (Math.random() * 2 - 1) * amp;

        // clipPath作成
        const clipId = `slice${i}`;
        const clipPath = doc.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clipPath.setAttribute('id', clipId);
        const rect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '0');
        rect.setAttribute('y', dy);
        rect.setAttribute('width', width);
        rect.setAttribute('height', sliceHeight);
        clipPath.appendChild(rect);
        root.appendChild(clipPath);

        // スライスされたグループ
        const g = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('clip-path', `url(#${clipId})`);
        g.setAttribute('transform', `translate(${tx},0)`);

        // 元の中身をコピー
        children.forEach(c => g.appendChild(c.cloneNode(true)));
        root.appendChild(g);
      }

      const serializer = new XMLSerializer();
      return serializer.serializeToString(doc);

    } catch (e) {
      console.error(e);
      return svg;
    }
  }
}

(function () {
  Scratch.extensions.register(new SVGSliceNoiseFixed());
})();
