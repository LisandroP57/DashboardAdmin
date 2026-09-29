# Dashboard Admin · Panel de ventas e inventario
Este es un dashboard para administración de un ecommerce, la primer version fue durante mis estudios en Digital House y utilizaba las APIS Propias, dando solo estadisticas de mi pagina, aca se agregaron: indicadores de ventas, gráficos, gestión de productos, pedidos y clientes.
Es 100% funcional en el navegador, no necesita backend ni base de datos, así que se puede desplegar como sitio estático, una buena practica para poder alojarlo y utilizarlo en mi portfolio, en caso de querer ver otros proyectos podes verlos en la pagina!
PD: Estos son datos ficticios y se guardan en el localStorage de cada visitante.

# Demo rápida:
Cualquier cosa, en la pantalla de login hay un botón de "Probar con la cuenta demo" con la info, o podés crear tu propia cuenta desde *Registrate*.

## Funcionalidades
• Autenticación: registro, login, cierre de sesión, "mantener sesión iniciada", sesiones con vencimiento y rutas protegidas.
  Las contraseñas se guardan con hash (Web Crypto), nunca en texto plano.
• Roles: *Administrador* (todo) y *Gestor* (no puede eliminar productos ni restablecer datos). El rol no se elige al registrarse.
• Resumen: KPIs de los últimos 30 días con variación vs. el período previo (ingresos, pedidos, ticket promedio, clientes nuevos),
  gráfico de ingresos y pedidos por mes, ventas por categoría, más vendidos, pedidos recientes y alertas de stock crítico.
• Productos: tabla con búsqueda, filtros, orden y paginación; alta, edición y baja con validación y confirmación.
• Pedidos: filtro por estado, detalle del pedido y cambio de estado (los pedidos entregados o cancelados quedan bloqueados).
• Clientes: listado con cantidad de pedidos y total comprado.
• Configuración: perfil, tema claro/oscuro (respeta la preferencia del sistema) y restablecimiento de datos de demostración.
• Diseño responsive: accesible a todo tipo de resolucion y con estados de carga, vacío y error.