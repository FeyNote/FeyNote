import { Toast as ToastPrimitive } from 'radix-ui';
import styled, { keyframes } from 'styled-components';
import { useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ToastDisplayOpts } from './ToastContext';

const hide = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const slideIn = keyframes`
  from { transform: translateX(calc(100% + var(--viewport-padding))); }
  to { transform: translateX(0); }
`;

const swipeOut = keyframes`
  from { transform: translateX(var(--radix-toast-swipe-end-x)); }
  to { transform: translateX(calc(100% + var(--viewport-padding))); }
`;

export const ToastViewport = styled(ToastPrimitive.Viewport)`
  --viewport-padding: 25px;
  position: fixed;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  padding: var(--viewport-padding);
  gap: 10px;
  width: 390px;
  max-width: 100vw;
  margin: 0;
  list-style: none;
  z-index: 2147483647;
  outline: none;
`;

const ToastRoot = styled(ToastPrimitive.Root)`
  background-color: var(--ion-background-color, #fff);
  border-radius: 6px;
  box-shadow:
    hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  padding: 15px;
  display: grid;
  grid-template-areas: 'title action' 'description action';
  grid-template-columns: auto max-content;
  column-gap: 15px;
  align-items: center;

  &[data-state='open'] {
    animation: ${slideIn} 150ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  &[data-state='closed'] {
    animation: ${hide} 100ms ease-in;
  }

  &[data-swipe='move'] {
    transform: translateX(var(--radix-toast-swipe-move-x));
  }

  &[data-swipe='cancel'] {
    transform: translateX(0);
    transition: transform 200ms ease-out;
  }

  &[data-swipe='end'] {
    animation: ${swipeOut} 100ms ease-out;
  }
`;

const ToastTitle = styled(ToastPrimitive.Title)`
  grid-area: title;
  margin-bottom: 5px;
  font-weight: 500;
  color: var(--slate-12);
  font-size: 15px;
`;

const ToastDescription = styled(ToastPrimitive.Description)`
  grid-area: description;
  margin: 0;
  color: var(--slate-11);
  font-size: 13px;
  line-height: 1.3;
`;

const ToastAction = styled(ToastPrimitive.Action)`
  grid-area: action;
`;

const Button = styled.button<{
  $size: 'small' | 'large';
  $color: 'primary' | 'success';
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 500;
  user-select: none;
  cursor: pointer;

  ${(props) =>
    props.$size === 'small' &&
    `
    font-size: 12px;
    padding: 0 10px;
    line-height: 25px;
    height: 25px;
  `}

  ${(props) =>
    props.$size === 'large' &&
    `
    font-size: 15px;
    padding: 0 15px;
    line-height: 35px;
    height: 35px;
  `}

  box-shadow: 0 2px 10px rgba(0,0,0,0.7);
  ${(props) =>
    props.$color === 'primary' &&
    `
    background-color: var(--ion-color-primary);
    color: white;

    &:hover, &:focus {
      background-color: var(--ion-color-primary-tint);
    }
  `}

  ${(props) =>
    props.$color === 'success' &&
    `
    background-color: var(--ion-color-success);
    color: white;

    &:hover, &:focus {
      background-color: var(--ion-color-success-tint);
    }
  `}
`;

export type ToastsRefValue = {
  publish: (args: ToastDisplayOpts) => void;
};

interface Props {
  ref: React.Ref<ToastsRefValue>;
}

export const Toasts: React.FC<Props> = (props) => {
  const [toasts, setToasts] = useState<ToastDisplayOpts[]>([]);
  const { t } = useTranslation();

  useImperativeHandle(props.ref, () => ({
    publish: (args) => setToasts((prev) => [...prev, args]),
  }));

  return (
    <ToastPrimitive.Provider>
      <ToastViewport>
        {toasts.map((data, index) => (
          <ToastRoot key={index}>
            {data.title && <ToastTitle>{data.title}</ToastTitle>}
            {data.body && <ToastDescription>{data.body}</ToastDescription>}
            {data.actions &&
              data.actions.map((action, idx) => (
                <ToastAction key={idx} altText="" asChild>
                  <Button
                    $size="small"
                    $color="primary"
                    onClick={() => action.onClick()}
                  >
                    {action.title}
                  </Button>
                </ToastAction>
              ))}
            {data.showClose && (
              <ToastPrimitive.Close asChild>
                <Button $size="small" $color="primary">
                  {t('generic.close')}
                </Button>
              </ToastPrimitive.Close>
            )}
          </ToastRoot>
        ))}
      </ToastViewport>
    </ToastPrimitive.Provider>
  );
};
