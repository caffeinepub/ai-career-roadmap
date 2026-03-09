import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

const INTERESTS = [
  "Technology",
  "Medicine",
  "Arts",
  "Business",
  "Science",
  "Law",
  "Education",
  "Engineering",
];
const SUBJECTS = [
  "Math",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "English",
];
const SKILLS = [
  "Problem Solving",
  "Communication",
  "Creativity",
  "Leadership",
  "Teamwork",
  "Analytical Thinking",
];

interface OnboardingPageProps {
  onComplete: () => void;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [subjectScores, setSubjectScores] = useState<Record<string, number>>(
    Object.fromEntries(SUBJECTS.map((s) => [s, 5])),
  );
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>(
    Object.fromEntries(SKILLS.map((s) => [s, 3])),
  );

  const saveProfile = useSaveCallerUserProfile();

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const handleComplete = async () => {
    try {
      await saveProfile.mutateAsync({
        name,
        grade,
        interests: selectedInterests,
        assessmentInterests: selectedInterests,
        subjectScores: Object.entries(subjectScores).map(([k, v]) => [
          k,
          BigInt(v),
        ]) as [string, bigint][],
        skillRatings: Object.entries(skillRatings).map(([k, v]) => [
          k,
          BigInt(v),
        ]) as [string, bigint][],
      });
      toast.success("Profile saved! Welcome aboard 🚀");
      onComplete();
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0 && grade.trim().length > 0;
    if (step === 2) return selectedInterests.length > 0;
    return true;
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span className="text-sm font-display font-semibold gradient-text">
                Setup your profile
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Step {step} of {totalSteps}
            </span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.72 0.19 194), oklch(0.65 0.22 280))",
              }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="glass-bright rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">
                      Welcome, future leader!
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Let's start with the basics.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Your Full Name
                      </Label>
                      <Input
                        id="name"
                        data-ocid="onboarding.name.input"
                        placeholder="e.g. Arjun Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-muted/50 border-border/60 focus:border-primary/60 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade" className="text-sm font-medium">
                        Current Grade
                      </Label>
                      <Input
                        id="grade"
                        data-ocid="onboarding.grade.input"
                        placeholder="e.g. 12th Grade, Class XII"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="bg-muted/50 border-border/60 focus:border-primary/60 h-11"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">
                      What excites you?
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Select all fields that interest you.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {INTERESTS.map((interest) => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <button
                          type="button"
                          key={interest}
                          data-ocid="onboarding.interest.toggle"
                          onClick={() => toggleInterest(interest)}
                          className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200 text-left ${
                            isSelected
                              ? "bg-primary/20 border-primary/50 text-primary glow-cyan"
                              : "bg-muted/30 border-border/40 text-muted-foreground hover:border-border hover:text-foreground"
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                  {selectedInterests.length === 0 && (
                    <p className="text-xs text-destructive">
                      Please select at least one interest.
                    </p>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">
                      Rate your subjects
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      How confident are you? (1 = beginner, 10 = expert)
                    </p>
                  </div>
                  <div className="space-y-5">
                    {SUBJECTS.map((subject) => (
                      <div key={subject} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{subject}</span>
                          <span className="font-mono text-primary font-bold">
                            {subjectScores[subject]}
                          </span>
                        </div>
                        <Slider
                          data-ocid="onboarding.subject.toggle"
                          min={1}
                          max={10}
                          step={1}
                          value={[subjectScores[subject]]}
                          onValueChange={([v]) =>
                            setSubjectScores((prev) => ({
                              ...prev,
                              [subject]: v,
                            }))
                          }
                          className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">
                      Rate your skills
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Be honest — this helps us personalize your roadmap. (1–5)
                    </p>
                  </div>
                  <div className="space-y-5">
                    {SKILLS.map((skill) => (
                      <div key={skill} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{skill}</span>
                          <span className="font-mono text-accent font-bold">
                            {skillRatings[skill]}
                          </span>
                        </div>
                        <Slider
                          data-ocid="onboarding.skill.toggle"
                          min={1}
                          max={5}
                          step={1}
                          value={[skillRatings[skill]]}
                          onValueChange={([v]) =>
                            setSkillRatings((prev) => ({ ...prev, [skill]: v }))
                          }
                          className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="px-8 pb-8 flex gap-3">
            {step > 1 && (
              <Button
                data-ocid="onboarding.back.button"
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 gap-2 border-border/60"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}

            {step < totalSteps ? (
              <Button
                data-ocid="onboarding.next.button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="flex-1 gap-2 bg-primary text-primary-foreground font-semibold glow-cyan hover:opacity-90"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                data-ocid="onboarding.submit.button"
                onClick={handleComplete}
                disabled={saveProfile.isPending}
                className="flex-1 gap-2 font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.19 194), oklch(0.65 0.22 280))",
                }}
              >
                {saveProfile.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {saveProfile.isPending ? "Saving..." : "Launch My Journey"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
