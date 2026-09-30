import type { InnovationModel } from "@/lib/validation/innovation-model";

function TreeNode({ label, children }: { label: string; children?: React.ReactNode }): React.JSX.Element {
  return (
    <li className="mt-1">
      <span className="text-sm font-medium text-primary-900">{label}</span>
      {children ? <ul className="ml-4 border-l border-slate-200 pl-3">{children}</ul> : null}
    </li>
  );
}

function Leaf({ text }: { text: string }): React.JSX.Element {
  return <li className="text-sm text-slate-600">{text}</li>;
}

export function InnovationDna({ model }: { model: InnovationModel }): React.JSX.Element {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-base font-semibold text-primary-900">Innovation DNA</h2>
      <p className="mt-1 text-sm text-slate-600">{model.title}</p>
      <ul className="mt-3">
        <TreeNode label={`Ingredients (${model.ingredients.length})`}>
          {model.ingredients.map((ingredient) => (
            <Leaf
              key={ingredient.id}
              text={`${ingredient.botanicalName} — ${ingredient.plantPart}, ${ingredient.quantity.amount} ${ingredient.quantity.unit}`}
            />
          ))}
        </TreeNode>
        <TreeNode label={`Composition (total ${model.composition.total.amount} ${model.composition.total.unit})`}>
          {model.composition.ratios.map((ratio) => (
            <Leaf key={ratio.ingredientId} text={`${ratio.ingredientId}: ${ratio.share}`} />
          ))}
        </TreeNode>
        <TreeNode label={`Process (${model.processSteps.length} steps)`}>
          {model.processSteps.map((step) => (
            <Leaf key={step.id} text={`${step.order + 1}. ${step.action}`} />
          ))}
        </TreeNode>
        <TreeNode label="Intended use">
          {model.intendedUse.map((use) => (
            <Leaf key={use} text={use} />
          ))}
        </TreeNode>
        <TreeNode label={`Jurisdictions: ${model.targetJurisdictions.join(", ")}`}>
          {model.proposedClaims.map((claim) => (
            <Leaf key={claim.id} text={`Claim: ${claim.text}`} />
          ))}
        </TreeNode>
      </ul>
    </div>
  );
}
