import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOnboardingStatus, updateOnboardingStatus } from "@/app/actions/user";
import OnboardingWizard from "@/components/OnboardingWizard";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch onboarding status
  const status = await getOnboardingStatus(user.id);

  // If onboarding is completed and user is accessing from profile (restart),
  // reset the onboarding status to allow them to go through it again
  if (status.completed) {
    await updateOnboardingStatus(user.id, false, 0, false);
  }

  // Determine if this is a returning user (has accounts or previously skipped)
  const isReturningUser = status.hasAccounts || status.skipped || status.completed;

  return (
    <OnboardingWizard
      userId={user.id}
      isReturningUser={isReturningUser}
      initialStep={0}
    />
  );
}
