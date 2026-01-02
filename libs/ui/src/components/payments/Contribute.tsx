import {
  IonButton,
  IonCard,
  IonCardTitle,
  IonContent,
  IonPage,
} from '@ionic/react';
import { PaneNav } from '../pane/PaneNav';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SubscriptionModelName } from '@feynote/shared-utils';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import styled from 'styled-components';
import { TierCard } from './TierCard';

const CurrentSubscriptionCard = styled(IonCard)`
  max-width: 400px;
  margin: 16px auto;
  text-align: center;
`;

const OfferingContainer = styled.div`
  padding-top: 15px;
  display: grid;
  grid-template-rows: auto 1fr repeat(4, auto);
  grid-template-columns: repeat(auto-fit, min(440px, 100%));
  justify-items: center;
  justify-content: center;

  > * {
    margin: 10px;
  }
`;

const FrequencySelector = styled.div`
  display: flex;
  justify-content: center;
`;

const ContributeDescription = styled.p`
  max-width: 700px;
  text-align: left;
  margin: auto;
`;

const subscriptionModelNameToI18n = {
  [SubscriptionModelName.PYOMonthly]: 'contribute.pyo.monthly',
  [SubscriptionModelName.PYOYearly]: 'contribute.pyo.yearly',
  [SubscriptionModelName.PYOForever]: 'contribute.pyo.forever',
  [SubscriptionModelName.Tier1Monthly]: 'contribute.tier1.monthly',
  [SubscriptionModelName.Tier1Yearly]: 'contribute.tier1.yearly',
  [SubscriptionModelName.Tier1Forever]: 'contribute.tier1.forever',
  [SubscriptionModelName.Tier2Monthly]: 'contribute.tier2.monthly',
  [SubscriptionModelName.Tier2Yearly]: 'contribute.tier2.yearly',
  [SubscriptionModelName.Tier2Forever]: 'contribute.tier2.forever',
  [SubscriptionModelName.Tier3Monthly]: 'contribute.tier3.monthly',
  [SubscriptionModelName.Tier3Yearly]: 'contribute.tier3.yearly',
  [SubscriptionModelName.Tier3Forever]: 'contribute.tier3.forever',
} satisfies Record<SubscriptionModelName, string>;

const subscriptionModelNameToPrice = {
  [SubscriptionModelName.PYOMonthly]: 2,
  [SubscriptionModelName.PYOYearly]: 10,
  [SubscriptionModelName.PYOForever]: -1,
  [SubscriptionModelName.Tier1Monthly]: 2,
  [SubscriptionModelName.Tier1Yearly]: 20,
  [SubscriptionModelName.Tier1Forever]: -1,
  [SubscriptionModelName.Tier2Monthly]: 5,
  [SubscriptionModelName.Tier2Yearly]: 40,
  [SubscriptionModelName.Tier2Forever]: -1,
  [SubscriptionModelName.Tier3Monthly]: 10,
  [SubscriptionModelName.Tier3Yearly]: 80,
  [SubscriptionModelName.Tier3Forever]: -1,
} satisfies Record<SubscriptionModelName, number>;

export const Contribute: React.FC = () => {
  const { t } = useTranslation();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [viewInMonthly, setViewInMonthly] = useState(false);
  const [subscriptions, setSubscriptions] = useState<
    {
      id: string;
      name: SubscriptionModelName;
      expiresAt: Date | null;
      cancelledAt: Date | null;
      activeWithStripe: boolean;
    }[]
  >([]);

  const load = async () => {
    const response = await trpc.payment.getSubscriptions
      .query()
      .catch((error) => {
        handleTRPCErrors(error);
      });

    if (!response) {
      return;
    }

    setSubscriptions(response.subscriptions);
  };

  useEffect(() => {
    load();
  }, []);

  const subscribe = async (
    name: SubscriptionModelName,
    amount: number | undefined,
  ) => {
    const response = await trpc.payment.createStripeCheckoutSession
      .mutate({
        subscriptionModelName: name,
        amount,
        successUrl: 'https://feynote.com/payment/success',
        cancelUrl: 'https://feynote.com/payment/cancel',
      })
      .catch((error) => {
        handleTRPCErrors(error);
      });

    if (!response) return;

    window.open(response.url, '_blank', 'noopener,noreferrer');
  };

  const manageSubscriptions = async () => {
    const response = await trpc.payment.createStripeBillingPortalSession
      .mutate()
      .catch((error) => {
        handleTRPCErrors(error);
      });

    if (!response) return;

    window.open(response.url, '_blank', 'noopener,noreferrer');
  };

  const renderSubscriptionExpirationInformation = (subscription: {
    expiresAt: Date | null;
    cancelledAt: Date | null;
    activeWithStripe: boolean;
  }) => {
    return (
      <>
        {subscription.expiresAt &&
          !subscription.activeWithStripe &&
          t('contribute.expiresAt', {
            date: subscription.expiresAt,
          })}
        {!subscription.activeWithStripe && t('contribute.inactive')}
        {subscription.activeWithStripe && t('contribute.active')}
        <br />
        {!subscription.expiresAt && t('contribute.expiresAtNever')}
        {subscription.cancelledAt &&
          t('contribute.cancelledAt', {
            date: subscription.cancelledAt,
          })}
      </>
    );
  };

  return (
    <IonPage>
      <PaneNav title={t('contribute.title')} />
      <IonContent>
        <ContributeDescription className="ion-padding">
          {t('contribute.description')}
        </ContributeDescription>
        <ContributeDescription className="ion-padding">
          {t('contribute.description.2')}&nbsp;
          <a href="https://feynote.com/about" target="_blank" rel="noreferrer">
            {t('contribute.about')}
          </a>
        </ContributeDescription>
        <br />
        {subscriptions.length > 0 && (
          <CurrentSubscriptionCard className="ion-padding">
            <IonCardTitle>{t('contribute.currentSubscriptions')}</IonCardTitle>
            <div>
              {subscriptions.map((subscription) => (
                <div key={subscription.id}>
                  <p>
                    {t(subscriptionModelNameToI18n[subscription.name])}
                    <br />
                    {renderSubscriptionExpirationInformation(subscription)}
                  </p>
                  <IonButton
                    disabled={!subscription.activeWithStripe}
                    onClick={manageSubscriptions}
                  >
                    {t('contribute.manage')}
                  </IonButton>
                </div>
              ))}
            </div>
          </CurrentSubscriptionCard>
        )}

        <FrequencySelector>
          <IonButton
            fill={viewInMonthly ? 'outline' : 'clear'}
            onClick={() => {
              setViewInMonthly(true);
            }}
          >
            {t('contribute.monthly')}
          </IonButton>
          <IonButton
            fill={viewInMonthly ? 'clear' : 'outline'}
            onClick={() => {
              setViewInMonthly(false);
            }}
          >
            {t('contribute.yearly')}
          </IonButton>
        </FrequencySelector>

        <OfferingContainer>
          <TierCard
            title={t('contribute.free')}
            description={t('contribute.free.description')}
            capabilities={[
              t('contribute.free.capabilities1'),
              t('contribute.free.capabilities2'),
              t('contribute.free.capabilities3'),
              t('contribute.free.capabilities4'),
              t('contribute.free.capabilities5'),
            ]}
            action={subscriptions.length === 0 ? 'current' : 'manage'}
            pricing={{
              mode: 'free',
            }}
            onManage={manageSubscriptions}
            onSubscribe={() => {
              // Do nothing
            }}
          />
          <TierCard
            title={t('contribute.pyo')}
            description={t('contribute.pyo.description')}
            capabilities={[
              t('contribute.pyo.capabilities1'),
              t('contribute.pyo.capabilities2'),
              t('contribute.pyo.capabilities3'),
              t('contribute.pyo.capabilities4'),
            ]}
            action={subscriptions.length === 0 ? 'subscribe' : 'manage'}
            pricing={{
              mode: 'pyo',
              minimum:
                subscriptionModelNameToPrice[
                  viewInMonthly
                    ? SubscriptionModelName.PYOMonthly
                    : SubscriptionModelName.PYOYearly
                ],
              suggested: viewInMonthly ? [2, 4, 6] : [10, 20, 40],
            }}
            onManage={manageSubscriptions}
            onSubscribe={(amount) =>
              subscribe(
                viewInMonthly
                  ? SubscriptionModelName.PYOMonthly
                  : SubscriptionModelName.PYOYearly,
                amount,
              )
            }
          />
        </OfferingContainer>
        <br />
        <br />
        <br />
        <br />
      </IonContent>
    </IonPage>
  );
};
