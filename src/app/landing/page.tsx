import { redirect } from 'next/navigation'

export default function LandingPage() {
  // Redirect to the original HTML landing page
  redirect('/greenlit-landing.html')
}
