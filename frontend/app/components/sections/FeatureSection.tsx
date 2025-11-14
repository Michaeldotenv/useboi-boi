import { Utensils, Award, DollarSign } from "lucide-react";

const features = [
  {
    icon: Utensils,
    title: "Magical Atmospheres",
    description:
      "Wonderful serenity has taken possession of my entire soul, like these sweet mornings.",
  },
  {
    icon: Award,
    title: "Best Food Quality",
    description:
      "Wonderful serenity has taken possession of my entire soul, like these sweet mornings.",
  },
  {
    icon: DollarSign,
    title: "Low Expenses Food",
    description:
      "Wonderful serenity has taken possession of my entire soul, like these sweet mornings.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="relative -mt-24 pb-16 z-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-lg p-8 text-center shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-50 mb-6">
                <feature.icon className="h-8 w-8 text-purple-800" />
              </div>

              <h3 className="text-xl font-bold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
