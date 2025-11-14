import { Button } from "@/components/ui/button";
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

const HeroSection = () => {
  return (
    <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/heromain.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4">
        <p className="text-lg md:text-xl font-light mb-2 tracking-wide">Welcome To</p>
        <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">Order Food</h1>
        
        {/* Decorative Line */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-16 bg-white/60" />
          <p className="text-sm md:text-base font-light tracking-widest">VENUE OF THE BEST FOOD</p>
          <div className="h-px w-16 bg-white/60" />
        </div>

        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-base font-semibold tracking-wide mt-4"
        >
          VIEW MENU
        </Button>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="h-2 w-2 rounded-full bg-white" />
          <div className="h-2 w-2 rounded-full bg-white/50" />
          <div className="h-2 w-2 rounded-full bg-white/50" />
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  return (
    <section className="relative -mt-32 pb-16 z-20">
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

const HeroWithFeatures = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
    </>
  );
};

export default HeroWithFeatures;
