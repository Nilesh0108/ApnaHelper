"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { customerJobDescriptionAssistant, CustomerJobDescriptionAssistantOutput } from "@/ai/flows/customer-job-description-assistant-flow";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface AIJobAssistantProps {
  serviceType: string;
  initialDescription: string;
  onRefined: (refined: string) => void;
}

export default function AIJobAssistant({ serviceType, initialDescription, onRefined }: AIJobAssistantProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CustomerJobDescriptionAssistantOutput | null>(null);

  const handleRefine = async () => {
    if (!initialDescription) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please type a brief description first so the AI can help you refine it.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await customerJobDescriptionAssistant({
        serviceType,
        currentDescription: initialDescription,
      });
      setResult(response);
      toast({
        title: "AI Analysis Complete",
        description: "Review the refined description and suggestions below.",
      });
    } catch (error: any) {
      console.error("AI Assistant Error:", error);
      toast({
        variant: "destructive",
        title: "AI Assistant Unavailable",
        description: error.message || "Something went wrong while trying to refine your description.",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyRefined = () => {
    if (result) {
      onRefined(result.refinedDescription);
      setResult(null);
      toast({
        title: "Applied",
        description: "The refined description has been added to your request.",
      });
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
          disabled={loading}
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
        <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-2">
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
            <div className="p-3 bg-card rounded-md border text-sm italic text-muted-foreground">
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
          <CardFooter className="flex gap-2">
            <Button onClick={applyRefined} className="flex-1">
              Apply Refined Description
            </Button>
            <Button variant="ghost" onClick={() => setResult(null)} className="text-muted-foreground">
              Dismiss
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
