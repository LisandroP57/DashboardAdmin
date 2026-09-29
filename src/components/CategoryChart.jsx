import { useMemo } from "react";
import PropTypes from "prop-types";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useTheme } from "@mui/material/styles";
import { formatCurrency } from "../utils/formatters";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ["#4f46e5", "#0ea5e9", "#16a34a", "#f59e0b", "#ec4899", "#8b5cf6"];

export function CategoryChart({ data }) {
  const theme = useTheme();

  const chartData = useMemo(
    () => ({
      labels: data.map((item) => item.label),
      datasets: [
        {
          data: data.map((item) => item.revenue),
          backgroundColor: COLORS,
          borderColor: theme.palette.background.paper,
          borderWidth: 3,
        },
      ],
    }),
    [data, theme],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: { position: "bottom", labels: { color: theme.palette.text.secondary, usePointStyle: true } },
        tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.parsed)}` } },
      },
    }),
    [theme],
  );

  return (
    <div style={{ height: 320, position: "relative" }}>
      <Doughnut data={chartData} options={options} role="img" aria-label="Ingresos por categoría de producto" />
    </div>
  );
}

CategoryChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string.isRequired, revenue: PropTypes.number.isRequired }),
  ).isRequired,
};
