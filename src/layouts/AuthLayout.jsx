import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Logo } from "../components/Logo";
import { ThemeToggle } from "../components/ThemeToggle";
import { APP_TAGLINE, AUTHOR } from "../config/app";

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
        <ThemeToggle />
      </Box>

      <Container
        maxWidth="xs"
        component="main"
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", pb: 4 }}
      >
        <Stack alignItems="center" spacing={0.5} sx={{ mb: 3 }}>
          <Logo size={44} />
          <Typography variant="body2" color="text.secondary">
            {APP_TAGLINE}
          </Typography>
        </Stack>

        <Card>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" component="h1" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {subtitle}
              </Typography>
            )}
            {children}
          </CardContent>
        </Card>

        {footer && <Box sx={{ mt: 3, textAlign: "center" }}>{footer}</Box>}
      </Container>

      <Typography variant="caption" color="text.secondary" align="center" sx={{ pb: 2 }}>
        © {new Date().getFullYear()} {AUTHOR}
      </Typography>
    </Box>
  );
}

AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
};
