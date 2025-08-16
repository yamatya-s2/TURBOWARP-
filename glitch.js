class SVGSliceNoiseLight {
  getInfo () {
    return {
      id: 'svgslicenoiselight',
      name: 'SVG Slice Noise (Light)',
      blocks: [
        {
          opcode: 'sliceNoise',
          blockType: 'reporter',
          text: '軽量スライスノイズSVG [SVG] 本数[COUNT] 最大ズレ[AMP]px',
          arguments: {
            SVG: { type: 'string', defaultValue: '<svg>...</svg>' },
            COUNT: { type: 'number', defaultValue: 6 },
            AMP: { type: 'number', defaultValue: 5 }
          }
        }
      ]
    };
  }

  sliceNoise (args) {
    const count = parseInt(args.COUNT) || 1;
    const amp = parseFloat(args.AMP) || 0;
    let svg = args.SVG;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, 'image/svg+xml');

      const root = doc.documentElement;

      // サイズ取得
      let vb = root.getAttribute('viewBox');
      let width = parseFloat(root.getAttribute('width')) || 100;
      let height = parseFloat(root.getAttribute('height')) || 100;
      if (vb) {
        const parts = vb.split(/[ ,]+/).map(parseFloat);
        if (parts.length === 4) {
          width = parts[2];
          height = parts[3];
        }
      }

      // 元の中身を一度だけ残す (id="src")
      const g = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', 'src');
      while (root.firstChild) g.appendChild(root.firstChild);
      root.appendChild(g);

      const sliceHeight = height / count;
      for (let i = 0; i < count; i++) {
        const dy = i * sliceHeight;
        const tx = (Math.random() * 2 - 1) * amp;

        // クリップ
        const clipId = `clip${i}`;
        const clipPath = doc.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clipPath.setAttribute('id', clipId);
        const rect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '0');
        rect.setAttribute('y', dy);
        rect.setAttribute('width', width);
        rect.setAttribute('height', sliceHeight);
        clipPath.appendChild(rect);
        root.appendChild(clipPath);

        // use参照
        const use = doc.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#src');
        use.setAttribute('clip-path', `url(#${clipId})`);
        use.setAttribute('transform', `translate(${tx},0)`);
        root.appendChild(use);
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
  Scratch.extensions.register(new SVGSliceNoiseLight());
})();
