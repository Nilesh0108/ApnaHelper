
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { customerJobDescriptionAssistant, CustomerJobDescriptionAssistantOutput } from "@/ai/flows/customer-job-description-assistant-flow";
import { Badge } from "@/components/ui/badge";

interface AIJobAssistantProps {
  serviceType: string;
  initialDescription: string;
  onRefined: (refined: string) => void;
}

export default function AIJobAssistant({ serviceType, initialDescription, onRefined }: AIJobAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CustomerJobDescriptionAssistantOutput | null>(null);

  const handleRefine = async () => {
    if (!initialDescription) return;
    setLoading(true);
    try {
      const response = await customerJobDescriptionAssistant({
        serviceType,
        currentDescription: initialDescription,
      });
      setResult(response);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyRefined = () => {
    if (result) {
      onRefined(result.refinedDescription);
      setResult(null);
    }
  };

  return (
    <div className="space-y-4">
      {!result && (
        <Button 
          type="button" 
          variant="outline" 
          className="w-full border-dashed border-primary/40 text-primary hover:bg-primary/5 h-12"
          onClick={handleRefine}
          disabled={loading || !initialDescription}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {loading ? "AI is thinking..." : "Refine description with AI"}
        </Button>
      )}

      {result && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Suggestions
            </CardTitle>
            <Badge variant={result.isSufficient ? "default" : "secondary"}>
              {result.isSufficient ? "Sufficient Details" : "Needs More Info"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-white rounded-md border text-sm italic text-muted-foreground">
              {result.refinedDescription}
            </div>
            
            {result.clarifyingQuestionsOrSuggestions.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Consider adding these details:</span>
                <ul className="space-y-1">
                  {result.clarifyingQuestionsOrSuggestions.map((q, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <AlertCircle className="h-3 w-3 text-secondary mt-1 shrink-0" />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={applyRefined} className="w-full">
              Apply Refined Description
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
