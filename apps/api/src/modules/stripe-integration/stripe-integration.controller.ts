import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { StripeIntegrationService } from './stripe-integration.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('api/v1/integrations/stripe')
@UseGuards(JwtGuard)
export class StripeIntegrationController {
  constructor(private stripeService: StripeIntegrationService) {}

  @Post('payment-intent')
  async createPaymentIntent(
    @Request() req: any,
    @Body() { amount, currency }: any,
  ) {
    return this.stripeService.createPaymentIntent(
      req.user.organizationId,
      amount,
      currency,
    );
  }

  @Post('confirm-payment')
  async confirmPayment(
    @Request() req: any,
    @Body() { paymentIntentId, paymentMethodId }: any,
  ) {
    return this.stripeService.confirmPayment(
      req.user.organizationId,
      paymentIntentId,
      paymentMethodId,
    );
  }

  @Post('subscription')
  async createSubscription(
    @Request() req: any,
    @Body() { customerId, plan }: any,
  ) {
    return this.stripeService.createSubscription(
      req.user.organizationId,
      customerId,
      plan,
    );
  }

  @Get('subscription')
  async getSubscription(@Request() req: any) {
    return this.stripeService.getSubscription(req.user.organizationId);
  }

  @Post('webhook')
  async handleWebhook(@Body() event: any) {
    return this.stripeService.handleWebhookEvent(event);
  }
}
