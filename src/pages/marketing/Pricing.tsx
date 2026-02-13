import { Link } from "react-router";
import { MarketingNav } from "../../components/marketing/MarketingNav";
import { Footer } from "../../components/marketing/Footer";
import { Check } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out Voxa",
    features: [
      "10,000 characters/month",
      "Basic voice options",
      "Google Meet integration",
      "Meeting history (7 days)",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    description: "For regular meeting participants",
    features: [
      "100,000 characters/month",
      "All premium voices",
      "All platform integrations",
      "Unlimited meeting history",
      "Voice customization",
      "Priority support",
      "Analytics dashboard",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams and organizations",
    features: [
      "Unlimited characters",
      "Custom voice training",
      "All platform integrations",
      "Team management",
      "Advanced analytics",
      "Dedicated support",
      "SSO & security features",
      "API access",
    ],
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works best for you
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'border-blue-600 shadow-lg scale-105' : 'border'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center pb-8 pt-8">
                  <h3 className="mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                  </div>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent className="pb-8">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className="block">
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
