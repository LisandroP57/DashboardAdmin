// Datos de demostración. Se generan con un PRNG con semilla fija: siempre salen los
// mismos productos/clientes, y los pedidos se distribuyen en los últimos 12 meses
// respecto de la fecha actual, así los gráficos nunca se ven "viejos".
const DAY = 24 * 60 * 60 * 1000;

const CATALOG = [
  ["electronics", "Auriculares Bluetooth Pro", 45900],
  ["electronics", "Smartwatch Fit 2", 89900],
  ["electronics", "Parlante Portátil Go", 38500],
  ["electronics", "Cargador Rápido 65W", 17900],
  ["home", "Lámpara LED de Escritorio", 14900],
  ["home", "Set de Sábanas Queen", 32900],
  ["home", "Cafetera de Filtro", 52900],
  ["home", "Organizador Modular", 12500],
  ["fashion", "Campera Softshell", 68900],
  ["fashion", "Remera Algodón Básica", 11900],
  ["fashion", "Zapatillas Urbanas", 74900],
  ["fashion", "Mochila Impermeable", 29900],
  ["sports", "Mat de Yoga Pro", 16900],
  ["sports", "Pesas Ajustables 10 kg", 48900],
  ["sports", "Botella Térmica 750 ml", 13900],
  ["sports", "Banda de Resistencia x5", 9900],
  ["toys", "Set de Bloques 500 piezas", 24900],
  ["toys", "Rompecabezas 1000 piezas", 11500],
  ["toys", "Juego de Mesa Estrategia", 27900],
  ["toys", "Muñeco Articulado", 15900],
  ["beauty", "Sérum Facial Vitamina C", 18900],
  ["beauty", "Secador de Pelo Ionic", 43900],
  ["beauty", "Kit de Cuidado Capilar", 21500],
  ["beauty", "Perfume Cítrico 100 ml", 39900],
];

const DESCRIPTIONS = {
  electronics: "Tecnología confiable para el día a día. Garantía oficial de 12 meses.",
  home: "Pensado para mejorar tu hogar con diseño y practicidad.",
  fashion: "Calidad y confort para cualquier ocasión. Disponible en varios talles.",
  sports: "Equipamiento resistente para entrenar dentro y fuera de casa.",
  toys: "Diversión asegurada para toda la familia. Materiales seguros.",
  beauty: "Cuidado personal con ingredientes de calidad. Dermatológicamente testeado.",
};

// Stock fijo en algunos productos para que el panel muestre alertas de stock bajo.
const FORCED_STOCK = { 3: 4, 9: 0, 14: 7, 19: 2 };

const FIRST_NAMES = [
  "Sofía", "Mateo", "Valentina", "Santiago", "Camila", "Benjamín", "Martina", "Lucas", "Julieta", "Tomás",
  "Lucía", "Joaquín", "Agustina", "Nicolás", "Florencia", "Facundo", "Micaela", "Franco", "Carolina", "Emiliano",
  "Paula", "Bruno", "Daniela", "Ignacio", "Rocío", "Gonzalo", "Milagros", "Federico", "Abril", "Matías",
  "Delfina", "Ramiro", "Antonella", "Lautaro", "Victoria", "Sebastián", "Bianca", "Maximiliano", "Noelia", "Damián",
];
const LAST_NAMES = [
  "González", "Rodríguez", "Gómez", "Fernández", "López", "Díaz", "Martínez", "Pérez", "Romero", "Sánchez",
  "García", "Sosa", "Torres", "Ruiz", "Álvarez", "Acosta", "Benítez", "Medina", "Herrera", "Suárez",
  "Aguirre", "Molina", "Castro", "Ortiz", "Silva",
];
const CITIES = ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Mar del Plata", "Salta", "Tucumán", "Neuquén"];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const slug = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

export function generateSeed(now = new Date(), seed = 20260101, orderCount = 380) {
  const rand = mulberry32(seed);
  const int = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const weighted = (entries) => {
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = rand() * total;
    for (const [value, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return value;
    }
    return entries[entries.length - 1][0];
  };

  const products = CATALOG.map(([category, name, price], index) => ({
    id: `prod_${String(index + 1).padStart(3, "0")}`,
    sku: `SKU-${1001 + index}`,
    name,
    description: DESCRIPTIONS[category],
    category,
    price,
    stock: FORCED_STOCK[index] ?? int(12, 90),
    status: "active",
    createdAt: new Date(now.getTime() - int(200, 400) * DAY).toISOString(),
  }));

  const customers = Array.from({ length: 40 }, (_, index) => {
    const name = FIRST_NAMES[index];
    const lastName = pick(LAST_NAMES);
    return {
      id: `cust_${String(index + 1).padStart(3, "0")}`,
      name,
      lastName,
      email: `${slug(name)}.${slug(lastName)}${index + 1}@example.com`,
      phone: `11 ${int(4000, 6999)}-${int(1000, 9999)}`,
      city: pick(CITIES),
      createdAt: new Date(now.getTime() - int(1, 360) * DAY).toISOString(),
    };
  });

  const rawOrders = Array.from({ length: orderCount }, () => {
    const daysAgo = Math.floor(Math.pow(rand(), 1.4) * 364); // más pedidos recientes que antiguos
    const createdAt = new Date(now.getTime() - daysAgo * DAY - int(0, DAY - 1));

    const chosen = new Set();
    const lines = int(1, 4);
    while (chosen.size < lines) chosen.add(pick(products));
    const items = [...chosen].map((product) => ({
      productId: product.id,
      name: product.name,
      category: product.category,
      qty: int(1, 3),
      unitPrice: product.price,
    }));

    const status =
      daysAgo > 20
        ? weighted([["delivered", 86], ["cancelled", 9], ["shipped", 3], ["paid", 2]])
        : daysAgo > 7
          ? weighted([["delivered", 45], ["shipped", 25], ["paid", 15], ["pending", 8], ["cancelled", 7]])
          : weighted([["paid", 35], ["pending", 30], ["shipped", 20], ["delivered", 8], ["cancelled", 7]]);

    return {
      customerId: pick(customers).id,
      items,
      total: items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0),
      status,
      createdAt,
    };
  });

  const orders = rawOrders
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((order, index) => ({ id: `ORD-${1001 + index}`, ...order, createdAt: order.createdAt.toISOString() }));

  return { products, customers, orders };
}
