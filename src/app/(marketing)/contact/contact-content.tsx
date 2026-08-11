'use client';

import { motion } from 'framer-motion';
import { Mail, MessageCircle, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Please enter a valid email.'),
  company: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

type ContactForm = z.infer<typeof contactSchema>;

export function ContactContent() {
  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', company: '', message: '' },
  });

  const onSubmit = async (data: ContactForm) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success('Message sent! We\'ll get back to you within 4 hours.');
        form.reset();
      } else {
        const body = await res.json();
        toast.error(body.error || 'Something went wrong.');
      }
    } catch {
      toast.error('Network error. Please check your connection and try again.');
    }
  };

  return (
    <>
      {/* Header */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#09090B] tracking-tight">Contact Us</h1>
            <p className="mt-4 text-lg text-[#52525B]">
              Have a question, feature request, or just want to say hello? We reply within 4 hours.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" className="rounded-lg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@company.com" className="rounded-lg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Company name (optional)" className="rounded-lg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="How can we help?" rows={5} className="rounded-lg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="w-full sm:w-auto bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg"
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="rounded-xl border border-[#E4E4E7] p-6">
                <h3 className="text-sm font-semibold text-[#09090B] mb-4">Other Ways to Reach Us</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-[#0891B2] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-[#09090B]">Email</p>
                      <p className="text-sm text-[#52525B]">support@reliastra.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageCircle className="h-5 w-5 text-[#0891B2] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-[#09090B]">Discord</p>
                      <p className="text-sm text-[#52525B]">
                        <a href="https://discord.gg/relistra" target="_blank" rel="noopener noreferrer" className="text-[#0891B2] hover:underline">
                          discord.gg/relistra
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-[#0891B2] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-[#09090B]">Response Time</p>
                      <p className="text-sm text-[#52525B]">We reply within 4 hours during business hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
