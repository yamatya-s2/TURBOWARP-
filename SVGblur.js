class SvgBlur {
    getInfo() {
        return {
            id: "svgBlur",
            name: "SVGぼかし",
            color1: "#9966FF",
            blocks: [
                {
                    opcode: "blurSvg",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "SVG [SVG] をぼかし [AMOUNT] にしたSVG",
                    arguments: {
                        SVG: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "<svg> ... </svg>"
                        },
                        AMOUNT: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 2
                        }
                    }
                }
            ]
        };
    }

    blurSvg(args) {
        const svgText = String(args.SVG);
        const amount = Scratch.Cast.toNumber(args.AMOUNT);

        // SVG文字列をDOMに変換
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");

        let defs = doc.querySelector("defs");
        if (!defs) {
            defs = doc.createElementNS("http://www.w3.org/2000/svg", "defs");
            doc.documentElement.insertBefore(defs, doc.documentElement.firstChild);
        }

        let filter = doc.querySelector("#scratchBlurFilter");
        if (!filter) {
            filter = doc.createElementNS("http://www.w3.org/2000/svg", "filter");
            filter.setAttribute("id", "scratchBlurFilter");
            defs.appendChild(filter);
        }

        filter.innerHTML = `<feGaussianBlur stdDeviation="${amount}" />`;

        // defs/filter 以外すべてにフィルタ適用
        doc.querySelectorAll("*").forEach(el => {
            if (el.tagName !== "defs" && el.tagName !== "filter" && el.tagName !== "feGaussianBlur") {
                el.setAttribute("filter", "url(#scratchBlurFilter)");
            }
        });

        // DOMをSVG文字列に戻して返す
        const newSVG = new XMLSerializer().serializeToString(doc);
        return newSVG;
    }
}

Scratch.extensions.register(new SvgBlur());
