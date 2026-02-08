import { formatDate } from '@/lib/utils'
import { UserPlan } from '@/routes/plans'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

interface PlanDialogProps {
  open: boolean
  userPlan: UserPlan
  canceling: boolean
  onClose: () => void
  onCancelSubscription: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const PlanDialog = ({
  open,
  userPlan,
  canceling,
  onClose,
  onCancelSubscription,
}: PlanDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cancel Subscription?</DialogTitle>
          <DialogDescription>
            {userPlan.subscription ? (
              <>
                Your Pro features will remain active until{' '}
                {formatDate(userPlan.subscription.currentPeriodEnd)}. After
                that, you'll be automatically downgraded to the Free plan.
              </>
            ) : (
              <>
                Your subscription will be canceled and you'll be downgraded to
                the Free plan.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Keep Subscription</Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={canceling}
            onClick={onCancelSubscription}
          >
            {canceling ? 'Canceling...' : 'Yes, Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PlanDialog
