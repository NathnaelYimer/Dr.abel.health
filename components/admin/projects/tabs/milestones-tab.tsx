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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function MilestonesTab({ form }: { form: any }) {
  // Add new milestone
  const addMilestone = () => {
    const currentMilestones = form.getValues('milestones')
    form.setValue('milestones', [
      ...currentMilestones,
      { 
        title: '', 
        description: '', 
        dueDate: new Date().toISOString().split('T')[0],
        completed: false 
      },
    ])
  }

  // Remove milestone
  const removeMilestone = (index: number) => {
    const currentMilestones = form.getValues('milestones')
    form.setValue('milestones', currentMilestones.filter((_: any, i: number) => i !== index))
  }

  // Toggle milestone completion
  const toggleMilestone = (index: number) => {
    const currentMilestones = [...form.getValues('milestones')]
    currentMilestones[index].completed = !currentMilestones[index].completed
    form.setValue('milestones', currentMilestones)
  }

  // Calculate progress
  const calculateProgress = () => {
    const milestones = form.getValues('milestones')
    if (milestones.length === 0) return 0
    const completed = milestones.filter((m: any) => m.completed).length
    return Math.round((completed / milestones.length) * 100)
  }

  const progress = calculateProgress()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Project Milestones</CardTitle>
              <CardDescription>
                Track the progress of your project with milestones.
              </CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={addMilestone}
            >
              <Icons.plus className="h-4 w-4 mr-1" />
              Add Milestone
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Overall Progress</Label>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {form.watch('milestones').filter((m: any) => m.completed).length} of {form.watch('milestones').length} milestones completed
              </p>
            </div>

            {form.watch('milestones').length > 0 ? (
              <div className="space-y-4">
                {form.watch('milestones').map((milestone: any, index: number) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`milestone-${index}`}
                          checked={milestone.completed}
                          onCheckedChange={() => toggleMilestone(index)}
                        />
                        <Label
                          htmlFor={`milestone-${index}`}
                          className={`text-sm font-medium leading-none ${
                            milestone.completed ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {milestone.title || `Milestone ${index + 1}`}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          Due: {milestone.dueDate || 'No due date'}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeMilestone(index)}
                        >
                          <Icons.trash className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <div className="pl-7 space-y-2">
                      <FormField
                        control={form.control}
                        name={`milestones.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Milestone title"
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
                        name={`milestones.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Add details about this milestone"
                                className="min-h-[60px]"
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
                        name={`milestones.${index}.dueDate`}
                        render={({ field }) => (
                          <FormItem className="max-w-[200px]">
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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icons.milestone className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-muted-foreground">
                  No milestones added yet
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by adding your first milestone.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={addMilestone}
                >
                  <Icons.plus className="h-4 w-4 mr-1" />
                  Add Milestone
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
