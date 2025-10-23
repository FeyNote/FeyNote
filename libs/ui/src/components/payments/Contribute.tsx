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

const CurrentSubscriptionCard = styled(IonCard)`
  max-width: 400px;
  margin: 16px auto;
  text-align: center;
`;

const OfferingContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const OfferingCard = styled(IonCard)`
  width: min(380px, 95%);
  padding: 16px;
  text-align: center;

  display: grid;
  grid-template-rows: auto 1fr;

  ul {
    text-align: left;
  }
`;

const OfferingCardDescription = styled.p`
  text-align: left;
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

const CapabilitiesHeader = styled.h2`
  font-size: 18px;
`;

const HiddenListItem = styled.li`
  visibility: hidden;
`;

const subscriptionModelNameToI18n = {
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
  const [viewInMonthly, setViewInMonthly] = useState(true);
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

  const subscribe = async (name: SubscriptionModelName) => {
    const response = await trpc.payment.createStripeCheckoutSession
      .mutate({
        subscriptionModelName: name,
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

  const renderPrice = (price: number) => {
    return <div>${price.toFixed(2)}</div>;
  };

  const renderButtonForSubscription = (name: SubscriptionModelName) => {
    if (subscriptions.length === 0) {
      return (
        <IonButton
          onClick={() => {
            subscribe(name);
          }}
        >
          {t('contribute.subscribe')}
        </IonButton>
      );
    }

    return (
      <IonButton onClick={manageSubscriptions}>
        {t('contribute.manage')}
      </IonButton>
    );
  };

  const renderFreeButton = () => {
    if (subscriptions.length === 0) {
      return (
        <IonButton disabled={true}>{t('contribute.activePlan')}</IonButton>
      );
    }

    return (
      <IonButton onClick={manageSubscriptions}>
        {t('contribute.manage')}
      </IonButton>
    );
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
          <OfferingCard>
            <IonCardTitle>{t('contribute.free')}</IonCardTitle>

            <OfferingCardDescription>
              {t('contribute.free.description')}
            </OfferingCardDescription>

            <CapabilitiesHeader>
              {t('contribute.capabilities')}
            </CapabilitiesHeader>
            <ul>
              <li>{t('contribute.free.capabilities1')}</li>
              <li>{t('contribute.free.capabilities2')}</li>
              <li>{t('contribute.free.capabilities3')}</li>
              <li>{t('contribute.free.capabilities4')}</li>
              <li>{t('contribute.free.capabilities5')}</li>
            </ul>
            <div aria-hidden={true}>{t('contribute.free')}</div>
            {renderFreeButton()}
          </OfferingCard>

          <OfferingCard>
            <IonCardTitle>{t('contribute.tier1')}</IonCardTitle>

            <OfferingCardDescription>
              {t('contribute.tier1.description')}
            </OfferingCardDescription>

            <CapabilitiesHeader>
              {t('contribute.capabilities')}
            </CapabilitiesHeader>
            <ul>
              <li>{t('contribute.tier1.capabilities1')}</li>
              <li>{t('contribute.tier1.capabilities2')}</li>
              <li>{t('contribute.tier1.capabilities3')}</li>
              <HiddenListItem aria-hidden={true}></HiddenListItem>
              <HiddenListItem aria-hidden={true}></HiddenListItem>
            </ul>

            {renderPrice(
              subscriptionModelNameToPrice[
                viewInMonthly
                  ? SubscriptionModelName.Tier1Monthly
                  : SubscriptionModelName.Tier1Yearly
              ],
            )}
            {renderButtonForSubscription(
              viewInMonthly
                ? SubscriptionModelName.Tier1Monthly
                : SubscriptionModelName.Tier1Yearly,
            )}
          </OfferingCard>

          <OfferingCard>
            <IonCardTitle>{t('contribute.tier2')}</IonCardTitle>

            <OfferingCardDescription>
              {t('contribute.tier2.description')}
            </OfferingCardDescription>

            <CapabilitiesHeader>
              {t('contribute.capabilities')}
            </CapabilitiesHeader>
            <ul>
              <li>{t('contribute.tier2.capabilities1')}</li>
              <li>{t('contribute.tier2.capabilities2')}</li>
              <li>{t('contribute.tier2.capabilities3')}</li>
              <HiddenListItem aria-hidden={true}></HiddenListItem>
              <HiddenListItem aria-hidden={true}></HiddenListItem>
            </ul>

            {renderPrice(
              subscriptionModelNameToPrice[
                viewInMonthly
                  ? SubscriptionModelName.Tier2Monthly
                  : SubscriptionModelName.Tier2Yearly
              ],
            )}
            {renderButtonForSubscription(
              viewInMonthly
                ? SubscriptionModelName.Tier2Monthly
                : SubscriptionModelName.Tier2Yearly,
            )}
          </OfferingCard>

          <OfferingCard>
            <IonCardTitle>{t('contribute.tier3')}</IonCardTitle>

            <OfferingCardDescription>
              {t('contribute.tier3.description')}
            </OfferingCardDescription>

            <CapabilitiesHeader>
              {t('contribute.capabilities')}
            </CapabilitiesHeader>
            <ul>
              <li>{t('contribute.tier3.capabilities1')}</li>
              <li>{t('contribute.tier3.capabilities2')}</li>
              <HiddenListItem aria-hidden={true}></HiddenListItem>
              <HiddenListItem aria-hidden={true}></HiddenListItem>
              <HiddenListItem aria-hidden={true}></HiddenListItem>
            </ul>

            {renderPrice(
              subscriptionModelNameToPrice[
                viewInMonthly
                  ? SubscriptionModelName.Tier3Monthly
                  : SubscriptionModelName.Tier3Yearly
              ],
            )}
            {renderButtonForSubscription(
              viewInMonthly
                ? SubscriptionModelName.Tier3Monthly
                : SubscriptionModelName.Tier3Yearly,
            )}
          </OfferingCard>
        </OfferingContainer>
        <br />
      </IonContent>
    </IonPage>
  );
};
