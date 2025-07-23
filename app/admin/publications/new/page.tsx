import { PublicationForm } from "@/components/admin/publications/publication-form"

export default function NewPublicationPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Add New Publication</h1>
      <PublicationForm />
    </div>
  )
}
