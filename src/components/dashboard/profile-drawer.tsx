import { useForm } from '@tanstack/react-form'
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
import { toast } from 'sonner'
import { sql, eq, and, ne } from 'drizzle-orm'
import { authMiddleware } from '@/lib/middleware'
import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { user } from '@/db/schema'
import { DashboardUser } from '@/types'
import * as z from 'zod'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
})

const updateProfileFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(profileSchema)
  .handler(async ({ context, data }) => {
    const { user: loggedUser } = context.session || {}

    if (!loggedUser) {
      throw new Error('Unauthorized')
    }

    if (import.meta.env.DEV) {
      console.log('Updating profile with data:', data)
    }

    if (data.email !== loggedUser.email) {
      const existingUser = await db
        .select()
        .from(user)
        .where(and(eq(user.email, data.email), ne(user.id, loggedUser.id)))
        .limit(1)

      if (existingUser.length > 0) {
        throw new Error('Email is already in use.')
      }
    }

    const result = await db
      .update(user)
      .set({
        ...(data.name !== loggedUser.name ? { name: data.name } : {}),
        ...(data.email !== loggedUser.email ? { email: data.email } : {}),
        updatedAt: sql`NOW()`,
      })
      .where(eq(user.id, loggedUser.id))

    if (result.rowCount === 0) {
      throw new Error('Failed to update profile. Please try again.')
    }

    return { success: true }
  })

interface ProfileDrawerProps {
  user: DashboardUser
}

const ProfileDrawer = ({ user }: ProfileDrawerProps) => {
  const form = useForm({
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
    },
    validators: {
      onSubmit: profileSchema,
    },
    onSubmit: async ({ value }) => {
      toast.promise(
        updateProfileFn({ data: value }).then((res) => {
          if (res.success) {
            setTimeout(() => window.location.reload(), 2000)
          }
          return res
        }),
        {
          success: 'Profile updated successfully',
          error: 'Failed to update profile. Please try again.',
        },
      )
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
              {/*<form.Field
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
                  />*/}
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
  )
}

export default ProfileDrawer
