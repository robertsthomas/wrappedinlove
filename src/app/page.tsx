import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Gift,
  Truck,
  Sparkles,
  Heart,
  Clock,
  CheckCircle2,
  ShoppingBag,
  Package,
  ArrowRight,
  ChevronDown,
  Home,
  Calendar,
} from 'lucide-react';

export default function HomePage() {
  const pickupDeliveryFee = process.env.NEXT_PUBLIC_PICKUP_DELIVERY_FEE || '15';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32 bg-[#1A3D2E] string-lights">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#C9A962]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#E8DFC9]/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              {/* Decorative ribbon */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A962]/20 rounded-full border border-[#C9A962]/30">
                  <Sparkles className="h-4 w-4 text-[#C9A962]" />
                  <span className="text-sm font-medium text-[#E8DFC9]">
                    Now Booking for the Holidays!
                  </span>
                </div>
              </div>

              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-[#E8DFC9] leading-tight">
                Wrapped in{' '}
                <span className="text-[#C9A962] relative">
                  Love
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 120 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 8C30 4 60 2 70 4C90 6 100 8 118 4"
                      stroke="#C9A962"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="font-serif text-xl md:text-2xl lg:text-3xl text-[#C9A962]/90 tracking-wide uppercase">
                Gift Wrapping Service
              </p>

              <p className="text-lg md:text-xl text-[#E8DFC9]/80 max-w-2xl mx-auto leading-relaxed">
                If the holidays have you feeling overwhelmed, we&apos;re here to help! 
                We keep it simple, affordable, and done with love. I&apos;m not a professional—just 
                a mom who enjoys wrapping and wants to give back.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#C9A962] hover:bg-[#DBC07A] text-[#1A3D2E] px-8 py-6 text-lg rounded-full shadow-lg shadow-[#C9A962]/25 hover:shadow-xl hover:shadow-[#C9A962]/30 transition-all font-semibold"
                >
                  <Link href="/book">
                    <Gift className="mr-2 h-5 w-5" />
                    Book Your Wrapping Day
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="text-[#E8DFC9] hover:bg-[#E8DFC9]/10 px-6 py-6 text-lg"
                >
                  <Link href="#how-it-works">
                    Learn How It Works
                    <ChevronDown className="ml-1 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Key info from flyer */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-[#E8DFC9]/70">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#C9A962]" />
                  <span>$35 per 13-gallon bag</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-[#C9A962]" />
                  <span>Free drop-off at our home</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#C9A962]" />
                  <span>3-day turnaround</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-[#F5F0E6]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1A3D2E] mb-4">
                How It Works
              </h2>
              <p className="text-[#4A6358] max-w-xl mx-auto">
                Simple, stress-free gift wrapping in four easy steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: ShoppingBag,
                  title: 'Fill Your Bag',
                  description:
                    'Gather your unwrapped gifts into 13-gallon kitchen bags. One bag = one price, no matter how many gifts!',
                  step: 1,
                },
                {
                  icon: Truck,
                  title: 'Choose Your Service',
                  description:
                    'Drop-off & pick-up for free, or we can pick up and deliver back for $15.',
                  step: 2,
                },
                {
                  icon: Gift,
                  title: 'We Work Our Magic',
                  description:
                    'Within 3 days, we wrap each gift with care using beautiful paper, ribbons, and bows.',
                  step: 3,
                },
                {
                  icon: Heart,
                  title: 'Receive & Delight',
                  description:
                    'Pick up your perfectly wrapped presents, ready to place under the tree!',
                  step: 4,
                },
              ].map((item, index) => (
                <div key={index} className="relative group">
                  <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow bg-white">
                    <CardContent className="p-6 text-center">
                      <div className="relative inline-flex mb-6">
                        <div className="w-16 h-16 rounded-full bg-[#1A3D2E]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <item.icon className="h-8 w-8 text-[#1A3D2E]" />
                        </div>
                        <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#C9A962] text-[#1A3D2E] text-sm font-bold flex items-center justify-center shadow-md">
                          {item.step}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-[#1A3D2E] mb-3">
                        {item.title}
                      </h3>
                      <p className="text-[#4A6358] text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-6 w-6 text-[#C9A962]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1A3D2E] mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-[#4A6358] max-w-xl mx-auto">
                One bag, one price. No hidden fees or surprises.
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <Card className="border-2 border-[#C9A962] shadow-2xl overflow-hidden">
                <div className="bg-[#1A3D2E] p-6 text-center">
                  <Package className="h-12 w-12 text-[#C9A962] mx-auto mb-3" />
                  <h3 className="font-serif text-2xl font-bold text-[#E8DFC9]">
                    Per Bag Pricing
                  </h3>
                </div>
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl md:text-6xl font-bold text-[#1A3D2E]">$35</span>
                      <span className="text-xl text-[#4A6358]">/bag</span>
                    </div>
                    <p className="text-sm text-[#4A6358] mt-2">
                      per 13-gallon kitchen bag
                    </p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {[
                      'Wrapping paper (ours or bring your own!)',
                      'Coordinating ribbons & bows',
                      'Gift tags included',
                      'Careful handling of all items',
                      '3-day turnaround',
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#1A3D2E] flex-shrink-0 mt-0.5" />
                        <span className="text-[#1A3D2E]">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-[#F5F0E6] rounded-lg p-4 mb-6 space-y-2">
                    <p className="text-sm text-center">
                      <span className="font-semibold text-[#1A3D2E]">
                        ✓ Drop-off & Pick-up: Free
                      </span>
                    </p>
                    <p className="text-sm text-center text-[#4A6358]">
                      Pickup & Dropoff (we pick up and deliver back):{' '}
                      <span className="font-semibold text-[#1A3D2E]">+${pickupDeliveryFee}</span>
                    </p>
                  </div>

                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-[#1A3D2E] hover:bg-[#0F2A1F] text-[#E8DFC9] py-6 text-lg rounded-full"
                  >
                    <Link href="/book">
                      Book Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-[#F5F0E6]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1A3D2E] mb-4">
                Why Choose Wrapped in Love?
              </h2>
              <p className="text-[#4A6358] max-w-xl mx-auto">
                More than just wrapping—it&apos;s a gift of time, care, and love
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Clock,
                  title: 'Save Precious Time',
                  description:
                    'Spend your holidays making memories, not wrestling with wrapping paper and tape.',
                },
                {
                  icon: Sparkles,
                  title: 'Professional Quality',
                  description:
                    'Every gift is wrapped with precision and care, creating that picture-perfect moment.',
                },
                {
                  icon: Heart,
                  title: 'Wrapped with Love',
                  description:
                    'We treat every gift as if it were for our own family, because presentation matters.',
                },
                {
                  icon: Truck,
                  title: 'Convenient Options',
                  description:
                    'Free drop-off or pickup service available. We make it easy for you.',
                },
                {
                  icon: Gift,
                  title: 'All Supplies Included',
                  description:
                    'Premium paper, ribbons, bows, and tags—all included in our simple pricing.',
                },
                {
                  icon: CheckCircle2,
                  title: 'Quick Turnaround',
                  description:
                    'Get your beautifully wrapped gifts back within 3 days. Perfect timing!',
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="border-none shadow-md hover:shadow-lg transition-shadow bg-white"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-[#C9A962]/20 flex items-center justify-center mb-4">
                      <item.icon className="h-6 w-6 text-[#C9A962]" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-[#1A3D2E] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[#4A6358] text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1A3D2E] mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-[#4A6358] max-w-xl mx-auto">
                Got questions? We&apos;ve got answers!
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  question: 'What size is a 13-gallon bag?',
                  answer:
                    'A 13-gallon bag is a standard tall kitchen trash bag. It can fit several medium-sized gifts or a few larger items. Bags larger than 13 gallons will be priced as 2 bags.',
                },
                {
                  question: 'Do I need to provide the wrapping paper?',
                  answer:
                    "We use our own wrapping paper, but you're welcome to bring yours if you prefer! We provide ribbons, bows, and gift tags either way.",
                },
                {
                  question: 'How should I organize my gifts?',
                  answer:
                    "Please keep each child's gifts in their own separate bag so nothing gets mixed together. Label the bag with their name!",
                },
                {
                  question: 'How long does wrapping take?',
                  answer:
                    'We have a 3-day turnaround. Drop off your bags and pick them up beautifully wrapped within 3 days!',
                },
                {
                  question: 'What areas do you service?',
                  answer:
                    'We serve Oakleaf, Argyle, and Eagle Landing in Jacksonville, FL. Free drop-off at our home, or pickup/delivery available for $15.',
                },
                {
                  question: 'What payment methods do you accept?',
                  answer:
                    'We accept Cash App, Venmo, or cash at pickup/dropoff. Payment is due when we return your wrapped gifts.',
                },
                {
                  question: 'What if I have an oddly shaped gift?',
                  answer:
                    "Awkward shaped gifts will be wrapped to the best of our ability! We love a challenge and will make sure it looks beautiful.",
                },
                {
                  question: 'Is there a minimum order?',
                  answer:
                    'Nope! Whether you have one bag or ten, we are happy to help. Each bag is $35.',
                },
              ].map((item, index) => (
                <Card key={index} className="border border-[#D4C5A9]/50">
                  <CardContent className="p-6">
                    <h3 className="font-serif text-lg font-semibold text-[#1A3D2E] mb-2">
                      {item.question}
                    </h3>
                    <p className="text-[#4A6358] leading-relaxed">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#1A3D2E] string-lights">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <Gift className="h-16 w-16 text-[#C9A962] mx-auto animate-float" />
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#E8DFC9]">
                Ready to Skip the Stress?
              </h2>
              <p className="text-[#E8DFC9]/80 text-lg">
                Book your wrapping session today and give yourself the gift of time.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-[#C9A962] text-[#1A3D2E] hover:bg-[#DBC07A] px-8 py-6 text-lg rounded-full shadow-xl font-semibold"
              >
                <Link href="/book">
                  Book Your Wrapping Day
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
