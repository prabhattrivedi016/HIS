import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { useLayoutEffect, useRef } from "react";

function PieChart() {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    // Create root
    const root = am5.Root.new(chartRef.current);

    // Add theme
    root.setThemes([am5themes_Animated.new(root)]);

    // // Create chart
    // const chart = root.container.children.push(
    //   am5percent.PieChart.new(root, {
    //     layout: root.verticalLayout,
    //   })
    // );

    let chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        radius: am5.percent(95),
        innerRadius: am5.percent(50),
      })
    );

    // Data
    const data = [
      { country: "France", sales: 100000 },
      { country: "Spain", sales: 160000 },
      { country: "United Kingdom", sales: 80000 },
    ];

    // Series
    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        name: "Sales",
        valueField: "sales",
        categoryField: "country",
      })
    );

    series.data.setAll(data);

    // Legend
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        layout: root.horizontalLayout,
      })
    );

    legend.data.setAll(series.dataItems);

    // Animate
    series.appear(1000, 100);
    chart.appear(1000, 100);

    // Cleanup
    return () => {
      root.dispose();
    };
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height: "100%" }} />;
}

export default PieChart;
