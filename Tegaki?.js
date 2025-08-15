class SVGNoise {
  getInfo () {
    return {
      id: 'svgnoise',
      name: 'SVG Noise',
      blocks: [
        {
          opcode: 'noise',
          blockType: 'reporter',
          text: 'ノイズ化SVG [SVG] 揺れ[AMP]px',
          arguments: {
            SVG: { type: 'string', defaultValue: '<svg>...</svg>' },
            AMP: { type: 'number', defaultValue: 2 }
          }
        }
      ]
    };
  }

  noise (args) {
    const amp = parseFloat(args.AMP) || 0;
    let svg = args.SVG;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, 'image/svg+xml');

      doc.querySelectorAll('path').forEach(path => {
        let d = path.getAttribute('d');
        if (!d) return;

        // 数字を±ampでランダムに揺らす
        d = d.replace(/-?\d+(\.\d+)?/g, num => {
          let n = parseFloat(num);
          if (isNaN(n)) return num;
          return (n + (Math.random() * 2 - 1) * amp).toFixed(2);
        });

        path.setAttribute('d', d);
      });

      const serializer = new XMLSerializer();
      return serializer.serializeToString(doc);

    } catch (e) {
      console.error(e);
      return svg;
    }
  }
}

(function () {
  Scratch.extensions.register(new SVGNoise());
})();
