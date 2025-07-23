import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@drabelhealthconsulting.org" },
    update: {},
    create: {
      email: "admin@drabelhealthconsulting.org",
      name: "Dr. Abel Gedefaw",
      role: "ADMIN",
    },
  })

  // Create sample posts
  const samplePost = await prisma.post.upsert({
    where: { slug: "welcome-to-dr-abel-health-consultancy" },
    update: {},
    create: {
      title: "Welcome to Dr. Abel Health Consultancy",
      slug: "welcome-to-dr-abel-health-consultancy",
      content: `
        <h2>Welcome to Our Health Consultancy Platform</h2>
        <p>We are excited to launch our new platform dedicated to advancing health outcomes in Ethiopia and beyond.</p>
        <p>Our mission is to provide evidence-based health consultancy services, conduct high-quality research, and build capacity for better health systems.</p>
        <h3>What We Offer</h3>
        <ul>
          <li>Health consultations for individuals and organizations</li>
          <li>Clinical trial implementation and monitoring</li>
          <li>Research capacity building</li>
          <li>Policy advocacy and development</li>
        </ul>
        <p>Stay tuned for more updates and insights from our team of health professionals.</p>
      `,
      excerpt:
        "Welcome to our new health consultancy platform dedicated to advancing health outcomes in Ethiopia and beyond.",
      published: true,
      publishedAt: new Date(),
      category: "RESEARCH",
      tags: ["welcome", "health", "consultancy"],
      language: "EN",
      authorId: adminUser.id,
      readTime: 3,
    },
  })

  // Create initial version
  await prisma.postVersion.upsert({
    where: {
      postId_version: {
        postId: samplePost.id,
        version: 1,
      },
    },
    update: {},
    create: {
      postId: samplePost.id,
      title: samplePost.title,
      content: samplePost.content,
      version: 1,
    },
  })

  // Create site settings
  const settings = [
    { key: "site_title", value: "Dr. Abel Gedefaw Ali Health Consultancy" },
    {
      key: "site_description",
      value: "Trusted Health Evidence and Consultancy for Policy, Practice, and People in Ethiopia and beyond",
    },
    { key: "contact_email", value: "info@drabelhealthconsulting.org" },
    { key: "contact_phone", value: "+251-XXX-XXXXXX" },
    { key: "office_address", value: "Hawassa, Ethiopia" },
  ]

  for (const setting of settings) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
