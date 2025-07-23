import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

export function TeamTab({ form }: { form: any }) {
  // Add new team member
  const addTeamMember = () => {
    const currentMembers = form.getValues('teamMembers')
    form.setValue('teamMembers', [
      ...currentMembers,
      { name: '', role: '', bio: '', image: '' },
    ])
  }

  // Remove team member
  const removeTeamMember = (index: number) => {
    const currentMembers = form.getValues('teamMembers')
    form.setValue('teamMembers', currentMembers.filter((_: any, i: number) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Add and manage team members working on this project.
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={addTeamMember}
          >
            <Icons.plus className="h-4 w-4 mr-1" />
            Add Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {form.watch('teamMembers').map((_: any, index: number) => (
            <div
              key={index}
              className="p-4 border rounded-lg space-y-4"
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium">
                  Team Member {index + 1}
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTeamMember(index)}
                >
                  <Icons.trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`teamMembers.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Team member name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`teamMembers.${index}.role`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input placeholder="Team member role" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name={`teamMembers.${index}.bio`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Short bio or description"
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
                name={`teamMembers.${index}.image`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="https://example.com/photo.jpg"
                          {...field}
                          value={field.value || ''}
                        />
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => field.onChange('')}
                          >
                            <Icons.x className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch(`teamMembers.${index}.image`) && (
                <div className="mt-2">
                  <img
                    src={form.watch(`teamMembers.${index}.image`)}
                    alt={`${form.watch(`teamMembers.${index}.name`) || 'Team member'} photo`}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}
          
          {form.watch('teamMembers').length === 0 && (
            <div className="text-center py-8">
              <Icons.users className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-muted-foreground">
                No team members added yet
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by adding your first team member.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={addTeamMember}
              >
                <Icons.plus className="h-4 w-4 mr-1" />
                Add Team Member
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
