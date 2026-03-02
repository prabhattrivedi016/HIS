import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { useLayoutEffect, useRef } from "react";

const BedSummary = [
  {
    WardName: "GENERAL",
    TotalBed: 34,
    AvailableBed: 0,
    Occupiedbed: 36,
    roomTypeId: 120836,
  },
  {
    WardName: "DAYCARE",
    TotalBed: 26,
    AvailableBed: 5,
    Occupiedbed: 0,
    roomTypeId: 124888,
  },
  {
    WardName: "CCU WARDs",
    TotalBed: 25,
    AvailableBed: 6,
    Occupiedbed: 21,
    roomTypeId: 120879,
  },
  {
    WardName: "EMERGENCY",
    TotalBed: 18,
    AvailableBed: 6,
    Occupiedbed: 4,
    roomTypeId: 120835,
  },
  {
    WardName: "DIALYSIS",
    TotalBed: 15,
    AvailableBed: 1,
    Occupiedbed: 0,
    roomTypeId: 124889,
  },
  {
    WardName: "PEDIA SEMI PV",
    TotalBed: 15,
    AvailableBed: 4,
    Occupiedbed: 11,
    roomTypeId: 120880,
  },
  {
    WardName: "ICU",
    TotalBed: 10,
    AvailableBed: 1,
    Occupiedbed: 9,
    roomTypeId: 120837,
  },
  {
    WardName: "PRIVATE WARD",
    TotalBed: 10,
    AvailableBed: 0,
    Occupiedbed: 9,
    roomTypeId: 120878,
  },
  {
    WardName: "SURGERIE",
    TotalBed: 10,
    AvailableBed: 4,
    Occupiedbed: 6,
    roomTypeId: 131950,
  },
  {
    WardName: "NICU",
    TotalBed: 7,
    AvailableBed: 0,
    Occupiedbed: 6,
    roomTypeId: 120839,
  },
  {
    WardName: "PICU",
    TotalBed: 5,
    AvailableBed: 4,
    Occupiedbed: 1,
    roomTypeId: 120838,
  },
  {
    WardName: "SUPER DELUXE",
    TotalBed: 5,
    AvailableBed: 0,
    Occupiedbed: 5,
    roomTypeId: 120840,
  },
  {
    WardName: "Private General",
    TotalBed: 1,
    AvailableBed: 1,
    Occupiedbed: 0,
    roomTypeId: 127936,
  },
];

export default function NestedDonut() {
  const chartRef = useRef(null);

  useLayoutEffect(() => {
    const root = am5.Root.new(chartRef.current!);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(40),
      })
    );

    const bgColor = root.interfaceColors.get("background");

    // 🟣 INNER SERIES → Occupied
    const occupiedSeries = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        radius: am5.percent(55),
        innerRadius: am5.percent(30),
      })
    );

    occupiedSeries.labels.template.set("forceHidden", true);
    occupiedSeries.ticks.template.set("forceHidden", true);

    // 👉 GAP between slices
    occupiedSeries.slices.template.setAll({
      stroke: bgColor,
      strokeWidth: 4,
    });

    // 🔵 OUTER SERIES → Total Beds
    const totalSeries = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        radius: am5.percent(100),
        innerRadius: am5.percent(60),
      })
    );

    totalSeries.slices.template.setAll({
      stroke: bgColor,
      strokeWidth: 4,
    });

    // Data mapping
    const outerData = BedSummary.map(item => ({
      category: item.WardName,
      value: item.TotalBed,
    }));

    const innerData = BedSummary.map(item => ({
      category: item.WardName,
      value: item.Occupiedbed,
    }));

    occupiedSeries.data.setAll(innerData);
    totalSeries.data.setAll(outerData);

    // Animation
    occupiedSeries.appear(800);
    totalSeries.appear(800);

    return () => {
      root.dispose();
    };
  }, []);
  return (
    <div style={{ width: "100%", height: "450px", overflow: "auto" }}>
      <div ref={chartRef} style={{ minWidth: "600px", height: "350px" }} />
    </div>
  );
}
