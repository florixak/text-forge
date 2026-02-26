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
import { authClient } from '@/lib/auth-client'

const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })

const PasswordDrawer = () => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: {
      currentPassword: string
      newPassword: string
      confirmPassword: string
    }) => {
      const result = await authClient.changePassword({
        newPassword: data.newPassword,
        currentPassword: data.currentPassword,
        revokeOtherSessions: true,
      })

      if (result.error) {
        throw new Error(result.error.message || 'Failed to change password')
      }

      return result
    },
    onSuccess: () => {
      toast.success('Password changed successfully')
      form.reset()
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to change password',
      )
    },
  })

  const form = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: passwordChangeSchema,
    },
    onSubmit: async ({ value }) => {
      toast.promise(mutateAsync(value), {
        success: 'Password changed successfully',
        error: 'Failed to change password. Please try again.',
      })
    },
  })

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">Edit Password</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full p-4">
          <DrawerHeader>
            <DrawerTitle>Edit Password</DrawerTitle>
            <DrawerDescription>Update your password.</DrawerDescription>
          </DrawerHeader>
          <form
            id="password-form"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <FieldGroup>
              <form.Field
                name="currentPassword"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Current Password
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter your current password"
                        type="password"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
              <form.Field
                name="newPassword"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter your new password"
                        type="password"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
              <form.Field
                name="confirmPassword"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Confirm New Password
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Confirm your new password"
                        type="password"
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

export default PasswordDrawer
