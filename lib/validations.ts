import { z } from "zod"

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  serviceType: z
    .enum(["CONSULTATION", "RESEARCH", "CLINICAL_TRIALS", "CAPACITY_BUILDING", "POLICY", "REGULATORY", "OTHER"])
    .optional(),
})

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
  language: z.enum(["EN", "AM", "OR", "TI"]).default("EN"),
})

export const appointmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  serviceType: z.enum([
    "CONSULTATION",
    "RESEARCH",
    "CLINICAL_TRIALS",
    "CAPACITY_BUILDING",
    "POLICY",
    "REGULATORY",
    "OTHER",
  ]),
  preferredDate: z.string().transform((str) => new Date(str)),
  message: z.string().optional(),
})

export const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  excerpt: z.string().optional(),
  category: z.enum([
    "MATERNAL_HEALTH",
    "INFECTIOUS_DISEASES",
    "NON_COMMUNICABLE_DISEASES",
    "CLINICAL_TRIALS",
    "HEALTH_POLICY",
    "NUTRITION",
    "RESEARCH",
    "CAPACITY_BUILDING",
    "DIGITAL_HEALTH",
  ]),
  tags: z.array(z.string()),
  language: z.enum(["EN", "AM", "OR", "TI"]).default("EN"),
  published: z.boolean().default(false),
  featuredImage: z.string().url().optional(),
})

export const testimonialSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().optional(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  rating: z.number().min(1).max(5),
  image: z.string().url().optional(),
})
