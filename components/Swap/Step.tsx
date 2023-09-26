import { Check, X, XCircle } from "lucide-react";
import { classNames } from "../utils/classNames";
import SpinIcon from "../icons/spinIcon";
import { Gauge } from "../gauge";

function renderStepIcon(step) {
    switch (step.status) {
        case "complete":
            return (
                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                    <Check className="h-5 w-5 text-primary" aria-hidden="true" />
                </span>
            );

        case "current":
            return (
                <span className="animate-spin">
                    <Gauge value={40} size="verySmall" />
                </span>
            );

        case "failed":
            return <XCircle className="h-8 w-8 text-primary" aria-hidden="true" />;

        case "delayed":
            return (
            <span className="animate-spin opacity-50">
                <Gauge value={40} size="verySmall" />
            </span>)

        default:
            return (
                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/20">
                </span>
            );
    }
}

function Step({ step, isLastStep }) {
    return (
        <li className={classNames(isLastStep ? '' : 'pb-10', 'relative')} key={step?.name}>
            <div className="flex items-center justify-between w-full">
                {!isLastStep && (
                    <div className={`absolute top-1/2 left-4 -ml-px mt-0.5 h-[40%] w-0.5 ${step.status === "complete" ? "bg-primary" : "bg-primary/20"} `} aria-hidden="true" />
                )}
                <div className={`group relative flex ${step?.description ? "items-start" : "items-center"}`}>
                    <span className="flex h-9 items-center" aria-hidden="true">
                        {renderStepIcon(step)}
                    </span>
                    <span className="ml-4 flex min-w-0 flex-col">
                        <span className={`text-sm font-medium ${step.status === "current" ? "text-primary" : "text-gray-300"}`}>{step.name}</span>
                        {step?.description &&
                            <span className="text-sm text-primary-text">{step?.description}</span>}
                    </span>
                </div>
            </div>
        </li>
    );
}

export default Step;