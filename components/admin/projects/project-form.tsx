'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ProjectStatus, Priority, ProjectType } from '@prisma/client'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

// Import tab components
import { OverviewTab } from './tabs/overview-tab'
import { DetailsTab } from './tabs/details-tab'
import { TeamTab } from './tabs/team-tab'
import { MilestonesTab } from './tabs/milestones-tab'
import { TasksTab } from './tabs/tasks-tab'

// Form schema using Zod for validation
const projectFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  type: z.nativeEnum(ProjectType, {
    required_error: 'Please select a project type',
  }),
  status: z.nativeEnum(ProjectStatus, {
    required_error: 'Please select a status',
  }),
  priority: z.nativeEnum(Priority, {
    required_error: 'Please select a priority',
  }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  budget: z.coerce.number().min(0).optional(),
  client: z.string().optional(),
  location: z.string().optional(),
  impact: z.string().optional(),
  beneficiaries: z.string().optional(),
  fundingSource: z.string().optional(),
  objectives: z.array(z.string().min(1, 'Objective cannot be empty')),
  outcomes: z.array(z.string().min(1, 'Outcome cannot be empty')),
  partners: z.array(z.string().min(1, 'Partner name cannot be empty')),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  documents: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  teamMembers: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, 'Name is required'),
      role: z.string().min(1, 'Role is required'),
      bio: z.string().optional(),
      image: z.string().optional(),
    })
  ).default([]),
  milestones: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1, 'Title is required'),
      description: z.string().optional(),
      dueDate: z.string().min(1, 'Due date is required'),
      completed: z.boolean().default(false),
    })
  ).default([]),
  tasks: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1, 'Title is required'),
      description: z.string().optional(),
      dueDate: z.string().optional(),
      completed: z.boolean().default(false),
      assignedTo: z.string().optional(),
    })
  ).default([]),
})

type ProjectFormValues = z.infer<typeof projectFormSchema>

interface ProjectFormProps {
  project?: any
  isEdit?: boolean
}

export function ProjectForm({ project, isEdit = false }: ProjectFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Set default values based on whether we're editing or creating
  const defaultValues: Partial<ProjectFormValues> = {
    title: project?.title || '',
    description: project?.description || '',
    content: project?.content || '',
    type: project?.type || ProjectType.OTHER,
    status: project?.status || ProjectStatus.DRAFT,
    priority: project?.priority || Priority.MEDIUM,
    startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    endDate: project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    budget: project?.budget || 0,
    client: project?.client || '',
    location: project?.location || '',
    impact: project?.impact || '',
    beneficiaries: project?.beneficiaries || '',
    fundingSource: project?.fundingSource || '',
    objectives: project?.objectives || [''],
    outcomes: project?.outcomes || [''],
    partners: project?.partners || [''],
    coverImage: project?.coverImage || '',
    gallery: project?.gallery || [],
    documents: project?.documents || [],
    featured: project?.featured || false,
    published: project?.published || false,
    tags: project?.tags || [],
    teamMembers: project?.teamMembers || [],
    milestones: project?.milestones || [],
    tasks: project?.tasks || [],
  }

  // Initialize form with react-hook-form and zod
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  // Calculate progress based on completed milestones
  useEffect(() => {
    const milestones = form.getValues('milestones')
    if (milestones.length > 0) {
      const completed = milestones.filter(m => m.completed).length
      const progress = Math.round((completed / milestones.length) * 100)
      
      // Auto-update status based on progress
      if (progress === 100) {
        form.setValue('status', ProjectStatus.COMPLETED)
      } else if (progress > 0 && form.getValues('status') === ProjectStatus.DRAFT) {
        form.setValue('status', ProjectStatus.IN_PROGRESS)
      }
    }
  }, [form.watch('milestones')])

  // Form submission handler
  async function onSubmit(data: ProjectFormValues) {
    setIsLoading(true)
    
    try {
      const url = isEdit ? `/api/admin/projects/${project.id}` : '/api/admin/projects'
      const method = isEdit ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save project')
      }

      const result = await response.json()
      
      toast({
        title: 'Success',
        description: isEdit ? 'Project updated successfully' : 'Project created successfully',
      })

      // Redirect to project page
      router.push(`/admin/projects/${result.id}`)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save project. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {isEdit ? 'Edit Project' : 'Create New Project'}
              </h2>
              <p className="text-muted-foreground">
                {isEdit 
                  ? 'Update the project details below.'
                  : 'Fill out the form below to create a new project.'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? 'Update Project' : 'Create Project'}
              </Button>
            </div>
          </div>

          <Separator />

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <OverviewTab form={form} />
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <DetailsTab form={form} />
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-4">
              <TeamTab form={form} />
            </TabsContent>

            {/* Milestones Tab */}
            <TabsContent value="milestones" className="space-y-4">
              <MilestonesTab form={form} />
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-4">
              <TasksTab form={form} />
            </TabsContent>
          </Tabs>
        </div>
      </form>
    </Form>
  )
}
