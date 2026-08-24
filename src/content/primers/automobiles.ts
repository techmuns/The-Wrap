import type { Primer } from "@/types/primer";

const primer: Primer = {
  slug: "automobiles",
  title: "Automobiles",
  category: "Automobiles",
  dek: "Two-wheelers, cars, trucks and tractors — a cyclical, volume-driven business going electric.",
  readingTime: "7 min read",
  sections: [
    {
      heading: "Many markets in one",
      body: [
        "'Autos' is really several businesses: two-wheelers (scooters and motorcycles), passenger vehicles (cars and SUVs), commercial vehicles (trucks and buses), and tractors. Each has its own buyers and cycle.",
        "Two-wheelers and entry cars track the mass consumer and rural economy; commercial vehicles track freight and infrastructure; tractors track the farm economy and monsoon.",
      ],
    },
    {
      heading: "How they make money",
      body: [
        "Automakers earn on the gap between selling price and the cost to build — where steel, aluminium and components are big inputs. Because factories are expensive, running them full (high utilisation) is crucial.",
        "Volume drives everything: more units spread fixed costs and lift margins. Mix matters too — SUVs and premium models earn more than entry models.",
      ],
    },
    {
      heading: "What drives demand",
      body: [
        "Incomes, financing availability and interest rates, fuel prices, and sentiment. Rural health (and the monsoon) swings two-wheelers and tractors; freight activity swings trucks.",
        "Demand is seasonal and cyclical — strong festive seasons and replacement cycles create waves of ups and downs.",
      ],
    },
    {
      heading: "The electric shift",
      body: [
        "Electric vehicles (EVs) are reshaping the industry, fastest in two- and three-wheelers. This is both an opportunity (new products) and a threat (new entrants, changing supply chains).",
        "Government incentives and charging infrastructure influence how quickly EV adoption grows — a key policy-driven swing factor.",
      ],
    },
    {
      heading: "Competitive structure",
      body: [
        "Each segment has a few dominant players with strong brands, dealer networks and scale. Behind them sits a large auto-components industry that supplies parts and often exports.",
        "Watch monthly volume numbers, the product mix, input-cost trends, and EV launches and share.",
      ],
    },
  ],
  players: [
    { name: "Maruti Suzuki", note: "Passenger-car market leader." },
    { name: "Tata Motors", note: "Cars, EVs and commercial vehicles (owns JLR)." },
    { name: "Mahindra & Mahindra", note: "SUVs and tractors leader." },
    { name: "Bajaj Auto", note: "Two- and three-wheelers, big exporter." },
    { name: "Hero MotoCorp", note: "Largest motorcycle maker by volume." },
    { name: "TVS Motor", note: "Two-wheelers with a strong EV push." },
    { name: "Eicher Motors", note: "Royal Enfield mid-size motorcycles." },
    { name: "Ashok Leyland", note: "Commercial-vehicle major (trucks & buses)." },
  ],
  risks: [
    "Cyclical, sentiment-driven demand.",
    "Input-cost swings (steel, aluminium, chips).",
    "EV transition disrupting incumbents.",
    "Monsoon and rural-economy dependence.",
  ],
};

export default primer;
