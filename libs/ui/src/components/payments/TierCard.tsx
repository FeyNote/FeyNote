import { IonButton } from '@ionic/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const OfferingCard = styled.div`
  box-shadow: var(--card-box-shadow);
  border-radius: var(--card-border-radius);
  padding: 16px;
  text-align: center;

  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 6;
`;

const Title = styled.h1`
  font-size: 1.25rem;
`;

const OfferingCardDescription = styled.p`
  text-align: left;
`;

const OferingCardList = styled.ul`
  text-align: left;
`;

const CapabilitiesHeader = styled.h2`
  font-size: 1rem;
  margin: 0;
`;

const Price = styled.div`
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PYOAmountSelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;

const PYOInput = styled.input<{
  $active: boolean;
}>`
  border: 2px solid
    ${(props) =>
      props.$active
        ? 'var(--ion-color-primary)'
        : 'var(--general-background-hint)'};
  border-radius: 4px;
  background: var(--general-background);
  outline: none;
  width: 70px;
  height: 36px;
  text-align: center;
`;

interface Props {
  title: string;
  description: string;
  capabilities: string[];
  action: 'current' | 'manage' | 'subscribe';
  pricing:
    | {
        mode: 'free';
      }
    | {
        mode: 'fixed';
        amount: number;
      }
    | {
        mode: 'pyo';
        minimum: number;
        suggested: number[];
      };
  onManage: () => void;
  onSubscribe: (amount: number | undefined) => void;
}

export const TierCard: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const minimum = props.pricing.mode === 'pyo' ? props.pricing.minimum : 0;
  const [enteredAmount, setEnteredAmount] = useState<number>();
  const [selectedAmount, setSelectedAmount] = useState<number>();

  const isInvalid =
    props.pricing.mode === 'pyo' &&
    ((enteredAmount && enteredAmount < props.pricing.minimum) ||
      (selectedAmount && selectedAmount < props.pricing.minimum) ||
      (!enteredAmount && !selectedAmount));

  return (
    <OfferingCard>
      <Title>{props.title}</Title>

      <OfferingCardDescription>{props.description}</OfferingCardDescription>

      <CapabilitiesHeader>{t('contribute.capabilities')}</CapabilitiesHeader>
      <OferingCardList>
        {props.capabilities.map((el) => (
          <li>{el}</li>
        ))}
      </OferingCardList>

      {props.pricing.mode === 'free' && <Price>{t('contribute.free')}</Price>}

      {props.pricing.mode === 'fixed' && (
        <Price>${props.pricing.amount.toFixed(2)}</Price>
      )}

      {props.pricing.mode === 'pyo' && props.action === 'subscribe' && (
        <PYOAmountSelector>
          {props.pricing.suggested.map((el) => (
            <IonButton
              fill={selectedAmount === el ? 'outline' : 'clear'}
              onClick={() => {
                setSelectedAmount(el);
                setEnteredAmount(undefined);
              }}
            >
              ${el}
            </IonButton>
          ))}
          <PYOInput
            $active={!!enteredAmount}
            type="number"
            min={minimum}
            placeholder="$"
            onFocus={() => {
              if (enteredAmount) return;
              setEnteredAmount(minimum);
            }}
            onChange={(event) => {
              const value = parseInt(event.target.value);
              setEnteredAmount(value || undefined);
              setSelectedAmount(undefined);
            }}
            value={enteredAmount || ''}
          />
        </PYOAmountSelector>
      )}

      {props.action === 'current' && (
        <IonButton fill="clear" onClick={props.onManage}>
          {t('contribute.activePlan')}
        </IonButton>
      )}

      {props.action === 'manage' && (
        <IonButton onClick={props.onManage}>{t('contribute.manage')}</IonButton>
      )}

      {props.action === 'subscribe' && (
        <div>
          <IonButton
            expand="block"
            disabled={isInvalid}
            onClick={() =>
              props.onSubscribe((enteredAmount || selectedAmount || 1) * 100)
            }
          >
            {t('contribute.subscribe')}
          </IonButton>
          {props.pricing.mode === 'pyo' &&
            enteredAmount &&
            enteredAmount < props.pricing.minimum && (
              <p>
                {t('contribute.minimum', {
                  minimum: props.pricing.minimum,
                })}
              </p>
            )}
        </div>
      )}
    </OfferingCard>
  );
};
