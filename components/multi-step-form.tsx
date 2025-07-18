"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"

interface Step {
  id: string
  title: string
  description: string
  component: React.ReactNode
}

interface MultiStepFormProps {
  title: string
  description: string
  steps: Step[]
  onSubmit: () => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  canProceed: (stepId: string) => boolean
}

export default function MultiStepForm({
  title,
  description,
  steps,
  onSubmit,
  onCancel,
  isSubmitting,
  canProceed,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    await onSubmit()
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Étape {currentStep + 1} sur {steps.length}
              </span>
              <span>{Math.round(progress)}% complété</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps Indicator */}
          <div className="flex justify-between mt-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStep
                      ? "bg-green-500 text-white"
                      : index === currentStep
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${index <= currentStep ? "text-gray-900" : "text-gray-500"}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 max-w-24 hidden sm:block">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {/* Current Step Content */}
          <div className="min-h-[400px]">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{steps[currentStep].title}</h3>
              <p className="text-gray-600 mb-4">{steps[currentStep].description}</p>
            </div>

            {steps[currentStep].component}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 0 ? onCancel : handlePrevious}
              disabled={isSubmitting}
            >
              {currentStep === 0 ? (
                "Annuler"
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Précédent
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
              disabled={!canProceed(steps[currentStep].id) || isSubmitting}
            >
              {currentStep === steps.length - 1 ? (
                isSubmitting ? (
                  "Création..."
                ) : (
                  "Créer"
                )
              ) : (
                <>
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
