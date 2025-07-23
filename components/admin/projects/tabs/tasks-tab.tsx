import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
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
import { Progress } from '@/components/ui/progress'

type Task = {
  id?: string
  title: string
  description: string
  dueDate: string
  completed: boolean
  assignedTo: string
}

export function TasksTab({ form }: { form: any }) {
  // Add new task
  const addTask = () => {
    const currentTasks = form.getValues('tasks')
    form.setValue('tasks', [
      ...currentTasks,
      { 
        title: '', 
        description: '', 
        dueDate: new Date().toISOString().split('T')[0],
        completed: false,
        assignedTo: ''
      },
    ])
  }

  // Remove task
  const removeTask = (index: number) => {
    const currentTasks = form.getValues('tasks')
    form.setValue('tasks', currentTasks.filter((_: any, i: number) => i !== index))
  }

  // Toggle task completion
  const toggleTask = (index: number) => {
    const currentTasks = [...form.getValues('tasks')]
    currentTasks[index].completed = !currentTasks[index].completed
    form.setValue('tasks', currentTasks)
  }

  // Calculate progress
  const calculateProgress = () => {
    const tasks = form.getValues('tasks')
    if (tasks.length === 0) return 0
    const completed = tasks.filter((t: any) => t.completed).length
    return Math.round((completed / tasks.length) * 100)
  }

  // Get team members for assignment
  const getTeamMembers = () => {
    return form.getValues('teamMembers').map((member: any) => ({
      value: member.name,
      label: member.name
    }))
  }

  const progress = calculateProgress()
  const teamMembers = getTeamMembers()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Project Tasks</CardTitle>
              <CardDescription>
                Manage tasks and track progress for this project.
              </CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={addTask}
            >
              <Icons.plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Task Completion</Label>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {form.watch('tasks').filter((t: any) => t.completed).length} of {form.watch('tasks').length} tasks completed
              </p>
            </div>

            {form.watch('tasks').length > 0 ? (
              <div className="space-y-4">
                {form.watch('tasks').map((task: Task, index: number) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`task-${index}`}
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(index)}
                        />
                        <Label
                          htmlFor={`task-${index}`}
                          className={`text-sm font-medium leading-none ${
                            task.completed ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {task.title || `Task ${index + 1}`}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          Due: {task.dueDate || 'No due date'}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeTask(index)}
                        >
                          <Icons.trash className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <div className="pl-7 space-y-2">
                      <FormField
                        control={form.control}
                        name={`tasks.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Task title"
                                className="font-medium"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`tasks.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Add task details"
                                className="min-h-[60px]"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`tasks.${index}.dueDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Due Date</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`tasks.${index}.assignedTo`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Assigned To</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ''}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select team member" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">Unassigned</SelectItem>
                                  {teamMembers.map((member: any) => (
                                    <SelectItem key={member.value} value={member.value}>
                                      {member.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icons.clipboardList className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-muted-foreground">
                  No tasks added yet
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by adding your first task.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={addTask}
                >
                  <Icons.plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
