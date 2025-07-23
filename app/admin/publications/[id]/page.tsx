import { notFound } from "next/navigation"
import { PublicationForm } from "@/components/admin/publications/publication-form"
import { prisma } from "@/lib/prisma"

export default async function EditPublicationPage({
  params,
}: {
  params: { id: string }
}) {
  // Get the publication data
  const publication = await prisma.post.findUnique({
    where: { id: params.id },
  })

  if (!publication) {
    notFound()
  }

  // Format the data for the form
  const initialData = {
    ...publication,
    tags: publication.tags?.join(", ") || "",
    // Convert Date objects to strings for the form
    publishedAt: publication.publishedAt?.toISOString().split("T")[0],
    createdAt: publication.createdAt.toISOString().split("T")[0],
    updatedAt: publication.updatedAt.toISOString().split("T")[0],
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Publication</h1>
      <PublicationForm initialData={initialData} isEdit={true} />
    </div>
  )
}
