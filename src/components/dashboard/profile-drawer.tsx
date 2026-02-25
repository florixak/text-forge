import { authClient } from '@/lib/auth-client'
import { DashboardUser } from '@/types'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as z from 'zod'
import { Button } from '../ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer'
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
})

interface ProfileDrawerProps {
  user: DashboardUser
}

const ProfileDrawer = ({ user }: ProfileDrawerProps) => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      if (data.name !== user.name) {
        const result = await authClient.updateUser({
          name: data.name,
        })

        if (result.error) {
          throw new Error(result.error.message || 'Failed to update profile')
        }
      }
      if (data.email !== user.email) {
        const result = await authClient.changeEmail({
          newEmail: data.email,
        })

        if (result.error) {
          throw new Error(result.error.message || 'Failed to update profile')
        }
      }
      return { success: true }
    },
    onSuccess: () => {
      toast.success('Profile updated successfully')
      form.reset()
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update profile',
      )
    },
  })
  const form = useForm({
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
    },
    validators: {
      onSubmit: profileSchema,
    },
    onSubmit: async ({ value }) => {
      toast.promise(mutateAsync(value), {
        success: 'Profile updated successfully',
        error: 'Failed to update profile. Please try again.',
      })
    },
  })
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full p-4">
          <DrawerHeader>
            <DrawerTitle>Edit Profile</DrawerTitle>
            <DrawerDescription>
              Update your profile information.
            </DrawerDescription>
          </DrawerHeader>
          <form
            id="profile-form"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <FieldGroup>
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter your name"
                        type="text"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
              <form.Field
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter your email address"
                        type="email"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
              <div className="flex items-center flex-col gap-2 mt-4">
                <Field>
                  <form.Subscribe
                    selector={(state) => {
                      return {
                        isSubmitting: state.isSubmitting,
                        isValid: state.isValid,
                        isDirty: state.isDirty,
                        isTouched: state.isTouched,
                      }
                    }}
                    children={(state) => (
                      <Button
                        type="submit"
                        disabled={
                          state.isSubmitting ||
                          !state.isValid ||
                          !state.isDirty ||
                          !state.isTouched ||
                          isPending
                        }
                      >
                        Save Changes
                      </Button>
                    )}
                  />
                </Field>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </DrawerClose>
              </div>
            </FieldGroup>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default ProfileDrawer
