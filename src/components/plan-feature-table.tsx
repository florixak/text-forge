import { Plan, PlanLimits } from '@/constants'

interface PlanFeatureTableProps {
  plans: [Plan, PlanLimits][]
  selected: Plan
}

const PlanFeatureTable = ({ plans, selected }: PlanFeatureTableProps) => {
  return (
    <table className="min-w-full border-separate border-spacing-0">
      <thead>
        <tr>
          <th className="sticky left-0 z-10 bg-card-foreground/5 px-6 py-4 text-left font-semibold text-muted-foreground rounded-tl-xl">
            Feature
          </th>
          {plans.map(([plan]) => (
            <th
              key={plan}
              className="px-6 py-4 text-center font-semibold capitalize bg-card-foreground/5"
            >
              {plan}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr className="border-t border-border">
          <td className="px-6 py-4 font-medium text-muted-foreground bg-card-foreground/5">
            AI Assist Calls
          </td>
          {plans.map(([plan, limits]) => (
            <td
              key={plan}
              className={`px-6 py-4 text-center ${selected === plan ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {limits.assist_ai_day}
            </td>
          ))}
        </tr>
        <tr className="border-t border-border">
          <td className="px-6 py-4 font-medium text-muted-foreground bg-card-foreground/5">
            AI Structure Calls
          </td>
          {plans.map(([plan, limits]) => (
            <td
              key={plan}
              className={`px-6 py-4 text-center ${selected === plan ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {limits.structure_ai_day}
            </td>
          ))}
        </tr>
        <tr className="border-t border-border">
          <td className="px-6 py-4 font-medium text-muted-foreground bg-card-foreground/5">
            AI Generate Calls
          </td>
          {plans.map(([plan, limits]) => (
            <td
              key={plan}
              className={`px-6 py-4 text-center ${selected === plan ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {limits.generate_ai_day}
            </td>
          ))}
        </tr>
        <tr className="border-t border-border">
          <td className="px-6 py-4 font-medium text-muted-foreground bg-card-foreground/5 rounded-bl-xl">
            Support
          </td>
          {plans.map(([plan, limits], idx) => (
            <td
              key={plan}
              className={`px-6 py-4 text-center capitalize ${selected === plan ? 'text-primary' : 'text-muted-foreground'} ${idx === plans.length - 1 ? ' rounded-br-xl' : ''}`}
            >
              {limits.support}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}

export default PlanFeatureTable
