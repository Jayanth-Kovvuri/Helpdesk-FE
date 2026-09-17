import { QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';

import { queryClient } from '@/app/queryClient';
import i18n from '@/i18n';
import { TicketListWidget, type TicketListWidgetProps } from '@/widgets/TicketListWidget';

export type MountTicketListOptions = TicketListWidgetProps;

const roots = new WeakMap<Element, Root>();

export function mountTicketList(element: Element, options: MountTicketListOptions = {}) {
  const root = createRoot(element);
  roots.set(element, root);
  root.render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(
        I18nextProvider,
        { i18n },
        createElement(TicketListWidget, options),
      ),
    ),
  );
}

export function unmountTicketList(element: Element) {
  roots.get(element)?.unmount();
  roots.delete(element);
}

declare global {
  interface Window {
    HelpdeskMountTicketList?: typeof mountTicketList;
    HelpdeskUnmountTicketList?: typeof unmountTicketList;
  }
}

if (typeof window !== 'undefined') {
  window.HelpdeskMountTicketList = mountTicketList;
  window.HelpdeskUnmountTicketList = unmountTicketList;
}
