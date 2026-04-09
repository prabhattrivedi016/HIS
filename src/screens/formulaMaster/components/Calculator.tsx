import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { FormulaComponent, ObservationItem } from "../types";

type CalculatorButton = {
  typeId: "2";
  type: "operator" | "numbers";
  component: string;
};

const BUTTONS: CalculatorButton[] = [
  // Row 1 - functions
  { typeId: "2", type: "operator", component: "+" },
  { typeId: "2", type: "operator", component: "-" },
  { typeId: "2", type: "operator", component: "*" },
  { typeId: "2", type: "operator", component: "/" },

  { typeId: "2", type: "operator", component: "(" },
  { typeId: "2", type: "operator", component: ")" },
  { typeId: "2", type: "operator", component: "%" },
  { typeId: "2", type: "operator", component: "." },
  { typeId: "2", type: "operator", component: "**" },

  { typeId: "2", type: "numbers", component: "1" },
  { typeId: "2", type: "numbers", component: "2" },
  { typeId: "2", type: "numbers", component: "3" },

  { typeId: "2", type: "numbers", component: "4" },
  { typeId: "2", type: "numbers", component: "5" },
  { typeId: "2", type: "numbers", component: "6" },
  { typeId: "2", type: "numbers", component: "7" },
  { typeId: "2", type: "numbers", component: "8" },
  { typeId: "2", type: "numbers", component: "9" },
  { typeId: "2", type: "numbers", component: "0" },
];

type ScientificCalculatorProps = {
  investigationValue?: ObservationItem | null;
  setFormula: Dispatch<SetStateAction<string>>;
  formula: string;
  setFormulaComponents: Dispatch<SetStateAction<FormulaComponent[]>>;
};

export default function ScientificCalculator({
  investigationValue,
  setFormula,
  formula,
  setFormulaComponents,
}: ScientificCalculatorProps) {
  const formulaRef = useRef<HTMLDivElement | null>(null);

  const handleButton = (btn: CalculatorButton) => {
    // update UI formula
    setFormula(prev => prev + btn.component);

    // update main formulaComponents (from parent)
    setFormulaComponents(prev => [
      ...prev,
      {
        typeId: "2",
        type: btn.type === "numbers" ? "numbers" : "operator",
        component: btn.component,
        sequenceNo: String(
          (prev.length ? Math.max(...prev.map(v => Number(v.sequenceNo))) : 0) + 1
        ),
      },
    ]);
  };

  useEffect(() => {
    if (investigationValue) {
      setFormula(prev => prev + investigationValue?.observationName);
    }
  }, [investigationValue]);
  return (
    <div className="flex-2 -ml-8 -mt-4 flex justify-center items-start p-8 font-mono">
      <div className="flex gap-4 w-full max-w-6xl items-stretch">
        {/* keypad */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-300 p-3 min-w-[300px] flex-1">
          {/* button grid*/}
          <div className="grid grid-cols-4 gap-2">
            {BUTTONS.map((btn, i) => (
              <button
                key={i}
                onClick={() => handleButton(btn)}
                className={`
                  h-12 rounded-lg text-sm font-medium transition active:scale-95
                 
                  ${
                    btn.type === "operator" &&
                    "bg-amber-50 text-amber-600 border border-amber-200 text-lg font-semibold"
                  }
                  ${
                    btn.type === "numbers" &&
                    "bg-white text-gray-800 border border-gray-200 text-lg font-semibold"
                  }
                  
                `}
              >
                {btn?.component}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-2 min-w-[500px] ">
          Formula
          {/* FORMULA DISPLAY */}
          <div
            ref={formulaRef}
            className={`
        bg-gray-50 border rounded-lg p-4 min-h-40 text-lg tracking-wide
        overflow-x-auto whitespace-nowrap border-gray-300
       
      `}
          >
            {formula}
          </div>
        </div>
      </div>
    </div>
    // </div>
  );
}
