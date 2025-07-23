import { useForm } from 'react-hook-form'
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

export function DetailsTab({ form }: { form: any }) {
  // Helper functions for dynamic form fields
  const addObjective = () => {
    const currentObjectives = form.getValues('objectives')
    form.setValue('objectives', [...currentObjectives, ''])
  }

  const removeObjective = (index: number) => {
    const currentObjectives = form.getValues('objectives')
    form.setValue('objectives', currentObjectives.filter((_: any, i: number) => i !== index))
  }

  const addOutcome = () => {
    const currentOutcomes = form.getValues('outcomes')
    form.setValue('outcomes', [...currentOutcomes, ''])
  }

  const removeOutcome = (index: number) => {
    const currentOutcomes = form.getValues('outcomes')
    form.setValue('outcomes', currentOutcomes.filter((_: any, i: number) => i !== index))
  }

  const addPartner = () => {
    const currentPartners = form.getValues('partners')
    form.setValue('partners', [...currentPartners, ''])
  }

  const removePartner = (index: number) => {
    const currentPartners = form.getValues('partners')
    form.setValue('partners', currentPartners.filter((_: any, i: number) => i !== index))
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Additional information about your project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <Input placeholder="Client name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Project location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="impact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impact</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the impact of this project"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="beneficiaries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beneficiaries</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Who will benefit from this project?"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fundingSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funding Source</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Source of funding for this project"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget (USD)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Project budget"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Objectives & Outcomes</CardTitle>
          <CardDescription>
            Define the objectives and expected outcomes of your project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <FormLabel>Objectives</FormLabel>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addObjective}
              >
                <Icons.plus className="h-4 w-4 mr-1" />
                Add Objective
              </Button>
            </div>
            
            {form.watch('objectives').map((_: any, index: number) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <FormField
                  control={form.control}
                  name={`objectives.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder={`Objective ${index + 1}`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeObjective(index)}
                >
                  <Icons.trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <FormLabel>Outcomes</FormLabel>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addOutcome}
              >
                <Icons.plus className="h-4 w-4 mr-1" />
                Add Outcome
              </Button>
            </div>
            
            {form.watch('outcomes').map((_: any, index: number) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <FormField
                  control={form.control}
                  name={`outcomes.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder={`Outcome ${index + 1}`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOutcome(index)}
                >
                  <Icons.trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partners</CardTitle>
          <CardDescription>
            List of organizations or individuals partnering on this project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {form.watch('partners').map((_: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name={`partners.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder={`Partner ${index + 1}`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePartner(index)}
                >
                  <Icons.trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={addPartner}
            >
              <Icons.plus className="h-4 w-4 mr-1" />
              Add Partner
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
