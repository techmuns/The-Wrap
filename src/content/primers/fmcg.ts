import type { Primer } from "@/types/primer";

const primer: Primer = {
  slug: "fmcg",
  title: "FMCG (Consumer Staples)",
  category: "Consumer",
  dek: "Small everyday purchases, sold to a billion people — steady, brand-driven, and defensive.",
  readingTime: "6 min read",
  sections: [
    {
      heading: "What FMCG is",
      body: [
        "Fast-Moving Consumer Goods are the low-cost, frequently-bought products in every home: soap, shampoo, biscuits, tea, packaged food, cleaning products.",
        "Because people buy them regardless of the economy, these businesses are 'defensive' — steady demand, strong cash flows, and less cyclical than most sectors.",
      ],
    },
    {
      heading: "The money is in brands and distribution",
      body: [
        "Products are cheap and similar, so brands and reach are the real moats. A trusted brand can charge a little more; a distribution network reaching millions of tiny shops is very hard to replicate.",
        "The two questions that matter: can the company raise prices without losing customers, and can it get products onto every shelf, in cities and villages alike?",
      ],
    },
    {
      heading: "The economics",
      body: [
        "Growth splits into volume (more units sold) and value (higher prices/premium mix). Healthy growth is volume-led; price-led growth alone can mask weak demand.",
        "Raw materials — palm oil, crude derivatives, packaging, grains — drive gross margins. When input costs fall, margins expand; advertising spend is the big discretionary cost.",
      ],
    },
    {
      heading: "What drives demand",
      body: [
        "Rural vs urban trends, inflation (which squeezes household budgets), and premiumisation as incomes rise. Monsoon and government rural spending swing village demand.",
        "New channels — modern retail, e-commerce and quick-commerce — are reshaping how and where people buy, and who wins.",
      ],
    },
    {
      heading: "Competitive structure",
      body: [
        "A few large players dominate most categories, competing with regional and increasingly with direct-to-consumer challenger brands.",
        "Watch volume growth, gross margins vs input costs, rural-vs-urban commentary, and how companies are adapting to quick-commerce.",
      ],
    },
  ],
  players: [
    { name: "Hindustan Unilever", note: "The largest FMCG company; home & personal care." },
    { name: "ITC", note: "Cigarettes plus a fast-growing packaged-foods arm." },
    { name: "Nestlé India", note: "Packaged foods and beverages (Maggi, KitKat)." },
    { name: "Britannia Industries", note: "Biscuits and bakery leader." },
    { name: "Dabur India", note: "Ayurvedic/natural-positioned products." },
    { name: "Marico", note: "Hair oils and edible oils (Parachute, Saffola)." },
    { name: "Godrej Consumer", note: "Home and personal care." },
    { name: "Varun Beverages", note: "PepsiCo's bottler — beverages distribution." },
  ],
  risks: [
    "Raw-material (commodity) cost inflation.",
    "Weak rural demand or high inflation squeezing budgets.",
    "Competition from regional and D2C brands.",
    "Channel disruption (quick-commerce) pressuring margins.",
  ],
};

export default primer;
