import { useRef, useState } from "react";

const BUTTONS = [
  // Row 1 - functions
  { label: "log", type: "fn", fn: "log(" },
  { label: "ln", type: "fn", fn: "ln(" },
  { label: "√", type: "fn", fn: "sqrt(" },
  // Row 2 - functions cont
  { label: "x²", type: "fn", fn: "**2" },
  { label: "xⁿ", type: "fn", fn: "**" },
  { label: "³√", type: "fn", fn: "cbrt(" },
  // Row 3 - constants + misc
  { label: "π", type: "const", fn: "π" },
  { label: "e", type: "const", fn: "e" },
  { label: "EXP", type: "fn", fn: "e+" },
  { label: "abs", type: "fn", fn: "abs(" },
  { label: "floor", type: "fn", fn: "floor(" },
  { label: "ceil", type: "fn", fn: "ceil(" },
  // Row 4 - ops + digits
  { label: "(", type: "op", fn: "(" },
  { label: ")", type: "op", fn: ")" },
  { label: "%", type: "op", fn: "%" },
  { label: "^", type: "op", fn: "**" },
  { label: "!", type: "fn", fn: "!" },
  { label: "1/x", type: "fn", fn: "1/(" },
  // Row 5
  { label: "7", type: "num", fn: "7" },
  { label: "8", type: "num", fn: "8" },
  { label: "9", type: "num", fn: "9" },
  { label: "+", type: "op", fn: "+" },
  { label: "−", type: "op", fn: "-" },
  { label: "DEL", type: "action", fn: "DEL" },
  // Row 6
  { label: "4", type: "num", fn: "4" },
  { label: "5", type: "num", fn: "5" },
  { label: "6", type: "num", fn: "6" },
  { label: "×", type: "op", fn: "*" },
  { label: "÷", type: "op", fn: "/" },
  { label: "AC", type: "action", fn: "AC" },
  // Row 7
  { label: "1", type: "num", fn: "1" },
  { label: "2", type: "num", fn: "2" },
  { label: "3", type: "num", fn: "3" },
  { label: ".", type: "num", fn: "." },
  { label: "0", type: "num", fn: "0" },
  { label: "=", type: "equals", fn: "=" },
];

function factorial(n) {
  n = Math.floor(n);
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function evaluateFormula(raw) {
  // Replace display symbols with JS math
  let expr = raw
    .replace(/π/g, String(Math.PI))
    .replace(/\be\b/g, String(Math.E))
    .replace(/log\(/g, "Math.log10(")
    .replace(/ln\(/g, "Math.log(")
    .replace(/sqrt\(/g, "Math.sqrt(")
    .replace(/cbrt\(/g, "Math.cbrt(")
    .replace(/abs\(/g, "Math.abs(")
    .replace(/floor\(/g, "Math.floor(")
    .replace(/ceil\(/g, "Math.ceil(")
    .replace(/(\d+(?:\.\d+)?)!/g, (_, n) => factorial(parseFloat(n)));

  // Auto-close open parens
  const opens = (expr.match(/\(/g) || []).length;
  const closes = (expr.match(/\)/g) || []).length;
  expr += ")".repeat(Math.max(0, opens - closes));

  // eslint-disable-next-line no-new-func
  const result = Function('"use strict"; return (' + expr + ")")();
  return result;
}

function formatResult(val) {
  if (typeof val !== "number") return "Error";
  if (!isFinite(val)) return val === Infinity ? "∞" : val === -Infinity ? "-∞" : "NaN";
  if (Math.abs(val) > 1e15 || (Math.abs(val) < 1e-10 && val !== 0)) {
    return val.toExponential(8).replace(/\.?0+e/, "e");
  }
  const s = parseFloat(val.toPrecision(12));
  return String(s);
}

export default function ScientificCalculator() {
  const [formula, setFormula] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState(false);
  const [flash, setFlash] = useState(false);
  const formulaRef = useRef(null);

  const handleButton = (btn: string) => {
    if (btn.fn === "AC") {
      setFormula("");
      setResult("");
      setError(false);
      return;
    }

    if (btn.fn === "DEL") {
      setFormula(f => f.slice(0, -1));
      return;
    }

    if (btn.fn === "=") {
      try {
        const val = evaluateFormula(formula);
        const res = formatResult(val);
        setResult(res);
        setError(false);
        setFlash(true);
        setTimeout(() => setFlash(false), 300);
      } catch {
        setResult("Error");
        setError(true);
      }
      return;
    }

    if (btn.fn === "**2") {
      setFormula(f => f + "**2");
      return;
    }

    setFormula(f => f + btn.fn);
  };

  return (
    <div className="flex-2 bg-gray-100 flex justify-center items-start p-8 font-mono">
      <div className="flex gap-8 w-full max-w-6xl">
        {/* LEFT SIDE - KEYPAD */}
        <div className="bg-white rounded-2xl shadow-lg border p-6 min-w-[380px]">
          {/* BUTTON GRID */}
          <div className="grid grid-cols-6 gap-2">
            {BUTTONS.map((btn, i) => (
              <button
                key={i}
                onClick={() => handleButton(btn)}
                className={`
                  h-12 rounded-lg text-sm font-medium transition active:scale-95
                  ${btn.type === "fn" && "bg-teal-50 text-teal-600 border border-teal-200"}
                  ${
                    btn.type === "const" &&
                    "bg-purple-50 text-purple-600 border border-purple-200 font-bold"
                  }
                  ${
                    btn.type === "op" &&
                    "bg-amber-50 text-amber-600 border border-amber-200 text-lg font-semibold"
                  }
                  ${
                    btn.type === "num" &&
                    "bg-white text-gray-800 border border-gray-200 text-lg font-semibold"
                  }
                  ${
                    btn.type === "action" &&
                    "bg-red-50 text-red-600 border border-red-200 font-bold"
                  }
                  ${
                    btn.type === "equals" &&
                    "bg-linear-to-br from-teal-600 to-teal-700 text-white text-xl font-bold shadow-md"
                  }
                `}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE - DISPLAY */}
        <div className="flex flex-col gap-6 flex-1 max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border p-6">
            <div className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-semibold">
              Formula
            </div>

            <div
              ref={formulaRef}
              className={`
                bg-gray-50 border rounded-lg p-4 min-h-[60px] text-lg tracking-wide overflow-x-auto whitespace-nowrap
                ${error ? "border-red-300 bg-red-50" : "border-gray-200"}
              `}
            >
              {formula || <span className="text-gray-300 italic">Enter expression…</span>}
            </div>

            <div className="flex items-center gap-4 mt-4">
              <span className="text-2xl text-gray-400">=</span>

              <div
                className={`
                  flex-1 text-right text-3xl font-bold tracking-wide rounded-lg p-3 border overflow-x-auto whitespace-nowrap transition
                  ${flash ? "bg-teal-50 border-teal-300" : "bg-gray-50 border-gray-200"}
                  ${error ? "text-red-600 bg-red-50 border-red-300" : "text-teal-600"}
                `}
              >
                {result || <span className="text-gray-300 italic">—</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
