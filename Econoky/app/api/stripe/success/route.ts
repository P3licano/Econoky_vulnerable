import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'
import { updateProfile } from '@/lib/db/profiles'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    redirect('/plans?error=missing_session')
  }

  try {
    // Obtener la sesión de Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session || !session.client_reference_id) {
      redirect('/plans?error=invalid_session')
    }

    const userId = session.client_reference_id

    // Actualizar el perfil del usuario a suscripción Pro en MongoDB
    await updateProfile(userId, {
      subscription_status: 'pro',
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
    })

    redirect('/dashboard?success=subscription_active')
  } catch (error: any) {
    console.error('Error procesando éxito de pago:', error)
    redirect('/plans?error=processing_failed')
  }
}

