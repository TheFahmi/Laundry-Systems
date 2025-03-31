import { TextareaExample } from "@/components/TextareaExample"

export default function TextareaComponentPage() {
  return (
    <div className="container mx-auto py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-4">Textarea Component</h1>
        <p className="text-muted-foreground mb-6">
          The Textarea component is a customizable multi-line text input field based on Shadcn UI.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Feedback Form Example</h2>
          <TextareaExample />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Support Request Example</h2>
          <TextareaExample 
            title="Support Request" 
            description="Please describe your issue in detail" 
          />
        </div>
      </div>
      
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Usage</h2>
        <div className="bg-muted p-4 rounded-md overflow-auto">
          <pre className="text-sm">
{`import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function TextareaWithLabel() {
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea
        placeholder="Type your message here."
        id="message"
      />
    </div>
  )
}`}
          </pre>
        </div>
      </div>
    </div>
  )
} 