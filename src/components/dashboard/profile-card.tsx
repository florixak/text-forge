import { authMiddleware } from '@/lib/middleware'
import { DashboardData } from '@/types'
import { useForm } from '@tanstack/react-form'
import { createServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import * as z from 'zod'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
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
import { db } from '@/db'
import { user } from '@/db/schema'
import { eq } from 'drizzle-orm'

interface ProfileCardProps {
  data: DashboardData
}

const profileSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(0)
      .max(0)
      .or(z.string().min(8, 'Password must be at least 8 characters')),
    confirmPassword: z
      .string()
      .min(0)
      .max(0)
      .or(z.string().min(8, 'Password must be at least 8 characters')),
  })
  .refine((data) => {
    if (data.password || data.confirmPassword) {
      return data.password === data.confirmPassword
    }
    return true
  })

const updateProfileFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(profileSchema)
  .handler(async ({ context, data }) => {
    const { user: loggedUser } = context.session || {}

    if (!loggedUser) {
      throw new Error('Unauthorized')
    }

    if (import.meta.env.NODE_ENV === 'development') {
      console.log('Updating profile with data:', data)
    }

    const result = await db
      .update(user)
      .set({
        ...(data.name !== loggedUser.name ? { name: data.name } : {}),
        ...(data.email !== loggedUser.email ? { email: data.email } : {}),
        ...(data.password ? { password: data.password } : {}),
      })
      .where(eq(user.id, loggedUser.id))

    if (result.rowCount === 0) {
      throw new Error('Failed to update profile. Please try again.')
    }

    return { success: true }
  })

const ProfileCard = ({ data }: ProfileCardProps) => {
  const form = useForm({
    defaultValues: {
      name: data.user.name || '',
      email: data.user.email || '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: profileSchema,
    },
    onSubmit: async ({ value }) => {
      toast.promise(updateProfileFn({ data: value }), {
        success: 'Profile updated successfully',
        error: 'Failed to update profile. Please try again.',
      })
    },
  })

  const { user } = data

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="text-lg font-semibold">Profile</h2>
      </CardHeader>
      <CardContent className="flex flex-row items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
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
                id="signup-form"
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
                  <form.Field
                    name="password"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="Enter your password"
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
                            Confirm Password
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="Confirm your password"
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
                              !state.isTouched
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
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Member since {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  )
}

export default ProfileCard
