import Link from "next/link"
import { ChevronRight, Award, Heart, Leaf, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PLACEHOLDER, getTeamFallback } from "@/lib/placeholders"

const values = [
  { icon: Heart, title: "Passion", desc: "Every piece is crafted with love and dedication to the art of woodworking." },
  { icon: Leaf, title: "Sustainability", desc: "We source wood from responsibly managed forests and use eco-friendly finishes." },
  { icon: Award, title: "Quality", desc: "Rigorous quality checks at every stage ensure furniture that lasts generations." },
  { icon: Users, title: "Community", desc: "We empower local artisans and preserve traditional Indian craftsmanship." },
]

const team = [
  { name: "Rajesh Geeta", role: "Founder & Master Craftsman", bio: "With 30 years of experience in woodworking, Rajesh founded Geeta Art to preserve traditional Indian furniture craftsmanship." },
  { name: "Meera Gupta", role: "Head of Design", bio: "Meera blends contemporary aesthetics with traditional forms, creating timeless furniture designs." },
  { name: "Arun Singh", role: "Production Manager", bio: "Arun oversees the workshop, ensuring every piece meets our exacting quality standards." },
  { name: "Priya Kapoor", role: "Customer Experience", bio: "Priya ensures every customer finds the perfect piece for their home." },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-wood-dark py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4 bg-accent/20 text-accent border-none">Our Story</Badge>
          <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">
            Crafting India&apos;s{" "}
            <span className="text-accent">Wooden Legacy</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-wood-border/80 text-lg">
            For over a decade, Geeta Art has been at the heart of India&apos;s handcrafted furniture renaissance — bridging the gap between ancient woodworking traditions and modern living.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold text-wood-dark sm:text-4xl">
                Our <span className="text-primary">Mission</span>
              </h2>
              <p className="mt-4 text-wood-muted leading-relaxed">
                At Geeta Art, we believe that furniture should be more than just functional — it should tell a story. Every piece we create carries the warmth of hand-carved wood, the precision of skilled artisans, and the soul of Indian tradition.
              </p>
              <p className="mt-3 text-wood-muted leading-relaxed">
                Our mission is to bring the beauty of handcrafted wooden furniture to every Indian home while supporting the livelihoods of master craftsmen and preserving techniques passed down through generations.
              </p>
              <div className="mt-6 flex flex-wrap gap-6">
                {[
                  { value: "15+", label: "Years of Excellence" },
                  { value: "200+", label: "Master Artisans" },
                  { value: "5000+", label: "Happy Homes" },
                  { value: "50+", label: "Design Awards" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-serif text-3xl font-bold text-primary">{s.value}</p>
                    <p className="text-xs text-wood-muted mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden">
              <img src={PLACEHOLDER.mission} alt="Our craftsmanship" className="size-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-wood-dark sm:text-4xl">
              What We Stand For
            </h2>
            <p className="mt-3 text-wood-muted max-w-2xl mx-auto">
              Our values shape every piece of furniture we create.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => {
              const Icon = v.icon
              return (
                <Card key={v.title} className="text-center p-8">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon className="size-7 text-primary" />
                  </div>
                  <h3 className="mt-5 font-serif text-lg font-semibold text-wood-dark">{v.title}</h3>
                  <p className="mt-3 text-sm text-wood-muted leading-relaxed">{v.desc}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-wood-dark sm:text-4xl">
              Meet Our Team
            </h2>
            <p className="mt-3 text-wood-muted max-w-2xl mx-auto">
              The passionate people behind Geeta Art.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, i) => (
              <Card key={member.name} className="text-center">
                <div className="relative aspect-square overflow-hidden rounded-t-xl">
                  <img src={getTeamFallback(i)} alt={member.name} className="size-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex size-16 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg">
                    <span className="font-serif text-2xl font-bold">{member.name.charAt(0)}</span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-serif font-semibold text-wood-dark">{member.name}</h3>
                  <p className="text-xs text-primary font-medium mt-0.5">{member.role}</p>
                  <p className="text-sm text-wood-muted mt-2 leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-wood-dark py-16 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
            Ready to Own a Piece of <span className="text-accent">Indian Heritage</span>?
          </h2>
          <p className="mt-4 text-wood-border/80">
            Browse our collection and bring home handcrafted furniture that lasts a lifetime.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/shop">
              <Button size="lg" variant="accent">
                Explore Furniture <ChevronRight className="size-4 ml-1" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="bg-white/10 text-white border border-white/30 hover:bg-white/20">
                Visit Our Workshop
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
