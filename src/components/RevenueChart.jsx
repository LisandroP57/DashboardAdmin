import { useMemo } from "react";
import PropTypes from "prop-types";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "@mui/material/styles";
import { formatCurrency } from "../utils/formatters";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export function RevenueChart({ data }) {
  const theme = useTheme();

  const chartData = useMemo(
    () => ({
      labels: data.map((month) => month.label),
      datasets: [
        {
          label: "Ingresos",
          data: data.map((month) => month.revenue),
          borderColor: theme.palette.primary.main,
          backgroundColor: `${theme.palette.primary.main}22`,
          fill: true,
          tension: 0.35,
          yAxisID: "y",
        },
        {
          label: "Pedidos",
          data: data.map((month) => month.orders),
          borderColor: theme.palette.secondary.main,
          backgroundColor: theme.palette.secondary.main,
          borderDash: [6, 4],
          tension: 0.35,
          yAxisID: "y1",
        },
      ],
    }),
    [data, theme],
  );

  const options = useMemo(() => {
    const text = theme.palette.text.secondary;
    const grid = theme.palette.divider;
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "bottom", labels: { color: text, usePointStyle: true } },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ctx.dataset.yAxisID === "y"
                ? `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
                : `${ctx.dataset.label}: ${ctx.parsed.y}`,
          },
        },
      },
      scales: {
        x: { ticks: { color: text }, grid: { display: false } },
        y: {
          position: "left",
          beginAtZero: true,
          ticks: { color: text, callback: (value) => formatCurrency(value) },
          grid: { color: grid },
        },
        y1: { position: "right", beginAtZero: true, ticks: { color: text, precision: 0 }, grid: { drawOnChartArea: false } },
      },
    };
  }, [theme]);

  return (
    <div style={{ height: 320, position: "relative" }}>
      <Line
        data={chartData}
        options={options}
        role="img"
        aria-label="Gráfico de ingresos y cantidad de pedidos de los últimos 12 meses"
      />
    </div>
  );
}

RevenueChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      revenue: PropTypes.number.isRequired,
      orders: PropTypes.number.isRequired,
    }),
  ).isRequired,
};
