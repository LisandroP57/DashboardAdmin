import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import { CategoryChart } from "../../components/CategoryChart";
import { KpiCard } from "../../components/KpiCard";
import { PageHeader } from "../../components/PageHeader";
import { RevenueChart } from "../../components/RevenueChart";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateViews";
import { OrderStatusChip, StockChip } from "../../components/StatusChips";
import { ROUTES } from "../../config/app";
import { useAsync } from "../../hooks/useAsync";
import { getDashboardData } from "../../services/analyticsService";
import { formatCurrency, formatDate, formatNumber } from "../../utils/formatters";

export default function DashboardPage() {
  const { data, error, reload } = useAsync(() => getDashboardData());

  if (error && !data) return <ErrorState onRetry={reload} />;
  if (!data) return <LoadingState label="Cargando indicadores…" />;

  const { kpis, monthly, byCategory, topProducts, lowStock, recentOrders } = data;
  const maxUnits = Math.max(1, ...topProducts.map((product) => product.units));

  return (
    <>
      <PageHeader
        title="Resumen general"
        subtitle="Indicadores de los últimos 30 días, comparados con los 30 días anteriores."
      />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Ingresos"
            value={formatCurrency(kpis.revenue.value)}
            change={kpis.revenue.change}
            icon={<PaymentsIcon />}
            hint="vs. período previo"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Pedidos"
            value={formatNumber(kpis.orders.value)}
            change={kpis.orders.change}
            icon={<ReceiptLongIcon />}
            hint="sin cancelados"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Ticket promedio"
            value={formatCurrency(kpis.averageTicket.value)}
            change={kpis.averageTicket.change}
            icon={<ShoppingBasketIcon />}
            hint="por venta confirmada"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Clientes nuevos"
            value={formatNumber(kpis.newCustomers.value)}
            change={kpis.newCustomers.change}
            icon={<GroupAddIcon />}
            hint="vs. período previo"
          />
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Ingresos y pedidos" subheader="Últimos 12 meses" />
            <CardContent>
              <RevenueChart data={monthly} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Ventas por categoría" subheader="Ventas confirmadas, último año" />
            <CardContent>
              {byCategory.length > 0 ? <CategoryChart data={byCategory} /> : <EmptyState title="Sin ventas registradas" />}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Card sx={{ height: "100%" }}>
            <CardHeader
              title="Últimos pedidos"
              action={
                <Link component={RouterLink} to={ROUTES.orders} variant="body2" sx={{ mr: 1 }}>
                  Ver todos
                </Link>
              }
            />
            <TableContainer>
              <Table size="small" aria-label="Últimos pedidos">
                <TableHead>
                  <TableRow>
                    <TableCell>Pedido</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell align="right">{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <OrderStatusChip status={order.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Stack spacing={3}>
            <Card>
              <CardHeader title="Más vendidos" subheader="Unidades vendidas" />
              <CardContent sx={{ pt: 0 }}>
                {topProducts.length === 0 ? (
                  <EmptyState title="Todavía no hay ventas" />
                ) : (
                  <List disablePadding>
                    {topProducts.map((product) => (
                      <ListItem key={product.productId} disableGutters sx={{ display: "block" }}>
                        <Stack direction="row" justifyContent="space-between" spacing={2}>
                          <Typography variant="body2" noWrap>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                            {formatNumber(product.units)} u.
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={(product.units / maxUnits) * 100}
                          aria-label={`Unidades vendidas de ${product.name}`}
                          sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                title="Stock crítico"
                subheader={`${kpis.lowStock} producto${kpis.lowStock === 1 ? "" : "s"} para reponer`}
                action={
                  <Link component={RouterLink} to={ROUTES.products} variant="body2" sx={{ mr: 1 }}>
                    Ver productos
                  </Link>
                }
              />
              <CardContent sx={{ pt: 0 }}>
                {lowStock.length === 0 ? (
                  <EmptyState title="Todo el stock está en orden" />
                ) : (
                  <List disablePadding>
                    {lowStock.slice(0, 5).map((product) => (
                      <ListItem key={product.id} disableGutters secondaryAction={<StockChip stock={product.stock} />}>
                        <ListItemText
                          primary={<Box component="span" sx={{ pr: 1 }}>{product.name}</Box>}
                          secondary={product.sku}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
