"use client"

import { useState } from "react"
import { Phone, Mail, MapPin, Clock, Send, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface ContactForm {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const contactInfo = [
    { icon: Phone, label: "Call Us", value: "+91 98765 43210", detail: "Mon-Sat, 10AM - 7PM" },
    { icon: Mail, label: "Email Us", value: "hello@geetaart.com", detail: "We reply within 24 hours" },
    { icon: MapPin, label: "Visit Us", value: "123 Woodcraft Lane, Jaipur", detail: "Rajasthan 302001, India" },
    { icon: Clock, label: "Working Hours", value: "10:00 AM - 7:00 PM", detail: "Monday to Saturday" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">Get in Touch</Badge>
        <h1 className="font-serif text-4xl font-bold text-wood-dark sm:text-5xl">
          We&apos;d Love to <span className="text-primary">Hear From You</span>
        </h1>
        <p className="mt-3 text-wood-muted max-w-2xl mx-auto">
          Have a question about our furniture, need customization advice, or want to visit our workshop? We&apos;re here to help.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Contact Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 mb-4">
                    <Check className="size-8 text-green-600" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-wood-dark mb-2">Message Sent!</h3>
                  <p className="text-wood-muted">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h2 className="font-serif text-xl font-semibold text-wood-dark mb-6">Send Us a Message</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Your name"
                        required
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+91 98765 43210"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={form.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        placeholder="How can we help?"
                        required
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={form.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="Tell us more about your query..."
                        rows={5}
                        required
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="mt-6" size="lg">
                    <Send className="size-4 mr-2" /> Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-4">
          {contactInfo.map((info) => {
            const Icon = info.icon
            return (
              <Card key={info.label}>
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-wood-dark text-sm">{info.label}</h3>
                    <p className="text-wood-muted text-sm">{info.value}</p>
                    <p className="text-xs text-wood-muted/70 mt-0.5">{info.detail}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Map Placeholder */}
          <Card>
            <CardContent className="p-0 overflow-hidden rounded-xl">
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="size-10 text-primary/40 mx-auto" />
                  <p className="text-sm text-wood-muted mt-2">Map Loading</p>
                  <p className="text-xs text-wood-muted/60">123 Woodcraft Lane, Jaipur</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
